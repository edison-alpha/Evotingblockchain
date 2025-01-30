// test/SoulboundToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundToken", function () {
    let SoulboundToken;
    let soulboundToken;
    let owner;
    let addr1;
    const METADATA_URI = "https://gateway.pinata.cloud/ipfs/QmZ7PYp5QGiwXFJsYfaSDv3zKY543qTvdP8F9siVXi3rzx";
    const MAX_SUPPLY = 1;

    beforeEach(async function () {
        SoulboundToken = await ethers.getContractFactory("SoulboundToken");
        [owner, addr1] = await ethers.getSigners();
        soulboundToken = await SoulboundToken.deploy();
        await soulboundToken.deployed();
    });

    it("Test Case 1: Token berhasil dicetak", async function () {
        // Setup: Panggil mintSoulbound dari akun baru
        await soulboundToken.connect(addr1).mintSoulbound();

        // Verifikasi: Pemilik token adalah akun tersebut
        const ownerOfToken = await soulboundToken.ownerOf(0);
        expect(ownerOfToken).to.equal(addr1.address);

        // Verifikasi: Token URI sesuai dengan METADATA_URI
        const tokenURI = await soulboundToken.tokenURI(0);
        expect(tokenURI).to.equal(METADATA_URI);

        // Verifikasi: Status hasMinted menjadi true
        const hasMinted = await soulboundToken.hasMintedSoulbound(addr1.address);
        expect(hasMinted).to.be.true;

        // Verifikasi: Status eligibleVoter menjadi true
        const isEligibleVoter = await soulboundToken.isEligibleVoter(addr1.address);
        expect(isEligibleVoter).to.be.true;
    });

    it("Test Case 2: Gagal mencetak token jika sudah pernah mint", async function () {
        // Setup: Panggil mintSoulbound dua kali dari akun yang sama
        await soulboundToken.connect(addr1).mintSoulbound();

        // Verifikasi: Transaksi kedua gagal dengan pesan error
        await expect(soulboundToken.connect(addr1).mintSoulbound())
            .to.be.revertedWith("You have already minted your Soulbound token");
    });

    it("Test Case 3: Gagal mencetak jika mencapai MAX_SUPPLY", async function () {
        // Setup: Mint hingga batas MAX_SUPPLY tercapai
        for (let i = 0; i < MAX_SUPPLY; i++) {
            await soulboundToken.connect(addr1).mintSoulbound();
        }

        // Verifikasi: Mint berikutnya gagal dengan pesan error
        await expect(soulboundToken.connect(addr1).mintSoulbound())
            .to.be.revertedWith("Max supply reached");
    });
});