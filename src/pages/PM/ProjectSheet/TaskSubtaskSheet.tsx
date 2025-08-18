import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useUpdateSubtaskPlannedHoursMutation, useUpdateSubtaskActualHoursMutation } from '../../../services/subtaskApi';
import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
import type { SubtaskItem } from '../../../services/projectApi';
import type { TaskItem } from '../../../services/projectApi';
import { useSearchParams } from 'react-router-dom';
import {
  useLazyGetTaskAssignmentsByTaskIdQuery,
} from '../../../services/taskAssignmentApi';
import WorkLogModal from './WorkLogModal';
import AssignedByPopup from './AssignedByPopup';

interface ExtendedTaskItem extends TaskItem {
  assignedBy?: string | null;
}

const TaskSubtaskSheet: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const {
    data,
    isLoading,
    error,
    refetch: refetchProject,
  } = useGetFullProjectDetailsByKeyQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const [tasks, setTasks] = useState<ExtendedTaskItem[]>([]);
  const [editedCells, setEditedCells] = useState<Record<string, any>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
  const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
  const [updateSubtaskActualHours] = useUpdateSubtaskActualHoursMutation();
  const [updatePlannedHours] = useUpdatePlannedHoursMutation();
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [isRefetching, setIsRefetching] = useState(false);
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showAssignedByPopup, setShowAssignedByPopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');

  const { data: taskStatusOptions, isLoading: loadTaskStatus } =
    useGetCategoriesByGroupQuery('task_status');
  const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
    useGetCategoriesByGroupQuery('subtask_status');

  const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
  const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!isLoading && !error && projectKey !== 'NotFound') {
      refetchProject();
    }
  }, [refetchProject, isLoading, error, projectKey]);

  // useEffect(() => {
  //   if (data?.data?.tasks) {
  //     setTasks(data.data.tasks as ExtendedTaskItem[]);
  //     data.data.tasks.forEach((task) => {
  //       trigger(task.id, true)
  //         .unwrap()
  //         .then((assignments) => {
  //           setAllTaskAssignments((prev) => ({
  //             ...prev,
  //             [task.id]: assignments,
  //           }));
  //         })
  //         .catch((error) => console.error(`Failed to fetch assignments for ${task.id}:`, error));
  //     });
  //   }
  // }, [data, trigger]);

  useEffect(() => {
    if (data?.data?.tasks) {
      const filteredTasks = selectedSprint === 'All Sprints'
        ? data.data.tasks
        : data.data.tasks.filter(task => task.sprintName === selectedSprint || (!task.sprintName && selectedSprint === 'No Sprint'));
      setTasks(filteredTasks as ExtendedTaskItem[]);
      data.data.tasks.forEach((task) => {
        trigger(task.id, true)
          .unwrap()
          .then((assignments) => {
            setAllTaskAssignments((prev) => ({
              ...prev,
              [task.id]: assignments,
            }));
          })
          .catch((error) => console.error(`Failed to fetch assignments for ${task.id}:`, error));
      });
    }
  }, [data, trigger, selectedSprint]);

  useEffect(() => {
    if (dynamicAssignments && selectedTaskId) {
      setAllTaskAssignments((prev) => ({
        ...prev,
        [selectedTaskId]: dynamicAssignments,
      }));
    }
  }, [dynamicAssignments, selectedTaskId]);

  const handleCellChange = (itemId: string, field: string, value: any, isSubtask?: boolean) => {
    const key = `${itemId}-${field}${isSubtask ? '-subtask' : ''}`;
    setEditedCells((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) newSet.delete(taskId);
      else newSet.add(taskId);
      return newSet;
    });
  };

  const handleTaskStatusBlur = async (taskId: string, newStatus: string) => {
    try {
      setIsRefetching(true);
      const result = await updateTaskStatus({
        id: taskId,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();
      setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
      await refetchProject();
      console.log(
        'Task status updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update task status', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskStatusBlur = async (subtaskId: string, newStatus: string) => {
    try {
      setIsRefetching(true);
      const result = await updateSubtaskStatus({
        id: subtaskId,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();
      setEditedCells((prev) => ({
        ...prev,
        [`${subtaskId}-status-subtask`]: newStatus,
        ...(newStatus === 'DONE' && { [`${subtaskId}-percentComplete-subtask`]: 100 }),
      }));
      await refetchProject();
      console.log(
        'Subtask status updated, refetched data:',
        data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId)
      );
    } catch (err) {
      console.error('Failed to update subtask status', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
    if (hours < 0) {
      alert('Planned hours cannot be negative.');
      return;
    }
    const formattedHours = Number(hours.toFixed(2));
    console.log(`Frontend sending task ${taskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
    try {
      setIsRefetching(true);
      const result = await updatePlannedHours({
        id: taskId,
        plannedHours: formattedHours,
        createdBy: accountId,
      }).unwrap();
      console.log('API response:', result);
      await refetchProject();
      console.log(
        'Task planned hours updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update task planned hours', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskPlannedHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
    if (hours < 0) {
      alert('Planned hours cannot be negative.');
      return;
    }
    const formattedHours = Number(hours.toFixed(2));
    console.log(`Frontend sending subtask ${subtaskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
    try {
      setIsRefetching(true);
      await updateSubtaskPlannedHours({
        id: subtaskId,
        hours: formattedHours,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Subtask planned hours updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update subtask planned hours', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskActualHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
    if (hours < 0) {
      alert('Actual hours cannot be negative.');
      return;
    }
    const formattedHours = Number(hours.toFixed(2));
    console.log(`Frontend sending subtask ${subtaskId} with actualHours: ${formattedHours}, type: ${typeof formattedHours}`);
    try {
      setIsRefetching(true);
      await updateSubtaskActualHours({
        id: subtaskId,
        hours: formattedHours,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Subtask actual hours updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update subtask actual hours', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleOpenWorkLogModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowWorkLogModal(true);
  };

  const handleOpenAssignedByPopup = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowAssignedByPopup(true);
  };

  if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">Error loading data</div>;

  const columnWidths = {
    id: 100,
    title: 200,
    sprint: 150,
    status: 120,
    plannedStartDate: 120,
    plannedEndDate: 120,
    actualStartDate: 120,
    actualEndDate: 120,
    plannedHours: 100,
    actualHours: 100,
    plannedCost: 100,
    actualCost: 100,
    percentComplete: 120,
    assignedBy: 100,
  };

  const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...props} style={{ width, minWidth: width, maxWidth: width }} className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
        {children}
      </th>
    </Resizable>
  );

  const getAssignedNames = (itemId: string) => {
    const assignmentsForTask = allTaskAssignments[itemId] || [];
    return assignmentsForTask.length > 0
      ? assignmentsForTask.map((a) => a.accountFullname).join(', ')
      : '-';
  };

  const formatCost = (cost: number | null) => {
    return cost != null ? `${cost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
  };

  const sprintOptions = ['All Sprints', ...(data?.data?.sprints?.map(sprint => sprint.name) || []), 'No Sprint'];

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-4'>
        <label className='text-sm font-medium text-gray-700 mr-2'>Filter by Sprint:</label>
        <select
          value={selectedSprint}
          onChange={(e) => setSelectedSprint(e.target.value)}
          className='p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
        >
          {sprintOptions.length > 1 ? (
            sprintOptions.map((sprint, index) => (
              <option key={index} value={sprint}>
                {sprint}
              </option>
            ))
          ) : (
            <option value="No Sprint">No sprints available</option>
          )}
        </select>
      </div>
      {isRefetching && (
        <div className='flex justify-center mb-4'>
          <div className='w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      )}
      <div className='overflow-x-auto shadow-lg rounded-lg border border-gray-100'>
        <table className='min-w-full bg-white'>
          <thead>
            <tr className='bg-gray-50'>
              <ResizableHeader
                width={columnWidths.id}
                onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
              >
                ID
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.title}
                onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
              >
                Title
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.sprint}
                onResize={(e: any, { size }: any) => (columnWidths.sprint = size.width)}
              >
                Sprint
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.status}
                onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
              >
                Status
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedStartDate}
                onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
              >
                Planned Start
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedEndDate}
                onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
              >
                Planned End
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualStartDate}
                onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
              >
                Actual Start
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualEndDate}
                onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
              >
                Actual End
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedHours}
                onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
              >
                Planned Hours
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualHours}
                onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
              >
                Actual Hours
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedCost}
                onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
              >
                Planned Cost
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualCost}
                onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
              >
                Actual Cost
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.percentComplete}
                onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
              >
                Percent Complete
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.assignedBy}
                onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
              >
                Assigned
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className='hover:bg-gray-50 transition-colors'>
                  <td
                    className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold cursor-pointer' : ''}`}
                    onClick={() => task.subtasks?.length && toggleTaskExpand(task.id)}
                  >
                    {task.subtasks?.length ? (expandedTasks.has(task.id) ? '−' : '+') : ''} {task.id}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.title}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.sprintName || 'No Sprint'}
                  </td>
                  <td className='border-b border-gray-200 p-3 text-sm'>
                    <select
                      value={editedCells[`${task.id}-status`] || task.status || ''}
                      onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
                      onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
                      className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
                    >
                      {taskStatusOptions?.data.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.plannedStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.plannedEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.actualStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.actualEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border-b border-gray-200 p-3 text-sm'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-plannedHours`] ?? (task.plannedHours ?? 0)}
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
                      }
                      onBlur={(e) =>
                        handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
                      disabled={!!task.subtasks?.length}
                      min='0'
                      step='0.1'
                    />
                  </td>
                  <td
                    className={`border-b border-gray-200 p-3 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-blue-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
                    onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
                  >
                    {task.actualHours ?? 0}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {formatCost(task.plannedCost)}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {formatCost(task.actualCost)}
                  </td>
                  <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.percentComplete ? `${task.percentComplete}%` : '0%'}
                  </td>
                  <td
                    className={`border-b border-gray-200 p-3 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-blue-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
                    onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
                  >
                    {getAssignedNames(task.id)}
                  </td>
                </tr>
                {expandedTasks.has(task.id) &&
                  task.subtasks?.map((subtask) => (
                    <tr key={subtask.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='border-b border-gray-200 p-3 text-sm pl-8'>{subtask.id}</td>
                      <td className='border-b border-gray-200 p-3 text-sm'>{subtask.title}</td>
                      <td className='border-b border-gray-200 p-3 text-sm'>{task.sprintName || 'No Sprint'}</td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        <select
                          value={
                            editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'status', e.target.value, true)
                          }
                          onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
                          className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
                        >
                          {subtaskStatusOptions?.data.map((opt) => (
                            <option key={opt.id} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.plannedStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.plannedEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.actualStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.actualEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-plannedHours-subtask`] ?? (subtask.plannedHours ?? 0)
                          }
                          onChange={(e) =>
                            handleCellChange(
                              subtask.id,
                              'plannedHours',
                              parseFloat(e.target.value) || 0,
                              true
                            )
                          }
                          onBlur={(e) =>
                            handleSubtaskPlannedHoursBlur(
                              subtask.id,
                              task.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
                          min='0'
                          step='0.1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-actualHours-subtask`] ?? (subtask.actualHours ?? 0)
                          }
                          onChange={(e) =>
                            handleCellChange(
                              subtask.id,
                              'actualHours',
                              parseFloat(e.target.value) || 0,
                              true
                            )
                          }
                          onBlur={(e) =>
                            handleSubtaskActualHoursBlur(
                              subtask.id,
                              task.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
                          min='0'
                          step='0.1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {formatCost(subtask.plannedCost)}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {formatCost(subtask.actualCost)}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.percentComplete ? `${subtask.percentComplete}%` : '0%'}
                      </td>
                      <td className='border-b border-gray-200 p-3 text-sm'>
                        {subtask.assignedFullName || subtask.assignedUsername || '-'}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {showWorkLogModal && (
        <WorkLogModal
          open={showWorkLogModal}
          onClose={() => setShowWorkLogModal(false)}
          workItemId={selectedTaskId || ''}
          type='task'
          onRefetch={refetchProject}
          onRefetchActivityLogs={() => {}}
        />
      )}
      {showAssignedByPopup && selectedTaskId && (
        <AssignedByPopup
          open={showAssignedByPopup}
          onClose={() => setShowAssignedByPopup(false)}
          workItemId={selectedTaskId}
          type='task'
          onRefetch={refetchProject}
        />
      )}
    </div>
  );
};

export default TaskSubtaskSheet;