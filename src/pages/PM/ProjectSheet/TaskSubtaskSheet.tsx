// import React, { useState, useEffect } from 'react';
// import { Resizable } from 'react-resizable';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
// import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useUpdateSubtaskPlannedHoursMutation } from '../../../services/subtaskApi'; // Add this import
// import type { SubtaskItem } from '../../../services/projectApi';
// import type { TaskItem } from '../../../services/projectApi';
// import { useSearchParams } from 'react-router-dom';

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
//   const [tasks, setTasks] = useState<TaskItem[]>([]);
//   const [editedCells, setEditedCells] = useState<Record<string, any>>({});
//   const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
//   const [updateTaskStatus] = useUpdateTaskStatusMutation();
//   const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation(); // Add mutation
//   const userJson = localStorage.getItem('user');
//   const accountId = userJson ? JSON.parse(userJson).id : null;
//   const [isRefetching, setIsRefetching] = useState(false);

//   const { data: taskStatusOptions, isLoading: loadTaskStatus } =
//     useGetCategoriesByGroupQuery('task_status');
//   const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
//     useGetCategoriesByGroupQuery('subtask_status');

//   useEffect(() => {
//     if (data?.data?.tasks) {
//       setTasks(data.data.tasks);
//       console.log('Tasks updated from data:', data.data.tasks);
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

//   const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
//     try {
//       setIsRefetching(true);
//       const result = await updateTaskStatus({
//         id: taskId,
//         status: newStatus,
//         createdBy: accountId,
//       }).unwrap();
//       setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
//       await refetchProject();
//       console.log('Task status updated, refetched data:', data?.data?.tasks.find((t) => t.id === taskId));
//     } catch (err) {
//       console.error('Failed to update task status', err);
//     } finally {
//       setIsRefetching(false);
//     }
//   };

//   const handleSubtaskStatusChange = async (subtaskId: string, newStatus: string) => {
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

//   const handleSubtaskPlannedHoursChange = async (subtaskId: string, taskId: string, hours: number) => {
//     if (hours < 0) {
//       alert('Planned hours cannot be negative.');
//       return;
//     }

//     try {
//       setIsRefetching(true);
//       await updateSubtaskPlannedHours({
//         id: subtaskId,
//         hours,
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
//       {isRefetching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
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
//                   <td className='border p-2 flex items-center' onClick={() => toggleTaskExpand(task.id)}>
//                     {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
//                   </td>
//                   <td className='border p-2'>{task.title}</td>
//                   <td className='border p-2'>
//                     <select
//                       value={editedCells[`${task.id}-status`] || task.status || ''}
//                       onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
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
//                       onChange={(e) =>
//                         handleCellChange(task.id, 'plannedStartDate', e.target.value)
//                       }
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
//                       className='w-full p-1 border rounded'
//                       disabled={!!task.subtasks?.length}
//                     />
//                   </td>
//                   <td className='border p-2'>-</td>
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
//                           onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
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
//                           onChange={(e) => {
//                             const hours = parseFloat(e.target.value) || 0;
//                             handleCellChange(subtask.id, 'plannedHours', hours, true);
//                             handleSubtaskPlannedHoursChange(subtask.id, task.id, hours);
//                           }}
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
//                           className='w-full p-1 border rounded'
//                           disabled={false}
//                         />
//                       </td>
//                       <td className='border p-2'>{subtask.assignedBy}</td>
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


import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useUpdateTaskStatusMutation } from '../../../services/taskApi';
import { useUpdateSubtaskStatusMutation } from '../../../services/subtaskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useUpdateSubtaskPlannedHoursMutation } from '../../../services/subtaskApi';
import type { SubtaskItem } from '../../../services/projectApi';
import type { TaskItem } from '../../../services/projectApi';
import { useSearchParams } from 'react-router-dom';
import { useGetTaskAssignmentsByTaskIdQuery } from '../../../services/taskAssignmentApi';

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
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [isRefetching, setIsRefetching] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data: taskStatusOptions, isLoading: loadTaskStatus } =
    useGetCategoriesByGroupQuery('task_status');
  const { data: subtaskStatusOptions, isLoading: loadSubtaskStatus } =
    useGetCategoriesByGroupQuery('subtask_status');

  const { data: assignments } = useGetTaskAssignmentsByTaskIdQuery(selectedItemId || '', {
    skip: !selectedItemId,
  });

  useEffect(() => {
    if (data?.data?.tasks) {
      setTasks(data.data.tasks as ExtendedTaskItem[]);
      console.log('Tasks updated from data:', data.data.tasks);
    }
  }, [data]);

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

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setIsRefetching(true);
      const result = await updateTaskStatus({
        id: taskId,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();
      setEditedCells((prev) => ({ ...prev, [`${taskId}-status`]: newStatus }));
      await refetchProject();
      console.log('Task status updated, refetched data:', data?.data?.tasks.find((t) => t.id === taskId));
    } catch (err) {
      console.error('Failed to update task status', err);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: string) => {
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

  const handleSubtaskPlannedHoursChange = async (subtaskId: string, taskId: string, hours: number) => {
    if (hours < 0) {
      alert('Planned hours cannot be negative.');
      return;
    }

    try {
      setIsRefetching(true);
      await updateSubtaskPlannedHours({
        id: subtaskId,
        hours,
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

  const handleAssignedByClick = (itemId: string, hasSubtasks: boolean) => {
    setSelectedItemId(itemId);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedItemId(null);
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

  // Function to get assigned names from assignments
  const getAssignedNames = (itemId: string) => {
    if (!assignments) return '-'; 
    return assignments.map((a) => a.accountFullname).join(', ');
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>
        Task & Subtask Sheet - {data?.data?.name || 'Unknown Project'}
      </h1>
      {isRefetching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
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
                  <td className='border p-2 flex items-center' onClick={() => toggleTaskExpand(task.id)}>
                    {expandedTasks.has(task.id) ? '−' : '+'} {task.id}
                  </td>
                  <td className='border p-2'>{task.title}</td>
                  <td className='border p-2'>
                    <select
                      value={editedCells[`${task.id}-status`] || task.status || ''}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
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
                    <input
                      type='date'
                      value={
                        editedCells[`${task.id}-plannedStartDate`] ||
                        task.plannedStartDate?.split('T')[0] ||
                        ''
                      }
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedStartDate', e.target.value)
                      }
                      className='w-full p-1 border rounded'
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='date'
                      value={
                        editedCells[`${task.id}-plannedEndDate`] ||
                        task.plannedEndDate?.split('T')[0] ||
                        ''
                      }
                      onChange={(e) => handleCellChange(task.id, 'plannedEndDate', e.target.value)}
                      className='w-full p-1 border rounded'
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='date'
                      value={
                        editedCells[`${task.id}-actualStartDate`] ||
                        task.actualStartDate?.split('T')[0] ||
                        ''
                      }
                      onChange={(e) => handleCellChange(task.id, 'actualStartDate', e.target.value)}
                      className='w-full p-1 border rounded'
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='date'
                      value={
                        editedCells[`${task.id}-actualEndDate`] ||
                        task.actualEndDate?.split('T')[0] ||
                        ''
                      }
                      onChange={(e) => handleCellChange(task.id, 'actualEndDate', e.target.value)}
                      className='w-full p-1 border rounded'
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-plannedHours`] || task.plannedHours || ''}
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-actualHours`] || task.actualHours || ''}
                      onChange={(e) =>
                        handleCellChange(task.id, 'actualHours', parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-plannedCost`] || task.plannedCost || ''}
                      onChange={(e) =>
                        handleCellChange(task.id, 'plannedCost', parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={editedCells[`${task.id}-actualCost`] || task.actualCost || ''}
                      onChange={(e) =>
                        handleCellChange(task.id, 'actualCost', parseFloat(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                    />
                  </td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      value={
                        editedCells[`${task.id}-percentComplete`] || task.percentComplete || ''
                      }
                      onChange={(e) =>
                        handleCellChange(task.id, 'percentComplete', parseInt(e.target.value) || 0)
                      }
                      className='w-full p-1 border rounded'
                      disabled={!!task.subtasks?.length}
                    />
                  </td>
                  <td
                    className='border p-2 cursor-pointer text-blue-500 hover:underline'
                    onClick={() => handleAssignedByClick(task.id, !!task.subtasks?.length)}
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
                          onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
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
                        <input
                          type='date'
                          value={
                            editedCells[`${subtask.id}-plannedStartDate-subtask`] ||
                            subtask.plannedStartDate?.split('T')[0] ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'plannedStartDate', e.target.value, true)
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='date'
                          value={
                            editedCells[`${subtask.id}-plannedEndDate-subtask`] ||
                            subtask.plannedEndDate?.split('T')[0] ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'plannedEndDate', e.target.value, true)
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='date'
                          value={
                            editedCells[`${subtask.id}-actualStartDate-subtask`] ||
                            subtask.actualStartDate?.split('T')[0] ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'actualStartDate', e.target.value, true)
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='date'
                          value={
                            editedCells[`${subtask.id}-actualEndDate-subtask`] ||
                            subtask.actualEndDate?.split('T')[0] ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(subtask.id, 'actualEndDate', e.target.value, true)
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-plannedHours-subtask`] ||
                            subtask.plannedHours ||
                            ''
                          }
                          onChange={(e) => {
                            const hours = parseFloat(e.target.value) || 0;
                            handleCellChange(subtask.id, 'plannedHours', hours, true);
                            handleSubtaskPlannedHoursChange(subtask.id, task.id, hours);
                          }}
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
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-plannedCost-subtask`] ||
                            subtask.plannedCost ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(
                              subtask.id,
                              'plannedCost',
                              parseFloat(e.target.value) || 0,
                              true
                            )
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-actualCost-subtask`] ||
                            subtask.actualCost ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(
                              subtask.id,
                              'actualCost',
                              parseFloat(e.target.value) || 0,
                              true
                            )
                          }
                          className='w-full p-1 border rounded'
                        />
                      </td>
                      <td className='border p-2'>
                        <input
                          type='number'
                          value={
                            editedCells[`${subtask.id}-percentComplete-subtask`] ||
                            subtask.percentComplete ||
                            ''
                          }
                          onChange={(e) =>
                            handleCellChange(
                              subtask.id,
                              'percentComplete',
                              parseInt(e.target.value) || 0,
                              true
                            )
                          }
                          className='w-full p-1 border rounded'
                          disabled={false}
                        />
                      </td>
                      <td
                        className='border p-2 cursor-pointer text-blue-500 hover:underline'
                        onClick={() => handleAssignedByClick(subtask.id, false)}
                      >
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

      {showPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded shadow-lg w-1/3'>
            <h2 className='text-xl font-bold mb-2'>Assignments for {selectedItemId}</h2>
            {assignments && assignments.length > 0 ? (
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-2 border'>Name</th>
                    <th className='p-2 border'>Picture</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className='hover:bg-gray-50'>
                      <td className='p-2 border'>{assignment.accountFullname}</td>
                      <td className='p-2 border'>
                        <img
                          src={assignment.accountPicture || 'https://via.placeholder.com/40'} // Fallback for null picture
                          alt={assignment.accountFullname}
                          className='w-10 h-10 rounded-full'
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assignments found.</p>
            )}
            <button
              className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
              onClick={closePopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSubtaskSheet;