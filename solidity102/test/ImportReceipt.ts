import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

const deployFixture = async () => {
    const signers = await ethers.getSigners();
    // 使用ethers部署
    const ImportContract = await ethers.deployContract('Import', signers[1]);
    const contractResponse = await ImportContract.waitForDeployment();
    return {ImportContract, contractResponse};
}

describe("导入能力", async () => {
    it("主合约Import部署者身份验证", async ()=> {
        const { ImportContract, contractResponse } = await loadFixture(deployFixture);
        // 直接从ImportContract取也可以
        const tx = contractResponse.deploymentTransaction();
        const deployerAddress = tx?.from;
        expect(deployerAddress).to.equal("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    });
});