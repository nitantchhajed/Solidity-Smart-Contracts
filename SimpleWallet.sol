pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";

contract Allowance is Ownable{
    using SafeMath for uint;
    event AllowanceChanged(address indexed _forWho, address indexed _fromWhom, uint _oldAmount, uint _newAmount);

     mapping(address => uint) public allowance;

function addAllowance(address _who, uint _amount) public onlyOwner {
    emit AllowanceChanged(_who, msg.sender, allowance[_who], _amount);
    allowance[_who] = _amount;

}
modifier ownerOrAllowed(uint _amount) {
    require(isOwner() || allowance[msg.sender] >= _amount, "you are not allowed" );
    _;
} 
function reduceAllowance(address _who, uint _amount) internal{
    emit AllowanceChanged(_who, msg.sender, allowance[_who], allowance[_who].sub( _amount));
    allowance[_who] =allowance[_who].sub(_amount);
}
}

contract SimpleWallet is Allowance {
   
   event MoneySend(address indexed _beneficiary, uint _amount);
   event MoneyReceived(address indexed _from, uint _amount);

function withdrawMoney(address payable _to, uint _amount) public ownerOrAllowed(_amount) {
   require( _amount <= address(this).balance , "there are not enough funds in smart contract");
   if(!isOwner()) {
       reduceAllowance(msg.sender, _amount);
   }
   emit MoneySend(_to, _amount);
    _to.transfer(_amount);
}
      function  renounceOwnership() public view override onlyOwner{
        revert("cant renounce ownership here");
    }

  receive () external payable {
      emit MoneyReceived(msg.sender, msg.value);

  }

}
