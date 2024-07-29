// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
// import "hardhat/console.sol";

contract Bookkeeping {
    uint256 public contractBalance = 0;
    address public owner;
    struct Account{
        bool isIncome;
        uint timestamp;
        uint amount;
    }
    mapping (address => Account[]) allAccounts;
    mapping (address => bool) vips;
    event CreateAccount(Account[] yourAccounts);
    event CommonLog(string msg);

    constructor() {
        owner = msg.sender;
    }

    function joinVip() payable external {
        require(vips[msg.sender] == false && msg.value >= 100 gwei, "You should pay more money OR YOU ARE ALREADY VIP");
        vips[msg.sender] = true;
        emit CommonLog("Congratulation!");
    }

    function enterAccount(bool isIncome, uint amount) payable external {
        if(msg.value != 1 gwei && vips[msg.sender] == false) {
            revert("You paid wrong fee");
        }
        Account memory newAccount = Account({
            isIncome: isIncome,
            timestamp: block.timestamp,
            amount: amount
        });
        allAccounts[msg.sender].push(newAccount);
        contractBalance = address(this).balance;
        emit CreateAccount(allAccounts[msg.sender]);
    }

    function withdrawMyMoney() payable external {
        require(msg.sender == owner, "You are not contract owner");
        uint amount = address(this).balance;
        if (amount <= 0) {
            revert("No money");
        }
        (bool success,) = owner.call{value: amount}("");
        require(success, "Withdraw Failed");
    }
}
