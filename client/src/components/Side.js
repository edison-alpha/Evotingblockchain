import { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // import Link
import logo from '../img/logo.svg';
import {
  FolderIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  RectangleStackIcon,
  InformationCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

const adminNav = [
    {
      id: 5,
      name: 'Candidate Details',
      to: '/dashboard/candidate-details',
      icon: UserGroupIcon,
    },
    {
      id: 6,
      name: 'Add Candidate',
      to: '/dashboard/add-candidate',
      icon: UserPlusIcon,
    },
    { id: 7, name: 'Voters', 
      to: '/dashboard/voters', 
      icon: UsersIcon },

    { id: 4, name: 'Result', 
      to: '/admin/result', 
      icon: ChartBarIcon },
  ];

  const voterNav = [
    {
      id: 1,
      name: 'Information',
      to: '/dashboard/information',
      icon: InformationCircleIcon,
    },
    { id: 2, name: 'Search', 
      to: '/dashboard/search', 
      icon: CheckCircleIcon },

    {
      id: 3,
      name: 'Vote-Area',
      to: '/dashboard/vote-area',
      icon: RectangleStackIcon,
    },
    { id: 4, name: 'Result', 
      to: '/dashboard/result', 
      icon: ChartBarIcon },

    { id: 8, name: 'Mint SBT', 
      to: '/dashboard/mint-sbt', 
      icon: FolderIcon },
  ];

const Sidebar = ({ onClick }) => {
  const { id } = useParams();
  const [current, setCurrent] = useState(0);
  const { isAdmin, account } = useContext(AuthContext);

  useEffect(() => {
    switch (id) {
      case 'information':
        setCurrent(1);
        break;
      case 'search':
        setCurrent(2);
        break;
      case 'vote-area':
        setCurrent(3);
        break;
      case 'result':
        setCurrent(4);
        break;
      case 'candidate-details':
        setCurrent(5);
        break;
      case 'add-candidate':
        setCurrent(6);
        break;
      case 'voters':
        setCurrent(7);
        break;
      case 'mint-sbt':
        setCurrent(8);
        break;
      default:
        setCurrent(5);
    }
  }, [id]);

  return (
    <div>
      <div className='hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col '>
        <div className='flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5'>
          <div className='flex flex-shrink-0 items-center px-4'>
            <Link to='/' className='flex items-center'>
              <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
              <h1 className='text-lg font-bold'>VOTE YUK!</h1>
            </Link>
          </div>

          <div className='mt-5 flex flex-grow flex-col'>
            <nav className='mt-8 space-y-4'>
              {isAdmin ? (
                <>
                  <Link 
                    to='/dashboard/candidate-details' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px]
                    ${id === 'candidate-details' ? 'bg-blue-600 text-white hover:text-white' : ''}`}
                  >
                    <UserGroupIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Candidate Details
                  </Link>

                  <Link 
                    to='/dashboard/add-candidate' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] 
                    ${id === 'add-candidate' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <UserPlusIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Add Candidate
                  </Link>

                  <Link 
                    to='/dashboard/voters' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'voters' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <UsersIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Voters
                  </Link>
                  <Link 
                    to='/admin/result' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'result' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <ChartBarIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Result
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to='/dashboard/information' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'information' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <InformationCircleIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Information
                  </Link>
                  <Link 
                    to='/dashboard/search' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'search' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <CheckCircleIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Tracking
                  </Link>
                  <Link 
                    to='/dashboard/vote-area' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'vote-area' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <RectangleStackIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Vote-Area
                  </Link>
                  <Link to='/dashboard/result' className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'result' ? 'bg-blue-600 text-white' : ''}`}>
                    <ChartBarIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Result
                  </Link>
                  <Link 
                    to='/dashboard/mint-sbt' 
                    className={`text-white-600 hover:bg-blue-600 hover:text-white group flex items-center px-4 py-2 text-sm font-medium rounded-[4px] ${id === 'mint-sbt' ? 'bg-blue-600 text-white' : ''}`}
                  >
                    <FolderIcon className="h-6 w-6 mr-2" aria-hidden="true" />
                    Mint SBT
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
