import JSBI from 'jsbi';
import invariant from 'tiny-invariant';
import {ZERO, MaxUint256} from './internalConstants';

const TWO: JSBI = JSBI.BigInt(2);
const POWERS_OF_2: (number | JSBI)[][] = [128, 64, 32, 16, 8, 4, 2, 1].map((pow) => [
    pow,
    JSBI.exponentiate(TWO, JSBI.BigInt(pow)),
]);

export function mostSignificantBit(x: JSBI): number {
    invariant(JSBI.greaterThan(x, ZERO), 'ZERO');
    invariant(JSBI.lessThanOrEqual(x, MaxUint256), 'MAX');

    let msb = 0;
    for (const [power, min] of POWERS_OF_2) {
        if (JSBI.greaterThanOrEqual(x, JSBI.BigInt(min))) {
            x = JSBI.signedRightShift(x, JSBI.BigInt(power));
            msb += Number(power);
        }
    }
    return msb;
}
