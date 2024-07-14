import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const PRIVATE_KEY_W2 = vars.get("SEPOLIA_PRIVATE_KEY");
// Hardhat指南中，将API-key和私钥存到vars.json文件中
// 这一操作有风险，一旦机器被入侵，私钥就可能泄露
// 故后续操作中，务必隔离真实账户，将领到的SETH发送到专门用来测试的账户中，不要向测试账户转入ETH！有币账户的的私钥隔离存放！

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY_W2],
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    }
  },
};

export default config;
