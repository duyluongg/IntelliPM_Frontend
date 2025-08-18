// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskWithSubtasksQuery,
//   useUpdatePlannedHoursMutation,
// } from '../../../services/taskApi';
// import {
//   useGetSubtaskFullDetailedByIdQuery,
//   useUpdateSubtaskPlannedHoursMutation,
// } from '../../../services/subtaskApi';
// import { useGetTaskAssignmentHoursByTaskIdQuery } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
//   onRefetch: () => void;
//   assignments: any[];
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, assignments }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [plannedHours, setPlannedHours] = useState<number>(0);
//   const [editableAssignments, setEditableAssignments] = useState<
//     {
//       accountId: number;
//       hours: number;
//       maxHours: number;
//       accountFullname: string;
//       accountPicture: string | null;
//     }[]
//   >([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskWithSubtasks, refetch: refetchTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: subtaskDetail, refetch: refetchSubtask } = useGetSubtaskFullDetailedByIdQuery(
//     workItemId,
//     {
//       skip: type !== 'subtask',
//     }
//   );

//   const { data: taskAssignments } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task' || (taskWithSubtasks?.subtasks?.length ?? 0) > 0,
//   });

//   const [updateTaskPlannedHours] = useUpdatePlannedHoursMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;

//   useEffect(() => {
//     if (open) {
//       if (type === 'task' && taskWithSubtasks) {
//         setPlannedHours(taskWithSubtasks.plannedHours ?? 0);
//         if (!hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//           }));
//           setEditableAssignments(mapped);
//         } else if (hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//           }));
//           setEditableAssignments(mapped);
//         }
//       } else if (type === 'subtask' && subtaskDetail) {
//         setPlannedHours(subtaskDetail.plannedHours ?? 0);
//         setEditableAssignments([
//           {
//             accountId: subtaskDetail.assignedBy ?? 0,
//             hours: subtaskDetail.plannedHours ?? 0,
//             maxHours: 8,
//             accountFullname: subtaskDetail.assignedFullName || 'Unknown',
//             accountPicture: subtaskDetail.assignedPicture || null,
//           },
//         ]);
//       }
//     }
//   }, [open, type, taskWithSubtasks, subtaskDetail, assignments, hasSubtasks]);

//   const handleHourChange = (accountId: number, hours: number, maxHours: number) => {
//     if (!hasSubtasks && type !== 'task') {
//       setEditableAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, hours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const handlePlannedHoursChange = (hours: number) => {
//     setPlannedHours(hours);
//   };

//   const totalAssignedHours = editableAssignments.reduce((sum, e) => sum + e.hours, 0);
//   const remaining = plannedHours - totalAssignedHours;

//   const handleSave = async () => {
//     setIsUpdating(true);
//     try {
//       if (type === 'task') {
//         await updateTaskPlannedHours({
//           id: workItemId,
//           plannedHours,
//           createdBy: userId,
//         }).unwrap();
//         if (!hasSubtasks) {
//           // Update task assignments
//           for (const assignment of editableAssignments) {
//             // Assume an API call to update task assignment hours
//             // This is a placeholder; replace with actual API call
//             console.log(`Updating assignment for account ${assignment.accountId} with ${assignment.hours} hours`);
//           }
//         }
//       } else {
//         await updateSubtaskPlannedHours({
//           id: workItemId,
//           hours: plannedHours,
//           createdBy: userId,
//         }).unwrap();
//       }
//       onRefetch();
//       onClose();
//     } catch (err) {
//       console.error('Failed to save planned hours', err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         <table className='w-full mb-4'>
//           <thead>
//             <tr>
//               <th className='text-left'>Person</th>
//               <th className='text-left'>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {editableAssignments.map((assignment) => (
//               <tr key={assignment.accountId}>
//                 <td className='flex items-center'>
//                   <img
//                     src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                     alt={assignment.accountFullname}
//                     className='w-8 h-8 rounded-full mr-2'
//                   />
//                   {assignment.accountFullname}
//                 </td>
//                 <td>
//                   <input
//                     type='number'
//                     value={assignment.hours}
//                     onChange={(e) =>
//                       handleHourChange(
//                         assignment.accountId,
//                         Number(e.target.value),
//                         assignment.maxHours
//                       )
//                     }
//                     disabled={hasSubtasks || type === 'task'}
//                     className='w-20 p-1 border rounded'
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <p className='mt-2'>Planned Hours: {plannedHours} hours</p>
//         <p className='mt-2'>Total Assigned: {totalAssignedHours} hours</p>
//         <p className='mt-2'>Remaining: {remaining} hours</p>
//         <div className='flex justify-end mt-4'>
//           <button onClick={handleSave} className='bg-green-500 text-white p-2 rounded mr-2'>
//             Save
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded'>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskWithSubtasksQuery,
//   useUpdatePlannedHoursMutation,
// } from '../../../services/taskApi';
// import {
//   useGetSubtaskFullDetailedByIdQuery,
//   useUpdateSubtaskPlannedHoursMutation,
// } from '../../../services/subtaskApi';
// import { useGetTaskAssignmentHoursByTaskIdQuery, useChangeAssignmentPlannedHoursMutation } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
//   onRefetch: () => void;
//   assignments: any[];
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, assignments }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [plannedHours, setPlannedHours] = useState<number>(0);
//   const [editableAssignments, setEditableAssignments] = useState<
//     {
//       accountId: number;
//       hours: number;
//       maxHours: number;
//       accountFullname: string;
//       accountPicture: string | null;
//       id: number; // Added to track assignment ID
//     }[]
//   >([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskWithSubtasks, refetch: refetchTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: subtaskDetail, refetch: refetchSubtask } = useGetSubtaskFullDetailedByIdQuery(
//     workItemId,
//     {
//       skip: type !== 'subtask',
//     }
//   );

