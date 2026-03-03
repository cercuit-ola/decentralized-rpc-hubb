// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IRPCRegistry
/// @notice Interface for the on-chain decentralised RPC provider registry.
///         The React frontend targets this interface when reading provider
///         data via ethers.js, keeping the UI decoupled from any specific
///         contract implementation.
interface IRPCRegistry {

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    /// @notice Represents a registered RPC provider entry.
    /// @param owner          Wallet address of the provider operator
    /// @param endpoint       Public RPC URL (e.g. https://mainnet.example-rpc.com)
    /// @param chainId        EIP-155 chain ID the endpoint serves
    /// @param stakedAmount   ETH staked by the provider (in wei)
    /// @param upvotes        Cumulative community upvotes
    /// @param downvotes      Cumulative community downvotes
    /// @param active         Whether the provider is currently listed
    /// @param registeredAt   Block timestamp of initial registration
    struct Provider {
        address owner;
        string  endpoint;
        uint256 chainId;
        uint256 stakedAmount;
        uint256 upvotes;
        uint256 downvotes;
        bool    active;
        uint256 registeredAt;
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a new RPC provider registers.
    event ProviderRegistered(
        uint256 indexed providerId,
        address indexed owner,
        string  endpoint,
        uint256 chainId,
        uint256 stakedAmount
    );

    /// @notice Emitted when a provider updates their endpoint URL.
    event EndpointUpdated(
        uint256 indexed providerId,
        string  oldEndpoint,
        string  newEndpoint
    );

    /// @notice Emitted when a provider is deactivated (voluntarily or via slash).
    event ProviderDeactivated(uint256 indexed providerId, address indexed by);

    /// @notice Emitted when a community member casts a reputation vote.
    event VoteCast(
        uint256 indexed providerId,
        address indexed voter,
        bool    isUpvote
    );

    /// @notice Emitted when a provider's stake is slashed by the contract owner.
    event ProviderSlashed(
        uint256 indexed providerId,
        address indexed operator,
        uint256 slashedAmount
    );

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /// @notice Register a new RPC provider by staking ETH.
    /// @param endpoint  The public RPC URL to register
    /// @param chainId   The EIP-155 chain ID the endpoint serves
    function registerProvider(string calldata endpoint, uint256 chainId)
        external
        payable;

    /// @notice Update the RPC endpoint URL for an existing registration.
    /// @param providerId  The on-chain ID of the provider record to update
    /// @param newEndpoint The replacement endpoint URL
    function updateEndpoint(uint256 providerId, string calldata newEndpoint)
        external;

    /// @notice Voluntarily deactivate a provider and withdraw the staked ETH.
    /// @param providerId  The on-chain ID of the provider to deactivate
    function deactivateProvider(uint256 providerId) external;

    // -------------------------------------------------------------------------
    // Reputation
    // -------------------------------------------------------------------------

    /// @notice Cast a reputation vote on a registered provider.
    /// @dev    Each address may only vote once per provider.
    /// @param providerId  Target provider
    /// @param isUpvote    true = upvote, false = downvote
    function vote(uint256 providerId, bool isUpvote) external;

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /// @notice Retrieve full provider data by ID.
    function getProvider(uint256 providerId)
        external
        view
        returns (Provider memory);

    /// @notice Return all provider IDs serving a given chain.
    function getProvidersByChain(uint256 chainId)
        external
        view
        returns (uint256[] memory providerIds);

    /// @notice Return the total number of registered providers (active + inactive).
    function totalProviders() external view returns (uint256);

    /// @notice Check whether an address has already voted on a provider.
    function hasVoted(uint256 providerId, address voter)
        external
        view
        returns (bool);
}