// src/components/ProjectTabs.tsx
import { NavLink } from 'react-router-dom';
import {
  Globe,
  LineChart,
  ClipboardList,
  LayoutPanelLeft,
  Calendar,
  Table,
  FileText,
  Goal,
  Code,
  Archive,
  Folder,
  ListChecks,
} from 'lucide-react';

const tabs = [
  { label: 'Summary', icon: <Globe size={16} />, path: 'summary' },
  { label: 'Timeline', icon: <LineChart size={16} />, path: 'timeline' },
  { label: 'Backlog', icon: <ClipboardList size={16} />, path: 'backlog' },
  { label: 'Board', icon: <LayoutPanelLeft size={16} />, path: 'board' },
  { label: 'Calendar', icon: <Calendar size={16} />, path: 'calendar' },
  { label: 'List', icon: <Table size={16} />, path: 'list' },
  { label: 'Forms', icon: <FileText size={16} />, path: 'forms' },
  { label: 'Goals', icon: <Goal size={16} />, path: 'goals' },
  { label: 'All work', icon: <ListChecks size={16} />, path: 'all-work' },
  { label: 'Code', icon: <Code size={16} />, path: 'code' },
  { label: 'Archived', icon: <Archive size={16} />, path: 'archived' },
  { label: 'Pages', icon: <FileText size={16} />, path: 'pages' },
  { label: 'Releases', icon: <Folder size={16} />, path: 'releases' },
];

const ProjectTabs = () => {
  return (
    <div>
      <h3 className='text-sm font-semibold text-gray-500 mb-1'>Projects</h3>
      <div className='flex items-center space-x-4 overflow-x-auto text-sm font-medium border-b border-gray-300'>
        {tabs.map((tab, idx) => (
          <NavLink
            key={idx}
            to={tab.path}
            className={({ isActive }) =>
              `flex items-center gap-1 pr-3 py-2 transition ${
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabs;
