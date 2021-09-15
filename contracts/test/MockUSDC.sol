// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "../core/BaseToken.sol";

contract MockUSDC is BaseToken {
    /* solhint-disable-next-line no-empty-blocks */
    constructor() BaseToken("USDC", "USDC") {}
}
