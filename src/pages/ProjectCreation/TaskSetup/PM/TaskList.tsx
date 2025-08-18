import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { type TaskState, type EpicPreviewDTO } from '../../../../services/aiApi';
import EditEpicPopup from '../EditEpicPopup';
import EditTaskPopup from '../EditTaskPopup';
import EditDatePopup from '../EditDatePopup';
import CreateTaskPopup from '../CreateTaskPopup';
import NotifyPMConfirmPopup from '../NotifyPMConfirmPopup';
import GenerateEpicsPopup from '../GenerateEpicsPopup';
import AiResponseEvaluationPopup from '../../../../components/AiResponse/AiResponseEvaluationPopup';
import storyIcon from '../../../../assets/icon/type_story.svg';
import epicIcon from '../../../../assets/icon/type_epic.svg';
import galaxyaiIcon from '../../../../assets/galaxyai.gif';
import aiIcon from '../../../../assets/icon/ai.png';
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
  projectKey: string;
  existingEpicTitles: string[];
  onEpicsGenerated: (epics: EpicPreviewDTO[]) => void;
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
  onDelete?: (e?: React.MouseEvent) => void;
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
          onClick={(e) => onDelete(e)}
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

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  relativeTo: HTMLElement | null;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className, style, relativeTo }, ref) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      const updatePosition = () => {
        if (relativeTo) {
          const rect = relativeTo.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setPosition({
            top: rect.bottom + scrollTop + 2,
            left: rect.left + scrollLeft
          });
        }
      };

      updatePosition();
      
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }, [relativeTo]);

    return ReactDOM.createPortal(
      <div 
        ref={ref} 
        className={className} 
        style={{
          ...style,
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 2000
        }}
      >
        {children}
      </div>,
      document.body
    );
  }
);

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
  projectKey,
  existingEpicTitles,
  onEpicsGenerated,
}) => {
  const safeEpics = Array.isArray(epics) ? epics : [];
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showMemberDropdown, setShowMemberDropdown] = useState<{
    id: string;
    type: 'TASK';
    element: HTMLElement | null;
  } | null>(null);
  const [expandedEpicIndices, setExpandedEpicIndices] = useState<Set<number>>(new Set());
  const [isGenerateEpicsOpen, setIsGenerateEpicsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const assigneeCellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMemberDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleEpic = (epicIndex: number) => {
    setExpandedEpicIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(epicIndex)) {
        newSet.delete(epicIndex);
      } else {
        newSet.add(epicIndex);
      }
      return newSet;
    });
  };

  const toggleAllEpics = () => {
    const allExpanded = expandedEpicIndices.size === safeEpics.length;
    setExpandedEpicIndices(
      allExpanded ? new Set() : new Set(safeEpics.map((_, i) => i))
    );
  };

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
      const foundEpic = safeEpics.find((e) => e.epicId === id);
      if (foundEpic) {
        setEditingEpic({
          ...foundEpic,
          [field]: editValue,
        });
        handleEditEpic();
      }
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
      const isAlreadyAssigned = item.assignees?.some((assignee) => assignee.id === member.accountId) || false;
      if (isAlreadyAssigned) {
        handleRemoveMember(item.epicId!, item.id, member.accountId);
      } else {
        if ((item.assignees?.length || 0) < 3) {
          handleAddMember(item.epicId!, item.id, member.accountId);
        }
      }
    }
    setShowMemberDropdown(null);
  };

  const handleShowMemberDropdown = (
    id: string,
    type: 'TASK' | 'EPIC',
    event: React.MouseEvent
  ) => {
    if (type === 'TASK') {
      const cell = assigneeCellRefs.current.get(id);
      if (cell) {
        setShowMemberDropdown({
          id,
          type,
          element: cell
        });
      }
    }
  };

  const handleDetailsClick = (item: TaskRow) => {
    if (item.type === 'EPIC') {
      const epic = safeEpics.find((e) => e.epicId === item.id);
      if (epic) setEditingEpic(epic);
    } else if (item.type === 'TASK') {
      const epic = safeEpics.find((e) => e.epicId === item.epicId);
      if (epic) {
        const task = (epic.tasks || []).find((t) => t.id === item.id);
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
            max-height: 4.2em;
            overflow: hidden;
          }
          .assignee-cell {
            white-space: normal;
            word-wrap: break-word;
            line-height: 1.4;
            max-height: 5.6em;
            overflow: visible;
            position: relative;
            zIndex: 10;
          }
          .dropdown-container {
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 6px;
          }
          .table-container {
            position: relative;
            overflow: visible;
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
          <div className='mb-4 flex items-center gap-4'>
            <button onClick={toggleAllEpics} className='text-sm text-blue-600 hover:text-blue-800'>
              {expandedEpicIndices.size === safeEpics.length ? 'Collapse All' : 'Expand All'}
            </button>
            <button
              onClick={() => setIsGenerateEpicsOpen(true)}
              className='text-sm text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-2 rounded-md flex items-center gap-2'
            >
              <img src={aiIcon} alt='AI Icon' className='w-4 h-4' />
              Generate Epics
            </button>
          </div>
          {safeEpics.length === 0 ? (
            <div className='px-6 py-4 text-center text-gray-500'>
              No epics or tasks created yet. Use "Generate with AI" or "Create Task" to start.
            </div>
          ) : (
            <div className='table-container'>
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
                  {safeEpics.map((epic, epicIndex) => {
                    const epicRow: TaskRow = {
                      id: epic.epicId,
                      type: 'EPIC',
                      title: epic.title,
                      description: epic.description,
                      startDate: epic.startDate,
                      endDate: epic.endDate,
                      assignees: [],
                    };
                    const taskRows: TaskRow[] = (epic.tasks || []).map((task) => ({
                      id: task.id,
                      type: 'TASK',
                      title: task.title,
                      description: task.description,
                      startDate: task.startDate,
                      endDate: task.endDate,
                      assignees: (task.assignedMembers || []).map((member) => ({
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
                              onClick={() => toggleEpic(epicIndex)}
                              className='focus:outline-none'
                              aria-expanded={expandedEpicIndices.has(epicIndex)}
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedEpicIndices.has(epicIndex) ? 'rotate-90' : ''
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
                        {expandedEpicIndices.has(epicIndex) &&
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
                                    src={storyIcon}
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
                                <td
                                  className='p-2 relative assignee-cell'
                                  ref={(el) => {
                                    if (el) assigneeCellRefs.current.set(item.id, el);
                                    else assigneeCellRefs.current.delete(item.id);
                                  }}
                                >
                                  <div className='inline-flex flex-wrap gap-2 p-1 rounded hover:bg-gray-200 cursor-pointer relative'>
                                    <div
                                      onClick={(e) => handleShowMemberDropdown(item.id, item.type, e)}
                                      className='flex flex-wrap gap-2'
                                    >
                                      {item.type === 'TASK' && item.assignees && item.assignees.length ? (
                                        item.assignees.map((assignee, index) => (
                                          <Avatar
                                            key={assignee.id ?? index}
                                            person={assignee}
                                            onDelete={
                                              assignee.id != null
                                                ? (e) => {
                                                    e?.stopPropagation();
                                                    handleRemoveMember(item.epicId!, item.id, assignee.id as number);
                                                  }
                                                : undefined
                                            }
                                          />
                                        ))
                                      ) : (
                                        <button className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium'>
                                          <Plus className='w-3 h-3' />
                                          Member
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {showMemberDropdown?.id === item.id && item.type === 'TASK' && (
                                    <Dropdown
                                      ref={dropdownRef}
                                      className='dropdown-container'
                                      relativeTo={showMemberDropdown.element}
                                    >
                                      {membersData?.data && Array.isArray(membersData.data) && membersData.data.length > 0 ? (
                                        membersData.data.map((member) => {
                                          const currentAssignees = (item.assignees || [])
                                            .map((a) => a.id)
                                            .filter((id) => id !== undefined) as number[];
                                          const isAssigned = currentAssignees.includes(member.accountId);
                                          return (
                                            <div
                                              key={member.accountId}
                                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
                                                isAssigned
                                                  ? 'opacity-50'
                                                  : 'hover:bg-gray-100'
                                              }`}
                                              onClick={() => handleMemberSelect(item, member)}
                                            >
                                              <div>
                                                {member.picture ? (
                                                  <img
                                                    src={member.picture}
                                                    alt={`${member.fullName}'s avatar`}
                                                    className='w-6 h-6 rounded-full object-cover border border-gray-200'
                                                  />
                                                ) : (
                                                  <div
                                                    className='w-6 h-6 rounded-full flex justify-center items-center text-white text-xs font-bold'
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
                                              <div className='flex-1'>
                                                <span className='text-sm text-gray-900'>
                                                  {member.fullName}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className='px-2 py-1.5 text-sm text-gray-500'>
                                          No members available
                                        </div>
                                      )}
                                    </Dropdown>
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

      {isGenerateEpicsOpen && projectId && (
        <GenerateEpicsPopup
          isOpen={isGenerateEpicsOpen}
          onClose={() => setIsGenerateEpicsOpen(false)}
          projectId={projectId}
          projectKey={projectKey}
          existingEpicTitles={existingEpicTitles}
          onEpicsGenerated={onEpicsGenerated}
        />
      )}
    </>
  );
};

export default TaskList;