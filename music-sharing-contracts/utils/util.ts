/** 将uint8Array类型转为16进制字符串 */
export const uint8ArrayToHexString = (uint8Array: Uint8Array) => {
  return '0x' + Array.from(uint8Array)
  .map(byte => byte.toString(16).padStart(2, '0'))  // 将每个字节转为两位的16进制
  .join('');
}