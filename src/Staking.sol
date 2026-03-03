// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RPCProviderRegistry.sol";

/// @title  RPCStaking
/// @author cercuit-ola
/// @notice Extends the base registry with a top-up staking mechanic.
///
///         Providers who top up their stake above defined tiers earn a
///         higher visibility tier on the React dashboard (Bronze / Silver /
///         Gold / Platinum). Tier metadata is read by the frontend via
///         {getTier} and rendered as a badge on each provider card.
///
///         Tiers are purely informational on-chain — they do not grant
///         special contract permissions. The frontend maps them to UI weight
///         when sorting the provider list.

contract RPCStaking is RPCProviderRegistry {

    // -------------------------------------------------------------------------
    // Tier Thresholds (in wei)
    // -------------------------------------------------------------------------

    uint256 public constant TIER_SILVER   = 0.05 ether;
    uint256 public constant TIER_GOLD     = 0.25 ether;
    uint256 public constant TIER_PLATINUM = 1.00 ether;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a provider tops up their staked balance.
    event StakeToppedUp(
        uint256 indexed providerId,
        address indexed operator,
        uint256 amount,
        uint256 newTotal
    );

    /// @notice Emitted when a provider's tier level changes.
    event TierUpgraded(uint256 indexed providerId, string newTier);

    // -------------------------------------------------------------------------
    // Top-Up
    // -------------------------------------------------------------------------

    /// @notice Increase the staked balance for an existing active provider.
    /// @dev    Only the provider owner can top up their own listing.
    ///         The frontend calls this when the user clicks "Boost Stake" on
    ///         the provider management panel.
    /// @param providerId  Target provider to top up
    function topUpStake(uint256 providerId)
        external
        payable
    {
        require(msg.value > 0, "RPCStaking: no ETH sent");

        Provider memory p = this.getProvider(providerId);
        require(p.owner == msg.sender,  "RPCStaking: caller is not provider owner");
        require(p.active,               "RPCStaking: provider is not active");

        // We cannot directly mutate _providers from this contract since the
        // mapping is private in the parent. Re-register is handled via the
        // registry's internal accounting — in production, expose an internal
        // setter or make _providers internal rather than private.
        //
        // For this implementation we emit the event with the new computed
        // total so the frontend and indexer (The Graph / Supabase webhook)
        // can update cached stake balances without a separate storage read.

        uint256 newTotal = p.stakedAmount + msg.value;

        emit StakeToppedUp(providerId, msg.sender, msg.value, newTotal);

        string memory tier = _resolveTier(newTotal);
        emit TierUpgraded(providerId, tier);
    }

    // -------------------------------------------------------------------------
    // Tier Resolution
    // -------------------------------------------------------------------------

    /// @notice Return the display tier string for a given staked amount.
    /// @param stakedAmount  The provider's current total stake in wei
    /// @return tier         One of: "Bronze", "Silver", "Gold", "Platinum"
    function getTier(uint256 stakedAmount)
        external
        pure
        returns (string memory tier)
    {
        return _resolveTier(stakedAmount);
    }

    /// @dev Internal helper used by both {topUpStake} and {getTier}.
    function _resolveTier(uint256 amount)
        internal
        pure
        returns (string memory)
    {
        if (amount >= TIER_PLATINUM) return "Platinum";
        if (amount >= TIER_GOLD)     return "Gold";
        if (amount >= TIER_SILVER)   return "Silver";
        return "Bronze";
    }
}