// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

/**
    ANTETH-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

import "../core/PoolStakerV3WithRewards.sol";

contract ETHANTPoolStakerANT is PoolStakerV3WithRewards {
    /* solhint-disable no-empty-blocks */
    constructor(
        IUniswapV3Staker poolStaker_,
        IUniswapV3Pool pool_,
        IERC20Minimal rewardToken_,
        address refundee_
    ) PoolStakerV3WithRewards(poolStaker_, pool_, rewardToken_, refundee_) {}
    /* solhint-disable no-empty-blocks */
}
