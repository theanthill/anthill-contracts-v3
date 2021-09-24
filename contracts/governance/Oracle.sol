// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

/**
    Oracle to consult the current price of the token
*/
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";

//import "../libraries/PancakeOracleLibrary.sol";
import "../libraries/FixedPoint.sol";

import "../interfaces/IPancakePair.sol";
import "../interfaces/IStdReference.sol";

import "../utils/EpochCounter.sol";

/** 
    Interface
 */
interface IOracle {
    function update() external;

    function priceTWAP(address token) external view returns (uint256);

    function priceDollar() external view returns (uint256);

    function priceVariationPercentage(address token) external view returns (uint256);

    function consult(address token, uint256 amountIn) external view returns (uint256);
}

/**
    Fixed window oracle that recomputes the average price for the entire period once every period
    note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
 */
contract Oracle is IOracle, EpochCounter {
    /* ========== STATE ======== */
    using SafeMath for uint256;
    using SafeMath for uint160;
    using FixedPoint for *;

    // Constants
    string public constant EXTERNAL_ORACLE_BASE = "USDC";
    string public constant EXTERNAL_ORACLE_QUOTE = "USDT";

    // Immutables
    IUniswapV3Pool public immutable pool;
    address public immutable token0;
    address public immutable token1;
    IStdReference public immutable bandOracle;

    // TWAP for an epoch period
    uint160 public averageSqrtPriceX96;

    constructor(
        IUniswapV3Pool _pool,
        uint256 _period,
        uint256 _startTime,
        IStdReference _bandOracle
    ) EpochCounter(_period, _startTime, 0) {
        pool = _pool;

        token0 = _pool.token0();
        token1 = _pool.token1();

        bandOracle = _bandOracle;

        (averageSqrtPriceX96, , , , , , ) = _pool.slot0();
    }

    /** 
        Update the price from Uniswap

        @dev Updates 1-day EMA price from Uniswap
    */
    /* solhint-disable no-empty-blocks */
    function update() external override checkEpoch {
        // Obtain the TWAP for the latest block

        (uint160 sqrtPriceX96, , uint16 observationIndex, uint16 observationCardinality, , , ) = pool.slot0();

        uint16 oldestObservationIndex = (observationIndex + observationCardinality - 1) % observationCardinality;
        (uint32 currentBlockTimestamp, int56 currentTickCumulative, , ) = pool.observations(observationIndex);
        (uint32 oldestBlockTimestamp, int56 oldestTickCumulative, , bool oldestInitialized) = pool.observations(
            oldestObservationIndex
        );

        if (oldestInitialized && oldestBlockTimestamp != 0 && oldestBlockTimestamp != currentBlockTimestamp) {
            int24 priceTick = int24(
                (currentTickCumulative - oldestTickCumulative) / (currentBlockTimestamp - oldestBlockTimestamp)
            );
            averageSqrtPriceX96 = TickMath.getSqrtRatioAtTick(priceTick);
        } else {
            // We only have 1 current observation
            averageSqrtPriceX96 = sqrtPriceX96;
        }

        emit Updated(averageSqrtPriceX96);
    }

    /* solhint-disable no-empty-blocks */

    /**
        Returns the latest updated average price for the given token

        @param token   Address of the token to get the average price for

        @return price  Average price of the token multiplied by 1e18
    */
    function priceTWAP(address token) public view override returns (uint256 price) {
        price = consult(token, 1e18);
    }

    /**
        Returns the latest known price from the external oracle for the USDC/USDT pair

        @return price  Latest external price of the token multiplied by 1e18
    */
    function priceDollar() public view override returns (uint256 price) {
        price = bandOracle.getReferenceData(EXTERNAL_ORACLE_BASE, EXTERNAL_ORACLE_QUOTE).rate;
    }

    /**
        Calculates the percentage of the price variation between the internal liquidity price
        and the external Oracle price

        @param token   Address of the token to get price variation for

        @return percentage  Price variation percentage multiplied by 1e18
    */
    function priceVariationPercentage(address token) external view override returns (uint256 percentage) {
        percentage = priceTWAP(token).mul(1e18).div(priceDollar()).sub(1e18);
    }

    function consult(address token, uint256 amountIn) public view override returns (uint256 amountOut) {
        uint256 shiftAmount = FixedPoint96.Q96.mul(FixedPoint96.Q96);
        uint256 priceSquare = averageSqrtPriceX96.mul(averageSqrtPriceX96).mul(1e18);

        uint256 price0 = priceSquare.div(shiftAmount);

        if (token == token0) {
            amountOut = amountIn.mul(price0).div(1e18);
        } else {
            require(token == token1, "ExampleOracleSimple: INVALID_TOKEN");
            uint256 price1 = uint256(1e36).div(price0);
            amountOut = amountIn.mul(price1).div(1e18);
        }
    }

    /* ======= EVENTS ====== */
    event Updated(uint160 averageSqrtPriceX96);
}
