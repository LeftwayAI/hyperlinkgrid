import { HardhatUserConfig } from "hardhat/config"
import hardhatVerify from "@nomicfoundation/hardhat-verify"
import hardhatEthers from "@nomicfoundation/hardhat-ethers"
import * as dotenv from "dotenv"

dotenv.config()

const config: HardhatUserConfig = {
  plugins: [hardhatVerify, hardhatEthers],
  solidity: "0.8.24",
  networks: {
    "base-sepolia": {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      "base-sepolia": process.env.BASESCAN_API_KEY || "PLACEHOLDER_KEY",
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
}

export default config
