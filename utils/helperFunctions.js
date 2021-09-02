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
