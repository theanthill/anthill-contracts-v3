const {BigNumber} = require('bignumber.js');
const JSBI = require('jsbi');
const {sqrt} = require('./sqrt');
const {MIN_TICK, MAX_TICK} = require('./TickMath');

/**
 * The default factory tick spacings by fee amount.
 */
const TICK_SPACINGS = {
    [500]: 10,
    [3000]: 60,
    [10000]: 200,
};

/**
 * Returns the sqrt ratio as a Q64.96 corresponding to a given ratio of amount1 and amount0
 * @param amount1 The numerator amount i.e., the amount of token1
 * @param amount0 The denominator amount i.e., the amount of token0
 * @returns The sqrt ratio
 */
/*function encodeSqrtRatioX96(amount1, amount0) {
    const shiftAmount = BigNumber(2).pow(192);
    const numerator = BigNumber(amount1).times(shiftAmount);
    const denominator = BigNumber(amount0);
    const ratioX192 = numerator.div(denominator);
    return ratioX192.sqrt();
}*/
/**
 * Returns the sqrt ratio as a Q64.96 corresponding to a given ratio of amount1 and amount0
 * @param amount1 The numerator amount i.e., the amount of token1
 * @param amount0 The denominator amount i.e., the amount of token0
 * @returns The sqrt ratio
 */

function encodeSqrtRatioX96(amount1, amount0) {
    const numerator = JSBI.leftShift(JSBI.BigInt(amount1), JSBI.BigInt(192));
    const denominator = JSBI.BigInt(amount0);
    const ratioX192 = JSBI.divide(numerator, denominator);
    return sqrt(ratioX192);
}

/**
 * Returns the closest tick that is nearest a given tick and usable for the given tick spacing
 * @param tick the target tick
 * @param tickSpacing the spacing of the pool
 */
function nearestUsableTick(tick, tickSpacing) {
    //invariant(Number.isInteger(tick) && Number.isInteger(tickSpacing), 'INTEGERS');
    //invariant(tickSpacing > 0, 'TICK_SPACING');
    //invariant(tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK, 'TICK_BOUND');
    const rounded = Math.round(tick / tickSpacing) * tickSpacing;
    if (rounded < MIN_TICK) return rounded + tickSpacing;
    else if (rounded > MAX_TICK) return rounded - tickSpacing;
    else return rounded;
}

/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
// export function tickToPrice(baseToken: Token, quoteToken: Token, tick: number): Price<Token, Token> {
//     const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);

//     const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96);

//     return baseToken.sortsBefore(quoteToken)
//         ? new Price(baseToken, quoteToken, Q192, ratioX192)
//         : new Price(baseToken, quoteToken, ratioX192, Q192);
// }

/**
 * Returns the first tick for which the given price is greater than or equal to the tick price
 * @param price for which to return the closest tick that represents a price less than or equal to the input price,
 * i.e. the price of the returned tick is less than or equal to the input price
 */
// export function priceToClosestTick(price: Price<Token, Token>): number {
//     const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency);

//     const sqrtRatioX96 = sorted
//         ? encodeSqrtRatioX96(price.numerator, price.denominator)
//         : encodeSqrtRatioX96(price.denominator, price.numerator);

//     let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96);
//     const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, tick + 1);
//     if (sorted) {
//         if (!price.lessThan(nextTickPrice)) {
//             tick++;
//         }
//     } else {
//         if (!price.greaterThan(nextTickPrice)) {
//             tick++;
//         }
//     }
//     return tick;
// }

function getDisplayBalance(amount) {
    const unit = BigNumber(10 ** 18);
    return amount.div(unit).toFormat(2);
}

module.exports = {
    encodeSqrtRatioX96,
    getDisplayBalance,
    TICK_SPACINGS,
    nearestUsableTick,
};
