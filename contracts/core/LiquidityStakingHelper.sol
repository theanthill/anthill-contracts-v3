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

import "../interfaces/INonfungiblePositionManager.sol";
import "../interfaces/IUniswapV3Staker.sol";
import "../libraries/TickMath.sol";

import "./PoolStakerV3WithRewards.sol";

contract LiquidityStakingHelper is Context, IERC721Receiver {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(uint256 => address) stakesOwnership;

    IERC20 public token0;
    IERC20 public token1;
    int24 public tickLower;
    int24 public tickUpper;
    uint24 public fee;
    INonfungiblePositionManager public positionManager;
    IUniswapV3Staker public poolStaker;
    IPoolStakerV3WithRewards public stakerHelper;

    uint256 public tokenId;
    uint128 public liquidity;
    uint256 public amount0;
    uint256 public amount1;

    /* ========== CONSTRUCTOR ========== */
    constructor(
        IERC20 token0_,
        IERC20 token1_,
        int24 tickLower_,
        int24 tickUpper_,
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

        tickLower = tickLower_;
        tickUpper = tickUpper_;

        token0.approve(address(positionManager), type(uint256).max);
        token1.approve(address(positionManager), type(uint256).max);
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

        params.amount0Desired = amount0Desired;
        params.amount1Desired = amount1Desired;
        params.amount0Min = amount0Min;
        params.amount1Min = amount1Min;
        params.recipient = address(this);
        params.deadline = deadline;

        token0.safeTransferFrom(_msgSender(), address(this), amount0Desired);
        token1.safeTransferFrom(_msgSender(), address(this), amount1Desired);

        // Mint liquidity
        (tokenId, liquidity, amount0, amount1) = positionManager.mint(params);

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

    function _getMintBaseParams() private view returns (INonfungiblePositionManager.MintParams memory params) {
        params.token0 = address(token0);
        params.token1 = address(token1);
        params.fee = fee;
        params.tickLower = tickLower;
        params.tickUpper = tickUpper;
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
