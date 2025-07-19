import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: { name: string; picture?: string | null }[];
  type?: 'task' | 'story' | 'bug';
  epicName?: string | null;
}

interface Sprint {
  id: string;
  name: string;
  duration?: string;
  tasks: Task[];
}

interface SprintColumnProps {
  sprints: Sprint[];
  backlogTasks: Task[];
}

const statusOptions: {
  label: string;
  value: Task['status'];
  bg: string;
  text: string;
  border?: string;
}[] = [
  { label: 'TO DO', value: 'To Do', bg: 'bg-gray-200', text: 'text-gray-800' },
  { label: 'IN PROGRESS', value: 'In Progress', bg: 'bg-blue-200', text: 'text-blue-800' },
  { label: 'DONE', value: 'Done', bg: 'bg-lime-200', text: 'text-lime-800' },
];

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTaskIcon = (type?: string) => {
    switch (type) {
      case 'story':
        return storyIcon;
      case 'bug':
        return bugIcon;
      case 'epic':
        return epicIcon;
      case 'task':
      default:
        return taskIcon;
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpenDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const assignees = task.assignee || [];
  const isNarrow = window.innerWidth < 640;
  const epicRef = useRef<HTMLSpanElement>(null);
  let isMultiline = task.epicName && task.epicName.length > 12;

  useEffect(() => {
    if (epicRef.current && !isNarrow && !isMultiline) {
      const element = epicRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const height = element.offsetHeight;
      if (height > lineHeight * 1.2) {
        isMultiline = true;
      }
    }
  }, [task.epicName, isNarrow]);

  const currentStyle = statusOptions.find((s) => s.value === status);

  return (
    <div className="grid grid-cols-[auto_100px_1fr_160px_auto_100px] items-center px-4 py-2 border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200 min-h-[48px]">
      <img
        src={task.type ? getTaskIcon(task.type) : taskIcon}
        alt={`${task.type || 'task'} icon`}
        className="w-4 h-4"
      />
      <span className="text-sm font-normal text-gray-900 w-[100px] truncate ml-2">{task.id}</span>
      <span className="text-sm text-gray-700 truncate">{task.title}</span>
      <div className="flex items-center gap-2 justify-end w-[160px] relative" ref={dropdownRef}>
        {task.epicName && (
          <span className="inline-flex">
            {isNarrow || isMultiline ? (
              <span
                className="w-3 h-3 rounded-sm bg-[#c97cf4] inline-block"
                title={task.epicName}
              />
            ) : (
              <span
                ref={epicRef}
                className="text-xs text-purple-600 border border-purple-600 rounded px-2 py-[1px] shadow-sm hover:bg-purple-50 transition-all truncate max-w-[80px]"
                title={task.epicName}
              >
                {task.epicName}
              </span>
            )}
          </span>
        )}
        <button
          onClick={() => setOpenDropdown((prev) => !prev)}
          className={`inline-flex text-xs font-bold rounded-md px-2 py-0.5 items-center gap-0.5 ${currentStyle?.bg} ${currentStyle?.text} bg-opacity-100 whitespace-nowrap hover:brightness-95 transition-all duration-200`}
        >
          <span>{currentStyle?.label}</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
        {openDropdown && (
          <div className="absolute z-10 top-full mt-1 w-fit bg-white border border-gray-200 rounded-sm shadow-md overflow-hidden">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  setStatus(option.value);
                  setOpenDropdown(false);
                }}
                className="px-2 py-1 text-xs font-bold uppercase cursor-pointer flex items-center gap-0.5 hover:bg-gray-100 whitespace-nowrap"
              >
                <span
                  className={`px-2 py-1 rounded-sm ${option.bg} ${option.text} inline-block hover:brightness-95 transition-all duration-200`}
                >
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="min-w-[16px]" /> {/* Spacer column */}
      <div className="flex -space-x-1 justify-start w-[50px]">
        {Array.isArray(assignees) &&
          assignees.slice(0, 3).map((assignee, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden relative group"
              title={assignee.name}
            >
              {assignee.picture ? (
                <img
                  src={assignee.picture}
                  alt={`${assignee.name} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full bg-green-600 text-white text-xs flex items-center justify-center">
                  {assignee.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {assignee.name}
              </span>
            </div>
          ))}
        {assignees.length > 3 && (
          <div className="w-6 h-6 bg-gray-300 text-gray-600 text-xs rounded-full flex items-center justify-center">
            +{assignees.length - 3}
          </div>
        )}
        {assignees.length === 0 && (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400">
            👤
          </div>
        )}
      </div>
    </div>
  );
};

const SprintColumn: React.FC<SprintColumnProps> = ({ sprints, backlogTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>, section: string) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      console.log(`Adding task to ${section}: ${newTaskTitle}`);
      setNewTaskTitle('');
    }
  };

  const renderSection = (title: string, tasks: Task[], actionText: string) => (
    <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">
            {tasks.length} work item{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-sm hover:bg-blue-50 transition-all duration-200">
          {actionText}
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
          <ChevronDown className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => handleAddTask(e, title)}
            className="flex-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm bg-transparent"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {sprints.map((sprint) => renderSection(sprint.name, sprint.tasks, 'Complete sprint'))}
      {backlogTasks.length > 0 && renderSection('Backlog', backlogTasks, 'Create sprint')}
    </div>
  );
};

export default SprintColumn;