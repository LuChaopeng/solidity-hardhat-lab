import hre from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe("MethodsCheck", async () => {

    const depolyFixtrue = async () => {
        // 先部署库合约
        const libraryContract = await hre.ethers.deployContract('Strings');
        // 这里是否等待上链不影响测试，但是养成加上的习惯
        await libraryContract.waitForDeployment();
        // 获取库合约地址，target 或者 await getAddress()
        const libraryAddress = libraryContract.target;
        // deployContract的多种重载，挑合适的用
        const contract = await hre.ethers.deployContract('UseLibrary', {
            libraries: {
                Strings: libraryAddress,
            }
        });
        return { contract };
    }

    it("Verify getStringUsingMemberMethod", async () => {
        const {contract} = await loadFixture(depolyFixtrue);
        expect(await contract.getStringUsingMemberMethod(110)).to.equal('110');
    });

    it("直接使用库方法", async () => {
        const {contract} = await loadFixture(depolyFixtrue);
        expect(await contract.getStringUsingLibrary(110)).to.equal('110');
    });
});