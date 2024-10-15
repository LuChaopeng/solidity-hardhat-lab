import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule("Market", (m) => {
    // use third account as market's administrator
    const account = m.getAccount(2);
    // todo: 下面的观点待验证
    // 名称约束： ignition module中，m.contrat的第二个参数是构造函数参数列表。如果这里标明了参数名称，后面在测试中部署时也需要使用同样的名称进行传递；如果这里没有标明，测试中部署时也是可以正常传入参数的，名称可以自由指定。最好预先指定。
    const MarketContract = m.contract("Market", [m.getParameter("targetAddress")], { from: account });
    return { MarketContract };
}) 