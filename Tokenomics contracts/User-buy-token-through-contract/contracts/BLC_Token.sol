// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

struct Contract {
    address contractAddress;
    uint256 amount;
}

contract BLC_Token is Ownable, ERC20, Iblc_token {
    mapping(uint256 => Contract) public contracts;
    uint256 totalContract;

    /// Total 1000000000 Token can be created
    uint256 public constant override max_supply = 1e9 * 1 ether;

    constructor() ERC20("BLUE token", "BLUE") {
        _mint(msg.sender, max_supply);
    }

    function addContracts(address contractAddress, uint256 amount)
        public
        onlyOwner
    {
        totalContract++;
        contracts[totalContract] = Contract(contractAddress, amount);
        transfer(contractAddress, amount);
    }
}
