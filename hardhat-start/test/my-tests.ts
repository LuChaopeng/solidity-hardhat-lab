import { expect } from 'chai';
import hre from 'hardhat';
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Lock", async () => {
  /** beforeEach
  let lock: any;
  let unlockTime: number;
  let lockedAmount = 100000000;
  beforeEach(async () => {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });
  });
  */

  const deployOneYearLockFixture = async () => {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });
    return {lock, unlockTime, lockedAmount};
  }

  it("需要设置正确的解锁时间", async () => {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });
  it("过早提币报错", async () => {
    const { lock } = await loadFixture(deployOneYearLockFixture);
    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });
  it("到期成功提币", async () => {
    const { unlockTime, lock } = await loadFixture(deployOneYearLockFixture);
    await time.increaseTo(unlockTime);
    await lock.withdraw();
  });
})
