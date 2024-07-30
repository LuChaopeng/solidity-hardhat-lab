import { ignition, ethers } from "hardhat";
import ImportModule from "../ignition/modules/Import";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const deployFixture = async () => {
    const { ImportContract } = await ignition.deploy(ImportModule);
    const ImportContractAddress = await ImportContract.getAddress();
    await ImportContract.waitForDeployment();
    // 我没有找到在hardhat中获取合约部署receipt的方法，因此从block中拿到txHash
    // 这个记录下来，后续看下解决方案
    // console.log(contract.deploymentTransaction());
    // 方案：通过ethers而非ignition部署
    const provider = ethers.provider;
    const txHash = (await provider.getBlock(1))?.transactions[0];
    const tx = await provider.getTransactionReceipt(txHash as string);
    const deployerAddress = tx?.from;

    return { ImportContract, ImportContractAddress, deployerAddress };
}

describe("导入能力", async () => {
    it("Bookkeeping的初始余额确认", async ()=> {
        const { ImportContract } = await loadFixture(deployFixture);
        expect(await ImportContract.getBookBalance()).to.equal(0);
    });
    it("主合约Import部署者身份、m.getAccount能力验证", async ()=> {
        const { deployerAddress } = await loadFixture(deployFixture);
        // 使用了默认账户列表的第二个账户
        expect(deployerAddress).to.equal("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    });
    it("Bookkeeping部署者身份校验", async ()=> {
        const { ImportContract, ImportContractAddress } = await loadFixture(deployFixture);
        // Bookkping的部署者是Import合约
        const BookkeepingDeployerAdd = await ImportContract.getBookOwner();
        expect(BookkeepingDeployerAdd).to.equal(ImportContractAddress);
    });
});