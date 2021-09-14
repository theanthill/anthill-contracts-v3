// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

/**
    Base contract for the tokens in the system

    All tokens are burnable and have an operator
 */
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

import "../access/OperatorAccessControl.sol";

/**
    Interface
 */
interface IBaseToken {
    function mint(address recipient, uint256 amount) external;

    function burnFrom(address from, uint256 amount) external;
}

/**
    Base implementation of a ERC20 burnable token with access control for an Operator
 */
contract BaseToken is ERC20Burnable, OperatorAccessControl {
    /* ========== CONSTRUCTOR ========== */
    /* solhint-disable no-empty-blocks */
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    /* solhint-disable no-empty-blocks */

    /* ========== MUTABLES ========== */
    function mint(address recipient_, uint256 amount_) external onlyOperator {
        _mint(recipient_, amount_);
    }

    function burn(uint256 amount) public override onlyOperator {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOperator {
        super.burnFrom(account, amount);
    }
}
