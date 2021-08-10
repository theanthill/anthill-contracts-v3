// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    ANTETH-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

import "../core/StakingPoolWithRewardsDelegated.sol";

contract ETHANTLPTokenANTPool is StakingPoolWithRewardsDelegated {
    constructor(
        IERC20 antToken_,
        IERC20 lpToken_,
        uint256 startTime_
    ) StakingPoolWithRewardsDelegated(antToken_, lpToken_, startTime_) {}
}
