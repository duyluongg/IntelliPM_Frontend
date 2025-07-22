import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  useUpdateTaskTitleMutation,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
  useUpdateTaskSprintMutation,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import {
  type SprintWithTaskListResponseDTO,
  useCreateSprintQuickMutation,
  useUpdateSprintStatusMutation,
  useDeleteSprintMutation,
} from '../../../services/sprintApi';
import {
  useGetCategoriesByGroupQuery,
  type DynamicCategory,
} from '../../../services/dynamicCategoryApi';
import { useDrag, useDrop } from 'react-dnd';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';
import StartSprintPopup from './StartSprintPopup';
import EditDatePopup from './EditDatePopup';

interface SprintColumnProps {
  sprints: SprintWithTaskListResponseDTO[];
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number;
  projectKey: string;
  onTaskUpdated: () => void;
}

interface TaskItemProps {
  task: TaskBacklogResponseDTO;
  index: number;
  sprintId: number | null;
  moveTask: (taskId: string, toSprintId: number | null, toStatus: string | null) => Promise<void>;
}

interface SectionProps {
  title: string;
  tasks: TaskBacklogResponseDTO[];
  sprintId: number | null;
  sprints: SprintWithTaskListResponseDTO[];
  projectId: number;
  projectKey: string;
  onTaskUpdated: () => void;
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
      className={`grid grid-cols-[40px_100px_1fr_auto_120px_auto_100px] items-center px-3 py-2 border-t border-gray-200 hover:bg-gray-50 min-h-[48px] ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className='flex justify-center'>
        <img src={getTaskIcon(task.type)} alt={`${task.type || 'task'} icon`} className='w-4 h-4' />
      </div>
      <span className='text-sm text-gray-900 truncate ml-2'>{task.id}</span>
      {editingTitle ? (
        <input
          ref={titleInputRef}
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
          className='text-sm text-gray-700 truncate border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
        />
      ) : (
        <span
          className='text-sm text-gray-700 truncate cursor-pointer hover:underline w-full'
          onClick={() => setEditingTitle(true)}
        >
          {title}
        </span>
      )}
      <div className='flex justify-end pl-2 mr-5'>
        {(task.epicName || '') &&
          (isNarrow || isMultiline ? (
            <span className='w-3 h-3 rounded-sm bg-[#c97cf4]' title={task.epicName || ''} />
          ) : (
            <span
              ref={epicRef}
              className='text-xs text-purple-600 border border-purple-600 rounded px-2 py-[1px] hover:bg-purple-50 truncate'
              title={task.epicName || ''}
            >
              {task.epicName}
            </span>
          ))}
        {!task.epicName && <span className='text-xs text-gray-400'>-</span>}
      </div>
      <div className='flex items-center justify-start relative' ref={dropdownRef}>
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

const Section: React.FC<SectionProps> = ({
  title,
  tasks,
  sprintId,
  sprints,
  projectId,
  projectKey,
  onTaskUpdated,
  moveTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [createTask] = useCreateTaskMutation();
  const [createSprint, { isLoading: isCreatingSprint }] = useCreateSprintQuickMutation();
  const [deleteSprint] = useDeleteSprintMutation();
  const { data: statusCategories } = useGetCategoriesByGroupQuery('task_status', {
    refetchOnMountOrArgChange: true,
  });
  const [updateSprintStatus] = useUpdateSprintStatusMutation();
  const [isStartPopupOpen, setIsStartPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    item: { sprintId },
    drop: (item: {
      id: string;
      index: number;
      sprintId: number | null;
      status: string | null | undefined;
    }) => {
      if (item.sprintId !== sprintId) {
        moveTask(item.id, sprintId, sprintId === null ? 'TO DO' : null);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  drop(ref);

  const isSprint = sprintId !== null;
  const sprint = isSprint ? sprints.find((s) => s.id === sprintId) : null;
  const hasActiveSprint = sprints.some((s) => s.status === 'ACTIVE');
  const hasNoDates = sprint && (!sprint.startDate || !sprint.endDate);

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

  const handleStartSprint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sprintId) {
      setIsStartPopupOpen(true);
    }
  };

  const handleEditSprint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sprintId) {
      setIsEditPopupOpen(true);
      setIsMoreMenuOpen(false);
    }
  };

  const handleDeleteSprint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sprintId && window.confirm('Are you sure you want to delete this sprint and all its tasks?')) {
      try {
        await deleteSprint(sprintId.toString()).unwrap();
        onTaskUpdated();
        setIsMoreMenuOpen(false);
      } catch (err: any) {
        alert(`Failed to delete sprint: ${err?.data?.message || 'Failed to delete sprint'}`);
      }
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

  const handleCreateSprint = async () => {
    try {
      await createSprint({ projectKey }).unwrap();
      onTaskUpdated();
    } catch (err: any) {
      alert(`Failed to create sprint: ${err?.data?.message || 'Failed to create sprint'}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              disabled={isCreatingSprint}
            >
              {isCreatingSprint ? 'Creating...' : 'Create Sprint'}
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
                  {hasNoDates ? (
                    <button
                      className='inline-flex items-center text-xs text-black hover:no-underline hover:bg-gray-200 px-1 py-1 rounded'
                      onClick={handleEditSprint}
                    >
                      <svg
                        fill='none'
                        viewBox='0 0 16 16'
                        role='presentation'
                        className='w-3.5 h-3.5 mr-1'
                        style={{ color: 'var(--ds-icon, #000000)' }}
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          clipRule='evenodd'
                          d='M11.586.854a2 2 0 0 1 2.828 0l.732.732a2 2 0 0 1 0 2.828L10.01 9.551a2 2 0 0 1-.864.51l-3.189.91a.75.75 0 0 1-.927-.927l.91-3.189a2 2 0 0 1 .51-.864zm1.768 1.06a.5.5 0 0 0-.708 0l-.585.586L13.5 3.94l.586-.586a.5.5 0 0 0 0-.707zM12.439 5 11 3.56 7.51 7.052a.5.5 0 0 0-.128.217l-.54 1.89 1.89-.54a.5.5 0 0 0 .217-.127zM3 2.501a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-3H15v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3v1.5z'
                        />
                      </svg>
                      Add dates
                    </button>
                  ) : (
                    `${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)} (${
                      tasks.length
                    } work items)`
                  )}
                </span>
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              {sprint.status === 'FUTURE' && (
                <>
                  {hasNoDates ? (
                    <button
                      onClick={handleStartSprint}
                      disabled={tasks.length === 0 || hasActiveSprint}
                      className={`text-sm font-medium px-2 py-1 rounded flex items-center transition-colors duration-200 border border-indigo-300 ${
                        tasks.length === 0 || hasActiveSprint
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                          : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                      }`}
                      title={
                        hasActiveSprint ? 'Cannot start sprint while another sprint is active' : ''
                      }
                    >
                      Start Sprint
                    </button>
                  ) : (
                    <button
                      onClick={handleStartSprint}
                      disabled={tasks.length === 0 || hasActiveSprint}
                      className={`text-sm font-medium px-2 py-1 rounded flex items-center transition-colors duration-200 border border-indigo-300 ${
                        tasks.length === 0 || hasActiveSprint
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                          : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                      }`}
                      title={
                        hasActiveSprint ? 'Cannot start sprint while another sprint is active' : ''
                      }
                    >
                      Start Sprint
                    </button>
                  )}
                </>
              )}
              {sprint.status === 'ACTIVE' && (
                <button
                  onClick={() => handleCompleteSprint(sprint.id)}
                  disabled={tasks.length === 0}
                  className={`text-sm font-medium px-2 py-1 rounded flex items-center transition-colors duration-200 border border-indigo-300 ${
                    tasks.length === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
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
              <div className='relative' ref={moreMenuRef}>
                <button
                  className={`w-8 h-8 rounded-lg text-gray-500 flex items-center justify-center hover:bg-gray-200 ${
                    isMoreMenuOpen
                      ? 'border border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.3)]'
                      : 'border-transparent'
                  }`}
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  aria-label='More sprint options'
                >
                  <MoreHorizontal size={16} />
                </button>
                {isMoreMenuOpen && (
                  <div className='absolute z-10 right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg'>
                    <button
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={handleEditSprint}
                    >
                      Edit sprint
                    </button>
                    <button
                      className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                      onClick={handleDeleteSprint}
                    >
                      Delete sprint
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
      <div className='divide-y divide-gray-200'>
        {tasks.length === 0 ? (
          <div className='px-4 py-3 text-center text-gray-500 border border-dashed rounded-md'>
            No tasks available. Add a task to get started!
          </div>
        ) : (
          <>
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                sprintId={sprintId}
                moveTask={moveTask}
              />
            ))}
          </>
        )}
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
      <StartSprintPopup
        isOpen={isStartPopupOpen}
        onClose={() => setIsStartPopupOpen(false)}
        sprintId={sprintId || 0}
        onTaskUpdated={onTaskUpdated}
        projectKey={projectKey}
        workItem={tasks.length}
      />
      <EditDatePopup
        isOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
        sprintId={sprintId || 0}
        onTaskUpdated={onTaskUpdated}
        projectKey={projectKey}
        workItem={tasks.length}
      />
    </div>
  );
};

const SprintColumn: React.FC<SprintColumnProps> = ({
  sprints,
  backlogTasks,
  projectId,
  projectKey,
  onTaskUpdated,
}) => {
  const [updateTaskSprint] = useUpdateTaskSprintMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const { data: statusCategories } = useGetCategoriesByGroupQuery('task_status', {
    refetchOnMountOrArgChange: true,
  });

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

  return (
    <div className='p-4 space-y-4'>
      {sprints.map((sprint) => (
        <Section
          key={sprint.id}
          title={sprint.name}
          tasks={sprint.tasks}
          sprintId={sprint.id}
          sprints={sprints}
          projectId={projectId}
          projectKey={projectKey}
          onTaskUpdated={onTaskUpdated}
          moveTask={moveTask}
        />
      ))}
      {backlogTasks.length > 0 && (
        <Section
          title='Backlog'
          tasks={backlogTasks}
          sprintId={null}
          sprints={sprints}
          projectId={projectId}
          projectKey={projectKey}
          onTaskUpdated={onTaskUpdated}
          moveTask={moveTask}
        />
      )}
    </div>
  );
};

export default SprintColumn;
