// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Iblc_token.sol";
import "hardhat/console.sol";

/* 
    Store Minter detail
    1. minter: Taking Minter Address
    2. clifMonth: Token Lockup period for some months
    3. amount: Total amount with calculating percentage
    4. vestedMonth: Period of time in which token are unlocked and distributed
*/
struct Minter {
    address minter;
    uint256 clifMonth;
    uint256 amount;
    uint256 vestedMonth;
}

contract BLC_Tokenomics is AccessControl, ReentrancyGuard {
    using SafeERC20 for Iblc_token;

    // Calculating Total Balance of each Minter by his Address.
    mapping(address => uint256) public _claimOf;

    /* 
        Get Minter detail
        1. Minter: Minter Address
        2. ClifMonth: Lockup period Months
        3. Amount: Total Amount
        4. VestedMonth: Distributed month
    */
    mapping(address => Minter) public minters;

    // Check how many month it take amount
    mapping(address => uint256) public _withdrawalMonth;

    // Store Creating Contract Timestamp.
    uint256 startTime;

    // Store log how many token can claimed by a minter.
    event MintToken(address account, uint256 amount);

    /// @dev The identifier of the role which maintains other roles.
    bytes32 public constant ADMIN = keccak256("ADMIN");
    /// @dev The identifier of the role which allows minters to mint tokens.
    bytes32 public constant MINTER = keccak256("MINTER");

    // Call Created Token contract interface and using methods
    Iblc_token public immutable token;

    constructor(
        Iblc_token token_,
        address dao,
        address[] memory addresses,
        uint256[] memory cliffMonths,
        uint256[] memory amount,
        uint256[] memory vestedMonths
    ) {
        _setupRole(ADMIN, dao);
        _setupRole(ADMIN, msg.sender); // This will be surrendered after deployment
        _setRoleAdmin(ADMIN, ADMIN);
        startTime = block.timestamp;

        for (uint256 i = 0; i < 11; ) {
            _setupRole(MINTER, addresses[i]);
            minters[addresses[i]] = Minter(
                addresses[i],
                cliffMonths[i],
                amount[i],
                vestedMonths[i]
            );

            unchecked {
                i++;
            }
        }
        token = token_;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER, msg.sender), "Vested Token:ONLY_MINTER");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN, msg.sender), "Vested Token:ONLY_ADMIN");
        _;
    }

    /*
        Claim Tokens by Minters
    */
    function claim() external onlyMinter nonReentrant {
        Minter memory m1 = minters[msg.sender];
        uint256 cliffMonth = m1.clifMonth;
        uint256 amount = m1.amount;
        uint256 vestedOf = m1.vestedMonth;
        address _minter = m1.minter;

        /*
            Calculating Current month token and then tranfer
        */
        _calculate(_minter, cliffMonth, amount, vestedOf);
    }

    /*
        Calculating Tokens for current month and then mint token
    */
    function _calculate(
        address _minter,
        uint256 _cliffMonth,
        uint256 _amount,
        uint256 _vestedOf
    ) private {
        uint256 cliffPeriod = startTime + (_cliffMonth * 30 days);

        require(block.timestamp >= cliffPeriod, "Cliff not expired!");

        uint256 _secondsDifference = block.timestamp - cliffPeriod;
        uint256 _monthNumber = _secondsDifference / 2592000;

        if (_monthNumber <= _vestedOf) {
            // calculate amount in months only
            uint256 averageAmt = _amount / (_vestedOf == 0 ? 1 : _vestedOf);
            uint256 months = _monthNumber - _withdrawalMonth[msg.sender];
            uint256 totalAmtTansfer = ((months == 0 ? 1 : months) *
                averageAmt) - _claimOf[_minter];

            // Claim amount at starting month
            if (cliffPeriod > 0) {
                // check month is bigger than 0 and vested month is equal vested month
                if (_monthNumber > 0 || _monthNumber == _vestedOf) {
                    if (_monthNumber == _vestedOf) {
                        totalAmtTansfer +=
                            _amount %
                            (_vestedOf == 0 ? 1 : _vestedOf);
                    }

                    transferAndSend(_minter, totalAmtTansfer);
                } else {}
            } else {}
        } else {
            transferAndSend(_minter, remainingToken(_minter));
        }
    }

    /*
        Calling Token Contract and mint Token in the minter address
    */
    function transferAndSend(address _minter, uint256 _monthlyAmt) private {
        address addr = _minter;
        _claimOf[_minter] += _monthlyAmt;
        token.mint(addr, _monthlyAmt);
        emit MintToken(_minter, _monthlyAmt);
    }

    /*
        Get total token remaining for each Minter
    */
    function remainingToken(address _minter) public view returns (uint256) {
        uint256 calculate = minters[_minter].amount - _claimOf[_minter];
        return calculate;
    }
}
