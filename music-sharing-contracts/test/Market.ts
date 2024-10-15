import { ethers, ignition } from "hardhat";
import CopyrightNoticeModule from "../ignition/modules/CopyrightNotice";
import MarketModule from "../ignition/modules/Market";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { getMsgHashBytes, signMessage } from "../utils/signature";
import { uint8ArrayToHexString } from "../utils/util";

const fixtrue = async () => {
    /** 分别部署两个合约 */
    const { CopyrightNoticeContract } = await ignition.deploy(CopyrightNoticeModule);
    // 已部署的版权公示地址
    const copyrightNoticeContractAddress = CopyrightNoticeContract.target;
    // 将版权公示地址传入市场合约的构造函数
    const { MarketContract } = await ignition.deploy(MarketModule, {
        parameters: {
            Market: {
                targetAddress: copyrightNoticeContractAddress as string,
            }
        }
    });
    const [,copyrightAdmin, marketAdmin, someone] = await ethers.getSigners();

    /** 向版权公示合约中添加一个版权 */
    const testFileId = ethers.encodeBytes32String("arweave_testId");
    const workMetaInfo = {
        name: "Two Tigers",
        lyricist: "Justin Lee",
        composer: "Hallen Chou",
        releaseDate: Date.now(),
    };
    const workUid = "30045712";
    const msgHashBytes = getMsgHashBytes(["bytes32"], [testFileId]);
    const { r, s, v } = await signMessage(process.env.ARTIST_PRIVATE_KEY as string, msgHashBytes);
    const addCopyrightTx = await CopyrightNoticeContract.connect(copyrightAdmin).addCopyright(
        uint8ArrayToHexString(msgHashBytes), r, s, v, workMetaInfo, workUid
    );
    await addCopyrightTx.wait();
    // 用于发布的相关信息
    const pubInfo = {
        copyrightUid: workUid,
        holderEmail: 'Justin.Lee@qq.com',
        copyrightPrice: ethers.parseEther("1.8"),
        singleRightPrice: ethers.parseEther("0.0002"),
    }

    return { CopyrightNoticeContract, MarketContract, pubInfo, someone, workMetaInfo };
}

describe("Market", async () => {
    describe("Publish Work", async () => {
        it("Only copyright holder can publish.", async () => {
            const {MarketContract, pubInfo, someone } = await loadFixture(fixtrue);
            const publishTx = MarketContract.connect(someone).publishWork(
                pubInfo.copyrightUid,
                pubInfo.holderEmail,
                pubInfo.copyrightPrice,
                pubInfo.singleRightPrice
            );
            await expect(publishTx).to.be.revertedWith("ONLY HOLDER CAN PUBLISH.");
        });

        it("Publish Work.", async () => {
            const {MarketContract, pubInfo, someone, workMetaInfo } = await loadFixture(fixtrue);

            // 使用由私钥生成的账户时，需要手动连接到Hardhat默认的provider
            const holderWallet = new ethers.Wallet(process.env.ARTIST_PRIVATE_KEY as string, ethers.provider);
            // 给holder的账户转一点ETH
            const sendTx = await someone.sendTransaction({
                to: holderWallet.address,
                value: ethers.parseEther("1")
            });
            await sendTx.wait();
        
            // 由艺术家发布作品信息到市场
            const holderPublishTx = await MarketContract.connect(holderWallet).publishWork(
                pubInfo.copyrightUid,
                pubInfo.holderEmail,
                pubInfo.copyrightPrice,
                pubInfo.singleRightPrice
            );
            await holderPublishTx.wait();
            const workInfoOnChain = await MarketContract.onSaleWorks(1);
            const workInfoExpected = [
                pubInfo.copyrightUid,
                pubInfo.holderEmail,
                pubInfo.copyrightPrice,
                pubInfo.singleRightPrice,
                [
                    workMetaInfo.name,
                    workMetaInfo.lyricist,
                    workMetaInfo.composer,
                    workMetaInfo.releaseDate,
                ]
            ];
            expect(workInfoOnChain).to.deep.equal(workInfoExpected);
    
        })
    });
})