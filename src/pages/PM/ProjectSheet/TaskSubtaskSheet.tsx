// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation, useUpdatePercentCompleteMutation, useUpdatePlannedCostMutation, useUpdateActualCostMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation, useUpdateSubtaskPercentCompleteMutation, useUpdateSubtaskPlannedCostMutation, useUpdateSubtaskActualCostMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation, useUpdateSubtaskActualHoursMutation } from '../../../services/subtaskApi';
// import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';
// import {
//   useLazyGetTaskAssignmentsByTaskIdQuery,
// } from '../../../services/taskAssignmentApi';
// import WorkLogModal from './WorkLogModal';
// import AssignedByPopup from './AssignedByPopup';
// import { FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

// interface ExtendedTaskItem extends TaskItem {
//   assignedBy?: string | null;
// }

// const TaskSubtaskSheet: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const {
//     data,
//     isLoading,
//     error,
//     refetch: refetchProject,
//   } = useGetFullProjectDetailsByKeyQuery(projectKey, {
//     skip: !projectKey || projectKey === 'NotFound',
//   });
//   const [tasks, setTasks] = useState<ExtendedTaskItem[]>([]);
//   const [editedCells, setEditedCells] = useState<Record<string, any>>({});
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [updateTaskStatus] = useUpdateTaskStatusMutation();
//   const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [updateSubtaskActualHours] = useUpdateSubtaskActualHoursMutation();
//   const [updatePlannedHours] = useUpdatePlannedHoursMutation();
//   const [updatePercentComplete] = useUpdatePercentCompleteMutation();
//   const [updateSubtaskPercentComplete] = useUpdateSubtaskPercentCompleteMutation();
//   const [updatePlannedCost] = useUpdatePlannedCostMutation();
//   const [updateActualCost] = useUpdateActualCostMutation();
//   const [updateSubtaskPlannedCost] = useUpdateSubtaskPlannedCostMutation();
//   const [updateSubtaskActualCost] = useUpdateSubtaskActualCostMutation();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);
//   const [showWorkLogModal, setShowWorkLogModal] = useState(false);
//   const [showAssignedByPopup, setShowAssignedByPopup] = useState(false);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');
//   const [isExporting, setIsExporting] = useState(false);

//   const { data: plannedHoursConfig, isLoading: plannedHoursConfigLoading, isError: plannedHoursConfigError } = useGetByConfigKeyQuery("planned_hours_limit");
//   const { data: actualHoursConfig, isLoading: actualHoursConfigLoading, isError: actualHoursConfigError } = useGetByConfigKeyQuery("actual_hours_limit");
//   const { data: plannedCostConfig, isLoading: plannedCostConfigLoading, isError: plannedCostConfigError } = useGetByConfigKeyQuery("planned_cost_limit");
//   const { data: actualCostConfig, isLoading: actualCostConfigLoading, isError: actualCostConfigError } = useGetByConfigKeyQuery("actual_cost_limit");

//   const maxPlannedHours = plannedHoursConfigLoading
//     ? 24 // Default during loading
//     : plannedHoursConfigError || !plannedHoursConfig?.data?.maxValue
//     ? 100000 // Default if error or no data
//     : parseInt(plannedHoursConfig.data.maxValue, 10);

//   const maxActualHours = actualHoursConfigLoading
//     ? 24
//     : actualHoursConfigError || !actualHoursConfig?.data?.maxValue
//     ? 100000
//     : parseInt(actualHoursConfig.data.maxValue, 10);

//   const maxPlannedCost = plannedCostConfigLoading
//     ? 1000000 // Default during loading
//     : plannedCostConfigError || !plannedCostConfig?.data?.maxValue
//     ? 10000000000 // Default if error or no data
//     : parseInt(plannedCostConfig.data.maxValue, 10);

//   const maxActualCost = actualCostConfigLoading
//     ? 1000000
//     : actualCostConfigError || !actualCostConfig?.data?.maxValue
//     ? 10000000000
//     : parseInt(actualCostConfig.data.maxValue, 10);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
//   const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

//   useEffect(() => {
//     if (!isLoading && !error && projectKey !== 'NotFound') {
//       refetchProject();
//     }
//   }, [refetchProject, isLoading, error, projectKey]);

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       const filteredTasks = selectedSprint === 'All Sprints'
//         ? data.data.tasks
//         : data.data.tasks.filter(task => task.sprintName === selectedSprint || (!task.sprintName && selectedSprint === 'No Sprint'));
//       setTasks(filteredTasks as ExtendedTaskItem[]);
//       data.data.tasks.forEach((task) => {
//         trigger(task.id, true)
//           .unwrap()
//           .then((assignments) => {
//             setAllTaskAssignments((prev) => ({
//               ...prev,
//               [task.id]: assignments,
//             }));
//           })
//           .catch((error) => console.error(`Failed to fetch assignments for ${task.id}:`, error));
//       });
//     }
//   }, [data, trigger, selectedSprint]);

//   useEffect(() => {
//     if (dynamicAssignments && selectedTaskId) {
//       setAllTaskAssignments((prev) => ({
//         ...prev,
//         [selectedTaskId]: dynamicAssignments,
//       }));
//     }
//   }, [dynamicAssignments, selectedTaskId]);

//   const handleCellChange = (itemId: string, field: string, value: any, isSubtask?: boolean) => {
//     const key = `${itemId}-${field}${isSubtask ? '-subtask' : ''}`;
//     setEditedCells((prev) => ({ ...prev, [key]: value }));
//   };

//   const toggleTaskExpand = (taskId: string) => {
//     setExpandedTasks((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(taskId)) newSet.delete(taskId);
//       else newSet.add(taskId);
//       return newSet;
//     });
//   };

