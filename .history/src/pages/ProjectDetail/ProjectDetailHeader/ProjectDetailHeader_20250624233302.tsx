// src/pages/ProjectDetail/ProjectDetailHeader/ProjectDetailHeader.tsx
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
  ChevronDown
} from 'lucide-react';

const navItems = [
  { label: 'Summary', icon: <Globe className="w-4 h-4" /> },
  { label: 'Timeline', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'Backlog', icon: <ClipboardList className="w-4 h-4" />, active: true },
  { label: 'Board', icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'List', icon: <List className="w-4 h-4" /> },
  { label: 'Forms', icon: <FileText className="w-4 h-4" /> },
  { label: 'Goals', icon: <Flag className="w-4 h-4" /> },
  { label: 'All work', icon: <Users2 className="w-4 h-4" /> },
  { label: 'Code', icon: <Code2 className="w-4 h-4" /> },
  { label: 'Archived work items', icon: <Archive className="w-4 h-4" /> },
  { label: 'Pages', icon: <FileText className="w-4 h-4" /> },
  { label: 'Shortcuts', icon: <Link className="w-4 h-4" /> },
  { label: 'Releases', icon: <PackagePlus className="w-4 h-4" /> },
];

const ProjectDetailHeader: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const visibleItems = navItems.slice(0, 10);
  const hiddenItems = navItems.slice(10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mx-16 pt-6">
      <div className="flex items-center gap-2">
        <img
          src="https://via.placeholder.com/24"
          alt="Project Icon"
          className="w-6 h-6 rounded"
        />
        <h1 className="text-lg font-semibold">SEP_Agile_Scrum</h1>
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <Users2 className="w-4 h-4" />
        </button>
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <nav className="mt-4 border-b border-gray-200 pb-1 overflow-x-auto">
        <ul className="flex items-center gap-6">
          {visibleItems.map((item, idx) => (
            <li key={idx} className="flex items-center">
              <a
                href="#"
                className={`flex items-center gap-1 text-sm hover:text-black pb-1 transition-colors duration-200 ${
                  item.active
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
          {hiddenItems.length > 0 && (
            <li className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-black pb-1"
              >
                More
                <span className="flex items-center justify-center w-5 h-5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {hiddenItems.length}
                </span>
              </button>
              {showMore && (
                <div className="absolute z-10 mt-2 w-48 bg-white border rounded shadow-md p-2">
                  {hiddenItems.map((item, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ))}
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
