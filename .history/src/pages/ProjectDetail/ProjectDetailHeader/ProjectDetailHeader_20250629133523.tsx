import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  Users2,
  MoreHorizontal,
  Globe,
  CalendarDays,
  List,
  ClipboardList,
  ClipboardCheck,
  Flag,
  Code2,
  Archive,
  FileText,
  Link,
  PackagePlus,
} from 'lucide-react';

const navItems = [
  { label: 'Summary', icon: <Globe className='w-4 h-4' /> },
  { label: 'Timeline', icon: <CalendarDays className='w-4 h-4' /> },
  { label: 'Backlog', icon: <ClipboardList className='w-4 h-4' /> },
  { label: 'Board', icon: <ClipboardCheck className='w-4 h-4' /> },
  { label: 'Calendar', icon: <CalendarDays className='w-4 h-4' /> },
  { label: 'List', icon: <List className='w-4 h-4' /> },
  { label: 'Forms', icon: <FileText className='w-4 h-4' /> },
  { label: 'Goals', icon: <Flag className='w-4 h-4' /> },
  { label: 'All work', icon: <Users2 className='w-4 h-4' /> },
  { label: 'Code', icon: <Code2 className='w-4 h-4' /> },
  { label: 'Archived work items', icon: <Archive className='w-4 h-4' /> },
  { label: 'Pages', icon: <FileText className='w-4 h-4' /> },
  { label: 'Shortcuts', icon: <Link className='w-4 h-4' /> },
  { label: 'Releases', icon: <PackagePlus className='w-4 h-4' /> },
];

interface NavItem {
  label: string;
  icon: React.ReactNode;
}

const ProjectDetailHeader: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(navItems);
  const [hiddenTabs, setHiddenTabs] = useState<NavItem[]>([]);
  const [activeTab, setActiveTab] = useState('List');
  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLLIElement>(null);
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || '';

  const { data, isLoading, isError, error } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectDetails = data?.data;

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  // Tab overflow handling
  useEffect(() => {
    const updateTabs = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const tabWidth = 100;
        const maxVisible = Math.floor(containerWidth / tabWidth);

        setVisibleTabs(navItems.slice(0, maxVisible));
        setHiddenTabs(navItems.slice(maxVisible));
      }
    };

    updateTabs();
    window.addEventListener('resize', updateTabs);
    return () => window.removeEventListener('resize', updateTabs);
  }, []);

  // Close popup when click outside
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

  // Detect current tab
  useEffect(() => {
    const currentPath = window.location.hash.split('/').pop();
    if (currentPath) {
      const matchedTab = navItems.find((item) => item.label.toLowerCase() === currentPath);
      if (matchedTab) setActiveTab(matchedTab.label);
    }
  }, []);

  // Error handling
  if (isLoading) return <div className='mx-6 pt-6 text-gray-500'>Loading project details...</div>;

  if (isError) {
    const err = error as FetchBaseQueryError | SerializedError;
    const errorMessage =
      'status' in err
        ? (err.data as { message?: string })?.message ?? 'Server error'
        : err.message ?? 'Unexpected error';

    return <div className='mx-6 pt-6 text-red-500'>Error: {errorMessage}</div>;
  }

  const projectIconUrl = projectDetails?.iconUrl || '/default-project-icon.png';

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
        <h1 className='text-lg font-semibold'>{projectDetails?.name || 'Unnamed Project'}</h1>
        <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Team'>
          <Users2 className='w-4 h-4' />
        </button>
        <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='More actions'>
          <MoreHorizontal className='w-4 h-4' />
        </button>
        <div className='ml-auto flex items-center space-x-2'>
          <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Fullscreen'>
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'></svg>
          </button>
          <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Share'>
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'></svg>
          </button>
          <button className='p-1 text-gray-500 hover:text-gray-700' aria-label='Automation'>
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'></svg>
          </button>
        </div>
      </div>

      <nav className='mt-4 relative' ref={containerRef}>
        <ul className='flex items-center gap-6 border-b border-gray-200 pb-1'>
          {visibleTabs.map((item, idx) => (
            <li key={idx} className='flex items-center relative group'>
              <a
                href={`#/projects/${projectKey}/${item.label.toLowerCase()}`}
                className={`flex items-center gap-1 text-sm pb-1 border-b-2 transition-all duration-200 ${
                  activeTab === item.label
                    ? 'text-blue-600 border-blue-600 font-medium'
                    : 'text-gray-600 border-transparent group-hover:text-blue-600 group-hover:border-blue-600'
                }`}
                onClick={() => setActiveTab(item.label)}
              >
                <span className='relative flex items-center'>
                  <span className='default-icon group-hover:hidden'>{item.icon}</span>
                  <MoreHorizontal className='w-4 h-4 hidden group-hover:inline-block text-gray-500' />
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
          {hiddenTabs.length > 0 && (
            <li className='relative' ref={moreButtonRef}>
              <button
                onClick={togglePopup}
                className='flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1'
              >
                <span>More</span>
                <span className='flex items-center justify-center w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded-full'>
                  {hiddenTabs.length}
                </span>
              </button>
              {isPopupOpen && (
                <div className='absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-md z-50 rounded'>
                  <ul>
                    {hiddenTabs.map((item, idx) => (
                      <li key={idx}>
                        <a
                          href={`#/projects/${projectKey}/${item.label.toLowerCase()}`}
                          className={`flex items-center gap-2 w-full py-2 px-4 hover:bg-gray-100 ${
                            activeTab === item.label ? 'text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setActiveTab(item.label);
                            setIsPopupOpen(false);
                          }}
                        >
                          {item.icon}
                          <span className='truncate'>{item.label}</span>
                        </a>
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
