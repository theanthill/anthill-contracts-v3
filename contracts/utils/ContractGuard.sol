// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

contract ContractGuard {
    mapping(uint256 => mapping(address => bool)) private _status;

    function checkSameOriginReentranted() internal view returns (bool) {
        // resolution: 1 / 2**112
        /* solhint-disable-next-line avoid-tx-origin */
        return _status[block.number][tx.origin];
    }

    function checkSameSenderReentranted() internal view returns (bool) {
        return _status[block.number][msg.sender];
    }

    modifier onlyOneBlock() {
        require(!checkSameOriginReentranted(), "ContractGuard: one block, one function");
        require(!checkSameSenderReentranted(), "ContractGuard: one block, one function");

        _;

        /* solhint-disable-next-line avoid-tx-origin */
        _status[block.number][tx.origin] = true;
        _status[block.number][msg.sender] = true;
    }
}
