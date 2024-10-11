import { ethers } from "hardhat";

/**
 * 将消息哈希处理并返回字节数组
 */
export function getMsgHashBytes(msgTypeArray: string[], msgDataArray: any[]) {
    // 打包消息并计算哈希
    const messageHash = ethers.solidityPackedKeccak256(msgTypeArray, msgDataArray);
    // 将哈希值转为字节数组，v6: getBytes v5: utils.arrayify
    return ethers.getBytes(messageHash)
}




/**
 * 对消息进行签名并返回签名和 R、S、V 字段
 */
export async function signMessage(privateKey: string, msgHashBytes: Uint8Array) {
    const wallet = new ethers.Wallet(privateKey);
    // 使用钱包签名消息
    const signature = await wallet.signMessage(msgHashBytes);
    // 拆分签名为 R、S、V，v6：Signature.from v5：splitSignature
    const { r, s, v } = ethers.Signature.from(signature);

    // 返回签名和R、S、V 字段
    return { signature, r, s, v };
}