const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundToken Testing", function () {
  let soulboundToken;
  let owner;
  let voter1;
  let voter2;

  beforeEach(async function () {
    const SoulboundToken = await ethers.getContractFactory("SoulboundToken");
    soulboundToken = await SoulboundToken.deploy();
    await soulboundToken.deployed();

    [owner, voter1, voter2] = await ethers.getSigners();
  });

  describe("Tahap 1: Minting SBT Pertama Kali", function () {
    it("Voter dapat melakukan mint SBT", async function () {
      console.log("\n========= TAHAP 1: MINTING SBT PERTAMA KALI =========");
      console.log("Token Name:", await soulboundToken.name());
      console.log("Token Symbol:", await soulboundToken.symbol());
      
      console.log("\n👉 Address", voter1.address, "melakukan minting SBT...");
      
      // Mendapatkan timestamp sebelum transaksi
      const block = await ethers.provider.getBlock('latest');
      const timestamp = new Date(block.timestamp * 1000);
      
      console.log("\nDetail Transaksi Minting:");
      console.log("Timestamp:", timestamp.toLocaleString());
      console.log("From (Voter):", voter1.address);
      console.log("To (Contract):", soulboundToken.address);

      // Melakukan minting
      const mintTx = await soulboundToken.connect(voter1).mintSoulbound();
      const receipt = await mintTx.wait();

      // Menghitung gas fee dalam ETH
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const gasFeeEth = ethers.utils.formatEther(gasUsed.mul(gasPrice));
      
      console.log("\nDetail Gas:");
      console.log("Transaction Hash:", receipt.transactionHash);
      console.log("Gas Used:", gasUsed.toString(), "units");
      console.log("Gas Price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
      console.log("Total Gas Fee:", gasFeeEth, "ETH");

      // Mendapatkan detail token
      const tokenId = 0;
      const tokenURI = await soulboundToken.tokenURI(tokenId);
      
      console.log("\nDetail Token:");
      console.log("Token ID:", tokenId);
      console.log("Token URI:", tokenURI);
      console.log("Owner:", await soulboundToken.ownerOf(tokenId));

      // Verifikasi status voter
      const isEligible = await soulboundToken.isEligibleVoter(voter1.address);
      const hasMinted = await soulboundToken.hasMinted(voter1.address);
      
      console.log("\nStatus Voter:");
      console.log("Is Eligible Voter:", isEligible);
      console.log("Has Minted:", hasMinted);

      // Assertions
      expect(await soulboundToken.ownerOf(tokenId)).to.equal(voter1.address);
      expect(hasMinted).to.be.true;
      expect(isEligible).to.be.true;

      console.log("\n✨ Minting berhasil! SBT telah diterbitkan ke address", voter1.address, "✨");
    });
  });

  describe("Tahap 2: Mencoba Minting Kedua Kali", function () {
    it("gagal ketika voter mencoba mint kedua kali", async function () {
      console.log("\n========= TAHAP 2: MENCOBA MINTING KEDUA KALI =========");
      
      console.log("\nAddress", voter1.address, "mencoba melakukan minting kedua...");
      
      try {
        await soulboundToken.connect(voter1).mintSoulbound();
      } catch (error) {
        console.log("\n❌ Minting kedua gagal!");
        console.log("⛔ Error Message:", error.message);
      }
    });
  });

  describe("Tahap 3: Mencoba Transfer SBT", function () {
    it("gagal ketika mencoba transfer SBT", async function () {
      console.log("\n========= TAHAP 3: MENCOBA TRANSFER SBT =========");
      
      console.log("\nAddress", voter1.address, "melakukan minting SBT...");
      await soulboundToken.connect(voter1).mintSoulbound();
      
      console.log("\nAddress", voter1.address, "mencoba mentransfer SBT ke", voter2.address, "...");
      
      try {
        await soulboundToken.connect(voter1).transferFrom(voter1.address, voter2.address, 0);
      } catch (error) {
        console.log("\n❌ Transfer gagal!");
        console.log("⛔ Error Message:", error.message);
      }
    });
  });
});