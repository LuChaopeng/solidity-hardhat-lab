import { ethers, ignition } from "hardhat";
import CopyrightNoticeModule from "../ignition/modules/CopyrightNotice";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { getMsgHashBytes, signMessage } from "../utils/signature";
import { uint8ArrayToHexString } from "../utils/util";

const fixtrue = async () => {
    const { CopyrightNoticeContract } = await ignition.deploy(CopyrightNoticeModule);
    return { CopyrightNoticeContract };
}

describe("Institution duty", async () => {
    it("Add copyright to the copyright list.", async () => {        
        /** 版权信息  */
        // Arweave的文件ID类型为bytes32
        const testFileId = ethers.encodeBytes32String("arweave_testId");
        const workMetaInfo = {
            name: "Two Tigers",
            lyricist: "Justin Lee",
            composer: "Hallen Chou",
            releaseDate: Date.now(),
        }
        const workUid = 30045712;

        /** 验证签名为有效签名 */
        // 这里的类型填写Solidity对应的类型
        const msgHashBytes = getMsgHashBytes(["bytes32"], [testFileId]);
        const { signature, r, s, v } = await signMessage(process.env.ARTIST_PRIVATE_KEY as string, msgHashBytes);
        const address = ethers.verifyMessage(msgHashBytes, signature);

        expect(address).to.equals(process.env.ARTIST_ADDRESS);
        
        // 添加信息
        const { CopyrightNoticeContract } = await loadFixture(fixtrue);
        const [,admin] = await ethers.getSigners();
        const addCopyrightTx = await CopyrightNoticeContract.connect(admin).addCopyright(
            uint8ArrayToHexString(msgHashBytes), r, s, v, workMetaInfo, workUid
        );

        await addCopyrightTx.wait();

        // 从链上获取数据与预期数据比较
        const copyrightFromChain = await CopyrightNoticeContract.copyrightList(workUid);
        const expectedData = [
            process.env.ARTIST_ADDRESS,
            uint8ArrayToHexString(msgHashBytes),
            r,
            s,
            v,
            [workMetaInfo.name, workMetaInfo.lyricist, workMetaInfo.composer, workMetaInfo.releaseDate],
        ];
        expect(copyrightFromChain).to.deep.equal(expectedData);
    })
})