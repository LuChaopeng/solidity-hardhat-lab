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

  mapping (uint256 => Copyright) public copyrightList;
  address administrator;

  event CommonLog(bytes32 content);


  constructor() {
    administrator = msg.sender;
  }


  function  addCopyright(bytes32 arwreaveTxId, bytes32 r, bytes32 s, uint8 v, WorkMetaInfo memory info, uint256 uid)  external {
    // check permission
    require(msg.sender == administrator, 'NO PERMISSION');
    // recover address
    bytes32 txIdHash = keccak256(abi.encodePacked(arwreaveTxId));
    emit CommonLog(txIdHash);
    // todo: need to handle recovery failtures
    address signer = ecrecover(txIdHash, v,r,s);
    Copyright memory copyright = Copyright(signer, arwreaveTxId, r, s, v, info);
    copyrightList[uid] = copyright;
  }

  function getCopyrightInfoByUid(uint256 uid) external view returns(Copyright memory) {
    return copyrightList[uid];
  }
} 