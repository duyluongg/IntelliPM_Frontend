// import { useState, useEffect } from 'react';
// import {
//   useGetWorkLogsByTaskIdQuery,
//   useGetWorkLogsBySubtaskIdQuery,
//   useChangeMultipleWorklogHoursMutation,
//   useUpdateWorkLogByAccountsMutation,
// } from '../../services/workLogApi';
// import { useGetTaskWithSubtasksQuery } from '../../services/taskApi';

// interface WorklogEntry {
//   person: string;
//   date: string;
//   hours: number;
// }

// interface ChangeWorklogHoursRequest {
//   [workLogId: number]: number;
// }

// export const WorklogModal = ({
//   open,
//   onClose,
//   workItemId,
//   type,
// }: {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
// }) => {
//   const [person, setPerson] = useState('');
//   const [date, setDate] = useState('');
//   const [hours, setHours] = useState<number | ''>('');
//   const [editableEntries, setEditableEntries] = useState<{ id: number; hours: number }[]>([]);

//   const [updateWorkLogByAccounts, { isLoading: isUpdating }] = useUpdateWorkLogByAccountsMutation();

//   const {
//     data: subtaskData,
//     isLoading: isLoadingSubtask,
//     refetch: refetchSubtask,
//   } = useGetWorkLogsBySubtaskIdQuery(workItemId, { skip: type !== 'subtask' });

//   const {
//     data: taskData,
//     isLoading: isLoadingTask,
//     refetch: refetchTask,
//   } = useGetWorkLogsByTaskIdQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: taskWithSubtasks, isLoading: isLoadingTaskSubtask } = useGetTaskWithSubtasksQuery(
//     workItemId,
//     { skip: type !== 'task' }
//   );

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;
//   const hasSingleAccount = taskWithSubtasks?.accounts?.length === 1;

//   useEffect(() => {
//     if (!open) return;

//     const fetchedData = type === 'subtask' ? subtaskData?.data : taskData?.data;
//     if (fetchedData) {
//       const mapped = fetchedData.map((item) => ({
//         id: item.id,
//         hours: item.hours ?? 0,
//       }));
//       setEditableEntries(mapped);
//     }
//   }, [open, subtaskData, taskData, type]);

//   const actual = editableEntries.reduce((sum, e) => sum + e.hours, 0);
//   const planned = 6;
//   const remaining = planned - actual;

//   const handleAdd = () => {
//     if (!person || !date || !hours) return;
//     setPerson('');
//     setDate('');
//     setHours('');
//   };

//   const [changeWorklogHours, { isLoading: isChanging }] = useChangeMultipleWorklogHoursMutation();

//   // const handleDone = async () => {
//   //   try {
//   //     const payload: ChangeWorklogHoursRequest = {};
//   //     editableEntries.forEach((e) => {
//   //       if (typeof e.id === 'number' && typeof e.hours === 'number') {
//   //         payload[e.id] = e.hours;
//   //       }
//   //     });

//   //     console.log('✅ Sending body:', JSON.stringify(payload, null, 2));
//   //     await changeWorklogHours(payload).unwrap();
//   //     if (type === 'subtask') await refetchSubtask();
//   //     else await refetchTask();
//   //     onClose();
//   //   } catch (err) {
//   //     console.error('❌ Failed to update hours:', err);
//   //     alert('Update failed');
//   //   }
//   // };

//   const handleDone = async () => {
//     try {
//       if (type === 'task' && hasSubtasks) {
//         onClose();
//         return;
//       }

//       if (type === 'task' && !hasSubtasks && taskData?.data) {
//         // Gộp giờ theo ngày và account
//         const grouped: Record<
//           string, // logDate
//           Record<number, number> // accountId -> hours
//         > = {};

//         taskData.data.forEach((entry) => {
//           const logDate = entry.logDate.split('T')[0];
//           const hours = editableEntries.find((e) => e.id === entry.id)?.hours ?? 0;

//           if (!grouped[logDate]) {
//             grouped[logDate] = {};
//           }

//           (entry.accounts || []).forEach((acc) => {
//             if (!grouped[logDate][acc.id]) {
//               grouped[logDate][acc.id] = 0;
//             }
//             grouped[logDate][acc.id] += hours;
//           });
//         });

//         const workLogs = Object.entries(grouped).map(([date, accountHours], idx) => ({
//           workLogId: taskData.data[0]?.id ?? 0, // chọn 1 worklogId cũ bất kỳ (giả định update)
//           entries: Object.entries(accountHours).map(([accountIdStr, hours]) => ({
//             accountId: Number(accountIdStr),
//             hours,
//           })),
//         }));

//         const payload = {
//           taskId: workItemId,
//           workLogs,
//         };

//         console.log('▶️ Update payload:', JSON.stringify(payload, null, 2));

//         await updateWorkLogByAccounts(payload).unwrap();
//         await refetchTask();
//         onClose();
//         return;
//       }

//       // Nếu là subtask hoặc task nhưng không cần gộp
//       const payload: ChangeWorklogHoursRequest = {};
//       editableEntries.forEach((e) => {
//         if (typeof e.id === 'number' && typeof e.hours === 'number') {
//           payload[e.id] = e.hours;
//         }
//       });

//       await changeWorklogHours(payload).unwrap();
//       if (type === 'subtask') await refetchSubtask();
//       else await refetchTask();
//       onClose();
//     } catch (err) {
//       console.error('❌ Failed to update hours:', err);
//       alert('Update failed');
//     }
//   };

//   const handleHourChange = (worklogId: number, newHours: number) => {
//     setEditableEntries((prev) =>
//       prev.map((entry) => (entry.id === worklogId ? { ...entry, hours: newHours } : entry))
//     );
//   };

//   if (!open) return null;

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
//       <div className='bg-white rounded-md p-6 w-[500px] shadow-lg'>
//         <h2 className='text-xl font-semibold mb-4'>Work Log</h2>

//         <p className='text-sm text-gray-500 mb-4'>
//           {type === 'subtask' ? 'Subtask ID' : 'Task ID'}:{' '}
//           <span className='font-mono'>{workItemId}</span>
//         </p>

//         {/* <div className='mb-4 flex gap-2 items-end'>
//           <input
//             placeholder='Person'
//             value={person}
//             onChange={(e) => setPerson(e.target.value)}
//             className='border px-2 py-1 rounded w-[140px]'
//           />
//           <input
//             type='date'
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className='border px-2 py-1 rounded'
//           />
//           <input
//             type='number'
//             value={hours}
//             onChange={(e) => setHours(Number(e.target.value))}
//             placeholder='hrs'
//             className='border px-2 py-1 rounded w-[70px]'
//           />
//           <button onClick={handleAdd} className='bg-gray-800 text-white px-3 py-1 rounded'>
//             Add
//           </button>
//         </div> */}

//         {/* <table className='w-full text-sm mb-4'>
//           <thead>
//             <tr className='text-left font-semibold'>
//               <th>Person</th>
//               <th>Date</th>
//               <th>Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(type === 'subtask' ? subtaskData?.data : taskData?.data)?.map((entry, idx) => {
//               const editable = editableEntries.find((e) => e.id === entry.id);
//               return (
//                 <tr key={entry.id}>
//                   <td>
//                     {(entry.accounts ?? []).length > 0
//                       ? entry.accounts!.map((a) => a.fullName).join(', ')
//                       : 'N/A'}
//                   </td>
//                   <td>{entry.logDate.split('T')[0]}</td>
//                   <td>
//                     <input
//                       type='number'
//                       className='border px-1 py-0.5 rounded w-[60px]'
//                       value={editable?.hours ?? 0}
//                       onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                     />
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table> */}
//         {/* {type === 'subtask' && (
//           <table className='w-full text-sm mb-4'>
//             <thead>
//               <tr className='text-left font-semibold'>
//                 <th>Person</th>
//                 <th>Date</th>
//                 <th>Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subtaskData?.data?.map((entry, idx) => {
//                 const editable = editableEntries.find((e) => e.id === entry.id);
//                 return (
//                   <tr key={entry.id}>
//                     <td>
//                       {(entry.accounts ?? []).length > 0
//                         ? entry.accounts!.map((a) => a.fullName).join(', ')
//                         : 'N/A'}
//                     </td>
//                     <td>{entry.logDate.split('T')[0]}</td>
//                     <td>
//                       <input
//                         type='number'
//                         className='border px-1 py-0.5 rounded w-[60px]'
//                         value={editable?.hours ?? 0}
//                         onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                       />
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}

