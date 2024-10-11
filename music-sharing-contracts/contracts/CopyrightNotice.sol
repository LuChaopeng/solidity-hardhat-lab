// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract CopyrightNotice {
  struct WorkMetaInfo {
    string name;
    string lyricist;
    string composer;
    uint releaseDate;
  }

  struct Copyright {
    address copyrightHolder; // institution recover it from signature
    bytes32 arweaveTxId;
    bytes32 r;
    bytes32 s;
    uint8 v;
    WorkMetaInfo metaInfo;
  }

  mapping (string => Copyright) copyrightList;
  address administrator;

  event CommonLog(bytes32 content);


  constructor() {
    administrator = msg.sender;
  }


  function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
      // 使用EIP-191标准来构建带前缀的消息哈希
      return keccak256(abi.encodePacked(
          "\x19Ethereum Signed Message:\n32", 
          _messageHash
      ));
  }

  function  addCopyright(bytes32 arwreaveTxId, bytes32 r, bytes32 s, uint8 v, WorkMetaInfo memory info, string memory uid)  external {
    // check permission
    require(msg.sender == administrator, 'NO PERMISSION');
    // recover address
    bytes32 txIdHash = getEthSignedMessageHash(arwreaveTxId);
    address signer = ecrecover(txIdHash, v,r,s);
    Copyright memory copyright = Copyright(signer, arwreaveTxId, r, s, v, info);
    copyrightList[uid] = copyright;
  }

  function getCopyrightInfoByUid(string memory uid) external view returns(Copyright memory) {
    return copyrightList[uid];
  }
} 