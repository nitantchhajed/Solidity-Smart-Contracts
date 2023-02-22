// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

/*
    storing token reward type details:
    name, cliffed month, vested months Starting date of Reward token,
    End date of Reward token, and each token price 
*/
struct Reward {
    string rewardName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool rewardStart;
    bool rewardEnd;
}

/*
    storing reward token amounts details:
    Total token rewarded in token reward type, unlocked amounts, and remaing or availabe amount for rewards
*/
struct TokenAmount {
    uint256 totalToken;
    uint256 unlockToken;
    uint256 remainToken;
    uint256 avgToken;
}

contract Rewards is ReentrancyGuard, Ownable {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // storing token reward timing details
    mapping(uint256 => Reward) public rewards;

    // storing token reward amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // storing token rate amount timing details
    mapping(uint256 => uint256) public rates;

    // unlocked month for each token reward type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and token reward type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    constructor(Iblc_token token_) {
        token = token_;

        // insert reward token timing detail statically
        rewards[1] = Reward("Staking rewards", 0, 60, 0, 0, false, true);
        rewards[2] = Reward("Wallet airdrop rewards", 0, 0, 0, 0, false, true);
        rewards[3] = Reward(
            "Marketplace airdrop rewards",
            0,
            0,
            0,
            0,
            false,
            true
        );

        // insert token rewards amount detail statically
        tokenamounts[1] = TokenAmount(
            24 * 1e25, // total token
            0, // unlocked token
            24 * 1e25, // remaining token
            4000000 * 1e18 // average token
        );
        tokenamounts[2] = TokenAmount(
            3 * 1e25, // total token
            0, // unlocked token
            3 * 1e25, // remaining token
            30000000 * 1e18 // average token
        );

        tokenamounts[3] = TokenAmount(
            3 * 1e25, // total token
            0, // unlocked token
            3 * 1e25, // remaining token
            30000000 * 1e18 // average token
        );

        // insert token amount detail statically
        rates[1] = 30 * 1e12;
        rates[2] = 30 * 1e12;
        rates[3] = 30 * 1e12;
    }

    // Start Reward by its type and then start distribution token immediately then call this method
    function rewardStart(uint256 rewardId) external onlyOwner {
        require(
            rewards[rewardId].rewardStart != true,
            "Reward token Already Started"
        );
        rewards[rewardId].startTime = block.timestamp;
        rewards[rewardId].rewardStart = true;
    }

    // End Rewards by its type and then end token distribution immediately then call this method
    function rewardEnd(uint256 rewardId) external onlyOwner {
        uint256 _cliff = rewards[rewardId].cliff;
        uint256 _vested = rewards[rewardId].vested;
        uint256 _startTime = rewards[rewardId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        rewards[rewardId].endTime = block.timestamp;
        rewards[rewardId].rewardEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function buyToken(uint256 rewardId, uint256 amount)
        public
        payable
        nonReentrant
    {
        checkCliff(rewardId);

        require(
            tokenamounts[rewardId].unlockToken >= amount,
            "Insufficient Token!"
        );

        require(msg.value >= rates[rewardId] * amount, "Not enough Balance!");

        _sendToken(msg.sender, rewardId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 rewardId,
        uint256 amount
    ) private {
        tokenamounts[rewardId].unlockToken -= amount;
        amount = amount * 1e18;
        userTokenBal[_user][rewardId] += amount;
        token.safeTransfer(_user, amount);
    }

    // Check Cliff and Distribution token time is over or not
    function checkCliff(uint256 rewardId) private {
        uint256 _cliff = rewards[rewardId].cliff;
        uint256 _vested = rewards[rewardId].vested;
        uint256 _startTime = rewards[rewardId].startTime;
        bool _rewardStart = rewards[rewardId].rewardStart;
        bool _rewardEnd = rewards[rewardId].rewardEnd;
        uint256 collectedMth = claimMth[rewardId];

        // check distribution token start or not
        require(_rewardStart, "Reward tokens not Start!");
        require(_rewardEnd, "Reward tokens is Over!");

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
            _unlockToken(rewardId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 rewardId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _avgtoken = tokenamounts[rewardId].avgToken;
        uint256 _unlocktoken = tokenamounts[rewardId].unlockToken;
        uint256 _remaintoken = tokenamounts[rewardId].remainToken;

        if (_monthNumber < _vested) {
            _unlocktoken += _avgtoken;
            _remaintoken -= _avgtoken;

            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected = _vested;
        }

        claimMth[rewardId] = _collected;
        tokenamounts[rewardId].unlockToken = _unlocktoken;
        tokenamounts[rewardId].remainToken = _remaintoken;
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
