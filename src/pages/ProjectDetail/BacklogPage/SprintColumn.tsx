import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  useUpdateTaskTitleMutation,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
  useUpdateTaskSprintMutation,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import {
  useGetCategoriesByGroupQuery,
  type DynamicCategory,
} from '../../../services/dynamicCategoryApi';
import { useDrag, useDrop } from 'react-dnd';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';
import { useUpdateSprintStatusMutation } from '../../../services/sprintApi';

interface SprintColumnProps {
  sprints: SprintWithTaskListResponseDTO[];
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number;
  onTaskUpdated: () => void;
}

interface TaskItemProps {
  task: TaskBacklogResponseDTO;
  index: number;
  sprintId: number | null;
  moveTask: (taskId: string, toSprintId: number | null, toStatus: string | null) => Promise<void>;
}

const staticStatusOptions = [
  { label: 'TO DO', value: 'TO DO', name: 'TO_DO', bg: 'bg-gray-200', text: 'text-gray-800' },
  {
    label: 'IN PROGRESS',
    value: 'IN PROGRESS',
    name: 'IN_PROGRESS',
    bg: 'bg-blue-200',
    text: 'text-blue-800',
  },
  { label: 'DONE', value: 'DONE', name: 'DONE', bg: 'bg-lime-200', text: 'text-lime-800' },
];

