// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

/**
    Token used when in deflationary period
 */

import "../core/BaseToken.sol";

contract AntBond is BaseToken {
    /* solhint-disable no-empty-blocks */
    constructor() BaseToken("AntBond", "ANTB") {}
    /* solhint-disable no-empty-blocks */
}
