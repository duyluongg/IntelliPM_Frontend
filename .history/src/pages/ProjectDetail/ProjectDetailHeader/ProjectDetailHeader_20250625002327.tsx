import React, { useState } from 'react';
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

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const projectIconUrl = 'https://via.placeholder.com/24';

  return (
    <div className="mx-16 pt-6 relative">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <a href="/projects" className="hover:text-blue-600">
              Projects
            </a>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-2">
        <img
          src={projectIconUrl}
          alt="Project Icon"
          className="w-6 h-6 rounded"
        />
        <h1 className="text-lg font-semibold">SEP_Agile_Scrum</h1>
        <button
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label="Team"
        >
          <Users2 className="w-4 h-4" />
        </button>
        <button
          className="p-1 text-gray-500 hover:text-gray-700"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <div className="ml-auto flex items-center space-x-2">
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Fullscreen"
          >
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
            
              />
            </svg>
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Share"
          >
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
              
              />
            </svg>
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Automation"
          >
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
      <nav aria-label="Project navigation" className="mt-4 relative">
        <ul className="flex items-center gap-6 border-b border-gray-200 pb-1">
          {navItems.map((item: NavItem, idx: number) => (
            <li key={idx} className="flex items-center">
              <a
                href={`#/projects/SAS/${item.label.toLowerCase()}`}
                className={`flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1 transition-colors duration-200 ${
                  item.active ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
              <button
                className="p-1 ml-1 text-gray-500 hover:text-gray-700"
                aria-label="Tab options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </li>
          ))}
          <li className="flex items-center">
            <button
              onClick={togglePopup}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1"
              aria-label="More tabs"
            >
              <span>More</span>
            </button>
          </li>
        </ul>
        {isPopupOpen && (
          <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
            <ul className="py-1">
              {navItems.map((item: NavItem, idx: number) => (
                <li key={idx} className="px-4 py-2 hover:bg-gray-100">
                  <a
                    href={`#/projects/SAS/${item.label.toLowerCase()}`}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                    onClick={togglePopup}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <button
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
            aria-label="Add to navigation"
          >
            <Plus className="w-4 h-4" />
            <span>Add to navigation</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProjectDetailHeader;