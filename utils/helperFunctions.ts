import { BigNumber } from "ethers";
import JSBI from "jsbi";
import { sqrt } from "./sqrt";
import { TickMath } from "./TickMath";

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [key: number]: number } = {
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

export function encodeSqrtRatioX96(amount1: number | string | JSBI, amount0: number | string | JSBI): JSBI {
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
export function nearestUsableTick(tick: number, tickSpacing: number): number {
    //invariant(Number.isInteger(tick) && Number.isInteger(tickSpacing), 'INTEGERS');
    //invariant(tickSpacing > 0, 'TICK_SPACING');
    //invariant(tick >= TickMath.MIN_TICK && tick <= TickMath.MAX_TICK, 'TICK_BOUND');
    const rounded = Math.round(tick / tickSpacing) * tickSpacing;
    if (rounded < TickMath.MIN_TICK) return rounded + tickSpacing;
    else if (rounded > TickMath.MAX_TICK) return rounded - tickSpacing;
    else return rounded;
}

export function getDisplayBalance(amount: BigNumber, decimals: number = 3): string {
    const unit = BigNumber.from(10).pow(18);
    const decimalsConversion = BigNumber.from(decimals).pow(10);
    const convertedAmount = Number(amount.mul(decimalsConversion).div(unit).toString());
    return (convertedAmount / decimals ** 10).toString();
}
