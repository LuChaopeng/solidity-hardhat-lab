// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "./CopyrightNotice.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

// Declare interface to call CopyrightNotice's methods, expanding struct
interface ICopyrightNotice {
  struct WorkMetaInfo {
    string name;
    string lyricist;
    string composer;
    uint releaseDate;
  }
  struct Copyright {
    address copyrightHolder;
    bytes32 arweaveTxId;
    bytes32 r;
    bytes32 s;
    uint8 v;
    WorkMetaInfo metaInfo;
  }
  function getCopyrightInfoByUid(string memory _uid) external view returns (Copyright memory);
}


contract Market {
  struct WorkMetaInfo {
    string name;
    string lyricist;
    string composer;
    uint releaseDate;
  }

  // Market also needs this struct
  struct Copyright {
    address copyrightHolder; // institution recover it from signature
    bytes32 arweaveTxId;
    bytes32 r;
    bytes32 s;
    uint8 v;
    WorkMetaInfo metaInfo;
  }

  struct Artwork {
    string copyrightUid;
    string holderEmail;
    uint256 copyrightPrice;
    uint256 singleRightsPrice;
    WorkMetaInfo metaInfo;
  }

  ICopyrightNotice notice;
  // work info will remain in onSaleWorks map util its copyright is sold
  mapping (uint => Artwork) public onSaleWorks;
  uint totalWorkCount = 0;
  address marketManager;

  constructor(address copyrightNoticeContractAddress) {
    marketManager = msg.sender;
    notice = ICopyrightNotice(copyrightNoticeContractAddress);
  }

  // Artist publishes work on the market
  function publishWork(string memory copyrightUid, string memory holderEmail, uint256 copyrightPrice, uint256 singleRightsPrice) external {
    ICopyrightNotice.Copyright memory copyright = notice.getCopyrightInfoByUid(copyrightUid);
    address copyrightHolder = copyright.copyrightHolder;
    // check if publisher own the copyright
    require(copyrightHolder == msg.sender, 'ONLY HOLDER CAN PUBLISH.');
    // Package returned multiple values into a struct
    WorkMetaInfo memory metaInfo = WorkMetaInfo(
      copyright.metaInfo.name,
      copyright.metaInfo.lyricist,
      copyright.metaInfo.composer,
      copyright.metaInfo.releaseDate
    );
    Artwork memory work = Artwork(copyrightUid, holderEmail, copyrightPrice, singleRightsPrice, metaInfo);
    totalWorkCount = totalWorkCount + 1;
    onSaleWorks[totalWorkCount] = work;
  }
}