//         {type === 'task' && taskWithSubtasks && (
//           <>
//             {hasSubtasks ? (
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
//             ) : taskData?.data?.length ? (
//               <table className='w-full text-sm mb-4'>
//                 <thead>
//                   <tr className='text-left font-semibold'>
//                     <th>Person</th>
//                     <th>Date</th>
//                     <th>Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {taskData.data.map((entry) => {
//                     const editable = editableEntries.find((e) => e.id === entry.id);
//                     return (
//                       <tr key={entry.id}>
//                         <td>
//                           {(entry.accounts ?? []).length > 0
//                             ? entry.accounts!.map((a) => a.fullName).join(', ')
//                             : 'N/A'}
//                         </td>
//                         <td>{entry.logDate.split('T')[0]}</td>
//                         <td>
//                           <input
//                             type='number'
//                             className='border px-1 py-0.5 rounded w-[60px]'
//                             value={editable?.hours ?? 0}
//                             onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                           />
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             ) : null}
//           </>
//         )} */}

//         {type === 'task' && taskWithSubtasks && (
//           <>
//             {hasSubtasks ? (
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
//             ) : taskData?.data?.length ? (
//               <table className='w-full text-sm mb-4'>
//                 <thead>
//                   <tr className='text-left font-semibold'>
//                     {hasSingleAccount ? null : <th>Person</th>}
//                     <th>Date</th>
//                     <th>Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {taskData.data.flatMap((entry) => {
//                     const editable = editableEntries.find((e) => e.id === entry.id);
//                     const logDate = entry.logDate.split('T')[0];
//                     const accounts = entry.accounts ?? [];

//                     if (accounts.length <= 1) {
//                       return (
//                         <tr key={entry.id}>
//                           {!hasSingleAccount && (
//                             <td>
//                               {accounts.length
//                                 ? accounts[0].fullName || accounts[0].username
//                                 : 'N/A'}
//                             </td>
//                           )}
//                           <td>{logDate}</td>
//                           <td>
//                             <input
//                               type='number'
//                               className='border px-1 py-0.5 rounded w-[60px]'
//                               value={editable?.hours ?? 0}
//                               onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                             />
//                           </td>
//                         </tr>
//                       );
//                     }

//                     // Nếu có nhiều người, tạo một dòng riêng cho từng người
//                     return accounts.map((acc) => (
//                       <tr key={`${entry.id}-${acc.id}`}>
//                         <td>{acc.fullName || acc.username || 'N/A'}</td>
//                         <td>{logDate}</td>
//                         <td>
//                           <input
//                             type='number'
//                             className='border px-1 py-0.5 rounded w-[60px]'
//                             value={editable?.hours ?? 0} // Chia đều hoặc tạm hiển thị chung
//                             onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                           />
//                         </td>
//                       </tr>
//                     ));
//                   })}
//                 </tbody>
//               </table>
//             ) : null}
//           </>
//         )}

//         <div className='text-sm'>
//           <p>Actual: {actual} hrs</p>
//           <p>Planned: {planned} hrs</p>
//           <p>Remaining: {remaining} hrs</p>
//         </div>

//         <div className='mt-4 text-right'>
//           {/* <button
//             onClick={() => {
//               if (type === 'task' && hasSubtasks) {
//                 onClose(); // chỉ đóng modal nếu có subtasks
//               } else {
//                 handleDone();
//               }
//             }}
//             className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
//             disabled={isChanging}
//           >
//             {isChanging ? 'Saving...' : 'Done'}
//           </button> */}
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

// import { useState, useEffect } from 'react';
// import {
//   useGetWorkLogsByTaskIdQuery,
//   useGetWorkLogsBySubtaskIdQuery,
//   useChangeMultipleWorklogHoursMutation,
//   useUpdateWorkLogByAccountsMutation,
// } from '../../services/workLogApi';
// import { useGetTaskWithSubtasksQuery } from '../../services/taskApi';

// interface ChangeWorklogHoursRequest {
//   [workLogId: number]: number;
// }

// export const WorklogModal = ({
//   open,
//   onClose,
//   workItemId,
//   type,
// }: {
//   open: boolean;
//   onClose: () => void;
//   workItemId: string;
//   type: 'task' | 'subtask';
// }) => {
//   const [editableSubtaskEntries, setEditableSubtaskEntries] = useState<
//     { id: number; hours: number }[]
//   >([]);
//   // const [editableTaskEntries, setEditableTaskEntries] = useState<{ id: number; hours: number }[]>([]);
//   const [editableTaskEntries, setEditableTaskEntries] = useState<
//     { entryId: number; accountId: number; hours: number }[]
//   >([]);

//   // Trong useEffect:
//   // const mapped = taskData.data.flatMap((entry) =>
//   //   (entry.accounts ?? []).map((acc) => ({
//   //     entryId: entry.id,
//   //     accountId: acc.id,
//   //     hours: entry.hours ?? 0, // hoặc 0 tạm thời, backend cần gửi đúng hours từng account
//   //   }))
//   // );
//   // setEditableTaskEntries(mapped);

//   const [changeWorklogHours, { isLoading: isChanging }] = useChangeMultipleWorklogHoursMutation();
//   const [updateWorkLogByAccounts, { isLoading: isUpdating }] = useUpdateWorkLogByAccountsMutation();

//   const {
//     data: subtaskData,
//     isLoading: isLoadingSubtask,
//     refetch: refetchSubtask,
//   } = useGetWorkLogsBySubtaskIdQuery(workItemId, { skip: type !== 'subtask' });

//   const {
//     data: taskData,
//     isLoading: isLoadingTask,
//     refetch: refetchTask,
//   } = useGetWorkLogsByTaskIdQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const { data: taskWithSubtasks } = useGetTaskWithSubtasksQuery(workItemId, {
//     skip: type !== 'task',
//   });

//   const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;
//   const hasSingleAccount = taskWithSubtasks?.accounts?.length === 1;

//   // Load giờ làm vào editableEntries theo type
//   useEffect(() => {
//     if (!open) return;

//     if (type === 'subtask' && subtaskData?.data) {
//       const mapped = subtaskData.data.map((item) => ({
//         id: item.id,
//         hours: item.hours ?? 0,
//       }));
//       setEditableSubtaskEntries(mapped);
//     } else if (type === 'task' && !hasSubtasks && taskData?.data) {
//       // const mapped = taskData.data.map((item) => ({
//       //   id: item.id,
//       //   hours: item.hours ?? 0,
//       // }));
//       const mapped = taskData.data.flatMap((entry) =>
//         (entry.accounts ?? []).map((acc) => ({
//           entryId: entry.id,
//           accountId: acc.id,
//           hours: entry.hours ?? 0, // hoặc 0 tạm thời, backend cần gửi đúng hours từng account
//         }))
//       );
//       setEditableTaskEntries(mapped);
//     }
//   }, [open, subtaskData, taskData, type, hasSubtasks]);

//   const editableEntries = type === 'subtask' ? editableSubtaskEntries : editableTaskEntries;

//   const handleHourChange1 = (worklogId: number, newHours: number) => {
//     const setter = type === 'subtask' ? setEditableSubtaskEntries : setEditableTaskEntries;
//     setter((prev) =>
//       prev.map((entry) => (entry.id === worklogId ? { ...entry, hours: newHours } : entry))
//     );
//   };

//   const handleHourChange = (entryId: number, accountId: number, newHours: number) => {
//     setEditableTaskEntries((prev) =>
//       prev.map((entry) =>
//         entry.entryId === entryId && entry.accountId === accountId
//           ? { ...entry, hours: newHours }
//           : entry
//       )
//     );
//   };

//   const actual = editableEntries.reduce((sum, e) => sum + e.hours, 0);
//   const planned = 6;
//   const remaining = planned - actual;

//   const handleDone = async () => {
//     try {
//       if (type === 'task' && hasSubtasks) {
//         onClose();
//         return;
//       }

