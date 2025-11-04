import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: 30000000000,
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};