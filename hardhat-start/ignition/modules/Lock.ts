import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = 1_000_000_000n;

const LockModule = buildModule("LockModule", (m) => {
  /**
   * 0712
   * Hardhat的runner指南中没有讲述这里的细节，通过ignition和deploy章节以及询问GPT，尝试给出说明：
   * unlockTime使用m.getParameter(parameterName,defaultValue)的形式获取参数
   * 并使用npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost命令以部署合约
   * 1. 若m.contract的第二个参数，即合约参数列表中的参数不匹配合约构造函数的参数，ignition也会正常执行，但是执行line 10命令部署时会报错，参数缺失
   * 2. 若直接在m.contract内写具体的值而非m.getParamter的返回结果（ModuleParameterRuntimeValue），一样可以正常部署
   * 3. 如果m.getParameter时未指定默认值，直接执行line 10命令，会报错提示参数缺失；但是其实ignition还是正常执行的。
   *    想要在不指定默认值的情况下仍能顺利部署，要在部署时指定参数。使用下面的命令：
   *    npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost --parameters
   *    
   *    不搞了，花了近一个小时，最终没有成功在ignition deploy时给到参数，暂停研究，后续再看
   */

  /**
   * 0714
   * 部署到外部网络命令：npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia --deployment-id sepolia-deployment
   * 验证合约：npx hardhat ignition verify sepolia-deployment   【这里会直接将合约源码发布到sepolia浏览器上，如sepolia.etherscan】
   */
  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  return { lock };
});

export default LockModule;
