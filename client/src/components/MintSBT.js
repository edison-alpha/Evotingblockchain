import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SoulboundToken from './SoulboundToken.json'; // Import ABI kontrak SoulboundToken
import img from "../img/mint.png"; // Import gambar untuk tampilan

// Alamat kontrak SoulboundToken di jaringan Ethereum Sepolia
const soulboundTokenAddress = "0xb2A829b6f467F0DdA930175d43E0b7aE09DC6108";

function MintSBT() {
  // State untuk menyimpan alamat akun wallet pengguna
  const [account, setAccount] = useState(null);
  // State untuk menyimpan status koneksi atau error message
  const [status, setStatus] = useState("");
  // State untuk menyimpan status apakah SBT sudah diklaim atau belum
  const [claimedSBT, setClaimedSBT] = useState(false);
  // State untuk menampilkan alert jika terjadi kesalahan atau keberhasilan
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setStatus("");
            await checkMintedStatus(accounts[0]); // Periksa status minting saat akun terhubung
          }
        } catch (error) {
          console.error("Error fetching accounts", error);
          setStatus("Error connecting to wallet");
        }
      } else {
        setStatus("Metamask not detected");
      }
    }
    fetchAccount();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setStatus("");
        await checkMintedStatus(accounts[0]); // Periksa status minting setelah koneksi
      } catch (error) {
        console.error("Error connecting to wallet", error);
        setStatus("Error connecting to wallet");
      }
    } else {
      setStatus("Metamask not detected");
    }
  };

  const checkMintedStatus = async (userAddress) => {
    if (!userAddress) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const soulboundTokenContract = new ethers.Contract(soulboundTokenAddress, SoulboundToken, provider);
    try {
      const minted = await soulboundTokenContract.hasMintedSoulbound(userAddress);
      setClaimedSBT(minted);
    } catch (error) {
      console.error("Error checking minted status", error);
      setStatus("Error checking minted status");
    }
  };

  const mintSoulbound = async () => {
    if (!account) {
      setStatus("Please connect your wallet first");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const soulboundTokenContract = new ethers.Contract(soulboundTokenAddress, SoulboundToken, signer);

    try {
      const tx = await soulboundTokenContract.mintSoulbound();
      await tx.wait(); // Menunggu transaksi selesai
      setClaimedSBT(true); // Mengatur status jika token sudah diklaim
      setAlertMessage("Soulbound Token successfully minted!");
      setShowAlert(true);
    } catch (error) {
      let errorMessage = "Error minting soulbound token";
      if (error.data && error.data.message && error.data.message.includes("already minted")) {
        errorMessage = "SoulboundToken already minted";
      }
      setStatus(errorMessage);
      console.error("Error minting soulbound token", error);
      setShowAlert(true);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-3 pt-0 lg:flex lg:items-start lg:justify-center lg:pt-4">
      <div className="mb-20 mt-84 hidden lg:flex lg:flex-col lg:w-3/6 lg:items-center lg:justify-center">
        <img src={img} alt="NFT" />
      </div>
      <div className="flex flex-col justify-center lg:w-3/6 lg:ml-8 mt-8 md:mt-0 lg:mt-0">
        <h2 className="text-2xl font-bold mb-2 text-center lg:text-left">
          VoteID NFT: SBT Unik syarat untuk Voting
        </h2>
        <p className="text-gray-600 mb-4 text-center lg:text-left">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full w-full mb-4 ${!account && 'opacity-50 cursor-not-allowed'}`}
          onClick={mintSoulbound}
          disabled={!account || claimedSBT}
        >
          {claimedSBT ? "Minted" : "MINT SBT"}
        </button>
        {showAlert && (
          <div className={`p-4 mb-4 rounded-md text-center ${alertMessage.includes('successfully') ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
            {alertMessage}
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mb-4 lg:text-left">{status}</p>
        <div className="mt-2 text-center text-sm text-gray-700 lg:text-left">
          <p><span className="font-bold">Contract Address:</span>0xb2A829b6f467F0DdA930175d43E0b7aE09DC6108<a href='https://sepolia.etherscan.io/token/0xb2A829b6f467F0DdA930175d43E0b7aE09DC6108' className="text-blue-500 hover:underline">View on Etherscan</a></p>
        </div>
      </div>
    </div>
  );
}

export default MintSBT;
