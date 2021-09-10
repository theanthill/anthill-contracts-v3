// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    ANTETH-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

import "../core/PoolStakerV3WithRewards.sol";

contract BUSDANTPoolStakerANT is PoolStakerV3WithRewards {
    constructor(
        IUniswapV3StakerCustom poolStaker_,
        IUniswapV3Pool pool_,
        IERC20Minimal rewardToken_,
        address refundee_
    ) PoolStakerV3WithRewards(poolStaker_, pool_, rewardToken_, refundee_) {}
}
