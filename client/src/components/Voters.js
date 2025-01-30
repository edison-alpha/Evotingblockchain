import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTable } from 'react-table';
import * as XLSX from 'xlsx'; // Untuk ekspor Excel

const Voters = () => {
  const { contract, provider, account, adminAccount } = useContext(AuthContext);
  const [voters, setVoters] = useState([]);
  const [voteTxHashes, setVoteTxHashes] = useState({});

  useEffect(() => {
    const getAllVoters = async () => {
      try {
        const signer = contract.connect(provider.getSigner());
        const voterList = await signer.getVoters();
        setVoters(voterList);

        const storedVotes = JSON.parse(localStorage.getItem('votes')) || [];
        const txHashMap = {};
        storedVotes.forEach(vote => {
          txHashMap[vote.address] = vote.hash;
        });
        setVoteTxHashes(txHashMap);
      } catch (error) {
        console.error(error);
      }
    };

    if (account) {
      getAllVoters();
    }
  }, [contract, provider, account]);

  const columns = React.useMemo(() => [
    { Header: 'Tx Hash', accessor: 'txHash' },
    { Header: 'Address', accessor: 'address' },
    { Header: 'Status Voting', accessor: 'status' },
    { Header: 'Lacak Transaksi', accessor: 'track' },
  ], []);

  const data = React.useMemo(() => 
    voters.map(address => ({
      txHash: voteTxHashes[address] 
        ? <a href={`https://sepolia.basescan.org/tx/${voteTxHashes[address]}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{voteTxHashes[address]}</a> 
        : "Transaction hash not available",
      address: address,
      status: <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">Selesai</span>,
      track: <a href={`https://sepolia.basescan.org/address/${address}`} className="text-indigo-700 hover:bg-indigo">Lacak</a>,
    }))
  , [voters, voteTxHashes]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  // Fungsi ekspor ke Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(voters.map(voter => ({
      Address: voter,
      TxHash: voteTxHashes[voter] || "Transaction hash not available"
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters");
    XLSX.writeFile(workbook, "voters_data.xlsx");
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-lg font-medium text-red-600">Please connect your wallet to access this page.</h2>
      </div>
    );
  }

  if (account.toLowerCase() !== adminAccount.toLowerCase()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-lg font-medium text-red-600">Access Denied: You must be an admin to access this page.</h2>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Peserta Voting</h1>
          <p className="mt-2 text-sm text-gray-700">Dibawah ini adalah address peserta yang telah melakukan voting</p>
        </div>
        <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded">Export to Excel</button>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-300">
                <thead className="bg-blue-100">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps()} className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
                  {rows.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => (
                          <td {...cell.getCellProps()} className="px-3 py-4 text-sm text-gray-500">{cell.render('Cell')}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {voters.length === 0 && <p className="mt-4 text-center">No any voters voted!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voters;
