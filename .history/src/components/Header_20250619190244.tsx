import { Search, Plus, Bell, HelpCircle, Settings, AppWindow, PanelLeftClose } from 'lucide-react';

import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';
// import Login from './Login';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Header() {
  const { user } = useAuth();
  return (
    <header className='w-full flex items-center justify-between p-1 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40'>
      <div className='flex items-center space-x-2'>
        <button className='p-1 rounded hover:bg-gray-200 block '>
          <PanelLeftClose className='w-5 h-5 text-gray-700' />
        </button>

        <button className='p-1 rounded hover:bg-gray-200'>
          <AppWindow className='w-5 h-5 text-gray-700' />
        </button>

         <Link to='/' className='flex items-center gap-0 hover:opacity-80'>
      <img
        src={logo}
        className='h-10 w-auto object-contain scale-[1.2]'
        style={{ transformOrigin: 'left center' }}
      />
      <img
        src={textLogo}
        className='h-9 w-auto object-contain scale-[0.35]'
        style={{ transformOrigin: 'left center' }}
      />
    </Link>
      </div>

      <div className='flex-1 mx-4 flex items-center justify-center space-x-2'>
        <div className='relative flex-1 max-w-xs'>
          <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            className='w-full pl-10 pr-4 py-1.5 border rounded-md border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <button className='bg-blue-500 text-white flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors'>
          <Plus className='w-4 h-4 mr-1' />
          <span className='hidden sm:inline'>Create</span>
        </button>
      </div>

      <div className='flex items-center space-x-2'>
        <button className='hidden lg:flex border px-3 py-1.5 rounded-md text-sm items-center text-purple-600 border-blue-300 hover:bg-gray-100'>
          <span className='mr-1'>💎</span> Premium
        </button>

        <button className='hidden md:flex border px-3 py-1.5 rounded-md text-sm items-center hover:bg-gray-100'>
          <span className='mr-1'>💬</span> Chat
        </button>

        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <Bell className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <HelpCircle className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <Settings className='w-5 h-5 text-gray-700' />
        </button>

        {user ? (
          <>
            <button className='w-8 h-8 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full'>
              {user.username.slice(0, 2).toUpperCase()}
            </button>
          </>
        ) : (
          <Link to='/login'>
            <button className='px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
