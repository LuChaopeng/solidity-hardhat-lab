import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SuperModule",  (m) => {
    const superC = m.contract("Multifunctional",["SuperC"]);
    return { superC }
});