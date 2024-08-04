const hre = require("hardhat");

async function main() {
  // Deploy SoulboundToken contract first
  const SoulboundToken = await hre.ethers.getContractFactory("SoulboundToken");
  const soulboundToken = await SoulboundToken.deploy();
  await soulboundToken.deployed();
  console.log(`SoulboundToken deployed to ${soulboundToken.address}`);

  // Deploy OnlineVoting contract with the address of SoulboundToken
  const OnlineVoting = await hre.ethers.getContractFactory("OnlineVoting");
  const onlineVoting = await OnlineVoting.deploy(soulboundToken.address);
  await onlineVoting.deployed();
  console.log(`OnlineVoting deployed to ${onlineVoting.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
