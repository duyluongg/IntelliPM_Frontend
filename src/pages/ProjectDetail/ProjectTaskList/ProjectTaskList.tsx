import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery, useGetWorkItemsByProjectIdQuery } from '../../../services/projectApi';
import { FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import { FileText } from 'lucide-react';
import WorkItem from '../../WorkItem/WorkItem';
import EpicPopup from '../../WorkItem/EpicPopup';
import ChildWorkItemPopup from '../../WorkItem/ChildWorkItemPopup';
import taskIcon from '../../../assets/icon/type_task.svg';
import subtaskIcon from '../../../assets/icon/type_subtask.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';
import Doc from '../../PM/YourProject/Doc';
import { useCreateDocumentMutation, useGetDocumentMappingQuery } from '../../../services/Document/documentAPI';
import { useAuth } from '../../../services/AuthContext';

// Interface Reporter
interface Reporter {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

// Interface TaskItem
interface TaskItem {
  id: string;
  type: 'epic' | 'task' | 'bug' | 'subtask' | 'story';
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  comments: number;
  sprint?: number | null;
  assignees: Assignee[];
  dueDate?: string | null;
  labels?: string[];
  created: string;
  updated: string;
  reporter: Reporter;
}

// Interface Assignee
interface Assignee {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

// Component Status
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
    <div className="flex flex-col gap-0.5">
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusStyle()}`}>
        {formatStatusForDisplay(status)}
      </span>
    </div>
  );
};

// Component DateWithIcon
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
    <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-3.5 h-3.5">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
  let className = 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-gray-700 border border-gray-700';

  if (isDueDate && dueDate) {
    const isOverdue = dueDate < currentDate;
    const isDueToday = dueDate.toDateString() === currentDate.toDateString();
    const isDone = status.toLowerCase() === 'done';

    if (isOverdue && !isDone) {
      icon = (
        <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-3.5 h-3.5 text-red-600">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M5.7 1.384c.996-1.816 3.605-1.818 4.602-.003l5.35 9.73C16.612 12.86 15.346 15 13.35 15H2.667C.67 15-.594 12.862.365 11.113zm3.288.72a1.125 1.125 0 0 0-1.972 0l-5.336 9.73c-.41.75.132 1.666.987 1.666H13.35c.855 0 1.398-.917.986-1.667z"
            clipRule="evenodd"
          />
          <path fill="currentColor" fillRule="evenodd" d="M7.25 9V4h1.5v5z" clipRule="evenodd" />
          <path fill="currentColor" d="M9 11.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
        </svg>
      );
      className = 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-red-600 border border-red-600';
    } else if (isDueToday && !isDone) {
      icon = (
        <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-3.5 h-3.5 text-orange-600">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none" />
          <path
            fill="currentColor"
            d="M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0M8.75 3.25v4.389l2.219 1.775-.938 1.172-2.5-2-.281-.226V3.25zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"
          />
        </svg>
      );
      className = 'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-orange-600 border border-orange-600';
    }
  }

  return (
    <div className={className}>
      {icon}
      <span>{formatDate(date)}</span>
    </div>
  );
};

// Component Avatar
const Avatar = ({ person }: { person: Reporter | Assignee }) =>
  person.fullName !== 'Unknown' ? (
    <div className="flex items-center gap-1.5">
      {person.picture ? (
        <img
          src={person.picture}
          alt={`${person.fullName}'s avatar`}
          className="w-5 h-5 rounded-full object-cover"
          style={{ backgroundColor: person.avatarColor }}
        />
      ) : (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
          style={{ backgroundColor: person.avatarColor }}
        >
          {person.initials}
        </div>
      )}
      <span className="text-xs text-gray-800">{person.fullName}</span>
    </div>
  ) : null;

// Component HeaderBar
const HeaderBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-2.5 mb-8 bg-white rounded p-3">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-2 text-gray-500 text-xs" />
          <input
            type="text"
            className="pl-8 pr-2.5 py-1 border border-gray-300 rounded text-sm bg-white min-w-[240px]"
            placeholder="Search list"
          />
        </div>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white bg-emerald-600">DH</div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white bg-red-500">D</div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white bg-blue-600">NV</div>
        </div>
        <button className="flex items-center bg-white border border-blue-500 text-blue-500 px-2 py-1 rounded font-medium text-sm">
          <FaFilter className="mr-1" />
          Filter <span className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">1</span>
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm text-gray-500 cursor-pointer">
          <MdGroup />
          <span>Group</span>
        </div>
        <button className="bg-none border-none text-gray-500 text-sm cursor-pointer">
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
};

