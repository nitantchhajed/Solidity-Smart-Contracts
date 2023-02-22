// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface Iblc_token is IERC20 {
    function max_supply() external returns (uint256);

    // function mint(address account, uint256 amount) external;
}
