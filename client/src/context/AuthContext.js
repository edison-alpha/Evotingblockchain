import { createContext, useCallback, useEffect, useState } from 'react';
import OnlineVoting from '../artifacts/contracts/OnlineVoting.sol/OnlineVoting.json';
import SoulboundToken from '../artifacts/contracts/SoulboundToken.sol/SoulboundToken.json';
import { ethers } from 'ethers';

// Membuat konteks AuthContext untuk manajemen otentikasi
export const AuthContext = createContext();

// Membuat provider untuk AuthContext
export const AuthContextProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [adminAccount, setAdminAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [soulboundContract, setSoulboundContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  // Fungsi untuk menghubungkan wallet ke aplikasi
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.error('MetaMask tidak terpasang! Mengarahkan ke halaman unduh MetaMask.');
      window.location.href = 'https://metamask.io/download.html';
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();// meminta address
      

     

      // Memeriksa jaringan saat ini
      const network = await provider.getNetwork();
      if (network.chainId !== 84532) {
        await provider.send('wallet_addEthereumChain', [{
          chainId: '0x14a33',
          chainName: 'Base Sepolia',
          rpcUrls: ['https://sepolia.base.org'],
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
          },
          blockExplorerUrls: ['https://sepolia.basescan.org/']
        }]);
        const newNetwork = await provider.getNetwork();
        if (newNetwork.chainId !== 84532) {
          console.error('Jaringan Base Sepolia tidak terhubung. Silakan pilih jaringan Base Sepolia di MetaMask.');
          return;
        }
      }
      const contractAddress ='0xE514852688451713170f85cBB16D24685e212Bb0';
      const soulboundContractAddress ='0xdD0E7c6541EA2D5675bB3aC89530342f6E463870';

      // Create contract instances
      const contract = new ethers.Contract(
        contractAddress,
        OnlineVoting.abi,
        signer
      );
      const soulboundContract = new ethers.Contract(
        soulboundContractAddress,
        SoulboundToken.abi,
        signer
      );

      // Fetch admin account
      const admin = await contract.getOwner();

      // Update state
      setAccount(address);
      setContract(contract);
      setSoulboundContract(soulboundContract);
      setProvider(provider);
      setAdminAccount(admin);
      setConnected(true);
      window.localStorage.setItem('Connected', 'injected');

      // Check if user is admin
      setIsAdmin(address.toLowerCase() === admin.toLowerCase());

      // Mengatur event listener
      const handleChainChanged = () => window.location.reload();
      const handleAccountsChanged = async () => {
        const newAccount = await provider.getSigner().getAddress();
        setAccount(newAccount);
        const admin = await contract.getOwner();
        setAdminAccount(admin);
        setIsAdmin(newAccount.toLowerCase() === admin.toLowerCase());
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
      };
    } catch (error) {
      console.error('Error saat menghubungkan ke provider Ethereum:', error);
    }
  }, []);

  // Fungsi untuk memutuskan koneksi wallet
  const disconnectWallet = useCallback(() => {
    setAccount('');
    setContract(null);
    setSoulboundContract(null);
    setProvider(null);
    setConnected(false);
    setIsAdmin(false);
  }, []);

  // Fungsi untuk memeriksa apakah pengguna memenuhi syarat pemilih
  const isEligibleVoter = useCallback(async () => {
    if (soulboundContract && account) {
      try {
        return await soulboundContract.isEligibleVoter(account);
      } catch (error) {
        console.error('Error saat memeriksa kelayakan:', error);
      }
    }
    console.error(
      'Instance kontrak Soulbound tidak tersedia atau akun tidak terhubung.'
    );
    return false;
  }, [soulboundContract, account]);

  // Efek samping untuk menghubungkan otomatis jika sebelumnya terhubung
  useEffect(() => {
    if (window.localStorage.getItem('Connected')) {
      connectWallet(); // Menghubungkan jika sudah ada data Connected di localStorage
    }
  }, [connectWallet]);

  // Menyediakan nilai untuk AuthContext
  return (
    <AuthContext.Provider
      value={{
        connected,
        contract,
        account,
        provider,
        adminAccount,
        setCurrentUser,
        currentUser,
        isEligibleVoter,
        connectWallet,
        disconnectWallet,
        isAdmin, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
