const {BigNumber} = require('bignumber.js');

function encodeSqrtRatioX96(amount1, amount0) {
    const shiftAmount = BigNumber(2).pow(192);
    const numerator = BigNumber(amount1).times(shiftAmount);
    const denominator = BigNumber(amount0);
    const ratioX192 = numerator.div(denominator);
    return ratioX192.sqrt();
}

function getDisplayBalance(amount) {
    const unit = BigNumber(10 ** 18);
    return amount.div(unit).toFormat(2);
}

module.exports = {
    encodeSqrtRatioX96,
    getDisplayBalance,
};
