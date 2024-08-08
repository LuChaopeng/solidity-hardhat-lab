import { ignition, ethers } from "hardhat";
import SuperCModule from "../ignition/modules/Super";
import { expect, assert } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const fixtrue = async () =>  {
    const { superC } = await ignition.deploy(SuperCModule);
    const privateKey = process.env.ACCOUNT_1_PRIVATE_KEY;
    // 创建钱包可以不用provider，但是后面发出交易需要provider
    const wallet1 = new ethers.Wallet(privateKey as string, ethers.provider);

    const [bookkeepingOwner] = await ethers.getSigners();
    const bookkeepingContract = await ethers.deployContract('Bookkeeping', bookkeepingOwner);
    await bookkeepingContract.waitForDeployment();
    return { superC, wallet1, provider: ethers.provider, bookkeepingOwner, bookkeepingContract };
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
        await expect(superC.callETH(wallet1.address, ethers.parseEther('5'))).to.be.revertedWith('Send failed, revert tx.');
    });

    it("调用其他合约", async () => {
        const { superC, bookkeepingContract, bookkeepingOwner } = await loadFixture(fixtrue);
        const bookkeepingAddress = bookkeepingContract.target;

        const getOwnerUsingSuper = await superC.getBookkeepingOwner(bookkeepingAddress);

        expect(getOwnerUsingSuper).to.equal(bookkeepingOwner.address);
    });

    it("Create2创建可预知地址的合约", async () => {
        const { superC } = await loadFixture(fixtrue);
        // 由于create2Bookkeeping修改了链上状态，这里不能直接取到其返回值
        const tx = await superC.create2Bookkeeping();
        await tx.wait();
        const create2DeployedAdd = await superC.create2DeployedAdd();
        const create2PredictedAdd = await superC.create2PredictedAdd();
        expect(create2DeployedAdd).to.equal(create2PredictedAdd);
    });

    it("编解码示例", async () => {
        const { superC } = await loadFixture(fixtrue);
        const res = await superC.verifyEncode(6, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "ss", [1,3]);
        const [a,b,c,d] = res;
        // ethers将返回的数值处理为BigInt类型
        const verifyRes = a === 6n && c == "ss";
        assert.isTrue(verifyRes);
    });

    it("使用Selector调用函数", async () => {
        const { superC } = await loadFixture(fixtrue);
        let executeSuccess = false;
        superC.on('LogSelector', (success, data) => {
            executeSuccess = success;
        });
        const tx = await superC.useFuncSelector();
        await tx.wait();
        //  延迟一段时间以等到监听函数监听到交易事件
        await (new Promise((res)=>{setTimeout(()=>{res(0)}, 100)}));
        assert.isTrue(executeSuccess);    
    });

});