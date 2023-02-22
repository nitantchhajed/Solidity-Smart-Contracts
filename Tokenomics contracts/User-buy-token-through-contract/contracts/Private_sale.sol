// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

/*
    storing sale type details:
    name, cliffed month, vested months Starting date of sale,
    End date of sale, and each token price 
*/
struct SaleType {
    string saleName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool saleStart;
    bool saleEnd;
}

/*
    storing sale distributed amounts details:
    Total token distributed in sale type, unlocked amounts, and remaing or availabe amount for sale
*/
struct TokenAmount {
    uint256 totalToken;
    uint256 unlockToken;
    uint256 remainToken;
    uint256 avgToken;
}

contract Private_sale is ReentrancyGuard, Ownable {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // storing sale timing details
    mapping(uint256 => SaleType) public saletypes;

    // storing sale amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // storing token rate amount timing details
    mapping(uint256 => uint256) public rates;

    // unlocked month for each sale type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and sale type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    constructor(Iblc_token token_) {
        token = token_;

        // insert sale timing detail statically
        saletypes[1] = SaleType("Private Sale 1", 12, 6, 0, 0, false, true);
        saletypes[2] = SaleType("Private Sale 2", 9, 6, 0, 0, false, true);
        saletypes[3] = SaleType("Launchpad IDO", 0, 0, 0, 0, false, true);

        // insert token amount detail statically
        tokenamounts[1] = TokenAmount(
            2 * 1e25, // total token
            0, // unlocked token
            2 * 1e25, // remaining token
            3333333 * 1e18 // average token
        );
        tokenamounts[2] = TokenAmount(
            3 * 1e25, // total token
            0, // unlocked token
            3 * 1e25, // remaining token
            5000000 * 1e18 // average token
        );
        tokenamounts[3] = TokenAmount(
            5 * 1e25, // total token
            0, // unlocked token
            5 * 1e25, // remaining token
            50000000 * 1e18 // average token
        );

        // insert token amount detail statically
        rates[1] = 15 * 1e12;
        rates[2] = 20 * 1e12;
        rates[3] = 30 * 1e12;
    }

    // Start Sale by its type and then start sale immediately when call this method
    function saleStart(uint256 saleId) external onlyOwner {
        require(saletypes[saleId].saleStart != true, "Sale Already Started");
        saletypes[saleId].startTime = block.timestamp;
        saletypes[saleId].saleStart = true;
    }

    // End Sale by its type and then end sale immediately when call this method
    function saleEnd(uint256 saleId) external onlyOwner {
        uint256 _cliff = saletypes[saleId].cliff;
        uint256 _vested = saletypes[saleId].vested;
        uint256 _startTime = saletypes[saleId].startTime;

        // check cliff and vested month of the sale is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        saletypes[saleId].endTime = block.timestamp;
        saletypes[saleId].saleEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function buyToken(uint256 saleId, uint256 amount)
        public
        payable
        nonReentrant
    {
        checkCliff(saleId);

        require(
            tokenamounts[saleId].unlockToken >= amount,
            "Insufficient Token!"
        );

        require(msg.value >= rates[saleId] * amount, "Not enough Balance!");

        _sendToken(msg.sender, saleId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 _saleId,
        uint256 amount
    ) private {
        tokenamounts[_saleId].unlockToken -= amount;
        amount = amount * 1e18;
        userTokenBal[_user][_saleId] += amount;
        token.safeTransfer(_user, amount);
    }

    // Check Cliff and Sale is over or not
    function checkCliff(uint256 saleId) private {
        uint256 _cliff = saletypes[saleId].cliff;
        uint256 _vested = saletypes[saleId].vested;
        uint256 _startTime = saletypes[saleId].startTime;
        bool _saleStart = saletypes[saleId].saleStart;
        bool _saleEnd = saletypes[saleId].saleEnd;
        uint256 collectedMth = claimMth[saleId];

        // check sale start or not
        require(_saleStart, "Sale not Start!");
        require(_saleEnd, "Sale is Over!");

        // check cliff is comeplete or not
        uint256 completeCliff = _startTime + (_cliff * 30 days);
        require(block.timestamp > completeCliff, "Cliff is not Over!");

        // get month diffrence
        uint256 _secondsDifference = block.timestamp - completeCliff;
        uint256 _monthNumber = _secondsDifference / 2592000;
        if (
            (_monthNumber >= collectedMth && collectedMth < _vested) ||
            _vested == 0
        ) {
            // calling calculate method on each month only and unlock some token
            _unlockToken(saleId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 _saleId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _avgtoken = tokenamounts[_saleId].avgToken;
        uint256 _unlocktoken = tokenamounts[_saleId].unlockToken;
        uint256 _remaintoken = tokenamounts[_saleId].remainToken;

        if (_monthNumber < _vested) {
            _unlocktoken += _avgtoken;
            _remaintoken -= _avgtoken;

            // check amount not divided completely and and at the last month of cliff
            if (_monthNumber >= 5) {
                _unlocktoken += _remaintoken;
                _remaintoken = 0;
            }
            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected = _vested;
        }

        claimMth[_saleId] = _collected;
        tokenamounts[_saleId].unlockToken = _unlocktoken;
        tokenamounts[_saleId].remainToken = _remaintoken;
    }

    // check contract current balance
    function contractBal() external view returns (uint256) {
        return address(this).balance;
    }

    // transfer contract balance to owner wallet
    function withdrawal() external onlyOwner {
        payable(address(0)).transfer(address(this).balance);
    }
}
