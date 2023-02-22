// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

/*
    storing distribution token type details:
    name, cliffed month, vested months Starting date of Distribute token,
    End date of Distribute token, and each token price 
*/
struct TeamAdvisor {
    string distributionName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool distrStart;
    bool distrEnd;
}

/*
    storing distributed token amounts details:
    Total token distributed in distribution token type, unlocked amounts, and remaing or availabe amount for distribution
*/
struct TokenAmount {
    uint256 totalToken;
    uint256 unlockToken;
    uint256 remainToken;
    uint256 avgToken;
}

contract TeamAdvisors is ReentrancyGuard, Ownable {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // storing distribution token timing details
    mapping(uint256 => TeamAdvisor) public teamadvisors;

    // storing distribution token amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // storing token rate amount timing details
    mapping(uint256 => uint256) public rates;

    // unlocked month for each distribution token type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and distribution token type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    constructor(Iblc_token token_) {
        token = token_;

        // insert distribution token timing detail statically
        teamadvisors[1] = TeamAdvisor("Team", 12, 12, 0, 0, false, true);
        teamadvisors[2] = TeamAdvisor("Advisors", 12, 12, 0, 0, false, true);

        // insert token amount detail statically
        tokenamounts[1] = TokenAmount(
            12 * 1e25, // total token
            0, // unlocked token
            12 * 1e25, // remaining token
            10000000 * 1e18 // average token
        );
        tokenamounts[2] = TokenAmount(
            3 * 1e25, // total token
            0, // unlocked token
            3 * 1e25, // remaining token
            2500000 * 1e18 // average token
        );

        // insert token amount detail statically
        rates[1] = 30 * 1e12;
        rates[2] = 30 * 1e12;
    }

    // Start Distribute by its type and then start distribution token immediately when call this method
    function distrStart(uint256 teamAdviId) external onlyOwner {
        require(
            teamadvisors[teamAdviId].distrStart != true,
            "Distribution token Already Started"
        );
        teamadvisors[teamAdviId].startTime = block.timestamp;
        teamadvisors[teamAdviId].distrStart = true;
    }

    // End Distribute by its type and then end distribution token immediately when call this method
    function distrEnd(uint256 teamAdviId) external onlyOwner {
        uint256 _cliff = teamadvisors[teamAdviId].cliff;
        uint256 _vested = teamadvisors[teamAdviId].vested;
        uint256 _startTime = teamadvisors[teamAdviId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        teamadvisors[teamAdviId].endTime = block.timestamp;
        teamadvisors[teamAdviId].distrEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function buyToken(uint256 teamAdviId, uint256 amount)
        public
        payable
        nonReentrant
    {
        checkCliff(teamAdviId);

        require(
            tokenamounts[teamAdviId].unlockToken >= amount,
            "Insufficient Token!"
        );

        require(msg.value >= rates[teamAdviId] * amount, "Not enough Balance!");

        _sendToken(msg.sender, teamAdviId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 teamAdviId,
        uint256 amount
    ) private {
        tokenamounts[teamAdviId].unlockToken -= amount;
        amount = amount * 1e18;
        userTokenBal[_user][teamAdviId] += amount;
        token.safeTransfer(_user, amount);
    }

    // Check Cliff and Distribution token time is over or not
    function checkCliff(uint256 teamAdviId) private {
        uint256 _cliff = teamadvisors[teamAdviId].cliff;
        uint256 _vested = teamadvisors[teamAdviId].vested;
        uint256 _startTime = teamadvisors[teamAdviId].startTime;
        bool _distrStart = teamadvisors[teamAdviId].distrStart;
        bool _distrEnd = teamadvisors[teamAdviId].distrEnd;
        uint256 collectedMth = claimMth[teamAdviId];

        // check distribution token start or not
        require(_distrStart, "Distribute token not Start!");
        require(_distrEnd, "Distribute token is Over!");

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
            _unlockToken(teamAdviId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 teamAdviId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _avgtoken = tokenamounts[teamAdviId].avgToken;
        uint256 _unlocktoken = tokenamounts[teamAdviId].unlockToken;
        uint256 _remaintoken = tokenamounts[teamAdviId].remainToken;

        if (_monthNumber < _vested) {
            _unlocktoken += _avgtoken;
            _remaintoken -= _avgtoken;

            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected = _vested;
        }

        claimMth[teamAdviId] = _collected;
        tokenamounts[teamAdviId].unlockToken = _unlocktoken;
        tokenamounts[teamAdviId].remainToken = _remaintoken;
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
