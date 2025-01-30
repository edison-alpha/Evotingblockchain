import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FaucetABI from './Faucet.json';

const faucetAddress = '0x65176562b286b4F43cE09ba4911b4dC76CE3E896';

function Faucetbase() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    } else {
      console.log('MetaMask is not installed');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this faucet!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      console.log('Connected account:', accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null); // Menghapus alamat wallet yang terhubung
  };

  const claimFaucet = async () => {
    if (!walletAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const faucet = new ethers.Contract(faucetAddress, FaucetABI.abi, signer);

    try {
      setIsClaiming(true);
      const tx = await faucet.claimFaucet(); // Panggil fungsi claimFaucet dari kontrak
      await tx.wait();
      alert("Claim successful!");
    } catch (error) {
      console.error('Error claiming faucet:', error);
      alert("Faucet habis silahkan hubungi pemilik contract");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="flex flex-col items-center w-full">
        <button
          onClick={claimFaucet}
          disabled={isClaiming || !walletAddress}
          className={`w-full px-4 py-2 text-white font-bold rounded-lg ${isClaiming || !walletAddress ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'}`}
        >
          {isClaiming ? 'Claiming...' : 'CLAIM!!!'}
        </button>
      </main>
    </div>
  );
}

export default Faucetbase;
