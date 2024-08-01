import { ignition, ethers } from "hardhat";
import SuperCModule from "../ignition/modules/Super";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const fixtrue = async () =>  {
    const { superC } = await ignition.deploy(SuperCModule);
    const privateKey = process.env.ACCOUNT_1_PRIVATE_KEY;
    // 创建钱包可以不用provider，但是后面发出交易需要provider
    const wallet1 = new ethers.Wallet(privateKey as string, ethers.provider);
    return { superC, wallet1, provider: ethers.provider };
}

describe ("合约Multifunctional测试集", async () => {
    it("收钱函数功能和事件触发", async () => {
        const { superC, wallet1, provider } = await loadFixture(fixtrue);
        const contractAdd = superC.target;
        let eventDetail = {
            address: '',
            value: '',
        };

        // 监听收钱事件
        superC.on('ReceivedMoney', (address, value) => {
            eventDetail = {
                address,
                value: ethers.formatEther(value),
            };
        });

        const transferTx = await wallet1.sendTransaction({
            to: contractAdd,
            value: ethers.parseEther('1.0')
        });
        await transferTx.wait();
        //  延迟一段时间以等到监听函数监听到交易事件
        await (new Promise((res)=>{setTimeout(()=>{res(0)}, 100)}));

        const receiverBalance = ethers.formatEther(await provider.getBalance(contractAdd));
        expect(eventDetail.address).to.equal(wallet1.address);
        expect(eventDetail.value).to.equal(receiverBalance)
    });
});