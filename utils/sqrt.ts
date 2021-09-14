import JSBI from "jsbi";
//import invariant from 'tiny-invariant'

export const MAX_SAFE_INTEGER = JSBI.BigInt(Number.MAX_SAFE_INTEGER);

export const ZERO = JSBI.BigInt(0);
export const ONE = JSBI.BigInt(1);
export const TWO = JSBI.BigInt(2);

/**
 * Computes floor(sqrt(value))
 * @param value the value for which to compute the square root, rounded down
 */
export function sqrt(value: JSBI): JSBI {
    //invariant(JSBI.greaterThanOrEqual(value, ZERO), 'NEGATIVE')

    // rely on built in sqrt if possible
    if (JSBI.lessThan(value, MAX_SAFE_INTEGER)) {
        return JSBI.BigInt(Math.floor(Math.sqrt(JSBI.toNumber(value))));
    }

    let z;
    let x;
    z = value;
    x = JSBI.add(JSBI.divide(value, TWO), ONE);
    while (JSBI.lessThan(x, z)) {
        z = x;
        x = JSBI.divide(JSBI.add(JSBI.divide(value, x), x), TWO);
    }
    return z;
}
