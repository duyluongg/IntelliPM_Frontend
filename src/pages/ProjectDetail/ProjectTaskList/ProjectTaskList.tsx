import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetProjectDetailsByKeyQuery,
  useGetWorkItemsByProjectIdQuery,
  type WorkItemList,
  type Assignee as ApiAssignee,
} from '../../../services/projectApi';
import { useUpdateTaskDatMutation } from '../../../services/taskApi';
import { useUpdateEpicMutation } from '../../../services/epicApi';
import {
  useGetProjectMembersWithPositionsQuery,
  type ProjectMemberWithPositionsResponse,
} from '../../../services/projectMemberApi';
import {
  useCreateTaskAssignmentQuickMutation,
  useDeleteTaskAssignmentMutation,
} from '../../../services/taskAssignmentApi';
import { useUpdateSubtaskMutation } from '../../../services/subtaskApi';
import { FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { FcDocument } from 'react-icons/fc';
import { HiDocumentAdd } from 'react-icons/hi';
import { Tooltip } from 'react-tooltip';
import WorkItem from '../../WorkItem/WorkItem';
import EpicPopup from '../../WorkItem/EpicPopup';
import ChildWorkItemPopup from '../../WorkItem/ChildWorkItemPopup';
import taskIcon from '../../../assets/icon/type_task.svg';
import subtaskIcon from '../../../assets/icon/type_subtask.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';
import Doc from '../../PM/YourProject/Doc';
import {
  useCreateDocumentMutation,
  useGetDocumentMappingQuery,
} from '../../../services/Document/documentAPI';
import { useAuth } from '../../../services/AuthContext';

interface UpdateTaskRequestDTO {
  reporterId: number | null;
  projectId: number;
  epicId: string | null;
  sprintId: number | null;
  type: string;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  status: string;
  assignedBy: number | null;
  priority: string;
}

interface UpdateEpicRequestDTO {
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  reporterId: number | null;
  assignedBy: number | null;
}

interface UpdateSubtaskRequestDTO {
  id: string;
  taskId: string;
  title: string;
  description: string;
  plannedEndDate: string;
  status: string;
  reporterId: number | null;
  assignedBy: number;
  priority: string;
}

interface Reporter {
  id?: number | null;
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

interface TaskAssignee {
  id?: number | null;
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

interface ProjectMember {
  id: number;
  accountId: number;
  fullName: string;
  picture: string | null;
  status: string;
}

interface TaskItem {
  id: string;
  type: 'epic' | 'task' | 'bug' | 'subtask' | 'story';
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  comments: number;
  sprint?: number | null;
  sprintName?: string | null;
  assignees: TaskAssignee[];
  dueDate?: string | null;
  labels?: string[];
  created: string;
  updated: string;
  reporter: Reporter;
  reporterId?: number | null;
  projectId?: number;
  epicId?: string | null;
  description: string;
}

// Status Component
const Status: React.FC<{ status: string }> = ({ status }) => {
  const formatStatusForDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to_do':
        return 'TO DO';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'done':
        return 'DONE';
      default:
        return status;
    }
  };

  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'to_do':
        return 'bg-gray-200 text-gray-600';
      case 'in_progress':
        return 'bg-blue-200 text-blue-800';
      case 'done':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className='flex flex-col gap-0.5'>
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusStyle()}`}>
        {formatStatusForDisplay(status)}
      </span>
    </div>
  );
};

// DateWithIcon Component
const DateWithIcon = ({
  date,
  status,
  isDueDate,
}: {
  date?: string | null;
  status: string;
  isDueDate?: boolean;
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dueDate = date
    ? new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate())
    : null;

  let icon = (
    <svg fill='none' viewBox='0 0 16 16' role='presentation' className='w-3.5 h-3.5'>
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z'
        clipRule='evenodd'
      />
    </svg>
  );
  let className =
    'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-gray-700 border';

  if (isDueDate && dueDate) {
    const isOverdue = dueDate < currentDate;
    const isDueToday = dueDate.toDateString() === currentDate.toDateString();
    const isDone = status.toLowerCase() === 'done';

    if (isOverdue && !isDone) {
      icon = (
        <svg
          fill='none'
          viewBox='0 0 16 16'
          role='presentation'
          className='w-3.5 h-3.5 text-red-600'
        >
          <path
            fill='currentColor'
            fillRule='evenodd'
            d='M5.7 1.384c.996-1.816 3.605-1.818 4.602-.003l5.35 9.73C16.612 12.86 15.346 15 13.35 15H2.667C.67 15-.594 12.862.365 11.113zm3.288.72a1.125 1.125 0 0 0-1.972 0l-5.336 9.73c-.41.75.132 1.666.987 1.666H13.35c.855 0 1.398-.917.986-1.667z'
            clipRule='evenodd'
          />
          <path fill='currentColor' fillRule='evenodd' d='M7.25 9V4h1.5v5z' clipRule='evenodd' />
          <path fill='currentColor' d='M9 11.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0' />
        </svg>
      );
      className =
        'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-red-600 border border-red-600';
    } else if (isDueToday && !isDone) {
      icon = (
        <svg
          fill='none'
          viewBox='0 0 16 16'
          role='presentation'
          className='w-3.5 h-3.5 text-orange-600'
        >
          <circle cx='8' cy='8' r='7' stroke='currentColor' strokeWidth='1' fill='none' />
          <path
            fill='currentColor'
            d='M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0M8.75 3.25v4.389l2.219 1.775-.938 1.172-2.5-2-.281-.226V3.25zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0'
          />
        </svg>
      );
      className =
        'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-orange-600 border-2 border-orange-600';
    }
  }

  return (
    <div className={className}>
      {icon}
      <span>{formatDate(date)}</span>
    </div>
  );
};

// Avatar Component
const Avatar = ({
  person,
  onDelete,
}: {
  person: Reporter | TaskAssignee;
  onDelete?: () => Promise<void>;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayName = person.fullName || '-';

  return displayName !== '-' && displayName !== 'Unknown' ? (
    <div
      className='flex items-center gap-1.5 relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-tooltip-id={`assignee-tooltip-${person.id ?? displayName}`}
      data-tooltip-content={`Assignee: ${displayName}`}
    >
      {person.picture ? (
        <img
          src={person.picture}
          alt={`${displayName}'s avatar`}
          className='w-[22px] h-[22px] rounded-full object-cover'
          style={{ backgroundColor: person.avatarColor }}
        />
      ) : (
        <div
          className='w-[22px] h-[22px] rounded-full flex justify-center items-center text-white text-xs font-bold'
          style={{ backgroundColor: person.avatarColor }}
        >
          {person.initials}
        </div>
      )}
      <span className='text-xs text-gray-800'>{displayName}</span>
      {onDelete && isHovered && (
        <button
          onClick={onDelete}
          className='absolute -top-1 -right-1 text-red-600 hover:text-red-800 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center'
          title={`Remove ${displayName}`}
        >
          ✕
        </button>
      )}
      <Tooltip id={`assignee-tooltip-${person.id ?? displayName}`} />
    </div>
  ) : (
    <span className='text-gray-500 text-xs'>-</span>
  );
};

