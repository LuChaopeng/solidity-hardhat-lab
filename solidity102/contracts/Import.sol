// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import './Bookkeeping.sol';
import "hardhat/console.sol";

contract Import {
    Bookkeeping public book;

    constructor() {
        book = new Bookkeeping();
    }

    function getBookBalance() external view returns(uint) {
        uint balance = book.contractBalance();
        return balance;
    }

    function getBookOwner() external view returns(address) {
        return book.owner();
    }
}
