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
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import logo from '../assets/Logo_IntelliPM/Logo_NoText_NoBackgroud.png';
import textLogo from '../assets/Logo_IntelliPM/Text_IntelliPM_NoBackground.png';
import { useAuth } from '../services/AuthContext';
import { useGetAccountByEmailQuery, useGetProjectsByAccountQuery } from '../services/accountApi';
import NotificationBell from '../components/NotificationBell';
import { useLazyGetWorkItemByKeyQuery } from '../services/projectApi';
import { useDebounce } from 'use-debounce';

export default function Header() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [triggerSearch, { data: searchResult, isFetching }] = useLazyGetWorkItemByKeyQuery();
  const [searchKey, setSearchKey] = useState('');
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const [debouncedKey] = useDebounce(searchKey, 300);
  const [showDropdown, setShowDropdown] = useState(false);

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
    if (type === "EPIC") {
      navigate(`/project/epic/${key}`);
    } else if (["TASK", "BUG", "STORY"].includes(type)) {
      navigate(`/project/${projectKey}/work-item-detail?taskId=${key}`);
    } else if (type === "SUBTASK") {
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

  const { data: projectData } = useGetProjectsByAccountQuery(
    user?.accessToken || '',
    {
      skip: !user?.accessToken,
    }
  );

  const handleLogout = () => {
    logout();
    navigate('/Guest');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Kiểm tra nếu user có project
    const hasProjects = projectData?.data && projectData.data.length > 0;
    const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(user?.role ?? '');

    if (isAccessRole && hasProjects) {
      const firstProject = projectData.data[0];
      navigate(`/project?projectKey=${firstProject.projectKey}#list`);
    } else {
      navigate('/');
    }
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
        <button
          onClick={handleLogoClick}
          className='flex items-center gap-0 hover:opacity-80 cursor-pointer'
        >
          <img src={logo} className='h-10 w-auto scale-[1.2] -mr-20' />
          <img src={textLogo} className='h-9 w-auto scale-[0.36]' />
        </button>
      </div>

      <div className='flex-1 mx-4 flex items-center justify-center space-x-2'>
        <div className="relative w-80">
          <form
            onSubmit={handleSearch}
            className="flex items-center "
          >
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Search by key..."
              className="flex-1 text-sm outline-none"
            />
          </form>

          {showDropdown && searchResult?.data && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-50">
              <div
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleNavigate(searchResult.data)}
              >

                <div className="font-medium text-sm">
                  {searchResult.data.key} — {searchResult.data.summary}
                </div>
                <div className="text-xs text-gray-500">
                  Type: {searchResult.data.type}
                </div>
                <div className="text-xs text-gray-500">
                  Status: {searchResult.data.status}
                </div>
              </div>
            </div>
          )}
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