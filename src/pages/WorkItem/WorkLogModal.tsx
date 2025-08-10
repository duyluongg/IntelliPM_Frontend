// import { useEffect, useState } from 'react';
// import {
//   useChangeMultipleWorklogHoursMutation,
//   useGetWorkLogsBySubtaskIdQuery,
//   useGetWorkLogsByTaskIdQuery,
//   useUpdateWorkLogByAccountsMutation,
// } from '../../services/workLogApi';
// import { useGetTaskWithSubtasksQuery, useUpdatePlannedHoursMutation } from '../../services/taskApi';
// import {
//   useGetSubtaskFullDetailedByIdQuery,
//   useUpdateSubtaskPlannedHoursMutation,
// } from '../../services/subtaskApi';
// import { useGetTaskAssignmentHoursByTaskIdQuery } from '../../services/taskAssignmentApi';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
// };

// export const WorkLogModal = ({ open, onClose, workItemId, type }: Props) => {
//   const [editableSubtaskEntries, setEditableSubtaskEntries] = useState<
//     { id: number; hours: number }[]
//   >([]);
//   const [editableTaskEntries, setEditableTaskEntries] = useState<
//     { entryId: number; accountId: number; hours: number }[]
//   >([]);
//   const [plannedSubtaskHours, setPlannedSubtaskHours] = useState<number>(0);
//   const [plannedTaskHours, setPlannedTaskHours] = useState<number>(0);

//   const [changeWorklogHours, { isLoading: isChanging }] = useChangeMultipleWorklogHoursMutation();
//   const [updateWorkLogByAccounts, { isLoading: isUpdating }] = useUpdateWorkLogByAccountsMutation();
//   const [changeSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
//   const [changeTaskPlannedHours] = useUpdatePlannedHoursMutation();

//   const { data: subtaskData, refetch: refetchSubtask } = useGetWorkLogsBySubtaskIdQuery(
//     workItemId,
//     {
//       skip: type !== 'subtask',
//     }
//   );

//   const { data: taskData, refetch: refetchTask } = useGetWorkLogsByTaskIdQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: taskWithSubtasks, refetch: refetchTaskSubTask } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: subtaskDetailData, refetch: refetchSubtaskDetail } =
//     useGetSubtaskFullDetailedByIdQuery(workItemId, {
//       skip: type !== 'subtask',
//     });

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;
//   const hasSingleAccount = (taskWithSubtasks?.accounts?.length ?? 0) === 1;

//   useEffect(() => {
//     if (!open) return;

//     if (type === 'subtask' && subtaskData?.data) {
//       const mapped = subtaskData.data.map((item) => ({
//         id: item.id,
//         hours: item.hours ?? 0,
//       }));
//       setEditableSubtaskEntries(mapped);
//       const totalPlanned = subtaskDetailData?.plannedHours ?? 0;
//       setPlannedSubtaskHours(totalPlanned);
//     }
//     else if (type === 'task' && !hasSubtasks && taskData?.data) {
//       const mapped = taskData.data.flatMap((entry) =>
//         (entry.accounts ?? []).map((acc) => ({
//           entryId: entry.id,
//           accountId: acc.id,
//           hours: 0, // default, update by user
//         }))
//       );
//       setEditableTaskEntries(mapped);
//       const totalPlanned = taskWithSubtasks?.plannedHours ?? 0;
//       setPlannedTaskHours(totalPlanned);
//     }
//   }, [open, subtaskData, taskData, type, hasSubtasks]);

//   const editableEntries = type === 'subtask' ? editableSubtaskEntries : editableTaskEntries;

//   const handleHourChange = (entryId: number, accountId: number, newHours: number) => {
//     setEditableTaskEntries((prev) =>
//       prev.map((entry) =>
//         entry.entryId === entryId && entry.accountId === accountId
//           ? { ...entry, hours: newHours }
//           : entry
//       )
//     );
//   };

//   const handleHourChange1 = (worklogId: number, newHours: number) => {
//     setEditableSubtaskEntries((prev) =>
//       prev.map((entry) => (entry.id === worklogId ? { ...entry, hours: newHours } : entry))
//     );
//   };

//   const actual = editableEntries.reduce((sum, e) => sum + e.hours, 0);
//   const planned = 0;
//   const remaining = planned - actual;

//   const handleDone = async () => {
//     try {
//       if (type === 'task' && hasSubtasks) {
//         onClose();
//         return;
//       }

