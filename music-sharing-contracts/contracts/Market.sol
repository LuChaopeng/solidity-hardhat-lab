// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "./CopyrightNotice.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Declare interface to call CopyrightNotice's methods, expanding struct
interface ICopyrightNotice {
  function getCopyrightInfoByUid(string memory _uid) external view returns (
    address _copyrightHolder, bytes32 _arweaveTxId, bytes32 _r, bytes32 _s, uint8 _v,
    string memory _name, string memory _lyricist, string memory _composer, uint _releaseDate
  );
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
  mapping (uint => Artwork) onSaleWorks;
  uint totalWorkCount = 0;
  address marketManager;

  constructor(address copyrightNoticeContractAddress) {
    marketManager = msg.sender;
    notice = ICopyrightNotice(copyrightNoticeContractAddress);
  }

  // Artist publishes work on the market
  function publishWork(string memory copyrightUid, string memory holderEmail, uint256 copyrightPrice, uint256 singleRightsPrice) external {
    (address copyrightHolder, , , , , string memory name, string memory lyricist, string memory composer, uint releaseDate) = notice.getCopyrightInfoByUid(copyrightUid);
    // check if publisher own the copyright
    require(copyrightHolder == msg.sender, 'ONLY HOLDER CAN PUBLISH.');
    // Package returned multiple values into a struct
    WorkMetaInfo memory metaInfo = WorkMetaInfo(name, lyricist, composer, releaseDate);
    Artwork memory work = Artwork(copyrightUid, holderEmail, copyrightPrice, singleRightsPrice, metaInfo);
    totalWorkCount = totalWorkCount + 1;
    onSaleWorks[totalWorkCount] = work;
  }
}