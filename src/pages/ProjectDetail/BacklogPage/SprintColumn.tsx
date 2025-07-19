import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useUpdateTaskTitleMutation, useUpdateTaskDatMutation } from '../../../services/taskApi';
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
  projectId?: number;
  epicId?: string | null;
  sprintId?: number | null;
  createdAt?: string;
  description?: string;
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
}[] = [
  { label: 'TO DO', value: 'To Do', bg: 'bg-gray-200', text: 'text-gray-800' },
  { label: 'IN PROGRESS', value: 'In Progress', bg: 'bg-blue-200', text: 'text-blue-800' },
  { label: 'DONE', value: 'Done', bg: 'bg-lime-200', text: 'text-lime-800' },
];

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [updateTaskTitle, { isLoading: isUpdatingTitle, error: titleError }] = useUpdateTaskTitleMutation();
  const [updateTaskDat, { isLoading: isUpdatingDat, error: datError }] = useUpdateTaskDatMutation();

  const getTaskIcon = (type: string = 'task'): string => {
    const icons: { [key: string]: string } = {
      story: storyIcon,
      bug: bugIcon,
      epic: epicIcon,
      task: taskIcon,
    };
    return icons[type];
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTitle]);

  const handleTitleBlur = async () => {
    if (title === task.title || !title.trim()) {
      setTitle(task.title);
      setEditingTitle(false);
      return;
    }
    try {
      await updateTaskTitle({ id: task.id, title }).unwrap();
      setEditingTitle(false);
    } catch (err: any) {
      console.error('Error updating title:', err);
      const errorMessage = err?.data?.message || 'Failed to update title';
      alert(`Failed to update title: ${errorMessage}`);
      setTitle(task.title);
      setEditingTitle(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      console.log('Task data:', task); // Debug task data
      const apiStatus = newStatus === 'To Do' ? 'TO_DO' : newStatus === 'In Progress' ? 'IN_PROGRESS' : 'DONE';
      if (!task.projectId) {
        console.error('Project ID is missing for task:', task.id);
        throw new Error('Project ID is missing. Please ensure the task is associated with a project.');
      }
      const taskData = {
        reporterId: null,
        projectId: task.projectId,
        epicId: task.epicId || null,
        sprintId: task.sprintId || null,
        type: task.type || 'task',
        title: task.title,
        description: task.description || '',
        plannedStartDate: task.createdAt
          ? new Date(task.createdAt).toISOString()
          : new Date().toISOString(),
        plannedEndDate: task.createdAt
          ? new Date(task.createdAt).toISOString()
          : new Date().toISOString(),
        status: apiStatus,
      };
      console.log('Sending updateTaskDat payload:', taskData); // Debug payload
      await updateTaskDat({ id: task.id, body: taskData }).unwrap();
      setStatus(newStatus);
      setOpenDropdown(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      const errorMessage = err?.data?.message || err.message || 'Failed to update status';
      alert(`Failed to update status: ${errorMessage}`);
      setStatus(task.status); // Revert on error
    }
  };

  const assignees = task.assignee || [];
  const isNarrow = window.innerWidth < 640;
  const epicRef = useRef<HTMLSpanElement>(null);
  let isMultiline = task.epicName && task.epicName.length > 12;

  useEffect(() => {
    if (epicRef.current && !isNarrow && !isMultiline) {
      isMultiline = epicRef.current.offsetHeight > parseFloat(getComputedStyle(epicRef.current).lineHeight) * 1.2;
    }
  }, [task.epicName, isNarrow]);

  const currentStyle = statusOptions.find((s) => s.value === status);

  return (
    <div className="grid grid-cols-[auto_100px_1fr_160px_auto_100px] items-center px-3 py-2 border-t border-gray-200 hover:bg-gray-50 min-h-[48px]">
      <img src={getTaskIcon(task.type)} alt={`${task.type || 'task'} icon`} className="w-4 h-4" />
      <span className="text-sm text-gray-900 truncate ml-2">{task.id}</span>
      {editingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
          className="text-sm text-gray-700 truncate border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span
          className="text-sm text-gray-700 truncate cursor-pointer hover:underline"
          onClick={() => setEditingTitle(true)}
        >
          {title}
        </span>
      )}
      <div className="flex items-center gap-2 justify-end w-[160px] relative" ref={dropdownRef}>
        {task.epicName && (
          <span className="inline-flex">
            {isNarrow || isMultiline ? (
              <span className="w-3 h-3 rounded-sm bg-[#c97cf4]" title={task.epicName} />
            ) : (
              <span
                ref={epicRef}
                className="text-xs text-purple-600 border border-purple-600 rounded px-2 py-[1px] hover:bg-purple-50 truncate max-w-[80px]"
                title={task.epicName}
              >
                {task.epicName}
              </span>
            )}
          </span>
        )}
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`inline-flex text-xs font-bold rounded px-2 py-0.5 items-center gap-0.5 ${currentStyle?.bg} ${currentStyle?.text} hover:brightness-95`}
          disabled={isUpdatingDat}
        >
          <span>{currentStyle?.label}</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
        {openDropdown && (
          <div className="absolute z-10 top-full mt-1 w-fit bg-white border border-gray-200 rounded shadow-md">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className="px-2 py-1 text-xs font-bold uppercase cursor-pointer hover:bg-gray-100"
              >
                <span className={`px-2 py-1 rounded ${option.bg} ${option.text} inline-block hover:brightness-95`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="min-w-[16px]" />
      <div className="flex -space-x-1 justify-start w-[100px]">
        {assignees.slice(0, 3).map((assignee, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full flex items-center justify-center group"
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
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100">
              {assignee.name}
            </span>
          </div>
        ))}
        {assignees.length > 3 && (
          <div className="w-6 h-6 bg-gray-300 text-gray-600 text-xs rounded-full flex items-center justify-center">
            +{assignees.length - 3}
          </div>
        )}
        {!assignees.length && (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400">
            👤
          </div>
        )}
      </div>
      {(isUpdatingTitle || isUpdatingDat) && (
        <div className="text-xs text-blue-500">Updating...</div>
      )}
      {titleError && (
        <div className="text-xs text-red-500">
          Error: {(titleError as any)?.data?.message || 'Failed to update title'}
        </div>
      )}
      {datError && (
        <div className="text-xs text-red-500">
          Error: {(datError as any)?.data?.message || 'Failed to update status'}
        </div>
      )}
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
    <div className="bg-white rounded-xl border border-gray-200 mb-4">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">{tasks.length} work item{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50">
          {actionText}
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100">
          <ChevronDown className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => handleAddTask(e, title)}
            className="flex-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded bg-transparent"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 space-y-4">
      {sprints.map((sprint) => renderSection(sprint.name, sprint.tasks, 'Complete sprint'))}
      {backlogTasks.length > 0 && renderSection('Backlog', backlogTasks, 'Create sprint')}
    </div>
  );
};

export default SprintColumn;