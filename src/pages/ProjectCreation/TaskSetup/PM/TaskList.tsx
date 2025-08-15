import React, { useEffect, useState, useRef } from 'react';
import { type TaskState } from '../../../../services/aiApi';
import EditEpicPopup from '../EditEpicPopup';
import EditTaskPopup from '../EditTaskPopup';
import EditDatePopup from '../EditDatePopup';
import CreateTaskPopup from '../CreateTaskPopup';
import NotifyPMConfirmPopup from '../NotifyPMConfirmPopup';
import AiResponseEvaluationPopup from '../../../../components/AiResponse/AiResponseEvaluationPopup';
import taskIcon from '../../../../assets/icon/type_task.svg';
import epicIcon from '../../../../assets/icon/type_epic.svg';
import galaxyaiIcon from '../../../../assets/galaxyai.gif';
import { Plus, BookUser } from 'lucide-react';

interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
  backendEpicId?: string;
}

interface Member {
  accountId: number;
  fullName: string;
  picture?: string;
}

interface TaskRow {
  id: string;
  type: 'TASK' | 'EPIC';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignees: { name: string; picture: string | null; id?: number | null }[];
  epicId?: string;
}

interface TaskListProps {
  epics: EpicState[];
  membersData: { data?: Member[] } | undefined;
  isGenerating: boolean;
  editingEpic: EpicState | null;
  setEditingEpic: (epic: EpicState | null) => void;
  handleEditEpic: () => void;
  editingTask: { epicId: string; task: TaskState } | null;
  setEditingTask: (task: { epicId: string; task: TaskState } | null) => void;
  editingDateTask: { epicId: string; task: TaskState; field: 'startDate' | 'endDate' } | null;
  setEditingDateTask: (
    task: { epicId: string; task: TaskState; field: 'startDate' | 'endDate' } | null
  ) => void;
  handleEditTask: (epicId: string, taskId: string, updatedTask: Partial<TaskState>) => void;
  handleDeleteTask: (epicId: string, taskId: string) => void;
  dropdownTaskId: string | null;
  setDropdownTaskId: (id: string | null) => void;
  handleAddMember: (epicId: string, taskId: string, accountId: number) => void;
  handleRemoveMember: (epicId: string, taskId: string, accountId: number) => void;
  isCreatingTask: boolean;
  newTask: {
    epicId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    suggestedRole: string;
    assignedMembers: { accountId: number; fullName: string; picture: string }[];
    newEpicTitle?: string;
    newEpicDescription?: string;
    newEpicStartDate?: string;
    newEpicEndDate?: string;
  };
  setNewTask: (task: any) => void;
  isMemberDropdownOpen: boolean;
  setIsMemberDropdownOpen: (open: boolean) => void;
  handleCreateTask: () => void;
  handleAddNewTaskMember: (accountId: number) => void;
  handleRemoveNewTaskMember: (accountId: number) => void;
  memberDropdownRef: React.MutableRefObject<HTMLDivElement | null>;
  isNotifyPMConfirmOpen: boolean;
  setIsNotifyPMConfirmOpen: (open: boolean) => void;
  handleConfirmNotifyPM: () => void;
  isEvaluationPopupOpen: boolean;
  handleCloseEvaluationPopup: () => void;
  aiResponseJson: string;
  projectId: number | undefined;
  handleEvaluationSubmitSuccess: (aiResponseId: number) => void;
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const DateWithIcon = ({ date }: { date?: string | null }) => {
  const icon = (
    <svg fill='none' viewBox='0 0 16 16' role='presentation' className='w-3.5 h-3.5'>
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z'
        clipRule='evenodd'
      />
    </svg>
  );
  return (
    <div className='flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-gray-700 border'>
      {icon}
      <span>{formatDate(date)}</span>
    </div>
  );
};

const Avatar = ({
  person,
  onDelete,
}: {
  person: { name: string | null | undefined; picture: string | null; id?: number | null };
  onDelete?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayName = person.name || '-';

  return displayName !== '-' ? (
    <div
      className='flex items-center gap-1.5 relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {person.picture ? (
        <img
          src={person.picture}
          alt={`${displayName}'s avatar`}
          className='w-[22px] h-[22px] rounded-full object-cover'
          style={{ backgroundColor: '#f3eded' }}
        />
      ) : (
        <div
          className='w-[22px] h-[22px] rounded-full flex justify-center items-center text-white text-xs font-bold'
          style={{ backgroundColor: '#f3eded' }}
        >
          {displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)}
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
    </div>
  ) : (
    <span className='text-gray-500 text-xs'>-</span>
  );
};

const TaskList: React.FC<TaskListProps> = ({
  epics,
  membersData,
  isGenerating,
  editingEpic,
  setEditingEpic,
  handleEditEpic,
  editingTask,
  setEditingTask,
  editingDateTask,
  setEditingDateTask,
  handleEditTask,
  handleDeleteTask,
  dropdownTaskId,
  setDropdownTaskId,
  handleAddMember,
  handleRemoveMember,
  isCreatingTask,
  newTask,
  setNewTask,
  isMemberDropdownOpen,
  setIsMemberDropdownOpen,
  handleCreateTask,
  handleAddNewTaskMember,
  handleRemoveNewTaskMember,
  memberDropdownRef,
  isNotifyPMConfirmOpen,
  setIsNotifyPMConfirmOpen,
  handleConfirmNotifyPM,
  isEvaluationPopupOpen,
  handleCloseEvaluationPopup,
  aiResponseJson,
  projectId,
  handleEvaluationSubmitSuccess,
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showMemberDropdown, setShowMemberDropdown] = useState<{
    id: string;
    type: 'TASK';
  } | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<{ [key: string]: boolean }>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Initialize and update expandedEpics when epics prop changes
  useEffect(() => {
    // Log epicIds to check for duplicates
    console.log('Epics:', epics.map((epic) => ({ id: epic.epicId, title: epic.title })));
    
    // Check for duplicate epicIds
    const epicIds = epics.map((epic) => epic.epicId);
    const uniqueEpicIds = new Set(epicIds);
    if (uniqueEpicIds.size !== epicIds.length) {
      console.warn('Duplicate epicIds detected:', epicIds);
    }

    setExpandedEpics((prev) => {
      const newState = { ...prev };
      // Add new epics with default false state
      epics.forEach((epic) => {
        if (!(epic.epicId in newState)) {
          newState[epic.epicId] = false;
        }
      });
      // Remove epics that no longer exist
      Object.keys(newState).forEach((epicId) => {
        if (!epics.some((e) => e.epicId === epicId)) {
          delete newState[epicId];
        }
      });
      console.log('Updated expandedEpics:', newState);
      return newState;
    });
  }, [epics]);

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => {
      const newState = {
        ...prev,
        [epicId]: !prev[epicId],
      };
      console.log(`Toggled epic ${epicId}:`, newState);
      return newState;
    });
  };

  const toggleAllEpics = () => {
    const allExpanded = Object.values(expandedEpics).every((isExpanded) => isExpanded);
    setExpandedEpics((prev) => {
      const newState: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((epicId) => {
        newState[epicId] = !allExpanded;
      });
      console.log('Toggled all epics:', newState);
      return newState;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMemberDropdown(null);
        setIsMemberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsMemberDropdownOpen]);

  const handleEditClick = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = (item: TaskRow) => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    if (!editValue || editValue === item[field as keyof TaskRow]) {
      setEditingCell(null);
      setEditValue('');
      return;
    }

    const isDateField = field === 'startDate' || field === 'endDate';
    let formattedDate = editValue;
    if (isDateField && editValue) {
      try {
        formattedDate = new Date(editValue).toISOString().split('T')[0];
      } catch (error) {
        alert('Invalid date format. Please use a valid date.');
        setEditingCell(null);
        setEditValue('');
        return;
      }
    }

    const newStartDate = field === 'startDate' ? formattedDate : item.startDate;
    const newEndDate = field === 'endDate' ? formattedDate : item.endDate;
    if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
      alert('Start date cannot be after end date.');
      setEditingCell(null);
      setEditValue('');
      return;
    }

    if (item.type === 'EPIC') {
      setEditingEpic({
        ...epics.find((e) => e.epicId === id)!,
        [field]: editValue,
      });
      handleEditEpic();
    } else if (item.type === 'TASK') {
      handleEditTask(item.epicId!, item.id, {
        [field]: isDateField ? formattedDate : editValue,
      });
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleMemberSelect = (item: TaskRow, member: Member) => {
    if (item.type === 'TASK') {
      const isAlreadyAssigned = item.assignees.some((assignee) => assignee.id === member.accountId);
      if (isAlreadyAssigned) {
        alert('This member is already assigned.');
        return;
      }
      if (item.assignees.length >= 3) {
        alert('A task can have a maximum of 3 assignees.');
        return;
      }
      handleAddMember(item.epicId!, item.id, member.accountId);
    }
    setShowMemberDropdown(null);
    setIsMemberDropdownOpen(false);
  };

  const handleDeleteAssignment = (item: TaskRow, assigneeId: number) => {
    if (item.type === 'TASK') {
      handleRemoveMember(item.epicId!, item.id, assigneeId);
    }
    setShowMemberDropdown(null);
  };

  const handleShowMemberDropdown = (id: string, type: 'TASK' | 'EPIC') => {
    if (type === 'TASK') {
      setShowMemberDropdown({ id, type });
      setIsMemberDropdownOpen(true);
    }
  };

  const handleDetailsClick = (item: TaskRow) => {
    if (item.type === 'EPIC') {
      const epic = epics.find((e) => e.epicId === item.id);
      if (epic) setEditingEpic(epic);
    } else if (item.type === 'TASK') {
      const epic = epics.find((e) => e.epicId === item.epicId);
      if (epic) {
        const task = epic.tasks.find((t) => t.id === item.id);
        if (task) setEditingTask({ epicId: item.epicId!, task });
      }
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes gradientLoading {
            0% { background-position: 200% 50%; }
            100% { background-position: 0% 50%; }
          }
          .title-cell {
            white-space: normal;
            word-wrap: break-word;
            line-height: 1.4;
            max-height: 4.2em; /* Approximately 3 lines at line-height 1.4 */
            overflow: hidden;
          }
          .assignee-cell {
            white-space: normal;
            word-wrap: break-word;
            line-height: 1.4;
            max-height: 5.6em; /* Approximately 3 assignees at ~1.4em each */
            overflow: hidden;
          }
        `}
      </style>
      {isGenerating ? (
        <div className='flex justify-center items-center py-8 bg-white/50 rounded-2xl shadow-md'>
          <div className='flex flex-col items-center gap-4'>
            <img src={galaxyaiIcon} alt='AI Processing' className='w-8 h-8' />
            <div className='flex items-center gap-2'>
              <span
                style={{
                  background:
                    'linear-gradient(90deg, #1c73fd 0%, #4a90e2 25%, #00d4ff 50%, #4a90e2 75%, #1c73fd 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  animation: 'gradientLoading 1.8s ease-in-out infinite',
                }}
                className='text-xl font-semibold'
              >
                Processing with AI
              </span>
            </div>
          </div>
        </div>
      ) : (
        <section className='p-3 font-sans bg-white w-full'>
          <div className='mb-4'>
            <button onClick={toggleAllEpics} className='text-sm text-blue-600 hover:text-blue-800'>
              {Object.values(expandedEpics).every((isExpanded) => isExpanded)
                ? 'Collapse All'
                : 'Expand All'}
            </button>
          </div>
          {epics.length === 0 ? (
            <div className='px-6 py-4 text-center text-gray-500'>
              No epics or tasks created yet. Use "Generate with AI" or "Create Task" to start.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse text-sm text-gray-800'>
                <thead>
                  <tr className='bg-gray-100 border-b border-gray-200'>
                    <th className='p-2 text-left font-medium w-12'></th>
                    <th className='p-2 text-left font-medium w-12'>No.</th>
                    <th className='p-2 text-left font-medium w-16'>Type</th>
                    <th className='p-2 text-left font-medium min-w-[200px]'>Title</th>
                    <th className='p-2 text-left font-medium w-32'>Start Date</th>
                    <th className='p-2 text-left font-medium w-32'>End Date</th>
                    <th className='p-2 text-left font-medium min-w-[150px]'>Assignees</th>
                    <th className='p-2 text-left font-medium w-24'>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {epics.map((epic, epicIndex) => {
                    const epicRow: TaskRow = {
                      id: epic.epicId,
                      type: 'EPIC',
                      title: epic.title,
                      description: epic.description,
                      startDate: epic.startDate,
                      endDate: epic.endDate,
                      assignees: [],
                    };
                    const taskRows: TaskRow[] = epic.tasks.map((task) => ({
                      id: task.id,
                      type: 'TASK',
                      title: task.title,
                      description: task.description,
                      startDate: task.startDate,
                      endDate: task.endDate,
                      assignees: task.assignedMembers.map((member) => ({
                        id: member.accountId,
                        name: member.fullName,
                        picture: member.picture,
                      })),
                      epicId: epic.epicId,
                    }));

                    return (
                      <React.Fragment key={epic.epicId}>
                        <tr className='border-b border-gray-200 bg-white hover:bg-gray-50'>
                          <td className='p-2'>
                            <button
                              onClick={() => toggleEpic(epic.epicId)}
                              className='focus:outline-none'
                              aria-expanded={expandedEpics[epic.epicId] || false}
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedEpics[epic.epicId] ? 'rotate-90' : ''
                                }`}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  d='M9 5l7 7-7 7'
                                />
                              </svg>
                            </button>
                          </td>
                          <td className='p-2'></td>
                          <td className='p-2'>
                            <img src={epicIcon} alt='Epic' className='w-6 h-6 rounded p-1' />
                          </td>
                          <td className='p-2 title-cell'>
                            {editingCell?.id === epicRow.id && editingCell?.field === 'title' ? (
                              <input
                                type='text'
                                value={editValue}
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur(epicRow)}
                                autoFocus
                                className='w-full p-1 border border-gray-300 rounded text-sm'
                              />
                            ) : (
                              <span
                                className='cursor-pointer'
                                onClick={() => handleEditClick(epicRow.id, 'title', epicRow.title)}
                              >
                                {epicRow.title}
                              </span>
                            )}
                          </td>
                          <td className='p-2'>
                            {editingCell?.id === epicRow.id &&
                            editingCell?.field === 'startDate' ? (
                              <input
                                type='date'
                                value={
                                  editValue ? new Date(editValue).toISOString().split('T')[0] : ''
                                }
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur(epicRow)}
                                autoFocus
                                className='w-full p-1 border border-gray-300 rounded text-sm'
                              />
                            ) : (
                              <span
                                className='cursor-pointer'
                                onClick={() =>
                                  handleEditClick(epicRow.id, 'startDate', epicRow.startDate)
                                }
                              >
                                <DateWithIcon date={epicRow.startDate} />
                              </span>
                            )}
                          </td>
                          <td className='p-2'>
                            {editingCell?.id === epicRow.id && editingCell?.field === 'endDate' ? (
                              <input
                                type='date'
                                value={
                                  editValue ? new Date(editValue).toISOString().split('T')[0] : ''
                                }
                                onChange={handleInputChange}
                                onBlur={() => handleInputBlur(epicRow)}
                                autoFocus
                                className='w-full p-1 border border-gray-300 rounded text-sm'
                              />
                            ) : (
                              <span
                                className='cursor-pointer'
                                onClick={() =>
                                  handleEditClick(epicRow.id, 'endDate', epicRow.endDate)
                                }
                              >
                                <DateWithIcon date={epicRow.endDate} />
                              </span>
                            )}
                          </td>
                          <td className='p-2 assignee-cell'>
                            <span className='text-gray-500 text-xs'>-</span>
                          </td>
                          <td className='p-2'>
                            <button
                              onClick={() => handleDetailsClick(epicRow)}
                              className='text-blue-600 hover:text-blue-800'
                              title='Details'
                            >
                              <BookUser className='w-5 h-5' />
                            </button>
                          </td>
                        </tr>
                        {expandedEpics[epic.epicId] &&
                          (taskRows.length === 0 ? (
                            <tr>
                              <td colSpan={8} className='p-4 text-gray-500 text-sm text-center'>
                                No tasks in this epic.
                              </td>
                            </tr>
                          ) : (
                            taskRows.map((item, taskIndex) => (
                              <tr
                                key={item.id}
                                className='border-b border-gray-200 bg-gray-50 hover:bg-gray-100'
                              >
                                <td className='p-2'></td>
                                <td className='p-2'>{taskIndex + 1}</td>
                                <td className='p-2'>
                                  <img
                                    src={taskIcon}
                                    alt='Task'
                                    className='w-5 h-5 rounded p-0.5'
                                  />
                                </td>
                                <td className='p-2 title-cell'>
                                  {editingCell?.id === item.id && editingCell?.field === 'title' ? (
                                    <input
                                      type='text'
                                      value={editValue}
                                      onChange={handleInputChange}
                                      onBlur={() => handleInputBlur(item)}
                                      autoFocus
                                      className='w-full p-1 border border-gray-300 rounded text-sm'
                                    />
                                  ) : (
                                    <span
                                      className='cursor-pointer'
                                      onClick={() => handleEditClick(item.id, 'title', item.title)}
                                    >
                                      {item.title}
                                    </span>
                                  )}
                                </td>
                                <td className='p-2'>
                                  {editingCell?.id === item.id &&
                                  editingCell?.field === 'startDate' ? (
                                    <input
                                      type='date'
                                      value={
                                        editValue
                                          ? new Date(editValue).toISOString().split('T')[0]
                                          : ''
                                      }
                                      onChange={handleInputChange}
                                      onBlur={() => handleInputBlur(item)}
                                      autoFocus
                                      className='w-full p-1 border border-gray-300 rounded text-sm'
                                    />
                                  ) : (
                                    <span
                                      className='cursor-pointer'
                                      onClick={() =>
                                        handleEditClick(item.id, 'startDate', item.startDate)
                                      }
                                    >
                                      <DateWithIcon date={item.startDate} />
                                    </span>
                                  )}
                                </td>
                                <td className='p-2'>
                                  {editingCell?.id === item.id &&
                                  editingCell?.field === 'endDate' ? (
                                    <input
                                      type='date'
                                      value={
                                        editValue
                                          ? new Date(editValue).toISOString().split('T')[0]
                                          : ''
                                      }
                                      onChange={handleInputChange}
                                      onBlur={() => handleInputBlur(item)}
                                      autoFocus
                                      className='w-full p-1 border border-gray-300 rounded text-sm'
                                    />
                                  ) : (
                                    <span
                                      className='cursor-pointer'
                                      onClick={() =>
                                        handleEditClick(item.id, 'endDate', item.endDate)
                                      }
                                    >
                                      <DateWithIcon date={item.endDate} />
                                    </span>
                                  )}
                                </td>
                                <td className='p-2 relative assignee-cell'>
                                  {showMemberDropdown?.id === item.id && item.type === 'TASK' ? (
                                    <div
                                      ref={dropdownRef}
                                      className='absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto w-64 p-2 top-8 left-0'
                                    >
                                      {membersData?.data?.map((member) => {
                                        const currentAssignees = item.assignees
                                          .map((a) => a.id)
                                          .filter((id) => id !== undefined) as number[];
                                        const isDisabled = currentAssignees.includes(
                                          member.accountId
                                        );
                                        return (
                                          <div
                                            key={member.accountId}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                                              isDisabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-gray-100 cursor-pointer hover:shadow-sm'
                                            }`}
                                            onClick={() =>
                                              !isDisabled && handleMemberSelect(item, member)
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
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .substring(0, 2)}
                                                </div>
                                              )}
                                            </div>
                                            <span className='text-gray-900 font-medium'>
                                              {member.fullName}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => handleShowMemberDropdown(item.id, item.type)}
                                      className='inline-flex flex-wrap gap-2 p-1 rounded hover:bg-gray-200 cursor-pointer'
                                    >
                                      {item.type === 'TASK' && item.assignees.length ? (
                                        item.assignees.map((assignee, index) => (
                                          <Avatar
                                            key={assignee.id ?? index}
                                            person={assignee}
                                            onDelete={
                                              assignee.id != null
                                                ? () =>
                                                    handleDeleteAssignment(
                                                      item,
                                                      assignee.id as number
                                                    )
                                                : undefined
                                            }
                                          />
                                        ))
                                      ) : item.type === 'TASK' ? (
                                        <button className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium'>
                                          <Plus className='w-3 h-3' />
                                          Member
                                        </button>
                                      ) : (
                                        <span className='text-gray-500 text-xs'>-</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className='p-2'>
                                  <button
                                    onClick={() => handleDetailsClick(item)}
                                    className='text-blue-600 hover:text-blue-800 text-xs font-medium'
                                    title='Details'
                                  >
                                    <BookUser className='w-5 h-5' />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {editingEpic && (
        <EditEpicPopup
          editingEpic={editingEpic}
          setEditingEpic={setEditingEpic}
          handleEditEpic={handleEditEpic}
        />
      )}

      {editingTask && (
        <EditTaskPopup
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          membersData={membersData}
          isMemberDropdownOpen={isMemberDropdownOpen}
          setIsMemberDropdownOpen={setIsMemberDropdownOpen}
          handleEditTask={handleEditTask}
          memberDropdownRef={memberDropdownRef}
        />
      )}

      {editingDateTask && (
        <EditDatePopup
          editingDateTask={editingDateTask}
          setEditingDateTask={setEditingDateTask}
          handleEditTask={handleEditTask}
        />
      )}

      {isCreatingTask && (
        <CreateTaskPopup
          epics={epics}
          newTask={newTask}
          setNewTask={setNewTask}
          membersData={membersData}
          isMemberDropdownOpen={isMemberDropdownOpen}
          setIsMemberDropdownOpen={setIsMemberDropdownOpen}
          handleCreateTask={handleCreateTask}
          handleAddNewTaskMember={handleAddNewTaskMember}
          handleRemoveNewTaskMember={handleRemoveNewTaskMember}
          memberDropdownRef={memberDropdownRef}
        />
      )}

      {isNotifyPMConfirmOpen && (
        <NotifyPMConfirmPopup
          handleConfirmNotifyPM={handleConfirmNotifyPM}
          setIsNotifyPMConfirmOpen={setIsNotifyPMConfirmOpen}
        />
      )}

      {isEvaluationPopupOpen && projectId && (
        <AiResponseEvaluationPopup
          isOpen={isEvaluationPopupOpen}
          onClose={handleCloseEvaluationPopup}
          aiResponseJson={aiResponseJson}
          projectId={projectId}
          aiFeature='TASK_PLANNING'
          onSubmitSuccess={handleEvaluationSubmitSuccess}
        />
      )}
    </>
  );
};

export default TaskList;
