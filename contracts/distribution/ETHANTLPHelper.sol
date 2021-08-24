// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Helper for providing liquidity to a the ANT-ETH pool
 */
import "../core/LiquidityStakingHelper.sol";

contract ETHANTLPHelper is LiquidityStakingHelper {
    constructor(
        IERC20 token0_,
        IERC20 token1_,
        uint160 sqrtPriceX96Lower_,
        uint160 sqrtPriceX96Upper_,
        uint24 fee_,
        INonfungiblePositionManager positionManager_,
        IUniswapV3Staker poolStaker_,
        IPoolStakerV3WithRewards stakerHelper_
    )
        LiquidityStakingHelper(
            token0_,
            token1_,
            sqrtPriceX96Lower_,
            sqrtPriceX96Upper_,
            fee_,
            positionManager_,
            poolStaker_,
            stakerHelper_
        )
    {}
}