//   const { data: taskAssignments } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task' || (taskWithSubtasks?.subtasks?.length ?? 0) > 0,
//   });

//   const [updateTaskPlannedHours] = useUpdatePlannedHoursMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [changeAssignmentPlannedHours] = useChangeAssignmentPlannedHoursMutation();

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;

//   useEffect(() => {
//     if (open) {
//       if (type === 'task' && taskWithSubtasks) {
//         setPlannedHours(taskWithSubtasks.plannedHours ?? 0);
//         if (!hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id, // Assuming id is available in assignments
//           }));
//           setEditableAssignments(mapped);
//         } else if (hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id,
//           }));
//           setEditableAssignments(mapped);
//         }
//       } else if (type === 'subtask' && subtaskDetail) {
//         setPlannedHours(subtaskDetail.plannedHours ?? 0);
//         setEditableAssignments([
//           {
//             accountId: subtaskDetail.assignedBy ?? 0,
//             hours: subtaskDetail.plannedHours ?? 0,
//             maxHours: 8,
//             accountFullname: subtaskDetail.assignedFullName || 'Unknown',
//             accountPicture: subtaskDetail.assignedPicture || null,
//             id: 0, // Placeholder, adjust if subtask has assignment ID
//           },
//         ]);
//       }
//     }
//   }, [open, type, taskWithSubtasks, subtaskDetail, assignments, hasSubtasks]);

//   const handleHourChange = (accountId: number, hours: number, maxHours: number) => {
//     if (!hasSubtasks && type !== 'task') {
//       setEditableAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, hours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const handlePlannedHoursChange = (hours: number) => {
//     setPlannedHours(hours);
//   };

//   const totalAssignedHours = editableAssignments.reduce((sum, e) => sum + e.hours, 0);
//   const remaining = plannedHours - totalAssignedHours;

//   const handleSave = async () => {
//     setIsUpdating(true);
//     try {
//       if (type === 'task') {
//         await updateTaskPlannedHours({
//           id: workItemId,
//           plannedHours,
//           createdBy: userId,
//         }).unwrap();
//         if (!hasSubtasks) {
//           // Update individual assignment planned hours
//           for (const assignment of editableAssignments) {
//             await changeAssignmentPlannedHours({
//               id: assignment.id,
//               plannedHours: assignment.hours,
//               createdBy: userId,
//             }).unwrap();
//           }
//         }
//       } else {
//         await updateSubtaskPlannedHours({
//           id: workItemId,
//           hours: plannedHours,
//           createdBy: userId,
//         }).unwrap();
//       }
//       onRefetch();
//       onClose();
//     } catch (err) {
//       console.error('Failed to save planned hours', err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         <table className='w-full mb-4'>
//           <thead>
//             <tr>
//               <th className='text-left'>Person</th>
//               <th className='text-left'>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {editableAssignments.map((assignment) => (
//               <tr key={assignment.accountId}>
//                 <td className='flex items-center'>
//                   <img
//                     src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                     alt={assignment.accountFullname}
//                     className='w-8 h-8 rounded-full mr-2'
//                   />
//                   {assignment.accountFullname}
//                 </td>
//                 <td>
//                   <input
//                     type='number'
//                     value={assignment.hours}
//                     onChange={(e) =>
//                       handleHourChange(
//                         assignment.accountId,
//                         Number(e.target.value),
//                         assignment.maxHours
//                       )
//                     }
//                     disabled={hasSubtasks || type === 'task'}
//                     className='w-20 p-1 border rounded'
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <p className='mt-2'>Planned Hours: {plannedHours} hours</p>
//         <p className='mt-2'>Total Assigned: {totalAssignedHours} hours</p>
//         <p className='mt-2'>Remaining: {remaining} hours</p>
//         <div className='flex justify-end mt-4'>
//           <button onClick={handleSave} className='bg-green-500 text-white p-2 rounded mr-2'>
//             Save
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded'>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskWithSubtasksQuery,
//   useUpdatePlannedHoursMutation,
// } from '../../../services/taskApi';
// import {
//   useGetSubtaskFullDetailedByIdQuery,
//   useUpdateSubtaskPlannedHoursMutation,
// } from '../../../services/subtaskApi';
// import { useGetTaskAssignmentHoursByTaskIdQuery, useChangeAssignmentPlannedHoursMutation } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
//   onRefetch: () => void;
//   assignments: any[];
//   isReadOnly?: boolean; // New prop to control read-only mode
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, assignments, isReadOnly = false }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [plannedHours, setPlannedHours] = useState<number>(0);
//   const [editableAssignments, setEditableAssignments] = useState<
//     {
//       accountId: number;
//       hours: number;
//       maxHours: number;
//       accountFullname: string;
//       accountPicture: string | null;
//       id: number; // Added to track assignment ID
//     }[]
//   >([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskWithSubtasks, refetch: refetchTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: subtaskDetail, refetch: refetchSubtask } = useGetSubtaskFullDetailedByIdQuery(
//     workItemId,
//     {
//       skip: type !== 'subtask',
//     }
//   );

