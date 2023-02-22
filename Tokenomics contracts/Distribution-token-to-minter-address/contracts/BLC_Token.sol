// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

contract BLC_Token is AccessControl, ERC20, Iblc_token {
    /// @dev The identifier of the role which maintains other roles.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    /// @dev The identifier of the role which allows only contract minters can mint tokens.
    bytes32 public constant CONTRACT = keccak256("MINTER");

    /// Storing Tokenomics Contract Address
    address public contracts;

    /// Total 1000000000 Token can be created
    uint256 public constant override max_supply = 1e9 * 1 ether;

    constructor(address dao) ERC20("BLUE token", "BLUE") {
        _setupRole(ADMIN_ROLE, dao);
        _setupRole(ADMIN_ROLE, msg.sender); // This will be surrendered after deployment
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "ONLY_ADMIN");
        _;
    }

    modifier onlyContract() {
        require(hasRole(CONTRACT, msg.sender), "ACCESS_DENIED");
        _;
    }

    // Minting Token Only Assign Contract Minters
    function mint(address account, uint256 amount)
        external
        override
        onlyContract
    {
        require(totalSupply() + amount <= max_supply, "SUPPLY_OVERFLOW");
        _mint(account, amount);
    }

    // Update or Add New Contract
    function updateContract(address _contractAddress)
        external
        override
        onlyAdmin
    {
        contracts = _contractAddress;
        _setupRole(CONTRACT, _contractAddress);
    }
}