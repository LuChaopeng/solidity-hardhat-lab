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

    it("发送ETH", async () => {
        const { superC, wallet1, provider } = await loadFixture(fixtrue);
        const contractAdd = superC.target;
        // 先向合约转入20ETH
        const recTx = await wallet1.sendTransaction({
            to: contractAdd,
            value: ethers.parseEther('20')
        });
        await recTx.wait();
        // 调用函数从合约转出5ETH
        const sendTx = await superC.sendETH(wallet1.address, ethers.parseEther('5'));
        await sendTx.wait();

        const contractBalance = ethers.formatEther(await provider.getBalance(contractAdd));
        expect(contractBalance).to.equal('15.0');
    });

    it("使用call发送ETH", async () => {
        const { superC, wallet1, provider } = await loadFixture(fixtrue);
        const contractAdd = superC.target;
        // 先向合约转入20ETH
        const recTx = await wallet1.sendTransaction({
            to: contractAdd,
            value: ethers.parseEther('20')
        });
        await recTx.wait();
        // 调用函数从合约转出5ETH
        const sendTx = await superC.callETH(wallet1.address, ethers.parseEther('5'));
        await sendTx.wait();

        const contractBalance = ethers.formatEther(await provider.getBalance(contractAdd));
        expect(contractBalance).to.equal('15.0');
    });

    it("使用call发送ETH失败回退", async () => {
        const { superC, wallet1 } = await loadFixture(fixtrue);
        // 调用函数从合约转出5ETH
        expect(superC.callETH(wallet1.address, ethers.parseEther('5'))).to.be.revertedWith('Send failed, revert tx.');
    });
});