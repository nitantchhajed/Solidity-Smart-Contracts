pragma solidity ^0.8.0;

contract SomeContract {
    uint public myUint =10;
    function setUint(uint _myUint) public {
        myUint =_myUint;
    }
}
