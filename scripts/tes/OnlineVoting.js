const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pengujian Alur Utama Sistem Voting", function () {
    let SoulboundToken;
    let OnlineVoting;
    let soulboundToken;
    let onlineVoting;
    let owner;
    let voters = [];
    let nonVoter;

    // Langkah 1: Deploy Kontrak
    it("Langkah 1: Melakukan deploy kedua kontrak", async function () {
        console.log("\n=== Langkah 1: Deploy Kontrak ===");
        
        const signers = await ethers.getSigners();
        owner = signers[0];
        // Mengambil 10 voter dari signers
        for(let i = 1; i <= 3; i++) {
            voters.push(signers[i]);
        }
        nonVoter = signers[4];

        console.log("\nadmin Address:", owner.address);
        voters.forEach((voter, index) => {
            console.log(`Voter Address ${index + 1}:`, voter.address);
        });
        console.log("Address non-voter:", nonVoter.address);

        console.log("\nMelakukan deploy kontrak SoulboundToken...");
        SoulboundToken = await ethers.getContractFactory("SoulboundToken");
        soulboundToken = await SoulboundToken.deploy();
        await soulboundToken.deployed();
        const sbtReceipt = await soulboundToken.deployTransaction.wait();
        console.log("Kontrak SoulboundToken di-deploy ke alamat:", soulboundToken.address);
        console.log("Block Number:", sbtReceipt.blockNumber);
        
        console.log("\nMelakukan deploy kontrak OnlineVoting...");
        OnlineVoting = await ethers.getContractFactory("OnlineVoting");
        onlineVoting = await OnlineVoting.deploy(soulboundToken.address);
        await onlineVoting.deployed();
        const ovReceipt = await onlineVoting.deployTransaction.wait();
        console.log("Kontrak OnlineVoting di-deploy ke alamat:", onlineVoting.address);
        console.log("Block Number:", ovReceipt.blockNumber);

        expect(await onlineVoting.getOwner()).to.equal(owner.address);
    });

    // Langkah 2: Menambahkan Kandidat
    it("Langkah 2: Menambahkan kandidat oleh admin", async function () {
        console.log("\n=== Langkah 2: Penambahan Kandidat ===");
        
        // Menambahkan kandidat pertama
        console.log("\nMenambahkan kandidat pertama...");
        let tx1 = await onlineVoting.connect(owner).addCandidate(
            "Bayu Mukti W",
            20533324,
            "Teknik Informatika",
            "partyA_logo.png",
            "bayu.png"
        );
        let receipt1 = await tx1.wait();
        const gasUsedEth1 = ethers.utils.formatEther(receipt1.gasUsed.mul(tx1.gasPrice));
        console.log("Hash Transaksi:", receipt1.transactionHash);
        console.log("Block Number:", receipt1.blockNumber);
        console.log("Gas yang digunakan:", gasUsedEth1, "ETH");

        // Menambahkan kandidat kedua
        console.log("\nMenambahkan kandidat kedua...");
        let tx2 = await onlineVoting.connect(owner).addCandidate(
            "Rizal Wahyu P",
            19533127,
            "Teknik Informatika",
            "partyB_logo.png",
            "rijal.png"
        );
        let receipt2 = await tx2.wait();
        const gasUsedEth2 = ethers.utils.formatEther(receipt2.gasUsed.mul(tx2.gasPrice));
        console.log("Hash Transaksi:", receipt2.transactionHash);
        console.log("Block Number:", receipt2.blockNumber);
        console.log("Gas yang digunakan:", gasUsedEth2, "ETH");

        // Menambahkan kandidat ketiga
        console.log("\nMenambahkan kandidat ketiga...");
        let tx3 = await onlineVoting.connect(owner).addCandidate(
            "Agil Salahudin",
            20533310,
            "Teknik Informatika",
            "partyC_logo.png",
            "bobWilson.png"
        );
        let receipt3 = await tx3.wait();
        const gasUsedEth3 = ethers.utils.formatEther(receipt3.gasUsed.mul(tx3.gasPrice));
        console.log("Hash Transaksi:", receipt3.transactionHash);
        console.log("Block Number:", receipt3.blockNumber);
        console.log("Gas yang digunakan:", gasUsedEth3, "ETH");

        const candidates = await onlineVoting.getCandidate();
        console.log("\nDaftar Kandidat Terdaftar:");
        candidates.forEach((candidate, index) => {
            console.log(`${index + 1}. ${candidate.candidate_name} (${candidate.candidate_partyName})`);
        });
        expect(candidates.length).to.equal(3);
    });

    // Langkah 3: Mencetak SBT
    it("Langkah 3: Mencetak token SBT untuk pemilih yang memenuhi syarat", async function () {
        console.log("\n=== Pencetakan Token SBT ===");
        
        const startTimeMinting = Date.now();
        
        // Test Case 1: Minting SBT Pertama Kali
        console.log("\nToken Name:", await soulboundToken.name());
        console.log("Token Symbol:", await soulboundToken.symbol());
        
        for(let i = 0; i < voters.length; i++) {
            const startTimeIndividualMint = Date.now();
            console.log(`\n👉 Voter ${i + 1} (${voters[i].address}) melakukan minting SBT...`);
            
            // Mendapatkan timestamp sebelum transaksi
            const block = await ethers.provider.getBlock('latest');
            const timestamp = new Date(block.timestamp * 1000);
            
            console.log("\nDetail Transaksi Minting:");
            console.log("Timestamp:", timestamp.toLocaleString());
            console.log("From (Voter):", voters[i].address);
            console.log("To (Contract):", soulboundToken.address);

            // Melakukan minting
            const mintTx = await soulboundToken.connect(voters[i]).mintSoulbound();
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
            console.log("Block Number:", receipt.blockNumber);

            // Mendapatkan detail token
            const tokenId = i;
            const tokenURI = await soulboundToken.tokenURI(tokenId);
            
            console.log("\nDetail Token:");
            console.log("Token ID:", tokenId);
            console.log("Token URI:", tokenURI);
            console.log("Owner:", await soulboundToken.ownerOf(tokenId));

            // Verifikasi status voter
            const isEligible = await soulboundToken.isEligibleVoter(voters[i].address);
            const hasMinted = await soulboundToken.hasMinted(voters[i].address);
            
            console.log("\nStatus Voter:");
            console.log("Is Eligible Voter:", isEligible);
            console.log("Has Minted:", hasMinted);

            const endTimeIndividualMint = Date.now();
            console.log(`\nWaktu yang dibutuhkan untuk minting Voter ${i + 1}: ${(endTimeIndividualMint - startTimeIndividualMint) / 1000} detik`);
            console.log("\n✨ Minting berhasil! SBT telah diterbitkan ke Voter", i + 1, "✨");
        }

        // Test Case 2: Mencoba Minting Kedua Kali
        console.log("\n=== Mencoba Minting Kedua Kali ===");
        await expect(
            soulboundToken.connect(voters[0]).mintSoulbound()
        ).to.be.revertedWith("Already minted");

        // Test Case 3: Mencoba Transfer SBT
        console.log("\n=== Mencoba Transfer SBT ===");
        await expect(
            soulboundToken.connect(voters[0]).transferFrom(voters[0].address, voters[1].address, 0)
        ).to.be.revertedWith("SBT: transfer is not allowed");

        // Verifikasi akhir
        for(let voter of voters) {
            expect(await soulboundToken.isEligibleVoter(voter.address)).to.be.true;
        }
        expect(await soulboundToken.isEligibleVoter(nonVoter.address)).to.be.false;

        const endTimeMinting = Date.now();
        console.log(`\nTotal waktu yang dibutuhkan untuk seluruh proses minting: ${(endTimeMinting - startTimeMinting) / 1000} detik`);
    });

    // Langkah 4: Proses Pemungutan Suara
    it("Langkah 4: Memastikan hanya pemegang SBT yang bisa memilih", async function () {
        console.log("\n=== Proses Pemungutan Suara ===");
        
        const startTimeVoting = Date.now();
        
        // Voting dari semua pemilih
        for(let i = 0; i < voters.length; i++) {
            const startTimeIndividualVote = Date.now();
            const candidateChoice = i < 4 ? 0 : (i < 7 ? 1 : 2);
            
            // Check if the voter is eligible before voting
            const isEligible = await soulboundToken.isEligibleVoter(voters[i].address);
            console.log(`\n👉 Memeriksa eligibility untuk Pemilih ${i + 1} (${voters[i].address})...`);
            
            if (!isEligible) {
                console.log(`❌ Pemilih ${i + 1} (${voters[i].address}) tidak eligible untuk memilih.`);
                continue; // Skip to the next voter if not eligible
            } else {
                console.log(`✅ Pemilih ${i + 1} (${voters[i].address}) eligible untuk memilih.`);
            }

            console.log(`\nPemilih ${i + 1} melakukan voting`);
            let voteTx = await onlineVoting.connect(voters[i]).addVote(candidateChoice);
            let receipt = await voteTx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            const gasUsedEth = ethers.utils.formatEther(receipt.gasUsed.mul(voteTx.gasPrice));
            
            console.log("Hash Transaksi:", receipt.transactionHash);
            console.log("Block Number:", receipt.blockNumber);
            console.log("Timestamp:", new Date(block.timestamp * 1000).toLocaleString());
            console.log("From:", voters[i].address);
            console.log("To:", onlineVoting.address);
            console.log("Gas yang digunakan:", receipt.gasUsed.toString(), "units");
            console.log("Gas Price:", ethers.utils.formatUnits(voteTx.gasPrice, "gwei"), "gwei");
            console.log("Total Gas Fee:", gasUsedEth, "ETH");

            const endTimeIndividualVote = Date.now();
            console.log(`Waktu yang dibutuhkan untuk voting Pemilih ${i + 1}: ${(endTimeIndividualVote - startTimeIndividualVote) / 1000} detik`);
            console.log("\x1b[32m%s\x1b[0m", `✓ Pemilih ${i + 1} berhasil melakukan voting!`);
        }

        // Mencoba voting dari non-pemilih (seharusnya gagal)
        console.log("\nPercobaan voting dari non-pemilih...");
        await expect(
            onlineVoting.connect(nonVoter).addVote(0)
        ).to.be.revertedWith("You are not eligible to vote");

        const registeredVoters = await onlineVoting.getVoters();
        console.log("\nTotal Jumlah Pemilih:", registeredVoters.length);
        console.log("Alamat Pemilih:", registeredVoters);

        const endTimeVoting = Date.now();
        console.log(`\nTotal waktu yang dibutuhkan untuk seluruh proses voting: ${(endTimeVoting - startTimeVoting) / 1000} detik`);
    });

    // Langkah 5: Penentuan Pemenang
    it("Langkah 5: Menentukan pemenang dan menampilkan hasil", async function () {
        console.log("\n=== Langkah 5: Penentuan Pemenang ===");
        
        console.log("\nMengaktifkan akses hasil pemilihan...");
        const accessTx = await onlineVoting.connect(owner).setVoterResultAccess(true);
        const accessReceipt = await accessTx.wait();
        const accessGasEth = ethers.utils.formatEther(accessReceipt.gasUsed.mul(accessTx.gasPrice));
        console.log("Block Number:", accessReceipt.blockNumber);
        console.log("Gas yang digunakan:", accessGasEth, "ETH");

        console.log("\nMenentukan pemenang...");
        let winnerTx = await onlineVoting.connect(owner).findMaxVoteCandidate();
        let receipt = await winnerTx.wait();
        const gasUsedEth = ethers.utils.formatEther(receipt.gasUsed.mul(winnerTx.gasPrice));
        console.log("Hash Transaksi:", receipt.transactionHash);
        console.log("Block Number:", receipt.blockNumber);
        console.log("Gas yang digunakan:", gasUsedEth, "ETH");

        const winner = await onlineVoting.getWinner();
        console.log("\nDetail Pemenang:");
        console.log("Nama:", winner.candidate_name);
        console.log("Jurusan:", winner.candidate_partyName);
        console.log("Jumlah Suara:", winner.candidate_voteCount.toString());

        const candidates = await onlineVoting.getCandidate();
        console.log("\nHasil Perhitungan Suara Akhir:");
        candidates.forEach((candidate) => {
            console.log(`${candidate.candidate_name}: ${candidate.candidate_voteCount.toString()} suara`);
        });
    });
});