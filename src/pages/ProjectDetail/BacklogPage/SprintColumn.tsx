import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  useUpdateTaskTitleMutation,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
  useUpdateTaskSprintMutation,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import { useGetCategoriesByGroupQuery, type DynamicCategory } from '../../../services/dynamicCategoryApi';
import { useDrag, useDrop, type ConnectDragSource, type ConnectDropTarget } from 'react-dnd';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';

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

const TaskItem: React.FC<TaskItemProps> = ({ task, index, sprintId, moveTask }) => {
  const { data: statusCategories, isLoading: isStatusLoading, error: categoryError } = useGetCategoriesByGroupQuery('task_status');
  const [updateTaskStatus, { isLoading: isUpdatingStatus, error: statusError }] = useUpdateTaskStatusMutation();
  const [updateTaskTitle, { isLoading: isUpdatingTitle, error: titleError }] = useUpdateTaskTitleMutation();

  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, index, sprintId, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

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
      console.log(`Cập nhật tiêu đề cho task ${task.id} thành: ${title}`);
      await updateTaskTitle({ id: task.id, title }).unwrap();
      setEditingTitle(false);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật tiêu đề:', err);
      const errorMessage = err?.data?.message || 'Không thể cập nhật tiêu đề';
      alert(`Không thể cập nhật tiêu đề: ${errorMessage}`);
      setTitle(task.title);
      setEditingTitle(false);
    }
  };

  const handleStatusChange = async (newStatusLabel: string) => {
    try {
      const category = statusCategories?.data?.find(c => c.label === newStatusLabel);
      const apiStatus = category?.name || (newStatusLabel === 'To Do' ? 'TO_DO' : newStatusLabel === 'In Progress' ? 'IN_PROGRESS' : 'DONE');
      console.log(`Cập nhật trạng thái cho task ${task.id} thành: ${apiStatus}`);
      const response = await updateTaskStatus({ id: task.id, status: apiStatus }).unwrap();
      console.log('Kết quả cập nhật trạng thái:', response);
      setStatus(newStatusLabel);
      setOpenDropdown(false);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      const errorMessage = err?.data?.message || 'Không thể cập nhật trạng thái';
      console.log('Chi tiết lỗi:', { error: err, status: err.status, data: err.data });
      alert(`Không thể cập nhật trạng thái: ${errorMessage}`);
      setStatus(mapApiStatusToUI(task.status, statusCategories?.data || []));
    }
  };

  const assignees = task.taskAssignments.map((a) => ({
    name: a.accountFullname || 'Không xác định',
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
    return <div className="text-xs text-gray-500">Đang tải trạng thái...</div>;
  }

  if (categoryError) {
    return <div className="text-xs text-red-500">Lỗi tải trạng thái: {(categoryError as any)?.data?.message || 'Lỗi không xác định'}</div>;
  }

  return (
    <div
      ref={ref}
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
        <div className="text-xs text-blue-500">Đang cập nhật...</div>
      )}
      {titleError && (
        <div className="text-xs text-red-500">
          Lỗi: {(titleError as any)?.data?.message || 'Không thể cập nhật tiêu đề'}
        </div>
      )}
      {statusError && (
        <div className="text-xs text-red-500">
          Lỗi: {(statusError as any)?.data?.message || 'Không thể cập nhật trạng thái'}
        </div>
      )}
    </div>
  );
};

const SprintColumn: React.FC<SprintColumnProps> = ({ sprints, backlogTasks, projectId, onTaskUpdated }) => {
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [createTask, { isLoading: isCreatingTask, error: createTaskError }] = useCreateTaskMutation();
  const [updateTaskSprint, { isLoading: isUpdatingSprint, error: sprintError }] = useUpdateTaskSprintMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const { data: statusCategories } = useGetCategoriesByGroupQuery('task_status');

  const moveTask = async (taskId: string, toSprintId: number | null, toStatus: string | null) => {
    try {
      console.log(`Di chuyển task ${taskId} đến sprint ${toSprintId ?? 'Backlog'}${toStatus ? ` với trạng thái ${toStatus}` : ''}`);
      await updateTaskSprint({ id: taskId, sprintId: toSprintId }).unwrap();
      if (toStatus) {
        const apiStatus = statusCategories?.data?.find(c => c.label === toStatus)?.name ||
          (toStatus === 'To Do' ? 'TO_DO' : toStatus === 'In Progress' ? 'IN_PROGRESS' : 'DONE');
        console.log(`Cập nhật trạng thái task ${taskId} thành: ${apiStatus}`);
        await updateTaskStatus({ id: taskId, status: apiStatus }).unwrap();
      }
      onTaskUpdated(); // Trigger refetch of sprint and backlog data
    } catch (err: any) {
      console.error('Lỗi khi di chuyển task:', err);
      const errorMessage = err?.data?.message || 'Không thể di chuyển task';
      console.log('Chi tiết lỗi:', { error: err, status: err.status, data: err.data });
      alert(`Không thể di chuyển task: ${errorMessage}`);
    }
  };

  const renderSection = (title: string, tasks: TaskBacklogResponseDTO[], actionText: string, sprintId: number | null) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'TASK',
      drop: (item: { id: string; index: number; sprintId: number | null; status: string | null }) => {
        if (item.sprintId !== sprintId) {
          const defaultStatus = sprintId === null ? 'To Do' : null;
          moveTask(item.id, sprintId, defaultStatus);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    drop(ref);

    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl border border-gray-200 mb-4 ${isOver ? 'bg-blue-50' : ''}`}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500">{tasks.length} công việc{tasks.length !== 1 ? '' : ''}</p>
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
              placeholder="Cần làm gì?"
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
            Lỗi: {(createTaskError as any)?.data?.message || 'Không thể tạo task'}
          </div>
        )}
        {sprintError && (
          <div className="text-xs text-red-500 px-3 py-1">
            Lỗi: {(sprintError as any)?.data?.message || 'Không thể cập nhật sprint'}
          </div>
        )}
      </div>
    );
  };

  const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>, section: string) => {
    if (e.key !== 'Enter' || !newTaskTitle.trim()) return;

    try {
      const defaultStatus = statusCategories?.data?.find(c => c.isActive && c.orderIndex === 1)?.name || 'TO_DO';
      const sprintId = section !== 'Backlog' ? sprints.find(s => s.name === section)?.id : null;
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
      console.log('Tạo task:', newTask);
      const response = await createTask(newTask).unwrap();
      console.log('Kết quả tạo task:', response);
      setNewTaskTitle('');
      onTaskUpdated(); // Trigger refetch of sprint and backlog data
    } catch (err: any) {
      console.error('Lỗi khi tạo task:', err);
      const errorMessage = err?.data?.message || 'Không thể tạo task';
      alert(`Không thể tạo task: ${errorMessage}`);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {sprints.map((sprint) => renderSection(sprint.name, sprint.tasks, 'Hoàn thành sprint', sprint.id))}
      {backlogTasks.length > 0 && renderSection('Backlog', backlogTasks, 'Tạo sprint', null)}
    </div>
  );
};

export default SprintColumn;