import React from 'react';
import {
  Folder,
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
  return (
    <div className="mx-16 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Folder className="text-blue-500 w-5 h-5" />
        <span className="font-medium text-sm">SEP_Agile_Scrum</span>
        <Users2 className="w-4 h-4 text-gray-500" />
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mt-4 pb-1 overflow-x-auto border-b border-gray-200">
        {navItems.map((item: NavItem, idx: number) => (
          <div
            key={idx}
            className={`flex items-center gap-1 text-sm text-gray-600 cursor-pointer pb-1 transition-colors duration-200 hover:text-black ${
              item.active ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailHeader;