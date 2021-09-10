// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Helper for providing liquidity to a the ANT-ETH pool
 */
import "../core/LiquidityStakingHelper.sol";

contract ETHANTPoolHelper is LiquidityStakingHelper {
    constructor(
        IERC20 token0_,
        IERC20 token1_,
        int24 tickLower_,
        int24 tickUpper_,
        uint24 fee_,
        INonfungiblePositionManagerCustom positionManager_,
        IUniswapV3StakerCustom poolStaker_,
        IPoolStakerV3WithRewards stakerHelper_
    )
        LiquidityStakingHelper(
            token0_,
            token1_,
            tickLower_,
            tickUpper_,
            fee_,
            positionManager_,
            poolStaker_,
            stakerHelper_
        )
    {}
}
