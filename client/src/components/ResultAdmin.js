import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import img from '../img/Award.gif';
import Loader from './Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Result = () => {
  const { account, adminAccount, provider, contract } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState();
  const [candidates, setCandidates] = useState();
  const [resultStatus, setResultStatus] = useState(false);
  const [totalVoter, setTotalVoter] = useState();
  const [isResultAccessible, setIsResultAccessible] = useState(false); // State untuk mengontrol akses voter ke hasil
  
  // Fungsi untuk mengaktifkan/nonaktifkan akses hasil suara untuk voter
  const toggleResultAccess = async () => {
    try {
      const signer = contract.connect(provider.getSigner());
      // Simpan status baru di blockchain (misalnya menggunakan fungsi smart contract untuk mengatur status)
      await signer.setResultAccess(!isResultAccessible);
      setIsResultAccessible(!isResultAccessible); // Perbarui state lokal
      toast.success(`Akses hasil suara ${!isResultAccessible ? 'dibuka' : 'ditutup'} untuk voter!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.log(error);
      toast.error("Gagal mengubah status akses hasil suara.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const ClickToFindWinner = async () => {
    setIsLoading(true); // Set loading true at the start
    try {
      const signer = contract.connect(provider.getSigner());
      // find winner_id
      await signer.findMaxVoteCandidate();
      // check status of result declaration
      const isResult = await signer.resultStatus();
      if (!isResult) {
        console.log("Hasil belum diumumkan");
        return;
      }
      setResultStatus(isResult);
      // get winner candidate data
      const getWinnerData = await signer.getWinner();// Log data pemenang
      setWinner(getWinnerData);
      // get all candidate data;
      const cand = await signer.getCandidate();
      setCandidates(cand);
      // get total voters
      const voter = await signer.getVoters();
      setTotalVoter(voter.length);
      
      toast.success("Suara berhasil dihitung!", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.log(error);
      toast.error("Terjadi kesalahan saat menghitung suara.", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsLoading(false); // Ensure loading stops in finally block
    }
  };

  useEffect(() => {
    const getResultStatus = async () => {
      try {
        if (!account) {
          return; // Wallet not connected, no need to proceed
        }
        const signer = contract.connect(provider.getSigner());
        const isResult = await signer.resultStatus();
        setResultStatus(isResult);
        if (!isResult) {
          return;
        }
        // get all candidate data;
        const cand = await signer.getCandidate();
        setCandidates(cand);
        // get total voters
        const voter = await signer.getVoters();
        setTotalVoter(voter.length);
        // Determine the winner based on the highest vote count
        const winnerCandidate = cand.reduce((prev, current) => {
          return (prev.candidate_voteCount.toNumber() > current.candidate_voteCount.toNumber()) ? prev : current;
        });
        setWinner(winnerCandidate);

        // Get result access status
        const accessStatus = await signer.getResultAccess(); // Misal ada fungsi ini di smart contract
        setIsResultAccessible(accessStatus);
      } catch (error) {
        console.log(error);
      }
    };

    getResultStatus();
  }, [account, provider, contract]); // Include dependencies

  return (
    <div>
      <ToastContainer />
      {isLoading && <Loader />}
      {!account ? (
        <div className='flex flex-col items-center justify-center h-screen'>
          <p className='text-xl font-semibold text-gray-900'>
            Wallet not connected
          </p>
          <p className='mt-2 text-sm text-gray-700'>
            Please connect your wallet to access this page.
          </p>
        </div>
      ) : (
        <div>
          <div className='px-4 sm:px-6 lg:px-8'>
            <div className='sm:flex sm:items-center'>
              <div className='sm:flex-auto'>
                <h1 className='text-xl font-semibold text-gray-900'>
                  Hasil Rekapitulasi Suara
                </h1>
                <p className='mt-2 text-sm text-gray-700'>
                  Dibawah ini merupakan hasil rekapitulasi suara.
                </p>
              </div>
              {account === adminAccount && (
                <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
                  <button
                    type='button'
                    onClick={ClickToFindWinner}
                    disabled={resultStatus}
                    className='inline-flex items-center justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
                  >
                    {resultStatus ? 'Hasil Rekapitulasi' : 'Menghitung Suara'}
                  </button>

                  {/* Tombol untuk mengaktifkan/nonaktifkan akses hasil suara */}

                  {/* Tombol untuk mengaktifkan/nonaktifkan akses hasil suara */}
                  <button
                    type='button'
                    onClick={toggleResultAccess}
                    className={`inline-flex items-center justify-center rounded-md border border-transparent ml-4 px-4 py-2 text-sm font-medium text-white shadow-sm 
                      ${isResultAccessible ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'} 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto`}
                  >
                    {isResultAccessible ? 'Tutup Akses Hasil' : 'Buka Akses Hasil'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Display winner below the recap results */}
          {winner && (
            <div className='w-[500px] p-5 m-auto'>
              <div className='flex justify-between items-center bg-gray-100 px-7 py-5 drop-shadow-xl rounded-[5px]'>
                <img
                  className='h-16 absolute top-0 left-[-20px]'
                  src={img}
                  alt=''
                />
                <div className=''>
                  <img
                    className='h-24 w-24 rounded-full object-cover'
                    src={
                      winner &&
                      `https://gateway.pinata.cloud/ipfs/${winner.candidate_img}`
                    }
                    alt=''
                  />
                </div>
                <div className=''>
                  <div className='mt-2'>
                    <p>
                      <span className='text-xs'>Nama : </span>{' '}
                      <span className='font-semibold'>
                        {winner.candidate_name}
                      </span>{' '}
                    </p>
                    <p>
                      <span className='text-xs'>Jurusan: </span>
                      <span className='font-semibold'>
                        {winner.candidate_partyName}
                      </span>
                    </p>
                    <p>
                      <span className='text-xs'>Nim: </span>{' '}
                      <span className='font-semibold'>
                        {winner.candidate_age.toNumber()}
                      </span>{' '}
                    </p>
                    <p>
                      <span className='text-xs'>Jumlah Suara: </span>{' '}
                      <span className='font-semibold'>
                        {winner.candidate_voteCount.toNumber() +
                          '/' +
                          totalVoter}
                      </span>{' '}
                    </p>
                  </div>
                </div>
                <img
                  className='h-12 absolute bottom-[-10px] right-0 rounded-[50px]'
                  src='http://www.pngimagesfree.com/LOGO/B/BJP-Logo/SMALL/BJP-Logo-HD-PNG.png'
                  alt=''
                />
              </div>
            </div>
          )}

          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            {winner ? (
              <div className='grid md:grid-cols-2 lg:grid-cols-2 grid-cols-1 gap-4 p-5'>
                {candidates?.map((curr, i) => {
                  return (
                    <div
                      key={i}
                      className='flex justify-around space-x-6 items-center bg-gray-100 px-2 py-5 drop-shadow-xl rounded-[10px] w-[80%] mx-auto'
                    >
                      <div className=''>
                        <img
                          className='h-24 w-24 rounded-full object-cover'
                          src={`https://gateway.pinata.cloud/ipfs/${curr.candidate_img}`}
                          alt=''
                        />
                      </div>
                      <div className=''>
                        <div className='mt-2 lg:mt-0'>
                          <p>
                            <span className='text-xs'>Name : </span>{' '}
                            <span className='font-semibold'>
                              {curr.candidate_name}
                            </span>{' '}
                          </p>
                          <p>
                            <span className='text-xs'>Jurusan: </span>
                            <span className='font-semibold'>
                              {curr.candidate_partyName}
                            </span>
                          </p>
                          <p>
                            <span className='text-xs'>Nim: </span>{' '}
                            <span className='font-semibold'>
                              {curr.candidate_age.toNumber()}
                            </span>{' '}
                          </p>
                          <p>
                            <span className='text-xs'>Jumlah Suara: </span>{' '}
                            <span className='font-semibold'>
                              {curr.candidate_voteCount.toNumber() +
                                '/' +
                                totalVoter}
                            </span>{' '}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='flex justify-center mt-8 text-2xl '></p>
            )}
            <hr />
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