// Component ProjectTaskList
const ProjectTaskList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: projectDetails } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectDetails?.data?.id;
  const { data: workItemsData, isLoading, error } = useGetWorkItemsByProjectIdQuery(projectId || 0, { skip: !projectId });
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

  const [createDocument] = useCreateDocumentMutation();
  const { user } = useAuth();
  const [createdDocIds, setCreatedDocIds] = useState<Record<string, number>>({});

  const { data: docMapping, isLoading: isLoadingMapping } = useGetDocumentMappingQuery(
    {
      projectId: projectId!,
      userId: user?.id!,
    },
    { skip: !projectId || !user?.id }
  );

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
      }
    }
  };

  const handleOpenPopup = (taskId: string, taskType: TaskItem['type']) => {
    setSelectedTaskId(taskId);
    setSelectedTaskType(taskType);
    setIsPopupOpen(true);
  };

  useEffect(() => {
    if (isPopupOpen && selectedTaskId) {
      searchParams.set('taskId', selectedTaskId);
      setSearchParams(searchParams);
    } else {
      searchParams.delete('taskId');
      setSearchParams(searchParams);
    }
  }, [isPopupOpen, selectedTaskId, searchParams, setSearchParams]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTaskId(null);
    setSelectedTaskType(null);
    searchParams.delete('taskId');
    setSearchParams(searchParams);
  };

  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    type: 55,
    key: 100,
    summary: 250,
    status: 120,
    comments: 120,
    sprint: 100,
    assignee: 180,
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
      : workItemsData.data.map((item) => ({
          id: item.key || '',
          type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask' | 'story',
          key: item.key || '',
          taskId: item.taskId || null,
          summary: item.summary || '',
          status: item.status ? item.status.replace(' ', '_').toLowerCase() : '',
          comments: item.commentCount || 0,
          sprint: item.sprintId || null,
          assignees: item.assignees.map((assignee) => ({
            fullName: assignee.fullname || 'Unknown',
            initials:
              assignee.fullname
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2) || '',
            avatarColor: '#f3eded',
            picture: assignee.picture || undefined,
          })),
          dueDate: item.dueDate || null,
          labels: item.labels || [],
          created: item.createdAt || '',
          updated: item.updatedAt || '',
          reporter: {
            fullName: item.reporterFullname || 'Unknown',
            initials:
              item.reporterFullname
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2) || '',
            avatarColor: '#f3eded',
            picture: item.reporterPicture || undefined,
          },
        }));

  return (
    <div className="p-3 font-sans bg-white w-full relative">
      <HeaderBar />
      <div className="overflow-x-auto bg-white w-full">
        <table className="w-full border-collapse min-w-[800px] table-fixed" ref={tableRef}>
          <thead>
            <tr>
              <th style={{ width: `${columnWidths.type}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Type
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'type')} />
              </th>
              <th style={{ width: `${columnWidths.key}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Key
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'key')} />
              </th>
              <th style={{ width: `${columnWidths.summary}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Summary
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'summary')} />
              </th>
              <th style={{ width: `${columnWidths.status}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Status
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'status')} />
              </th>
              <th style={{ width: `${columnWidths.comments}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Comments
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'comments')} />
              </th>
              <th style={{ width: `${columnWidths.sprint}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Sprint
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'sprint')} />
              </th>
              <th style={{ width: `${columnWidths.assignee}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Assignee
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'assignee')} />
              </th>
              <th style={{ width: `${columnWidths.dueDate}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Due date
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'dueDate')} />
              </th>
              <th style={{ width: `${columnWidths.labels}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Labels
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'labels')} />
              </th>
              <th style={{ width: `${columnWidths.created}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Created
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'created')} />
              </th>
              <th style={{ width: `${columnWidths.updated}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Updated
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'updated')} />
              </th>
              <th style={{ width: `${columnWidths.reporter}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Reporter
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'reporter')} />
              </th>
              <th style={{ width: `${columnWidths.document}px` }} className="bg-gray-100 text-gray-700 font-semibold text-[0.7rem] uppercase p-3 border-b border-x border-gray-300 relative">
                Document
                <div className="absolute right-0 top-0 w-px h-full cursor-col-resize hover:bg-blue-500" onMouseDown={(e) => handleMouseDown(e, 'document')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-100">
                <td style={{ width: `${columnWidths.type}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.type === 'task' && <img src={taskIcon} alt="Task" className="w-5 h-5 rounded p-0.5 bg-blue-500" />}
                  {task.type === 'subtask' && <img src={subtaskIcon} alt="Subtask" className="w-5 h-5 rounded p-0.5 bg-emerald-500" />}
                  {task.type === 'bug' && <img src={bugIcon} alt="Bug" className="w-5 h-5 rounded p-0.5 bg-red-500" />}
                  {task.type === 'epic' && <img src={epicIcon} alt="Epic" className="w-5 h-5 rounded p-0.5 bg-purple-500" />}
                  {task.type === 'story' && <img src={storyIcon} alt="Story" className="w-5 h-5 rounded p-0.5 bg-blue-500" />}
                </td>
                <td style={{ width: `${columnWidths.key}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.type === 'subtask' && task.taskId && task.taskId !== 'Unknown' ? (
                    <div className="flex flex-col items-start w-full">
                      <span className="text-[0.68rem] text-gray-600 mb-0.5">{task.taskId}</span>
                      <div className="flex items-center gap-1">
                        <svg role="presentation" width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                          <circle cx="5.33333" cy="5.33333" r="1.33333" stroke="#42526E" strokeWidth="1.33333" fill="none" />
                          <circle cx="10.6667" cy="10.6666" r="1.33333" stroke="#42526E" strokeWidth="1.33333" fill="none" />
                          <path d="M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337" stroke="#42526E" strokeWidth="1.33333" fill="none" />
                        </svg>
                        <span className="text-xs text-black cursor-pointer hover:underline" onClick={() => handleOpenPopup(task.key, task.type)}>
                          {task.key}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs text-black cursor-pointer hover:underline" onClick={() => handleOpenPopup(task.key, task.type)}>
                        {task.key}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ width: `${columnWidths.summary}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.summary}
                </td>
                <td style={{ width: `${columnWidths.status}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  <Status status={task.status} />
                </td>
                <td style={{ width: `${columnWidths.comments}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.comments > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-4 h-4">
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{task.comments} comment</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-transparent rounded p-0.5">
                      <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-4 h-4 min-w-[16px] min-h-[16px]">
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Add comment</span>
                    </div>
                  )}
                </td>
                <td style={{ width: `${columnWidths.sprint}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.sprint && task.sprint !== 0 ? (
                    <span className="inline-block px-2 py-0.5 border border-gray-300 rounded text-[0.7rem] text-gray-800">
                      Sprint {task.sprint}
                    </span>
                  ) : (
                    ''
                  )}
                </td>
                <td style={{ width: `${columnWidths.assignee}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.assignees.map((assignee, index) => (
                    <Avatar key={index} person={assignee} />
                  ))}
                </td>
                <td style={{ width: `${columnWidths.dueDate}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.dueDate && task.dueDate !== 'Unknown' ? (
                    <DateWithIcon date={task.dueDate} status={task.status} isDueDate={true} />
                  ) : (
                    ''
                  )}
                </td>
                <td style={{ width: `${columnWidths.labels}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.labels && task.labels.length > 0 && task.labels[0] !== 'Unknown'
                    ? task.labels.map((label, index) => (
                        <span key={index} className="inline-block px-2 py-0.5 mr-1 border border-gray-300 rounded text-[0.7rem] text-gray-800">
                          {label}
                        </span>
                      ))
                    : ''}
                </td>
                <td style={{ width: `${columnWidths.created}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.created !== 'Unknown' ? (
                    <DateWithIcon date={task.created} status={task.status} />
                  ) : (
                    ''
                  )}
                </td>
                <td style={{ width: `${columnWidths.updated}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {task.updated !== 'Unknown' ? (
                    <DateWithIcon date={task.updated} status={task.status} />
                  ) : (
                    ''
                  )}
                </td>
                <td style={{ width: `${columnWidths.reporter}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  <Avatar person={task.reporter} />
                </td>
                <td style={{ width: `${columnWidths.document}px` }} className="p-2.5 border-b border-x border-gray-300 text-gray-800 text-xs">
                  {createdDocIds[task.key] ? (
                    <button
                      className="text-blue-600 underline hover:text-blue-800 text-sm flex items-center gap-1"
                      onClick={() => handleAddOrViewDocument(task.key, task.type)}
                    >
                      <FileText size={16} className="text-blue-500" />
                      View Document
                    </button>
                  ) : (
                    <button
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                      onClick={() => handleAddOrViewDocument(task.key, task.type)}
                    >
                      Add/View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDocModalOpen && docTaskId && user?.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl relative w-full h-full sm:w-[95vw] sm:h-[90vh] md:w-[90vw] md:h-[90vh] lg:w-[90vw] lg:h-[90vh] xl:w-[98vw] xl:h-[95vh] 2xl:w-[85vw] 2xl:h-[90vh] shadow-2xl flex flex-col">
            <div className="flex-shrink-0 relative p-4 sm:p-6 border-b border-gray-100">
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors duration-200 text-lg sm:text-xl md:text-2xl shadow-sm hover:shadow-md"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <Doc docId={createdDocIds[docTaskId]} onClose={() => setIsDocModalOpen(false)} updatedBy={user.id} />
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
    </div>
  );
};

export default ProjectTaskList;