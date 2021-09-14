// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "../core/BaseToken.sol";

contract MockBNB is BaseToken {
    /* solhint-disable-next-line no-empty-blocks */
    constructor() BaseToken("BNB", "BNB") {}
}
