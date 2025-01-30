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
  const [totalVoter, setTotalVoter] = useState(0); // Inisialisasi dengan 0

  const ClickToFindWinner = async () => {
    setIsLoading(true);
    try {
      const signer = contract.connect(provider.getSigner());
      await signer.findMaxVoteCandidate();

      // Gunakan Promise.all untuk mengurangi waktu tunggu
      const [isResult, winnerData, cand, voter] = await Promise.all([
        signer.resultStatus(),
        signer.getWinner(),
        signer.getCandidate(),
        signer.getVoters(),
      ]);

      if (!isResult) {
        console.log("Hasil belum diumumkan");
        toast.info("Hasil belum diumumkan.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        return;
      }

      // Set state dengan data yang diterima
      setResultStatus(isResult);
      setWinner(winnerData);
      setCandidates(cand);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getResultStatus = async () => {
      try {
        if (!account || account !== adminAccount) {
          return; // Hanya admin yang bisa mengakses hasil
        }
        const signer = contract.connect(provider.getSigner());
        const isResult = await signer.resultStatus();
        setResultStatus(isResult);
        if (!isResult) {
          return;
        }

        // Ambil data kandidat dan pemilih hanya jika hasil sudah diumumkan
        const [cand, voter] = await Promise.all([
          signer.getCandidate(),
          signer.getVoters(),
        ]);
        setCandidates(cand);
        setTotalVoter(voter.length);

        // Hitung pemenang
        const winnerCandidate = cand.reduce((prev, current) => {
          return (prev.candidate_voteCount.toNumber() > current.candidate_voteCount.toNumber()) ? prev : current;
        });
        setWinner(winnerCandidate);
      } catch (error) {
        console.log(error);
      }
    };

    getResultStatus();
  }, [account, provider, contract, adminAccount]);

  return (
    <div>
      <ToastContainer />
      {isLoading && <Loader />}
      {account !== adminAccount ? (
        <div className='flex flex-col items-center justify-center h-screen'>
          <p className='text-xl font-semibold text-gray-900'>
            Hasil Belum di Umumkan
          </p>
          <p className='mt-2 text-sm text-gray-700'>
            Masih dalam proses perhitungan.....
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
              <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
                <button
                  type='button'
                  onClick={ClickToFindWinner}
                  disabled={resultStatus}
                  className='inline-flex items-center justify-center rounded-md border border-transparent bg-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
                >
                  {resultStatus ? 'Hasil Rekapitulasi' : 'Menghitung Suara'}
                </button>
              </div>
            </div>
          </div>
          {winner && (
            <div className='w-[500px] p-5 m-auto'>
              <div className='flex justify-between items-center bg-gray-100 px-7 py-5 drop-shadow-xl rounded-[5px]'>
                <img
                  className='h-16 absolute top-0 left-[-20px]'
                  src={img}
                  alt='Award'
                />
                <div className=''>
                  <img
                    className='h-24 w-24 rounded-full object-cover'
                    src={`https://gateway.pinata.cloud/ipfs/${winner.candidate_img}`}
                    alt='Winner'
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
                  alt='Party Logo'
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
                          alt={curr.candidate_name}
                        />
                      </div>
                      <div className=''>
                        <div className='mt-2'>
                          <p>
                            <span className='text-xs'>Nama : </span>{' '}
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
              <div className='flex flex-col items-center justify-center h-screen'>
                <p className='text-xl font-semibold text-gray-900'>
                  Hasil Belum di Umumkan
                </p>
                <p className='mt-2 text-sm text-gray-700'>
                  Masih dalam proses perhitungan.....
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
