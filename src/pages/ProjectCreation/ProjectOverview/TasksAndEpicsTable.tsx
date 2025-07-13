import React, { useEffect, useState, useRef } from 'react';
import { useGetTasksByProjectIdQuery, type TaskResponseDTO, useUpdateTaskDatMutation } from '../../../services/taskApi';
import { useGetEpicsByProjectIdQuery, type EpicResponseDTO, useUpdateEpicMutation } from '../../../services/epicApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import {
  useLazyGetTaskAssignmentsByTaskIdQuery,
  type TaskAssignmentDTO,
  useDeleteTaskAssignmentMutation,
  useCreateTaskAssignmentQuickMutation,
} from '../../../services/taskAssignmentApi';
import taskIcon from '../../../assets/icon/type_task.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';

// Hàm formatDate được khai báo ở phạm vi cao hơn
const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

interface TableRow {
  id: string;
  type: 'TASK' | 'EPIC';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reporter: { name: string | null | undefined; picture: string | null; id?: number | null };
  assignees: { name: string; picture: string | null; id?: number | null }[];
  status: string;
  reporterId?: number | null; // For task and epic
  assignedBy?: number | null; // For epic
  projectId?: number; // For task
  epicId?: number | null; // For task
  sprintId?: number | null; // For task
}

interface ProjectMember {
  id: number;
  accountId: number;
  fullName: string;
  picture: string | null;
  status: string;
}

