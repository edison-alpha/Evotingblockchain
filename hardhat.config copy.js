require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-waffle');

require("dotenv").config();
module.exports = {
  solidity: "0.8.1",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  paths : {
    artifacts: "./client/artifacts",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  }
};