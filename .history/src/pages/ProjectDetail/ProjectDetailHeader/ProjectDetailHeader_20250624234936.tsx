import React, { useState, useRef, useEffect } from 'react';
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
  { label: 'List', icon: <List className='w-4 h-4' />, active: true },
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
  active?: boolean;
}

const ProjectDetailHeader: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(navItems);
  const [hiddenTabs, setHiddenTabs] = useState<NavItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const updateTabs = () => {
      if (containerRef.current && tabRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const firstTab = tabRef.current.querySelector('li');
        const tabWidth = firstTab ? firstTab.offsetWidth + 24 : 100; // Include gap (1.5rem = 24px)
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

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const projectIconUrl = 'https://via.placeholder.com/24';

  return (
    <div className="project-container">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="breadcrumbs">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/projects" className="breadcrumb-link hover:text-blue-600">
              Projects
            </a>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="project-header">
        <img src={projectIconUrl} alt="Project Icon" className="project-icon" />
        <h1 className="project-title">SEP_Agile_Scrum</h1>
        <button className="icon-button" aria-label="Team">
          <Users2 className="w-4 h-4" />
        </button>
        <button className="icon-button" aria-label="More actions">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <div className="header-actions">
          <button className="icon-button" aria-label="Fullscreen">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.78 2.28 9.53 7.53 8.47 6.47l5.25-5.25zM1.22 13.72l5.25-5.25 1.06 1.06-5.25 5.25z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.5 1h4.75a.75.75 0 01.75.75V6.5h-1.5v-4h-4zm-7 12.5v-4H1v4.75c0 .414.336.75.75.75H6.5v-1.5z"
              />
            </svg>
          </button>
          <button className="icon-button" aria-label="Share">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2.5 1a2.5 2.5 0 1 1 .73 1.765L6.212 7.567a2.5 2.5 0 0 1 0 .866l4.016 2.302a2.5 2.5 0 1 1-.692 1.332L5.521 9.766a2.5 2.5 0 1 1 0-3.53l4.016-2.302A2.5 2.5 0 0 1 9.5 3.5M3.75 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2M12 11.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
              />
            </svg>
          </button>
          <button className="icon-button" aria-label="Automation">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.377.102a.75.75 0 0 1 .346.847L8.985 7.25h4.265a.75.75 0 0 1 .53 1.28l-7.25 7.25a.75.75 0 0 1-1.253-.73l1.738-6.3H2.75a.75.75 0 0 1-.53-1.28L9.47.22a.75.75 0 0 1 .907-.118"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav aria-label="Project navigation" className="mt-4" ref={containerRef}>
        <ul ref={tabRef} className="nav-tabs flex flex-wrap">
          {visibleTabs.map((item: NavItem, idx: number) => (
            <li key={idx} className="tab-item flex items-center">
              <a
                href={`#/projects/SAS/${item.label.toLowerCase()}`}
                className={`flex items-center gap-1 ${item.active ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
              <button className="tab-more-icon" aria-label="Tab options">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </li>
          ))}
          {hiddenTabs.length > 0 && (
            <li className="tab-item flex items-center">
              <button
                onClick={togglePopup}
                className="flex items-center gap-1"
                aria-label="More tabs"
              >
                <span>More</span>
                <span className="tab-more-count">{hiddenTabs.length}</span>
              </button>
            </li>
          )}
        </ul>
        {isPopupOpen && (
          <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
            <ul className="py-1">
              {hiddenTabs.map((item: NavItem, idx: number) => (
                <li key={idx} className="px-4 py-2 hover:bg-gray-100">
                  <a
                    href={`#/projects/SAS/${item.label.toLowerCase()}`}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="nav-footer">
          <button className="add-nav-btn">
            <Plus className="w-4 h-4" />
            <span>Add to navigation</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProjectDetailHeader;