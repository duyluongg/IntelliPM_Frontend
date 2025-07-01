// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import projectIcon from '../../../assets/projectManagement.png';

// import {
//   Users2,
//   MoreHorizontal,
//   Globe,
//   CalendarDays,
//   List,
//   ClipboardList,
//   ClipboardCheck,
//   Flag,
//   Code2,
//   Archive,
//   FileText,
//   PackagePlus,
//   Link as LucideLink ,
// } from 'lucide-react';

// import { Link } from 'react-router-dom';

// const navItems = [
//   { label: 'Summary', icon: <Globe className='w-4 h-4' />, path: 'summary' },
//   { label: 'Timeline', icon: <CalendarDays className='w-4 h-4' />, path: 'timeline' },
//   { label: 'Backlog', icon: <ClipboardList className='w-4 h-4' />, path: 'backlog' },
//   { label: 'Board', icon: <ClipboardCheck className='w-4 h-4' />, path: 'board' },
//   { label: 'Calendar', icon: <CalendarDays className='w-4 h-4' />, path: 'calendar' },
//   { label: 'List', icon: <List className='w-4 h-4' />, path: 'list' },
//   { label: 'Forms', icon: <FileText className='w-4 h-4' />, path: 'forms' },
//   { label: 'Goals', icon: <Flag className='w-4 h-4' />, path: 'goals' },
//   { label: 'All work', icon: <Users2 className='w-4 h-4' />, path: 'all-work' },
//   { label: 'Code', icon: <Code2 className='w-4 h-4' />, path: 'code' },
//   { label: 'Archived work items', icon: <Archive className='w-4 h-4' />, path: 'archived' },
//   { label: 'Pages', icon: <FileText className='w-4 h-4' />, path: 'pages' },
//   { label: 'Shortcuts', icon: <LucideLink className='w-4 h-4' />, path: 'shortcuts' },
//   { label: 'Releases', icon: <PackagePlus className='w-4 h-4' />, path: 'releases' },
// ];

// interface NavItem {
//   label: string;
//   icon: React.ReactNode;
// }

// const ProjectDetailHeader: React.FC = () => {
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [visibleTabs, setVisibleTabs] = useState(navItems);
//   const [hiddenTabs, setHiddenTabs] = useState<NavItem[]>([]);
//   const [activeTab, setActiveTab] = useState('List');
//   const containerRef = useRef<HTMLDivElement>(null);
//   const moreButtonRef = useRef<HTMLLIElement>(null);
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';

//   const { data: projectDetails, isLoading, error } = useGetProjectDetailsByKeyQuery(projectKey);

//   const togglePopup = () => {
//     setIsPopupOpen(!isPopupOpen);
//   };

//   const projectIconUrl = projectDetails?.data?.iconUrl || projectIcon;

//   useEffect(() => {
//     const updateTabs = () => {
//       if (containerRef.current) {
//         const containerWidth = containerRef.current.offsetWidth;
//         const tabWidth = 100;
//         const maxVisible = Math.floor(containerWidth / tabWidth);

//         if (maxVisible < navItems.length) {
//           setVisibleTabs(navItems.slice(0, maxVisible));
//           setHiddenTabs(navItems.slice(maxVisible));
//         } else {
//           setVisibleTabs(navItems);
//           setHiddenTabs([]);
//         }
//       }
//     };

//     updateTabs();
//     window.addEventListener('resize', updateTabs);
//     return () => window.removeEventListener('resize', updateTabs);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         moreButtonRef.current &&
//         !moreButtonRef.current.contains(event.target as Node) &&
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setIsPopupOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const currentPath = window.location.hash.split('/').pop();
//     if (currentPath) {
//       const matchedTab = navItems.find((item) => item.label.toLowerCase() === currentPath);
//       if (matchedTab) setActiveTab(matchedTab.label);
//     }
//   }, []);
//   const projectName = isLoading
//     ? 'Loading...'
//     : error
//     ? 'Error loading project'
//     : projectDetails?.data?.name || 'Not Found';

//   return (
//     <div className='mx-6 pt-6 relative'>
//       <nav aria-label='Breadcrumbs' className='mb-4'>
//         <ol className='flex items-center space-x-2 text-sm text-gray-600'>
//           <li>
//             <a href='/projects' className='hover:text-blue-600'>
//               Projects
//             </a>
//           </li>
//         </ol>
//       </nav>

//       <div className='flex items-center gap-2'>
//         <img src={projectIconUrl} alt='Project Icon' className='w-6 h-6 rounded' />
//         <h1 className='text-lg font-semibold'>{projectName}</h1>
//         <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Team'>
//           <Users2 className='w-4 h-4' />
//         </button>
//         <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='More actions'>
//           <MoreHorizontal className='w-4 h-4' />
//         </button>
//         <div className='ml-auto flex items-center space-x-2'>
//           <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Fullscreen'>
//             <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
//               <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
//               <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
//             </svg>
//           </button>
//           <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Share'>
//             <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
//               <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
//             </svg>
//           </button>
//           <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Automation'>
//             <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
//               <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
//             </svg>
//           </button>
//         </div>
//       </div>

//       <nav aria-label='Project navigation' className='mt-4 relative' ref={containerRef}>
//         <ul className='flex items-center gap-6 border-b border-gray-200 pb-1'>
//           {visibleTabs.map((item, idx) => (
//             <li key={idx} className='flex items-center relative group'>
//               {/* <a
//                 href={`#/${item.label.toLowerCase()}`}
//                 className={`flex items-center gap-1 text-sm pb-1 border-b-2 transition-all duration-200 
//                    ${
//                      activeTab === item.label
//                        ? 'text-blue-600 border-blue-600 font-medium'
//                        : 'text-gray-600 border-transparent group-hover:text-blue-600 group-hover:border-blue-600'
//                    }`}
//                 onClick={() => setActiveTab(item.label)}
//               >
//                 <span className='relative flex items-center'>
//                   <span className='default-icon group-hover:hidden'>{item.icon}</span>
//                   <MoreHorizontal className='w-4 h-4 hidden group-hover:inline-block text-gray-500' />
//                 </span>
//                 <span>{item.label}</span>
//               </a> */}
//               <Link
//                 to={`?projectKey=${projectKey}#${item.path}`}
//                 className={`flex items-center gap-1 text-sm pb-1 border-b-2 transition-all duration-200 
//                    ${
//                      activeTab === item.label
//                        ? 'text-blue-600 border-blue-600 font-medium'
//                        : 'text-gray-600 border-transparent group-hover:text-blue-600 group-hover:border-blue-600'
//                    }`}
//                 onClick={() => setActiveTab(item.label)}
//               >
//                 <span className='relative flex items-center'>
//                   <span className='default-icon group-hover:hidden'>{item.icon}</span>
//                   <MoreHorizontal className='w-4 h-4 hidden group-hover:inline-block text-gray-500' />
//                 </span>
//                 <span>{item.label}</span>
//               </Link>
//             </li>
//           ))}
//           {hiddenTabs.length > 0 && (
//             <li className='relative' ref={moreButtonRef}>
//               <button
//                 onClick={togglePopup}
//                 className='flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1'
//                 aria-label='More tabs'
//               >
//                 <span>More</span>
//                 <span className='flex items-center justify-center w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded-full'>
//                   {hiddenTabs.length}
//                 </span>
//               </button>

//               {isPopupOpen && (
//                 <div className='absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-md z-50 rounded'>
//                   <ul>
//                     {hiddenTabs.map((item, idx) => (
//                       <li key={idx}>
//                         <a
//                           href={`/${item.label.toLowerCase()}`}
//                           className={`flex items-center gap-2 w-full py-2 px-4 hover:bg-gray-100 ${
//                             activeTab === item.label ? 'text-blue-600 font-medium' : 'text-gray-700'
//                           }`}
//                           onClick={() => {
//                             setActiveTab(item.label);
//                             setIsPopupOpen(false);
//                           }}
//                         >
//                           {item.icon}
//                           <span className='truncate'>{item.label}</span>
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </li>
//           )}
//         </ul>
//       </nav>
//     </div>
//   );
// };

// export default ProjectDetailHeader;
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import projectIcon from '../../../assets/projectManagement.png';

import {
  Users2,
  
  Globe,
  CalendarDays,
  List as ListIcon,
  ClipboardList,
  ClipboardCheck,
  Flag,
  Code2,
  Archive,
  FileText,
  PackagePlus,
  Link as LucideLink,
} from 'lucide-react';

const navItems = [
  { label: 'Summary', icon: <Globe className='w-4 h-4' />, path: 'summary' },
  { label: 'Timeline', icon: <CalendarDays className='w-4 h-4' />, path: 'timeline' },
  { label: 'Backlog', icon: <ClipboardList className='w-4 h-4' />, path: 'backlog' },
  { label: 'Board', icon: <ClipboardCheck className='w-4 h-4' />, path: 'board' },
  { label: 'Calendar', icon: <CalendarDays className='w-4 h-4' />, path: 'calendar' },
  { label: 'List', icon: <ListIcon className='w-4 h-4' />, path: 'list' },
  { label: 'Forms', icon: <FileText className='w-4 h-4' />, path: 'forms' },
  { label: 'Goals', icon: <Flag className='w-4 h-4' />, path: 'goals' },
  { label: 'All work', icon: <Users2 className='w-4 h-4' />, path: 'all-work' },
  { label: 'Code', icon: <Code2 className='w-4 h-4' />, path: 'code' },
  { label: 'Archived work items', icon: <Archive className='w-4 h-4' />, path: 'archived' },
  { label: 'Pages', icon: <FileText className='w-4 h-4' />, path: 'pages' },
  { label: 'Shortcuts', icon: <LucideLink className='w-4 h-4' />, path: 'shortcuts' },
  { label: 'Releases', icon: <PackagePlus className='w-4 h-4' />, path: 'releases' },
];

const ProjectDetailHeader: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(navItems);
  const [hiddenTabs, setHiddenTabs] = useState<typeof navItems>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLLIElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const activeTab = useMemo(() => {
    return location.hash.replace('#', '') || 'list';
  }, [location.hash]);

  const { data: projectDetails, isLoading, error } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectIconUrl = projectDetails?.data?.iconUrl || projectIcon;

  const updateTabs = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const tabWidth = 100;
      const maxVisible = Math.floor(containerWidth / tabWidth);
      if (maxVisible < navItems.length) {
        setVisibleTabs(navItems.slice(0, maxVisible));
        setHiddenTabs(navItems.slice(maxVisible));
      } else {
        setVisibleTabs(navItems);
        setHiddenTabs([]);
      }
    }
  };

  useEffect(() => {
    updateTabs();
    window.addEventListener('resize', updateTabs);
    return () => window.removeEventListener('resize', updateTabs);
  }, []);

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
          {isLoading ? 'Loading...' : error ? 'Error loading project' : projectDetails?.data?.name || 'Not Found'}
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

          {hiddenTabs.length > 0 && (
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
