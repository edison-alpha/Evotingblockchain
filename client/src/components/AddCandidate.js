import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const pinataApiKey = '1a3d2fd5127f0593275b';
const pinataSecretApiKey = '854c906db83b023e29f49aab52da40485412867bb4012a3edc41f2224768bb4a';

const AddCandidate = () => {
    const { account, adminAccount, provider, contract } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState({
        name: "",
        partyName: "",
        age: "",
        cPic: "",
        pPic: "",
    });

    const fieldValidation = () => {
        if (!values.name || !values.partyName || !values.age) {
            toast.warn("Please fill all the fields!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return true;
        }
        return false;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(values);
        if (fieldValidation()) {
            return;
        }
        try {
            setIsLoading(true);
            const signer = contract.connect(provider.getSigner());
            const res = await signer.addCandidate(values.name, values.age, values.partyName, values.pPic, values.cPic);
            console.log(res);
            toast.success('Candidate added successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            setIsLoading(false);
        } catch (error) {
            if (error.code === 4001) {
                toast.warn('Transaction rejected!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            } else {
                console.error(error);
            }
            setIsLoading(false);
        }
    }

    const uploadToPinata = async (file) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        let data = new FormData();
        data.append('file', file);

        const res = await axios.post(url, data, {
            maxContentLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        });

        return res.data.IpfsHash;
    };

    const captureCandidateFile = async (e) => {
        const data = e.target.files[0];
        setIsLoading(true);
        try {
            const hash = await uploadToPinata(data);
            setValues(prev => ({ ...prev, cPic: hash }));
            setIsLoading(false);
            toast.success('Candidate Photo Uploaded!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        } catch (e) {
            alert("Unable to upload image to Pinata");
            setIsLoading(false);
        }
    };

    // Check if wallet is connected
    // useEffect(() => {
    //     if (!account) {
    //         toast.warn('Please connect your wallet!', {
    //             position: "top-right",
    //             autoClose: 3000,
    //             hideProgressBar: true,
    //             closeOnClick: true,
    //             pauseOnHover: false,
    //             draggable: true,
    //             progress: undefined,
    //             theme: "colored",
    //         });
    //     }
    // }, [account]);

    // Render loading or access denied if wallet is not connected or user is not admin
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
        <div>
            <ToastContainer />
            {isLoading && <Loader />}
            <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0 drop-shadow-lg ">
                <form action="#" method="POST">
                    <div className="shadow sm:overflow-hidden sm:rounded-md">
                        <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Form untuk menambahkan Kandidat</h3>
                                <p className="mt-1 text-sm text-gray-500">Silahkan isi form dibawah ini untuk menambahkan Kandidat</p>
                            </div>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                        Nama
                                    </label>
                                    <input
                                        type="text"
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="given-name"
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        onChange={(e) => setValues(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                        Jurusan
                                    </label>
                                    <input
                                        type="text"
                                        name="last-name"
                                        id="last-name"
                                        autoComplete="family-name"
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        onChange={(e) => setValues(prev => ({ ...prev, partyName: e.target.value }))}
                                    />
                                </div>

                                <div className="col-span-12 sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nim
                                    </label>
                                    <input
                                        type="text"
                                        name="email-address"
                                        id="email-address"
                                        autoComplete="email"
                                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        onChange={(e) => setValues(prev => ({ ...prev, age: e.target.value }))}
                                    />
                                </div>
                                <div className='col-span-12 sm:col-span-6'>
                                    <div className='mb-4'>
                                        <p className='italic text-xs'>Upload Foto Candidate</p>
                                        <input onChange={captureCandidateFile} type="file" name="" id="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue py-2 px-4 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCandidate;
