// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation } from '../../../services/subtaskApi';
// import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';

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
//   const [updatePlannedHours] = useUpdatePlannedHoursMutation();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       setTasks(data.data.tasks as ExtendedTaskItem[]);
//     }
//   }, [data]);

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

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
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

//   const handleDateBlur = async (itemId: string, field: string, value: string, isSubtask?: boolean) => {
//     console.log(`Updating ${isSubtask ? 'subtask' : 'task'} ${itemId} with ${field}: ${value}`);
//     // Ví dụ: await updateTaskDates({ id: itemId, [field]: value, createdBy: accountId });
//   };

//   const handleNumberBlur = async (itemId: string, field: string, value: number, isSubtask?: boolean) => {
//     console.log(`Updating ${isSubtask ? 'subtask' : 'task'} ${itemId} with ${field}: ${value}`);
//     // Ví dụ: await updateTaskNumbers({ id: itemId, [field]: value, createdBy: accountId });
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div>Loading...</div>;
//   if (error) return <div>Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedCost: 100,
//     actualCost: 100,
//     percentComplete: 120,
//     assignedBy: 100,
//     sprintId: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...props} style={{ width, minWidth: width, maxWidth: width }}>
//         {children}
//       </th>
//     </Resizable>
//   );

//   return (
//     <div className='container mx-auto p-4'>
//       <h1 className='text-2xl font-bold mb-4'>
//         Task & Subtask Sheet - {data?.data?.name || 'Unknown Project'}
//       </h1>
//       {isRefetching && (
//         <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
//       )}
//       <div className='overflow-x-auto'>
//         <table className='min-w-full bg-white border border-gray-200'>
//           <thead>
//             <tr className='bg-gray-100'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//                 className='border p-2'
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//                 className='border p-2'
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//                 className='border p-2'
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//                 className='border p-2'
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//                 className='border p-2'
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//                 className='border p-2'
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//                 className='border p-2'
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//                 className='border p-2'
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//                 className='border p-2'
//               >
//                 Assigned By
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprintId}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprintId = size.width)}
//                 className='border p-2'
//               >
//                 Sprint
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-gray-100 bg-gray-200'>
//                   <td
//                     className='border p-2 flex items-center'
//                     onClick={() => toggleTaskExpand(task.id)}
//                   >
//                     {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
//                   </td>
//                   <td className='border p-2'>{task.title}</td>
//                   <td className='border p-2'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-1 border rounded'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-plannedStartDate`] ||
//                         task.plannedStartDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'plannedStartDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'plannedStartDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-plannedEndDate`] ||
//                         task.plannedEndDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'plannedEndDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'plannedEndDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-actualStartDate`] ||
//                         task.actualStartDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'actualStartDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'actualStartDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-actualEndDate`] ||
//                         task.actualEndDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'actualEndDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'actualEndDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] || task.plannedHours || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-actualHours`] || task.actualHours || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'actualHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'actualHours', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedCost`] || task.plannedCost || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-actualCost`] || task.actualCost || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={
//                         editedCells[`${task.id}-percentComplete`] || task.percentComplete || ''
//                       }
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'percentComplete', parseInt(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'percentComplete', parseInt(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     {task.assignedBy || '-'}
//                   </td>
//                   <td className='border p-2'>{task.sprintId || '-'}</td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-gray-50 bg-blue-50 ml-4'>
//                       <td className='border p-2'>{subtask.id}</td>
//                       <td className='border p-2'>{subtask.title}</td>
//                       <td className='border p-2'>
//                         <select
//                           value={
//                             editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'status', e.target.value, true)
//                           }
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-1 border rounded'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-plannedStartDate-subtask`] ||
//                             subtask.plannedStartDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedStartDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'plannedStartDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-plannedEndDate-subtask`] ||
//                             subtask.plannedEndDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedEndDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'plannedEndDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-actualStartDate-subtask`] ||
//                             subtask.actualStartDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualStartDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'actualStartDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-actualEndDate-subtask`] ||
//                             subtask.actualEndDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualEndDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'actualEndDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedHours-subtask`] ||
//                             subtask.plannedHours ||
//                             ''
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
//                           className='w-full p-1 border rounded'
//                           min='0'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualHours-subtask`] ||
//                             subtask.actualHours ||
//                             ''
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
//                             handleNumberBlur(
//                               subtask.id,
//                               'actualHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedCost-subtask`] ||
//                             subtask.plannedCost ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualCost-subtask`] ||
//                             subtask.actualCost ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-percentComplete-subtask`] ||
//                             subtask.percentComplete ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'percentComplete',
//                               parseInt(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'percentComplete',
//                               parseInt(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                           disabled={false}
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                       <td className='border p-2'>{task.sprintId || '-'}</td>
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TaskSubtaskSheet;

// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation } from '../../../services/subtaskApi';
// import { useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';
// import {
//   useGetTaskAssignmentsByTaskIdQuery,
//   useLazyGetTaskAssignmentsByTaskIdQuery,
// } from '../../../services/taskAssignmentApi';
// import AssignedByPopup from './AssignedByPopup';

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
//   const [updatePlannedHours] = useUpdatePlannedHoursMutation();
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
//   const [selectedItemType, setSelectedItemType] = useState<'task' | 'subtask'>('task');

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
//   const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       setTasks(data.data.tasks as ExtendedTaskItem[]);
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
//   }, [data, trigger]);

//   useEffect(() => {
//     if (dynamicAssignments && selectedItemId) {
//       setAllTaskAssignments((prev) => ({
//         ...prev,
//         [selectedItemId]: dynamicAssignments,
//       }));
//     }
//   }, [dynamicAssignments, selectedItemId]);

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

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
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
//       trigger(taskId, true)
//         .unwrap()
//         .then((assignments) => {
//           console.log(`Refetched assignments for task ${taskId}:`, assignments);
//           setAllTaskAssignments((prev) => ({
//             ...prev,
//             [taskId]: assignments,
//           }));
//         })
//         .catch((error) => console.error(`Failed to refetch assignments for ${taskId}:`, error));
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

//   const handleDateBlur = async (itemId: string, field: string, value: string, isSubtask?: boolean) => {
//     // Giả sử bạn có API để cập nhật ngày, thêm logic gọi API tại đây
//     console.log(`Updating ${isSubtask ? 'subtask' : 'task'} ${itemId} with ${field}: ${value}`);
//     // Ví dụ: await updateTaskDates({ id: itemId, [field]: value, createdBy: accountId });
//   };

//   const handleNumberBlur = async (itemId: string, field: string, value: number, isSubtask?: boolean) => {
//     // Giả sử bạn có API để cập nhật actualHours, plannedCost, actualCost, percentComplete
//     console.log(`Updating ${isSubtask ? 'subtask' : 'task'} ${itemId} with ${field}: ${value}`);
//     // Ví dụ: await updateTaskNumbers({ id: itemId, [field]: value, createdBy: accountId });
//   };

//   const handleAssignedByClick = (itemId: string, hasSubtasks: boolean) => {
//     setSelectedItemType('task');
//     setSelectedItemId(itemId);
//     trigger(itemId, true)
//       .unwrap()
//       .then((assignments) => {
//         setAllTaskAssignments((prev) => ({
//           ...prev,
//           [itemId]: assignments,
//         }));
//         setShowPopup(true);
//       })
//       .catch((error) => console.error(`Failed to fetch assignments for ${itemId}:`, error));
//   };

//   const closePopup = () => {
//     setShowPopup(false);
//     setSelectedItemId(null);
//     setSelectedItemType('task');
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div>Loading...</div>;
//   if (error) return <div>Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedCost: 100,
//     actualCost: 100,
//     percentComplete: 120,
//     assignedBy: 100,
//     sprintId: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...props} style={{ width, minWidth: width, maxWidth: width }}>
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

//   return (
//     <div className='container mx-auto p-4'>
//       <h1 className='text-2xl font-bold mb-4'>
//         Task & Subtask Sheet - {data?.data?.name || 'Unknown Project'}
//       </h1>
//       {isRefetching && (
//         <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
//       )}
//       <div className='overflow-x-auto'>
//         <table className='min-w-full bg-white border border-gray-200'>
//           <thead>
//             <tr className='bg-gray-100'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//                 className='border p-2'
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//                 className='border p-2'
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//                 className='border p-2'
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//                 className='border p-2'
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//                 className='border p-2'
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//                 className='border p-2'
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//                 className='border p-2'
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//                 className='border p-2'
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//                 className='border p-2'
//               >
//                 Assigned By
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprintId}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprintId = size.width)}
//                 className='border p-2'
//               >
//                 Sprint
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-gray-100 bg-gray-200'>
//                   <td
//                     className='border p-2 flex items-center'
//                     onClick={() => toggleTaskExpand(task.id)}
//                   >
//                     {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
//                   </td>
//                   <td className='border p-2'>{task.title}</td>
//                   <td className='border p-2'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-1 border rounded'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-plannedStartDate`] ||
//                         task.plannedStartDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'plannedStartDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'plannedStartDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-plannedEndDate`] ||
//                         task.plannedEndDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'plannedEndDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'plannedEndDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-actualStartDate`] ||
//                         task.actualStartDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'actualStartDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'actualStartDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='date'
//                       value={
//                         editedCells[`${task.id}-actualEndDate`] ||
//                         task.actualEndDate?.split('T')[0] ||
//                         ''
//                       }
//                       onChange={(e) => handleCellChange(task.id, 'actualEndDate', e.target.value)}
//                       onBlur={(e) => handleDateBlur(task.id, 'actualEndDate', e.target.value)}
//                       className='w-full p-1 border rounded'
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] || task.plannedHours || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-actualHours`] || task.actualHours || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'actualHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'actualHours', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedCost`] || task.plannedCost || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-actualCost`] || task.actualCost || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'actualCost', parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={
//                         editedCells[`${task.id}-percentComplete`] || task.percentComplete || ''
//                       }
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'percentComplete', parseInt(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleNumberBlur(task.id, 'percentComplete', parseInt(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td
//                     className='border p-2 cursor-pointer text-blue-500 hover:underline'
//                     onClick={() => handleAssignedByClick(task.id, !!task.subtasks?.length)}
//                   >
//                     {getAssignedNames(task.id)}
//                   </td>
//                   <td className='border p-2'>{task.sprintId || '-'}</td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-gray-50 bg-blue-50 ml-4'>
//                       <td className='border p-2'>{subtask.id}</td>
//                       <td className='border p-2'>{subtask.title}</td>
//                       <td className='border p-2'>
//                         <select
//                           value={
//                             editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'status', e.target.value, true)
//                           }
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-1 border rounded'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-plannedStartDate-subtask`] ||
//                             subtask.plannedStartDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedStartDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'plannedStartDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-plannedEndDate-subtask`] ||
//                             subtask.plannedEndDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'plannedEndDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'plannedEndDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-actualStartDate-subtask`] ||
//                             subtask.actualStartDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualStartDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'actualStartDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='date'
//                           value={
//                             editedCells[`${subtask.id}-actualEndDate-subtask`] ||
//                             subtask.actualEndDate?.split('T')[0] ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'actualEndDate', e.target.value, true)
//                           }
//                           onBlur={(e) =>
//                             handleDateBlur(subtask.id, 'actualEndDate', e.target.value, true)
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedHours-subtask`] ||
//                             subtask.plannedHours ||
//                             ''
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
//                           className='w-full p-1 border rounded'
//                           min='0'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualHours-subtask`] ||
//                             subtask.actualHours ||
//                             ''
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
//                             handleNumberBlur(
//                               subtask.id,
//                               'actualHours',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedCost-subtask`] ||
//                             subtask.plannedCost ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'plannedCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualCost-subtask`] ||
//                             subtask.actualCost ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'actualCost',
//                               parseFloat(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-percentComplete-subtask`] ||
//                             subtask.percentComplete ||
//                             ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(
//                               subtask.id,
//                               'percentComplete',
//                               parseInt(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           onBlur={(e) =>
//                             handleNumberBlur(
//                               subtask.id,
//                               'percentComplete',
//                               parseInt(e.target.value) || 0,
//                               true
//                             )
//                           }
//                           className='w-full p-1 border rounded'
//                           disabled={false}
//                         />
//                       </td>
//                       <td
//                         className='border p-2 cursor-pointer text-blue-500 hover:underline'
//                         onClick={() => handleAssignedByClick(subtask.id, false)}
//                       >
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                       <td className='border p-2'>{task.sprintId || '-'}</td>
//                     </tr>
//                   ))}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showPopup && (
//         <AssignedByPopup
//           open={showPopup}
//           onClose={closePopup}
//           workItemId={selectedItemId || ''}
//           type={selectedItemType}
//           onRefetch={refetchProject}
//           assignments={allTaskAssignments[selectedItemId || ''] || []}
//           isReadOnly={
//             selectedItemType === 'task' &&
//             !!tasks.find((t) => t.id === selectedItemId)?.subtasks?.length
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default TaskSubtaskSheet;



// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
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
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);
//   const [showWorkLogModal, setShowWorkLogModal] = useState(false);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
//   const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       setTasks(data.data.tasks as ExtendedTaskItem[]);
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
//   }, [data, trigger]);

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

//   const handleTaskPlannedHoursBlur = async (taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
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

//   const handleOpenWorkLogModal = (taskId: string) => {
//     setSelectedTaskId(taskId);
//     setShowWorkLogModal(true);
//   };

//   if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div>Loading...</div>;
//   if (error) return <div>Error loading data</div>;

//   const columnWidths = {
//     id: 100,
//     title: 200,
//     status: 120,
//     plannedStartDate: 120,
//     plannedEndDate: 120,
//     actualStartDate: 120,
//     actualEndDate: 120,
//     plannedHours: 100,
//     actualHours: 100,
//     plannedCost: 100,
//     actualCost: 100,
//     percentComplete: 120,
//     assignedBy: 100,
//     sprintId: 100,
//   };

//   const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
//     <Resizable
//       width={width}
//       height={0}
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...props} style={{ width, minWidth: width, maxWidth: width }}>
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

//   return (
//     <div className='container mx-auto p-4'>
//       <h1 className='text-2xl font-bold mb-4'>
//         Task & Subtask Sheet - {data?.data?.name || 'Unknown Project'}
//       </h1>
//       {isRefetching && (
//         <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
//       )}
//       <div className='overflow-x-auto'>
//         <table className='min-w-full bg-white border border-gray-200'>
//           <thead>
//             <tr className='bg-gray-100'>
//               <ResizableHeader
//                 width={columnWidths.id}
//                 onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
//                 className='border p-2'
//               >
//                 ID
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.title}
//                 onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
//                 className='border p-2'
//               >
//                 Title
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.status}
//                 onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
//                 className='border p-2'
//               >
//                 Status
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Planned End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualStartDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual Start
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualEndDate}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
//                 className='border p-2'
//               >
//                 Actual End
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
//                 className='border p-2'
//               >
//                 Planned Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualHours}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
//                 className='border p-2'
//               >
//                 Actual Hours
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.plannedCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
//                 className='border p-2'
//               >
//                 Planned Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.actualCost}
//                 onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
//                 className='border p-2'
//               >
//                 Actual Cost
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.percentComplete}
//                 onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
//                 className='border p-2'
//               >
//                 Percent Complete
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.assignedBy}
//                 onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
//                 className='border p-2'
//               >
//                 Assigned By
//               </ResizableHeader>
//               <ResizableHeader
//                 width={columnWidths.sprintId}
//                 onResize={(e: any, { size }: any) => (columnWidths.sprintId = size.width)}
//                 className='border p-2'
//               >
//                 Sprint
//               </ResizableHeader>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.map((task) => (
//               <React.Fragment key={task.id}>
//                 <tr className='hover:bg-gray-100 bg-gray-200'>
//                   <td
//                     className='border p-2 flex items-center'
//                     onClick={() => toggleTaskExpand(task.id)}
//                   >
//                     {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
//                   </td>
//                   <td className='border p-2'>{task.title}</td>
//                   <td className='border p-2'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
//                       onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
//                       className='w-full p-1 border rounded'
//                     >
//                       {taskStatusOptions?.data.map((opt) => (
//                         <option key={opt.id} value={opt.name}>
//                           {opt.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                   <td className='border p-2'>
//                     {task.plannedStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.plannedEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.actualStartDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.actualEndDate?.split('T')[0] || '-'}
//                   </td>
//                   <td className='border p-2'>
//                     <input
//                       type='number'
//                       value={editedCells[`${task.id}-plannedHours`] || task.plannedHours || ''}
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
//                       }
//                       onBlur={(e) =>
//                         handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
//                       }
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                       min='0'
//                     />
//                   </td>
//                   <td
//                     className='border p-2 cursor-pointer text-blue-500 hover:underline'
//                     onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
//                   >
//                     {task.actualHours || '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.plannedCost ? `${task.plannedCost} VNĐ` : '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.actualCost ? `${task.actualCost} VNĐ` : '-'}
//                   </td>
//                   <td className='border p-2'>
//                     {task.percentComplete ? `${task.percentComplete}%` : '-'}
//                   </td>
//                   <td
//                     className='border p-2 cursor-pointer text-blue-500 hover:underline'
//                     onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
//                   >
//                     {getAssignedNames(task.id)}
//                   </td>
//                   <td className='border p-2'>{task.sprintId || '-'}</td>
//                 </tr>
//                 {expandedTasks.has(task.id) &&
//                   task.subtasks?.map((subtask) => (
//                     <tr key={subtask.id} className='hover:bg-gray-50 bg-blue-50 ml-4'>
//                       <td className='border p-2'>{subtask.id}</td>
//                       <td className='border p-2'>{subtask.title}</td>
//                       <td className='border p-2'>
//                         <select
//                           value={
//                             editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
//                           }
//                           onChange={(e) =>
//                             handleCellChange(subtask.id, 'status', e.target.value, true)
//                           }
//                           onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
//                           className='w-full p-1 border rounded'
//                         >
//                           {subtaskStatusOptions?.data.map((opt) => (
//                             <option key={opt.id} value={opt.name}>
//                               {opt.name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.plannedStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.plannedEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.actualStartDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.actualEndDate?.split('T')[0] || '-'}
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-plannedHours-subtask`] ||
//                             subtask.plannedHours ||
//                             ''
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
//                           className='w-full p-1 border rounded'
//                           min='0'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         <input
//                           type='number'
//                           value={
//                             editedCells[`${subtask.id}-actualHours-subtask`] ||
//                             subtask.actualHours ||
//                             ''
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
//                           className='w-full p-1 border rounded'
//                           min='0'
//                         />
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.plannedCost ? `${subtask.plannedCost} VNĐ` : '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.actualCost ? `${subtask.actualCost} VNĐ` : '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.percentComplete ? `${subtask.percentComplete}%` : '-'}
//                       </td>
//                       <td className='border p-2'>
//                         {subtask.assignedFullName || subtask.assignedUsername || '-'}
//                       </td>
//                       <td className='border p-2'>{task.sprintId || '-'}</td>
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
//     </div>
//   );
// };

// export default TaskSubtaskSheet;


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

  const { data: taskStatusOptions, isLoading: loadTaskStatus } =
    useGetCategoriesByGroupQuery('task_status');
  const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
    useGetCategoriesByGroupQuery('subtask_status');

  const [trigger, { data: dynamicAssignments }] = useLazyGetTaskAssignmentsByTaskIdQuery();
  const [allTaskAssignments, setAllTaskAssignments] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (data?.data?.tasks) {
      setTasks(data.data.tasks as ExtendedTaskItem[]);
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
  }, [data, trigger]);

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

  if (isLoading || loadTaskStatus || loadSubtaskStatus) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const columnWidths = {
    id: 100,
    title: 200,
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
    sprintId: 100,
  };

  const ResizableHeader = ({ children, width, onResize, ...props }: any) => (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...props} style={{ width, minWidth: width, maxWidth: width }}>
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

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>
        Task & Subtask Sheet - {data?.data?.name || 'Unknown Project'}
      </h1>
      {isRefetching && (
        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
      )}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200'>
          <thead>
            <tr className='bg-gray-100'>
              <ResizableHeader
                width={columnWidths.id}
                onResize={(e: any, { size }: any) => (columnWidths.id = size.width)}
                className='border p-2'
              >
                ID
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.title}
                onResize={(e: any, { size }: any) => (columnWidths.title = size.width)}
                className='border p-2'
              >
                Title
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.status}
                onResize={(e: any, { size }: any) => (columnWidths.status = size.width)}
                className='border p-2'
              >
                Status
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedStartDate}
                onResize={(e: any, { size }: any) => (columnWidths.plannedStartDate = size.width)}
                className='border p-2'
              >
                Planned Start
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedEndDate}
                onResize={(e: any, { size }: any) => (columnWidths.plannedEndDate = size.width)}
                className='border p-2'
              >
                Planned End
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualStartDate}
                onResize={(e: any, { size }: any) => (columnWidths.actualStartDate = size.width)}
                className='border p-2'
              >
                Actual Start
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualEndDate}
                onResize={(e: any, { size }: any) => (columnWidths.actualEndDate = size.width)}
                className='border p-2'
              >
                Actual End
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedHours}
                onResize={(e: any, { size }: any) => (columnWidths.plannedHours = size.width)}
                className='border p-2'
              >
                Planned Hours
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualHours}
                onResize={(e: any, { size }: any) => (columnWidths.actualHours = size.width)}
                className='border p-2'
              >
                Actual Hours
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.plannedCost}
                onResize={(e: any, { size }: any) => (columnWidths.plannedCost = size.width)}
                className='border p-2'
              >
                Planned Cost
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.actualCost}
                onResize={(e: any, { size }: any) => (columnWidths.actualCost = size.width)}
                className='border p-2'
              >
                Actual Cost
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.percentComplete}
                onResize={(e: any, { size }: any) => (columnWidths.percentComplete = size.width)}
                className='border p-2'
              >
                Percent Complete
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.assignedBy}
                onResize={(e: any, { size }: any) => (columnWidths.assignedBy = size.width)}
                className='border p-2'
              >
                Assigned By
              </ResizableHeader>
              <ResizableHeader
                width={columnWidths.sprintId}
                onResize={(e: any, { size }: any) => (columnWidths.sprintId = size.width)}
                className='border p-2'
              >
                Sprint
              </ResizableHeader>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className='hover:bg-gray-100 bg-gray-200'>
                  <td
                    className='border p-2 flex items-center'
                    onClick={() => toggleTaskExpand(task.id)}
                  >
                    {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
                  </td>
                  <td className='border p-2'>{task.title}</td>
                  <td className='border p-2'>
                    <select
                      value={editedCells[`${task.id}-status`] || task.status || ''}
                      onChange={(e) => handleCellChange(task.id, 'status', e.target.value)}
                      onBlur={(e) => handleTaskStatusBlur(task.id, e.target.value)}
                      className='w-full p-1 border rounded'
                    >
                      {taskStatusOptions?.data.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='border p-2'>
                    {task.plannedStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border p-2'>
                    {task.plannedEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border p-2'>
                    {task.actualStartDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border p-2'>
                    {task.actualEndDate?.split('T')[0] || '-'}
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-plannedHours`] || task.plannedHours || ''}
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
                      }
                      onBlur={(e) =>
                        handleTaskPlannedHoursBlur(task.id, parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                      min='0'
                    />
                  </td>
                  <td
                    className='border p-2 cursor-pointer text-blue-500 hover:underline'
                    onClick={() => !task.subtasks?.length && handleOpenWorkLogModal(task.id)}
                  >
                    {task.actualHours || '-'}
                  </td>
                  <td className='border p-2'>
                    {task.plannedCost ? `${task.plannedCost} VNĐ` : '-'}
                  </td>
                  <td className='border p-2'>
                    {task.actualCost ? `${task.actualCost} VNĐ` : '-'}
                  </td>
                  <td className='border p-2'>
                    {task.percentComplete ? `${task.percentComplete}%` : '-'}
                  </td>
                  <td
                    className={`border p-2 ${!task.subtasks?.length ? 'cursor-pointer text-blue-500 hover:underline' : ''}`}
                    onClick={() => !task.subtasks?.length && handleOpenAssignedByPopup(task.id)}
                  >
                    {getAssignedNames(task.id)}
                  </td>
                  <td className='border p-2'>{task.sprintId || '-'}</td>
                </tr>
                {expandedTasks.has(task.id) &&
                  task.subtasks?.map((subtask) => (
                    <tr key={subtask.id} className='hover:bg-gray-50 bg-blue-50 ml-4'>
                      <td className='border p-2'>{subtask.id}</td>
                      <td className='border p-2'>{subtask.title}</td>
                      <td className='border p-2'>
                        <select
                          value={
                            editedCells[`${subtask.id}-status-subtask`] || subtask.status || ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'status', e.target.value, true)
                          }
                          onBlur={(e) => handleSubtaskStatusBlur(subtask.id, e.target.value)}
                          className='w-full p-1 border rounded'
                        >
                          {subtaskStatusOptions?.data.map((opt) => (
                            <option key={opt.id} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='border p-2'>
                        {subtask.plannedStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.plannedEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.actualStartDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.actualEndDate?.split('T')[0] || '-'}
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-plannedHours-subtask`] ||
                            subtask.plannedHours ||
                            ''
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
                          className='w-full p-1 border rounded'
                          min='0'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-actualHours-subtask`] ||
                            subtask.actualHours ||
                            ''
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
                          className='w-full p-1 border rounded'
                          min='0'
                        />
                      </td>
                      <td className='border p-2'>
                        {subtask.plannedCost ? `${subtask.plannedCost} VNĐ` : '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.actualCost ? `${subtask.actualCost} VNĐ` : '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.percentComplete ? `${subtask.percentComplete}%` : '-'}
                      </td>
                      <td className='border p-2'>
                        {subtask.assignedFullName || subtask.assignedUsername || '-'}
                      </td>
                      <td className='border p-2'>{task.sprintId || '-'}</td>
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
          // assignments={allTaskAssignments[selectedTaskId] || []}
        />
      )}
    </div>
  );
};

export default TaskSubtaskSheet;