//   const { data: taskAssignments } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task' || (taskWithSubtasks?.subtasks?.length ?? 0) > 0,
//   });

//   const [updateTaskPlannedHours] = useUpdatePlannedHoursMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [changeAssignmentPlannedHours] = useChangeAssignmentPlannedHoursMutation();

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;

//   useEffect(() => {
//     if (open) {
//       if (type === 'task' && taskWithSubtasks) {
//         setPlannedHours(taskWithSubtasks.plannedHours ?? 0);
//         if (!hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id, // Assuming id is available in assignments
//           }));
//           setEditableAssignments(mapped);
//         } else if (hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id,
//           }));
//           setEditableAssignments(mapped);
//         }
//       } else if (type === 'subtask' && subtaskDetail) {
//         setPlannedHours(subtaskDetail.plannedHours ?? 0);
//         setEditableAssignments([
//           {
//             accountId: subtaskDetail.assignedBy ?? 0,
//             hours: subtaskDetail.plannedHours ?? 0,
//             maxHours: 8,
//             accountFullname: subtaskDetail.assignedFullName || 'Unknown',
//             accountPicture: subtaskDetail.assignedPicture || null,
//             id: 0, // Placeholder, adjust if subtask has assignment ID
//           },
//         ]);
//       }
//     }
//   }, [open, type, taskWithSubtasks, subtaskDetail, assignments, hasSubtasks]);

//   const handleHourChange = (accountId: number, hours: number, maxHours: number) => {
//     if (!isReadOnly && !hasSubtasks && type !== 'subtask') {
//       setEditableAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, hours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const handlePlannedHoursChange = (hours: number) => {
//     if (!isReadOnly) {
//       setPlannedHours(hours);
//     }
//   };

//   const totalAssignedHours = editableAssignments.reduce((sum, e) => sum + e.hours, 0);
//   const remaining = plannedHours - totalAssignedHours;

//   const handleSave = async () => {
//     if (isReadOnly) {
//       onClose();
//       return;
//     }
//     setIsUpdating(true);
//     try {
//       if (type === 'task') {
//         await updateTaskPlannedHours({
//           id: workItemId,
//           plannedHours,
//           createdBy: userId,
//         }).unwrap();
//         if (!hasSubtasks) {
//           for (const assignment of editableAssignments) {
//             await changeAssignmentPlannedHours({
//               id: assignment.id,
//               plannedHours: assignment.hours,
//               createdBy: userId,
//             }).unwrap();
//           }
//         }
//       } else {
//         await updateSubtaskPlannedHours({
//           id: workItemId,
//           hours: plannedHours,
//           createdBy: userId,
//         }).unwrap();
//       }
//       onRefetch();
//       onClose();
//     } catch (err) {
//       console.error('Failed to save planned hours', err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         <table className='w-full mb-4'>
//           <thead>
//             <tr>
//               <th className='text-left'>Person</th>
//               <th className='text-left'>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {editableAssignments.map((assignment) => (
//               <tr key={assignment.accountId}>
//                 <td className='flex items-center'>
//                   <img
//                     src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                     alt={assignment.accountFullname}
//                     className='w-8 h-8 rounded-full mr-2'
//                   />
//                   {assignment.accountFullname}
//                 </td>
//                 <td>
//                   <input
//                     type='number'
//                     value={assignment.hours}
//                     onChange={(e) =>
//                       handleHourChange(
//                         assignment.accountId,
//                         Number(e.target.value),
//                         assignment.maxHours
//                       )
//                     }
//                     disabled={isReadOnly || hasSubtasks || type === 'subtask'}
//                     className='w-20 p-1 border rounded'
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <p className='mt-2'>Planned Hours: {plannedHours} hours</p>
//         <p className='mt-2'>Total Assigned: {totalAssignedHours} hours</p>
//         <p className='mt-2'>Remaining: {remaining} hours</p>
//         <div className='flex justify-end mt-4'>
//           <button
//             onClick={handleSave}
//             className='bg-green-500 text-white p-2 rounded mr-2'
//             disabled={isReadOnly || isUpdating}
//           >
//             Save
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded'>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskWithSubtasksQuery,
//   useUpdatePlannedHoursMutation,
// } from '../../../services/taskApi';
// import {
//   useGetSubtaskFullDetailedByIdQuery,
//   useUpdateSubtaskPlannedHoursMutation,
// } from '../../../services/subtaskApi';
// import {
//   useGetTaskAssignmentHoursByTaskIdQuery,
//   useChangeAssignmentPlannedHoursMutation,
//   useUpdateAssignmentPlannedHoursBulkMutation,
// } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
//   onRefetch: () => void;
//   assignments: any[];
//   isReadOnly?: boolean;
// };

