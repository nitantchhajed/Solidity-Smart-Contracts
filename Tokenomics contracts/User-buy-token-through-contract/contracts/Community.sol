// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

/*
    storing token Community type details:
    name, cliffed month, vested months Starting date of Community token,
    End date of Community token, and each token price 
*/
struct Communitie {
    string communityName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool distrStart;
    bool distrEnd;
}

/*
    storing Community token amounts details:
    Total token of Community in token community type, unlocked amounts,
    and remaing or availabe amount for communities
*/
struct TokenAmount {
    uint256 totalToken;
    uint256 unlockToken;
    uint256 remainToken;
    uint256 avgToken;
}

contract Community is ReentrancyGuard, Ownable {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // storing token community timing details
    mapping(uint256 => Communitie) public communities;

    // storing token community amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // storing token rate amount timing details
    mapping(uint256 => uint256) public rates;

    // unlocked month for each token for community type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and community type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    constructor(Iblc_token token_) {
        token = token_;

        // insert community timing detail statically
        communities[1] = Communitie(
            "Community Treasury",
            0,
            48,
            0,
            0,
            false,
            true
        );
        communities[2] = Communitie("Liquidity", 0, 4, 0, 0, false, true);
        communities[3] = Communitie("Partners", 6, 15, 0, 0, false, true);

        // insert communities token amount detail statically
        tokenamounts[1] = TokenAmount(
            25 * 1e25, // total token
            0, // unlocked token
            25 * 1e25, // remaining token
            5208333 * 1e18 // average token
        );
        tokenamounts[2] = TokenAmount(
            10 * 1e25, // total token
            0, // unlocked token
            10 * 1e25, // remaining token
            25000000 * 1e18 // average token
        );

        tokenamounts[3] = TokenAmount(
            10 * 1e25, // total token
            0, // unlocked token
            10 * 1e25, // remaining token
            6666666 * 1e18 // average token
        );

        // insert token amount detail statically
        rates[1] = 30 * 1e12;
        rates[2] = 30 * 1e12;
        rates[3] = 30 * 1e12;
    }

    // Start Community by its type and then start distribution token immediately then call this method
    function distrStart(uint256 commId) external onlyOwner {
        require(
            communities[commId].distrStart != true,
            "Distribution token Already Started"
        );
        communities[commId].startTime = block.timestamp;
        communities[commId].distrStart = true;
    }

    // End Community by its type and then end token distribution immediately then call this method
    function distrEnd(uint256 commId) external onlyOwner {
        uint256 _cliff = communities[commId].cliff;
        uint256 _vested = communities[commId].vested;
        uint256 _startTime = communities[commId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        communities[commId].endTime = block.timestamp;
        communities[commId].distrEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function buyToken(uint256 commId, uint256 amount)
        public
        payable
        nonReentrant
    {
        checkCliff(commId);

        require(
            tokenamounts[commId].unlockToken >= amount,
            "Insufficient Token!"
        );

        require(msg.value >= rates[commId] * amount, "Not enough Balance!");

        _sendToken(msg.sender, commId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 commId,
        uint256 amount
    ) private {
        tokenamounts[commId].unlockToken -= amount * 1e18;
        amount = amount * 1e18;
        userTokenBal[_user][commId] += amount;
        token.safeTransfer(_user, amount);
    }

    // Check Cliff and Distribute token when time is over or not
    function checkCliff(uint256 commId) private {
        uint256 _cliff = communities[commId].cliff;
        uint256 _vested = communities[commId].vested;
        uint256 _startTime = communities[commId].startTime;
        bool _commStart = communities[commId].distrStart;
        bool _commEnd = communities[commId].distrEnd;
        uint256 collectedMth = claimMth[commId];

        // check distribution token start or not
        require(_commStart, "Distribution tokens not Start!");
        require(_commEnd, "Distribution tokens is Over!");

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
            _unlockToken(commId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 commId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _avgtoken = tokenamounts[commId].avgToken;
        uint256 _unlocktoken = tokenamounts[commId].unlockToken;
        uint256 _remaintoken = tokenamounts[commId].remainToken;

        if (_monthNumber < _vested) {
            _unlocktoken += _avgtoken;
            _remaintoken -= _avgtoken;

            // check amount not divided completely and and at the last month of cliff
            if (_monthNumber == (_vested - 1)) {
                _unlocktoken += _remaintoken;
                _remaintoken = 0;
            }
            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected = _vested;
        }

        claimMth[commId] = _collected;
        tokenamounts[commId].unlockToken = _unlocktoken;
        tokenamounts[commId].remainToken = _remaintoken;
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
