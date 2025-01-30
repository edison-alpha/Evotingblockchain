//TEST MINTING SBT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundToken", function () {
  let soulboundToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    const SoulboundToken = await ethers.getContractFactory("SoulboundToken");
    soulboundToken = await SoulboundToken.deploy();
    await soulboundToken.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  describe("Minting", function () {
    it("Should allow three different users to mint Soulbound tokens and show transaction details", async function () {
      console.log("\nMinting token for Address 1:");
      console.log("----------------------------");
      const mintTx1 = await soulboundToken.connect(addr1).mintSoulbound();
      const receipt1 = await mintTx1.wait();
      expect(await soulboundToken.hasMintedSoulbound(addr1.address)).to.equal(true);
      expect(await soulboundToken.isEligibleVoter(addr1.address)).to.equal(true);
      console.log("\nTransaction Details (Address 1):");
      console.log("------------------");
      console.log(`Transaction Hash: ${receipt1.transactionHash}`);
      console.log(`Block Number: ${receipt1.blockNumber}`);
      console.log(`Timestamp: ${(await ethers.provider.getBlock(receipt1.blockNumber)).timestamp}`);
      console.log(`From: ${addr1.address}`);
      console.log(`To: ${soulboundToken.address}`);
      console.log(`Gas Used: ${receipt1.gasUsed.toString()} wei`);
      console.log(`Gas Price: ${receipt1.effectiveGasPrice.toString()} wei`);
      console.log(`Total Gas Fee: ${receipt1.gasUsed.mul(receipt1.effectiveGasPrice)} wei`);
      
      console.log("\nToken Details (Address 1):");
      console.log("--------------");
      console.log(`Token ID: 0`);
      console.log(`Token URI: ${await soulboundToken.tokenURI(0)}`);
      console.log(`Owner: ${await soulboundToken.ownerOf(0)}`);

      // Mint token untuk addr2
      console.log("\nMinting token for Address 2:");
      console.log("----------------------------");
      const mintTx2 = await soulboundToken.connect(addr2).mintSoulbound();
      const receipt2 = await mintTx2.wait();

      // Verifikasi minting addr2 berhasil
      expect(await soulboundToken.hasMintedSoulbound(addr2.address)).to.equal(true);
      expect(await soulboundToken.isEligibleVoter(addr2.address)).to.equal(true);

      // Tampilkan detail transaksi addr2
      console.log("\nTransaction Details (Address 2):");
      console.log("------------------");
      console.log(`Transaction Hash: ${receipt2.transactionHash}`);
      console.log(`Block Number: ${receipt2.blockNumber}`);
      console.log(`Timestamp: ${(await ethers.provider.getBlock(receipt2.blockNumber)).timestamp}`);
      console.log(`From: ${addr2.address}`);
      console.log(`To: ${soulboundToken.address}`);
      console.log(`Gas Used: ${receipt2.gasUsed.toString()} wei`);
      console.log(`Gas Price: ${receipt2.effectiveGasPrice.toString()} wei`);
      console.log(`Total Gas Fee: ${receipt2.gasUsed.mul(receipt2.effectiveGasPrice)} wei`);
      
      console.log("\nToken Details (Address 2):");
      console.log("--------------");
      console.log(`Token ID: 1`);
      console.log(`Token URI: ${await soulboundToken.tokenURI(1)}`);
      console.log(`Owner: ${await soulboundToken.ownerOf(1)}`);

      // Mint token untuk addr3
      console.log("\nMinting token for Address 3:");
      console.log("----------------------------");
      const mintTx3 = await soulboundToken.connect(addr3).mintSoulbound();
      const receipt3 = await mintTx3.wait();

      // Verifikasi minting addr3 berhasil
      expect(await soulboundToken.hasMintedSoulbound(addr3.address)).to.equal(true);
      expect(await soulboundToken.isEligibleVoter(addr3.address)).to.equal(true);

      // Tampilkan detail transaksi addr3
      console.log("\nTransaction Details (Address 3):");
      console.log("------------------");
      console.log(`Transaction Hash: ${receipt3.transactionHash}`);
      console.log(`Block Number: ${receipt3.blockNumber}`);
      console.log(`Timestamp: ${(await ethers.provider.getBlock(receipt3.blockNumber)).timestamp}`);
      console.log(`From: ${addr3.address}`);
      console.log(`To: ${soulboundToken.address}`);
      console.log(`Gas Used: ${receipt3.gasUsed.toString()} wei`);
      console.log(`Gas Price: ${receipt3.effectiveGasPrice.toString()} wei`);
      console.log(`Total Gas Fee: ${receipt3.gasUsed.mul(receipt3.effectiveGasPrice)} wei`);
      
      console.log("\nToken Details (Address 3):");
      console.log("--------------");
      console.log(`Token ID: 2`);
      console.log(`Token URI: ${await soulboundToken.tokenURI(2)}`);
      console.log(`Owner: ${await soulboundToken.ownerOf(2)}`);

      // Verifikasi total supply
      expect(await soulboundToken.totalSupply()).to.equal(3);
    });

    it("Should prevent users from minting multiple tokens", async function () {
      // Mint pertama kali untuk addr1 (seharusnya berhasil)
      await soulboundToken.connect(addr1).mintSoulbound();

      // Mencoba mint kedua kali dengan addr1 (seharusnya gagal)
      await expect(
        soulboundToken.connect(addr1).mintSoulbound()
      ).to.be.revertedWith("You have already minted your Soulbound token");
    });

    it("Should show error alert when max supply is reached", async function () {
      const signers = await ethers.getSigners();
      const maxTestSupply = 5;

      console.log("\nTesting Max Supply Error Alert:");
      console.log("------------------------------");

      // Mint sampai max supply
      for (let i = 0; i < maxTestSupply; i++) {
        await soulboundToken.connect(signers[i]).mintSoulbound();
      }

      console.log(`\nCurrent Total Supply: ${await soulboundToken.totalSupply()}`);
      console.log("Attempting to mint when supply is maxed out...");

      // Mengubah try-catch menjadi expect untuk menangkap revert
      await expect(
        soulboundToken.connect(signers[maxTestSupply]).mintSoulbound()
      ).to.be.revertedWith("Max supply reached");

      // Verifikasi total supply tidak berubah
      expect(await soulboundToken.totalSupply()).to.equal(maxTestSupply);
      console.log(`\nFinal Total Supply: ${await soulboundToken.totalSupply()}`);
      console.log("Max supply limit successfully enforced with error alert");
    });
  });

  describe("Minting and Token Functionality Tests", function () {
    it("Should execute complete minting workflow with all verifications", async function () {
      console.log("\n=== COMPREHENSIVE MINTING TEST ===");
      
      // Test Case 1: First-time minting should succeed
      console.log("\n1. Testing first-time minting:");
      const mintTx = await soulboundToken.connect(addr1).mintSoulbound();
      const receipt = await mintTx.wait();
      
      console.log("- Minting successful for addr1");
      expect(await soulboundToken.hasMintedSoulbound(addr1.address)).to.equal(true);
      expect(await soulboundToken.isEligibleVoter(addr1.address)).to.equal(true);
      console.log("- Voter eligibility verified");
      
      // Test Case 2: Prevent double minting
      console.log("\n2. Testing double minting prevention:");
      await expect(
        soulboundToken.connect(addr1).mintSoulbound()
      ).to.be.revertedWith("You have already minted your Soulbound token");
      console.log("- Double minting successfully prevented");
      
      // Test Case 3: Transfer restriction
      console.log("\n3. Testing transfer restriction:");
      await expect(
        soulboundToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
      ).to.be.revertedWith("SBT: transfer is not allowed");
      console.log("- Transfer restriction verified");
      
      // Test Case 4: Max supply limitation
      console.log("\n4. Testing max supply limitation:");
      const signers = await ethers.getSigners();
      const maxSupply = await soulboundToken.MAX_SUPPLY();
      console.log(`- Current max supply: ${maxSupply}`);
      
      // Mint until reaching max supply (subtract 1 because we already minted one)
      for (let i = 1; i < maxSupply; i++) {
        await soulboundToken.connect(signers[i]).mintSoulbound();
        console.log(`- Minted token ${i} successfully`);
      }
      
      // Try to mint one more beyond max supply
      await expect(
        soulboundToken.connect(signers[maxSupply]).mintSoulbound()
      ).to.be.revertedWith("Max supply reached");
      console.log("- Max supply limitation successfully enforced");
      
      // Test Case 5: Verify voter eligibility for all minted tokens
      console.log("\n5. Testing voter eligibility:");
      for (let i = 0; i < maxSupply; i++) {
        const isEligible = await soulboundToken.isEligibleVoter(signers[i].address);
        expect(isEligible).to.equal(true);
        console.log(`- Address ${i} verified as eligible voter`);
      }
      
      // Final verification
      console.log("\n=== FINAL VERIFICATION ===");
      const finalSupply = await soulboundToken.totalSupply();
      console.log(`- Final total supply: ${finalSupply}`);
      expect(finalSupply).to.equal(maxSupply);
      console.log("All tests completed successfully!");
    });
  });

  describe("Minting and Transfer Testing Workflow", function () {
    it("Should execute step-by-step minting and transfer testing", async function () {
      // TAHAP 1: First-time minting
      console.log("\n=== TAHAP 1: MINTING PERTAMA KALI ===");
      console.log(`Address Pemilih: ${addr1.address}`);
      
      const mintTx = await soulboundToken.connect(addr1).mintSoulbound();
      const receipt = await mintTx.wait();
      
      console.log("\nDetail Transaksi Minting:");
      console.log("-------------------------");
      console.log(`Transaction Hash: ${receipt.transactionHash}`);
      console.log(`Block Number: ${receipt.blockNumber}`);
      console.log(`From: ${addr1.address}`);
      console.log(`To: ${soulboundToken.address}`);
      console.log(`Gas Used: ${receipt.gasUsed.toString()} wei`);
      
      // Verify minting success
      expect(await soulboundToken.hasMintedSoulbound(addr1.address)).to.equal(true);
      console.log("\nStatus: Minting berhasil ✅");
      
      // TAHAP 2: Attempt second minting
      console.log("\n=== TAHAP 2: MENCOBA MINTING KEDUA KALI ===");
      console.log(`Address Pemilih: ${addr1.address}`);
      console.log("Mencoba melakukan minting kedua...");
      
      try {
        await soulboundToken.connect(addr1).mintSoulbound();
      } catch (error) {
        console.log("\nAlert Error:");
        console.log("------------");
        console.log("❌ You have already minted your Soulbound token");
      }
      
      // Verify with expect
      await expect(
        soulboundToken.connect(addr1).mintSoulbound()
      ).to.be.revertedWith("You have already minted your Soulbound token");
      
      // TAHAP 3: Attempt transfer
      console.log("\n=== TAHAP 3: MENCOBA TRANSFER SBT ===");
      console.log("Detail Address:");
      console.log("--------------");
      console.log(`Pemilik SBT (From): ${addr1.address}`);
      console.log(`Penerima (To): ${addr2.address}`);
      console.log(`Token ID: 0`);
      
      try {
        await soulboundToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      } catch (error) {
        console.log("\nAlert Error:");
        console.log("------------");
        console.log("❌ SBT: transfer is not allowed");
      }
      
      // Verify with expect
      await expect(
        soulboundToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
      ).to.be.revertedWith("SBT: transfer is not allowed");
      
      // Final verification
      console.log("\n=== HASIL AKHIR PENGUJIAN ===");
      console.log(`Owner of Token ID 0: ${await soulboundToken.ownerOf(0)}`);
      console.log(`Total Supply: ${await soulboundToken.totalSupply()}`);
      console.log("Semua pengujian selesai! ✅");
    });
  });
});