// Function to format date to "day monthAbbr" (e.g., "1 Jun")
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Invalid Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const day = date.getUTCDate();
  const monthAbbr = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${monthAbbr}`;
};

const TaskItem: React.FC<TaskItemProps> = ({ task, index, sprintId, moveTask }) => {
  const {
    data: statusCategories,
    isLoading: isStatusLoading,
    error: categoryError,
  } = useGetCategoriesByGroupQuery('task_status', {
    refetchOnMountOrArgChange: true,
  });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTaskTitle] = useUpdateTaskTitleMutation();

  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, index, sprintId, status: task.status || 'TO_DO' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

  const mapApiStatusToUI = (
    apiStatus: string | null | undefined,
    categories: DynamicCategory[]
  ): string => {
    if (!apiStatus) return 'TO DO';
    const normalizedApiStatus = apiStatus
      .trim()
      .toUpperCase()
      .replace(/[-_\s]/g, '');
    const category = categories.find(
      (c) => c.name.toUpperCase().replace(/[-_\s]/g, '') === normalizedApiStatus
    );
    const staticOption = staticStatusOptions.find(
      (opt) => opt.name.toUpperCase().replace(/[-_\s]/g, '') === normalizedApiStatus
    );
    return (staticOption?.label || category?.label || 'TO DO').toUpperCase();
  };

  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!isStatusLoading && statusCategories?.data) {
      setStatus(mapApiStatusToUI(task.status, statusCategories.data));
    }
  }, [task.status, statusCategories?.data, isStatusLoading]);

  const statusOptions =
    statusCategories?.data
      ?.filter((category) => category.isActive)
      ?.map((category) => {
        const staticOption =
          staticStatusOptions.find(
            (opt) =>
              opt.name.toUpperCase().replace(/[-_\s]/g, '') ===
              category.name.toUpperCase().replace(/[-_\s]/g, '')
          ) || staticStatusOptions[0];
        return {
          label: category.label.toUpperCase(),
          value: category.label.toUpperCase(),
          name: category.name,
          bg: staticOption.bg,
          text: staticOption.text,
        };
      }) || staticStatusOptions;

  const [title, setTitle] = useState(task.title || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  type TaskType = 'story' | 'bug' | 'epic' | 'task';
  const getTaskIcon = (type: string | null | undefined): string => {
    const iconMap: Record<TaskType, string> = {
      story: storyIcon,
      bug: bugIcon,
      epic: epicIcon,
      task: taskIcon,
    };
    return iconMap[(type?.toLowerCase() as TaskType) || 'task'] || taskIcon;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpenDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [editingTitle]);

  const handleTitleBlur = async () => {
    if (title === (task.title || '') || !title.trim()) {
      setTitle(task.title || '');
      setEditingTitle(false);
      return;
    }
    try {
      await updateTaskTitle({ id: task.id, title }).unwrap();
      setEditingTitle(false);
    } catch (err: any) {
      alert(`Failed to update title: ${err?.data?.message || 'Failed to update title'}`);
      setTitle(task.title || '');
      setEditingTitle(false);
    }
  };

  const handleStatusChange = async (newStatusLabel: string) => {
    try {
      const category = statusCategories?.data?.find(
        (c) => c.label.toUpperCase() === newStatusLabel
      );
      const apiStatus =
        category?.name ||
        staticStatusOptions.find((opt) => opt.label === newStatusLabel)?.name ||
        'TO_DO';
      await updateTaskStatus({ id: task.id, status: apiStatus }).unwrap();
      setStatus(newStatusLabel);
      setOpenDropdown(false);
    } catch (err: any) {
      alert(`Failed to update status: ${err?.data?.message || 'Failed to update status'}`);
    }
  };

  const assignees = task.taskAssignments.map((a) => ({
    name: a.accountFullname || 'Unknown',
    picture: a.accountPicture || null,
  }));
  const isNarrow = window.innerWidth < 640;
  const epicRef = useRef<HTMLSpanElement>(null);
  let isMultiline = (task.epicName || '').length > 12;

  useEffect(() => {
    if (epicRef.current && !isNarrow && !isMultiline) {
      isMultiline =
        epicRef.current.offsetHeight >
        parseFloat(getComputedStyle(epicRef.current).lineHeight) * 1.2;
    }
  }, [task.epicName, isNarrow]);

  const currentStyle = statusOptions.find((s) => s.value === status) || statusOptions[0];

  if (isStatusLoading) return <div className='text-xs text-gray-500'>LOADING STATUS...</div>;
  if (categoryError)
    return (
      <div className='text-xs text-red-500'>
        ERROR LOADING STATUS: {(categoryError as any)?.data?.message || 'UNKNOWN ERROR'}
      </div>
    );

  return (
    <div
      ref={ref}
      className={`grid grid-cols-[auto_100px_1fr_160px_auto_100px] items-center px-3 py-2 border-t border-gray-200 hover:bg-gray-50 min-h-[48px] ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img src={getTaskIcon(task.type)} alt={`${task.type || 'task'} icon`} className='w-4 h-4' />
      <span className='text-sm text-gray-900 truncate ml-2'>{task.id}</span>
      {editingTitle ? (
        <input
          ref={titleInputRef}
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
          className='text-sm text-gray-700 truncate border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      ) : (
        <span
          className='text-sm text-gray-700 truncate cursor-pointer hover:underline'
          onClick={() => setEditingTitle(true)}
        >
          {title}
        </span>
      )}
      <div className='flex items-center gap-2 justify-end w-[160px] relative' ref={dropdownRef}>
        {(task.epicName || '') &&
          (isNarrow || isMultiline ? (
            <span className='w-3 h-3 rounded-sm bg-[#c97cf4]' title={task.epicName || ''} />
          ) : (
            <span
              ref={epicRef}
              className='text-xs text-purple-600 border border-purple-600 rounded px-2 py-[1px] hover:bg-purple-50 truncate max-w-[80px]'
              title={task.epicName || ''}
            >
              {task.epicName}
            </span>
          ))}
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`inline-flex text-xs font-bold rounded px-2 py-0.5 items-center gap-0.5 ${currentStyle.bg} ${currentStyle.text} hover:brightness-95`}
          disabled={false}
        >
          <span>{status || 'LOADING...'}</span>
          <ChevronDown className='w-3 h-3 text-gray-500' />
        </button>
        {openDropdown && (
          <div className='absolute z-10 top-full mt-1 w-fit bg-white border border-gray-200 rounded shadow-md'>
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className='px-2 py-1 text-xs font-bold cursor-pointer hover:bg-gray-100'
              >
                <span
                  className={`px-2 py-1 rounded ${option.bg} ${option.text} inline-block hover:brightness-95`}
                >
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='min-w-[16px]' />
      <div className='flex -space-x-1 justify-start w-[100px]'>
        {assignees.slice(0, 3).map((assignee, index) => (
          <div
            key={index}
            className='w-6 h-6 rounded-full flex items-center justify-center group relative'
            title={assignee.name}
          >
            {assignee.picture ? (
              <img
                src={assignee.picture}
                alt={`${assignee.name} avatar`}
                className='w-full h-full object-cover rounded-full'
              />
            ) : (
              <span className='w-full h-full bg-green-600 text-white text-xs flex items-center justify-center rounded-full'>
                {assignee.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity'>
              {assignee.name}
            </span>
          </div>
        ))}
        {assignees.length > 3 && (
          <div className='w-6 h-6 bg-gray-300 text-gray-600 text-xs rounded-full flex items-center justify-center'>
            +{assignees.length - 3}
          </div>
        )}
        {!assignees.length && (
          <div className='w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400'>
            👤
          </div>
        )}
      </div>
    </div>
  );
};

const SprintColumn: React.FC<SprintColumnProps> = ({
  sprints,
  backlogTasks,
  projectId,
  onTaskUpdated,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [createTask] = useCreateTaskMutation();
  const [updateTaskSprint] = useUpdateTaskSprintMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const { data: statusCategories } = useGetCategoriesByGroupQuery('task_status', {
    refetchOnMountOrArgChange: true,
  });
  const [updateSprintStatus] = useUpdateSprintStatusMutation();

  const moveTask = async (taskId: string, toSprintId: number | null, toStatus: string | null) => {
    try {
      await updateTaskSprint({ id: taskId, sprintId: toSprintId }).unwrap();
      if (toStatus) {
        const apiStatus =
          statusCategories?.data?.find((c) => c.label.toUpperCase() === toStatus)?.name ||
          staticStatusOptions.find((opt) => opt.label === toStatus)?.name ||
          'TO_DO';
        await updateTaskStatus({ id: taskId, status: apiStatus }).unwrap();
      }
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to move task: ${err?.data?.message || 'Failed to move task'}`);
    }
  };

  const handleStartSprint = async (sprintId: number) => {
    try {
      console.log(`Starting sprint ${sprintId} with status ACTIVE`);
      await updateSprintStatus({ id: sprintId.toString(), status: 'ACTIVE' }).unwrap();
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to start sprint: ${err?.data?.message || 'Failed to start sprint'}`);
    }
  };

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      console.log(`Completing sprint ${sprintId} with status COMPLETED`);
      await updateSprintStatus({ id: sprintId.toString(), status: 'COMPLETED' }).unwrap();
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to complete sprint: ${err?.data?.message || 'Failed to complete sprint'}`);
    }
  };

  const handleCreateSprint = () => {
    onTaskUpdated();
  };

  const handleMoreOptions = (sprintId: number | null) => {
    onTaskUpdated();
  };

  const renderSection = (
    title: string,
    tasks: TaskBacklogResponseDTO[],
    sprintId: number | null
  ) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'TASK',
      drop: (item: {
        id: string;
        index: number;
        sprintId: number | null;
        status: string | null | undefined;
      }) => {
        if (item.sprintId !== sprintId)
          moveTask(item.id, sprintId, sprintId === null ? 'TO DO' : null);
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }));

    drop(ref);

    const isSprint = sprintId !== null;
    const sprint = isSprint ? sprints.find((s) => s.id === sprintId) : null;

    const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || !newTaskTitle.trim()) return;
      try {
        const defaultStatus =
          statusCategories?.data?.find((c) => c.isActive && c.orderIndex === 1)?.name || 'TO_DO';
        const newTask = {
          projectId,
          title: newTaskTitle,
          type: 'task',
          status: defaultStatus,
          sprintId,
          createdAt: new Date().toISOString(),
          manualInput: true,
          generationAiInput: false,
        };
        await createTask(newTask).unwrap();
        setNewTaskTitle('');
        onTaskUpdated();
      } catch (err: any) {
        alert(`Failed to create task: ${err?.data?.message || 'Failed to create task'}`);
      }
    };
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg border border-gray-200 mb-4 ${isOver ? 'bg-blue-50' : ''}`}
      >
        {sprintId === null ? (
          <div className='flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300'>
            <span className='text-sm font-semibold text-gray-800'>
              Backlogㅤ
              <span className='text-gray-700 font-normal'>({tasks.length} work items)</span>
            </span>
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleCreateSprint}
                className='text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 flex items-center transition-colors duration-200 border border-indigo-300'
              >
                Create Sprint
              </button>

            </div>
          </div>
        ) : (
          isSprint &&
          sprint && (
            <div className='flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                  disabled={sprint.status === 'COMPLETED'}
                />
                <span className='text-sm font-semibold text-gray-800'>
                  {sprint.name}
                  {'ㅤ'}
                  <span className='text-gray-700 font-normal'>
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)} ({tasks.length}{' '}
                    work items)
                  </span>
                </span>
              </div>
              <div className='flex items-center space-x-2'>
               
                {sprint.status === 'FUTURE' && (
                  <button
                    onClick={() => handleStartSprint(sprint.id)}
                    className='text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 flex items-center transition-colors duration-200 border border-indigo-300'
                  >
                    Start Sprint
                  </button>
                )}
                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCompleteSprint(sprint.id)}
                    className='text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 flex items-center transition-colors duration-200 border border-indigo-300'
                  >
                    Complete Sprint
                  </button>
                )}
                {sprint.status === 'COMPLETED' && (
                  <span className='text-sm font-medium text-gray-500'>COMPLETED</span>
                )}
                {sprint.status !== 'FUTURE' &&
                  sprint.status !== 'ACTIVE' &&
                  sprint.status !== 'COMPLETED' && (
                    <span className='text-sm text-red-500'>Unknown Status: {sprint.status}</span>
                  )}
                
              </div>
            </div>
          )
        )}
        <div className='divide-y divide-gray-200'>
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              sprintId={sprintId}
              moveTask={moveTask}
            />
          ))}
          <div className='flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100'>
            <ChevronDown className='w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleAddTask}
              placeholder='What needs to be done?'
              className='flex-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded bg-transparent'
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-4 space-y-4'>
      {sprints.map((sprint) => renderSection(sprint.name, sprint.tasks, sprint.id))}
      {backlogTasks.length > 0 && renderSection('Backlog', backlogTasks, null)}
    </div>
  );
};

export default SprintColumn;
