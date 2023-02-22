// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Iblc_token.sol";

/*
    storing token Community type details:
    name, cliffed month, vested months Starting date of Community token,
    End date of Community token, and each token price 
*/
struct Communitie {
    string typeName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool isdistStart;
    bool isdistEnd;
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

contract Community is AccessControl {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // pass old and new ownership
    event TransferOwnerShip(address _oldOwner, address _newOwner);

    // check total token transfer by owner
    event transferTokens(address from, address to, uint256 amount);

    // Owner can start sale, End Sale Change Ownership, Withdraw Amount
    address public owner;

    // storing token community timing details
    mapping(uint256 => Communitie) public communities;

    // storing token community amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // unlocked month for each token for community type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and community type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    /// @dev The identifier of the role which maintains other roles.
    /// Admin only transfer tokens to users
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(Iblc_token token_) {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
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
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this action!");
        _;
    }

    // Start Community by its type and then start distribution token immediately then call this method
    function startTime(uint256 commId) external onlyOwner {
        require(
            communities[commId].isdistStart != true,
            "Distribution Already Started"
        );
        communities[commId].startTime = block.timestamp;
        communities[commId].isdistStart = true;
    }

    // End Community by its type and then end token distribution immediately then call this method
    function endTime(uint256 commId) external onlyOwner {
        uint256 _cliff = communities[commId].cliff;
        uint256 _vested = communities[commId].vested;
        uint256 _startTime = communities[commId].startTime;

        // check cliff and vested month of the distribution token is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        communities[commId].endTime = block.timestamp;
        communities[commId].isdistEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function transferToken(
        uint256 commId,
        address user,
        uint256 amount
    ) public {
        checkCliff(commId);

        require(
            tokenamounts[commId].unlockToken >= amount,
            "Insufficient Token!"
        );

        // transfer token to user wallet
        _sendToken(user, commId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 _commId,
        uint256 amount
    ) private  {
        tokenamounts[_commId].unlockToken -= amount;
        userTokenBal[_user][_commId] += amount;
        token.safeTransfer(_user, amount);
        emit transferTokens(msg.sender, _user, amount);
    }

    // Check Cliff and Distribute token when time is over or not
    function checkCliff(uint256 commId) private {
        uint256 _cliff = communities[commId].cliff;
        uint256 _vested = communities[commId].vested;
        uint256 _startTime = communities[commId].startTime;
        bool _commStart = communities[commId].isdistStart;
        bool _commEnd = communities[commId].isdistEnd;
        uint256 collectedMth = claimMth[commId];

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
            _unlockToken(commId, _vested, _monthNumber, collectedMth);
        }
    }

    // calculate each month and unlock some amount, then user can buy tokens
    function _unlockToken(
        uint256 _commId,
        uint256 _vested,
        uint256 _monthNumber,
        uint256 _collected
    ) private {
        uint256 _unlocktoken = tokenamounts[_commId].unlockToken;
        uint256 _remaintoken = tokenamounts[_commId].remainToken;
        uint256 _avgtoken = tokenamounts[_commId].avgToken;

        if (_monthNumber < _vested) {
            // when skip any month automatic calculate amount and added de reduce in unlock and remaining amt
            uint256 month = _monthNumber <= 0 ? 1 : _monthNumber + 1;

            uint256 monthCal = _avgtoken * (month - _collected);
            _unlocktoken += monthCal;
            _remaintoken -= monthCal;

            // check amount not divided completely and added at the last month of vested
            if (_monthNumber >= (_vested - 1)) {
                _unlocktoken += _remaintoken;
                _remaintoken = 0;
            }
            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected++;
        }

        claimMth[_commId] = _collected;
        tokenamounts[_commId].unlockToken = _unlocktoken;
        tokenamounts[_commId].remainToken = _remaintoken;
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
