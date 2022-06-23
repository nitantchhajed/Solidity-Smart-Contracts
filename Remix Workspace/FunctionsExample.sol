pragma solidity ^0.8.7;

contract FunctionstionExample {

    mapping(address => uint) public balanceReceived;

    address payable owner;
    constructor()  {
        owner = payable(msg.sender);
    }
    function getOwner() public view returns(address) {
        return owner;
    }

    function convertToEther(uint _amountInWei) public pure returns(uint) {
        return _amountInWei/1 ether;
    }
    function destroySmartContract() public {
        require(msg.sender == owner, "you are not the owner");
        selfdestruct(owner);
    }
    
    function receiveMoney() public payable{
        assert(balanceReceived[msg.sender] + uint(msg.value) >= balanceReceived[msg.sender]);
        balanceReceived[msg.sender] += uint64(msg.value);
    }

    function withdrawMoney(address payable _to, uint64 _amount) public {
        require(_amount <= balanceReceived[msg.sender], "you dont have enough ether");
        assert(balanceReceived[msg.sender] >= balanceReceived[msg.sender] - _amount );
        balanceReceived[msg.sender] -= _amount;
        _to.transfer(_amount);

    }
     receive () external payable {
        receiveMoney();
    }
}

