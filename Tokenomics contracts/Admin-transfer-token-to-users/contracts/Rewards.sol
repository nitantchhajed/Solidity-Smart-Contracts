// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Iblc_token.sol";

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
    bool isdistStart;
    bool isdistEnd;
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

contract Rewards is AccessControl {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // pass old and new ownership
    event TransferOwnerShip(address _oldOwner, address _newOwner);

    // check total token transfer by owner
    event transferTokens(address from, address to, uint256 amount);

    // Owner can start sale, End Sale Change Ownership, Withdraw Amount
    address public owner;

    // storing token reward timing details
    mapping(uint256 => Reward) public rewards;

    // storing token reward amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // unlocked month for each token reward type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and token reward type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    /// @dev The identifier of the role which maintains other roles.
    /// Admin only transfer tokens to users
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(Iblc_token token_) {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
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
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this action!");
        _;
    }

    // Start Reward by its type and then start distribution token immediately then call this method
    function startTime(uint256 rewardId) external onlyOwner {
        require(
            rewards[rewardId].isdistStart != true,
            "Distribution Already Started"
        );
        rewards[rewardId].startTime = block.timestamp;
        rewards[rewardId].isdistStart = true;
    }

    // End Rewards by its type and then end token distribution immediately then call this method
    function endTime(uint256 rewardId) external onlyOwner {
        uint256 _cliff = rewards[rewardId].cliff;
        uint256 _vested = rewards[rewardId].vested;
        uint256 _startTime = rewards[rewardId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        rewards[rewardId].endTime = block.timestamp;
        rewards[rewardId].isdistEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function transferToken(
        uint256 rewardId,
        address user,
        uint256 amount
    ) public {
        checkCliff(rewardId);

        require(
            tokenamounts[rewardId].unlockToken >= amount,
            "Insufficient Token!"
        );

        // transfer token to user wallet
        _sendToken(user, rewardId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 _rewardId,
        uint256 amount
    ) private {
        tokenamounts[_rewardId].unlockToken -= amount;
        userTokenBal[_user][_rewardId] += amount;
        token.safeTransfer(_user, amount);
        emit transferTokens(msg.sender, _user, amount);
    }

    // Check Cliff and Distribution token time is over or not
    function checkCliff(uint256 rewardId) private {
        uint256 _cliff = rewards[rewardId].cliff;
        uint256 _vested = rewards[rewardId].vested;
        uint256 _startTime = rewards[rewardId].startTime;
        bool _commStart = rewards[rewardId].isdistStart;
        bool _commEnd = rewards[rewardId].isdistEnd;
        uint256 collectedMth = claimMth[rewardId];

        // check distribution token start or not
        require(_commStart, "Distribution not Start!");
        require(_commEnd, "Distribution is Over!");

        // check cliff is comeplete or not
        uint256 completeCliff = _startTime + (_cliff * 30 days);
        require(block.timestamp > completeCliff, "Cliff is not Over!");

        // get month diffrence
        uint256 _secondsDifference = block.timestamp - completeCliff;
        uint256 _monthNumber = _secondsDifference / 2592000;

        // check unlock method run only one time in a month not every time
        if ((_monthNumber >= collectedMth && collectedMth <= _vested)) {
            // calling calculate method on each month only and unlock some token
            _unlockToken(rewardId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 _rewardId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _unlocktoken = tokenamounts[_rewardId].unlockToken;
        uint256 _remaintoken = tokenamounts[_rewardId].remainToken;
        uint256 _avgtoken = tokenamounts[_rewardId].avgToken;

        if (_monthNumber < _vested) {
            // when skip any month automatic calculate amount and added de reduce in unlock and remaining amt
            uint256 month = _monthNumber <= 0 ? 1 : _monthNumber + 1;

            uint256 monthCal = _avgtoken * (month - _collected);
            _unlocktoken += monthCal;
            _remaintoken -= monthCal;

            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected++;
        }

        claimMth[_rewardId] = _collected;
        tokenamounts[_rewardId].unlockToken = _unlocktoken;
        tokenamounts[_rewardId].remainToken = _remaintoken;
    }

    function transferOwnerShip(address _newOwner) external onlyOwner {
        owner = _newOwner;
        _setupRole(ADMIN_ROLE, _newOwner);
        _revokeRole(ADMIN_ROLE, msg.sender);
        emit TransferOwnerShip(msg.sender, _newOwner);
    }

    function addAdmins(address addAdmin) external onlyOwner {
        _setupRole(ADMIN_ROLE, addAdmin);
    }

    function withdrawalToken(uint256 amount) external onlyOwner {
        token.safeTransfer(msg.sender, amount);
    }
}
