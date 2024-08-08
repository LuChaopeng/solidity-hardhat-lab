// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import './Bookkeeping.sol';
import "hardhat/console.sol";

contract Multifunctional {
    string public contractName;
    event ReceivedMoney(address sender, uint256 value);
    address public create2DeployedAdd;
    address public create2PredictedAdd;
    struct EncodeExample {
        uint x;
        address y;
        string u;
        uint[2] v;
    }
    event LogSelector(bool success, bytes data);

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

    function verifyEncode(uint x, address y, string memory u, uint[2] memory v) external pure returns(EncodeExample memory decodeRes) {
        bytes memory encodeRes = abi.encode(x, y, u, v);
        // bytes memory encodePackedRes = abi.encodePacked(x,y,u,v);
        // bytes memory encodeWithSignatureRes = abi.encodeWithSignature("f(uint,address,string,uint[2])",x,y,u,v);
        (uint dx, address dy, string memory du, uint[2] memory dv) = abi.decode(encodeRes, (uint,address,string,uint[2]));
        // 本来想返回12个值，会超过EVM栈深度，故使用struck曲线救国。而后发现decode只能解码encode的结果，不需要验证其他的了orz
        decodeRes = EncodeExample(dx, dy, du, dv);
        // abi.decode无法直接解码encodePacked(紧凑编码)、encodeWithSignature(附加函数签名)的结果，只处理单纯参数数据
        
        // (uint dx1, address dy1, string memory du1, uint[2] memory dv1) = abi.decode(encodePackedRes, (uint,address,string,uint[2]));
        // decodeRes = EnodeExample(dx1, dy1, du1, dv1);
        // (uint dx2, address dy2, string memory du2, uint[2] memory dv2) = abi.decode(encodeWithSignatureRes, (uint,address,string,uint[2]));
        // decodeRes2 = EnodeExample(dx, dy, du, dv);
    }

    function useFuncSelector() external returns (bytes4 selector){
        uint x = 1;
        address y = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        string memory u = "sss";
        uint[2] memory v = [uint256(1),3];
        // 经验教训：函数签名中别加空格等多余符号
        selector = bytes4(keccak256("verifyEncode(uint256,address,string,uint256[2])"));
        (bool success, bytes memory data) = address(this).call(abi.encodeWithSelector(selector, x,y,u,v));
        emit LogSelector(success, data);
    }
}