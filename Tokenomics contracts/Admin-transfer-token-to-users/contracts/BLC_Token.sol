// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

struct Contract {
    address contractAddress;
    uint256 amount;
}

contract BLC_Token is ERC20, Iblc_token {
    mapping(uint256 => Contract) public contracts;

    // used to contract counting
    uint256 totalContract;

    // store owner address
    address public owner;
    event TransferOwnerShip(address _oldOwner, address _newOwner);

    /// Total 1000000000 * 1e18 Token can be created
    uint256 public constant override max_supply = 1e9 * 1 ether;

    constructor() ERC20("BLUE token", "BLUE") {
        owner = msg.sender;
        _mint(owner, max_supply);
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    function addContracts(address contractAddress, uint256 amount)
        public
        onlyOwner
    {
        totalContract++;
        contracts[totalContract] = Contract(contractAddress, amount);
        transfer(contractAddress, amount);
    }

    function transferOwnerShip(address _newOwner) public onlyOwner {
        owner = _newOwner;
        transferFrom(msg.sender, _newOwner, balanceOf(msg.sender));
    }
}
