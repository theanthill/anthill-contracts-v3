// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    ANTBNB-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../access/OperatorAccessControl.sol";
import "../interfaces/IUniswapV3StakerCustom.sol";

abstract contract IPoolStakerV3WithRewards {
    function createIncentive(uint256 rewardAmount) external virtual;

    function stakeToken(uint256 tokenId) external virtual;

    function unstakeToken(uint256 tokenId) external virtual;

    function claimReward(address to, uint256 tokenId) external virtual returns (uint256 reward);

    function exit(address to, uint256 tokenId) external virtual returns (uint256 reward);

    function getRewardInfo(uint256 tokenId) external virtual returns (uint256 reward);
}

contract PoolStakerV3WithRewards is OperatorAccessControl {
    using SafeMath for uint256;

    IUniswapV3StakerCustom poolStaker;
    IUniswapV3Pool public pool;
    IERC20Minimal public rewardToken;
    address public refundee;
    uint256 public startTime;
    uint256 public endTime;

    uint256 rewardAmount;

    mapping(uint256 => address) private owners;

    constructor(
        IUniswapV3StakerCustom poolStaker_,
        IUniswapV3Pool pool_,
        IERC20Minimal rewardToken_,
        address refundee_
    ) {
        poolStaker = poolStaker_;
        pool = pool_;
        rewardToken = rewardToken_;
        refundee = refundee_;
    }

    function createIncentive(
        uint256 rewardAmount_,
        uint256 startTime_,
        uint256 endTime_
    ) external {
        startTime = startTime_;
        endTime = endTime_;
        rewardAmount = rewardAmount_;

        IUniswapV3StakerCustom.IncentiveKey memory key = _getIncentiveKey();
        rewardToken.approve(address(poolStaker), rewardAmount);
        poolStaker.createIncentive(key, rewardAmount);
    }

    function stakeToken(uint256 tokenId) external onlyOperator {
        IUniswapV3StakerCustom.IncentiveKey memory key = _getIncentiveKey();
        poolStaker.stakeToken(key, tokenId);
    }

    function unstakeToken(uint256 tokenId) external onlyOperator {
        IUniswapV3StakerCustom.IncentiveKey memory key = _getIncentiveKey();
        poolStaker.unstakeToken(key, tokenId);
    }

    function exit(address to, uint256 tokenId) external onlyOperator returns (uint256 reward) {
        IUniswapV3StakerCustom.IncentiveKey memory key = _getIncentiveKey();
        (uint256 amountRequired, ) = poolStaker.getRewardInfo(key, tokenId);
        poolStaker.unstakeToken(key, tokenId);
        reward = poolStaker.claimReward(key.rewardToken, to, amountRequired);
        poolStaker.withdrawToken(tokenId, _msgSender(), "");
    }

    function getRewardInfo(uint256 tokenId) external view returns (uint256 reward) {
        IUniswapV3StakerCustom.IncentiveKey memory key = _getIncentiveKey();
        (reward, ) = poolStaker.getRewardInfo(key, tokenId);
    }

    function getRewardRate() external view returns (uint256) {
        return rewardAmount.mul(10**18).div(endTime - startTime);
    }

    function _getIncentiveKey() private view returns (IUniswapV3StakerCustom.IncentiveKey memory key) {
        key.rewardToken = rewardToken;
        key.pool = pool;
        key.startTime = startTime;
        key.endTime = endTime;
        key.refundee = refundee;
    }
}
