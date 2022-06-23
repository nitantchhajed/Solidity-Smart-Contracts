pragma solidity ^0.8.7;

contract EventExample {
    mapping(address => uint) public tokenBalance;
    event TokenSent(address _from, address _to, uint _amount);
    constructor() {
        tokenBalance[msg.sender] - 100;
    }

    function sendToken(address _to, uint _amount) public returns(bool) {
        require(tokenBalance[msg.sender] >= _amount, "not enough balance");
        assert(tokenBalance[_to] + _amount >= tokenBalance[_to]);
        assert(tokenBalance[msg.sender] - _amount <= tokenBalance[msg.sender]);
        tokenBalance[msg.sender] -= _amount;
        tokenBalance[_to] += _amount;
        emit TokenSent(msg.sender, _to, _amount);

        return true;
    }
}