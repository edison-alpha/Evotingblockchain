import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function CandidateDetails() {
  const { contract, provider, adminAccount, account } = useContext(AuthContext);
  if (account !== adminAccount) {
    return (
      <div className="text-center mt-4">
        <p>Anda tidak memiliki akses untuk melihat detail kandidat.</p>
      </div>
    )
  } else {
    return (
      <AdminComponent contract={contract} provider={provider} />
    )
  }
}

const AdminComponent = ({ contract, provider }) => {

  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const getCandidates = async () => {
      try {
        const signer = contract.connect(provider.getSigner());
        const cand = await signer.getCandidate();
        setCandidates(cand);
      } catch (error) {
        setCandidates([]); // Set candidates to empty array on error
      }
    }
    getCandidates();
  }, [contract, provider]) // Added 'contract' and 'provider' to the dependency array

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Nama Nama Candidat</h1>
          <p className="mt-2 text-sm text-gray-700">
            Di bawah ini merupakan nama-nama candidat yg meliputi foto, nama, jurusan, Nim, dan status
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nama
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Jurusan
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nim
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {candidates?.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={`https://gateway.pinata.cloud/ipfs/${item.candidate_img}`} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{item.candidate_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="text-gray-900">{item.candidate_partyName}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="text-gray-500">{item.candidate_age.toNumber()}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {candidates?.length === 0 && <p className='mt-4 text-center'>Tidak ada Kandidat yang ter regristasi!!</p>} 
          </div>
        </div>
      </div>
    </div>
  )
}
