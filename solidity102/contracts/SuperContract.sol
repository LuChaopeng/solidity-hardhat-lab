// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
// import "hardhat/console.sol";

contract Multifunctional {
    string public contractName;
    event ReceivedMoney(address sender, uint256 value);

    constructor (string memory name) {
        contractName = name;
    }

    receive() external payable {
        // console.log('即将触发收钱事件');
        emit ReceivedMoney(msg.sender, msg.value);
    }

    function sendETH(address payable to, uint amount) external{
        to.transfer(amount);
    }

    function callETH(address payable to, uint amount) external {
        (bool success,) = to.call{value: amount}("");
        if (!success) {
            revert("Send failed, revert tx.");
        }
    }
}