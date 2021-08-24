// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    ANTBNB-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

import "../interfaces/IUniswapV3Staker.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";

abstract contract IPoolStakerV3WithRewards {
    function createIncentive(uint256 rewardAmount) external virtual;

    function stakeToken(uint256 tokenId) external virtual;

    function unstakeToken(uint256 tokenId) external virtual;

    function claimReward(address to, uint256 tokenId) external virtual returns (uint256 reward);
}

contract PoolStakerV3WithRewards {
    IUniswapV3Staker poolStaker;
    IUniswapV3Pool public pool;
    IERC20Minimal public rewardToken;
    uint256 public startTime;
    uint256 public endTime;
    address public refundee;

    mapping(uint256 => address) private owners;

    constructor(
        IUniswapV3Staker poolStaker_,
        IUniswapV3Pool pool_,
        IERC20Minimal rewardToken_,
        uint256 startTime_,
        uint256 endTime_,
        address refundee_
    ) {
        poolStaker = poolStaker_;
        pool = pool_;
        rewardToken = rewardToken_;
        startTime = startTime_;
        endTime = endTime_;
        refundee = refundee_;
    }

    function createIncentive(uint256 rewardAmount) external {
        IUniswapV3Staker.IncentiveKey memory key = _getIncentiveKey();
        poolStaker.createIncentive(key, rewardAmount);
    }

    function stakeToken(uint256 tokenId) external {
        IUniswapV3Staker.IncentiveKey memory key = _getIncentiveKey();
        poolStaker.stakeToken(key, tokenId);
    }

    function unstakeToken(uint256 tokenId) external {
        IUniswapV3Staker.IncentiveKey memory key = _getIncentiveKey();
        poolStaker.unstakeToken(key, tokenId);
    }

    function claimReward(address to, uint256 tokenId) external returns (uint256 reward) {
        IUniswapV3Staker.IncentiveKey memory key = _getIncentiveKey();
        (uint256 amountRequired, ) = poolStaker.getRewardInfo(key, tokenId);
        reward = poolStaker.claimReward(key.rewardToken, to, amountRequired);
    }

    function _getIncentiveKey() private view returns (IUniswapV3Staker.IncentiveKey memory key) {
        key.rewardToken = rewardToken;
        key.pool = pool;
        key.startTime = startTime;
        key.endTime = endTime;
        key.refundee = refundee;
    }
}
