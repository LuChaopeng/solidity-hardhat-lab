import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ImportModule",  (m) => {
    const account = m.getAccount(1);
    const ImportContract = m.contract("Import",[], {from: account});
    return { ImportContract }
});
