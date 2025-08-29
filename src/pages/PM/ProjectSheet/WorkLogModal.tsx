// import { useEffect, useState } from 'react';
// import { useGetTaskWithSubtasksQuery, useUpdatePlannedHoursMutation } from '../../../services/taskApi';
// import { useGetTaskAssignmentHoursByTaskIdQuery, useUpdateActualHoursByTaskIdMutation } from '../../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task';
//   onRefetch: () => void;
//   onRefetchActivityLogs?: () => void;
// };

// export const WorkLogModal = ({ open, onClose, workItemId, type, onRefetch, onRefetchActivityLogs }: Props) => {
//   const userJson = localStorage.getItem('user');
//   const userId = userJson ? JSON.parse(userJson).id : null;
//   const [editableTaskAssignments, setEditableTaskAssignments] = useState<
//     { accountId: number; hours: number }[]
//   >([]);
//   const [plannedTaskHours, setPlannedTaskHours] = useState<number>(0);

//   const [changeTaskPlannedHours, { isLoading: isUpdating }] = useUpdatePlannedHoursMutation();
//   const [updateActualHours, { isLoading: isUpdatingActual }] = useUpdateActualHoursByTaskIdMutation();

//   const { data: taskWithSubtasks, refetch: refetchTaskSubTask } = useGetTaskWithSubtasksQuery(
//     workItemId,
//     {
//       skip: type !== 'task',
//     }
//   );

//   const { data: taskAssignments, refetch: refetchAssignments } = useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   useEffect(() => {
//     if (open) {
//       refetchTaskSubTask();
//       refetchAssignments();
//     }
//   }, [open, refetchTaskSubTask, refetchAssignments]);

//   useEffect(() => {
//     if (!open) return;

//     if (type === 'task' && taskAssignments) {
//       const mapped = taskAssignments.map((a) => ({
//         accountId: a.accountId,
//         hours: a.actualHours ?? 0,
//       }));
//       setEditableTaskAssignments(mapped);
//       setPlannedTaskHours(taskWithSubtasks?.plannedHours ?? 0);
//     }
//   }, [open, taskAssignments, taskWithSubtasks, type]);

//   const handleHourChangeTask = (accountId: number, hours: number) => {
//     setEditableTaskAssignments((prev) =>
//       prev.map((e) => (e.accountId === accountId ? { ...e, hours } : e))
//     );
//   };

//   const actual = editableTaskAssignments.reduce((sum, e) => sum + e.hours, 0);
//   const remaining = Math.max(0, plannedTaskHours - actual);

//   const handleDone = async () => {
//     try {
//       await changeTaskPlannedHours({
//         id: workItemId,
//         plannedHours: plannedTaskHours,
//         createdBy: userId,
//       }).unwrap();

//       if (editableTaskAssignments.length > 0 && taskAssignments) {
//         const actualPayload = editableTaskAssignments
//           .map((item) => ({
//             id: taskAssignments?.find((a) => a.accountId === item.accountId)?.id!,
//             actualHours: item.hours,
//           }))
//           .filter((item) => item.id);

//         if (actualPayload.length > 0) {
//           await updateActualHours({
//             taskId: workItemId,
//             data: actualPayload,
//             createdBy: userId,
//           }).unwrap();
//         }
//       }
//       await Promise.all([
//         refetchAssignments(),
//         refetchTaskSubTask(),
//         onRefetch(),
//       ]);

//     //   await refetchAssignments();
//     //   await refetchTaskSubTask();
//       onRefetchActivityLogs?.();
//       onClose();
//     } catch (err) {
//       console.error('❌ Failed to update hours:', err);
//       alert('Update failed');
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
//       <div className='bg-white rounded-md p-6 w-[500px] shadow-lg'>
//         <div className='flex justify-between items-center mb-4'>
//           <h2 className='text-xl font-semibold'>Work Log</h2>
//           <button
//             onClick={onClose}
//             className='text-gray-400 hover:text-black text-lg font-bold px-2'
//           >
//             ✖
//           </button>
//         </div>
//         <p className='text-sm text-gray-500 mb-4'>
//           Task ID: <span className='font-mono'>{workItemId}</span>
//         </p>

//         <div className='max-h-[300px] overflow-y-auto mb-4'>
//           <table className='w-full text-sm mb-4'>
//             <thead>
//               <tr className='text-left font-semibold'>
//                 <th>Person</th>
//                 <th>Actual Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {editableTaskAssignments.map((item) => {
//                 const account = taskAssignments?.find((a) => a.accountId === item.accountId);
//                 return (
//                   <tr key={item.accountId}>
//                     <td>
//                       {account?.accountFullname || account?.accountUsername || 'No Assignee'}
//                     </td>
//                     <td>
//                       <input
//                         type='number'
//                         className='border px-1 py-0.5 rounded w-[70px]'
//                         min={0}
//                         value={item.hours}
//                         onChange={(e) =>
//                           handleHourChangeTask(item.accountId, Number(e.target.value))
//                         }
//                       />
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         <div className='mb-4'>
//           <div className='flex items-center gap-2'>
//             <span>Planned:</span>
//             <input
//               type='number'
//               min={0}
//               className='border px-1 py-0.5 rounded w-[70px]'
//               value={plannedTaskHours}
//               onChange={(e) => setPlannedTaskHours(Math.max(0, Number(e.target.value)))}
//             />
//             <span>hrs</span>
//           </div>
//           <p>Actual: {actual} hrs</p>
//           <p>Remaining: {remaining} hrs</p>
//         </div>