// type Assignment = {
//   accountId: number;
//   hours: number;
//   maxHours: number;
//   accountFullname: string;
//   accountPicture: string | null;
//   id: number;
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, assignments, isReadOnly = false }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [plannedHours, setPlannedHours] = useState<number>(0);
//   const [taskAssignments, setTaskAssignments] = useState<Assignment[]>([]);
//   const [subtaskAssignment, setSubtaskAssignment] = useState<Assignment | null>(null);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskWithSubtasks, refetch: refetchTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: subtaskDetail, refetch: refetchSubtask } = useGetSubtaskFullDetailedByIdQuery(
//     workItemId,
//     {
//       skip: type !== 'subtask',
//     }
//   );

//   const { data: taskAssignmentsData } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task' || (taskWithSubtasks?.subtasks?.length ?? 0) > 0,
//   });

//   const [updateTaskPlannedHours] = useUpdatePlannedHoursMutation();
//   const [updateSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [updateAssignmentPlannedHoursBulk] = useUpdateAssignmentPlannedHoursBulkMutation();

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;

//   useEffect(() => {
//     if (open) {
//     //   setPlannedHours(0); // Reset planned hours
//     //   setTaskAssignments([]); // Reset task assignments
//     //   setSubtaskAssignment(null); // Reset subtask assignment

//       if (type === 'task' && taskWithSubtasks) {
//         setPlannedHours(taskWithSubtasks.plannedHours ?? 0);
//         if (!hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id || 0,
//           })).filter(a => a.id > 0); // Only valid IDs
//           setTaskAssignments(mapped);
//         } else if (hasSubtasks && assignments) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: a.plannedHours ?? 0,
//             maxHours: a.workingHoursPerDay ?? 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id || 0,
//           })).filter(a => a.id > 0); // Only valid IDs
//           setTaskAssignments(mapped);
//         }
//       } else if (type === 'subtask' && subtaskDetail) {
//         setPlannedHours(subtaskDetail.plannedHours ?? 0);
//         // For subtasks, use the first assignment if available, otherwise fallback
//         if (assignments && assignments.length > 0) {
//           const mapped = assignments.map((a) => ({
//             accountId: a.accountId,
//             hours: subtaskDetail.plannedHours ?? 0,
//             maxHours: 8,
//             accountFullname: a.accountFullname || 'Unknown',
//             accountPicture: a.accountPicture || null,
//             id: a.id || 0,
//           })).filter(a => a.id > 0)[0]; // Take the first valid assignment
//           setSubtaskAssignment(mapped || null);
//         } else {
//           setSubtaskAssignment({
//             accountId: subtaskDetail.assignedBy ?? 0,
//             hours: subtaskDetail.plannedHours ?? 0,
//             maxHours: 8,
//             accountFullname: subtaskDetail.assignedFullName || 'Unknown',
//             accountPicture: subtaskDetail.assignedPicture || null,
//             id: 0, // This should be replaced with the correct TaskAssignment ID
//           });
//         }
//       }
//     }
//   }, [open, type, taskWithSubtasks, subtaskDetail, assignments, hasSubtasks]);

//   const handleHourChange = (accountId: number, hours: number, maxHours: number) => {
//     if (!isReadOnly && !hasSubtasks && type === 'task') {
//       setTaskAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, hours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const handlePlannedHoursChange = (hours: number) => {
//     if (!isReadOnly) {
//       setPlannedHours(hours);
//     }
//   };