//   const handleTaskStatusBlur = async (taskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateTaskStatus({
//         id: taskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
//       await refetchProject();
//       console.log(
//         'Task status updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskStatusBlur = async (subtaskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateSubtaskStatus({
//         id: subtaskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({
//         ...prev,
//         [`${subtaskId}-status-subtask`]: newStatus,
//         ...(newStatus === 'DONE' && { [`${subtaskId}-percentComplete-subtask`]: 100 }),
//       }));
//       await refetchProject();
//       console.log(
//         'Subtask status updated, refetched data:',
//         data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPercentCompleteBlur = async (taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       alert('Percent complete must be between 0 and 100.');
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updatePercentComplete({
//         id: taskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-percentComplete`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Task percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task percent complete', err);
//       alert('Failed to update percent complete.');
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPercentCompleteBlur = async (subtaskId: string, taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       alert('Percent complete must be between 0 and 100.');
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPercentComplete({
//         id: subtaskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${subtaskId}-percentComplete-subtask`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Subtask percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask percent complete', err);
//       alert('Failed to update percent complete.');
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       alert(`Planned hours cannot exceed ${maxPlannedHours} hours.`);
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       const result = await updatePlannedHours({
//         id: taskId,
//         plannedHours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       console.log('API response:', result);
//       await refetchProject();
//       console.log(
//         'Task planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       alert(`Planned hours cannot exceed ${maxPlannedHours} hours.`);
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Actual hours cannot be negative.');
//       return;
//     }
//     if (hours > maxActualHours) {
//       alert(`Actual hours cannot exceed ${maxActualHours} hours.`);
//       return;
//     }
//     // Check if subtask has an assignee
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       alert('Cannot update actual hours: No assignee found for this subtask.');
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask actual hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       alert('Planned cost cannot be negative.');
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       alert(`Planned cost cannot exceed ${maxPlannedCost} VNĐ.`);
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updatePlannedCost({
//         id: taskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Task planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskActualCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       alert('Actual cost cannot be negative.');
//       return;
//     }
//     if (cost > maxActualCost) {
//       alert(`Actual cost cannot exceed ${maxActualCost} VNĐ.`);
//       return;
//     }
//     // Check if task has assignees
//     const assignmentsForTask = allTaskAssignments[taskId] || [];
//     if (assignmentsForTask.length === 0) {
//       alert('Cannot update actual cost: No assignees found for this task.');
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateActualCost({
//         id: taskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Task actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task actual cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       alert('Planned cost cannot be negative.');
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       alert(`Planned cost cannot exceed ${maxPlannedCost} VNĐ.`);
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedCost({
//         id: subtaskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       alert('Actual cost cannot be negative.');
//       return;
//     }
//     if (cost > maxActualCost) {
//       alert(`Actual cost cannot exceed ${maxActualCost} VNĐ.`);
//       return;
//     }
//     // Check if subtask has an assignee
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       alert('Cannot update actual cost: No assignee found for this subtask.');
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualCost({
//         id: subtaskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleOpenWorkLogModal = (taskId: string) => {
//     // Check if task has assignees before opening WorkLogModal
//     // const assignmentsForTask = allTaskAssignments[taskId] || [];
//     // if (assignmentsForTask.length === 0) {
//     //   alert('Cannot open work log: No assignees found for this task.');
//     //   return;
//     // }
//     setSelectedTaskId(taskId);
//     setShowWorkLogModal(true);
//   };

//   const handleOpenAssignedByPopup = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowAssignedByPopup(true);
//   };

//   const handleExportExcel = () => {
//     setIsExporting(true);
//     try {
//       // Prepare data for Excel
//       const exportData = [];
//       exportData.push([
//         'ID',
//         'Title',
//         'Sprint',
//         'Status',
//         'Planned Start',
//         'Planned End',
//         'Actual Start',
//         'Actual End',
//         'Planned Hours',
//         'Actual Hours',
//         'Planned Resource Cost',
//         'Actual Resource Cost',
//         'Planned Cost',
//         'Actual Cost',
//         'Percent Complete',
//         'Assigned',
//       ]);

//       tasks.forEach((task) => {
//         // Add task row
//         exportData.push([
//           task.id,
//           task.title,
//           task.sprintName || 'No Sprint',
//           editedCells[`${task.id}-status`] || task.status || '',
//           task.plannedStartDate?.split('T')[0] || '-',
//           task.plannedEndDate?.split('T')[0] || '-',
//           task.actualStartDate?.split('T')[0] || '-',
//           task.actualEndDate?.split('T')[0] || '-',
//           (editedCells[`${task.id}-plannedHours`] ?? task.plannedHours ?? 0).toString(),
//           (task.actualHours ?? 0).toString(),
//           formatCost(task.plannedResourceCost ?? task.plannedCost),
//           formatCost(task.actualResourceCost ?? task.actualCost),
//           formatCost(task.plannedCost),
//           formatCost(task.actualCost),
//           (editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0) + '%',
//           getAssignedNames(task.id),
//         ]);

//         // Add subtask rows (indented) for all tasks with subtasks
//         if (task.subtasks?.length) {
//           task.subtasks.forEach((subtask) => {
//             exportData.push([
//               `    ${subtask.id}`, // Indent ID to indicate subtask
//               `    ${subtask.title}`, // Indent title
//               task.sprintName || 'No Sprint',
//               editedCells[`${subtask.id}-status-subtask`] || subtask.status || '',
//               subtask.plannedStartDate?.split('T')[0] || '-',
//               subtask.plannedEndDate?.split('T')[0] || '-',
//               subtask.actualStartDate?.split('T')[0] || '-',
//               subtask.actualEndDate?.split('T')[0] || '-',
//               (editedCells[`${subtask.id}-plannedHours-subtask`] ?? subtask.plannedHours ?? 0).toString(),
//               (editedCells[`${subtask.id}-actualHours-subtask`] ?? subtask.actualHours ?? 0).toString(),
//               formatCost(subtask.plannedResourceCost ?? subtask.plannedCost),
//               formatCost(subtask.actualResourceCost ?? subtask.actualCost),
//               formatCost(subtask.plannedCost),
//               formatCost(subtask.actualCost),
//               (editedCells[`${subtask.id}-percentComplete-subtask`] ?? subtask.percentComplete ?? 0) + '%',
//               subtask.assignedFullName || subtask.assignedUsername || '-',
//             ]);
//           });
//         }
//       });

//       // Create worksheet
//       const ws = XLSX.utils.aoa_to_sheet(exportData);

//       // Style headers
//       ws['!cols'] = [
//         { wch: 15 }, // ID
//         { wch: 30 }, // Title
//         { wch: 15 }, // Sprint
//         { wch: 15 }, // Status
//         { wch: 15 }, // Planned Start
//         { wch: 15 }, // Planned End
//         { wch: 15 }, // Actual Start
//         { wch: 15 }, // Actual End
//         { wch: 12 }, // Planned Hours
//         { wch: 12 }, // Actual Hours
//         { wch: 15 }, // Planned Resource Cost
//         { wch: 15 }, // Actual Resource Cost
//         { wch: 15 }, // Planned Cost
//         { wch: 15 }, // Actual Cost
//         { wch: 15 }, // Percent Complete
//         { wch: 20 }, // Assigned
//       ];

//       // Create workbook and add worksheet
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Tasks and Subtasks');

//       // Generate and download Excel file
//       XLSX.writeFile(wb, `project-${projectKey}-tasks.xlsx`);
//     } catch (err) {
//       console.error('Failed to export to Excel:', err);
//       alert('Error exporting to Excel. Please try again.');
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div className="text-center text-gray-600">Loading...</div>;
//   if (error) return <div className="text-center text-red-600">Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     sprint: 150,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedResourceCost: 120,
//     actualResourceCost: 120,
//     plannedCost: 120,
//     actualCost: 120,
//     percentComplete: 120,
//     assignedBy: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...props} style={{ width, minWidth: width, maxWidth: width }} className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
//         {children}
//       </th>
//     </Resizable>
//   );

//   const getAssignedNames = (itemId: string) => {
//     const assignmentsForTask = allTaskAssignments[itemId] || [];
//     return assignmentsForTask.length > 0
//       ? assignmentsForTask.map((a) => a.accountFullname).join(', ')
//       : '-';
//   };

//   const formatCost = (cost: number | null) => {
//     return cost != null ? `${cost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
//   };

//   const sprintOptions = ['All Sprints', ...(data?.data?.sprints?.map(sprint => sprint.name) || []), 'No Sprint'];

//   return (
//     <div className='container mx-auto p-6'>
//       <div className='flex justify-between items-center mb-4'>
//         <div>
//           <label className='text-sm font-medium text-gray-700 mr-2'>Filter by Sprint:</label>
//           <select
//             value={selectedSprint}
//             onChange={(e) => setSelectedSprint(e.target.value)}
//             className='p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//           >
//             {sprintOptions.length > 1 ? (
//               sprintOptions.map((sprint, index) => (
//                 <option key={index} value={sprint}>
//                   {sprint}
//                 </option>
//               ))
//             ) : (
//               <option value="No Sprint">No sprints available</option>
//             )}
//           </select>
//         </div>
//         <button
//           onClick={handleExportExcel}
//           disabled={isExporting}
//           className={`flex items-center px-4 py-2 rounded-xl text-white ${
//             isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
//           }`}
//         >
//           <FileSpreadsheet className='w-5 h-5 mr-2' />
//           {isExporting ? 'Exporting...' : 'Export Excel'}
//         </button>
//       </div>
//       {isRefetching && (
//         <div className='flex justify-center mb-4'>
//           <div className='w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin'></div>
//         </div>
//       )}
//       <div className='overflow-x-auto shadow-lg rounded-lg border border-gray-100'>
//         <table className='min-w-full bg-white'>
//           <thead>
//             <tr className='bg-gray-50'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprint}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprint = size.width)}
//               >
//                 Sprint
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedResourceCost = size.width)}
//               >
//                 Planned Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualResourceCost = size.width)}
//               >
//                 Actual Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//               >
//                 Assigned
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-gray-50 transition-colors'>
//                   <td
//                     className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold cursor-pointer' : ''}`}
//                     onClick={() => task.subtasks?.length && toggleTaskExpand(task.id)}
//                   >
//                     {task.subtasks?.length ? (expandedTasks.has(task.id) ? '−' : '+') : ''} {task.id}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.title}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.sprintName || 'No Sprint'}
//                   </td>
//                   <td className='border-b border-gray-200 p-3 text-sm'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border-b border-gray-200 p-3 text-sm'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] ?? (task.plannedHours ?? 0)}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                       disabled={!!task.subtasks?.length}
//                       min='0'
//                       step='1'
//                     />
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-3 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-blue-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
//                   >
//                     {task.actualHours ?? 0}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.plannedResourceCost ?? 0)}
//                   </td>
//                   <td className={`border-b border-gray-200 p-3 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.actualResourceCost ?? 0)}
//                   </td>
//                   <td className='border-b border-gray-200 p-3 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.plannedCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-plannedCost`] ?? (task.plannedCost ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPlannedCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-3 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.actualCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-actualCost`] ?? (task.actualCost ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskActualCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-3 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {(editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0)}% (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-percentComplete`] ?? (task.percentComplete ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'percentComplete', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPercentCompleteBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                         min='0'
//                         max='100'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-3 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-blue-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
//                   >
//                     {getAssignedNames(task.id)}
//                   </td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-gray-50 transition-colors'>
//                       <td className='border-b border-gray-200 p-3 text-sm pl-8'>{subtask.id}</td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>{subtask.title}</td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>{task.sprintName || 'No Sprint'}</td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <select
//                           value={
//                             editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'status', e.target.value, true)
//                           }
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {subtask.plannedStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {subtask.plannedEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {subtask.actualStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {subtask.actualEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedHours-subtask`] ?? (subtask.plannedHours ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedHoursBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualHours-subtask`] ?? (subtask.actualHours ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualHoursBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {formatCost(subtask.plannedResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {formatCost(subtask.actualResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-plannedCost-subtask`] ?? (subtask.plannedCost ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedCostBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-actualCost-subtask`] ?? (subtask.actualCost ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualCostBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-percentComplete-subtask`] ?? (subtask.percentComplete ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'percentComplete',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPercentCompleteBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-1.5 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors'
//                           min='0'
//                           max='100'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-3 text-sm'>
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {showWorkLogModal && (
//         <WorkLogModal
//           open={showWorkLogModal}
//           onClose={() => setShowWorkLogModal(false)}
//           workItemId={selectedTaskId || ''}
//           type='task'
//           onRefetch={refetchProject}
//           onRefetchActivityLogs={() => {}}
//         />
//       )}
//       {showAssignedByPopup && selectedTaskId && (
//         <AssignedByPopup
//           open={showAssignedByPopup}
//           onClose={() => setShowAssignedByPopup(false)}
//           workItemId={selectedTaskId}
//           type='task'
//           onRefetch={refetchProject}
//         />
//       )}
//     </div>
//   );
// };

// export default TaskSubtaskSheet;


// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation, useUpdatePercentCompleteMutation, useUpdatePlannedCostMutation, useUpdateActualCostMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation, useUpdateSubtaskPercentCompleteMutation, useUpdateSubtaskPlannedCostMutation, useUpdateSubtaskActualCostMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation, useUpdateSubtaskActualHoursMutation } from '../../../services/subtaskApi';
// import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';
// import {
//   useLazyGetTaskAssignmentsByTaskIdQuery,
// } from '../../../services/taskAssignmentApi';
// import WorkLogModal from './WorkLogModal';
// import AssignedByPopup from './AssignedByPopup';
// import { FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
// import Swal from 'sweetalert2';

// interface ExtendedTaskItem extends TaskItem {
//   assignedBy?: string | null;
// }

// const TaskSubtaskSheet: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const {
//     data,
//     isLoading,
//     error,
//     refetch: refetchProject,
//   } = useGetFullProjectDetailsByKeyQuery(projectKey, {
//     skip: !projectKey || projectKey === 'NotFound',
//   });
//   const [tasks, setTasks] = useState<ExtendedTaskItem[]>([]);
//   const [editedCells, setEditedCells] = useState<Record<string, any>>({});
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [updateTaskStatus] = useUpdateTaskStatusMutation();
//   const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [updateSubtaskActualHours] = useUpdateSubtaskActualHoursMutation();
//   const [updatePlannedHours] = useUpdatePlannedHoursMutation();
//   const [updatePercentComplete] = useUpdatePercentCompleteMutation();
//   const [updateSubtaskPercentComplete] = useUpdateSubtaskPercentCompleteMutation();
//   const [updatePlannedCost] = useUpdatePlannedCostMutation();
//   const [updateActualCost] = useUpdateActualCostMutation();
//   const [updateSubtaskPlannedCost] = useUpdateSubtaskPlannedCostMutation();
//   const [updateSubtaskActualCost] = useUpdateSubtaskActualCostMutation();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);
//   const [showWorkLogModal, setShowWorkLogModal] = useState(false);
//   const [showAssignedByPopup, setShowAssignedByPopup] = useState(false);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');
//   const [isExporting, setIsExporting] = useState(false);

//   const { data: plannedHoursConfig, isLoading: plannedHoursConfigLoading, isError: plannedHoursConfigError } = useGetByConfigKeyQuery("planned_hours_limit");
//   const { data: actualHoursConfig, isLoading: actualHoursConfigLoading, isError: actualHoursConfigError } = useGetByConfigKeyQuery("actual_hours_limit");
//   const { data: plannedCostConfig, isLoading: plannedCostConfigLoading, isError: plannedCostConfigError } = useGetByConfigKeyQuery("planned_cost_limit");
//   const { data: actualCostConfig, isLoading: actualCostConfigLoading, isError: actualCostConfigError } = useGetByConfigKeyQuery("actual_cost_limit");

//   const maxPlannedHours = plannedHoursConfigLoading
//     ? 24 // Default during loading
//     : plannedHoursConfigError || !plannedHoursConfig?.data?.maxValue
//     ? 100000 // Default if error or no data
//     : parseInt(plannedHoursConfig.data.maxValue, 10);

//   const maxActualHours = actualHoursConfigLoading
//     ? 24
//     : actualHoursConfigError || !actualHoursConfig?.data?.maxValue
//     ? 100000
//     : parseInt(actualHoursConfig.data.maxValue, 10);

//   const maxPlannedCost = plannedCostConfigLoading
//     ? 1000000 // Default during loading
//     : plannedCostConfigError || !plannedCostConfig?.data?.maxValue
//     ? 10000000000 // Default if error or no data
//     : parseInt(plannedCostConfig.data.maxValue, 10);

//   const maxActualCost = actualCostConfigLoading
//     ? 1000000
//     : actualCostConfigError || !actualCostConfig?.data?.maxValue
//     ? 10000000000
//     : parseInt(actualCostConfig.data.maxValue, 10);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
//   const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

//   useEffect(() => {
//     if (!isLoading && !error && projectKey !== 'NotFound') {
//       refetchProject();
//     }
//   }, [refetchProject, isLoading, error, projectKey]);

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       const filteredTasks = selectedSprint === 'All Sprints'
//         ? data.data.tasks
//         : data.data.tasks.filter(task => task.sprintName === selectedSprint || (!task.sprintName && selectedSprint === 'No Sprint'));
//       setTasks(filteredTasks as ExtendedTaskItem[]);
//       data.data.tasks.forEach((task) => {
//         trigger(task.id, true)
//           .unwrap()
//           .then((assignments) => {
//             setAllTaskAssignments((prev) => ({
//               ...prev,
//               [task.id]: assignments,
//             }));
//           })
//           .catch((error) => console.error(`Failed to fetch assignments for ${task.id}:`, error));
//       });
//     }
//   }, [data, trigger, selectedSprint]);

//   useEffect(() => {
//     if (dynamicAssignments && selectedTaskId) {
//       setAllTaskAssignments((prev) => ({
//         ...prev,
//         [selectedTaskId]: dynamicAssignments,
//       }));
//     }
//   }, [dynamicAssignments, selectedTaskId]);

//   const handleCellChange = (itemId: string, field: string, value: any, isSubtask?: boolean) => {
//     const key = `${itemId}-${field}${isSubtask ? '-subtask' : ''}`;
//     setEditedCells((prev) => ({ ...prev, [key]: value }));
//   };

//   const toggleTaskExpand = (taskId: string) => {
//     setExpandedTasks((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(taskId)) newSet.delete(taskId);
//       else newSet.add(taskId);
//       return newSet;
//     });
//   };

//   const handleTaskStatusBlur = async (taskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateTaskStatus({
//         id: taskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
//       await refetchProject();
//       console.log(
//         'Task status updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskStatusBlur = async (subtaskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateSubtaskStatus({
//         id: subtaskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({
//         ...prev,
//         [`${subtaskId}-status-subtask`]: newStatus,
//         ...(newStatus === 'DONE' && { [`${subtaskId}-percentComplete-subtask`]: 100 }),
//       }));
//       await refetchProject();
//      console.log(
//         'Subtask status updated, refetched data:',
//         data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPercentCompleteBlur = async (taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Percent complete must be between 0 and 100.',
//       });
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updatePercentComplete({
//         id: taskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-percentComplete`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Task percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task percent complete', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update percent complete.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPercentCompleteBlur = async (subtaskId: string, taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Percent complete must be between 0 and 100.',
//       });
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPercentComplete({
//         id: subtaskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${subtaskId}-percentComplete-subtask`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Subtask percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask percent complete', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update percent complete.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       const result = await updatePlannedHours({
//         id: taskId,
//         plannedHours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       console.log('API response:', result);
//       await refetchProject();
//       console.log(
//         'Task planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxActualHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual hours cannot exceed ${maxActualHours} hours.`,
//       });
//       return;
//     }
//     // Check if subtask has an assignee
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignee',
//         text: 'Cannot update actual hours: No assignee found for this subtask.',
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask actual hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned cost cannot exceed ${maxPlannedCost} VNĐ.`,
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updatePlannedCost({
//         id: taskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Task planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskActualCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxActualCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual cost cannot exceed ${maxActualCost} VNĐ.`,
//       });
//       return;
//     }
//     // Check if task has assignees
//     const assignmentsForTask = allTaskAssignments[taskId] || [];
//     if (assignmentsForTask.length === 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignees',
//         text: 'Cannot update actual cost: No assignees found for this task.',
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateActualCost({
//         id: taskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Task actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task actual cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned cost cannot exceed ${maxPlannedCost} VNĐ.`,
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedCost({
//         id: subtaskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxActualCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual cost cannot exceed ${maxActualCost} VNĐ.`,
//       });
//       return;
//     }
//     // Check if subtask has an assignee
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignee',
//         text: 'Cannot update actual cost: No assignee found for this subtask.',
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualCost({
//         id: subtaskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual cost', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleOpenWorkLogModal = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowWorkLogModal(true);
//   };

//   const handleOpenAssignedByPopup = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowAssignedByPopup(true);
//   };

//   const handleExportExcel = () => {
//     setIsExporting(true);
//     try {
//       // Prepare data for Excel
//       const exportData = [];
//       exportData.push([
//         'ID',
//         'Title',
//         'Sprint',
//         'Status',
//         'Planned Start',
//         'Planned End',
//         'Actual Start',
//         'Actual End',
//         'Planned Hours',
//         'Actual Hours',
//         'Planned Resource Cost',
//         'Actual Resource Cost',
//         'Planned Cost',
//         'Actual Cost',
//         'Percent Complete',
//         'Assigned',
//       ]);

//       tasks.forEach((task) => {
//         // Add task row
//         exportData.push([
//           task.id,
//           task.title,
//           task.sprintName || 'No Sprint',
//           editedCells[`${task.id}-status`] || task.status || '',
//           task.plannedStartDate?.split('T')[0] || '-',
//           task.plannedEndDate?.split('T')[0] || '-',
//           task.actualStartDate?.split('T')[0] || '-',
//           task.actualEndDate?.split('T')[0] || '-',
//           (editedCells[`${task.id}-plannedHours`] ?? task.plannedHours ?? 0).toString(),
//           (task.actualHours ?? 0).toString(),
//           formatCost(task.plannedResourceCost ?? task.plannedCost),
//           formatCost(task.actualResourceCost ?? task.actualCost),
//           formatCost(task.plannedCost),
//           formatCost(task.actualCost),
//           (editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0) + '%',
//           getAssignedNames(task.id),
//         ]);

//         // Add subtask rows (indented) for all tasks with subtasks
//         if (task.subtasks?.length) {
//           task.subtasks.forEach((subtask) => {
//             exportData.push([
//               `    ${subtask.id}`, // Indent ID to indicate subtask
//               `    ${subtask.title}`, // Indent title
//               task.sprintName || 'No Sprint',
//               editedCells[`${subtask.id}-status-subtask`] || subtask.status || '',
//               subtask.plannedStartDate?.split('T')[0] || '-',
//               subtask.plannedEndDate?.split('T')[0] || '-',
//               subtask.actualStartDate?.split('T')[0] || '-',
//               subtask.actualEndDate?.split('T')[0] || '-',
//               (editedCells[`${subtask.id}-plannedHours-subtask`] ?? subtask.plannedHours ?? 0).toString(),
//               (editedCells[`${subtask.id}-actualHours-subtask`] ?? subtask.actualHours ?? 0).toString(),
//               formatCost(subtask.plannedResourceCost ?? subtask.plannedCost),
//               formatCost(subtask.actualResourceCost ?? subtask.actualCost),
//               formatCost(subtask.plannedCost),
//               formatCost(subtask.actualCost),
//               (editedCells[`${subtask.id}-percentComplete-subtask`] ?? subtask.percentComplete ?? 0) + '%',
//               subtask.assignedFullName || subtask.assignedUsername || '-',
//             ]);
//           });
//         }
//       });

//       // Create worksheet
//       const ws = XLSX.utils.aoa_to_sheet(exportData);

//       // Style headers
//       ws['!cols'] = [
//         { wch: 15 }, // ID
//         { wch: 30 }, // Title
//         { wch: 15 }, // Sprint
//         { wch: 15 }, // Status
//         { wch: 15 }, // Planned Start
//         { wch: 15 }, // Planned End
//         { wch: 15 }, // Actual Start
//         { wch: 15 }, // Actual End
//         { wch: 12 }, // Planned Hours
//         { wch: 12 }, // Actual Hours
//         { wch: 15 }, // Planned Resource Cost
//         { wch: 15 }, // Actual Resource Cost
//         { wch: 15 }, // Planned Cost
//         { wch: 15 }, // Actual Cost
//         { wch: 15 }, // Percent Complete
//         { wch: 20 }, // Assigned
//       ];

//       // Create workbook and add worksheet
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Tasks and Subtasks');

//       // Generate and download Excel file
//       XLSX.writeFile(wb, `project-${projectKey}-tasks.xlsx`);
//     } catch (err) {
//       console.error('Failed to export to Excel:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Export Failed',
//         text: 'Error exporting to Excel. Please try again.',
//       });
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div className="text-center text-gray-600">Loading...</div>;
//   if (error) return <div className="text-center text-red-600">Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     sprint: 150,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedResourceCost: 120,
//     actualResourceCost: 120,
//     plannedCost: 120,
//     actualCost: 120,
//     percentComplete: 120,
//     assignedBy: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...props} style={{ width, minWidth: width, maxWidth: width }} className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100">
//         {children}
//       </th>
//     </Resizable>
//   );

//   const getAssignedNames = (itemId: string) => {
//     const assignmentsForTask = allTaskAssignments[itemId] || [];
//     return assignmentsForTask.length > 0
//       ? assignmentsForTask.map((a) => a.accountFullname).join(', ')
//       : '-';
//   };

//   const formatCost = (cost: number | null) => {
//     return cost != null ? `${cost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
//   };

//   const sprintOptions = ['All Sprints', ...(data?.data?.sprints?.map(sprint => sprint.name) || []), 'No Sprint'];

//   return (
//     <div className='container mx-auto p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl'>
//       <div className='flex justify-between items-center mb-6'>
//         <div className='flex items-center space-x-4'>
//           <label className='text-sm font-semibold text-gray-800'>Filter by Sprint:</label>
//           <select
//             value={selectedSprint}
//             onChange={(e) => setSelectedSprint(e.target.value)}
//             className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm'
//           >
//             {sprintOptions.length > 1 ? (
//               sprintOptions.map((sprint, index) => (
//                 <option key={index} value={sprint}>
//                   {sprint}
//                 </option>
//               ))
//             ) : (
//               <option value="No Sprint">No sprints available</option>
//             )}
//           </select>
//         </div>
//         <button
//           onClick={handleExportExcel}
//           disabled={isExporting}
//           className={`flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
//             isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
//           }`}
//         >
//           <FileSpreadsheet className='w-5 h-5 mr-3' />
//           {isExporting ? 'Exporting...' : 'Export Excel'}
//         </button>
//       </div>
//       {isRefetching && (
//         <div className='flex justify-center mb-6'>
//           <div className='w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
//         </div>
//       )}
//       <div className='overflow-x-auto overflow-y-auto max-h-[70vh] shadow-2xl rounded-xl border border-gray-200'>
//         <table className='min-w-full bg-white divide-y divide-gray-200'>
//           <thead className='sticky top-0 z-10 bg-white shadow-md'>
//             <tr className='bg-gradient-to-r from-gray-50 to-gray-100'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprint}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprint = size.width)}
//               >
//                 Sprint
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedResourceCost = size.width)}
//               >
//                 Planned Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualResourceCost = size.width)}
//               >
//                 Actual Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//               >
//                 Assigned
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody className='divide-y divide-gray-200'>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-indigo-50 transition-all duration-200'>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold cursor-pointer' : ''}`}
//                     onClick={() => task.subtasks?.length && toggleTaskExpand(task.id)}
//                   >
//                     {task.subtasks?.length ? (expandedTasks.has(task.id) ? '−' : '+') : ''} {task.id}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.title}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.sprintName || 'No Sprint'}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] ?? (task.plannedHours ?? 0)}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                       disabled={!!task.subtasks?.length}
//                       min='0'
//                       step='1'
//                     />
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
//                   >
//                     {task.actualHours ?? 0}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.plannedResourceCost ?? 0)}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.actualResourceCost ?? 0)}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.plannedCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-plannedCost`] ?? (task.plannedCost ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPlannedCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.actualCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-actualCost`] ?? (task.actualCost ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskActualCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {(editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0)}% (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-percentComplete`] ?? (task.percentComplete ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'percentComplete', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPercentCompleteBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         max='100'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
//                   >
//                     {getAssignedNames(task.id)}
//                   </td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-indigo-50 transition-all duration-200'>
//                       <td className='border-b border-gray-200 p-4 text-sm pl-10'>{subtask.id}</td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>{subtask.title}</td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>{task.sprintName || 'No Sprint'}</td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <select
//                           value={
//                             editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'status', e.target.value, true)
//                           }
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.plannedStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.plannedEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.actualStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.actualEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedHours-subtask`] ?? (subtask.plannedHours ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedHoursBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualHours-subtask`] ?? (subtask.actualHours ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualHoursBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {formatCost(subtask.plannedResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {formatCost(subtask.actualResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-plannedCost-subtask`] ?? (subtask.plannedCost ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedCostBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-actualCost-subtask`] ?? (subtask.actualCost ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualCostBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-percentComplete-subtask`] ?? (subtask.percentComplete ?? 0)
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'percentComplete',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPercentCompleteBlur(
//                               subtask.id,
//                               task.id,
//                               parseFloat(e.target.value) || 0
//                             )
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           max='100'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {showWorkLogModal && (
//         <WorkLogModal
//           open={showWorkLogModal}
//           onClose={() => setShowWorkLogModal(false)}
//           workItemId={selectedTaskId || ''}
//           type='task'
//           onRefetch={refetchProject}
//           onRefetchActivityLogs={() => {}}
//         />
//       )}
//       {showAssignedByPopup && selectedTaskId && (
//         <AssignedByPopup
//           open={showAssignedByPopup}
//           onClose={() => setShowAssignedByPopup(false)}
//           workItemId={selectedTaskId}
//           type='task'
//           onRefetch={refetchProject}
//         />
//       )}
//     </div>
//   );
// };

// export default TaskSubtaskSheet;



import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useUpdateTaskStatusMutation, useUpdatePercentCompleteMutation, useUpdatePlannedCostMutation, useUpdateActualCostMutation } from '../../../services/taskApi';
import { useUpdateSubtaskStatusMutation, useUpdateSubtaskPercentCompleteMutation, useUpdateSubtaskPlannedCostMutation, useUpdateSubtaskActualCostMutation } from '../../../services/subtaskApi';
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
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
import Swal from 'sweetalert2';

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
  const [updatePercentComplete] = useUpdatePercentCompleteMutation();
  const [updateSubtaskPercentComplete] = useUpdateSubtaskPercentCompleteMutation();
  const [updatePlannedCost] = useUpdatePlannedCostMutation();
  const [updateActualCost] = useUpdateActualCostMutation();
  const [updateSubtaskPlannedCost] = useUpdateSubtaskPlannedCostMutation();
  const [updateSubtaskActualCost] = useUpdateSubtaskActualCostMutation();
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [isRefetching, setIsRefetching] = useState(false);
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showAssignedByPopup, setShowAssignedByPopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');
  const [isExporting, setIsExporting] = useState(false);

  const { data: plannedHoursConfig, isLoading: plannedHoursConfigLoading, isError: plannedHoursConfigError } = useGetByConfigKeyQuery("planned_hours_limit");
  const { data: actualHoursConfig, isLoading: actualHoursConfigLoading, isError: actualHoursConfigError } = useGetByConfigKeyQuery("actual_hours_limit");
  const { data: plannedCostConfig, isLoading: plannedCostConfigLoading, isError: plannedCostConfigError } = useGetByConfigKeyQuery("planned_cost_limit");
  const { data: actualCostConfig, isLoading: actualCostConfigLoading, isError: actualCostConfigError } = useGetByConfigKeyQuery("actual_cost_limit");

  const maxPlannedHours = plannedHoursConfigLoading
    ? 24
    : plannedHoursConfigError || !plannedHoursConfig?.data?.maxValue
    ? 100000
    : parseInt(plannedHoursConfig.data.maxValue, 10);

  const maxActualHours = actualHoursConfigLoading
    ? 24
    : actualHoursConfigError || !actualHoursConfig?.data?.maxValue
    ? 100000
    : parseInt(actualHoursConfig.data.maxValue, 10);

  const maxPlannedCost = plannedCostConfigLoading
    ? 1000000
    : plannedCostConfigError || !plannedCostConfig?.data?.maxValue
    ? 10000000000
    : parseInt(plannedCostConfig.data.maxValue, 10);

  const maxActualCost = actualCostConfigLoading
    ? 1000000
    : actualCostConfigError || !actualCostConfig?.data?.maxValue
    ? 10000000000
    : parseInt(actualCostConfig.data.maxValue, 10);

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

  const handleTaskPercentCompleteBlur = async (taskId: string, percent: number) => {
    if (percent < 0 || percent > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Percent complete must be between 0 and 100.',
      });
      return;
    }
    const formattedPercent = Number(percent.toFixed(2));
    console.log(`Frontend sending task ${taskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
    try {
      setIsRefetching(true);
      await updatePercentComplete({
        id: taskId,
        percentComplete: formattedPercent,
        createdBy: accountId,
      }).unwrap();
      setEditedCells((prev) => ({ ...prev, [`${taskId}-percentComplete`]: formattedPercent }));
      await refetchProject();
      console.log(
        'Task percent complete updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update task percent complete', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update percent complete.',
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskPercentCompleteBlur = async (subtaskId: string, taskId: string, percent: number) => {
    if (percent < 0 || percent > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Percent complete must be between 0 and 100.',
      });
      return;
    }
    const formattedPercent = Number(percent.toFixed(2));
    console.log(`Frontend sending subtask ${subtaskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
    try {
      setIsRefetching(true);
      await updateSubtaskPercentComplete({
        id: subtaskId,
        percentComplete: formattedPercent,
        createdBy: accountId,
      }).unwrap();
      setEditedCells((prev) => ({ ...prev, [`${subtaskId}-percentComplete-subtask`]: formattedPercent }));
      await refetchProject();
      console.log(
        'Subtask percent complete updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update subtask percent complete', err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update percent complete.',
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
    if (hours < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Planned hours cannot be negative.',
      });
      return;
    }
    if (hours > maxPlannedHours) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Planned hours cannot be negative.',
      });
      return;
    }
    if (hours > maxPlannedHours) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Actual hours cannot be negative.',
      });
      return;
    }
    if (hours > maxActualHours) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Actual hours cannot exceed ${maxActualHours} hours.`,
      });
      return;
    }
    const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
    if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
      Swal.fire({
        icon: 'error',
        title: 'No Assignee',
        text: 'Cannot update actual hours: No assignee found for this subtask.',
      });
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

  const handleTaskPlannedCostBlur = async (taskId: string, cost: number) => {
    if (cost < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Planned cost cannot be negative.',
      });
      return;
    }
    if (cost > maxPlannedCost) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Planned cost cannot exceed ${maxPlannedCost} VNĐ.`,
      });
      return;
    }
    const formattedCost = Number(cost.toFixed(2));
    console.log(`Frontend sending task ${taskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
    try {
      setIsRefetching(true);
      await updatePlannedCost({
        id: taskId,
        plannedCost: formattedCost,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Task planned cost updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update task planned cost', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleTaskActualCostBlur = async (taskId: string, cost: number) => {
    if (cost < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Actual cost cannot be negative.',
      });
      return;
    }
    if (cost > maxActualCost) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Actual cost cannot exceed ${maxActualCost} VNĐ.`,
      });
      return;
    }
    const assignmentsForTask = allTaskAssignments[taskId] || [];
    if (assignmentsForTask.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Assignees',
        text: 'Cannot update actual cost: No assignees found for this task.',
      });
      return;
    }
    const formattedCost = Number(cost.toFixed(2));
    console.log(`Frontend sending task ${taskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
    try {
      setIsRefetching(true);
      await updateActualCost({
        id: taskId,
        actualCost: formattedCost,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Task actual cost updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update task actual cost', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskPlannedCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
    if (cost < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Planned cost cannot be negative.',
      });
      return;
    }
    if (cost > maxPlannedCost) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Planned cost cannot exceed ${maxPlannedCost} VNĐ.`,
      });
      return;
    }
    const formattedCost = Number(cost.toFixed(2));
    console.log(`Frontend sending subtask ${subtaskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
    try {
      setIsRefetching(true);
      await updateSubtaskPlannedCost({
        id: subtaskId,
        plannedCost: formattedCost,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Subtask planned cost updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update subtask planned cost', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskActualCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
    if (cost < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Actual cost cannot be negative.',
      });
      return;
    }
    if (cost > maxActualCost) {
      Swal.fire({
        icon: 'error',
        title: 'Limit Exceeded',
        text: `Actual cost cannot exceed ${maxActualCost} VNĐ.`,
      });
      return;
    }
    const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
    if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
      Swal.fire({
        icon: 'error',
        title: 'No Assignee',
        text: 'Cannot update actual cost: No assignee found for this subtask.',
      });
      return;
    }
    const formattedCost = Number(cost.toFixed(2));
    console.log(`Frontend sending subtask ${subtaskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
    try {
      setIsRefetching(true);
      await updateSubtaskActualCost({
        id: subtaskId,
        actualCost: formattedCost,
        createdBy: accountId,
      }).unwrap();
      await refetchProject();
      console.log(
        'Subtask actual cost updated, refetched data:',
        data?.data?.tasks.find((t) => t.id === taskId)
      );
    } catch (err) {
      console.error('Failed to update subtask actual cost', err);
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

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const exportData = [];
      exportData.push([
        'ID',
        'Title',
        'Sprint',
        'Status',
        'Planned Start',
        'Planned End',
        'Actual Start',
        'Actual End',
        'Planned Hours',
        'Actual Hours',
        'Planned Resource Cost',
        'Actual Resource Cost',
        'Planned Cost',
        'Actual Cost',
        'Percent Complete',
        'Assigned',
      ]);

      tasks.forEach((task) => {
        exportData.push([
          task.id,
          task.title,
          task.sprintName || 'No Sprint',
          editedCells[`${task.id}-status`] || task.status || '',
          task.plannedStartDate?.split('T')[0] || '-',
          task.plannedEndDate?.split('T')[0] || '-',
          task.actualStartDate?.split('T')[0] || '-',
          task.actualEndDate?.split('T')[0] || '-',
          (editedCells[`${task.id}-plannedHours`] ?? task.plannedHours ?? 0).toString(),
          (task.actualHours ?? 0).toString(),
          formatCost(task.plannedResourceCost ?? task.plannedCost),
          formatCost(task.actualResourceCost ?? task.actualCost),
          formatCost(task.plannedCost),
          formatCost(task.actualCost),
          (editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0) + '%',
          getAssignedNames(task.id),
        ]);

        if (task.subtasks?.length) {
          task.subtasks.forEach((subtask) => {
            exportData.push([
              `    ${subtask.id}`,
              `    ${subtask.title}`,
              task.sprintName || 'No Sprint',
              editedCells[`${subtask.id}-status-subtask`] || subtask.status || '',
              subtask.plannedStartDate?.split('T')[0] || '-',
              subtask.plannedEndDate?.split('T')[0] || '-',
              subtask.actualStartDate?.split('T')[0] || '-',
              subtask.actualEndDate?.split('T')[0] || '-',
              (editedCells[`${subtask.id}-plannedHours-subtask`] ?? subtask.plannedHours ?? 0).toString(),
              (editedCells[`${subtask.id}-actualHours-subtask`] ?? subtask.actualHours ?? 0).toString(),
              formatCost(subtask.plannedResourceCost ?? subtask.plannedCost),
              formatCost(subtask.actualResourceCost ?? subtask.actualCost),
              formatCost(subtask.plannedCost),
              formatCost(subtask.actualCost),
              (editedCells[`${subtask.id}-percentComplete-subtask`] ?? subtask.percentComplete ?? 0) + '%',
              subtask.assignedFullName || subtask.assignedUsername || '-',
            ]);
          });
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tasks and Subtasks');
      XLSX.writeFile(wb, `project-${projectKey}-tasks.xlsx`);
    } catch (err) {
      console.error('Failed to export to Excel:', err);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Error exporting to Excel. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">Error loading data</div>;

  const columnWidths = {
    id: 200,
    title: 200,
    sprint: 150,
    status: 120,
    plannedStartDate: 120,
    plannedEndDate: 120,
    actualStartDate: 120,
    actualEndDate: 120,
    plannedHours: 100,
    actualHours: 100,
    plannedResourceCost: 120,
    actualResourceCost: 120,
    plannedCost: 120,
    actualCost: 120,
    percentComplete: 120,
    assignedBy: 100,
  };

  const ResizableHeader = ({ children, width, onResize, isSticky, left, ...props }: any) => (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th
        {...props}
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          position: isSticky ? 'sticky' : 'relative',
          left: isSticky ? left : undefined,
          zIndex: isSticky ? 30 : 10,
          backgroundColor: isSticky ? '#f9fafb' : undefined,
          borderRight: isSticky ? '1px solid #d1d5db' : undefined,
        }}
        className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100"
      >
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
    <div className='container mx-auto p-8'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-4'>
          <label className='text-sm font-semibold text-gray-800'>Filter by Sprint:</label>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm'
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
        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className={`flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
            isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
          }`}
        >
          <FileSpreadsheet className='w-5 h-5 mr-3' />
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>
      {isRefetching && (
        <div className='flex justify-center mb-6'>
          <div className='w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      )}
      <div className='overflow-x-auto overflow-y-auto max-h-[70vh] shadow-2xl rounded-xl border border-gray-200'>
        <table className='min-w-full bg-white divide-y divide-gray-200 table-fixed'>
          <thead className='sticky top-0 z-20 bg-white shadow-md'>
            <tr className='bg-gradient-to-r from-gray-50 to-gray-100'>
              <ResizableHeader
                width={columnWidths.id}
                onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
                isSticky={true}
                left={0}
              >
                ID
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.title}
                onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
                isSticky={true}
                left={columnWidths.id}
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
                width={columnWidths.plannedResourceCost}
                onResize={(e: any, { size }: any) => (columnWidths.plannedResourceCost = size.width)}
              >
                Planned Resource Cost
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualResourceCost}
                onResize={(e: any, { size }: any) => (columnWidths.actualResourceCost = size.width)}
              >
                Actual Resource Cost
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
          <tbody className='divide-y divide-gray-200'>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className='hover:bg-indigo-50 transition-all duration-200'>
                  <td
                    className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold cursor-pointer' : ''}`}
                    onClick={() => task.subtasks?.length && toggleTaskExpand(task.id)}
                    style={{ position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
                  >
                    {task.subtasks?.length ? (expandedTasks.has(task.id) ? '−' : '+') : ''} {task.id}
                  </td>
                  <td
                    className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}
                    style={{ position: 'sticky', left: columnWidths.id, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
                  >
                    {task.title}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.sprintName || 'No Sprint'}
                  </td>
                  <td className='border-b border-gray-200 p-4 text-sm'>
                    <select
                      value={editedCells[`${task.id}-status`] || task.status || ''}
                      onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
                      onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
                      className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                    >
                      {taskStatusOptions?.data.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.plannedStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.plannedEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.actualStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {task.actualEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border-b border-gray-200 p-4 text-sm'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-plannedHours`] ?? (task.plannedHours ?? 0)}
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
                      }
                      onBlur={(e) =>
                        handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                      disabled={!!task.subtasks?.length}
                      min='0'
                      step='1'
                    />
                  </td>
                  <td
                    className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
                    onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
                  >
                    {task.actualHours ?? 0}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {formatCost(task.plannedResourceCost ?? 0)}
                  </td>
                  <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
                    {formatCost(task.actualResourceCost ?? 0)}
                  </td>
                  <td className='border-b border-gray-200 p-4 text-sm'>
                    {task.subtasks?.length ? (
                      <span className={task.subtasks?.length ? 'font-bold' : ''}>
                        {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.plannedCost ?? 0), 0))} (Managed by subtasks)
                      </span>
                    ) : (
                      <input
                        type='number'
                        value={editedCells[`${task.id}-plannedCost`] ?? (task.plannedCost ?? 0)}
                        onChange={(e) =>
                          handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
                        }
                        onBlur={(e) =>
                          handleTaskPlannedCostBlur(task.id, parseFloat(e.target.value) || 0)
                        }
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                        min='0'
                        step='1'
                      />
                    )}
                  </td>
                  <td className='border-b border-gray-200 p-4 text-sm'>
                    {task.subtasks?.length ? (
                      <span className={task.subtasks?.length ? 'font-bold' : ''}>
                        {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.actualCost ?? 0), 0))} (Managed by subtasks)
                      </span>
                    ) : (
                      <input
                        type='number'
                        value={editedCells[`${task.id}-actualCost`] ?? (task.actualCost ?? 0)}
                        onChange={(e) =>
                          handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
                        }
                        onBlur={(e) =>
                          handleTaskActualCostBlur(task.id, parseFloat(e.target.value) || 0)
                        }
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                        min='0'
                        step='1'
                      />
                    )}
                  </td>
                  <td className='border-b border-gray-200 p-4 text-sm'>
                    {task.subtasks?.length ? (
                      <span className={task.subtasks?.length ? 'font-bold' : ''}>
                        {(editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0)}% (Managed by subtasks)
                      </span>
                    ) : (
                      <input
                        type='number'
                        value={editedCells[`${task.id}-percentComplete`] ?? (task.percentComplete ?? 0)}
                        onChange={(e) =>
                          handleCellChange(task.id, 'percentComplete', parseFloat(e.target.value) || 0)
                        }
                        onBlur={(e) =>
                          handleTaskPercentCompleteBlur(task.id, parseFloat(e.target.value) || 0)
                        }
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                        min='0'
                        max='100'
                        step='1'
                      />
                    )}
                  </td>
                  <td
                    className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
                    onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
                  >
                    {getAssignedNames(task.id)}
                  </td>
                </tr>
                {expandedTasks.has(task.id) &&
                  task.subtasks?.map((subtask) => (
                    <tr key={subtask.id} className='hover:bg-indigo-50 transition-all duration-200'>
                      <td
                        className='border-b border-gray-200 p-4 text-sm pl-10'
                        style={{ position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
                      >
                        {subtask.id}
                      </td>
                      <td
                        className='border-b border-gray-200 p-4 text-sm'
                        style={{ position: 'sticky', left: columnWidths.id, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
                      >
                        {subtask.title}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>{task.sprintName || 'No Sprint'}</td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <select
                          value={editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''}
                          onChange={(e) => handleCellChange(subtask.id, 'status', e.target.value, true)}
                          onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                        >
                          {subtaskStatusOptions?.data.map((opt) => (
                            <option key={opt.id} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {subtask.plannedStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {subtask.plannedEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {subtask.actualStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {subtask.actualEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <input
                          type='number'
                          value={editedCells[`${subtask.id}-plannedHours-subtask`] ?? (subtask.plannedHours ?? 0)}
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'plannedHours', parseFloat(e.target.value) || 0, true)
                          }
                          onBlur={(e) =>
                            handleSubtaskPlannedHoursBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
                          }
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                          min='0'
                          step='1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <input
                          type='number'
                          value={editedCells[`${subtask.id}-actualHours-subtask`] ?? (subtask.actualHours ?? 0)}
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'actualHours', parseFloat(e.target.value) || 0, true)
                          }
                          onBlur={(e) =>
                            handleSubtaskActualHoursBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
                          }
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                          min='0'
                          step='1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {formatCost(subtask.plannedResourceCost ?? 0)}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        {formatCost(subtask.actualResourceCost ?? 0)}
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <input
                          type='number'
                          value={editedCells[`${subtask.id}-plannedCost-subtask`] ?? (subtask.plannedCost ?? 0)}
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'plannedCost', parseFloat(e.target.value) || 0, true)
                          }
                          onBlur={(e) =>
                            handleSubtaskPlannedCostBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
                          }
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                          min='0'
                          step='1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <input
                          type='number'
                          value={editedCells[`${subtask.id}-actualCost-subtask`] ?? (subtask.actualCost ?? 0)}
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'actualCost', parseFloat(e.target.value) || 0, true)
                          }
                          onBlur={(e) =>
                            handleSubtaskActualCostBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
                          }
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                          min='0'
                          step='1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
                        <input
                          type='number'
                          value={editedCells[`${subtask.id}-percentComplete-subtask`] ?? (subtask.percentComplete ?? 0)}
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'percentComplete', parseFloat(e.target.value) || 0, true)
                          }
                          onBlur={(e) =>
                            handleSubtaskPercentCompleteBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
                          }
                          className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
                          min='0'
                          max='100'
                          step='1'
                        />
                      </td>
                      <td className='border-b border-gray-200 p-4 text-sm'>
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



// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation, useUpdatePercentCompleteMutation, useUpdatePlannedCostMutation, useUpdateActualCostMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation, useUpdateSubtaskPercentCompleteMutation, useUpdateSubtaskPlannedCostMutation, useUpdateSubtaskActualCostMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation, useUpdateSubtaskActualHoursMutation } from '../../../services/subtaskApi';
// import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';
// import {
//   useLazyGetTaskAssignmentsByTaskIdQuery,
// } from '../../../services/taskAssignmentApi';
// import WorkLogModal from './WorkLogModal';
// import AssignedByPopup from './AssignedByPopup';
// import { FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
// import Swal from 'sweetalert2';

// interface ExtendedTaskItem extends TaskItem {
//   assignedBy?: string | null;
// }

// const TaskSubtaskSheet: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const {
//     data,
//     isLoading,
//     error,
//     refetch: refetchProject,
//   } = useGetFullProjectDetailsByKeyQuery(projectKey, {
//     skip: !projectKey || projectKey === 'NotFound',
//   });
//   const [tasks, setTasks] = useState<ExtendedTaskItem[]>([]);
//   const [editedCells, setEditedCells] = useState<Record<string, any>>({});
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [updateTaskStatus] = useUpdateTaskStatusMutation();
//   const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [updateSubtaskActualHours] = useUpdateSubtaskActualHoursMutation();
//   const [updatePlannedHours] = useUpdatePlannedHoursMutation();
//   const [updatePercentComplete] = useUpdatePercentCompleteMutation();
//   const [updateSubtaskPercentComplete] = useUpdateSubtaskPercentCompleteMutation();
//   const [updatePlannedCost] = useUpdatePlannedCostMutation();
//   const [updateActualCost] = useUpdateActualCostMutation();
//   const [updateSubtaskPlannedCost] = useUpdateSubtaskPlannedCostMutation();
//   const [updateSubtaskActualCost] = useUpdateSubtaskActualCostMutation();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);
//   const [showWorkLogModal, setShowWorkLogModal] = useState(false);
//   const [showAssignedByPopup, setShowAssignedByPopup] = useState(false);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
//   const [selectedSprint, setSelectedSprint] = useState<string>('All Sprints');
//   const [isExporting, setIsExporting] = useState(false);

//   const { data: plannedHoursConfig, isLoading: plannedHoursConfigLoading, isError: plannedHoursConfigError } = useGetByConfigKeyQuery("planned_hours_limit");
//   const { data: actualHoursConfig, isLoading: actualHoursConfigLoading, isError: actualHoursConfigError } = useGetByConfigKeyQuery("actual_hours_limit");
//   const { data: plannedCostConfig, isLoading: plannedCostConfigLoading, isError: plannedCostConfigError } = useGetByConfigKeyQuery("planned_cost_limit");
//   const { data: actualCostConfig, isLoading: actualCostConfigLoading, isError: actualCostConfigError } = useGetByConfigKeyQuery("actual_cost_limit");

//   const maxPlannedHours = plannedHoursConfigLoading
//     ? 24
//     : plannedHoursConfigError || !plannedHoursConfig?.data?.maxValue
//     ? 100000
//     : parseInt(plannedHoursConfig.data.maxValue, 10);

//   const maxActualHours = actualHoursConfigLoading
//     ? 24
//     : actualHoursConfigError || !actualHoursConfig?.data?.maxValue
//     ? 100000
//     : parseInt(actualHoursConfig.data.maxValue, 10);

//   const maxPlannedCost = plannedCostConfigLoading
//     ? 1000000
//     : plannedCostConfigError || !plannedCostConfig?.data?.maxValue
//     ? 10000000000
//     : parseInt(plannedCostConfig.data.maxValue, 10);

//   const maxActualCost = actualCostConfigLoading
//     ? 1000000
//     : actualCostConfigError || !actualCostConfig?.data?.maxValue
//     ? 10000000000
//     : parseInt(actualCostConfig.data.maxValue, 10);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
//   const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

//   useEffect(() => {
//     if (!isLoading && !error && projectKey !== 'NotFound') {
//       refetchProject();
//     }
//   }, [refetchProject, isLoading, error, projectKey]);

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       const filteredTasks = selectedSprint === 'All Sprints'
//         ? data.data.tasks
//         : data.data.tasks.filter(task => task.sprintName === selectedSprint || (!task.sprintName && selectedSprint === 'No Sprint'));
//       setTasks(filteredTasks as ExtendedTaskItem[]);
//       data.data.tasks.forEach((task) => {
//         trigger(task.id, true)
//           .unwrap()
//           .then((assignments) => {
//             setAllTaskAssignments((prev) => ({
//               ...prev,
//               [task.id]: assignments,
//             }));
//           })
//           .catch((error) => console.error(`Failed to fetch assignments for ${task.id}:`, error));
//       });
//     }
//   }, [data, trigger, selectedSprint]);

//   useEffect(() => {
//     if (dynamicAssignments && selectedTaskId) {
//       setAllTaskAssignments((prev) => ({
//         ...prev,
//         [selectedTaskId]: dynamicAssignments,
//       }));
//     }
//   }, [dynamicAssignments, selectedTaskId]);

//   const handleCellChange = (itemId: string, field: string, value: any, isSubtask?: boolean) => {
//     const key = `${itemId}-${field}${isSubtask ? '-subtask' : ''}`;
//     setEditedCells((prev) => ({ ...prev, [key]: value }));
//   };

//   const toggleTaskExpand = (taskId: string) => {
//     setExpandedTasks((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(taskId)) newSet.delete(taskId);
//       else newSet.add(taskId);
//       return newSet;
//     });
//   };

//   const handleTaskStatusBlur = async (taskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateTaskStatus({
//         id: taskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
//       await refetchProject();
//       console.log(
//         'Task status updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskStatusBlur = async (subtaskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateSubtaskStatus({
//         id: subtaskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({
//         ...prev,
//         [`${subtaskId}-status-subtask`]: newStatus,
//         ...(newStatus === 'DONE' && { [`${subtaskId}-percentComplete-subtask`]: 100 }),
//       }));
//       await refetchProject();
//       console.log(
//         'Subtask status updated, refetched data:',
//         data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPercentCompleteBlur = async (taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Percent complete must be between 0 and 100.',
//       });
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updatePercentComplete({
//         id: taskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-percentComplete`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Task percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task percent complete', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update percent complete.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPercentCompleteBlur = async (subtaskId: string, taskId: string, percent: number) => {
//     if (percent < 0 || percent > 100) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Percent complete must be between 0 and 100.',
//       });
//       return;
//     }
//     const formattedPercent = Number(percent.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with percentComplete: ${formattedPercent}, type: ${typeof formattedPercent}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPercentComplete({
//         id: subtaskId,
//         percentComplete: formattedPercent,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${subtaskId}-percentComplete-subtask`]: formattedPercent }));
//       await refetchProject();
//       console.log(
//         'Subtask percent complete updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask percent complete', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update percent complete.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       const result = await updatePlannedHours({
//         id: taskId,
//         plannedHours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       console.log('API response:', result);
//       await refetchProject();
//       console.log(
//         'Task planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxPlannedHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned hours cannot exceed ${maxPlannedHours} hours.`,
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask planned hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualHoursBlur = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual hours cannot be negative.',
//       });
//       return;
//     }
//     if (hours > maxActualHours) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual hours cannot exceed ${maxActualHours} hours.`,
//       });
//       return;
//     }
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignee',
//         text: 'Cannot update actual hours: No assignee found for this subtask.',
//       });
//       return;
//     }
//     const formattedHours = Number(hours.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualHours: ${formattedHours}, type: ${typeof formattedHours}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualHours({
//         id: subtaskId,
//         hours: formattedHours,
//         createdBy: accountId,
//       }).unwrap();
//       await refetchProject();
//       console.log(
//         'Subtask actual hours updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual hours', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskPlannedCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned cost cannot exceed ${maxPlannedCost.toLocaleString('vi-VN')} VNĐ.`,
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updatePlannedCost({
//         id: taskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-plannedCost`]: formattedCost }));
//       await refetchProject();
//       console.log(
//         'Task planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task planned cost', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update planned cost.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleTaskActualCostBlur = async (taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxActualCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual cost cannot exceed ${maxActualCost.toLocaleString('vi-VN')} VNĐ.`,
//       });
//       return;
//     }
//     const assignmentsForTask = allTaskAssignments[taskId] || [];
//     if (assignmentsForTask.length === 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignees',
//         text: 'Cannot update actual cost: No assignees found for this task.',
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending task ${taskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateActualCost({
//         id: taskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-actualCost`]: formattedCost }));
//       await refetchProject();
//       console.log(
//         'Task actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update task actual cost', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update actual cost.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskPlannedCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Planned cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxPlannedCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Planned cost cannot exceed ${maxPlannedCost.toLocaleString('vi-VN')} VNĐ.`,
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with plannedCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedCost({
//         id: subtaskId,
//         plannedCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${subtaskId}-plannedCost-subtask`]: formattedCost }));
//       await refetchProject();
//       console.log(
//         'Subtask planned cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask planned cost', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update planned cost.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskActualCostBlur = async (subtaskId: string, taskId: string, cost: number) => {
//     if (cost < 0) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Input',
//         text: 'Actual cost cannot be negative.',
//       });
//       return;
//     }
//     if (cost > maxActualCost) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Limit Exceeded',
//         text: `Actual cost cannot exceed ${maxActualCost.toLocaleString('vi-VN')} VNĐ.`,
//       });
//       return;
//     }
//     const subtask = data?.data?.tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
//     if (!subtask?.assignedFullName && !subtask?.assignedUsername) {
//       Swal.fire({
//         icon: 'error',
//         title: 'No Assignee',
//         text: 'Cannot update actual cost: No assignee found for this subtask.',
//       });
//       return;
//     }
//     const formattedCost = Number(cost.toFixed(2));
//     console.log(`Frontend sending subtask ${subtaskId} with actualCost: ${formattedCost}, type: ${typeof formattedCost}`);
//     try {
//       setIsRefetching(true);
//       await updateSubtaskActualCost({
//         id: subtaskId,
//         actualCost: formattedCost,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${subtaskId}-actualCost-subtask`]: formattedCost }));
//       await refetchProject();
//       console.log(
//         'Subtask actual cost updated, refetched data:',
//         data?.data?.tasks.find((t) => t.id === taskId)
//       );
//     } catch (err) {
//       console.error('Failed to update subtask actual cost', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Update Failed',
//         text: 'Failed to update actual cost.',
//       });
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleOpenWorkLogModal = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowWorkLogModal(true);
//   };

//   const handleOpenAssignedByPopup = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowAssignedByPopup(true);
//   };

//   const formatCost = (cost: number | null, forInput: boolean = false) => {
//     if (cost == null) return forInput ? '0' : '0 VNĐ';
//     return forInput ? cost.toString() : `${cost.toLocaleString('vi-VN')} VNĐ`;
//   };

//   const handleExportExcel = () => {
//     setIsExporting(true);
//     try {
//       const exportData = [];
//       exportData.push([
//         'ID',
//         'Title',
//         'Sprint',
//         'Status',
//         'Planned Start',
//         'Planned End',
//         'Actual Start',
//         'Actual End',
//         'Planned Hours',
//         'Actual Hours',
//         'Planned Resource Cost',
//         'Actual Resource Cost',
//         'Planned Cost',
//         'Actual Cost',
//         'Percent Complete',
//         'Assigned',
//       ]);

//       tasks.forEach((task) => {
//         exportData.push([
//           task.id,
//           task.title,
//           task.sprintName || 'No Sprint',
//           editedCells[`${task.id}-status`] || task.status || '',
//           task.plannedStartDate?.split('T')[0] || '-',
//           task.plannedEndDate?.split('T')[0] || '-',
//           task.actualStartDate?.split('T')[0] || '-',
//           task.actualEndDate?.split('T')[0] || '-',
//           (editedCells[`${task.id}-plannedHours`] ?? task.plannedHours ?? 0).toString(),
//           (task.actualHours ?? 0).toString(),
//           formatCost(task.plannedResourceCost ?? task.plannedCost),
//           formatCost(task.actualResourceCost ?? task.actualCost),
//           formatCost(task.plannedCost),
//           formatCost(task.actualCost),
//           (editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0) + '%',
//           getAssignedNames(task.id),
//         ]);

//         if (task.subtasks?.length) {
//           task.subtasks.forEach((subtask) => {
//             exportData.push([
//               `    ${subtask.id}`,
//               `    ${subtask.title}`,
//               task.sprintName || 'No Sprint',
//               editedCells[`${subtask.id}-status-subtask`] || subtask.status || '',
//               subtask.plannedStartDate?.split('T')[0] || '-',
//               subtask.plannedEndDate?.split('T')[0] || '-',
//               subtask.actualStartDate?.split('T')[0] || '-',
//               subtask.actualEndDate?.split('T')[0] || '-',
//               (editedCells[`${subtask.id}-plannedHours-subtask`] ?? subtask.plannedHours ?? 0).toString(),
//               (editedCells[`${subtask.id}-actualHours-subtask`] ?? subtask.actualHours ?? 0).toString(),
//               formatCost(subtask.plannedResourceCost ?? subtask.plannedCost),
//               formatCost(subtask.actualResourceCost ?? subtask.actualCost),
//               formatCost(subtask.plannedCost),
//               formatCost(subtask.actualCost),
//               (editedCells[`${subtask.id}-percentComplete-subtask`] ?? subtask.percentComplete ?? 0) + '%',
//               subtask.assignedFullName || subtask.assignedUsername || '-',
//             ]);
//           });
//         }
//       });

//       const ws = XLSX.utils.aoa_to_sheet(exportData);
//       ws['!cols'] = [
//         { wch: 15 },
//         { wch: 30 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 12 },
//         { wch: 12 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 15 },
//         { wch: 20 },
//       ];

//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Tasks and Subtasks');
//       XLSX.writeFile(wb, `project-${projectKey}-tasks.xlsx`);
//     } catch (err) {
//       console.error('Failed to export to Excel:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Export Failed',
//         text: 'Error exporting to Excel. Please try again.',
//       });
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div className="text-center text-gray-600">Loading...</div>;
//   if (error) return <div className="text-center text-red-600">Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     sprint: 150,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedResourceCost: 120,
//     actualResourceCost: 120,
//     plannedCost: 120,
//     actualCost: 120,
//     percentComplete: 120,
//     assignedBy: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, isSticky, left, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th
//         {...props}
//         style={{
//           width,
//           minWidth: width,
//           maxWidth: width,
//           position: isSticky ? 'sticky' : 'relative',
//           left: isSticky ? left : undefined,
//           zIndex: isSticky ? 30 : 10,
//           backgroundColor: isSticky ? '#f9fafb' : undefined,
//           borderRight: isSticky ? '1px solid #d1d5db' : undefined,
//         }}
//         className="border-b border-gray-300 p-4 text-left text-sm font-semibold text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100"
//       >
//         {children}
//       </th>
//     </Resizable>
//   );

//   const getAssignedNames = (itemId: string) => {
//     const assignmentsForTask = allTaskAssignments[itemId] || [];
//     return assignmentsForTask.length > 0
//       ? assignmentsForTask.map((a) => a.accountFullname).join(', ')
//       : '-';
//   };

//   const sprintOptions = ['All Sprints', ...(data?.data?.sprints?.map(sprint => sprint.name) || []), 'No Sprint'];

//   return (
//     <div className='container mx-auto p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl'>
//       <div className='flex justify-between items-center mb-6'>
//         <div className='flex items-center space-x-4'>
//           <label className='text-sm font-semibold text-gray-800'>Filter by Sprint:</label>
//           <select
//             value={selectedSprint}
//             onChange={(e) => setSelectedSprint(e.target.value)}
//             className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm'
//           >
//             {sprintOptions.length > 1 ? (
//               sprintOptions.map((sprint, index) => (
//                 <option key={index} value={sprint}>
//                   {sprint}
//                 </option>
//               ))
//             ) : (
//               <option value="No Sprint">No sprints available</option>
//             )}
//           </select>
//         </div>
//         <button
//           onClick={handleExportExcel}
//           disabled={isExporting}
//           className={`flex items-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
//             isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
//           }`}
//         >
//           <FileSpreadsheet className='w-5 h-5 mr-3' />
//           {isExporting ? 'Exporting...' : 'Export Excel'}
//         </button>
//       </div>
//       {isRefetching && (
//         <div className='flex justify-center mb-6'>
//           <div className='w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin'></div>
//         </div>
//       )}
//       <div className='overflow-x-auto overflow-y-auto max-h-[70vh] shadow-2xl rounded-xl border border-gray-200'>
//         <table className='min-w-full bg-white divide-y divide-gray-200 table-fixed'>
//           <thead className='sticky top-0 z-20 bg-white shadow-md'>
//             <tr className='bg-gradient-to-r from-gray-50 to-gray-100'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//                 isSticky={true}
//                 left={0}
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//                 isSticky={true}
//                 left={columnWidths.id}
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprint}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprint = size.width)}
//               >
//                 Sprint
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedResourceCost = size.width)}
//               >
//                 Planned Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualResourceCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualResourceCost = size.width)}
//               >
//                 Actual Resource Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//               >
//                 Assigned
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody className='divide-y divide-gray-200'>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-indigo-50 transition-all duration-200'>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold cursor-pointer' : ''}`}
//                     onClick={() => task.subtasks?.length && toggleTaskExpand(task.id)}
//                     style={{ position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
//                   >
//                     {task.subtasks?.length ? (expandedTasks.has(task.id) ? '−' : '+') : ''} {task.id}
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     style={{ position: 'sticky', left: columnWidths.id, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
//                   >
//                     {task.title}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.sprintName || 'No Sprint'}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.plannedEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {task.actualEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] ?? (task.plannedHours ?? 0)}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                       disabled={!!task.subtasks?.length}
//                       min='0'
//                       step='1'
//                     />
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
//                   >
//                     {task.actualHours ?? 0}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.plannedResourceCost ?? 0)}
//                   </td>
//                   <td className={`border-b border-gray-200 p-4 text-sm ${task.subtasks?.length ? 'font-bold' : ''}`}>
//                     {formatCost(task.actualResourceCost ?? 0)}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.plannedCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={formatCost(editedCells[`${task.id}-plannedCost`] ?? (task.plannedCost ?? 0), true)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPlannedCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {formatCost(task.subtasks.reduce((sum, sub) => sum + (sub.actualCost ?? 0), 0))} (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={formatCost(editedCells[`${task.id}-actualCost`] ?? (task.actualCost ?? 0), true)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskActualCostBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td className='border-b border-gray-200 p-4 text-sm'>
//                     {task.subtasks?.length ? (
//                       <span className={task.subtasks?.length ? 'font-bold' : ''}>
//                         {(editedCells[`${task.id}-percentComplete`] ?? task.percentComplete ?? 0)}% (Managed by subtasks)
//                       </span>
//                     ) : (
//                       <input
//                         type='number'
//                         value={editedCells[`${task.id}-percentComplete`] ?? (task.percentComplete ?? 0)}
//                         onChange={(e) =>
//                           handleCellChange(task.id, 'percentComplete', parseFloat(e.target.value) || 0)
//                         }
//                         onBlur={(e) =>
//                           handleTaskPercentCompleteBlur(task.id, parseFloat(e.target.value) || 0)
//                         }
//                         className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         min='0'
//                         max='100'
//                         step='1'
//                       />
//                     )}
//                   </td>
//                   <td
//                     className={`border-b border-gray-200 p-4 text-sm ${!task.subtasks?.length ? 'cursor-pointer text-indigo-600 hover:underline' : ''} ${task.subtasks?.length ? 'font-bold' : ''}`}
//                     onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
//                   >
//                     {getAssignedNames(task.id)}
//                   </td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-indigo-50 transition-all duration-200'>
//                       <td
//                         className='border-b border-gray-200 p-4 text-sm pl-10'
//                         style={{ position: 'sticky', left: 0, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
//                       >
//                         {subtask.id}
//                       </td>
//                       <td
//                         className='border-b border-gray-200 p-4 text-sm'
//                         style={{ position: 'sticky', left: columnWidths.id, zIndex: 15, backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db' }}
//                       >
//                         {subtask.title}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>{task.sprintName || 'No Sprint'}</td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <select
//                           value={editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''}
//                           onChange={(e) => handleCellChange(subtask.id, 'status', e.target.value, true)}
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.plannedStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.plannedEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.actualStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.actualEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-plannedHours-subtask`] ?? (subtask.plannedHours ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedHours', parseFloat(e.target.value) || 0, true)
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedHoursBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-actualHours-subtask`] ?? (subtask.actualHours ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualHours', parseFloat(e.target.value) || 0, true)
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualHoursBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {formatCost(subtask.plannedResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {formatCost(subtask.actualResourceCost ?? 0)}
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={formatCost(editedCells[`${subtask.id}-plannedCost-subtask`] ?? (subtask.plannedCost ?? 0), true)}
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedCost', parseFloat(e.target.value) || 0, true)
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPlannedCostBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={formatCost(editedCells[`${subtask.id}-actualCost-subtask`] ?? (subtask.actualCost ?? 0), true)}
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualCost', parseFloat(e.target.value) || 0, true)
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskActualCostBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         <input
//                           type='number'
//                           value={editedCells[`${subtask.id}-percentComplete-subtask`] ?? (subtask.percentComplete ?? 0)}
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'percentComplete', parseFloat(e.target.value) || 0, true)
//                           }
//                           onBlur={(e) =>
//                             handleSubtaskPercentCompleteBlur(subtask.id, task.id, parseFloat(e.target.value) || 0)
//                           }
//                           className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm'
//                           min='0'
//                           max='100'
//                           step='1'
//                         />
//                       </td>
//                       <td className='border-b border-gray-200 p-4 text-sm'>
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {showWorkLogModal && (
//         <WorkLogModal
//           open={showWorkLogModal}
//           onClose={() => setShowWorkLogModal(false)}
//           workItemId={selectedTaskId || ''}
//           type='task'
//           onRefetch={refetchProject}
//           onRefetchActivityLogs={() => {}}
//         />
//       )}
//       {showAssignedByPopup && selectedTaskId && (
//         <AssignedByPopup
//           open={showAssignedByPopup}
//           onClose={() => setShowAssignedByPopup(false)}
//           workItemId={selectedTaskId}
//           type='task'
//           onRefetch={refetchProject}
//         />
//       )}
//     </div>
//   );
// };

// export default TaskSubtaskSheet;