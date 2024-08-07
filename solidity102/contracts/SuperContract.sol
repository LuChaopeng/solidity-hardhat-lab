// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import './Bookkeeping.sol';
import "hardhat/console.sol";

contract Multifunctional {
    string public contractName;
    event ReceivedMoney(address sender, uint256 value);
    address public create2DeployedAdd;
    address public create2PredictedAdd;

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

    function getBookkeepingOwner(address _deployedAddress) external view returns (address bookkeepingOwner) {
        // Bookkeeping(_deployedAddress).owner;  错误的
        // 要执行自动生成的getter函数 onwer()，而不是试图直接访问 owner 状态
       bookkeepingOwner = Bookkeeping(_deployedAddress).owner();
    }

    function getBookkeepingBytecode() private pure returns (bytes memory) {
        bytes memory bytecode = type(Bookkeeping).creationCode;
        // 无构造函数参数，abi.encode() 参数为空
        return abi.encodePacked(bytecode, abi.encode());
    }

    function create2Bookkeeping() external{
        bytes32 _salt = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
        // create2创建合约
        Bookkeeping book = new Bookkeeping{salt: _salt}();
        // 部署的地址
        create2DeployedAdd = address(book);
        // 获取合约字节码
        bytes memory bytecode = getBookkeepingBytecode();
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(bytecode)
            )
        );
        // 计算的地址
        create2PredictedAdd = address(uint160(uint(hash)));
    }

}