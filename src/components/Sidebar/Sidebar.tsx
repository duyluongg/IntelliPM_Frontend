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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetProjectsByAccountQuery } from '../../services/accountApi';
import { useAuth } from '../../services/AuthContext';
import projectIcon from '../../assets/projectManagement.png';

// Interface cho recentProjects
interface RecentProject {
  name: string;
  key: string;
  icon: string;
}

const menuItems = [
  { icon: <UserCircle className='w-5 h-5' />, label: 'For you' },
  { icon: <Clock className='w-5 h-5' />, label: 'Recent', hasArrow: true },
  { icon: <Star className='w-5 h-5' />, label: 'Starred', hasArrow: true },
  { icon: <AppWindow className='w-5 h-5' />, label: 'Apps' },
  { icon: <LayoutPanelTop className='w-5 h-5' />, label: 'Plans' },

  { icon: <CalendarCheck className='w-5 h-5' />, label: 'Meeting', path: '/meeting' },
  { icon: <Users className='w-5 h-5' />, label: 'Teams' },
  {
    icon: <CalendarCheck className='w-5 h-5' />,
    label: 'Create and schedule meetings ',
    path: '/pm/meeting-room',
  },
  {
    icon: <Rocket className='w-5 h-5' />, // Icon for Projects
    label: 'Projects',
    hasArrow: true,
    isDropdown: true, // Custom flag to indicate a dropdown
  },
  { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];

export default function Sidebar() {
  const [showProjects, setShowProjects] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const accessToken = user ? JSON.parse(user).accessToken : '';
  const { data: projectsData, isLoading, error } = useGetProjectsByAccountQuery(accessToken);

  const recentProjects: RecentProject[] = projectsData?.isSuccess
    ? projectsData.data.map((proj) => ({
        name: proj.projectName,
        key: proj.projectKey,
        icon: proj.iconUrl || projectIcon, // Sử dụng icon mặc định nếu không có
      }))
    : [];

  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between fixed top-0 left-0 '>
      <div className='pt-4'>
        {/* Render all menu items */}
        {menuItems.map((item, index) => {
          if (item.label === 'Projects' && item.isDropdown) {
            return (
              <div
                key={index}
                className='relative group'
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <div className='px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div
                      className='flex items-center space-x-2'
                      onClick={() => setShowProjects(!showProjects)}
                    >
                      {hovered ? (
                        <ChevronRight
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 transform ${
                            showProjects ? 'rotate-90' : 'rotate-0'
                          }`}
                        />
                      ) : (
                        item.icon
                      )}
                      <span>{item.label}</span>
                    </div>

                    {(hovered || showProjects) && (
                      <div className='flex items-center space-x-2'>
                        <span title='New project'>
                          <Plus
                            className='w-4 h-4 hover:text-blue-500 cursor-pointer'
                            onClick={() => navigate('/create-project/project-introduction')}
                          />
                        </span>
                        <span title='Manage'>
                          <MoreHorizontal className='w-4 h-4 hover:text-blue-500' />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📂 Danh sách project xổ xuống */}
                {showProjects && (
                  <div className='mt-1 pl-10 pr-4'>
                    <div className='text-gray-500 text-xs mb-1'>Recent</div>
                    {isLoading ? (
                      <div className='text-sm text-gray-500 py-1'>Loading projects...</div>
                    ) : error ? (
                      <div className='text-sm text-red-500 py-1'>
                        Error loading projects: {error.toString()}
                      </div>
                    ) : recentProjects.length === 0 ? (
                      <div className='text-sm text-gray-500 py-1'>No projects found</div>
                    ) : (
                      recentProjects.map((proj, i) => (
                        <Link
                          key={i}
                          to={`/projects?projectKey=${proj.key}`}
                          className='flex items-center space-x-2 py-1 px-2 rounded hover:bg-gray-100 text-sm text-gray-800 no-underline'
                          onClick={() => setShowProjects(false)}
                        >
                          <img src={projectIcon} alt='Project icon' className='w-6 h-6' />
                          <span className='truncate'>{proj.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          } else if (item.path) {
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
          } else {
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
          }
        })}
      </div>

      {/* Sign out */}
      <div className='text-sm text-gray-600 px-4 py-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center space-x-2'>
        <LogOut className='w-4 h-4 text-red-500' />
        <button onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
}
