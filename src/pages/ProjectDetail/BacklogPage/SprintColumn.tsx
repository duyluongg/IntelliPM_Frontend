import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  useUpdateTaskTitleMutation,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
  useUpdateTaskSprintMutation, // Thêm hook mới
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import { useGetCategoriesByGroupQuery, type DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDrag, useDrop } from 'react-dnd';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';

interface SprintColumnProps {
  sprints: SprintWithTaskListResponseDTO[];
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number;
}

interface TaskItemProps {
  task: TaskBacklogResponseDTO;
  index: number;
  sprintId: number | null; // null cho backlog
  moveTask: (taskId: string, toSprintId: number | null, toStatus: string) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, sprintId, moveTask }) => {
  const { data: statusCategories, isLoading: isStatusLoading, error: categoryError } = useGetCategoriesByGroupQuery('task_status');
  const [updateTaskStatus, { isLoading: isUpdatingStatus, error: statusError }] = useUpdateTaskStatusMutation();

  // Drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, index, sprintId, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Map API status to UI label
  const mapApiStatusToUI = (apiStatus: string | null | undefined, categories: DynamicCategory[]): string => {
    if (!apiStatus) {
      console.warn('API status is null or undefined, defaulting to first active status');
      return categories.find(c => c.isActive)?.label || 'To Do';
    }
    const trimmedStatus = apiStatus.trim();
    const category = categories.find(c => c.name.toUpperCase() === trimmedStatus.toUpperCase());
    if (!category) {
      console.warn(`Unknown API status: ${trimmedStatus}, defaulting to first active status`);
      return categories.find(c => c.isActive)?.label || 'To Do';
    }
    return category.label;
  };

  const staticStatusOptions = [
    { label: 'TO DO', value: 'To Do', name: 'TO_DO', bg: 'bg-gray-200', text: 'text-gray-800' },
    { label: 'IN PROGRESS', value: 'In Progress', name: 'IN_PROGRESS', bg: 'bg-blue-200', text: 'text-blue-800' },
    { label: 'DONE', value: 'Done', name: 'DONE', bg: 'bg-lime-200', text: 'text-lime-800' },
  ];

  const statusOptions = statusCategories?.data
    ?.filter(category => category.isActive)
    ?.map(category => {
      const staticOption = staticStatusOptions.find(opt => opt.name === category.name) || staticStatusOptions[0];
      return {
        label: category.label,
        value: category.label,
        name: category.name,
        bg: staticOption.bg,
        text: staticOption.text,
      };
    }) || staticStatusOptions;

  const [status, setStatus] = useState<string>(
    isStatusLoading ? 'To Do' : mapApiStatusToUI(task.status, statusCategories?.data || [])
  );
  const [title, setTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [updateTaskTitle, { isLoading: isUpdatingTitle, error: titleError }] = useUpdateTaskTitleMutation();

  useEffect(() => {
    if (!isStatusLoading && statusCategories?.data) {
      setStatus(mapApiStatusToUI(task.status, statusCategories.data));
    }
  }, [task.status, statusCategories, isStatusLoading]);

  const getTaskIcon = (type: string | null | undefined): string => {
    const icons: { [key: string]: string } = {
      story: storyIcon,
      bug: bugIcon,
      epic: epicIcon,
      task: taskIcon,
    };
    return icons[type?.toLowerCase() || 'task'];
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
      console.log(`Updating title for task ${task.id} to: ${title}`);
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

  const handleStatusChange = async (newStatusLabel: string) => {
    try {
      const category = statusCategories?.data?.find(c => c.label === newStatusLabel);
      const apiStatus = category?.name || (newStatusLabel === 'To Do' ? 'TO_DO' : newStatusLabel === 'In Progress' ? 'IN_PROGRESS' : 'DONE');
      console.log(`Sending update for task ${task.id} with status: ${apiStatus}`);
      const response = await updateTaskStatus({ id: task.id, status: apiStatus }).unwrap();
      console.log('Update status response:', response);
      setStatus(newStatusLabel);
      setOpenDropdown(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      const errorMessage = err?.data?.message || 'Failed to update status';
      console.log('Error details:', { error: err, status: err.status, data: err.data });
      alert(`Failed to update status: ${errorMessage}`);
      setStatus(mapApiStatusToUI(task.status, statusCategories?.data || []));
    }
  };

  const assignees = task.taskAssignments.map((a) => ({
    name: a.accountFullname || 'Unknown',
    picture: a.accountPicture || null,
  }));
  const isNarrow = window.innerWidth < 640;
  const epicRef = useRef<HTMLSpanElement>(null);
  let isMultiline = task.epicName && task.epicName.length > 12;

  useEffect(() => {
    if (epicRef.current && !isNarrow && !isMultiline) {
      isMultiline = epicRef.current.offsetHeight > parseFloat(getComputedStyle(epicRef.current).lineHeight) * 1.2;
    }
  }, [task.epicName, isNarrow]);

  const currentStyle = statusOptions.find((s) => s.value === status) || statusOptions[0];

  if (isStatusLoading) {
    return <div className="text-xs text-gray-500">Loading statuses...</div>;
  }

  if (categoryError) {
    return <div className="text-xs text-red-500">Error loading statuses: {(categoryError as any)?.data?.message || 'Unknown error'}</div>;
  }

  return (
    <div
      ref={drag}
      className={`grid grid-cols-[auto_100px_1fr_160px_auto_100px] items-center px-3 py-2 border-t border-gray-200 hover:bg-gray-50 min-h-[48px] ${isDragging ? 'opacity-50' : ''}`}
    >
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
          className={`inline-flex text-xs font-bold rounded px-2 py-0.5 items-center gap-0.5 ${currentStyle.bg} ${currentStyle.text} hover:brightness-95`}
          disabled={isUpdatingStatus}
        >
          <span>{currentStyle.label}</span>
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
            className="w-6 h-6 rounded-full flex items-center justify-center group relative"
            title={assignee.name}
          >
            {assignee.picture ? (
              <img
                src={assignee.picture}
                alt={`${assignee.name} avatar`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="w-full h-full bg-green-600 text-white text-xs flex items-center justify-center rounded-full">
                {assignee.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
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
      {(isUpdatingTitle || isUpdatingStatus) && (
        <div className="text-xs text-blue-500">Updating...</div>
      )}
      {titleError && (
        <div className="text-xs text-red-500">
          Error: {(titleError as any)?.data?.message || 'Failed to update title'}
        </div>
      )}
      {statusError && (
        <div className="text-xs text-red-500">
          Error: {(statusError as any)?.data?.message || 'Failed to update status'}
        </div>
      )}
    </div>
  );
};

const SprintColumn: React.FC<SprintColumnProps> = ({ sprints, backlogTasks, projectId }) => {
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [createTask, { isLoading: isCreatingTask, error: createTaskError }] = useCreateTaskMutation();
  const [updateTaskSprint, { isLoading: isUpdatingSprint, error: sprintError }] = useUpdateTaskSprintMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const { data: statusCategories } = useGetCategoriesByGroupQuery('task_status');

  const moveTask = async (taskId: string, toSprintId: number | null, toStatus: string | null) => {
    try {
      console.log(`Moving task ${taskId} to sprint ${toSprintId ?? 'Backlog'}${toStatus ? ` with status ${toStatus}` : ''}`);
      // Cập nhật sprintId
      await updateTaskSprint({ id: taskId, sprintId: toSprintId }).unwrap();
      // Cập nhật status nếu được chỉ định
      if (toStatus) {
        const apiStatus = statusCategories?.data?.find(c => c.label === toStatus)?.name ||
          (toStatus === 'To Do' ? 'TO_DO' : toStatus === 'In Progress' ? 'IN_PROGRESS' : 'DONE');
        await updateTaskStatus({ id: taskId, status: apiStatus }).unwrap();
      }
    } catch (err: any) {
      console.error('Error moving task:', err);
      const errorMessage = err?.data?.message || 'Failed to move task';
      console.log('Error details:', { error: err, status: err.status, data: err.data });
      alert(`Failed to move task: ${errorMessage}`);
    }
  };

  const renderSection = (title: string, tasks: TaskBacklogResponseDTO[], actionText: string, sprintId: number | null) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'TASK',
      drop: (item: { id: string; index: number; sprintId: number | null; status: string | null }) => {
        // Chỉ cập nhật nếu sprintId khác
        if (item.sprintId !== sprintId) {
          const defaultStatus = sprintId === null ? 'TO_DO' : null; // Task vào backlog thì set TO_DO
          moveTask(item.id, sprintId, defaultStatus);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop}
        className={`bg-white rounded-xl border border-gray-200 mb-4 ${isOver ? 'bg-blue-50' : ''}`}
      >
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
          {tasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} sprintId={sprintId} moveTask={moveTask} />
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
              disabled={isCreatingTask}
            />
          </div>
        </div>
        {createTaskError && (
          <div className="text-xs text-red-500 px-3 py-1">
            Error: {(createTaskError as any)?.data?.message || 'Failed to create task'}
          </div>
        )}
        {sprintError && (
          <div className="text-xs text-red-500 px-3 py-1">
            Error: {(sprintError as any)?.data?.message || 'Failed to update sprint'}
          </div>
        )}
      </div>
    );
  };

  const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>, section: string) => {
    if (e.key !== 'Enter' || !newTaskTitle.trim()) return;

    try {
      const defaultStatus = statusCategories?.data?.find(c => c.isActive && c.orderIndex === 1)?.name || 'TO_DO';
      const newTask = {
        projectId,
        title: newTaskTitle,
        type: 'task',
        status: defaultStatus,
        createdAt: new Date().toISOString(),
        manualInput: true,
        generationAiInput: false,
      };
      console.log('Creating task:', newTask);
      const response = await createTask(newTask).unwrap();
      console.log('Create task response:', response);
      setNewTaskTitle('');
    } catch (err: any) {
      console.error('Error creating task:', err);
      const errorMessage = err?.data?.message || 'Failed to create task';
      alert(`Failed to create task: ${errorMessage}`);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {sprints.map((sprint) => renderSection(sprint.name, sprint.tasks, 'Complete sprint', sprint.id))}
      {backlogTasks.length > 0 && renderSection('Backlog', backlogTasks, 'Create sprint', null)}
    </div>
  );
};

export default SprintColumn;