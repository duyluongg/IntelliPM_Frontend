import { Home, Users, AlertTriangle, Rocket, LogOut, ChevronRight, Plus, MoreHorizontal, BarChart2, Settings, PieChart } from 'lucide-react';
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

interface SidebarProps {
  isCollapsed: boolean;
}

const menuItems = [
  { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
  { icon: <Users className="w-5 h-5" />, label: 'Members', path: '/members' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Risks', path: '/risks' },
  { icon: <BarChart2 className="w-5 h-5" />, label: 'Reports', path: '/reports' },
  { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', path: '/analytics' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  {
    icon: <Rocket className="w-5 h-5" />,
    label: 'Projects',
    isDropdown: true,
    hasArrow: true,
  },
];

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const [showProjects, setShowProjects] = useState(false);
  const [showManageProjects, setShowManageProjects] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const selectedProjectKey = searchParams.get('projectKey');

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isRole = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';

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

  const handleViewAllProjects = () => {
    setShowManageProjects(false);
    navigate('/project/list');
  };

  const shortenProjectName = (name: string, maxLength: number = 10) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  const handleProjectDetailClick = (projectKey: string) => {
    setShowProjectDetail(null);
    setShowProjects(false);
    navigate(`/project/${projectKey}/summary`);
  };

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 60 : 200 }}
      animate={{ width: isCollapsed ? 60 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`h-screen border-r bg-gradient-to-b from-white to-gray-50 flex flex-col justify-between fixed top-0 left-0 z-10 shadow-lg ${
        isCollapsed ? 'w-16' : 'w-44'
      }`}
    >
      <div className="pt-4">
        {menuItems.map((item, index) => {
          if (item.label === 'Projects' && item.isDropdown) {
            return (
              <motion.div
                key={index}
                className="relative group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                  setHovered(false);
                  setShowManageProjects(false);
                  setShowProjectDetail(null);
                }}
                whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setShowProjects((prev) => !prev);
                    setShowManageProjects(false);
                    setShowProjectDetail(null);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {hovered && !isCollapsed ? (
                        <ChevronRight
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 transform ${
                            showProjects ? 'rotate-90' : ''
                          }`}
                        />
                      ) : (
                        item.icon
                      )}
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </div>
                    {(hovered || showProjects) && !isCollapsed && (
                      <div className="flex items-center space-x-2 relative">
                        {isRole && (
                          <Plus
                            className="w-4 h-4 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/project/introduction');
                            }}
                          />
                        )}
                        <MoreHorizontal
                          className="w-4 h-4 hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowManageProjects((prev) => !prev);
                            setShowProjectDetail(null);
                          }}
                        />
                        <AnimatePresence>
                          {showManageProjects && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-0 left-full ml-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-20"
                            >
                              <div
                                onClick={handleViewAllProjects}
                                className="flex items-center space-x-2 py-1 px-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors"
                              >
                                <Rocket className="w-4 h-4 text-gray-500" />
                                <span>Manage Projects</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showProjects && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="mt-1 pl-6 pr-3"
                    >
                      <div className="text-gray-500 text-xs mb-1 font-semibold">Recent</div>
                      {isLoading ? (
                        <div className="text-sm text-gray-500 py-1">Loading projects...</div>
                      ) : error ? (
                        <div className="text-sm text-red-500 py-1">Failed to load projects.</div>
                      ) : recentProjects.length === 0 ? (
                        <div className="text-sm text-gray-500 py-1">No projects found</div>
                      ) : (
                        recentProjects.map((proj, i) => {
                          const isSelected = proj.key === selectedProjectKey;
                          return (
                            <motion.div
                              key={i}
                              className="relative"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: i * 0.1 }}
                            >
                              <div
                                className={`group grid grid-cols-[1fr,auto] gap-x-1 items-center py-1 px-2 rounded ${
                                  isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                                } transition-colors duration-200`}
                              >
                                <div className="flex items-center space-x-1">
                                  <Link
                                    to={`/project?projectKey=${proj.key}`}
                                    onClick={() => setShowProjects(false)}
                                    className={`flex items-center space-x-1 text-sm no-underline ${
                                      isSelected
                                        ? 'text-blue-700 font-medium'
                                        : 'text-gray-800 hover:text-blue-600'
                                    } transition-colors`}
                                  >
                                    <img src={proj.icon} alt={`${proj.name} icon`} className="w-5 h-5 rounded-full" />
                                    <span className="truncate relative group/name max-w-[70px]">
                                      {shortenProjectName(proj.name)}
                                      <span className="absolute invisible group-hover/name:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-1 max-w-fit z-20">
                                        {proj.name}
                                      </span>
                                    </span>
                                  </Link>
                                </div>

                                <div className="relative">
                                  <div
                                    className="p-1 border border-gray-200 rounded invisible group-hover:visible hover:bg-gray-100 transition-colors relative"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowProjectDetail(proj.key);
                                    }}
                                  >
                                    <MoreHorizontal className="w-3 h-3 text-gray-500 hover:text-blue-600 cursor-pointer" />
                                  </div>

                                  <AnimatePresence>
                                    {showProjectDetail === proj.key && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-20"
                                      >
                                        <div
                                          onClick={() => handleProjectDetailClick(proj.key)}
                                          className="flex items-center space-x-2 py-1 px-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                          <Rocket className="w-4 h-4 text-gray-500" />
                                          <span>Project Detail</span>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={index}
              whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={item.path || '#'}
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors duration-200 no-underline"
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </div>
                {item.hasArrow && !isCollapsed && <ChevronRight className="w-4 h-4 text-gray-400" />}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        transition={{ duration: 0.2 }}
        onClick={handleLogout}
        className="text-sm text-gray-600 px-3 py-2 border-t border-gray-200 hover:bg-red-50 cursor-pointer flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4 text-red-500" />
        {!isCollapsed && <span className="font-medium text-sm">Sign out</span>}
      </motion.div>
    </motion.aside>
  );
}