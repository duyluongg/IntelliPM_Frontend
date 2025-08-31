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
  AlertTriangle,
  UserPlus

} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetProjectsByAccountQuery } from '../../services/accountApi';
import { useAuth } from '../../services/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import projectIcon from '../../assets/projectManagement.png';
import {
  useGetHealthDashboardQuery,
  useCalculateMetricsBySystemMutation,
} from '../../services/projectMetricApi';
import { useRef } from 'react';

interface RecentProject {
  name: string;
  key: string;
  icon: string;
}

const menuItems = [
// { icon: <UserCircle className='w-5 h-5' />, label: 'For you' },
  // { icon: <Clock className='w-5 h-5' />, label: 'Recent', hasArrow: true },
  // { icon: <Star className='w-5 h-5' />, label: 'Starred', hasArrow: true },
  // { icon: <AppWindow className='w-5 h-5' />, label: 'Apps' },
  // { icon: <LayoutPanelTop className='w-5 h-5' />, label: 'Plans' },
  { icon: <UserPlus className='w-5 h-5' />, label: 'Invitees Member', path: '/project/invitees-member' },
  { icon: <CalendarCheck className='w-5 h-5' />, label: 'Meeting', path: '/meeting' },
  { icon: <Users className='w-5 h-5' />, label: 'Teams', path: '/account/teams-history' },
  {
    icon: <Rocket className='w-5 h-5' />,
    label: 'Projects',
    isDropdown: true,
    hasArrow: true,
  },
  // { icon: <MoreHorizontal className='w-5 h-5' />, label: 'More' },
];

export default function Sidebar() {
  const [showProjects, setShowProjects] = useState(false);
  const [showManageProjects, setShowManageProjects] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<{ [key: string]: boolean }>({});
  const [searchParams] = useSearchParams();
  const selectedProjectKey = searchParams.get('projectKey');

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // chuẩn hóa role
  const rawRole = (user?.role ?? '').toString().trim();
  const isClient = rawRole.toUpperCase() === 'CLIENT';
  const isRoleManager = rawRole === 'PROJECT_MANAGER' || rawRole === 'TEAM_LEADER';
  const isRoleProjectManager = rawRole === 'PROJECT_MANAGER';
  const canViewProjectMembers = rawRole !== 'TEAM_MEMBER' && rawRole !== 'TEAM_LEADER';

  const {
    data: projectsData,
    isLoading,
    error,
  } = useGetProjectsByAccountQuery(user?.accessToken || '');

  // đảm bảo luôn là array
  const projectsRaw = Array.isArray(projectsData?.data) ? projectsData!.data : [];

  const recentProjects: RecentProject[] = projectsRaw
    .filter((proj: any) => {
      if (isRoleManager) return proj.status === 'ACTIVE';
      return proj.status === 'ACTIVE' && proj.projectStatus !== 'PLANNING';
    })
    .sort((a: any, b: any) => b.projectId - a.projectId)
    .map((proj: any) => ({
      name: proj.projectName,
      key: proj.projectKey,
      icon: proj.iconUrl || projectIcon,
    }));

  // Trigger metric calculation for each project only on initial mount
  // const [calculate] = useCalculateMetricsBySystemMutation();
  // const hasCalculated = useRef(false); // Track if metrics have been calculated

  // useEffect(() => {
  //   if (hasCalculated.current || recentProjects.length === 0) return;

  //   const calculateMetrics = async () => {
  //     try {
  //       hasCalculated.current = true; // Mark as calculated
  //       await Promise.all(
  //         recentProjects.map((proj) =>
  //           calculate({ projectKey: proj.key }).unwrap()
  //         )
  //       );
  //     } catch (err) {
  //       console.error('❌ Error calculating metrics for projects:', err);
  //     }
  //   };

  //   calculateMetrics();
  // }, []);

  useEffect(() => {
    // console.log('[Sidebar] role=', user?.role, 'isClient=', isClient);
  }, [user?.role, isClient]);

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

  // client click → đi thẳng timeline bằng hash
  const clientProjectHref = (key: string) => `/project?projectKey=${key}#timeline`;

  const allowedLabelsForClient = ['Meeting', 'For you', 'Projects'];
  const visibleMenuItems = isClient
    ? menuItems.filter((item) => allowedLabelsForClient.includes(item.label))
    : menuItems;

  return (
    <aside className='w-56 h-screen border-r bg-white flex flex-col justify-between fixed top-0 left-0 z-10'>
      <div className='pt-4'>
        {isRoleManager && (
          <Link
            to='/project/invitees-member'
            className='flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors no-underline'
          >
            <div className='flex items-center space-x-2'>
              <UserPlus className='w-5 h-5' />
              <span>Invitees Member</span>
            </div>
          </Link>
        )}

        {visibleMenuItems.map((item, index) => {
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
                    setShowProjects((prev) => !prev);
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
                        {isRoleManager && (
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
                              {isRoleManager && (
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
                  <div className='mt-1 pl-5 pr-3 max-h-60 overflow-y-auto'>
                    {isLoading ? (
                      <div className='text-sm text-gray-500 py-1'>Loading projects...</div>
                    ) : error ? (
                      <div className='text-sm text-red-500 py-1'>Error: {String(error)}</div>
                    ) : recentProjects.length === 0 ? (
                      <div className='text-sm text-gray-500 py-1'>No projects found</div>
                    ) : (
                      recentProjects.map((proj, i) => {
                        const isSelected = proj.key === selectedProjectKey;
                        return (
                          <div key={i} className='relative group/project'>
                            <div
                              className={`flex items-center justify-between py-1 px-2 rounded ${
                                isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                              }`}
                            >
                              <Link
                                to={
                                  isClient
                                    ? clientProjectHref(proj.key) // CLIENT → vào thẳng timeline
                                    : `/project?projectKey=${proj.key}` // role khác → trang project mặc định
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className={`flex items-center space-x-2 text-sm no-underline ${
                                  isSelected
                                    ? 'text-blue-700 font-medium'
                                    : 'text-gray-800 hover:bg-gray-100'
                                }`}
                              >
                                <img src={proj.icon} alt='Project icon' className='w-6 h-6' />
                                <span className='truncate relative group/name max-w-[110px]'>
                                  {shortenProjectName(proj.name)}
                                  <span className='absolute invisible group-hover/name:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-fit z-20'>
                                    {proj.name}
                                  </span>
                                </span>
                              </Link>

                              {/* 3 chấm chỉ hiện với non-client */}
                              {!isClient && (
                                <div
                                  className='p-1 border border-gray-200 rounded invisible group-hover/project:visible hover:bg-gray-100 transition-colors'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProjectDetail(proj.key);
                                  }}
                                >
                                  <MoreHorizontal className='w-4 h-4 text-gray-500 hover:text-blue-500 cursor-pointer' />
                                </div>
                              )}
                            </div>

                            {/* Dropdown chi tiết: ẩn với CLIENT */}
                            {!isClient && (
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
                                    {canViewProjectMembers && (
                                      <div
                                        onClick={() => handleTeamMemberClick(proj.key)}
                                        className='flex items-center space-x-2 py-2 px-4 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer'
                                      >
                                        <Users className='w-5 h-5 text-gray-500' />
                                        <span>Project Member</span>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
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