//   const totalAssignedHours = type === 'task'
//     ? taskAssignments.reduce((sum, e) => sum + e.hours, 0)
//     : subtaskAssignment?.hours ?? 0;
//   const remaining = plannedHours - totalAssignedHours;

//   const handleSave = async () => {
//     if (isReadOnly) {
//       onClose();
//       return;
//     }
//     setIsUpdating(true);
//     try {
//       if (type === 'task') {
//         await updateTaskPlannedHours({
//           id: workItemId,
//           plannedHours,
//           createdBy: userId,
//         }).unwrap();
//         if (!hasSubtasks && taskAssignments.length > 0) {
//           const bulkUpdates = taskAssignments
//             .filter((assignment) => assignment.id > 0)
//             .map((assignment) => ({
//               assignmentId: assignment.id,
//               plannedHours: assignment.hours,
//             }));
//           if (bulkUpdates.length > 0) {
//             console.log('Sending bulk update:', { taskId: workItemId, updates: bulkUpdates, createdBy: userId });
//             await updateAssignmentPlannedHoursBulk({
//               taskId: workItemId,
//               updates: bulkUpdates,
//               createdBy: userId,
//             }).unwrap();
//           }
//         }
//       } else {
//         // For subtasks, update the subtask planned hours directly
//         await updateSubtaskPlannedHours({
//           id: workItemId,
//           hours: plannedHours,
//           createdBy: userId,
//         }).unwrap();
//       }
//       onRefetch();
//       onClose();
//     } catch (err) {
//       console.error('Failed to save planned hours', err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         <table className='w-full mb-4'>
//           <thead>
//             <tr>
//               <th className='text-left'>Person</th>
//               <th className='text-left'>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(type === 'task' ? taskAssignments : [subtaskAssignment]).map((assignment) =>
//               assignment ? (
//                 <tr key={assignment.accountId}>
//                   <td className='flex items-center'>
//                     <img
//                       src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                       alt={assignment.accountFullname}
//                       className='w-8 h-8 rounded-full mr-2'
//                     />
//                     {assignment.accountFullname}
//                   </td>
//                   <td>
//                     <input
//                       type='number'
//                       value={assignment.hours}
//                       onChange={(e) =>
//                         handleHourChange(
//                           assignment.accountId,
//                           Number(e.target.value),
//                           assignment.maxHours
//                         )
//                       }
//                       disabled={isReadOnly || hasSubtasks || type === 'subtask'}
//                       className='w-20 p-1 border rounded'
//                     />
//                   </td>
//                 </tr>
//               ) : null
//             )}
//           </tbody>
//         </table>
//         <p className='mt-2'>Planned Hours: {plannedHours} hours</p>
//         <p className='mt-2'>Total Assigned: {totalAssignedHours} hours</p>
//         <p className='mt-2'>Remaining: {remaining} hours</p>
//         <div className='flex justify-end mt-4'>
//           <button
//             onClick={handleSave}
//             className='bg-green-500 text-white p-2 rounded mr-2'
//             disabled={isReadOnly || isUpdating}
//           >
//             Save
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded'>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskWithSubtasksQuery,
//   useUpdatePlannedHoursMutation,
// } from '../../../services/taskApi';
// import {
//   useGetTaskAssignmentHoursByTaskIdQuery,
//   useUpdateAssignmentPlannedHoursBulkMutation,
// } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task';
//   onRefetch: () => void;
//   assignments: any[];
//   isReadOnly?: boolean;
// };

// type Assignment = {
//   accountId: number;
//   hours: number;
//   maxHours: number;
//   accountFullname: string;
//   accountPicture: string | null;
//   id: number;
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, assignments, isReadOnly = false }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [plannedHours, setPlannedHours] = useState<number>(0);
//   const [taskAssignments, setTaskAssignments] = useState<Assignment[]>([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskWithSubtasks, refetch: refetchTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: taskAssignmentsData } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const [updateTaskPlannedHours] = useUpdatePlannedHoursMutation();
//   const [updateAssignmentPlannedHoursBulk] = useUpdateAssignmentPlannedHoursBulkMutation();

//   useEffect(() => {
//     if (open && type === 'task' && taskWithSubtasks && assignments) {
//       setPlannedHours(taskWithSubtasks.plannedHours ?? 0);
//       const mapped = assignments.map((a) => ({
//         accountId: a.accountId,
//         hours: a.plannedHours ?? 0,
//         maxHours: a.workingHoursPerDay ?? 8,
//         accountFullname: a.accountFullname || 'Unknown',
//         accountPicture: a.accountPicture || null,
//         id: a.id || 0,
//       })).filter(a => a.id > 0); // Only valid IDs
//       setTaskAssignments(mapped);
//     }
//   }, [open, type, taskWithSubtasks, assignments]);

