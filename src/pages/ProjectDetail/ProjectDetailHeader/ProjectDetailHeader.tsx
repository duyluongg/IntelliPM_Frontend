import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useAuth } from '../../../services/AuthContext';
import projectIcon from '../../../assets/projectManagement.png';

import {
  Users2,
  Globe,
  CalendarDays,
  List as ListIcon,
  ClipboardList,
  ClipboardCheck,
  Flag,
  Archive,
  FileText,
  PackagePlus,
  ChartNoAxesGantt,
  ChartNoAxesCombined,
  FileWarning,
  Sheet,
  Link as LucideLink,
} from 'lucide-react';

const navItems = [
  { label: 'Timeline', icon: <CalendarDays className='w-4 h-4' />, path: 'timeline' },
  { label: 'Backlog', icon: <ClipboardList className='w-4 h-4' />, path: 'backlog' },
  { label: 'Board', icon: <ClipboardCheck className='w-4 h-4' />, path: 'board' },
  { label: 'Calendar', icon: <CalendarDays className='w-4 h-4' />, path: 'calendar' },
  { label: 'List', icon: <ListIcon className='w-4 h-4' />, path: 'list' },
  { label: 'Forms', icon: <FileText className='w-4 h-4' />, path: 'forms' },
  { label: 'Risk', icon: <FileWarning className='w-4 h-4' />, path: 'risk' },
  { label: 'Dashboard', icon: <ChartNoAxesCombined className='w-4 h-4' />, path: 'dashboard' },
  { label: 'Gantt', icon: <ChartNoAxesGantt className='w-4 h-4' />, path: 'gantt-chart' },
  { label: 'Sheet', icon: <Sheet className='w-4 h-4' />, path: 'sheet' },
  { label: 'All work', icon: <Users2 className='w-4 h-4' />, path: 'all-work' },
  { label: 'Goals', icon: <Flag className='w-4 h-4' />, path: 'goals' },
  { label: 'Summary', icon: <Globe className='w-4 h-4' />, path: 'summary' },
  { label: 'Archived work items', icon: <Archive className='w-4 h-4' />, path: 'archived' },
  { label: 'Pages', icon: <FileText className='w-4 h-4' />, path: 'pages' },
  { label: 'Shortcuts', icon: <LucideLink className='w-4 h-4' />, path: 'shortcuts' },
  { label: 'Releases', icon: <PackagePlus className='w-4 h-4' />, path: 'releases' },
  { label: 'Tests', icon: <PackagePlus className='w-4 h-4' />, path: 'tests' },
];

const CLIENT_ALLOWED = ['timeline'];

const ProjectDetailHeader: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(navItems);
  const [hiddenTabs, setHiddenTabs] = useState<typeof navItems>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLLIElement>(null);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const activeTab = useMemo(() => location.hash.replace('#', '') || 'list', [location.hash]);

  // Lấy role từ AuthContext giống Sidebar
  const { user } = useAuth();
  const rawRole = (user?.role ?? '').toString().trim();
  const isClient = rawRole.toUpperCase() === 'CLIENT';

  // Lọc nav theo role
  const allowedNav = useMemo(() => {
    return isClient ? navItems.filter((i) => CLIENT_ALLOWED.includes(i.path)) : navItems;
  }, [isClient]);

  const { data: projectDetails, isLoading, error } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectIconUrl = projectDetails?.data?.iconUrl || projectIcon;

  const updateTabs = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const tabWidth = 100;
    const maxVisible = Math.floor(containerWidth / tabWidth);

    if (maxVisible < allowedNav.length) {
      setVisibleTabs(allowedNav.slice(0, maxVisible));
      setHiddenTabs(allowedNav.slice(maxVisible));
    } else {
      setVisibleTabs(allowedNav);
      setHiddenTabs([]);
    }
  };

  useEffect(() => {
    updateTabs();
    window.addEventListener('resize', updateTabs);
    return () => window.removeEventListener('resize', updateTabs);
  }, [allowedNav]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chặn truy cập tab khác: CLIENT ⇒ ép về timeline
  useEffect(() => {
    if (isClient && activeTab !== 'timeline') {
      navigate(`?projectKey=${projectKey}#timeline`, { replace: true });
    }
  }, [isClient, activeTab, navigate, projectKey]);

  return (
    <div className='mx-6 pt-6 relative'>
      <nav aria-label='Breadcrumbs' className='mb-4'>
        <ol className='flex items-center space-x-2 text-sm text-gray-600'>
          <li>
            <a href='/projects' className='hover:text-blue-600'>
              Projects
            </a>
          </li>
        </ol>
      </nav>

      <div className='flex items-center gap-2'>
        <img src={projectIconUrl} alt='Project Icon' className='w-6 h-6 rounded' />
        <h1 className='text-lg font-semibold'>
          {isLoading
            ? 'Loading...'
            : error
            ? 'Error loading project'
            : projectDetails?.data?.name || 'Not Found'}
        </h1>
      </div>

      <nav className='mt-4 relative' ref={containerRef}>
        <ul className='flex items-center gap-6 border-b border-gray-200 pb-1'>
          {visibleTabs.map((item, idx) => (
            <li key={idx} className='flex items-center relative group'>
              <Link
                to={`?projectKey=${projectKey}#${item.path}`}
                className={`flex items-center gap-1 text-sm pb-1 border-b-2 transition-all duration-200 ${
                  activeTab === item.path
                    ? 'text-blue-600 border-blue-600 font-medium'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}

          {/* CLIENT thì không hiển thị nút More luôn */}
          {!isClient && hiddenTabs.length > 0 && (
            <li className='relative' ref={moreButtonRef}>
              <button
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                className='flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1'
              >
                <span>More</span>
                <span className='w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center justify-center'>
                  {hiddenTabs.length}
                </span>
              </button>

              {isPopupOpen && (
                <div className='absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-md z-50 rounded'>
                  <ul>
                    {hiddenTabs.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={`?projectKey=${projectKey}#${item.path}`}
                          className={`flex items-center gap-2 w-full py-2 px-4 hover:bg-gray-100 ${
                            activeTab === item.path ? 'text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                          onClick={() => setIsPopupOpen(false)}
                        >
                          {item.icon}
                          <span className='truncate'>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default ProjectDetailHeader;
