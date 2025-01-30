const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting System Sepolia Tests", function() {
  // Meningkatkan timeout karena Sepolia lebih lambat dari localhost
  this.timeout(100000);

  let SoulboundToken;
  let OnlineVoting;
  let soulboundToken;
  let onlineVoting;
  let owner;
  let addr1;
  let addr2;
  let initialBalance;

  // Fungsi untuk menambah delay dalam pengujian
  async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  before(async function() {
    console.log("Starting deployment on Sepolia...");
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Log saldo awal
    initialBalance = await owner.getBalance();
    console.log("Initial balance:", ethers.utils.formatEther(initialBalance), "ETH");
  });

  it("Should deploy SoulboundToken contract", async function() {
    const startTime = new Date().getTime();
    
    SoulboundToken = await ethers.getContractFactory("SoulboundToken", owner);
    soulboundToken = await SoulboundToken.deploy();
    await soulboundToken.deployed();
    
    const endTime = new Date().getTime();
    console.log("SoulboundToken deployed to:", soulboundToken.address);
    console.log("Deployment time:", endTime - startTime, "ms");
    
    // Verifikasi kontrak terdeployment
    expect(await soulboundToken.name()).to.equal("Vote ID");
  });

  it("Should deploy OnlineVoting contract", async function() {
    const startTime = new Date().getTime();
    
    OnlineVoting = await ethers.getContractFactory("OnlineVoting", owner);
    onlineVoting = await OnlineVoting.deploy(soulboundToken.address);
    await onlineVoting.deployed();
    
    const endTime = new Date().getTime();
    console.log("OnlineVoting deployed to:", onlineVoting.address);
    console.log("Deployment time:", endTime - startTime, "ms");
    
    // Verifikasi owner
    expect(await onlineVoting.getOwner()).to.equal(owner.address);
  });

  it("Should add candidate first", async function() {
    const startTime = new Date().getTime();
    
    const tx = await onlineVoting.connect(owner).addCandidate(
      "John Doe",
      35,
      "Party A",
      "logo_a.png",
      "candidate_a.png"
    );
    const receipt = await tx.wait();
    
    const endTime = new Date().getTime();
    console.log("Add candidate time:", endTime - startTime, "ms");
    console.log("Gas used for adding candidate:", receipt.gasUsed.toString());
    
    const candidates = await onlineVoting.getCandidate();
    expect(candidates[0].candidate_name).to.equal("John Doe");
  });

  it("Should mint SoulboundToken", async function() {
    const startTime = new Date().getTime();
    
    // Menggunakan addr1 dengan explicit connection
    const mintTx = await soulboundToken.connect(addr1).mintSoulbound();
    const receipt = await mintTx.wait();
    
    const endTime = new Date().getTime();
    console.log("Minting time:", endTime - startTime, "ms");
    console.log("Gas used for minting:", receipt.gasUsed.toString());
    
    // Verifikasi mint berhasil
    const hasMinted = await soulboundToken.hasMintedSoulbound(addr1.address);
    expect(hasMinted).to.be.true;
  });

  it("Should cast vote", async function() {
    const startTime = new Date().getTime();
    
    // Pastikan voter sudah punya token dan eligible
    expect(await soulboundToken.isEligibleVoter(addr1.address)).to.be.true;
    
    // Voting menggunakan addr1
    const voteTx = await onlineVoting.connect(addr1).addVote(0);
    const receipt = await voteTx.wait();
    
    const endTime = new Date().getTime();
    console.log("Voting time:", endTime - startTime, "ms");
    console.log("Gas used for voting:", receipt.gasUsed.toString());
    
    const candidates = await onlineVoting.getCandidate();
    expect(candidates[0].candidate_voteCount).to.equal(1);
  });

  it("Should calculate and get winner", async function() {
    const startTime = new Date().getTime();
    
    // Set voter result access
    await onlineVoting.connect(owner).setVoterResultAccess(true);
    
    // Find winner
    await onlineVoting.connect(owner).findMaxVoteCandidate();
    
    // Tunggu beberapa saat untuk memastikan status diperbarui
    await ethers.provider.waitForTransaction((await onlineVoting.connect(owner).findMaxVoteCandidate()).hash);
    
    const endTime = new Date().getTime();
    console.log("Winner calculation time:", endTime - startTime, "ms");
    
    // Get winner
    const winner = await onlineVoting.getWinner();
    expect(winner.candidate_voteCount).to.equal(1);
  });

  after(async function() {
    const finalBalance = await owner.getBalance();
    console.log("Final balance:", ethers.utils.formatEther(finalBalance), "ETH");
    console.log("Total ETH spent:", 
      ethers.utils.formatEther(initialBalance.sub(finalBalance)), "ETH");
  });
});