//       if (type === 'task' && !hasSubtasks && taskData?.data) {
//         await changeTaskPlannedHours({
//           id: workItemId,
//           plannedHours: plannedTaskHours,
//         }).unwrap();
//         // Group hours by workLogId & accountId
//         const grouped: Record<number, Record<number, number>> = {}; // workLogId -> accountId -> hours

//         editableTaskEntries.forEach(({ entryId, accountId, hours }) => {
//           if (!grouped[entryId]) grouped[entryId] = {};
//           grouped[entryId][accountId] = hours;
//         });

//         const workLogs = Object.entries(grouped).map(([workLogIdStr, accountsMap]) => ({
//           workLogId: Number(workLogIdStr),
//           entries: Object.entries(accountsMap).map(([accountIdStr, hours]) => ({
//             accountId: Number(accountIdStr),
//             hours,
//           })),
//         }));

//         await updateWorkLogByAccounts({ taskId: workItemId, workLogs }).unwrap();
//         await refetchTask();
//         await refetchTaskSubTask();
//         onClose();
//         return;
//       }

//       // Subtask case
//       await changeSubtaskPlannedHours({
//         id: workItemId,
//         hours: plannedSubtaskHours,
//       }).unwrap();

//       const payload: Record<number, number> = {};
//       editableSubtaskEntries.forEach((e) => {
//         payload[e.id] = e.hours;
//       });

//       await changeWorklogHours(payload).unwrap();
//       await refetchSubtask();
//       await refetchSubtaskDetail();
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
//         {/* <h2 className='text-xl font-semibold mb-4'>Work Log</h2> */}
//         <div className='flex justify-between items-center mb-4'>
//           <h2 className='text-xl font-semibold'>Work Log</h2>
//           <button
//             onClick={onClose}
//             className='text-gray-400 hover:text-black text-lg font-bold px-2'
//             title='Close'
//           >
//             ✖
//           </button>
//         </div>
//         <p className='text-sm text-gray-500 mb-4'>
//           {type === 'subtask' ? 'Subtask ID' : 'Task ID'}:{' '}
//           <span className='font-mono'>{workItemId}</span>
//         </p>

//         {type === 'task' && taskWithSubtasks ? (
//           hasSubtasks ? (
//             <div className='max-h-[300px] overflow-y-auto mb-4'>
//               <table className='w-full text-sm mb-4'>
//                 <thead>
//                   <tr className='text-left font-semibold'>
//                     <th>Subtask ID</th>
//                     <th>Actual Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {taskWithSubtasks.subtasks.map((sub) => (
//                     <tr key={sub.id}>
//                       <td>{sub.id}</td>
//                       <td>{sub.actualHours ?? 0}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className='max-h-[300px] overflow-y-auto mb-4'>
//               <table className='w-full text-sm mb-4'>
//                 <thead>
//                   <tr className='text-left font-semibold'>
//                     {!hasSingleAccount && <th>Person</th>}
//                     <th>Date</th>
//                     <th>Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {taskData?.data?.map((entry) => {
//                     const logDate = entry.logDate.split('T')[0];
//                     const accounts = entry.accounts ?? [];

//                     return accounts.map((acc) => {
//                       const editable = editableTaskEntries.find(
//                         (e) => e.entryId === entry.id && e.accountId === acc.id
//                       );

//                       return (
//                         <tr key={`${entry.id}-${acc.id}`}>
//                           {!hasSingleAccount && <td>{acc.fullName || acc.username || 'N/A'}</td>}
//                           <td>{logDate}</td>
//                           <td>
//                             <input
//                               type='number'
//                               className='border px-1 py-0.5 rounded w-[60px]'
//                               value={editable?.hours ?? 0}
//                               min={0}
//                               // step={0.1}
//                               onChange={(e) =>
//                                 handleHourChange(entry.id, acc.id, Number(e.target.value))
//                               }
//                             />
//                           </td>
//                         </tr>
//                       );
//                     });
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )
//         ) : type === 'subtask' ? (
//           <div className='max-h-[300px] overflow-y-auto mb-4'>
//             <table className='w-full text-sm mb-4'>
//               <thead>
//                 <tr className='text-left font-semibold'>
//                   <th>Person</th>
//                   <th>Date</th>
//                   <th>Hours</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {subtaskData?.data?.map((entry) => {
//                   const editable = editableSubtaskEntries.find((e) => e.id === entry.id);
//                   return (
//                     <tr key={entry.id}>
//                       <td>
//                         {entry.accounts?.[0]?.fullName || entry.accounts?.[0]?.username || 'N/A'}
//                       </td>
//                       <td>{entry.logDate.split('T')[0]}</td>
//                       <td>
//                         <input
//                           type='number'
//                           className='border px-1 py-0.5 rounded w-[60px]'
//                           value={editable?.hours ?? 0}
//                           min={0}
//                           // step={0.1}
//                           onChange={(e) => handleHourChange1(entry.id, Number(e.target.value))}
//                         />
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ) : null}

