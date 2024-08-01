import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import env from "dotenv";

env.config();

task("accounts", "Prints account(s)")
  .addOptionalParam("index", "Index of accounts array.")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    if (taskArgs.index === undefined) {
      for (const account of accounts) {
        console.log(account.address);
      };
      return;
    }
    const index = Number(taskArgs.index);
    if (!Number.isInteger(index) || index < 0) {
      console.log('Error: Invalid index parameter.');
      return;
    }
    if (index >= accounts.length) {
      console.log('Error: Index is greater than the number of accounts.');
      return;
    }
    console.log(accounts[taskArgs.index].address);
  });


const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;