interface TasksAndEpicsTableProps {
  projectId: number;
}

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
  let className = 'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-gray-700 border';

  if (isDueDate && dueDate) {
    const isOverdue = dueDate < currentDate;
    const isDueToday = dueDate.toDateString() === currentDate.toDateString();
    const isDone = status.toLowerCase() === 'done';

    if (isOverdue && !isDone) {
      icon = (
        <svg fill='none' viewBox='0 0 16 16' role='presentation' className='w-3.5 h-3.5 text-red-600'>
          <path
            fill='currentColor'
            fill-rule='evenodd'
            d='M5.7 1.384c.996-1.816 3.605-1.818 4.602-.003l5.35 9.73C16.612 12.86 15.346 15 13.35 15H2.667C.67 15-.594 12.862.365 11.113zm3.288.72a1.125 1.125 0 0 0-1.972 0l-5.336 9.73c-.41.75.132 1.666.987 1.666H13.35c.855 0 1.398-.917.986-1.667z'
            clip-rule='evenodd'
          ></path>
          <path
            fill='currentColor'
            fill-rule='evenodd'
            d='M7.25 9V4h1.5v5z'
            clip-rule='evenodd'
          ></path>
          <path fill='currentColor' d='M9 11.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0'></path>
        </svg>
      );
      className = 'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-red-600 border border-red-600';
    } else if (isDueToday && !isDone) {
      icon = (
        <svg fill='none' viewBox='0 0 16 16' role='presentation' className='w-3.5 h-3.5 text-orange-600'>
          <circle cx='8' cy='8' r='7' stroke='currentColor' strokeWidth='1' fill='none' />
          <path
            fill='currentColor'
            d='M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0M8.75 3.25v4.389l2.219 1.775-.938 1.172-2.5-2-.281-.226V3.25zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0'
          ></path>
        </svg>
      );
      className = 'flex items-center gap-0.5 p-0.5 rounded text-xs font-medium text-orange-600 border-2 border-orange-600';
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
const Avatar = ({
  person,
  onDelete,
}: {
  person: { name: string | null | undefined; picture: string | null; id?: number | null };
  onDelete?: () => Promise<void>;
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

const TasksAndEpicsTable: React.FC<TasksAndEpicsTableProps> = ({ projectId }) => {
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    error: tasksError,
  } = useGetTasksByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: epics = [],
    isLoading: isEpicsLoading,
    error: epicsError,
    refetch: refetchEpics,
  } = useGetEpicsByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: projectMembersResponse,
    isLoading: isMembersLoading,
    error: membersError,
  } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId,
  });

  const projectMembers = projectMembersResponse?.data ?? [];

  const [fetchAssignments] = useLazyGetTaskAssignmentsByTaskIdQuery();
  const [updateEpic, { isLoading: isUpdatingEpic, error: updateEpicError }] = useUpdateEpicMutation();
  const [updateTask, { isLoading: isUpdatingTask, error: updateTaskError }] = useUpdateTaskDatMutation();
  const [deleteTaskAssignment, { isLoading: isDeletingAssignment, error: deleteAssignmentError }] =
    useDeleteTaskAssignmentMutation();
  const [createTaskAssignment, { isLoading: isCreatingAssignment, error: createAssignmentError }] =
    useCreateTaskAssignmentQuickMutation();
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, TaskAssignmentDTO[]>>({});
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showMemberDropdown, setShowMemberDropdown] = useState<{
    id: string;
    field: 'reporter' | 'assignees';
    type: 'TASK' | 'EPIC';
  } | null>(null);

  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    id: 80,
    type: 50,
    title: 220,
    description: 250,
    startDate: 130,
    endDate: 130,
    reporter: 180,
    assignees: 250,
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchAllAssignments = async () => {
      if (!tasks.length) return;

      const newMap: Record<string, TaskAssignmentDTO[]> = {};
      setLoadingAssignments(true);

      await Promise.all(
        tasks.map(async (task) => {
          try {
            const result = await fetchAssignments(task.id).unwrap();
            newMap[task.id] = result || [];
          } catch (err) {
            console.error(`Error loading assignment for task ${task.id}`, err);
            newMap[task.id] = [];
          }
        })
      );

      setAssignmentsMap(newMap);
      setLoadingAssignments(false);
    };

    fetchAllAssignments();
  }, [tasks, fetchAssignments]);

  const handleEditClick = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditValue(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = async (item: TableRow) => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    if (!editValue || editValue === item[field as keyof TableRow]) {
      setEditingCell(null);
      setEditValue('');
      return;
    }

    // Validate dates
    const isDateField = field === 'startDate' || field === 'endDate';
    let formattedDate = editValue;
    if (isDateField && editValue) {
      try {
        formattedDate = new Date(editValue).toISOString();
      } catch (error) {
        alert('Invalid date format. Please use a valid date.');
        setEditingCell(null);
        setEditValue('');
        return;
      }
    }

    // Check if startDate is not after endDate
    const newStartDate = field === 'startDate' ? formattedDate : item.startDate;
    const newEndDate = field === 'endDate' ? formattedDate : item.endDate;
    if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
      alert('Start date cannot be after end date.');
      setEditingCell(null);
      setEditValue('');
      return;
    }

    try {
      if (item.type === 'EPIC') {
        const epicData = {
          projectId,
          name: field === 'title' ? editValue : item.title,
          description: field === 'description' ? editValue : item.description,
          startDate: field === 'startDate' ? formattedDate : item.startDate,
          endDate: field === 'endDate' ? formattedDate : item.endDate,
          status: item.status,
          reporterId: item.reporterId || null,
          assignedBy: item.assignedBy || null,
        };

        await updateEpic({
          id,
          data: epicData,
        }).unwrap();
      } else if (item.type === 'TASK') {
        const taskData = {
          reporterId: item.reporterId || null,
          projectId: item.projectId || projectId,
          epicId: item.epicId || null,
          sprintId: item.sprintId || null,
          type: item.type || 'TASK',
          title: field === 'title' ? editValue : item.title,
          description: field === 'description' ? editValue : item.description,
          plannedStartDate: field === 'startDate' ? formattedDate : item.startDate,
          plannedEndDate: field === 'endDate' ? formattedDate : item.endDate,
          status: item.status,
        };

        await updateTask({
          id,
          body: taskData,
        }).unwrap();
      }
      setEditingCell(null);
      setEditValue('');
    } catch (err: any) {
      console.error(`Error updating ${item.type.toLowerCase()}:`, err);
      console.log(JSON.stringify(err, null, 2));
      const errorMessage =
        err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to update ${item.type.toLowerCase()}: ${errorMessage}`);
    }
  };

  const handleMemberSelect = async (
    item: TableRow,
    field: 'reporter' | 'assignees',
    member: ProjectMember
  ) => {
    if (field === 'assignees') {
      const isAlreadyAssigned = item.assignees.some((assignee) => assignee.id === member.accountId);
      const isReporter = item.reporter.id === member.accountId;
      if (isAlreadyAssigned || isReporter) {
        alert(isAlreadyAssigned ? 'This member is already assigned.' : 'This member is the reporter and cannot be assigned.');
        return;
      }
    }

    try {
      if (item.type === 'EPIC') {
        const epicData = {
          projectId,
          name: item.title,
          description: item.description,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
          reporterId: field === 'reporter' ? member.accountId : item.reporterId || null,
          assignedBy: field === 'assignees' ? member.accountId : item.assignedBy || null,
        };
        const response = await updateEpic({
          id: item.id,
          data: epicData,
        }).unwrap();
        // Cập nhật trạng thái cục bộ dựa trên phản hồi từ API
        const epicIndex = normalizedEpics.findIndex((e) => e.id === item.id);
        if (epicIndex !== -1) {
          if (field === 'reporter') {
            normalizedEpics[epicIndex].reporter = { id: member.accountId, name: member.fullName, picture: member.picture };
            normalizedEpics[epicIndex].reporterId = member.accountId;
          } else if (field === 'assignees') {
            normalizedEpics[epicIndex].assignees = [
              { id: member.accountId, name: member.fullName, picture: member.picture },
            ];
            normalizedEpics[epicIndex].assignedBy = member.accountId;
          }
        }
        refetchEpics(); // Làm mới dữ liệu từ server
      } else if (item.type === 'TASK' && field === 'reporter') {
        const taskData = {
          reporterId: member.accountId,
          projectId: item.projectId || projectId,
          epicId: item.epicId || null,
          sprintId: item.sprintId || null,
          type: item.type || 'TASK',
          title: item.title,
          description: item.description,
          plannedStartDate: item.startDate,
          plannedEndDate: item.endDate,
          status: item.status,
        };
        await updateTask({
          id: item.id,
          body: taskData,
        }).unwrap();
      } else if (item.type === 'TASK' && field === 'assignees') {
        const response = await createTaskAssignment({
          taskId: item.id,
          accountId: member.accountId,
        }).unwrap();

        const newAssignment: TaskAssignmentDTO = {
          id: response.id,
          taskId: response.taskId,
          accountId: response.accountId,
          status: response.status,
          assignedAt: response.assignedAt,
          completedAt: response.completedAt ?? null,
          hourlyRate: response.hourlyRate ?? null,
          accountFullname: response.accountFullname || member.fullName,
          accountPicture: response.accountPicture || member.picture,
        };

        setAssignmentsMap((prev) => ({
          ...prev,
          [item.id]: [...(prev[item.id] || []), newAssignment],
        }));
      }
      setShowMemberDropdown(null);
    } catch (err: any) {
      console.error(`Error updating ${item.type.toLowerCase()}:`, err);
      const errorMessage =
        err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to update ${item.type.toLowerCase()}: ${errorMessage}`);
    }
  };

  const handleDeleteAssignment = async (itemId: string, assigneeId: number, itemType: 'TASK' | 'EPIC') => {
    console.log(`Attempting to delete assignment ID ${assigneeId} for ${itemType} ${itemId}`);
    try {
      if (itemType === 'TASK') {
        setAssignmentsMap((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || []).filter((assignment) => assignment.id !== assigneeId),
        }));
        await deleteTaskAssignment({ taskId: itemId, assignmentId: assigneeId }).unwrap();
        console.log(`Successfully deleted assignment ID ${assigneeId} for task ${itemId}`);
      } else if (itemType === 'EPIC') {
        const epicIndex = normalizedEpics.findIndex((e) => e.id === itemId);
        if (epicIndex !== -1) {
          const epicData = {
            projectId,
            name: normalizedEpics[epicIndex].title,
            description: normalizedEpics[epicIndex].description,
            startDate: normalizedEpics[epicIndex].startDate,
            endDate: normalizedEpics[epicIndex].endDate,
            status: normalizedEpics[epicIndex].status,
            reporterId: null,
            assignedBy: null,
          };
          const response = await updateEpic({
            id: itemId,
            data: epicData,
          }).unwrap();
          normalizedEpics[epicIndex].assignees = [];
          normalizedEpics[epicIndex].reporter = { name: '', picture: null, id: null };
          normalizedEpics[epicIndex].reporterId = null;
          normalizedEpics[epicIndex].assignedBy = null;
          refetchEpics(); // Làm mới dữ liệu từ server
        }
      }
    } catch (err: any) {
      console.error(`Error deleting assignment for ${itemType} ${itemId}:`, err);
      console.log(JSON.stringify(err, null, 2));
      const errorMessage =
        err?.data?.message || err?.error || err?.message || 'Unknown error';
      alert(`Failed to delete assignment: ${errorMessage}`);
      if (itemType === 'TASK') {
        const result = await fetchAssignments(itemId).unwrap();
        setAssignmentsMap((prev) => ({
          ...prev,
          [itemId]: result || [],
        }));
      }
    }
  };

  const handleShowMemberDropdown = (id: string, field: 'reporter' | 'assignees', type: 'TASK' | 'EPIC') => {
    setShowMemberDropdown({ id, field, type });
  };

  if (isTasksLoading || isEpicsLoading || loadingAssignments || isMembersLoading) {
    return (
      <div className='text-center py-10 text-gray-600'>Loading tasks, epics, assignments, or members...</div>
    );
  }

  if (tasksError || epicsError || updateEpicError || updateTaskError || membersError || deleteAssignmentError || createAssignmentError) {
    console.error('Error:', {
      tasksError,
      epicsError,
      updateEpicError,
      updateTaskError,
      membersError,
      deleteAssignmentError,
      createAssignmentError,
    });
    return <div className='text-center py-10 text-red-500'>Error loading or updating data.</div>;
  }

  const normalizedTasks: TableRow[] = tasks.map((task) => {
    const assignees = (assignmentsMap[task.id] || []).filter(
      (assignment) => typeof assignment.id === 'number'
    ).map((assignment) => ({
      id: assignment.accountId,
      name: assignment.accountFullname || '',
      picture: assignment.accountPicture,
    }));

    return {
      id: task.id,
      type: 'TASK',
      title: task.title,
      description: task.description,
      startDate: task.plannedStartDate,
      endDate: task.plannedEndDate,
      reporter: {
        id: task.reporterId,
        name: task.reporterName ?? '',
        picture: task.reporterPicture ?? null,
      },
      assignees,
      status: task.status || 'TO_DO',
      reporterId: task.reporterId,
      projectId: task.projectId,
      epicId: task.epicId,
      sprintId: task.sprintId,
    };
  });

  const normalizedEpics: TableRow[] = epics.map((epic) => ({
    id: epic.id,
    type: 'EPIC',
    title: epic.name,
    description: epic.description,
    startDate: epic.startDate,
    endDate: epic.endDate,
    reporter: {
      id: epic.reporterId ?? null,
      name: epic.reporterFullname ?? '',
      picture: epic.reporterPicture ?? null,
    },
    assignees: epic.assignedBy && epic.assignedByFullname
      ? [{ id: epic.assignedBy, name: epic.assignedByFullname, picture: epic.assignedByPicture }]
      : [],
    status: epic.status || 'TO_DO',
    reporterId: epic.reporterId ?? null,
    assignedBy: epic.assignedBy ?? null,
  }));

  const combinedData: TableRow[] = [...normalizedTasks, ...normalizedEpics].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  return (
    <section className='p-3 font-sans bg-white w-full block relative left-0'>
      <div className='overflow-x-auto bg-white w-full block'>
        {(isUpdatingEpic || isUpdatingTask || isDeletingAssignment || isCreatingAssignment) && (
          <div className='text-center py-4 text-blue-500'>Processing...</div>
        )}
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
                style={{ width: `${columnWidths.id}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                ID
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'id')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.title}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Title
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'title')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.description}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Description
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'description')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.startDate}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Start Date
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'startDate')}
                />
              </th>
              <th
                style={{ width: `${columnWidths.endDate}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                End Date
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'endDate')}
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
                style={{ width: `${columnWidths.assignees}px` }}
                className='bg-gray-100 text-gray-700 font-semibold uppercase text-[0.7rem] p-3 relative border-b border-l border-r border-gray-200'
              >
                Assignees
                <div
                  className='absolute right-0 top-0 w-[1px] h-full cursor-col-resize bg-transparent z-10 hover:bg-blue-500'
                  onMouseDown={(e) => handleMouseDown(e, 'assignees')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {combinedData.map((item) => {
              return (
                <tr key={item.id} className='hover:bg-gray-100'>
                  <td
                    style={{ width: `${columnWidths.type}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {item.type === 'TASK' && (
                      <img
                        src={taskIcon}
                        alt='Task'
                        className='w-5 h-5 rounded p-0.5 bg-blue-500'
                      />
                    )}
                    {item.type === 'EPIC' && (
                      <img
                        src={epicIcon}
                        alt='Epic'
                        className='w-5 h-5 rounded p-0.5 bg-purple-500'
                      />
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.id}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {item.id}
                  </td>
                  <td
                    style={{ width: `${columnWidths.title}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'title' ? (
                      <input
                        type='text'
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur(item)}
                        autoFocus
                        className='w-full p-1 border border-gray-300 rounded'
                      />
                    ) : (
                      <span onClick={() => handleEditClick(item.id, 'title', item.title)}>
                        {item.title}
                      </span>
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.description}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'description' ? (
                      <input
                        type='text'
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur(item)}
                        autoFocus
                        className='w-full p-1 border border-gray-300 rounded'
                      />
                    ) : (
                      <span onClick={() => handleEditClick(item.id, 'description', item.description)}>
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.startDate}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'startDate' ? (
                      <input
                        type='date'
                        value={editValue ? new Date(editValue).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur(item)}
                        autoFocus
                        className='w-full p-1 border border-gray-300 rounded'
                      />
                    ) : (
                      <span onClick={() => handleEditClick(item.id, 'startDate', item.startDate)}>
                        <DateWithIcon date={item.startDate} status={item.status} />
                      </span>
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.endDate}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden'
                  >
                    {editingCell?.id === item.id && editingCell?.field === 'endDate' ? (
                      <input
                        type='date'
                        value={editValue ? new Date(editValue).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur(item)}
                        autoFocus
                        className='w-full p-1 border border-gray-300 rounded'
                      />
                    ) : (
                      <span onClick={() => handleEditClick(item.id, 'endDate', item.endDate)}>
                        <DateWithIcon date={item.endDate} status={item.status} isDueDate={true} />
                      </span>
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.reporter}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-visible relative'
                  >
                    {showMemberDropdown?.id === item.id && showMemberDropdown?.field === 'reporter' ? (
                      <div
                        ref={dropdownRef}
                        className='absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto w-64 p-2 top-8 left-0'
                      >
                        {projectMembers.map((member) => {
                          const isDisabled = item.reporter.id === member.accountId;
                          return (
                            <div
                              key={member.accountId}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer hover:shadow-sm'
                              }`}
                              onClick={() => !isDisabled && handleMemberSelect(item, 'reporter', member)}
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
                              <span className='text-gray-900 font-medium truncate'>{member.fullName}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div onClick={() => handleShowMemberDropdown(item.id, 'reporter', item.type)} className='hover:bg-gray-200 cursor-pointer p-1 rounded'>
                        <Avatar person={item.reporter} />
                      </div>
                    )}
                  </td>
                  <td
                    style={{ width: `${columnWidths.assignees}px` }}
                    className='text-gray-800 p-2.5 border-b border-l border-r border-gray-200 text-sm whitespace-nowrap overflow-visible relative'
                  >
                    {showMemberDropdown?.id === item.id && showMemberDropdown?.field === 'assignees' ? (
                      <div
                        ref={dropdownRef}
                        className='absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto w-64 p-2 top-8 left-0'
                      >
                        {projectMembers.map((member) => {
                          const currentAssignees = item.assignees.map(a => a.id).filter(id => id !== undefined) as number[];
                          const isDisabled = currentAssignees.includes(member.accountId);
                          return (
                            <div
                              key={member.accountId}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer hover:shadow-sm'
                              }`}
                              onClick={() => !isDisabled && handleMemberSelect(item, 'assignees', member)}
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
                              <span className='text-gray-900 font-medium truncate'>{member.fullName}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleShowMemberDropdown(item.id, 'assignees', item.type)} 
                        className='flex flex-wrap gap-2 p-1 rounded hover:bg-gray-200 cursor-pointer'
                      >
                        {item.assignees.length ? (
                          item.type === 'TASK' ? (
                            item.assignees.map((assignee, index) => (
                              <Avatar
                                key={assignee.id ?? index}
                                person={assignee}
                                onDelete={
                                  item.type === 'TASK' && assignee.id != null
                                    ? () => handleDeleteAssignment(item.id, assignee.id as number, item.type)
                                    : undefined
                                }
                              />
                            ))
                          ) : (
                            <Avatar
                              person={item.assignees[0]}
                            />
                          )
                        ) : (
                          <span className='text-gray-500 text-xs'>-</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TasksAndEpicsTable;