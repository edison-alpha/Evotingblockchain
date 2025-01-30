import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SoulboundToken from './SoulboundToken.json';
import FaucetABI from './Faucet.json';
import img from "../img/mint.jpg";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const soulboundTokenAddress = "0xdD0E7c6541EA2D5675bB3aC89530342f6E463870";
const faucetAddress = '0x65176562b286b4F43cE09ba4911b4dC76CE3E896';

function MintSBT() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("");
  const [claimedSBT, setClaimedSBT] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [showMintAlert, setShowMintAlert] = useState(false);
  const [mintAlertMessage, setMintAlertMessage] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setStatus("");
            await checkMintedStatus(accounts[0]);
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
      setIsLoading(true);
      const tx = await soulboundTokenContract.mintSoulbound();
      const receipt = await tx.wait();
      
      const txHashLink = `https://sepolia.basescan.org/tx/${receipt.transactionHash}`;
      setClaimedSBT(true);
      
      setMintAlertMessage(
        <div>
          Soulbound Token successfully minted! 
          <br />
          <a href={txHashLink} target="_blank" rel="noopener noreferrer">
            View transaction on Sepolia Etherscan
          </a>
        </div>
      );
      setShowMintAlert(true);

      toast.success(
        <div>
          Soulbound Token successfully minted! 
          <br />
          <a href={txHashLink} target="_blank" rel="noopener noreferrer">
            View transaction on Sepolia Etherscan
          </a>
        </div>,
        {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } catch (error) {
      let errorMessage = "Error minting soulbound token";
      if (error.data?.message?.includes("already minted")) {
        errorMessage = "SoulboundToken already minted";
      }
      setStatus(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const claimFaucet = async () => {
    if (!account) {
      setStatus("Please connect your wallet first");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const faucetContract = new ethers.Contract(faucetAddress, FaucetABI, signer);

    try {
      setIsClaimingFaucet(true);
      const tx = await faucetContract.claimFaucet();
      await tx.wait();
      toast.success("Faucet claimed successfully!");
    } catch (error) {
      console.error("Error claiming faucet", error);
      toast.error("Failed to claim faucet");
    } finally {
      setIsClaimingFaucet(false);
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
          Soulbound Token (SBT) adalah jenis token kripto yang dirancang untuk tidak dapat dipindahkan atau diperdagangkan setelah diterbitkan. VoteID NFT berfungsi sebagai SBT yang unik untuk setiap pemilih. Token ini berfungsi sebagai identitas digital dan sebagai syarat eligible melakukan voting.
        </p>

        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full w-full mb-4 ${!account && 'opacity-50 cursor-not-allowed'}`}
          onClick={mintSoulbound}
          disabled={!account || claimedSBT || isLoading}
        >
          {isLoading ? "Minting..." : (claimedSBT ? "Minted" : "MINT SBT")}
        </button>
        
        <button
          className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full w-full mb-4 ${!account && 'opacity-50 cursor-not-allowed'}`}
          onClick={claimFaucet}
          disabled={!account || isClaimingFaucet}
        >
          {isClaimingFaucet ? "Claiming Faucet..." : "CLAIM FAUCET"}
        </button>

        {showMintAlert && (
          <div className="p-4 mb-4 rounded-md text-center bg-green-200 text-green-800">
            {mintAlertMessage}
          </div>
        )}
        
        <p className="text-center text-sm text-gray-500 mb-4 lg:text-left">{status}</p>
        <div className='mt-2 text-center text-sm text-gray-700 lg:text-left'>
          <p>
            <span className='font-bold'>Contract Address:</span>
            {soulboundTokenAddress}
            <a href={`https://sepolia.basescan.org/token/${soulboundTokenAddress}`} target='_blank' className='underline ml-1'>
              View on Sepolia Etherscan
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MintSBT;