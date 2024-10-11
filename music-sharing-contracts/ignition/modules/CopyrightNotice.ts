import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule("CopyrightNotice", (m) => {
    // use second account as institution's administrator
    const account = m.getAccount(1);
    const CopyrightNoticeContract = m.contract("CopyrightNotice", [], { from: account });
    return { CopyrightNoticeContract };
}) 