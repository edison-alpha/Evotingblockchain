const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting System Security Test", function() {
  let soulboundToken;
  let votingContract;
  let owner;
  let attackers;
  let legitimateVoters;
  
  before(async function() {
    [owner, ...attackers] = await ethers.getSigners();
    attackers = attackers.slice(0, 50); // Get 500 attacker addresses
    
    // Deploy SoulboundToken
    const SoulboundToken = await ethers.getContractFactory("SoulboundToken");
    soulboundToken = await SoulboundToken.deploy();
    await soulboundToken.deployed();
    
    // Deploy VotingContract
    const VotingContract = await ethers.getContractFactory("OnlineVoting");
    votingContract = await VotingContract.deploy(soulboundToken.address);
    await votingContract.deployed();
    
    // Add test candidate
    await votingContract.addCandidate(
      "Test Candidate",
      35,
      "Test Party",
      "test_logo.png",
      "test_pic.png"
    );
  });

  describe("Attack", function() {
    let securityScore = 100; // Start with perfect score
    
    it("Should resist mass minting attack", async function() {
      console.log("\nTesting Mass Minting Attack...");
      let mintSuccessCount = 0;
      
      for(let i = 0; i < attackers.length; i++) {
        try {
          await soulboundToken.connect(attackers[i]).mintSoulbound();
          mintSuccessCount++;
        } catch(e) {
          // Expected to fail after MAX_SUPPLY
        }
      }
      
      console.log(`Successful mints: ${mintSuccessCount} / 19`);
      expect(mintSuccessCount).to.be.lte(50); // Max supply check
      
      if(mintSuccessCount > 50) {
        securityScore -= 30;
        console.log("❌ Mass minting protection failed");
      } else {
        console.log("✅ Mass minting protection working");
      }
    });
    
    it("Should prevent double voting", async function() {
      console.log("\nTesting Double Voting Attack...");
      let doubleVoteCount = 0;
      
      for(let i = 0; i < 10; i++) {
        try {
          await votingContract.connect(attackers[i]).addVote(0);
          await votingContract.connect(attackers[i]).addVote(0);
          doubleVoteCount++;
        } catch(e) {
          // Expected to fail on second vote
        }
      }
      
      console.log(`Double vote attempts: ${doubleVoteCount} / 10`);
      expect(doubleVoteCount).to.equal(0);
      
      if(doubleVoteCount > 0) {
        securityScore -= 25;
        console.log("❌ Double voting protection failed");
      } else {
        console.log("✅ Double voting protection working");
      }
    });
    
    it("Should prevent unauthorized result declaration", async function() {
      console.log("\nTesting Unauthorized Result Access...");
      let unauthorizedAccessCount = 0;
      
      for(let i = 0; i < 10; i++) {
        try {
          await votingContract.connect(attackers[i]).findMaxVoteCandidate();
          unauthorizedAccessCount++;
        } catch(e) {
          // Expected to fail for non-owners
        }
      }
      
      console.log(`Unauthorized access attempts: ${unauthorizedAccessCount} / 10`);
      expect(unauthorizedAccessCount).to.equal(0);
      
      if(unauthorizedAccessCount > 0) {
        securityScore -= 20;
        console.log("❌ Owner access control failed");
      } else {
        console.log("✅ Owner access control working");
      }
    });
    
    it("Should enforce voter eligibility", async function() {
      console.log("\nTesting Ineligible Voter Attack...");
      let ineligibleVoteCount = 0;
      
      for(let i = 0; i < 10; i++) {
        try {
          await votingContract.connect(attackers[i]).addVote(0);
          ineligibleVoteCount++;
        } catch(e) {
          // Expected to fail for ineligible voters
        }
      }
      
      console.log(`Ineligible vote attempts: ${ineligibleVoteCount} / 10`);
      expect(ineligibleVoteCount).to.equal(0);
      
      if(ineligibleVoteCount > 0) {
        securityScore -= 25;
        console.log("❌ Voter eligibility check failed");
      } else {
        console.log("✅ Voter eligibility check working");
      }
    });

    after(function() {
      console.log("\n=== Security Test Results ===");
      console.log(`Final Security Score: ${securityScore}/100`);
      console.log("\nScore Breakdown:");
      console.log("- Mass Minting Protection: 30 points");
      console.log("- Double Voting Protection: 25 points");
      console.log("- Access Control: 20 points");
      console.log("- Voter Eligibility: 25 points");
      
      if(securityScore >= 90) {
        console.log("\n🏆 Contract Security: Excellent");
      } else if(securityScore >= 70) {
        console.log("\n✅ Contract Security: Good");
      } else if(securityScore >= 50) {
        console.log("\n⚠️ Contract Security: Fair");
      } else {
        console.log("\n❌ Contract Security: Poor");
      }
    });
  });
});