//   const handleHourChange = (accountId: number, hours: number, maxHours: number) => {
//     if (!isReadOnly) {
//       setTaskAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, hours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const handlePlannedHoursChange = (hours: number) => {
//     if (!isReadOnly) {
//       setPlannedHours(Math.max(0, hours));
//     }
//   };

//   const totalAssignedHours = taskAssignments.reduce((sum, e) => sum + e.hours, 0);
//   const remaining = plannedHours - totalAssignedHours;

//   const handleSave = async () => {
//     if (isReadOnly) {
//       onClose();
//       return;
//     }
//     setIsUpdating(true);
//     try {
//       await updateTaskPlannedHours({
//         id: workItemId,
//         plannedHours,
//         createdBy: userId,
//       }).unwrap();
//       if (taskAssignments.length > 0) {
//         const bulkUpdates = taskAssignments
//           .filter((assignment) => assignment.id > 0)
//           .map((assignment) => ({
//             assignmentId: assignment.id,
//             plannedHours: assignment.hours,
//           }));
//         if (bulkUpdates.length > 0) {
//           console.log('Sending bulk update:', { taskId: workItemId, updates: bulkUpdates, createdBy: userId });
//           await updateAssignmentPlannedHoursBulk({
//             taskId: workItemId,
//             updates: bulkUpdates,
//             createdBy: userId,
//           }).unwrap();
//         }
//       }
//       await Promise.all([refetchTask(), onRefetch()]);
//       onClose();
//     } catch (err) {
//       console.error('Failed to save planned hours', err);
//       alert('Failed to save planned hours');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         {/* <div className='mb-4'>
//           <label className='block mb-1'>Planned Hours</label>
//           <input
//             type='number'
//             value={plannedHours}
//             onChange={(e) => handlePlannedHoursChange(Number(e.target.value))}
//             disabled={isReadOnly}
//             className='w-full p-1 border rounded'
//             min='0'
//           />
//         </div> */}
//         <table className='w-full mb-4'>
//           <thead>
//             <tr>
//               <th className='text-left'>Person</th>
//               <th className='text-left'>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {taskAssignments.map((assignment) => (
//               <tr key={assignment.accountId}>
//                 <td className='flex items-center'>
//                   <img
//                     src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                     alt={assignment.accountFullname}
//                     className='w-8 h-8 rounded-full mr-2'
//                   />
//                   {assignment.accountFullname}
//                 </td>
//                 <td>
//                   <input
//                     type='number'
//                     value={assignment.hours}
//                     onChange={(e) =>
//                       handleHourChange(
//                         assignment.accountId,
//                         Number(e.target.value),
//                         assignment.maxHours
//                       )
//                     }
//                     disabled={isReadOnly}
//                     className='w-20 p-1 border rounded'
//                     min='0'
//                     max={assignment.maxHours}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <p className='mt-2'>Total: {totalAssignedHours} hours</p>
//         {/* <p className='mt-2'>Remaining: {remaining} hours</p> */}
//         <div className='flex justify-end mt-4'>
//           <button
//             onClick={handleSave}
//             className='bg-green-500 text-white p-2 rounded mr-2'
//             disabled={isReadOnly || isUpdating}
//           >
//             {isUpdating ? 'Saving...' : 'Save'}
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded'>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;


// import React, { useState, useEffect } from 'react';
// import {
//   useGetTaskAssignmentHoursByTaskIdQuery,
//   useUpdateAssignmentPlannedHoursBulkMutation,
// } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task';
//   onRefetch: () => void;
//   isReadOnly?: boolean;
// };

// type Assignment = {
//   accountId: number;
//   hours: number;
//   maxHours: number;
//   accountFullname: string;
//   accountPicture: string | null;
//   id: number;
// };

// const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, isReadOnly = false }) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [taskAssignments, setTaskAssignments] = useState<Assignment[]>([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const { data: taskAssignmentsData, refetch: refetchAssignments, isFetching } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task' || !open,
//   });

//   const [updateAssignmentPlannedHoursBulk] = useUpdateAssignmentPlannedHoursBulkMutation();

//   useEffect(() => {
//     if (open && type === 'task' && taskAssignmentsData) {
//       const mapped = taskAssignmentsData
//         .filter((a: any) => a.id && a.id > 0)
//         .map((a: any) => ({
//           accountId: a.accountId,
//           hours: Number(a.plannedHours) || 0, // Ensure hours is a number
//           maxHours: Number(a.workingHoursPerDay) || 8,
//           accountFullname: a.accountFullname || 'Unknown',
//           accountPicture: a.accountPicture || null,
//           id: a.id,
//         }));
//       console.log('Mapped taskAssignments:', mapped);
//       setTaskAssignments(mapped);
//     }
//   }, [open, type, taskAssignmentsData]);