//         <div className='text-right'>
//           <button
//             onClick={handleDone}
//             className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
//             disabled={isUpdating || isUpdatingActual}
//           >
//             {isUpdating || isUpdatingActual ? 'Saving...' : 'Done'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkLogModal

import { useEffect, useState } from 'react';
import { useGetTaskWithSubtasksQuery } from '../../../services/taskApi';
import {
  useGetTaskAssignmentHoursByTaskIdQuery,
  useUpdateActualHoursByTaskIdMutation,
} from '../../../services/taskAssignmentApi';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

type Props = {
  open: boolean;
  onClose: () => void;
  workItemId: string;
  type: 'task';
  onRefetch: () => void;
  onRefetchActivityLogs?: () => void;
};

export const WorkLogModal = ({
  open,
  onClose,
  workItemId,
  type,
  onRefetch,
  onRefetchActivityLogs,
}: Props) => {
  const userJson = localStorage.getItem('user');
  const userId = userJson ? JSON.parse(userJson).id : null;
  const [editableTaskAssignments, setEditableTaskAssignments] = useState<
    { accountId: number; hours: number }[]
  >([]);
  const [plannedTaskHours, setPlannedTaskHours] = useState<number>(0);

  const [updateActualHours, { isLoading: isUpdatingActual }] =
    useUpdateActualHoursByTaskIdMutation();

  const { data: taskWithSubtasks, refetch: refetchTaskSubTask } = useGetTaskWithSubtasksQuery(
    workItemId,
    {
      skip: type !== 'task',
    }
  );

  const { data: taskAssignments, refetch: refetchAssignments } =
    useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
      skip: type !== 'task',
    });

  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useGetByConfigKeyQuery('actual_hours_limit');

  useEffect(() => {
    if (open) {
      refetchTaskSubTask();
      refetchAssignments();
    }
  }, [open, refetchTaskSubTask, refetchAssignments]);

  useEffect(() => {
    if (!open) return;

    if (type === 'task' && taskAssignments) {
      const mapped = taskAssignments.map((a) => ({
        accountId: a.accountId,
        hours: a.actualHours ?? 0,
      }));
      setEditableTaskAssignments(mapped);
      setPlannedTaskHours(taskWithSubtasks?.plannedHours ?? 0);
    }
  }, [open, taskAssignments, taskWithSubtasks, type]);

  const maxActualHours = configLoading
    ? 24 // Giá trị mặc định khi đang tải
    : configError || !config?.data?.maxValue
    ? 100000 // Giá trị mặc định khi lỗi hoặc không có dữ liệu
    : parseInt(config.data.maxValue, 10);
  console.log('maxActualHours: ', maxActualHours);

  const handleHourChangeTask = (accountId: number, hours: number) => {
    if (hours > maxActualHours) {
      alert(`Actual hours cannot exceed ${maxActualHours} hours.`);
      return;
    }
    setEditableTaskAssignments((prev) =>
      prev.map((e) => (e.accountId === accountId ? { ...e, hours } : e))
    );
  };

  const actual = editableTaskAssignments.reduce((sum, e) => sum + e.hours, 0);
  const remaining = Math.max(0, plannedTaskHours - actual);

  const handleDone = async () => {
    try {
      if (!taskAssignments || taskAssignments.length === 0) {
        alert('Cannot update actual hours: No assignees found for this task.');
        return;
      }

      if (editableTaskAssignments.length > 0 && taskAssignments) {
        const actualPayload = editableTaskAssignments
          .map((item) => ({
            id: taskAssignments?.find((a) => a.accountId === item.accountId)?.id!,
            actualHours: item.hours,
          }))
          .filter((item) => item.id);

        if (actualPayload.length > 0) {
          await updateActualHours({
            taskId: workItemId,
            data: actualPayload,
            createdBy: userId,
          }).unwrap();
        }
      }
      await Promise.all([refetchAssignments(), refetchTaskSubTask(), onRefetch()]);

      onRefetchActivityLogs?.();
      onClose();
    } catch (err) {
      console.error('❌ Failed to update hours:', err);
      alert('Update failed');
    }
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-md p-6 w-[500px] shadow-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Work Log</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-black text-lg font-bold px-2'
          >
            ✖
          </button>
        </div>
        <p className='text-sm text-gray-500 mb-4'>
          Task ID: <span className='font-mono'>{workItemId}</span>
        </p>

        <div className='max-h-[300px] overflow-y-auto mb-4'>
          <table className='w-full text-sm mb-4'>
            <thead>
              <tr className='text-left font-semibold'>
                <th>Person</th>
                <th>Actual Hours</th>
              </tr>
            </thead>
            <tbody>
              {editableTaskAssignments.map((item) => {
                const account = taskAssignments?.find((a) => a.accountId === item.accountId);
                return (
                  <tr key={item.accountId}>
                    <td>{account?.accountFullname || account?.accountUsername || 'No Assignee'}</td>
                    <td>
                      <input
                        type='number'
                        className='border px-1 py-0.5 rounded w-[70px]'
                        min={0}
                        value={item.hours}
                        onChange={(e) =>
                          handleHourChangeTask(item.accountId, Number(e.target.value))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className='mb-4'>
          <p>Planned: {plannedTaskHours} hrs</p>
          <p>Actual: {actual} hrs</p>
          <p>Remaining: {remaining} hrs</p>
        </div>

        <div className='text-right'>
          <button
            onClick={handleDone}
            className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
            disabled={isUpdatingActual}
          >
            {isUpdatingActual ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkLogModal;
