// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IRPCRegistry.sol";

/// @title  RPCProviderRegistry
/// @author cercuit-ola
/// @notice On-chain registry of decentralised RPC providers.
///
///         Providers stake ETH to register an endpoint. The stake creates a
///         credible commitment: malicious or persistently downvoted providers
///         can have their stake slashed by the contract owner (governance can
///         replace this with a DAO vote in a future version).
///
///         The React frontend reads provider data directly from this contract
///         via ethers.js, making the registry censorship-resistant and
///         independent of any off-chain database.
///
/// @dev    Inherits and fully implements {IRPCRegistry}.
///         Reentrancy is mitigated with a checks-effects-interactions pattern
///         throughout; no external calls are made before state is updated.

contract RPCProviderRegistry is IRPCRegistry {

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Minimum ETH required to register as a provider (0.01 ETH).
    uint256 public constant MIN_STAKE = 0.01 ether;

    /// @notice Contract owner — can slash providers and update MIN_STAKE.
    address public owner;

    /// @notice Auto-incrementing provider counter. Starts at 1.
    uint256 private _nextId;

    /// @notice Primary provider store: id → Provider struct.
    mapping(uint256 => Provider) private _providers;

    /// @notice Reverse index: chainId → list of provider IDs.
    mapping(uint256 => uint256[]) private _chainIndex;

    /// @notice Double-vote guard: providerId → voter → bool.
    mapping(uint256 => mapping(address => bool)) private _voted;

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "RPCRegistry: caller is not owner");
        _;
    }

    modifier onlyProviderOwner(uint256 providerId) {
        require(
            _providers[providerId].owner == msg.sender,
            "RPCRegistry: caller is not provider owner"
        );
        _;
    }

    modifier providerExists(uint256 providerId) {
        require(
            _providers[providerId].owner != address(0),
            "RPCRegistry: provider does not exist"
        );
        _;
    }

    modifier providerActive(uint256 providerId) {
        require(
            _providers[providerId].active,
            "RPCRegistry: provider is not active"
        );
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        owner   = msg.sender;
        _nextId = 1;
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /// @inheritdoc IRPCRegistry
    /// @dev Caller must send at least MIN_STAKE wei.
    function registerProvider(string calldata endpoint, uint256 chainId)
        external
        payable
        override
    {
        require(msg.value >= MIN_STAKE,   "RPCRegistry: stake below minimum");
        require(bytes(endpoint).length > 0, "RPCRegistry: empty endpoint");
        require(chainId > 0,              "RPCRegistry: invalid chainId");

        uint256 id = _nextId++;

        _providers[id] = Provider({
            owner:        msg.sender,
            endpoint:     endpoint,
            chainId:      chainId,
            stakedAmount: msg.value,
            upvotes:      0,
            downvotes:    0,
            active:       true,
            registeredAt: block.timestamp
        });

        _chainIndex[chainId].push(id);

        emit ProviderRegistered(id, msg.sender, endpoint, chainId, msg.value);
    }

    /// @inheritdoc IRPCRegistry
    function updateEndpoint(uint256 providerId, string calldata newEndpoint)
        external
        override
        providerExists(providerId)
        onlyProviderOwner(providerId)
        providerActive(providerId)
    {
        require(bytes(newEndpoint).length > 0, "RPCRegistry: empty endpoint");

        string memory old = _providers[providerId].endpoint;
        _providers[providerId].endpoint = newEndpoint;

        emit EndpointUpdated(providerId, old, newEndpoint);
    }

    /// @inheritdoc IRPCRegistry
    /// @dev Returns the full staked amount to the provider before deactivation.
    function deactivateProvider(uint256 providerId)
        external
        override
        providerExists(providerId)
        onlyProviderOwner(providerId)
        providerActive(providerId)
    {
        uint256 refund = _providers[providerId].stakedAmount;

        // Effects before interaction (CEI pattern)
        _providers[providerId].active      = false;
        _providers[providerId].stakedAmount = 0;

        emit ProviderDeactivated(providerId, msg.sender);

        // Interaction last
        (bool sent, ) = msg.sender.call{value: refund}("");
        require(sent, "RPCRegistry: ETH refund failed");
    }

    // -------------------------------------------------------------------------
    // Reputation
    // -------------------------------------------------------------------------

    /// @inheritdoc IRPCRegistry
    function vote(uint256 providerId, bool isUpvote)
        external
        override
        providerExists(providerId)
        providerActive(providerId)
    {
        require(
            !_voted[providerId][msg.sender],
            "RPCRegistry: already voted on this provider"
        );
        require(
            _providers[providerId].owner != msg.sender,
            "RPCRegistry: providers cannot vote on themselves"
        );

        _voted[providerId][msg.sender] = true;

        if (isUpvote) {
            _providers[providerId].upvotes++;
        } else {
            _providers[providerId].downvotes++;
        }

        emit VoteCast(providerId, msg.sender, isUpvote);
    }

    // -------------------------------------------------------------------------
    // Admin — Slashing
    // -------------------------------------------------------------------------

    /// @notice Slash a provider's stake and deactivate their listing.
    /// @dev    Slashed funds are sent to the contract owner.
    ///         In a future DAO-governed version, slashed funds flow to a
    ///         community treasury instead.
    /// @param providerId  Target provider to slash
    function slashProvider(uint256 providerId)
        external
        onlyOwner
        providerExists(providerId)
        providerActive(providerId)
    {
        uint256 slashed = _providers[providerId].stakedAmount;

        // Effects
        _providers[providerId].active      = false;
        _providers[providerId].stakedAmount = 0;

        emit ProviderSlashed(providerId, msg.sender, slashed);
        emit ProviderDeactivated(providerId, msg.sender);

        // Interaction
        (bool sent, ) = owner.call{value: slashed}("");
        require(sent, "RPCRegistry: slash transfer failed");
    }

    /// @notice Transfer contract ownership to a new address.
    /// @param newOwner  Address of the incoming owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RPCRegistry: zero address");
        owner = newOwner;
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /// @inheritdoc IRPCRegistry
    function getProvider(uint256 providerId)
        external
        view
        override
        providerExists(providerId)
        returns (Provider memory)
    {
        return _providers[providerId];
    }

    /// @inheritdoc IRPCRegistry
    function getProvidersByChain(uint256 chainId)
        external
        view
        override
        returns (uint256[] memory)
    {
        return _chainIndex[chainId];
    }

    /// @inheritdoc IRPCRegistry
    function totalProviders() external view override returns (uint256) {
        return _nextId - 1;
    }

    /// @inheritdoc IRPCRegistry
    function hasVoted(uint256 providerId, address voter)
        external
        view
        override
        returns (bool)
    {
        return _voted[providerId][voter];
    }

    // -------------------------------------------------------------------------
    // Fallback
    // -------------------------------------------------------------------------

    /// @dev Reject plain ETH transfers not tied to a registration.
    receive() external payable {
        revert("RPCRegistry: use registerProvider to stake");
    }
}