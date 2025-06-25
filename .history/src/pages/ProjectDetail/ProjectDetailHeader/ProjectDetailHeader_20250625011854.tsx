import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
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
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const projectIconUrl = 'https://via.placeholder.com/24';

  useEffect(() => {
    const updateTabs = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const tabWidth = 100; // Approximate width per tab
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

  useEffect(() => {
    const currentPath = window.location.hash.split('/').pop();
    if (currentPath) {
      const matchedTab = navItems.find((item) => item.label.toLowerCase() === currentPath);
      if (matchedTab) {
        setActiveTab(matchedTab.label);
      }
    }
  }, []);

  return (
    <div className='project-container'>
      {/* Breadcrumbs */}
      <nav aria-label='Breadcrumbs' className='breadcrumbs'>
        <ol className='flex items-center space-x-2'>
          <li>
            <a href='/projects' className='hover:text-blue-600'>
              Projects
            </a>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className='project-header'>
        <img src={projectIconUrl} alt='Project Icon' className='project-icon' />
        <h1 className='project-title'>SEP_Agile_Scrum</h1>
        <button className='icon-button' aria-label='Team'>
          <Users2 className='w-4 h-4' />
        </button>
        <button className='icon-button' aria-label='More actions'>
          <MoreHorizontal className='w-4 h-4' />
        </button>
        <div className='header-actions'>
          <button className='icon-button' aria-label='Fullscreen'>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14.78 2.28 9.53 7.53 8.47 6.47l5.25-5.25zM1.22 13.72l5.25-5.25 1.06 1.06-5.25 5.25z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.5 1h4.75a.75.75 0 01.75.75V6.5h-1.5v-4h-4zm-7 12.5v-4H1v4.75c0 .414.336.75.75.75H6.5v-1.5z'
              />
            </svg>
          </button>
          <button className='icon-button' aria-label='Share'>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2.5 1a2.5 2.5 0 1 1 .73 1.765L6.212 7.567a2.5 2.5 0 0 1 0 .866l4.016 2.302a2.5 2.5 0 1 1-.692 1.332L5.521 9.766a2.5 2.5 0 1 1 0-3.53l4.016-2.302A2.5 2.5 0 0 1 9.5 3.5M3.75 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2M12 11.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2'
              />
            </svg>
          </button>
          <button className='icon-button' aria-label='Automation'>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.377.102a.75.75 0 0 1 .346.847L8.985 7.25h4.265a.75.75 0 0 1 .53 1.28l-7.25 7.25a.75.75 0 0 1-1.253-.73l1.738-6.3H2.75a.75.75 0 0 1-.53-1.28L9.47.22a.75.75 0 0 1 .907-.118'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav aria-label='Project navigation' className='nav-tabs' ref={containerRef}>
        <ul className='flex items-center gap-6'>
          {visibleTabs.map((item: NavItem, idx: number) => (
            <li key={idx} className='flex items-center relative'>
              <a
                href={`#/projects/SAS/${item.label.toLowerCase()}`}
                className={`nav-tab ${
                  activeTab === item.label ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.label);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
          {hiddenTabs.length > 0 && (
            <li className='flex items-center relative'>
              <button
                ref={moreButtonRef}
                onClick={togglePopup}
                className='nav-tab flex items-center gap-1'
                aria-label='More tabs'
              >
                <span>More</span>
                <span className='flex items-center justify-center w-4 h-4 text-xs bg-gray-200 text-gray-700 rounded-full'>
                  {hiddenTabs.length}
                </span>
              </button>
              {isPopupOpen && hiddenTabs.length > 0 && (
                <div className='popup'>
                  <ul>
                    {hiddenTabs.map((item: NavItem, idx: number) => (
                      <li key={idx}>
                        <a
                          href={`#/projects/SAS/${item.label.toLowerCase()}`}
                          className={`${
                            activeTab === item.label ? 'active' : ''
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(item.label);
                            togglePopup();
                          }}
                        >
                          {item.icon}
                          <span>{item.label}</span>
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

      <div className='nav-footer'>
        <button className='add-nav-btn' aria-label='Add to navigation'>
          <Plus className='w-4 h-4' />
          <span>Add to navigation</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;