// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Iblc_token.sol";

/*
    storing distribution token type details:
    name, cliffed month, vested months Starting date of Distribute token,
    End date of Distribute token, and each token price 
*/
struct TeamAdvisor {
    string typeName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool isdistStart;
    bool isdistEnd;
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

contract TeamAdvisors is AccessControl {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // pass old and new ownership
    event TransferOwnerShip(address _oldOwner, address _newOwner);

    // check total token transfer by owner
    event transferTokens(address from, address to, uint256 amount);

    // Owner can start sale, End Sale Change Ownership, Withdraw Amount
    address public owner;

    // storing distribution token timing details
    mapping(uint256 => TeamAdvisor) public teamadvisors;

    // storing distribution token amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // unlocked month for each distribution token type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and distribution token type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    /// @dev The identifier of the role which maintains other roles.
    /// Admin only transfer tokens to users
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(Iblc_token token_) {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
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
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this action!");
        _;
    }

    // Start Distribute by its type and then start distribution token immediately when call this method
    function startTime(uint256 teamAdviId) external onlyOwner {
        require(
            teamadvisors[teamAdviId].isdistStart != true,
            "Distribution token Already Started"
        );
        teamadvisors[teamAdviId].startTime = block.timestamp;
        teamadvisors[teamAdviId].isdistStart = true;
    }

    // End Distribute by its type and then end distribution token immediately when call this method
    function endTime(uint256 teamAdviId) external onlyOwner {
        uint256 _cliff = teamadvisors[teamAdviId].cliff;
        uint256 _vested = teamadvisors[teamAdviId].vested;
        uint256 _startTime = teamadvisors[teamAdviId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        teamadvisors[teamAdviId].endTime = block.timestamp;
        teamadvisors[teamAdviId].isdistEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function transferToken(
        uint256 teamAdviId,
        address user,
        uint256 amount
    ) public {
        checkCliff(teamAdviId);

        require(
            tokenamounts[teamAdviId].unlockToken >= amount,
            "Insufficient Token!"
        );

        // transfer token to user wallet
        _sendToken(user, teamAdviId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 teamAdviId,
        uint256 amount
    ) private {
        tokenamounts[teamAdviId].unlockToken -= amount;
        userTokenBal[_user][teamAdviId] += amount;
        token.safeTransfer(_user, amount);
        emit transferTokens(msg.sender, _user, amount);
    }

    // Check Cliff and Distribution token time is over or not
    function checkCliff(uint256 teamAdviId) private {
        uint256 _cliff = teamadvisors[teamAdviId].cliff;
        uint256 _vested = teamadvisors[teamAdviId].vested;
        uint256 _startTime = teamadvisors[teamAdviId].startTime;
        bool _distrStart = teamadvisors[teamAdviId].isdistStart;
        bool _distrEnd = teamadvisors[teamAdviId].isdistEnd;
        uint256 collectedMth = claimMth[teamAdviId];

        // check distribution start or not
        require(_distrStart, "Distribution not Start!");
        require(_distrEnd, "Distribution is Over!");

        // check cliff is comeplete or not
        uint256 completeCliff = _startTime + (_cliff * 30 days);
        require(block.timestamp > completeCliff, "Cliff is not Over!");

        // get month diffrence
        uint256 _secondsDifference = block.timestamp - completeCliff;
        uint256 _monthNumber = _secondsDifference / 2592000;

        // check unlock method run only one time in a month not every time
        if ((_monthNumber >= collectedMth && collectedMth <= _vested)) {
            // calling calculate method on each month only and unlock some token
            _unlockToken(teamAdviId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 _teamAdviId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _unlocktoken = tokenamounts[_teamAdviId].unlockToken;
        uint256 _remaintoken = tokenamounts[_teamAdviId].remainToken;
        uint256 _avgtoken = tokenamounts[_teamAdviId].avgToken;

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

        claimMth[_teamAdviId] = _collected;
        tokenamounts[_teamAdviId].unlockToken = _unlocktoken;
        tokenamounts[_teamAdviId].remainToken = _remaintoken;
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
