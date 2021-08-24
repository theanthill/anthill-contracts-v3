// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Helps providing liquidity to PancakeSwap and staking the LP tokens into a staking pool all
    in one operation
 */

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3MintCallback.sol";

import "../interfaces/INonfungiblePositionManager.sol";
import "../interfaces/IUniswapV3Staker.sol";
import "../libraries/TickMath.sol";

import "./PoolStakerV3WithRewards.sol";

contract LiquidityStakingHelper is Context, IUniswapV3MintCallback, IERC721Receiver {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(uint256 => address) stakesOwnership;

    IERC20 token0;
    IERC20 token1;
    int24 tickLower;
    int24 tickUpper;
    uint24 fee;
    INonfungiblePositionManager positionManager;
    IUniswapV3Staker poolStaker;
    IPoolStakerV3WithRewards stakerHelper;

    /* ========== CONSTRUCTOR ========== */
    constructor(
        IERC20 token0_,
        IERC20 token1_,
        uint160 sqrtPriceX96Lower_,
        uint160 sqrtPriceX96Upper_,
        uint24 fee_,
        INonfungiblePositionManager positionManager_,
        IUniswapV3Staker poolStaker_,
        IPoolStakerV3WithRewards stakerHelper_
    ) {
        token0 = token0_;
        token1 = token1_;
        fee = fee_;
        positionManager = positionManager_;
        poolStaker = poolStaker_;
        stakerHelper = stakerHelper_;

        tickLower = TickMath.getTickAtSqrtRatio(sqrtPriceX96Lower_);
        tickUpper = TickMath.getTickAtSqrtRatio(sqrtPriceX96Upper_);

        token0.approve(address(this), type(uint256).max);
        token1.approve(address(this), type(uint256).max);
    }

    /* ========== MUTABLES ========== */
    function addLiquidityAndStake(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) public {
        INonfungiblePositionManager.MintParams memory params = _getMintBaseParams();

        params.tickLower = tickLower;
        params.tickUpper = tickUpper;
        params.amount0Desired = amount0Desired;
        params.amount1Desired = amount1Desired;
        params.amount0Min = amount0Min;
        params.amount1Min = amount1Min;
        params.recipient = address(this);
        params.deadline = deadline;

        // Mint liquidity
        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = positionManager.mint(params);

        require(liquidity > 0, "Received 0 liquidity from position manager");

        // Returned unused tokens
        if (amount0 != amount0Desired) {
            token0.safeTransfer(_msgSender(), amount0Desired - amount0);
        }
        if (amount1 != amount1Desired) {
            token1.safeTransfer(_msgSender(), amount1Desired - amount1);
        }

        // Send liquidity NFT to Uniswap V3 Pool Staker
        positionManager.safeTransferFrom(address(this), address(poolStaker), tokenId);

        // Transfer deposit to staker helper
        poolStaker.transferDeposit(tokenId, address(stakerHelper));
        stakerHelper.stakeToken(tokenId);
    }

    function withdrawAndRemoveLiquidity(uint256 tokenId) public {
        // Unstake current position
        stakerHelper.unstakeToken(tokenId);

        // Claim accrued rewards
        stakerHelper.claimReward(_msgSender(), tokenId);

        // Withdraw token to this contract so we can remove liquidity
        poolStaker.withdrawToken(tokenId, address(this), "");

        // Collect liquidity + fees
        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager.CollectParams({
            tokenId: tokenId,
            recipient: _msgSender(),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });
        positionManager.collect(params);

        // Burn liquidity NFT
        positionManager.burn(tokenId);
    }

    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata /*data*/
    ) external override {
        require(_msgSender() == address(positionManager), "Caller to mint callback is not intended pool");
        token0.safeTransferFrom(_msgSender(), address(positionManager), amount0Owed);
        token1.safeTransferFrom(_msgSender(), address(positionManager), amount1Owed);
    }

    function _getMintBaseParams() private view returns (INonfungiblePositionManager.MintParams memory params) {
        params.token0 = address(token0);
        params.token1 = address(token1);
        params.fee = fee;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256, /*tokenId*/
        bytes calldata /*data*/
    ) external view override returns (bytes4) {
        require(operator == address(this), "Wrong operator when receiving NFT");
        require(from == address(poolStaker), "Wrong origin when receiving NFT");
        require(msg.sender == address(poolStaker), "Wrong sender when receiving NFT");
        return this.onERC721Received.selector;
    }
}
