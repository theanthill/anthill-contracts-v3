// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

/**
    Helps providing liquidity to PancakeSwap and staking the LP tokens into a staking pool all
    in one operation
 */

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-staker/contracts/interfaces/IUniswapV3Staker.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";

import "../core/ERC721Enumerable.sol";

import "./PoolStakerV3WithRewards.sol";

contract LiquidityStakingHelper is Context, ERC721Enumerable, IERC721Receiver {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token0;
    IERC20 public token1;
    int24 public tickLower;
    int24 public tickUpper;
    uint24 public fee;
    INonfungiblePositionManager public positionManager;
    IUniswapV3Staker public poolStaker;
    IPoolStakerV3WithRewards public stakerHelper;
    mapping(uint256 => uint256) public tokenIdIndex; /* tokenId => stakes index */
    uint256[] public stakes; /* tokenId */

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
        (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = positionManager.mint(params);

        // Record stakes ownership
        _addTokenToOwnerEnumeration(_msgSender(), tokenId);
        _addTokenToGlobalList(tokenId);

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

    function withdrawAndRemoveLiquidity(uint256 tokenId, uint256 deadline) public {
        require(_isOwner(_msgSender(), tokenId), "Spender is not owner of ERC721 token");

        _removeTokenFromOwnerEnumeration(_msgSender(), tokenId);
        _removeTokenFromGlobalList(tokenId);

        // Unstake and claim rewards
        stakerHelper.exit(_msgSender(), tokenId);

        // Remove liquidity
        _removeLiquidity(tokenId, deadline);

        // Burn liquidity NFT
        positionManager.burn(tokenId);
    }

    function getTotalStakedLiquidity() external view returns (uint256) {
        uint256 liquidity = 0;
        for (uint256 i = 0; i < stakes.length; ++i) {
            liquidity = liquidity.add(_getLiquidity(stakes[i]));
        }
        return liquidity;
    }

    function _getMintBaseParams() private view returns (INonfungiblePositionManager.MintParams memory params) {
        params.token0 = address(token0);
        params.token1 = address(token1);
        params.fee = fee;
        params.tickLower = tickLower;
        params.tickUpper = tickUpper;
    }

    function onERC721Received(
        address, /*operator*/
        address, /*from*/
        uint256, /*tokenId*/
        bytes calldata /*data*/
    ) external pure override returns (bytes4) {
        // TODO
        //require(operator == address(this) || operator == address(poolStaker), "Wrong operator when receiving NFT");
        //require(from == address(poolStaker), "Wrong origin when receiving NFT");
        //require(msg.sender == address(poolStaker), "Wrong sender when receiving NFT");
        return this.onERC721Received.selector;
    }

    function _getLiquidity(uint256 tokenId) internal view returns (uint128 liquidity) {
        (, , , , , , , liquidity, , , , ) = positionManager.positions(tokenId);
    }

    function _removeLiquidity(uint256 tokenId, uint256 deadline) internal {
        // Fetch liquidity
        uint128 liquidity = _getLiquidity(tokenId);

        // Decrease liquidity to 0

        INonfungiblePositionManager.DecreaseLiquidityParams memory decreaseParams = INonfungiblePositionManager
        .DecreaseLiquidityParams({
            tokenId: tokenId,
            liquidity: liquidity,
            amount0Min: 0,
            amount1Min: 0,
            deadline: deadline
        });
        positionManager.decreaseLiquidity(decreaseParams);

        // Collect liquidity + fees
        INonfungiblePositionManager.CollectParams memory collectParams = INonfungiblePositionManager.CollectParams({
            tokenId: tokenId,
            recipient: _msgSender(),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });
        positionManager.collect(collectParams);
    }

    function _addTokenToGlobalList(uint256 tokenId) internal {
        tokenIdIndex[tokenId] = stakes.length;
        stakes.push(tokenId);
    }

    function _removeTokenFromGlobalList(uint256 tokenId) internal {
        uint256 tokenIndex = tokenIdIndex[tokenId];
        if (tokenIndex < stakes.length - 1) {
            uint256 lastTokenId = stakes[stakes.length - 1];
            stakes[tokenIndex] = lastTokenId;
            tokenIdIndex[lastTokenId] = tokenIndex;
        }
        stakes.pop();
    }
}
