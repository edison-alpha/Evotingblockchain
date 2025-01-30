import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

export default function Information() {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Informasi</h3>
          <div className="mt-2 text text-yellow-700">
            <p>
              Pastikan anda telah memiliki wallet Metamask/BitgetWallet
            </p>
            <br />
            <p>
              Cara Install metamask disini: 
              <a 
                href="https://documentation-vote-yuk.gitbook.io/doc.vote-yuk/getting-started/quickstart/install-metamask-desktop" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 underline"
              >
                link
              </a>
            </p>
            <p>
              Claim Faucet disini: 
              <a 
                href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 underline"
              >
                link
              </a>
            </p>
            <p>
              Cara melakukan voting: 
              <a 
                href="https://documentation-vote-yuk.gitbook.io/doc.vote-yuk/voting/editor" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 underline"
              >
                link
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
