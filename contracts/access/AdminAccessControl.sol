// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

/**
    Admin access to certain functions of a contract
 */

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
    Interface
 */
interface IAdminAccessControl {
    function isAdmin(address account) external view returns (bool);

    function transferAdmin(address newAdmin) external;
}

/**
    Helper to provide some utils for contracts using an admin role,
    like TimelockController
 */
abstract contract AdminAccessControlHelper is AccessControl {
    bytes32 public immutable adminAccessRole;

    address private _admin;

    constructor(bytes32 adminRoleID, address adminAddress) {
        adminAccessRole = adminRoleID;

        _admin = adminAddress;
    }

    // ==== MODIFIERS ====
    modifier onlyAdmin() {
        require(hasRole(adminAccessRole, _msgSender()), "AdminAccessControlHelper: sender requires permission");
        _;
    }

    // ==== VIEWS ====
    function isAdmin(address account) external view returns (bool) {
        return hasRole(adminAccessRole, account);
    }

    // ==== MUTABLES ====
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "AdminAccessControlHelper: zero address given for new operator");

        grantRole(adminAccessRole, newAdmin);
        revokeRole(adminAccessRole, _admin);

        _admin = newAdmin;
    }
}

/**
    Access control contract with pre-defined admin role
 */
abstract contract AdminAccessControl is AdminAccessControlHelper {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor() AdminAccessControlHelper(ADMIN_ROLE, _msgSender()) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        _setupRole(ADMIN_ROLE, _msgSender());
    }
}
