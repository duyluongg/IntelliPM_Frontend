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

//   // useEffect(() => {
//   //   if (open && type === 'task' && taskAssignmentsData) {
//   //     const mapped = taskAssignmentsData
//   //       .filter((a: any) => a.id && a.id > 0)
//   //       .map((a: any) => ({
//   //         accountId: a.accountId,
//   //         hours: Number(a.plannedHours) || 0, // Ensure hours is a number
//   //         maxHours: Number(a.workingHoursPerDay) || 8,
//   //         accountFullname: a.accountFullname || 'Unknown',
//   //         accountPicture: a.accountPicture || null,
//   //         id: a.id,
//   //       }));
//   //     console.log('Mapped taskAssignments:', mapped);
//   //     setTaskAssignments(mapped);
//   //   }
//   // }, [open, type, taskAssignmentsData]);

//   useEffect(() => {
//     if (open && type === 'task') {
//       refetchAssignments(); // Trigger refetch when popup opens
//     }
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
//   }, [open, type, taskAssignmentsData, refetchAssignments]);

//   const handleHourChange = (accountId: number, hours: string) => {
//     if (!isReadOnly) {
//       const parsedHours = parseFloat(hours);
//       if (isNaN(parsedHours)) return; // Prevent invalid inputs
//       setTaskAssignments((prev) =>
//         prev.map((e) =>
//           e.accountId === accountId ? { ...e, hours: Math.max(0, parsedHours) } : e
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
//                         onChange={(e) => handleHourChange(assignment.accountId, e.target.value)}
//                         disabled={isReadOnly || isUpdating}
//                         className='w-20 p-1 border rounded'
//                         min='0'
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
import { useRecalculateTaskPlannedHoursMutation } from '../../../services/taskApi';

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

  const { data: taskAssignmentsData, refetch: refetchAssignments, isFetching: isFetchingAssignments } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
    skip: type !== 'task' || !open,
  });

  const [recalculateTaskPlannedHours, { isLoading: isRecalculating, error: recalculationError }] = useRecalculateTaskPlannedHoursMutation();
  const [updateAssignmentPlannedHoursBulk] = useUpdateAssignmentPlannedHoursBulkMutation();

  useEffect(() => {
    if (open && type === 'task') {
      // Trigger recalculation before fetching assignments
      recalculateTaskPlannedHours({ id: workItemId })
        .unwrap()
        .then(() => {
          refetchAssignments(); // Refetch assignments after recalculation
        })
        .catch((err) => {
          console.error('Failed to recalculate planned hours:', err);
          // Proceed to fetch assignments even if recalculation fails
          refetchAssignments();
        });
    }
  }, [open, type, workItemId, recalculateTaskPlannedHours, refetchAssignments]);

  useEffect(() => {
    if (open && type === 'task' && taskAssignmentsData) {
      const mapped = taskAssignmentsData
        .filter((a: any) => a.id && a.id > 0)
        .map((a: any) => ({
          accountId: a.accountId,
          hours: Number(a.plannedHours) || 0,
          maxHours: Number(a.workingHoursPerDay) || 8,
          accountFullname: a.accountFullname || 'Unknown',
          accountPicture: a.accountPicture || null,
          id: a.id,
        }));
      console.log('Mapped taskAssignments:', mapped);
      setTaskAssignments(mapped);
    }
  }, [open, type, taskAssignmentsData]);

  const handleHourChange = (accountId: number, hours: string) => {
    if (!isReadOnly) {
      const parsedHours = parseFloat(hours);
      if (isNaN(parsedHours)) return;
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
            plannedHours: assignment.hours,
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
        {isFetchingAssignments || isRecalculating ? (
          <div className='text-center p-2'>Loading assignments...</div>
        ) : recalculationError ? (
          <div className='text-center p-2 text-red-600'>Failed to recalculate planned hours</div>
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
                        step='0.1'
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
            disabled={isReadOnly || isUpdating || isFetchingAssignments || isRecalculating}
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