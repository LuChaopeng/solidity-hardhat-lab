import hre from 'hardhat';
import { expect } from 'chai';

describe("MethodsCheck", async () => {
    it("Verify getStringUsingMemberMethod", async () => {
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
        expect(await contract.getStringUsingMemberMethod(110)).to.equal('110');
    });
});