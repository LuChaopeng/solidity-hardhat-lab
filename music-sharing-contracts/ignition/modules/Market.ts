import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule("Market", (m) => {
    // use third account as market's administrator
    const account = m.getAccount(2);
    // 若构造函数需参数，必须在m.contract()中提供这些参数。如果暂时不确定参数值，可使用m.getParameter声明参数的占位符，如下
    const MarketContract = m.contract("Market", [m.getParameter("targetAddress")], { from: account });
    return { MarketContract };
}) 