//       if (type === 'task' && !hasSubtasks && taskData?.data) {
//         const grouped: Record<string, Record<number, number>> = {};

//         taskData.data.forEach((entry) => {
//           const logDate = entry.logDate.split('T')[0];
//           const hours = editableEntries.find((e) => e.id === entry.id)?.hours ?? 0;

//           if (!grouped[logDate]) grouped[logDate] = {};

//           (entry.accounts || []).forEach((acc) => {
//             if (!grouped[logDate][acc.id]) grouped[logDate][acc.id] = 0;
//             grouped[logDate][acc.id] += hours;
//           });
//         });

//         const workLogs = Object.entries(grouped).map(([date, accountHours]) => ({
//           workLogId: taskData.data[0]?.id ?? 0,
//           entries: Object.entries(accountHours).map(([accountIdStr, hours]) => ({
//             accountId: Number(accountIdStr),
//             hours,
//           })),
//         }));

//         await updateWorkLogByAccounts({ taskId: workItemId, workLogs }).unwrap();
//         await refetchTask();
//         onClose();
//         return;
//       }

//       const payload: ChangeWorklogHoursRequest = {};
//       editableEntries.forEach((e) => {
//         if (typeof e.id === 'number' && typeof e.hours === 'number') {
//           payload[e.id] = e.hours;
//         }
//       });

//       await changeWorklogHours(payload).unwrap();
//       if (type === 'subtask') await refetchSubtask();
//       else await refetchTask();
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
//         <h2 className='text-xl font-semibold mb-4'>Work Log</h2>

//         <p className='text-sm text-gray-500 mb-4'>
//           {type === 'subtask' ? 'Subtask ID' : 'Task ID'}:{' '}
//           <span className='font-mono'>{workItemId}</span>
//         </p>

//         {type === 'task' && taskWithSubtasks ? (
//           hasSubtasks ? (
//             <table className='w-full text-sm mb-4'>
//               <thead>
//                 <tr className='text-left font-semibold'>
//                   <th>Subtask ID</th>
//                   <th>Actual Hours</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {taskWithSubtasks.subtasks.map((sub) => (
//                   <tr key={sub.id}>
//                     <td>{sub.id}</td>
//                     <td>{sub.actualHours ?? 0}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <table className='w-full text-sm mb-4'>
//               <thead>
//                 <tr className='text-left font-semibold'>
//                   {!hasSingleAccount && <th>Person</th>}
//                   <th>Date</th>
//                   <th>Hours</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {taskData?.data?.map((entry) => {
//                   const editable = editableEntries.find((e) => e.id === entry.id);
//                   const logDate = entry.logDate.split('T')[0];
//                   const accounts = entry.accounts ?? [];

//                   if (accounts.length <= 1) {
//                     return (
//                       <tr key={entry.id}>
//                         {!hasSingleAccount && (
//                           <td>{accounts[0]?.fullName || accounts[0]?.username || 'N/A'}</td>
//                         )}
//                         <td>{logDate}</td>
//                         <td>
//                           <input
//                             type='number'
//                             className='border px-1 py-0.5 rounded w-[60px]'
//                             value={editable?.hours ?? 0}
//                             onChange={(e) => handleHourChange1(entry.id, Number(e.target.value))}
//                           />
//                         </td>
//                       </tr>
//                     );
//                   }

//                   // return accounts.map((acc) => (
//                   //   <tr key={`${entry.id}-${acc.id}`}>
//                   //     <td>{acc.fullName || acc.username || 'N/A'}</td>
//                   //     <td>{logDate}</td>
//                   //     <td>
//                   //       <input
//                   //         type='number'
//                   //         className='border px-1 py-0.5 rounded w-[60px]'
//                   //         value={editable?.hours ?? 0}
//                   //         onChange={(e) => handleHourChange(entry.id, Number(e.target.value))}
//                   //       />
//                   //     </td>
//                   //   </tr>
//                   // ));
//                   return accounts.map((acc) => {
//                     const editable = editableEntries.find(
//                       (e) => e.entryId === entry.id && e.accountId === acc.id
//                     );