//   const handleHourChange = (accountId: number, hours: string, maxHours: number) => {
//     if (!isReadOnly) {
//       const parsedHours = parseFloat(hours);
//       if (isNaN(parsedHours)) return; // Prevent invalid inputs
//       setTaskAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.min(Math.max(0, parsedHours), maxHours) } : e
//         )
//       );
//     }
//   };

//   const totalAssignedHours = taskAssignments.reduce((sum, e) => sum + e.hours, 0);

//   const handleSave = async () => {
//     if (isReadOnly) {
//       onClose();
//       return;
//     }
//     if (totalAssignedHours === 0) {
//       alert('Total assigned hours cannot be zero.');
//       return;
//     }
//     setIsUpdating(true);
//     try {
//       if (taskAssignments.length > 0) {
//         const bulkUpdates = taskAssignments
//           .filter((assignment) => assignment.id > 0)
//           .map((assignment) => ({
//             assignmentId: assignment.id,
//             plannedHours: assignment.hours, // Send as number
//           }));
//         if (bulkUpdates.length === 0) {
//           throw new Error('No valid assignments to update.');
//         }
//         console.log('Sending bulk update:', { taskId: workItemId, updates: bulkUpdates, createdBy: userId });
//         await updateAssignmentPlannedHoursBulk({
//           taskId: workItemId,
//           updates: bulkUpdates,
//           createdBy: userId,
//         }).unwrap();
//       }
//       await Promise.all([refetchAssignments(), onRefetch()]);
//       onClose();
//     } catch (err: any) {
//       console.error('Failed to save planned hours:', err);
//       alert(`Failed to save planned hours: ${err.data?.message || err.message || 'Unknown error'}`);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='bg-white p-4 rounded shadow-lg w-1/3'>
//         <h2 className='text-xl font-bold mb-2'>Assign People</h2>
//         {isFetching ? (
//           <div className='text-center p-2'>Loading assignments...</div>
//         ) : (
//           <table className='w-full mb-4'>
//             <thead>
//               <tr>
//                 <th className='text-left'>Person</th>
//                 <th className='text-left'>Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {taskAssignments.length > 0 ? (
//                 taskAssignments.map((assignment) => (
//                   <tr key={assignment.accountId}>
//                     <td className='flex items-center'>
//                       <img
//                         src={assignment.accountPicture || 'https://via.placeholder.com/40'}
//                         alt={assignment.accountFullname}
//                         className='w-8 h-8 rounded-full mr-2'
//                       />
//                       {assignment.accountFullname}
//                     </td>
//                     <td>
//                       <input
//                         type='number'
//                         value={assignment.hours}
//                         onChange={(e) => handleHourChange(assignment.accountId, e.target.value, assignment.maxHours)}
//                         disabled={isReadOnly || isUpdating}
//                         className='w-20 p-1 border rounded'
//                         min='0'
//                         max={assignment.maxHours}
//                         step='0.1' // Allow decimal inputs
//                       />
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={2} className='text-center p-2'>
//                     No assignments available
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//         <p className='mt-2'>Total: {totalAssignedHours.toFixed(1)} hours</p>
//         <div className='flex justify-end mt-4'>
//           <button
//             onClick={handleSave}
//             className='bg-green-500 text-white p-2 rounded mr-2'
//             disabled={isReadOnly || isUpdating || isFetching}
//           >
//             {isUpdating ? 'Saving...' : 'Save'}
//           </button>
//           <button onClick={onClose} className='bg-gray-200 p-2 rounded' disabled={isUpdating}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignedByPopup;



import React, { useState, useEffect } from 'react';
import {
  useGetTaskAssignmentHoursByTaskIdQuery,
  useUpdateAssignmentPlannedHoursBulkMutation,
} from '../../../services/taskAssignmentApi';

type Props = {
  open: boolean;
  onClose: () => void;
  workItemId: string;
  type: 'task';
  onRefetch: () => void;
  isReadOnly?: boolean;
};

type Assignment = {
  accountId: number;
  hours: number;
  maxHours: number;
  accountFullname: string;
  accountPicture: string | null;
  id: number;
};

