// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
    Contract to provide with token funds to the caller
 */
contract TokenFaucet is Context {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token0;
    IERC20 public token1;
    IERC20 public token2;
    uint256 public maxAmount0;
    uint256 public maxAmount1;
    uint256 public maxAmount2;
    mapping(address => bool) public admins;

    constructor(
        IERC20 _token0,
        IERC20 _token1,
        IERC20 _token2,
        uint256 _maxAmount0,
        uint256 _maxAmount1,
        uint256 _maxAmount2,
        address[] memory _admins
    ) {
        token0 = _token0;
        token1 = _token1;
        token2 = _token2;
        maxAmount0 = _maxAmount0;
        maxAmount1 = _maxAmount1;
        maxAmount2 = _maxAmount2;

        for (uint256 i = 0; i < _admins.length; ++i) {
            admins[_admins[i]] = true;
        }
    }

    function refill() public {
        uint256 multiplier = 1;

        if (admins[_msgSender()]) {
            multiplier = 20;
        }

        uint256 currentAmount = token0.balanceOf(_msgSender());
        uint256 refillAmount0 = maxAmount0 * multiplier;
        if (currentAmount < refillAmount0) {
            token0.safeTransfer(_msgSender(), refillAmount0.sub(currentAmount));
        }

        currentAmount = token1.balanceOf(_msgSender());
        uint256 refillAmount1 = maxAmount1 * multiplier;
        if (currentAmount < refillAmount1) {
            token1.safeTransfer(_msgSender(), refillAmount1.sub(currentAmount));
        }

        currentAmount = token2.balanceOf(_msgSender());
        uint256 refillAmount2 = maxAmount2 * multiplier;
        if (currentAmount < refillAmount2) {
            token2.safeTransfer(_msgSender(), refillAmount2.sub(currentAmount));
        }
    }
}
