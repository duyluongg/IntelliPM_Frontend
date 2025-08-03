import {
  UserCircle,
  Clock,
  Star,
  AppWindow,
  LayoutPanelTop,
  Rocket,
  Users,
  MoreHorizontal,
  ChevronRight,
  LogOut,
  CalendarCheck,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProjectsByAccountQuery } from '../../services/accountApi';
import { useAuth } from '../../services/AuthContext';
import projectIcon from '../../assets/projectManagement.png';

interface RecentProject {
  name: string;
  key: string;
  icon: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  hasArrow?: boolean;
  isDropdown?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: <UserCircle className='w-5 h-5' />, label: 'For you' },
  { icon: <Clock className='w-5 h-5' />, label: 'Recent', hasArrow: true },
  { icon: <Star className='w-5 h-5' />, label: 'Starred', hasArrow: true },
  { icon: <AppWindow className='w-5 h-5' />, label: 'Apps', path: '/app'},
  { icon: <LayoutPanelTop className='w-5 h-5' />, label: 'Plans' },
  { icon: <CalendarCheck className='w-5 h-5' />, label: 'Meeting', path: '/meeting' },
  { icon: <Users className='w-5 h-5' />, label: 'Teams' },
  {
    icon: <Rocket className='w-5 h-5' />,
    label: 'Projects',
    isDropdown: true,
    hasArrow: true,
  },
  { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];


export default function Sidebar() {
  const [showProjects, setShowProjects] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedProjectKey = searchParams.get('projectKey');

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isRole = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
console.log("User Role: ", user?.role);

  const { data: projectsData, isLoading, error } = useGetProjectsByAccountQuery(user?.accessToken || '');

  const recentProjects: RecentProject[] = projectsData?.isSuccess
    ? projectsData.data.map((proj) => ({
        name: proj.projectName,
        key: proj.projectKey,
        icon: proj.iconUrl || projectIcon,
      }))
    : [];

  useEffect(() => {
    if (selectedProjectKey && recentProjects.some((p) => p.key === selectedProjectKey)) {
      setShowProjects(true);
    }
  }, [selectedProjectKey, recentProjects]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 👇 Chỉ cho CLIENT thấy các mục này
const allowedLabelsForClient = ['Meeting', 'For you'];

const visibleMenuItems = user?.role === 'CLIENT'
  ? menuItems.filter((item) =>
      allowedLabelsForClient.includes(item.label)
    )
  : menuItems;



  return (
    <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between fixed top-0 left-0 z-10'>
      <div className='pt-4'>
        {visibleMenuItems.map((item, index) => {
            if (item.label === 'Projects' && item.isDropdown) {
              return (
                <div
                  key={index}
                  className='relative group'
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div
                    className='px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
                    onClick={() => setShowProjects((prev) => !prev)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        {hovered ? (
                          <ChevronRight
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 transform ${
                              showProjects ? 'rotate-90' : ''
                            }`}
                          />
                        ) : (
                          item.icon
                        )}
                        <span>{item.label}</span>
                      </div>
                      {(hovered || showProjects) && (
                        <div className='flex items-center space-x-2'>
                          {isRole && (
                            <Plus
                              className='w-4 h-4 hover:text-blue-500 cursor-pointer'
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/project/introduction');
                              }}
                            />
                          )}
                          <MoreHorizontal className='w-4 h-4 hover:text-blue-500' />
                        </div>
                      )}
                    </div>
                  </div>

                  {showProjects && (
                    <div className='mt-1 pl-10 pr-4'>
                      <div className='text-gray-500 text-xs mb-1'>Recent</div>
                      {isLoading ? (
                        <div className='text-sm text-gray-500 py-1'>Loading projects...</div>
                      ) : error ? (
                        <div className='text-sm text-red-500 py-1'>Error: {error.toString()}</div>
                      ) : recentProjects.length === 0 ? (
                        <div className='text-sm text-gray-500 py-1'>No projects found</div>
                      ) : (
                        recentProjects.map((proj, i) => {
                          const isSelected = proj.key === selectedProjectKey;
                          return (
                            <Link
                              key={i}
                              to={`/project?projectKey=${proj.key}`}
                              onClick={() => setShowProjects(false)}
                              className={`flex items-center space-x-2 py-1 px-2 rounded text-sm no-underline ${
                                isSelected
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <img src={proj.icon} alt='Project icon' className='w-6 h-6' />
                              <span className='truncate'>{proj.name}</span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (item.path) {
              return (
                <Link
                  key={index}
                  to={item.path}
                  className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors no-underline'
                >
                  <div className='flex items-center space-x-2'>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.hasArrow && <ChevronRight className='w-4 h-4 text-gray-400' />}
                </Link>
              );
            }

            return (
              <div
                key={index}
                className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
              >
                <div className='flex items-center space-x-2'>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.hasArrow && <ChevronRight className='w-4 h-4 text-gray-400' />}
              </div>
            );
          })}
      </div>

      <div
        onClick={handleLogout}
        className='text-sm text-gray-600 px-4 py-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center space-x-2'
      >
        <LogOut className='w-4 h-4 text-red-500' />
        <button>Sign out</button>
      </div>
    </aside>
  );
}