//                     return (
//                       <tr key={`${entry.id}-${acc.id}`}>
//                         <td>{acc.fullName || acc.username || 'N/A'}</td>
//                         <td>{logDate}</td>
//                         <td>
//                           <input
//                             type='number'
//                             className='border px-1 py-0.5 rounded w-[60px]'
//                             value={editable?.hours ?? 0}
//                             onChange={(e) =>
//                               handleHourChange(entry.id, acc.id, Number(e.target.value))
//                             }
//                           />
//                         </td>
//                       </tr>
//                     );
//                   });
//                 })}
//               </tbody>
//             </table>
//           )
//         ) : type === 'subtask' ? (
//           <table className='w-full text-sm mb-4'>
//             <thead>
//               <tr className='text-left font-semibold'>
//                 <th>Person</th>
//                 <th>Date</th>
//                 <th>Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subtaskData?.data?.map((entry) => {
//                 const editable = editableEntries.find((e) => e.id === entry.id);
//                 return (
//                   <tr key={entry.id}>
//                     <td>
//                       {entry.accounts?.[0]?.fullName || entry.accounts?.[0]?.username || 'N/A'}
//                     </td>
//                     <td>{entry.logDate.split('T')[0]}</td>
//                     <td>
//                       <input
//                         type='number'
//                         className='border px-1 py-0.5 rounded w-[60px]'
//                         value={editable?.hours ?? 0}
//                         onChange={(e) => handleHourChange1(entry.id, Number(e.target.value))}
//                       />
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         ) : null}

//         <div className='text-sm mb-4'>
//           <p>Actual: {actual} hrs</p>
//           <p>Planned: {planned} hrs</p>
//           <p>Remaining: {remaining} hrs</p>
//         </div>

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

import React, { useEffect, useState } from 'react';
import {
  useChangeMultipleWorklogHoursMutation,
  useGetWorkLogsBySubtaskIdQuery,
  useGetWorkLogsByTaskIdQuery,
  useUpdateWorkLogByAccountsMutation,
} from '../../services/workLogApi';
import { useGetTaskWithSubtasksQuery } from '../../services/taskApi';

type Props = {
  open: boolean;
  onClose: () => void;
  workItemId: string;
  type: 'task' | 'subtask';
};

