import { Plus, HelpCircle, Settings, PanelLeftClose, LogOut, User, Palette } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';
import { useAuth } from '../services/AuthContext';
import { useGetAccountByEmailQuery, useGetProjectsByAccountQuery } from '../services/accountApi';
import NotificationBell from '../components/NotificationBell';
import { useLazyGetWorkItemByKeyQuery } from '../services/projectApi';
import { useDebounce } from 'use-debounce';
import HelpCirclePopup from './HelpCirclePopup'; // Import the popup component

export default function Header() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [triggerSearch, { data: searchResult }] = useLazyGetWorkItemByKeyQuery();
  const [searchKey, setSearchKey] = useState('');
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const [debouncedKey] = useDebounce(searchKey, 300);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false); // New state for popup

  useEffect(() => {
    if (debouncedKey.trim()) {
      triggerSearch(debouncedKey);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedKey]);

  const handleNavigate = (item: any) => {
    const { key, type } = item;
    if (type === 'EPIC') {
      navigate(`/project/epic/${key}`);
    } else if (['TASK', 'BUG', 'STORY'].includes(type)) {
      navigate(`/project/${projectKey}/work-item-detail?taskId=${key}`);
    } else if (type === 'SUBTASK') {
      navigate(`/project/${projectKey}/child-work/${key}`);
    }
    setShowDropdown(false);
    setSearchKey('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResult?.data) {
      handleNavigate(searchResult.data);
    }
  };

  const { data: accountResponse } = useGetAccountByEmailQuery(user?.email ?? '', {
    skip: !user?.email,
  });

  const { data: projectData } = useGetProjectsByAccountQuery(user?.accessToken || '', {
    skip: !user?.accessToken,
  });

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const hasProjects = projectData?.data && projectData.data.length > 0;
    const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(
      user?.role ?? ''
    );
    if (isAccessRole && hasProjects) {
      const firstProject = projectData.data[0];
      navigate(`/project?projectKey=${firstProject.projectKey}#list`);
    } else {
      navigate('/');
    }
  };

  const isRole = accountResponse?.data?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className='w-full flex items-center justify-between px-6 py-1 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40'>
      {/* Bên trái */}
      <div className='flex items-center space-x-4 -ml-4'>
        <button className='p-2 rounded hover:bg-gray-200'>
          <PanelLeftClose className='w-5 h-5 text-gray-700' />
        </button>
        <button
          onClick={handleLogoClick}
          className='flex items-center gap-0 hover:opacity-80 cursor-pointer'
        >
          <img src={logo} className='h-10 w-auto scale-[1.2] -mr-20' />
          <img src={textLogo} className='h-9 w-auto scale-[0.36]' />
        </button>
      </div>

      {/* Ở giữa - search */}
      <div className='flex-1 mx-10 flex items-center justify-center'>
        <div className='relative w-96'>
          <form onSubmit={handleSearch} className='flex items-center'>
            <input
              type='text'
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder='Search by key...'
              className='flex-1 text-sm outline-none px-3 py-1.5 border rounded-md w-full'
            />
          </form>
          {showDropdown && searchResult?.data && (
            <div className='absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-50'>
              <div
                className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
                onClick={() => handleNavigate(searchResult.data)}
              >
                <div className='font-medium text-sm'>
                  {searchResult.data.key} — {searchResult.data.summary}
                </div>
                <div className='text-xs text-gray-500'>Type: {searchResult.data.type}</div>
                <div className='text-xs text-gray-500'>Status: {searchResult.data.status}</div>
              </div>
            </div>
          )}
        </div>
        {isRole && (
          <Link to='/project/introduction' className='ml-6'>
            <button className='bg-blue-500 text-white flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-blue-600'>
              <Plus className='w-4 h-4 mr-1' />
              <span className='hidden sm:inline'>Project</span>
            </button>
          </Link>
        )}
      </div>

      {/* Bên phải */}
      <div className='flex items-center space-x-4 relative'>
        <NotificationBell accountId={accountId} />
        <button
          className='p-2 hover:bg-gray-100 rounded-full'
          onClick={() => setIsHelpPopupOpen(true)} // Toggle popup on click
        >
          <HelpCircle className='w-5 h-5 text-gray-700' />
        </button>
        {user ? (
          <div className='relative'>
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
        <HelpCirclePopup isOpen={isHelpPopupOpen} onClose={() => setIsHelpPopupOpen(false)} />{' '}
        {/* Render popup */}
      </div>
    </header>
  );
}
