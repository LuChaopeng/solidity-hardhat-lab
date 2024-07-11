import { expect } from 'chai';
import hre from 'hardhat';
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Lock", async () => {

  it("需要设置正确的解锁时间", async () => {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const currentTime = await time.latest();
    const unlockTime = currentTime + ONE_YEAR_IN_SECS;
    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });
  it("过早提币报错", async () => {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const currentTime = await time.latest();
    const unlockTime = currentTime + ONE_YEAR_IN_SECS;
    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });
    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });
  it("到期成功提币", async () => {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const currentTime = await time.latest();
    const unlockTime = currentTime + ONE_YEAR_IN_SECS;
    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });
    await time.increaseTo(unlockTime);
    await lock.withdraw();
  });
})