// HeaderBar Component
const HeaderBar: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const { data: membersData, isLoading, error } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  // Filter members with status IN_PROGRESS
  const members = membersData?.data
    ?.filter(member => member.status.toUpperCase() === 'IN_PROGRESS')
    ?.map(member => ({
      id: member.id,
      name: member.fullName || member.accountName || 'Unknown',
      avatar: member.picture || 'https://via.placeholder.com/32', // Updated placeholder size
    })) || [];

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading members...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading members: {(error as any)?.data?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between gap-2.5 mb-8 bg-white rounded p-3'>
      <div className='flex items-center gap-2.5'>
        <div className='relative flex items-center'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none' />
          <input
            type='text'
            className='pl-12 pr-2.5 py-1 border border-gray-300 rounded text-sm bg-white min-w-[240px]'
            placeholder='Search list'
          />
        </div>

        <div className="flex items-center">
          {members.length > 0 ? (
            isMembersExpanded ? (
              <div className="flex items-center">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="relative w-8 h-8 group"
                    style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                  >
                    <img
                      src={member.avatar}
                      alt={`${member.name} avatar`}
                      className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                      onClick={toggleMembers}
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-8 h-8 group">
                <img
                  src={members[0].avatar}
                  alt={`${members[0].name} avatar`}
                  className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                  onClick={toggleMembers}
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {members[0].name}
                </span>
                {members.length > 1 && (
                  <div
                    className="absolute -right-2 -bottom-1 bg-gray-100 border text-xs text-gray-700 px-1.5 py-0.5 rounded-full cursor-pointer"
                    onClick={toggleMembers}
                  >
                    +{members.length - 1}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-xs text-gray-500">No active members</div>
          )}
        </div>

        <button className='flex items-center bg-white border border-blue-500 text-blue-500 px-2 py-1 rounded font-medium text-sm'>
          <FaFilter className='mr-1' />
          Filter{' '}
          <span className='ml-1 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[9px]'>
            1
          </span>
        </button>
      </div>
      <div className='flex items-center gap-1.5'>
        <div className='flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm text-gray-500 cursor-pointer'>
          <MdGroup />
          <span>Group</span>
        </div>
        <button className='bg-none border-none text-gray-500 text-sm cursor-pointer'>
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
};

// ProjectTaskList Component
const ProjectTaskList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: projectDetails } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectDetails?.data?.id;
  const {
    data: workItemsData,
    isLoading,
    error,
    refetch: refetchWorkItems,
  } = useGetWorkItemsByProjectIdQuery(projectId || 0, { skip: !projectId });
  const {
    data: projectMembersResponse,
    isLoading: isMembersLoading,
    error: membersError,
  } = useGetProjectMembersWithPositionsQuery(projectId || 0, { skip: !projectId });
  const [updateTask, { isLoading: isUpdatingTask, error: updateTaskError }] =
    useUpdateTaskDatMutation();
  const [updateEpic, { isLoading: isUpdatingEpic, error: updateEpicError }] =
    useUpdateEpicMutation();
  const [updateSubtask, { isLoading: isUpdatingSubtask, error: updateSubtaskError }] =
    useUpdateSubtaskMutation();
  const [createTaskAssignment, { isLoading: isCreatingAssignment, error: createAssignmentError }] =
    useCreateTaskAssignmentQuickMutation();
  const [deleteTaskAssignment, { isLoading: isDeletingAssignment, error: deleteAssignmentError }] =
    useDeleteTaskAssignmentMutation();

  const [selectedTaskType, setSelectedTaskType] = useState<
    'epic' | 'task' | 'bug' | 'subtask' | 'story' | null
  >(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const shouldShowWorkItem =
    isPopupOpen &&
    selectedTaskId &&
    selectedTaskType !== null &&
    ['task', 'bug', 'story'].includes(selectedTaskType);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTaskId, setDocTaskId] = useState<string | null>(null);
  const [docTaskType, setDocTaskType] = useState<'task' | 'epic' | 'subtask'>('task');
  const [docMode, setDocMode] = useState<'create' | 'view'>('create');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showMemberDropdown, setShowMemberDropdown] = useState<{
    id: string;
    field: 'reporter' | 'assignees';
    type: 'epic' | 'task' | 'bug' | 'subtask' | 'story';
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [createDocument] = useCreateDocumentMutation();
  const { user } = useAuth();
  const [createdDocIds, setCreatedDocIds] = useState<Record<string, number>>({});
  const { data: docMapping, isLoading: isLoadingMapping } = useGetDocumentMappingQuery(
    { projectId: projectId!, userId: user?.id! },
    { skip: !projectId || !user?.id }
  );

  const projectMembers: ProjectMember[] = (projectMembersResponse?.data ?? []).map(
    (member: ProjectMemberWithPositionsResponse) => ({
      id: member.id,
      accountId: member.accountId,
      fullName: member.fullName,
      picture: member.picture,
      status: member.status,
    })
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (docMapping) {
      setCreatedDocIds((prev) => ({ ...prev, ...docMapping }));
    }
  }, [docMapping]);

  const handleAddOrViewDocument = async (taskKey: string, taskType: string) => {
    if (!user?.id || !projectId) return;

    if (createdDocIds[taskKey]) {
      setDocTaskId(taskKey);
      setDocTaskType(taskType as 'epic' | 'task' | 'subtask');
      setDocMode('view');
      setIsDocModalOpen(true);
    } else {
      try {
        const payload = {
          projectId,
          taskId: taskType === 'task' ? taskKey : undefined,
          epicId: taskType === 'epic' ? taskKey : undefined,
          subTaskId: taskType === 'subtask' ? taskKey : undefined,
          type: taskType,
          title: 'Untitled Document',
          template: 'blank',
          content: '',
          createdBy: user.id,
        };

        const res = await createDocument(payload).unwrap();
        setCreatedDocIds((prev) => ({ ...prev, [taskKey]: res.id }));

        setDocTaskId(taskKey);
        setDocTaskType(taskType as 'epic' | 'task' | 'subtask');
        setDocMode('view');
        setIsDocModalOpen(true);
      } catch (error) {
        console.error('Error creating document:', error);
        alert('Failed to create document.');
      }
    }
  };

  const handleOpenPopup = (taskId: string, taskType: TaskItem['type']) => {
    setSelectedTaskId(taskId);
    setSelectedTaskType(taskType);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTaskId(null);
    setSelectedTaskType(null);
    searchParams.delete('taskId');
    setSearchParams(searchParams);
  };

  const handleEditClick = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = async (item: TaskItem) => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    if (!editValue || editValue === (item[field as keyof TaskItem] as string)) {
      setEditingCell(null);
      setEditValue('');
      return;
    }

    // Validation
    if (field === 'summary' && !editValue.trim()) {
      alert('Summary cannot be empty.');
      setEditingCell(null);
      setEditValue('');
      return;
    }

    const isDateField = field === 'dueDate';
    let formattedDate = editValue;
    if (isDateField && editValue) {
      try {
        const newDate = new Date(editValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (newDate < today) {
          alert('Due date cannot be in the past.');
          setEditingCell(null);
          setEditValue('');
          return;
        }
        formattedDate = newDate.toISOString();
      } catch (error) {
        alert('Invalid date format. Please use a valid date.');
        setEditingCell(null);
        setEditValue('');
        return;
      }
    }

    try {
      if (item.type === 'epic') {
        const epicData: UpdateEpicRequestDTO = {
          projectId: item.projectId || projectId || 0,
          name: field === 'summary' ? editValue : item.summary,
          description: item.description || '',
          startDate: item.created || new Date().toISOString(),
          endDate: field === 'dueDate' ? formattedDate : item.dueDate || '',
          status: item.status,
          reporterId: item.reporterId || null,
          assignedBy: item.assignees[0]?.id || null,
        };
        await updateEpic({ id: item.key, data: epicData }).unwrap();
      } else if (item.type === 'subtask') {
        const subtaskData: UpdateSubtaskRequestDTO = {
          id: item.key,
          taskId: item.taskId || '',
          title: field === 'summary' ? editValue : item.summary,
          description: item.description || '',
          plannedEndDate: field === 'dueDate' ? formattedDate : item.dueDate || '',
          status: item.status,
          reporterId: item.reporterId || null,
          assignedBy: item.assignees[0]?.id || 0,
          priority: 'MEDIUM',
        };
        await updateSubtask(subtaskData).unwrap();
      } else {
        const taskData: UpdateTaskRequestDTO = {
          reporterId: item.reporterId || null,
          projectId: item.projectId || projectId || 0,
          epicId: item.epicId || null,
          sprintId: item.sprint || null,
          type: item.type as 'task' | 'bug' | 'story',
          title: field === 'summary' ? editValue : item.summary,
          description: item.description || '',
          plannedStartDate: item.created || new Date().toISOString(),
          plannedEndDate: field === 'dueDate' ? formattedDate : item.dueDate || '',
          status: item.status,
          assignedBy: item.assignees[0]?.id || null,
          priority: 'MEDIUM',
        };
        await updateTask({ id: item.key, body: taskData }).unwrap();
      }
      setEditingCell(null);
      setEditValue('');
      refetchWorkItems();
    } catch (err: any) {
      console.error(`Error updating ${item.type}:`, err);
      const errorMessage = err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to update ${item.type}: ${errorMessage}`);
    }
  };

  const handleMemberSelect = async (
    item: TaskItem,
    field: 'reporter' | 'assignees',
    member: ProjectMember
  ) => {
    if (field === 'assignees') {
      const isAlreadyAssigned = item.assignees.some(
        (assignee: TaskAssignee) => assignee.id === member.accountId
      );
      const isReporter = item.reporter.id === member.accountId;
      if (isAlreadyAssigned || isReporter) {
        alert(
          isAlreadyAssigned
            ? 'This member is already assigned.'
            : 'This member is the reporter and cannot be assigned.'
        );
        return;
      }
    }

    try {
      if (item.type === 'epic') {
        const epicData: UpdateEpicRequestDTO = {
          projectId: item.projectId || projectId || 0,
          name: item.summary,
          description: item.description || '',
          startDate: item.created || new Date().toISOString(),
          endDate: item.dueDate || '',
          status: item.status,
          reporterId: field === 'reporter' ? member.accountId : item.reporterId || null,
          assignedBy: field === 'assignees' ? member.accountId : item.assignees[0]?.id || null,
        };
        await updateEpic({ id: item.key, data: epicData }).unwrap();
      } else if (item.type === 'subtask') {
        const subtaskData: UpdateSubtaskRequestDTO = {
          id: item.key,
          taskId: item.taskId || '',
          title: item.summary,
          description: item.description || '',
          plannedEndDate: item.dueDate || '',
          status: item.status,
          reporterId: field === 'reporter' ? member.accountId : item.reporterId || null,
          assignedBy: field === 'assignees' ? member.accountId : item.assignees[0]?.id || 0,
          priority: 'MEDIUM',
        };
        await updateSubtask(subtaskData).unwrap();
      } else {
        if (field === 'reporter') {
          const taskData: UpdateTaskRequestDTO = {
            reporterId: member.accountId,
            projectId: item.projectId || projectId || 0,
            epicId: item.epicId || null,
            sprintId: item.sprint || null,
            type: item.type as 'task' | 'bug' | 'story',
            title: item.summary,
            description: item.description || '',
            plannedStartDate: item.created || new Date().toISOString(),
            plannedEndDate: item.dueDate || '',
            status: item.status,
            assignedBy: item.assignees[0]?.id || null,
            priority: 'MEDIUM',
          };
          await updateTask({ id: item.key, body: taskData }).unwrap();
        } else {
          await createTaskAssignment({
            taskId: item.key,
            accountId: member.accountId,
          }).unwrap();
        }
      }
      setShowMemberDropdown(null);
      refetchWorkItems();
    } catch (err: any) {
      console.error(`Error updating ${item.type}:`, err);
      const errorMessage = err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to update ${item.type}: ${errorMessage}`);
    }
  };

  const handleDeleteAssignment = async (
    itemId: string,
    assigneeId: number,
    itemType: TaskItem['type']
  ) => {
    try {
      if (itemType === 'epic') {
        const item = tasks.find((t) => t.key === itemId);
        if (!item) throw new Error('Item not found');
        const epicData: UpdateEpicRequestDTO = {
          projectId: item.projectId || projectId || 0,
          name: item.summary,
          description: item.description || '',
          startDate: item.created || new Date().toISOString(),
          endDate: item.dueDate || '',
          status: item.status,
          reporterId: item.reporterId || null,
          assignedBy: null,
        };
        await updateEpic({ id: itemId, data: epicData }).unwrap();
      } else if (itemType === 'subtask') {
        const item = tasks.find((t) => t.key === itemId);
        if (!item) throw new Error('Item not found');
        const subtaskData: UpdateSubtaskRequestDTO = {
          id: itemId,
          taskId: item.taskId || '',
          title: item.summary,
          description: item.description || '',
          plannedEndDate: item.dueDate || '',
          status: item.status,
          reporterId: item.reporterId || null,
          assignedBy: 0,
          priority: 'MEDIUM',
        };
        await updateSubtask(subtaskData).unwrap();
      } else {
        await deleteTaskAssignment({ taskId: itemId, assignmentId: assigneeId }).unwrap();
      }
      refetchWorkItems();
    } catch (err: any) {
      console.error(`Error deleting assignment for ${itemType} ${itemId}:`, err);
      const errorMessage = err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to delete assignment: ${errorMessage}`);
    }
  };

  const handleShowMemberDropdown = (
    id: string,
    field: 'reporter' | 'assignees',
    type: 'task' | 'epic' | 'subtask' | 'bug' | 'story'
  ) => {
    setShowMemberDropdown({ id, field, type });
  };

  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    type: 50,
    key: 120,
    summary: 220,
    status: 110,
    comments: 120,
    sprint: 100,
    assignee: 250,
    dueDate: 130,
    labels: 120,
    created: 130,
    updated: 130,
    reporter: 180,
    document: 180,
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !currentColumn || !tableRef.current) return;
      const dx = e.clientX - startX;
      const newWidth = startWidth + dx;
      if (newWidth > 50) {
        setColumnWidths((prevWidths) => ({
          ...prevWidths,
          [currentColumn]: newWidth,
        }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentColumn(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, currentColumn]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, columnKey: string) => {
    if (tableRef.current) {
      const th = e.currentTarget.parentElement;
      if (th) {
        setIsResizing(true);
        setCurrentColumn(columnKey);
        setStartX(e.clientX);
        setStartWidth(columnWidths[columnKey]);
      }
    }
  };

  const tasks: TaskItem[] =
    isLoading || error || !workItemsData?.data
      ? []
      : workItemsData.data.map((item: WorkItemList) => {
          // Loại bỏ trùng lặp trong assignees
          const uniqueAssignees = Array.from(
            new Map(item.assignees.map((assignee) => [assignee.accountId, assignee])).values()
          );

          const assignments: TaskAssignee[] = uniqueAssignees
            .filter(
              (assignee: ApiAssignee) => assignee.accountId !== 0 && assignee.fullname !== 'Unknown'
            )
            .map((assignee: ApiAssignee) => ({
              id: assignee.accountId,
              fullName: assignee.fullname || 'Unknown',
              initials:
                assignee.fullname
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2) || '',
              avatarColor: '#f3eded',
              picture: assignee.picture || undefined,
            }));

          return {
            id: item.key || '',
            type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask' | 'story',
            key: item.key || '',
            taskId: item.taskId || null,
            summary: item.summary || '',
            status: item.status ? item.status.replace(' ', '_').toLowerCase() : '',
            comments: item.commentCount || 0,
            sprint: item.sprintId || null,
            sprintName: item.sprintName || null,
            assignees: assignments,
            dueDate: item.dueDate || null,
            labels: item.labels || [],
            created: item.createdAt || '',
            updated: item.updatedAt || '',
            reporter: {
              id: item.reporterId || null,
              fullName: item.reporterFullname || 'Unknown',
              initials:
                item.reporterFullname
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2) || '',
              avatarColor: '#f3eded',
              picture: item.reporterPicture || undefined,
            },
            reporterId: item.reporterId || null,
            projectId: item.projectId || projectId,
            epicId: null,
            description: '',
          };
        });

  if (isLoading || isMembersLoading || isLoadingMapping) {
    return (
      <div className='text-center py-10 text-gray-600'>
        Loading tasks, members, or document mappings...
      </div>
    );
  }

  if (
    error ||
    membersError ||
    updateTaskError ||
    updateEpicError ||
    updateSubtaskError ||
    createAssignmentError ||
    deleteAssignmentError
  ) {
    console.error('Error:', {
      error,
      membersError,
      updateTaskError,
      updateEpicError,
      updateSubtaskError,
      createAssignmentError,
      deleteAssignmentError,
    });
    return <div className='text-center py-10 text-red-500'>Error loading or updating data.</div>;
  }

  return (
    <section className='p-3 font-sans bg-white w-full block relative left-0'>
      <HeaderBar projectId={projectId || 0} />
      {(isUpdatingTask ||
        isUpdatingEpic ||
        isUpdatingSubtask ||
        isCreatingAssignment ||
        isDeletingAssignment) && (
        <div className='text-center py-4 text-blue-500'>Processing...</div>
      )}
      <div className='overflow-x-auto bg-white w-full block'>
        <table
          className='w-full border-separate border-spacing-0 min-w-[800px] table-fixed'
          ref={tableRef}
        >
          <thead>
            <tr>
              <th
                style={{ width: `${columnWidths.type}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Type
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'type')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.key}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Key
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'key')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.summary}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Summary
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'summary')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.status}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Status
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'status')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.comments}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Comments
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'comments')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.sprint}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Sprint
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'sprint')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.assignee}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Assignees
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'assignee')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.dueDate}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Due Date
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'dueDate')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.labels}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Labels
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'labels')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.created}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Created
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'created')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.updated}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Updated
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'updated')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.reporter}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Reporter
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'reporter')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.document}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Document
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'document')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className='hover:bg-gray-100'>
                <td
                  style={{ width: `${columnWidths.type}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.type === 'task' && (
                    <img src={taskIcon} alt='Task' className='w-5 h-5 rounded p-0.5' />
                  )}
                  {task.type === 'subtask' && (
                    <img src={subtaskIcon} alt='Subtask' className='w-5 h-5 rounded p-0.5' />
                  )}
                  {task.type === 'bug' && (
                    <img src={bugIcon} alt='Bug' className='w-5 h-5 rounded p-0.5' />
                  )}
                  {task.type === 'epic' && (
                    <img src={epicIcon} alt='Epic' className='w-5 h-5 rounded p-0.5' />
                  )}
                  {task.type === 'story' && (
                    <img src={storyIcon} alt='Story' className='w-5 h-5 rounded p-0.5' />
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.key}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.type === 'subtask' && task.taskId && task.taskId !== 'Unknown' ? (
                    <div className='flex flex-col items-start w-full'>
                      <span className='text-[0.68rem] text-gray-600 mb-0.5'>{task.taskId}</span>
                      <div className='flex items-center gap-1'>
                        <svg
                          role='presentation'
                          width='16'
                          height='16'
                          viewBox='0 0 16 16'
                          fill='none'
                          className='w-3.5 h-3.5'
                        >
                          <circle
                            cx='5.33333'
                            cy='5.33333'
                            r='1.33333'
                            stroke='#42526E'
                            strokeWidth='1.33333'
                            fill='none'
                          />
                          <circle
                            cx='10.6667'
                            cy='10.6666'
                            r='1.33333'
                            stroke='#42526E'
                            strokeWidth='1.33333'
                            fill='none'
                          />
                          <path
                            d='M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337'
                            stroke='#42526E'
                            strokeWidth='1.33333'
                            fill='none'
                          />
                        </svg>
                        <span
                          className='text-xs text-black cursor-pointer hover:underline'
                          onClick={() => handleOpenPopup(task.key, task.type)}
                        >
                          {task.key}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-start w-full'>
                      <span
                        className='text-xs text-black cursor-pointer hover:underline'
                        onClick={() => handleOpenPopup(task.key, task.type)}
                      >
                        {task.key}
                      </span>
                    </div>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.summary}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {editingCell?.id === task.id && editingCell?.field === 'summary' ? (
                    <input
                      type='text'
                      value={editValue}
                      onChange={handleInputChange}
                      onBlur={() => handleInputBlur(task)}
                      autoFocus
                      className='w-full p-1 border border-gray-300 rounded'
                    />
                  ) : (
                    <span onClick={() => handleEditClick(task.id, 'summary', task.summary)}>
                      {task.summary}
                    </span>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.status}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  <Status status={task.status} />
                </td>
                <td
                  style={{ width: `${columnWidths.comments}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.comments > 0 ? (
                    <div className='flex items-center gap-1 text-xs text-gray-700'>
                      <svg fill='none' viewBox='0 0 16 16' role='presentation' className='w-4 h-4'>
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span>{task.comments} comment</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-1 text-xs text-gray-500 bg-transparent rounded p-0.5'>
                      <svg
                        fill='none'
                        viewBox='0 0 16 16'
                        role='presentation'
                        className='w-4 h-4 min-w-[16px] min-h-[16px]'
                      >
                        <path
                          fill='currentColor'
                          fillRule='evenodd'
                          d='M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span>Add comment</span>
                    </div>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.sprint}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.sprint && task.sprint !== 0 ? (
                    <span className='inline-block px-2 py-0.5 border border-gray-300 rounded text-[0.7rem] text-gray-800'>
                      {task.sprintName}
                    </span>
                  ) : (
                    ''
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.assignee}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-visible relative'
                >
                  {showMemberDropdown?.id === task.id &&
                  showMemberDropdown?.field === 'assignees' ? (
                    <div
                      ref={dropdownRef}
                      className='absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto w-64 p-2 top-8 left-0'
                    >
                      {projectMembers.length ? (
                        projectMembers.map((member: ProjectMember) => {
                          const isDisabled =
                            task.assignees.some((a: TaskAssignee) => a.id === member.accountId) ||
                            task.reporter.id === member.accountId;
                          return (
                            <div
                              key={member.accountId}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                                isDisabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-gray-100 cursor-pointer hover:shadow-sm'
                              }`}
                              onClick={() =>
                                !isDisabled && handleMemberSelect(task, 'assignees', member)
                              }
                            >
                              <div className='relative'>
                                {member.picture ? (
                                  <img
                                    src={member.picture}
                                    alt={`${member.fullName}'s avatar`}
                                    className='w-8 h-8 rounded-full object-cover border border-gray-200'
                                  />
                                ) : (
                                  <div
                                    className='w-8 h-8 rounded-full flex justify-center items-center text-white text-sm font-bold'
                                    style={{ backgroundColor: '#6b7280' }}
                                  >
                                    {member.fullName
                                      .split(' ')
                                      .map((n: string) => n[0])
                                      .join('')
                                      .substring(0, 2)}
                                  </div>
                                )}
                              </div>
                              <span className='text-gray-900 font-medium truncate'>
                                {member.fullName}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className='text-gray-500 text-xs'>No members available</span>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleShowMemberDropdown(task.id, 'assignees', task.type)}
                      className='flex flex-wrap gap-2 p-1 rounded hover:bg-gray-200 cursor-pointer'
                    >
                      {task.assignees.length ? (
                        task.assignees.map((assignee: TaskAssignee, index: number) => (
                          <Avatar
                            key={assignee.id ?? index}
                            person={assignee}
                            onDelete={
                              assignee.id != null && assignee.id !== 0
                                ? () =>
                                    handleDeleteAssignment(
                                      task.key,
                                      assignee.id as number,
                                      task.type
                                    )
                                : undefined
                            }
                          />
                        ))
                      ) : (
                        <span className='text-gray-500 text-xs'>No assignees</span>
                      )}
                    </div>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.dueDate}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {editingCell?.id === task.id && editingCell?.field === 'dueDate' ? (
                    <input
                      type='date'
                      value={editValue ? new Date(editValue).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      onBlur={() => handleInputBlur(task)}
                      autoFocus
                      className='w-full p-1 border border-gray-300 rounded'
                    />
                  ) : (
                    <span onClick={() => handleEditClick(task.id, 'dueDate', task.dueDate || '')}>
                      {task.dueDate && task.dueDate !== 'Unknown' ? (
                        <DateWithIcon date={task.dueDate} status={task.status} isDueDate={true} />
                      ) : (
                        ''
                      )}
                    </span>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.labels}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.labels && task.labels.length > 0 && task.labels[0] !== 'Unknown'
                    ? task.labels.map((label, index) => (
                        <span
                          key={index}
                          className='inline-block px-2 py-0.5 mr-1 border border-gray-300 rounded text-[0.7rem] text-gray-800'
                        >
                          {label}
                        </span>
                      ))
                    : ''}
                </td>
                <td
                  style={{ width: `${columnWidths.created}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.created !== 'Unknown' ? (
                    <DateWithIcon date={task.created} status={task.status} />
                  ) : (
                    ''
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.updated}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                >
                  {task.updated !== 'Unknown' ? (
                    <DateWithIcon date={task.updated} status={task.status} />
                  ) : (
                    ''
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.reporter}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-visible relative'
                >
                  {showMemberDropdown?.id === task.id &&
                  showMemberDropdown?.field === 'reporter' ? (
                    <div
                      ref={dropdownRef}
                      className='absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto w-64 p-2 top-8 left-0'
                    >
                      {projectMembers.map((member: ProjectMember) => {
                        const isDisabled = task.reporter.id === member.accountId;
                        return (
                          <div
                            key={member.accountId}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                              isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-100 cursor-pointer hover:shadow-sm'
                            }`}
                            onClick={() =>
                              !isDisabled && handleMemberSelect(task, 'reporter', member)
                            }
                          >
                            <div className='relative'>
                              {member.picture ? (
                                <img
                                  src={member.picture}
                                  alt={`${member.fullName}'s avatar`}
                                  className='w-8 h-8 rounded-full object-cover border border-gray-200'
                                />
                              ) : (
                                <div
                                  className='w-8 h-8 rounded-full flex justify-center items-center text-white text-sm font-bold'
                                  style={{ backgroundColor: '#6b7280' }}
                                >
                                  {member.fullName
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className='text-gray-900 font-medium truncate'>
                              {member.fullName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleShowMemberDropdown(task.id, 'reporter', task.type)}
                      className='hover:bg-gray-200 cursor-pointer p-1 rounded'
                    >
                      <Avatar person={task.reporter} />
                    </div>
                  )}
                </td>
                <td
                  style={{ width: `${columnWidths.document}px` }}
                  className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden '
                >
                  {createdDocIds[task.key] ? (
                    <button
                      className='flex justify-center items-center mx-auto text-blue-600 hover:text-blue-800 transition duration-150 group'
                      onClick={() => handleAddOrViewDocument(task.key, task.type)}
                    >
                      <FcDocument className='w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110' />
                    </button>
                  ) : (
                    <button
                      className='flex justify-center items-center mx-auto text-gray-600 hover:text-gray-800 transition duration-150 group'
                      onClick={() => handleAddOrViewDocument(task.key, task.type)}
                    >
                      <HiDocumentAdd className='w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110' />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDocModalOpen && docTaskId && user?.id && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-xl relative w-full h-full sm:w-[95vw] sm:h-[90vh] md:w-[90vw] md:h-[90vh] lg:w-[90vw] lg:h-[90vh] xl:w-[98vw] xl:h-[95vh] 2xl:w-[85vw] 2xl:h-[90vh] shadow-2xl flex flex-col'>
            <div className='flex-shrink-0 relative p-4 sm:p-6 border-b border-gray-100'>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className='absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors duration-200 text-lg sm:text-xl md:text-2xl shadow-sm hover:shadow-md'
                aria-label='Close modal'
              >
                ✕
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
              <Doc
                docId={createdDocIds[docTaskId]}
                onClose={() => setIsDocModalOpen(false)}
                updatedBy={user.id}
              />
            </div>
          </div>
        </div>
      )}
      {isPopupOpen && selectedTaskId && selectedTaskType === 'epic' && (
        <EpicPopup id={selectedTaskId} onClose={handleClosePopup} />
      )}
      {isPopupOpen && selectedTaskType === 'subtask' && selectedTaskId && (
        <ChildWorkItemPopup
          taskId={selectedTaskId}
          onClose={handleClosePopup}
          item={{
            key: selectedTaskId,
            summary: '',
            assignee: '',
            parent: '',
            status: '',
          }}
        />
      )}
      {shouldShowWorkItem && (
        <WorkItem isOpen={true} onClose={handleClosePopup} taskId={selectedTaskId as string} />
      )}
    </section>
  );
};

export default ProjectTaskList;