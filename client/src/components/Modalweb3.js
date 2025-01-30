import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function Web3Modal({ isOpen, onClose, connectWallet }) {
  const [isLoading, setIsLoading] = useState(false); // State to manage loading status

  // This useEffect will ensure the external dialog script is loaded
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@material-tailwind/html@latest/scripts/dialog.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // New function to handle wallet selection
  const handleWalletSelection = async (walletName) => {
    console.log(`Selected wallet: ${walletName}`);
    setIsLoading(true); // Set loading to true when wallet selection starts
    try {
      await connectWallet(); // Call the connectWallet function after selection
    } finally {
      setIsLoading(false); // Set loading to false after wallet connection attempt
      onClose(); // Close the modal after selection
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Login to VOTEYUK!
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Choose wallet you want to connect
                  </p>
                </div>

                <div className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin dark:border-violet-600"></div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleWalletSelection('Metamask')}
                        className="w-full mt-3 rounded-md flex items-center justify-center border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                      >
                        <img
                          src="https://docs.material-tailwind.com/icons/metamask.svg"
                          alt="metamask"
                          className="h-5 w-5 mr-2"
                        />
                        Connect Wallet
                      </button>

                      <button
                        onClick={() => handleWalletSelection('Coinbase')}
                        className="w-full mt-2 rounded-md flex items-center justify-center border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                      >
                        <img
                          src="https://docs.material-tailwind.com/icons/coinbase.svg"
                          alt="coinbase"
                          className="h-5 w-5 mr-2 rounded-md"
                        />
                        Connect with Coinbase
                      </button>

                      <button
                        onClick={() => handleWalletSelection('Trust Wallet')}
                        className="mt-3 w-full rounded-md flex items-center justify-center border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                      >
                        <img
                          src="https://docs.material-tailwind.com/icons/trust-wallet.svg"
                          alt="trust wallet"
                          className="h-5 w-5 rounded-md mr-2 border border-slate-300"
                        />
                        Connect with Trust Wallet
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 p-4 text-blue-gray-500 mt-2">
                  <p className="text-sm text-slate-500">
                    New to Ethereum wallets?
                  </p>
                  <button className="rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">

                    <a href='https://ethereum.org/en/wallets/'>
                    Learn More
                    </a>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Web3Modal;