export const WorkLogModal = ({ open, onClose, workItemId, type }: Props) => {
  const [editableSubtaskEntries, setEditableSubtaskEntries] = useState<{ id: number; hours: number }[]>([]);
  const [editableTaskEntries, setEditableTaskEntries] = useState<{ entryId: number; accountId: number; hours: number }[]>([]);

  const [changeWorklogHours, { isLoading: isChanging }] = useChangeMultipleWorklogHoursMutation();
  const [updateWorkLogByAccounts, { isLoading: isUpdating }] = useUpdateWorkLogByAccountsMutation();

  const { data: subtaskData, refetch: refetchSubtask } = useGetWorkLogsBySubtaskIdQuery(workItemId, {
    skip: type !== 'subtask',
  });

  const { data: taskData, refetch: refetchTask } = useGetWorkLogsByTaskIdQuery(workItemId, {
    skip: type !== 'task',
  });

  const { data: taskWithSubtasks } = useGetTaskWithSubtasksQuery(workItemId, {
    skip: type !== 'task',
  });

  const hasSubtasks = (taskWithSubtasks?.subtasks?.length ?? 0) > 0;
  const hasSingleAccount = (taskWithSubtasks?.accounts?.length ?? 0) === 1;

  useEffect(() => {
    if (!open) return;

    if (type === 'subtask' && subtaskData?.data) {
      const mapped = subtaskData.data.map((item) => ({
        id: item.id,
        hours: item.hours ?? 0,
      }));
      setEditableSubtaskEntries(mapped);
    } else if (type === 'task' && !hasSubtasks && taskData?.data) {
      const mapped = taskData.data.flatMap((entry) =>
        (entry.accounts ?? []).map((acc) => ({
          entryId: entry.id,
          accountId: acc.id,
          hours: 0, // default, update by user
        }))
      );
      setEditableTaskEntries(mapped);
    }
  }, [open, subtaskData, taskData, type, hasSubtasks]);

  const editableEntries = type === 'subtask' ? editableSubtaskEntries : editableTaskEntries;

  const handleHourChange = (entryId: number, accountId: number, newHours: number) => {
    setEditableTaskEntries((prev) =>
      prev.map((entry) =>
        entry.entryId === entryId && entry.accountId === accountId
          ? { ...entry, hours: newHours }
          : entry
      )
    );
  };

  const handleHourChange1 = (worklogId: number, newHours: number) => {
    setEditableSubtaskEntries((prev) =>
      prev.map((entry) => (entry.id === worklogId ? { ...entry, hours: newHours } : entry))
    );
  };

  const actual = editableEntries.reduce((sum, e) => sum + e.hours, 0);
  const planned = 6;
  const remaining = planned - actual;

  const handleDone = async () => {
    try {
      if (type === 'task' && hasSubtasks) {
        onClose();
        return;
      }

      if (type === 'task' && !hasSubtasks && taskData?.data) {
        // Group hours by workLogId & accountId
        const grouped: Record<number, Record<number, number>> = {}; // workLogId -> accountId -> hours

        editableTaskEntries.forEach(({ entryId, accountId, hours }) => {
          if (!grouped[entryId]) grouped[entryId] = {};
          grouped[entryId][accountId] = hours;
        });

        const workLogs = Object.entries(grouped).map(([workLogIdStr, accountsMap]) => ({
          workLogId: Number(workLogIdStr),
          entries: Object.entries(accountsMap).map(([accountIdStr, hours]) => ({
            accountId: Number(accountIdStr),
            hours,
          })),
        }));

        await updateWorkLogByAccounts({ taskId: workItemId, workLogs }).unwrap();
        await refetchTask();
        onClose();
        return;
      }

      // Subtask case
      const payload: Record<number, number> = {};
      editableSubtaskEntries.forEach((e) => {
        payload[e.id] = e.hours;
      });

      await changeWorklogHours(payload).unwrap();
      await refetchSubtask();
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
        <h2 className='text-xl font-semibold mb-4'>Work Log</h2>

        <p className='text-sm text-gray-500 mb-4'>
          {type === 'subtask' ? 'Subtask ID' : 'Task ID'}:{' '}
          <span className='font-mono'>{workItemId}</span>
        </p>

        {type === 'task' && taskWithSubtasks ? (
          hasSubtasks ? (
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
          ) : (
            <table className='w-full text-sm mb-4'>
              <thead>
                <tr className='text-left font-semibold'>
                  {!hasSingleAccount && <th>Person</th>}
                  <th>Date</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {taskData?.data?.map((entry) => {
                  const logDate = entry.logDate.split('T')[0];
                  const accounts = entry.accounts ?? [];

                  return accounts.map((acc) => {
                    const editable = editableTaskEntries.find(
                      (e) => e.entryId === entry.id && e.accountId === acc.id
                    );

                    return (
                      <tr key={`${entry.id}-${acc.id}`}>
                        {!hasSingleAccount && (
                          <td>{acc.fullName || acc.username || 'N/A'}</td>
                        )}
                        <td>{logDate}</td>
                        <td>
                          <input
                            type='number'
                            className='border px-1 py-0.5 rounded w-[60px]'
                            value={editable?.hours ?? 0}
                            onChange={(e) =>
                              handleHourChange(entry.id, acc.id, Number(e.target.value))
                            }
                          />
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          )
        ) : type === 'subtask' ? (
          <table className='w-full text-sm mb-4'>
            <thead>
              <tr className='text-left font-semibold'>
                <th>Person</th>
                <th>Date</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {subtaskData?.data?.map((entry) => {
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
                        onChange={(e) => handleHourChange1(entry.id, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        <div className='text-sm mb-4'>
          <p>Actual: {actual} hrs</p>
          <p>Planned: {planned} hrs</p>
          <p>Remaining: {remaining} hrs</p>
        </div>

        <div className='text-right'>
          <button
            onClick={handleDone}
            className='bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 disabled:opacity-50'
            disabled={isChanging || isUpdating}
          >
            {isChanging || isUpdating ? 'Saving...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
