import React from 'react';
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
  // Dummy project icon URL (replace with actual API or static image)
  const projectIconUrl = 'https://via.placeholder.com/24'; // Placeholder image

  return (
    <div className="mx-16 pt-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <a href="/projects" className="hover:text-blue-600">
              Projects
            </a>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li aria-current="page">
            <span className="font-medium">SEP_Agile_Scrum</span>
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
            aria-label="Share"
          >
            {/* Share icon (using a placeholder) */}
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Automation"
          >
            {/* Automation icon (using a placeholder) */}
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
                d="M9 7h6m0 0l-3 3m-3-3l3 3m0 6l3-3m-3 3l-3-3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav aria-label="Project navigation" className="mt-4">
        <ul className="flex items-center gap-6 border-b border-gray-200 pb-1 overflow-x-auto">
          {navItems.slice(0, 5).map((item: NavItem, idx: number) => (
            <li key={idx}>
              <a
                href={`#/projects/SAS/${item.label.toLowerCase()}`}
                className={`flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1 transition-colors duration-200 ${
                  item.active
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : ''
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
          {/* More dropdown (simplified) */}
          {navItems.length > 5 && (
            <li>
              <button
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1"
                aria-label="More tabs"
              >
                <span>More</span>
                <span className="flex items-center justify-center w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {navItems.length - 5}
                </span>
              </button>
            </li>
          )}
        </ul>
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