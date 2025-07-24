import { Plus, HelpCircle, Settings, AppWindow, PanelLeftClose } from 'lucide-react';

import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';

import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import NotificationBell from '../components/NotificationBell';

export default function Header() {
  const { user } = useAuth();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      fill='none'
      viewBox='0 0 16 16'
      role='presentation'
      {...props}
      style={{ color: 'var(--ds-icon, #44546F)' }}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7'
        clipRule='evenodd'
      />
    </svg>
  );

  return (
    <header className='w-full flex items-center justify-between p-1 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40'>
      <div className='flex items-center space-x-2'>
        <button className='p-1 rounded hover:bg-gray-200'>
          <PanelLeftClose className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-1 rounded hover:bg-gray-200'>
          <AppWindow className='w-5 h-5 text-gray-700' />
        </button>
        <Link to='/' className='flex items-center gap-0 hover:opacity-80'>
          <img src={logo} className='h-10 w-auto scale-[1.2]' style={{ marginRight: '-80px' }} />
          <img src={textLogo} className='h-9 w-auto scale-[0.36]' />
        </Link>
      </div>

      <div className='flex-1 mx-4 flex items-center justify-center space-x-2'>
        <div className='flex items-center border border-gray-300 rounded-md w-80 px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white'>
          <CustomSearchIcon className='w-4 h-4 text-gray-400 mr-2' />
          <input
            type='text'
            placeholder='Search'
            className='ml-2 flex-1 bg-white border-none outline-none appearance-none text-sm text-gray-700 placeholder-gray-400'
            style={{ all: 'unset', width: '100%' }}
          />
        </div>
        <button className='bg-blue-500 text-white flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-600'>
          <Plus className='w-4 h-4 mr-1' />
          <span className='hidden sm:inline'>Create</span>
        </button>
      </div>

      <div className='flex items-center space-x-2'>
        <button className='hidden md:flex border px-3 py-1.5 rounded-md text-sm items-center hover:bg-gray-100'>
          <span className='mr-1'>💬</span> Chat
        </button>

        <NotificationBell accountId={accountId} />

        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <HelpCircle className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <Settings className='w-5 h-5 text-gray-700' />
        </button>

        {user ? (
          <button className='w-8 h-8 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full'>
            {user.username.slice(0, 2).toUpperCase()}
          </button>
        ) : (
          <Link to='/login'>
            <button className='px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
