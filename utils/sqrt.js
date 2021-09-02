const JSBI = require('jsbi');
//import invariant from 'tiny-invariant'

const MAX_SAFE_INTEGER = JSBI.BigInt(Number.MAX_SAFE_INTEGER);

const ZERO = JSBI.BigInt(0);
const ONE = JSBI.BigInt(1);
const TWO = JSBI.BigInt(2);

/**
 * Computes floor(sqrt(value))
 * @param value the value for which to compute the square root, rounded down
 */
function sqrt(value) {
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

module.exports = {
    sqrt,
    MAX_SAFE_INTEGER,
};
