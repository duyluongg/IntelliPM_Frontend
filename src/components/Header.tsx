import {
  Plus,
  HelpCircle,
  Settings,
  AppWindow,
  PanelLeftClose,
  LogOut,
  User,
  Palette,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';
import { useAuth } from '../services/AuthContext';
import { useGetAccountByEmailQuery } from '../services/accountApi';
import NotificationBell from '../components/NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const { data: accountResponse } = useGetAccountByEmailQuery(user?.email ?? '', {
    skip: !user?.email,
  });
  const handleLogout = () => {
    logout();
    navigate('/Guest');
  };

  const isRole = accountResponse?.data?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

  const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill='none' viewBox='0 0 16 16' role='presentation' {...props}>
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
          <img src={logo} className='h-10 w-auto scale-[1.2] -mr-20' />
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
        {isRole && (
          <Link to='/project/introduction'>
            <button className='bg-blue-500 text-white flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-600'>
              <Plus className='w-4 h-4 mr-1' />
              <span className='hidden sm:inline'>Project</span>
            </button>
          </Link>
        )}
      </div>

      <div className='flex items-center space-x-2 relative'>
        <NotificationBell accountId={accountId} />
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <HelpCircle className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 hover:bg-gray-100 rounded-full'>
          <Settings className='w-5 h-5 text-gray-700' />
        </button>

        {user ? (
          <div className='relative '>
            <button onClick={() => setIsMenuOpen((prev) => !prev)} className='focus:outline-none'>
              {accountResponse?.data?.picture ? (
                <img
                  src={accountResponse.data.picture}
                  alt='avatar'
                  className='w-9 h-9 rounded-full object-cover border'
                />
              ) : (
                <div className='w-9 h-9 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full'>
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50 p-4'
              >
                <div className='flex items-center space-x-3 border-b pb-3 mb-3'>
                  <div className='w-10 h-10 text-white flex items-center justify-center rounded-full font-semibold'>
                    {accountResponse?.data?.picture ? (
                      <img
                        src={accountResponse.data.picture}
                        alt='avatar'
                        className='w-10 h-10 rounded-full object-cover border'
                      />
                    ) : (
                      <div className='w-10 h-10 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full'>
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className='font-semibold text-sm'>{user.username}</div>
                    <div className='text-xs text-gray-500 break-all'>{user.email}</div>
                  </div>
                </div>
                <ul className='text-sm space-y-2'>
                  <li
                    onClick={() => navigate('/account/profile')}
                    className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'
                  >
                    <User className='w-4 h-4 text-gray-600' /> Profile
                  </li>
                  <li className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'>
                    <Settings className='w-4 h-4 text-gray-600' /> Account settings
                  </li>
                  <li className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'>
                    <Palette className='w-4 h-4 text-gray-600' /> Theme
                  </li>
                </ul>
                <hr className='my-3' />
                <button
                  onClick={() => {
                    logout();
                    navigate('/Guest');
                  }}
                  className='w-full flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-2 py-2 rounded-md font-semibold'
                >
                  <LogOut className='w-4 h-4' /> Log out
                </button>
              </div>
            )}
          </div>
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
