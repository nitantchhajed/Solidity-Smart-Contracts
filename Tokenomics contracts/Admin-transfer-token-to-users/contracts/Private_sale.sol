// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Iblc_token.sol";

/*
    Storing sale type details:
    name, cliffed month, vested months Starting date of sale,
    End date of sale, and each token price 
*/
struct SaleType {
    string typeName;
    uint256 cliff;
    uint256 vested;
    uint256 startTime;
    uint256 endTime;
    bool isdistStart;
    bool isdistEnd;
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

contract Private_sale is AccessControl {
    // call blc token contract methods
    using SafeERC20 for Iblc_token;
    Iblc_token public immutable token;

    // pass old and new ownership
    event TransferOwnerShip(address _oldOwner, address _newOwner);

    // check total token transfer by owner
    event transferTokens(address from, address to, uint256 amount);

    // Owner can start sale, End Sale Change Ownership, Withdraw Amount
    address public owner;

    // storing sale timing details
    mapping(uint256 => SaleType) public saletypes;

    // storing sale amount details
    mapping(uint256 => TokenAmount) public tokenamounts;

    // unlocked month for each sale type
    mapping(uint256 => uint256) claimMth;

    // Total token claimed by each user by address and sale type
    mapping(address => mapping(uint256 => uint256)) public userTokenBal;

    /// @dev The identifier of the role which maintains other roles.
    /// Admin only transfer tokens to users
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(Iblc_token token_) {
        owner = msg.sender;
        _setupRole(ADMIN_ROLE, msg.sender);
        token = token_;

        // insert sale timing detail statically type name, cliff months, vested months,
        // start sale time, end sale time, issale start, issale end
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
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this action!");
        _;
    }

    modifier onlyAdmin() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Only Admin can do this action!"
        );
        _;
    }

    // Start Sale by its type and then start sale immediately when call this method
    function startTime(uint256 saleId) external onlyOwner {
        require(saletypes[saleId].isdistStart != true, "Sale Already Started");
        saletypes[saleId].startTime = block.timestamp;
        saletypes[saleId].isdistStart = true;
    }

    // End Sale by its type and then end sale immediately when call this method
    function endTime(uint256 saleId) external onlyOwner {
        uint256 _cliff = saletypes[saleId].cliff;
        uint256 _vested = saletypes[saleId].vested;
        uint256 _startTime = saletypes[saleId].startTime;

        // check cliff and vested month of the sale is over or not
        uint256 completeTime = _startTime + ((_cliff + _vested) * 30 days);
        require(block.timestamp > completeTime, "Cliff/Vested not Over!");
        saletypes[saleId].endTime = block.timestamp;
        saletypes[saleId].isdistEnd = false;
    }

    // Buy token by the user and pay amount for each token but firstly check cliff is over or not
    function transferToken(
        uint256 saleId,
        address user,
        uint256 amount
    ) public onlyAdmin {
        checkCliff(saleId);

        require(
            tokenamounts[saleId].unlockToken >= amount,
            "Insufficient Token!"
        );

        // transfer token to user wallet
        _sendToken(user, saleId, amount);
    }

    // Transfer tokens to user
    function _sendToken(
        address _user,
        uint256 _saleId,
        uint256 amount
    ) private {
        tokenamounts[_saleId].unlockToken -= amount;
        userTokenBal[_user][_saleId] += amount;
        token.safeTransfer(_user, amount);
        emit transferTokens(msg.sender, _user, amount);
    }

    // Check Cliff and Sale is over or not
    function checkCliff(uint256 saleId) private {
        uint256 _cliff = saletypes[saleId].cliff;
        uint256 _vested = saletypes[saleId].vested;
        uint256 _startTime = saletypes[saleId].startTime;
        bool _saleStart = saletypes[saleId].isdistStart;
        bool _saleEnd = saletypes[saleId].isdistEnd;
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

        // check unlock method run only one time in a month not every time
        if ((_monthNumber >= collectedMth && collectedMth <= _vested)) {
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
        uint256 _unlocktoken = tokenamounts[_saleId].unlockToken;
        uint256 _remaintoken = tokenamounts[_saleId].remainToken;
        uint256 _avgtoken = tokenamounts[_saleId].avgToken;

        if (_monthNumber < _vested) {
            // when skip any month automatic calculate amount and added de reduce in unlock and remaining amt
            uint256 month = _monthNumber <= 0 ? 1 : _monthNumber + 1;

            uint256 monthCal = _avgtoken * (month - _collected);
            _unlocktoken += monthCal;
            _remaintoken -= monthCal;

            // check amount not divided completely and added at the last month of vested
            if (_monthNumber >= 5) {
                _unlocktoken += _remaintoken;
                _remaintoken = 0;
            }
            _collected = _monthNumber + 1;
        } else {
            _unlocktoken += _remaintoken;
            _remaintoken = 0;
            _collected++;
        }

        claimMth[_saleId] = _collected;
        tokenamounts[_saleId].unlockToken = _unlocktoken;
        tokenamounts[_saleId].remainToken = _remaintoken;
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
