import React, { useCallback, useContext, useEffect, useState, memo } from 'react';
import { AuthContext } from '../context/AuthContext';
import img from "../img/Poll.gif";
import Loader from './Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VoteArea = memo(() => {
  const { provider, contract, isEligibleVoter, account } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [votedCandidates, setVotedCandidates] = useState(new Set());
  const [hasVoted, setHasVoted] = useState(false); // Track if user has voted
  const [isEligible, setIsEligible] = useState(false); // Track eligibility status
  // const [hash, setHash] = useState([])


  const getCandidates = useCallback(async () => {
    if (!provider || !contract) return;
    try {
      const signer = contract.connect(provider.getSigner());
      const cand = await signer.getCandidate();
      setCandidates(cand);
    } catch (error) {
      console.log(error);
    }
  }, [contract, provider]);

  useEffect(() => {
    getCandidates();
  }, [getCandidates]);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!account) return;
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const isEligible = await isEligibleVoter(userAddress);
      console.log('IsEligiblevoter:', isEligible);
      setIsEligible(isEligible); // Update eligibility status
    };

    checkEligibility();
  }, [account, provider, isEligibleVoter]);

  // Store hash in localStorage whenever it changes
  // useEffect(() => {
  //   if (hash.length > 0) {
  //     localStorage.setItem('votes', JSON.stringify(hash));
  //   }
  // }, [hash]);

  const addYourVote = async (candidate_id) => {
    try {
      setIsLoading(true);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      if (!isEligible) {
        setIsLoading(false);
        toast.error('You are not eligible to vote!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "colored",
        });
        return;
      }

      const contractWithSigner = contract.connect(signer);
      const transaction = await contractWithSigner.addVote(candidate_id);
      const receipt = await transaction.wait();
     

      setVotedCandidates((prev) => new Set(prev.add(candidate_id)));
      setHasVoted(true);

      setIsLoading(false);

      const txHashLink = `https://sepolia.basescan.org/tx/${receipt.transactionHash}`;
      
      // // Create an object with hash and address
      // const voteData = { hash: receipt.transactionHash, address: userAddress };
      
      // // Update votes state
      // setHash((prevVotes) => [...prevVotes, voteData]); // Use functional update
      toast.success(
        <div>
          You cast your vote! 
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
      setIsLoading(false);
      handleVoteError(error);
    }
  };

  const handleVoteError = (error) => {
    const errorMessage = error.data?.message || 'Transaction failed.';
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
    });
  };

  // Check if wallet is connected
  if (!account) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Wallet not connected</h1>
        <p className="mt-2 text-sm text-gray-700">
          Please connect your wallet to access the voting area.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      {isLoading && <Loader />}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Voting is live now!</h1>
            <p className="mt-2 text-sm text-gray-700">
              Click on vote button and cast your vote. Choose your leader wisely.
            </p>
            <p className={`mt-2 text-sm ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
              {isEligible ? 'You are eligible to vote!' : 'You are not eligible to vote!'}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className='relative grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-8 p-5'>
          {
            candidates?.map((item, i) => (
              <div
                key={i}
                className={`relative flex flex-col items-center p-8 bg-gray-100 drop-shadow-xl rounded-[20px] ${hasVoted && !votedCandidates.has(item.candidate_id.toNumber()) ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className='flex justify-center'>
                  <img className='h-36 w-36 rounded-full object-cover' src={`https://gateway.pinata.cloud/ipfs/${item.candidate_img}`} alt="" />
                </div>
                <div className='mt-4 text-center'>
                  <p className='text-lg font-semibold'>{item.candidate_name}</p>
                  <p className='text-md text-gray-600'>{item.candidate_partyName}</p>
                  <button
                    type="button"
                    onClick={() => addYourVote(item.candidate_id.toNumber())}
                    className={`mt-5 inline-flex items-center rounded border border-transparent bg-white border-[#3ed0d9] px-5 py-2 text-sm font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3ed0d9] focus:ring-offset-2 ${hasVoted && !votedCandidates.has(item.candidate_id.toNumber()) ? 'pointer-events-none' : ''}`}
                  >
                    <span className='text-lg font-semibold'>Vote</span>
                    <img src={img} className="h-8 ml-2" alt="" />
                  </button>
                </div>
              </div>
            ))
          }
          {candidates?.length === 0 && <p>Voting has not started!</p>}
        </div>
      </div>
    </div>
  );
});

export default VoteArea;