//         {type === 'subtask' ? (
//           <>
//             <div className='flex items-center gap-2'>
//               <span>Planned:</span>
//               <input
//                 type='number'
//                 min={0}
//                 // step={0.1}
//                 className='border px-1 py-0.5 rounded w-[70px]'
//                 value={plannedSubtaskHours}
//                 onChange={(e) => setPlannedSubtaskHours(Math.max(0, Number(e.target.value)))}
//               />
//               <span>hrs</span>
//             </div>
//             <p>Actual: {actual} hrs</p>
//             <p>Remaining: {Math.max(0, plannedSubtaskHours - actual)} hrs</p>
//           </>
//         ) : hasSubtasks ? (
//           <>
//             <p>Planned: {taskWithSubtasks?.plannedHours} hrs</p>
//             <p>Actual: {taskWithSubtasks?.actualHours} hrs</p>
//             <p>Remaining: {taskWithSubtasks?.remainingHours} hrs</p>
//           </>
//         ) : (
//           <>
//             <div className='flex items-center gap-2'>
//               <span>Planned:</span>
//               <input
//                 type='number'
//                 min={0}
//                 // step={0.1}
//                 className='border px-1 py-0.5 rounded w-[70px]'
//                 value={plannedTaskHours}
//                 onChange={(e) => setPlannedTaskHours(Math.max(0, Number(e.target.value)))}
//               />
//               <span>hrs</span>
//             </div>
//             <p>Actual: {taskWithSubtasks?.actualHours} hrs</p>
//             <p>Remaining: {Math.max(0, plannedTaskHours - actual)} hrs</p>
//           </>
//         )}

//         <div className='text-right'>
//           <button
//             onClick={handleDone}
//             className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
//             disabled={isChanging || isUpdating}
//           >
//             {isChanging || isUpdating ? 'Saving...' : 'Done'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

import { useEffect, useState } from 'react';
import {
  useChangeMultipleWorklogHoursMutation,
  useGetWorkLogsBySubtaskIdQuery,
  useUpdateWorkLogByAccountsMutation,
} from '../../services/workLogApi';
import { useGetTaskWithSubtasksQuery, useUpdatePlannedHoursMutation } from '../../services/taskApi';
import {
  useGetSubtaskFullDetailedByIdQuery,
  useUpdateSubtaskPlannedHoursMutation,
  useUpdateSubtaskActualHoursMutation,
} from '../../services/subtaskApi';
import {
  useGetTaskAssignmentHoursByTaskIdQuery,
  useUpdateActualHoursByTaskIdMutation,
} from '../../services/taskAssignmentApi';

type Props = {
  open: boolean;
  onClose: () => void;
  workItemId: string;
  type: 'task' | 'subtask';
};