const AssignedByPopup: React.FC<Props> = ({ open, onClose, workItemId, type, onRefetch, isReadOnly = false }) => {
  const userJson = localStorage.getItem('user');
  const userId = userJson ? JSON.parse(userJson).id : null;
  const [taskAssignments, setTaskAssignments] = useState<Assignment[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: taskAssignmentsData, refetch: refetchAssignments, isFetching } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
    skip: type !== 'task' || !open,
  });

  const [updateAssignmentPlannedHoursBulk] = useUpdateAssignmentPlannedHoursBulkMutation();

  // useEffect(() => {
  //   if (open && type === 'task' && taskAssignmentsData) {
  //     const mapped = taskAssignmentsData
  //       .filter((a: any) => a.id && a.id > 0)
  //       .map((a: any) => ({
  //         accountId: a.accountId,
  //         hours: Number(a.plannedHours) || 0, // Ensure hours is a number
  //         maxHours: Number(a.workingHoursPerDay) || 8,
  //         accountFullname: a.accountFullname || 'Unknown',
  //         accountPicture: a.accountPicture || null,
  //         id: a.id,
  //       }));
  //     console.log('Mapped taskAssignments:', mapped);
  //     setTaskAssignments(mapped);
  //   }
  // }, [open, type, taskAssignmentsData]);

  useEffect(() => {
    if (open && type === 'task') {
      refetchAssignments(); // Trigger refetch when popup opens
    }
    if (open && type === 'task' && taskAssignmentsData) {
      const mapped = taskAssignmentsData
        .filter((a: any) => a.id && a.id > 0)
        .map((a: any) => ({
          accountId: a.accountId,
          hours: Number(a.plannedHours) || 0, // Ensure hours is a number
          maxHours: Number(a.workingHoursPerDay) || 8,
          accountFullname: a.accountFullname || 'Unknown',
          accountPicture: a.accountPicture || null,
          id: a.id,
        }));
      console.log('Mapped taskAssignments:', mapped);
      setTaskAssignments(mapped);
    }
  }, [open, type, taskAssignmentsData, refetchAssignments]);

  const handleHourChange = (accountId: number, hours: string) => {
    if (!isReadOnly) {
      const parsedHours = parseFloat(hours);
      if (isNaN(parsedHours)) return; // Prevent invalid inputs
      setTaskAssignments((prev) =>
        prev.map((e) =>
          e.accountId === accountId ? { ...e, hours: Math.max(0, parsedHours) } : e
        )
      );
    }
  };

  const totalAssignedHours = taskAssignments.reduce((sum, e) => sum + e.hours, 0);

  const handleSave = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }
    if (totalAssignedHours === 0) {
      alert('Total assigned hours cannot be zero.');
      return;
    }
    setIsUpdating(true);
    try {
      if (taskAssignments.length > 0) {
        const bulkUpdates = taskAssignments
          .filter((assignment) => assignment.id > 0)
          .map((assignment) => ({
            assignmentId: assignment.id,
            plannedHours: assignment.hours, // Send as number
          }));
        if (bulkUpdates.length === 0) {
          throw new Error('No valid assignments to update.');
        }
        console.log('Sending bulk update:', { taskId: workItemId, updates: bulkUpdates, createdBy: userId });
        await updateAssignmentPlannedHoursBulk({
          taskId: workItemId,
          updates: bulkUpdates,
          createdBy: userId,
        }).unwrap();
      }
      await Promise.all([refetchAssignments(), onRefetch()]);
      onClose();
    } catch (err: any) {
      console.error('Failed to save planned hours:', err);
      alert(`Failed to save planned hours: ${err.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-4 rounded shadow-lg w-1/3'>
        <h2 className='text-xl font-bold mb-2'>Assign People</h2>
        {isFetching ? (
          <div className='text-center p-2'>Loading assignments...</div>
        ) : (
          <table className='w-full mb-4'>
            <thead>
              <tr>
                <th className='text-left'>Person</th>
                <th className='text-left'>Hours</th>
              </tr>
            </thead>
            <tbody>
              {taskAssignments.length > 0 ? (
                taskAssignments.map((assignment) => (
                  <tr key={assignment.accountId}>
                    <td className='flex items-center'>
                      <img
                        src={assignment.accountPicture || 'https://via.placeholder.com/40'}
                        alt={assignment.accountFullname}
                        className='w-8 h-8 rounded-full mr-2'
                      />
                      {assignment.accountFullname}
                    </td>
                    <td>
                      <input
                        type='number'
                        value={assignment.hours}
                        onChange={(e) => handleHourChange(assignment.accountId, e.target.value)}
                        disabled={isReadOnly || isUpdating}
                        className='w-20 p-1 border rounded'
                        min='0'
                        step='0.1' // Allow decimal inputs
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className='text-center p-2'>
                    No assignments available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <p className='mt-2'>Total: {totalAssignedHours.toFixed(1)} hours</p>
        <div className='flex justify-end mt-4'>
          <button
            onClick={handleSave}
            className='bg-green-500 text-white p-2 rounded mr-2'
            disabled={isReadOnly || isUpdating || isFetching}
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className='bg-gray-200 p-2 rounded' disabled={isUpdating}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignedByPopup;