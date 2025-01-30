import React, { useState } from "react";
import axios from "axios";
import { useTable, useSortBy } from "react-table";

const API_KEY = 'GUBF8TN6EB4TVFPCR2DT3HNBX1FVK8C5AC'; // Replace with your Sepolia API Key

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  );

  // Cap the displayed rows at 20
  const firstPageRows = rows.slice(0, 20);

  return (
    <div className="mt-4">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {firstPageRows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <div>Showing the first {firstPageRows.length} results of {rows.length} rows</div>
    </div>
  );
}

function VoterRegistration() {
  const [searchType, setSearchType] = useState('txhash'); // New state for search type
  const [searchInput, setSearchInput] = useState('');
  const [transactionData, setTransactionData] = useState([]);
  const [error, setError] = useState(null);

  const fetchTransactionDetails = async () => {
    if (!searchInput) {
      setError('Please enter a transaction hash or address');
      return;
    }

    try {
      let txData = [];
      
      if (searchType === 'txhash') {
        // Fetch transaction details by transaction hash
        const txResponse = await axios.get(`https://api-sepolia.etherscan.io/api`, {
          params: {
            module: 'proxy',
            action: 'eth_getTransactionByHash',
            txhash: searchInput,
            apikey: API_KEY
          }
        });

        const result = txResponse.data.result;
        
        // Check if result exists and has the necessary fields
        if (result) {
          txData = [{
            txhash: result.hash,
            status: parseInt(result.blockNumber, 16) > 0 ? 'Success' : 'Pending',
            blockNumber: parseInt(result.blockNumber, 16),
            from: result.from,
            to: result.to,
            value: parseFloat(parseInt(result.value, 16) / 1e18).toFixed(5), // Convert wei to ether
            method: getTransactionMethod(result.input)
          }];
        }
      } else if (searchType === 'address') {
        // Fetch transaction list by address
        const txListResponse = await axios.get(`https://api-sepolia.etherscan.io/api`, {
          params: {
            module: 'account',
            action: 'txlist',
            address: searchInput,
            startblock: 0,
            endblock: 99999999,
            sort: 'asc',
            apikey: API_KEY
          }
        });

        const txList = txListResponse.data.result;
        
        // Map response to transaction data
        if (txList && txList.length > 0) {
          txData = txList.map(tx => ({
            txhash: tx.hash,
            status: tx.isError === '0' ? 'Success' : 'Failed',
            blockNumber: tx.blockNumber,
            from: tx.from,
            to: tx.to,
            value: parseFloat(parseInt(tx.value, 10) / 1e18).toFixed(5), // Convert wei to ether
            method: getTransactionMethod(tx.input)
          }));
        }
      }

      if (txData.length > 0) {
        setTransactionData(txData);
        setError(null);
      } else {
        setError('No transactions found');
        setTransactionData([]);
      }
    } catch (err) {
      setError('Error fetching transaction details');
      setTransactionData([]);
    }
  };

  // Determine transaction method from input data
  const getTransactionMethod = (input) => {
    if (!input || input === '0x') {
      return 'Transfer'; // Regular Ether transfer
    }
    // Example decoding: You can extend this with known method signatures
    const methodSignature = input.slice(0, 10);
    switch (methodSignature) {
      case '0xa9059cbb': // ERC20 Transfer function
        return 'ERC20 Transfer';
      case '0x095ea7b3': // ERC20 Approve function
        return 'ERC20 Approve';
      // Add more cases as needed
      default:
        return 'Contract Call';
    }
  };

  const columns = React.useMemo(
    () => [
      { 
        Header: 'Transaction Hash', 
        accessor: 'txhash',
        Cell: ({ value }) => (
          <a 
            href={`https://sepolia.etherscan.io/tx/${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value.substring(0, 12)}...
          </a>
        )
      },
      { Header: 'Method', accessor: 'method' },
      { Header: 'Status', accessor: 'status' },
      { Header: 'Block Number', accessor: 'blockNumber' },
      { Header: 'From', accessor: 'from' },
      { Header: 'To', accessor: 'to' },
      { Header: 'Value (ETH)', accessor: 'value' }
    ],
    []
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Track Transaction</h1>
      
      <div className="mt-4">
        <label htmlFor="searchType" className="mr-2">Search by:</label>
        <select 
          id="searchType" 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="txhash">Transaction Hash</option>
          <option value="address">Address</option>
        </select>
      </div>

      <input
        type="text"
        placeholder={`Enter ${searchType === 'txhash' ? 'Transaction Hash' : 'Address'}`}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="mt-4 p-2 border border-gray-300 rounded w-full"
      />
      <button
        onClick={fetchTransactionDetails}
        className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Details
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <Table columns={columns} data={transactionData} />
    </div>
  );
}

export default VoterRegistration;
