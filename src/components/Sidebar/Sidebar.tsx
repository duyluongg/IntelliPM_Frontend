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
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProjectsByAccountQuery } from '../../services/accountApi';
import { useAuth } from '../../services/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import projectIcon from '../../assets/projectManagement.png';

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
    icon: <Rocket className='w-5 h-5' />,
    label: 'Projects',
    isDropdown: true,
    hasArrow: true,
  },
  { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];

export default function Sidebar() {
  const [showProjects, setShowProjects] = useState(false);
  const [showManageProjects, setShowManageProjects] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const selectedProjectKey = searchParams.get('projectKey');

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isRole = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

  const {
    data: projectsData,
    isLoading,
    error,
  } = useGetProjectsByAccountQuery(user?.accessToken || '');

 const recentProjects: RecentProject[] = projectsData?.isSuccess
  ? projectsData.data
      .filter(
        (proj) =>
         // proj.projectStatus === 'ACTIVE' &&
          proj.status === 'ACTIVE'
      )
      .map((proj) => ({
        name: proj.projectName,
        key: proj.projectKey,
        icon: proj.iconUrl || projectIcon,
      }))
  : [];

useEffect(() => {
}, [selectedProjectKey, recentProjects]);


  const handleLogout = () => {
    logout();
    navigate('/Guest');
  };

  const handleViewAllProjectsManage = () => {
    setShowManageProjects(false);
    navigate('/project/manage');
  };
  const handleViewAllProjects = () => {
    setShowManageProjects(false);
    navigate('/project/list');
  };

  const shortenProjectName = (name: string, maxLength: number = 18) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const handleProjectDetailClick = (projectKey: string) => {
    setShowProjectDetail(null);
    navigate(`/project/${projectKey}/summary`);
  };

  const handleTeamMemberClick = (projectKey: string) => {
    setShowProjectDetail(null);
    navigate(`/project/${projectKey}/team-members`);
  };

  return (
    <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between fixed top-0 left-0 z-10'>
      <div className='pt-4'>
        {menuItems.map((item, index) => {
          if (item.label === 'Projects' && item.isDropdown) {
            return (
              <div
                key={index}
                className='relative group'
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                  setHovered(false);
                  setShowManageProjects(false);
                  setShowProjectDetail(null);
                }}
              >
                <div
                  className='px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors'
                  onClick={() => {
                    setShowProjects((prev) => !prev); // Toggle dropdown mở/đóng
                    setShowManageProjects(false);
                    setShowProjectDetail(null);
                  }}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      {hovered || showProjects ? (
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
                      <div className='flex items-center space-x-2 relative'>
                        {isRole && (
                          <Plus
                            className='w-4 h-4 hover:text-blue-500 cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/project/introduction');
                            }}
                          />
                        )}
                        <MoreHorizontal
                          className='w-4 h-4 hover:text-blue-500 cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowManageProjects((prev) => !prev);
                            setShowProjectDetail(null);
                          }}
                        />
                        <AnimatePresence>
                          {showManageProjects && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className='absolute top-0 left-full ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20'
                            >
                              {isRole && (
                                <div
                                  onClick={handleViewAllProjectsManage}
                                  className='flex items-center space-x-2 py-2 px-4 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer'
                                >
                                  <Settings className='w-5 h-5 text-gray-500' />
                                  <span>Manage Projects</span>
                                </div>
                              )}

                              <div
                                onClick={handleViewAllProjects}
                                className='flex items-center space-x-2 py-2 px-4 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer'
                              >
                                <Rocket className='w-5 h-5 text-gray-500' />
                                <span>Projects</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                {showProjects && (
                  <div className='mt-1 pl-10 pr-4 max-h-64 overflow-y-auto'>
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
                          <div key={i} className='relative'>
                            <div
                              className={`group grid grid-cols-[1fr,auto] gap-x-2 items-center py-1 px-2 rounded ${
                                isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className='flex items-center space-x-2'>
                                <Link
                                  to={`/project?projectKey=${proj.key}`}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Ngăn không đóng dropdown khi chọn project
                                  }}
                                  className={`flex items-center space-x-2 text-sm no-underline ${
                                    isSelected
                                      ? 'text-blue-700 font-medium'
                                      : 'text-gray-800 hover:bg-gray-100'
                                  }`}
                                >
                                  <img src={proj.icon} alt='Project icon' className='w-6 h-6' />
                                  <span className='truncate relative group/name max-w-[100px]'>
                                    {shortenProjectName(proj.name)}
                                    <span className='absolute invisible group-hover/name:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-fit z-20'>
                                      {proj.name}
                                    </span>
                                  </span>
                                </Link>
                              </div>

                              <div className='relative'>
                                <div
                                  className='p-1 border border-gray-200 rounded invisible group-hover:visible hover:bg-gray-100 transition-colors relative'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProjectDetail(proj.key);
                                  }}
                                >
                                  <MoreHorizontal className='w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer' />
                                </div>

                                <AnimatePresence>
                                  {showProjectDetail === proj.key && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      transition={{ duration: 0.2 }}
                                      className='absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20'
                                    >
                                      <div
                                        onClick={() => handleProjectDetailClick(proj.key)}
                                        className='flex items-center space-x-2 py-2 px-4 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer'
                                      >
                                        <Rocket className='w-5 h-5 text-gray-500' />
                                        <span>Project Detail</span>
                                      </div>

                                      <div
                                        onClick={() => handleTeamMemberClick(proj.key)}
                                        className='flex items-center space-x-2 py-2 px-4 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer'
                                      >
                                        <Users className='w-5 h-5 text-gray-500' />
                                        <span>Project Member</span>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
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