export const WorkLogModal = ({ open, onClose, workItemId, type }: Props) => {
  const userJson = localStorage.getItem('user');
  const userId = userJson ? JSON.parse(userJson).id : null;
  const [editableSubtaskEntries, setEditableSubtaskEntries] = useState<
    { id: string; hours: number }[]
  >([]);
  const [editableTaskAssignments, setEditableTaskAssignments] = useState<
    { accountId: number; hours: number }[]
  >([]);
  const [plannedSubtaskHours, setPlannedSubtaskHours] = useState<number>(0);
  const [actualSubtaskHours, setActualSubtaskHours] = useState<number>(0);
  const [plannedTaskHours, setPlannedTaskHours] = useState<number>(0);

  const [changeWorklogHours, { isLoading: isChanging }] = useChangeMultipleWorklogHoursMutation();
  const [updateWorkLogByAccounts, { isLoading: isUpdating }] = useUpdateWorkLogByAccountsMutation();
  const [changeSubtaskPlannedHours] = useUpdateSubtaskPlannedHoursMutation();
  const [changeSubtaskActualHours] = useUpdateSubtaskActualHoursMutation();
  const [changeTaskPlannedHours] = useUpdatePlannedHoursMutation();
  const [updateActualHours, { isLoading: isUpdatingActual }] =
    useUpdateActualHoursByTaskIdMutation();

  const { data: subtaskData, refetch: refetchSubtask } = useGetWorkLogsBySubtaskIdQuery(
    workItemId,
    {
      skip: type !== 'subtask',
    }
  );

  const { data: taskWithSubtasks, refetch: refetchTaskSubTask } = useGetTaskWithSubtasksQuery(
    workItemId,
    {
      // skip: type !== 'task',
    }
  );

  const { data: subtaskDetailData, refetch: refetchSubtaskDetail } =
    useGetSubtaskFullDetailedByIdQuery(workItemId, {
      skip: type !== 'subtask',
    });

  const { data: taskAssignments, refetch: refetchAssignments } =
    useGetTaskAssignmentHoursByTaskIdQuery(workItemId, {
      skip: type !== 'task' || (taskWithSubtasks?.subtasks?.length ?? 0) > 0,
    });

  const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;

  useEffect(() => {
    if (open) {
      if (type === 'subtask') {
        refetchSubtask();
        refetchSubtaskDetail();
      }
      refetchTaskSubTask();
      if (type === 'task' && !hasSubtasks) {
        refetchAssignments();
      }
    }
  }, [
    open,
    type,
    hasSubtasks,
    refetchSubtask,
    refetchSubtaskDetail,
    refetchTaskSubTask,
    refetchAssignments,
  ]);

  useEffect(() => {
    if (!open) return;

    if (type === 'subtask' && subtaskDetailData) {
      const mapped = [
        {
          id: subtaskDetailData.id,
          hours: subtaskDetailData.actualHours ?? 0,
        },
      ];
      setEditableSubtaskEntries(mapped);
      const totalPlanned = subtaskDetailData?.plannedHours ?? 0;
      setPlannedSubtaskHours(totalPlanned);
    } else if (type === 'task' && !hasSubtasks && taskAssignments) {
      const mapped = taskAssignments.map((a) => ({
        accountId: a.accountId,
        hours: a.actualHours ?? 0,
      }));
      setEditableTaskAssignments(mapped);
      setPlannedTaskHours(taskWithSubtasks?.plannedHours ?? 0);
    } else if (type === 'task' && !hasSubtasks) {
      setPlannedTaskHours(taskWithSubtasks?.plannedHours ?? 0);
    }
  }, [open, subtaskData, taskAssignments, taskWithSubtasks, type, hasSubtasks]);

  const handleHourChangeSubtask = (id: string, hours: number) => {
    setEditableSubtaskEntries((prev) => prev.map((e) => (e.id === id ? { ...e, hours } : e)));
  };

  const handleHourChangeTask = (accountId: number, hours: number) => {
    setEditableTaskAssignments((prev) =>
      prev.map((e) => (e.accountId === accountId ? { ...e, hours } : e))
    );
  };

  const actual =
    type === 'subtask'
      ? editableSubtaskEntries.reduce((sum, e) => sum + e.hours, 0)
      : editableTaskAssignments.reduce((sum, e) => sum + e.hours, 0);

  const planned = type === 'subtask' ? plannedSubtaskHours : plannedTaskHours;
  const remaining = Math.max(0, planned - actual);

  const handleDone = async () => {
    try {
      if (type === 'task' && hasSubtasks) {
        onClose();
        return;
      }

      if (type === 'task' && !hasSubtasks) {
        await changeTaskPlannedHours({
          id: workItemId,
          plannedHours: plannedTaskHours,
          createdBy: userId,
        }).unwrap();

        // const actualPayload = editableTaskAssignments.map((item) => ({
        //   id: taskAssignments?.find((a) => a.accountId === item.accountId)?.id!,
        //   actualHours: item.hours,
        // }));
        // await updateActualHours({
        //   taskId: workItemId,
        //   data: actualPayload,
        //   createdBy: userId
        // }).unwrap();
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

        await refetchAssignments();
        await refetchTaskSubTask();
        onClose();
        return;
      }
      console.log('change subtask plannedHours: ', userId);
      // subtask case
      await changeSubtaskPlannedHours({
        id: workItemId,
        hours: plannedSubtaskHours,
        createdBy: userId,
      }).unwrap();
      if (editableSubtaskEntries.length > 0) {
        const hours = editableSubtaskEntries[0].hours;

        await changeSubtaskActualHours({ id: workItemId, hours, createdBy: userId }).unwrap();
      }
      // await changeSubtaskActualHours({ id: workItemId, hours: actualSubtaskHours }).unwrap();
      // const payload: Record<string, number> = {};
      // //const payload = new Map<string, number>();
      // editableSubtaskEntries.forEach((e) => {
      //   payload[e.id] = e.hours;
      // });
      // await changeWorklogHours(payload).unwrap();
      await refetchSubtask();
      await refetchSubtaskDetail();
      await refetchTaskSubTask();
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
          {type === 'subtask' ? 'Subtask ID' : 'Task ID'}:{' '}
          <span className='font-mono'>{workItemId}</span>
        </p>

        {/* Display Work Logs */}
        {type === 'task' && taskWithSubtasks ? (
          hasSubtasks ? (
            <div className='max-h-[300px] overflow-y-auto mb-4'>
              <table className='w-full text-sm mb-4'>
                <thead>
                  <tr className='text-left font-semibold'>
                    <th>Subtask ID</th>
                    <th>Actual Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {taskWithSubtasks.subtasks.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.id}</td>
                      <td>{sub.actualHours ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
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
                        <td>
                          {account?.accountFullname || account?.accountUsername || 'No Assignee'}
                        </td>
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
          )
        ) : type === 'subtask' ? (
          // type === 'subtask' ? (
          <div className='max-h-[300px] overflow-y-auto mb-4'>
            <table className='w-full text-sm mb-4'>
              <thead>
                <tr className='text-left font-semibold'>
                  <th>Person</th>
                  {/* <th>Date</th> */}
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {/* {subtaskData?.data?.map((entry) => {
                  const editable = editableSubtaskEntries.find((e) => e.id === entry.id);
                  return (
                    <tr key={entry.id}>
                      <td>
                        {entry.accounts?.[0]?.fullName || entry.accounts?.[0]?.username || 'N/A'}
                      </td>
                      <td>{entry.logDate.split('T')[0]}</td>
                      <td>
                        <input
                          type='number'
                          className='border px-1 py-0.5 rounded w-[60px]'
                          value={editable?.hours ?? 0}
                          min={0}
                          onChange={(e) =>
                            handleHourChangeSubtask(entry.id, Number(e.target.value))
                          }
                        />
                      </td>
                    </tr>
                  );
                })} */}
                {subtaskDetailData &&
                  (() => {
                    const editable = editableSubtaskEntries.find(
                      (e) => e.id === subtaskDetailData.id
                    );
                    return (
                      <tr key={subtaskDetailData.id}>
                        <td>
                          {subtaskDetailData.assignedFullName ||
                            subtaskDetailData.assignedUsername ||
                            'No Assignee'}
                        </td>
                        <td>
                          <input
                            type='number'
                            className='border px-1 py-0.5 rounded w-[60px]'
                            value={editable?.hours ?? 0}
                            min={0}
                            onChange={(e) =>
                              handleHourChangeSubtask(subtaskDetailData.id, Number(e.target.value))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })()}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Footer Summary */}
        <div className='mb-4'>
          {type === 'subtask' ? (
            <>
              <div className='flex items-center gap-2'>
                <span>Planned:</span>
                <input
                  type='number'
                  min={0}
                  className='border px-1 py-0.5 rounded w-[70px]'
                  value={plannedSubtaskHours}
                  onChange={(e) => setPlannedSubtaskHours(Math.max(0, Number(e.target.value)))}
                />
                <span>hrs</span>
              </div>
              <p>Actual: {actual} hrs</p>
              <p>Remaining: {remaining} hrs</p>
            </>
          ) : hasSubtasks ? (
            <>
              <p>Planned: {taskWithSubtasks?.plannedHours ?? 0} hrs</p>
              <p>Actual: {taskWithSubtasks?.actualHours ?? 0} hrs</p>
              <p>Remaining: {taskWithSubtasks?.remainingHours ?? 0} hrs</p>
            </>
          ) : (
            <>
              <div className='flex items-center gap-2'>
                <span>Planned:</span>
                <input
                  type='number'
                  min={0}
                  className='border px-1 py-0.5 rounded w-[70px]'
                  value={plannedTaskHours}
                  onChange={(e) => setPlannedTaskHours(Math.max(0, Number(e.target.value)))}
                />
                <span>hrs</span>
              </div>
              <p>Actual: {actual} hrs</p>
              <p>Remaining: {remaining} hrs</p>
            </>
          )}
        </div>

        <div className='text-right'>
          <button
            onClick={handleDone}
            className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
            disabled={isChanging || isUpdating || isUpdatingActual}
          >
            {isChanging || isUpdating ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
