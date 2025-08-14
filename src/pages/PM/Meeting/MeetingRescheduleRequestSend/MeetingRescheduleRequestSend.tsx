// import React, { useState,useEffect, useRef } from 'react';
// import toast from 'react-hot-toast';
// import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog';
// import { useAuth } from '../../../../services/AuthContext';
// import {
//   useGetMeetingsManagedByQuery,
// } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
// import {
//   useDeleteMeetingMutation,
//   useUpdateMeetingMutation,
//   useGetParticipantsByMeetingIdQuery,
//   useUpdateParticipantStatusMutation,
//   useCompleteMeetingMutation, 
// } from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
// import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
// import AttendanceModal from '../MeetingManagementPage/AttendanceModal';

// const MeetingManagementPage: React.FC = () => {
//   const { user } = useAuth();
//   const accountId = user?.id;

//   const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
//   const [editOpen, setEditOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [attendanceOpen, setAttendanceOpen] = useState(false);
//   const [currentTab, setCurrentTab] = useState<string>('ACTIVE');
//   const [formData, setFormData]   = useState<any>({});
// const [attendanceDraft, setAttendanceDraft] = useState<Record<number, string>>({});
//   const [searchKeyword, setSearchKeyword] = useState('');
//   const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY'>('ALL');
//   const toastIds = useRef<{ [key: string]: boolean }>({});

//   const { data: statusResp, isLoading: statusLoading } =
//   useGetCategoriesByGroupQuery('meeting_status');
// const statusOptions = (statusResp?.data ?? []).map(c => ({
//   value: c.name, label: c.label, color: c.color, iconLink: c.iconLink
// }));
  
// const getStatusMeta = (status?: string) =>
//   statusOptions.find(s => s.value === status);

// const statusKeys = {
//   active: statusOptions.find(s =>
//     /active|upcoming|pending/i.test(s.value) || /active|upcoming|pending/i.test(s.label)
//   )?.value,
//   completed: statusOptions.find(s =>
//     /complete|done|finished/i.test(s.value) || /complete|done|finished/i.test(s.label)
//   )?.value,
//   cancelled: statusOptions.find(s =>
//     /cancel|void|abort/i.test(s.value) || /cancel|void|abort/i.test(s.label)
//   )?.value,
// };
// useEffect(() => {
//   if (statusOptions.length && !statusOptions.some(o => o.value === currentTab)) {
//     setCurrentTab(statusOptions[0].value);
//   }
// }, [statusOptions]); 



// // Helper chung
// const toDate = (dateStr: string, timeStr: string) => {
//   // timeStr dạng "HH:mm"
//   return new Date(`${dateStr}T${timeStr}:00`);
// };

// const isPastSlot = (dateStr?: string, endTime?: string) => {
//   if (!dateStr || !endTime) return false;
//   if (!isToday(dateStr)) return false;
//   const now = new Date();
//   const end = toDate(dateStr, endTime);
//   return end <= now;
// };

// const isPastSlotByKey = (dateStr: string, key: string) => {
//   const [start, end] = key.split("|");
//   return isPastSlot(dateStr, end);
// };

//   const { data: meetings = [], isLoading, isError, error , refetch } =
//     useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });
    

//   const [deleteMeeting] = useDeleteMeetingMutation();
//   const [updateMeeting] = useUpdateMeetingMutation();
//   const [updateParticipantStatus] = useUpdateParticipantStatusMutation();
//   const [completeMeeting] = useCompleteMeetingMutation();

//   const timeSlots = [
//   { label: '08:00 AM - 10:30 AM', start: '08:00', end: '10:30' },
//   { label: '10:30 AM - 1:00 PM', start: '10:30', end: '13:00' },
//   { label: '1:00 PM - 3:30 PM', start: '13:00', end: '15:30' },
//   { label: '3:30 PM - 6:00 PM', start: '15:30', end: '18:00' },
//   { label: '6:00 PM - 8:30 PM', start: '18:00', end: '20:30' },
//   { label: '8:30 PM - 11:00 PM', start: '20:30', end: '23:00' },
// ];
// const isToday = (yyyyMmDd?: string) => {
//   if (!yyyyMmDd) return false;
//   const now = new Date();
//   const [y, m, d] = yyyyMmDd.split('-').map(Number);
//   return now.getFullYear() === y && (now.getMonth() + 1) === m && now.getDate() === d;
// };

// const {
//   data: participants = [],
//   refetch: refetchParticipants,
// } = useGetParticipantsByMeetingIdQuery(
//   selectedMeeting?.id,
//   { skip: !attendanceOpen }
// );

// useEffect(() => {
//   if (accountId) {
//     refetch();
//   }
// }, [accountId]);

//   useEffect(() => {
//     if (attendanceOpen && participants.length > 0) {
//       const initialDraft: Record<number, string> = {};
//       participants.forEach((p) => {
//         if (p.status) initialDraft[p.id] = p.status; // không hardcode
//       });
//       setAttendanceDraft(initialDraft);
//     }
//   }, [attendanceOpen, participants]);

// useEffect(() => {
//   if (!meetings || meetings.length === 0) return;

//   const now = new Date();

//   meetings.forEach(async (meeting) => {
//     // Điều kiện: chưa điểm danh (ACTIVE) + quá 24h kể từ meetingDate
//     if (meeting.status === statusKeys.active) {
//       const meetingDate = new Date(meeting.meetingDate);
//       const deadline = new Date(meetingDate);
//       deadline.setDate(meetingDate.getDate() + 1); // +24h

//       if (now > deadline) {
//         try {
//           await deleteMeeting(meeting.id); // dùng API cũ
//           toast.success(`🗑️ Cuộc họp "${meeting.meetingTopic}" đã bị xoá vì quá hạn`);
//           await refetch(); // cập nhật lại danh sách
//         } catch (error) {
//           console.error(`❌ Lỗi khi xoá cuộc họp ${meeting.id}:`, error);
//         }
//       }
//     }
//   });
// }, [meetings]);

//   // … các hàm handle* giữ nguyên …

//   if (!accountId)
//     return (
//       <p className="mt-4 text-center font-semibold text-red-600">
//         ⚠️ You are not logged in.
//       </p>
//     );
//   if (isLoading) return <p className="mt-4 text-gray-500">⏳ Loading</p>;
//   if (isError) return <p className="mt-4 text-red-500">❌ {JSON.stringify(error)}</p>;
//   if (statusLoading) return <p className="mt-4 text-gray-500">⏳ Loading statuses...</p>;


// // Điểm danh và cập nhật trạng thái cuộc họp
//  const handleAttendance = async (participantId: number, newStatus: string) => {
//     const participant = participants.find((p) => Number(p.id) === participantId);
//     if (!participant) return;

//     const currentTime = new Date();
//     const meetingTime = new Date(selectedMeeting?.meetingDate);

//     const meetingStartTime = new Date(meetingTime);
//     meetingStartTime.setHours(
//       new Date(selectedMeeting?.startTime).getHours(),
//       new Date(selectedMeeting?.startTime).getMinutes(),
//       0, 0
//     );

//     if (currentTime < meetingStartTime) {
//       if (!toastIds.current['attendance-time-not-reached']) {
//         toast.error('Cannot change attendance because meeting time is not yet!');
//         toastIds.current['attendance-time-not-reached'] = true;
//       }
//       return;
//     }

//     const meetingDayEnd = new Date(meetingTime);
//     meetingDayEnd.setHours(23, 59, 59, 999);

//     if (currentTime > meetingDayEnd) {
//       if (!toastIds.current['attendance-date-passed']) {
//         toast.error('Cannot change attendance because meeting date has passed!');
//         toastIds.current['attendance-date-passed'] = true;
//       }
//       return;
//     }

//     await updateParticipantStatus({
//       participantId,
//       data: {
//         meetingId: participant.meetingId,
//         accountId: participant.accountId,
//         role: participant.role,
//         status: newStatus, // 👈 lấy từ dynamic category
//       },
//     });

//     await refetchParticipants();

//     if (!toastIds.current['attendance-success']) {
//       toast.success('Check Attendance success');
//       toastIds.current['attendance-success'] = true;
//     }

//     await completeMeeting(selectedMeeting.id);
//     await refetch();
//   };


//   return (
//     <div className="mx-auto max-w-6xl p-6">
//       <h1 className="mb-6 text-2xl font-bold text-gray-800">
//         🛠 Manage the meetings you create
//       </h1>
// <div className="mb-6 flex gap-2 flex-wrap">
//   {statusOptions.map(s => (
//     <button
//       key={s.value}
//       onClick={() => setCurrentTab(s.value)}
//       className={`rounded px-3 py-2 text-sm font-semibold ${
//         currentTab === s.value
//           ? 'bg-blue-600 text-white'
//           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//       }`}
//       title={s.label}
//     >
//       {s.label}
//     </button>
//   ))}
// </div>

// <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//   <input
//     type="text"
//     placeholder="🔍 Find..."
//     className="w-full rounded border px-3 py-2 md:w-1/2"
//     value={searchKeyword}
//     onChange={(e) => setSearchKeyword(e.target.value)}
//   />

//   <select
//     className="rounded border px-3 py-2"
//     value={dateFilter}
//     onChange={(e) => setDateFilter(e.target.value as 'ALL' | 'TODAY')}
//   >
//     <option value="ALL">📋 ALL</option>
//     <option value="TODAY">📅 Today</option>
//   </select>
// </div>
//       {/* --- Danh sách cuộc họp --- */}
// <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//   {meetings
//     .slice()
//     .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
//     .filter((m) => m.status === currentTab)
//     .filter((m) => m.meetingTopic.toLowerCase().includes(searchKeyword.toLowerCase()))
//     .filter((m) => {
//       if (dateFilter === 'TODAY') {
//         const now = new Date();
//         const d = new Date(m.startTime);
//         return (
//           d.getDate() === now.getDate() &&
//           d.getMonth() === now.getMonth() &&
//           d.getFullYear() === now.getFullYear()
//         );
//       }
//       return true;
//     })
//     .map((m) => {
//       const meta = getStatusMeta(m.status); // 👈 lấy color/label theo dynamic category

//       return (
//         <div
//           key={m.id}
//           className="rounded-xl border p-4 shadow transition"
//           style={{
//             background: meta?.color ? `${meta.color}20` : undefined,
//             borderColor: meta?.color || undefined,
//             opacity: m.status === statusKeys.cancelled ? 0.6 : 1,
//             pointerEvents: m.status === statusKeys.cancelled ? 'none' : 'auto',
//           }}
//         >
//           <h2 className="text-lg font-semibold" style={{ color: meta?.color || '#1d4ed8' }}>
//             {m.meetingTopic}
//           </h2>

//           {/* label status động */}
//           <p className="mt-1 text-sm font-bold" style={{ color: meta?.color || '#374151' }}>
//             {meta?.label ?? m.status}
//           </p>

//           <p className="text-sm text-gray-600">
//             📅 {new Date(m.startTime).toLocaleDateString('vi-VN')} — 🕒{' '}
//             {new Date(m.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} -{' '}
//             {new Date(m.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
//           </p>

//           <p className="text-sm text-gray-700">🧑‍🤝‍🧑 {m.attendees} member</p>
//           <p className="text-sm text-gray-700">
//             🔗{' '}
//             <a href={m.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
//               Link meeting
//             </a>
//           </p>

//           <div className="mt-3 flex gap-2">
//             {!(attendanceOpen && selectedMeeting?.id === m.id) && (
//               <>
//                 {/* Sửa */}
//                 {m.status !== statusKeys.completed && (
//                   <Dialog open={editOpen && selectedMeeting?.id === m.id} onOpenChange={setEditOpen}>
//                     <DialogTrigger asChild>
//                       <button
//                         className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
//                         onClick={() => {
//                           // const formattedFormData = {
//                           //   ...m,
//                           //   meetingDate: m.meetingDate.split('T')[0], // YYYY-MM-DD
//                           //   startTime: new Date(m.startTime).toISOString().substring(11, 16), // HH:mm
//                           //   endTime: new Date(m.endTime).toISOString().substring(11, 16),   // HH:mm
//                           //   status: m.status,
//                           // };
//                           const start = new Date(m.startTime);
// const end   = new Date(m.endTime);

// const formattedFormData = {
//   ...m,
//   meetingDate: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
//   startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
//   endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
//   status: m.status,
// };
//                           setSelectedMeeting(m);
//                           setFormData(formattedFormData);
//                           setEditOpen(true);
//                         }}
//                       >
//                         ✏️ Edit
//                       </button>
//                     </DialogTrigger>
//                     <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
//                       <h3 className="mb-4 text-lg font-semibold">✏️ Meeting Update</h3>

//                       <label className="mb-2 block text-sm font-medium">Meeting Title:</label>
//                       <input
//                         className="w-full rounded border px-3 py-2"
//                         value={formData.meetingTopic || ''}
//                         onChange={(e) => setFormData({ ...formData, meetingTopic: e.target.value })}
//                       />

//                       <label className="mb-2 mt-4 block text-sm font-medium">Link Meeting:</label>
//                       <input
//                         type="url"
//                         className="w-full rounded border px-3 py-2"
//                         value={formData.meetingUrl || ''}
//                         onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
//                       />

//                       <label className="mb-2 mt-4 block text-sm font-medium">Day:</label>
//                       <input
//                         type="date"
//                         className="w-full rounded border px-3 py-2"
//                         value={formData.meetingDate || ''}
//                         onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
//                       />

//                       {/* Status động từ Dynamic Category */}
// <label className="mb-2 mt-4 block text-sm font-medium">Time Slot</label>
// <select
//   className="w-full rounded border px-3 py-2"
//   value={`${formData.startTime}|${formData.endTime}`}
//   onChange={(e) => {
//     const nextKey = e.target.value; // "HH:mm|HH:mm"
//     // Nếu là hôm nay & slot đã qua -> chặn
//     if (isPastSlotByKey(formData.meetingDate, nextKey)) {
//       toast.error("Slot này đã qua giờ rồi, chọn slot khác nha!");
//       // rollback UI: set lại value về current
//       e.currentTarget.value = `${formData.startTime}|${formData.endTime}`;
//       return;
//     }
//     const [start, end] = nextKey.split("|");
//     setFormData({ ...formData, startTime: start, endTime: end });
//   }}
// >
//   {(() => {
//     const currentKey = `${formData.startTime}|${formData.endTime}`;
//     const currentIsPast = isPastSlotByKey(formData.meetingDate, currentKey);

//     // Luôn render full list, nhưng disable những slot quá giờ hôm nay
//     return (
//       <>
//         {/* Nếu current slot đã quá giờ, vẫn show ở đầu nhưng disabled để tránh UI crash */}
//         {currentIsPast && (
//           <option value={currentKey} disabled>
//             {`${formData.startTime} - ${formData.endTime}`} (Current, past)
//           </option>
//         )}

//         {timeSlots.map((slot) => {
//           const key = `${slot.start}|${slot.end}`;
//           const disabled = isPastSlot(formData.meetingDate, slot.end);
//           return (
//             <option key={slot.label} value={key} disabled={disabled}>
//               {slot.label}{disabled ? " (past)" : ""}
//             </option>
//           );
//         })}
//       </>
//     );
//   })()}
// </select>



//                       <button
//                         className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
//                         onClick={async () => {
//                             if (isPastSlot(formData.meetingDate, formData.endTime)) {
//     toast.error("Không thể lưu vì slot đã qua giờ hôm nay.");
//     return;
//   }
//                           const startISO = new Date(`${formData.meetingDate}T${formData.startTime}`).toISOString();
//                           const endISO = new Date(`${formData.meetingDate}T${formData.endTime}`).toISOString();

//                           await updateMeeting({
//                             meetingId: m.id,
//                             data: {
//                               projectId: m.projectId,
//                               meetingTopic: formData.meetingTopic,
//                               meetingDate: startISO,
//                               meetingUrl: formData.meetingUrl,
//                               startTime: startISO,
//                               endTime: endISO,
//                               attendees: m.attendees || 0,
//                               participantIds: m.participantIds || [],
//                               status: formData.status || m.status, // 👈 dynamic
//                             },
//                           });

//                           toast.success('✅ Meeting update successful!');
//                           await refetch();
//                           setEditOpen(false);
//                         }}
//                       >
//                         💾 Save
//                       </button>
//                     </DialogContent>
//                   </Dialog>
//                 )}

//                 {/* Xoá */}
//                 {m.status !== statusKeys.completed && (
//   <Dialog
//     open={deleteOpen && selectedMeeting?.id === m.id}
//     onOpenChange={setDeleteOpen}
//   >
//     <DialogTrigger asChild>
//       <button
//         className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
//         onClick={() => {
//           setSelectedMeeting(m);
//           setDeleteOpen(true);
//         }}
//       >
//         🗑️ Delete
//       </button>
//     </DialogTrigger>
//     <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
//       <h3 className="mb-4 text-lg font-semibold">❗ Confirm Delete</h3>
//       <p>
//         Are you sure you want to delete the meeting{" "}
//         <strong>{selectedMeeting?.meetingTopic}</strong>?
//       </p>

//       <button
//         className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
//         onClick={async () => {
//           // 1️⃣ Kiểm tra nếu meeting đã bắt đầu hoặc đang diễn ra
//           const now = new Date();
//           const meetingStart = new Date(
//             `${m.meetingDate}T${m.startTime}`
//           );
//           if (meetingStart <= now) {
//             const proceed = window.confirm(
//               "⚠️ Cuộc họp đã bắt đầu hoặc đang diễn ra. Bạn vẫn muốn xóa?"
//             );
//             if (!proceed) return;
//           }

//           // 2️⃣ Yêu cầu nhập lại tên meeting để confirm
//           const confirmName = prompt(
//             `Nhập lại tên cuộc họp "${m.meetingTopic}" để xác nhận xóa:`
//           );
//           if (confirmName?.trim() !== m.meetingTopic) {
//             alert("❌ Tên nhập không đúng. Hủy thao tác xóa.");
//             return;
//           }

//           // 3️⃣ Xoá nếu qua tất cả kiểm tra
//           await deleteMeeting(m.id);
//           await refetch();
//           setDeleteOpen(false);
//         }}
//       >
//         🗑️ delete
//       </button>
//     </DialogContent>
//   </Dialog>
// )}

//                 {/* {m.status !== statusKeys.completed && (
//                   <Dialog open={deleteOpen && selectedMeeting?.id === m.id} onOpenChange={setDeleteOpen}>
//                     <DialogTrigger asChild>
//                       <button
//                         className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
//                         onClick={() => {
//                           setSelectedMeeting(m);
//                           setDeleteOpen(true);
//                         }}
//                       >
//                         🗑️ Delete
//                       </button>
//                     </DialogTrigger>
//                     <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
//                       <h3 className="mb-4 text-lg font-semibold">❗ Confirm Delete</h3>
//                       <p>
//                         Are you sure you want to delete the meeting <strong>{selectedMeeting?.meetingTopic}</strong>?
//                       </p>
//                       <button
//                         className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
//                         onClick={async () => {
//                           await deleteMeeting(m.id);
//                           await refetch();
//                           setDeleteOpen(false);
//                         }}
//                       >
//                         🗑️ delete
//                       </button>
//                     </DialogContent>
//                   </Dialog>
//                 )} */}
//               </>
//             )}

//             {/* Điểm danh */}
//             <Dialog
//               open={attendanceOpen && selectedMeeting?.id === m.id}
//     onOpenChange={(open) => {
//       setAttendanceOpen(open);
//       if (open) setSelectedMeeting(m);
//       else setAttendanceDraft({});
//     }}
//             >
//                <DialogTrigger asChild>
//       <button
//         className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
//         onClick={() => {
//           setSelectedMeeting(m);
//           setAttendanceOpen(true);
//         }}
//       >
//         📋 Check Attendance
//       </button>
//     </DialogTrigger>
//     <AttendanceModal
//       meetingTopic={selectedMeeting?.meetingTopic}
//       participants={participants}
//       draft={attendanceDraft}
//       setDraft={setAttendanceDraft}
//       onSave={async () => {
//         for (const [participantIdStr, newStatus] of Object.entries(attendanceDraft)) {
//           const participantId = Number(participantIdStr);
//           await handleAttendance(participantId, newStatus);
//         }
//         setAttendanceDraft({});
//         setAttendanceOpen(false);
//       }}
//     />
//             </Dialog>
//           </div>
//         </div>
//       );
//     })}
// </div>
//     </div>
//   );
// };

// export default MeetingManagementPage;

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetAllRescheduleRequestsQuery,
  useGetRescheduleRequestsByRequesterIdQuery,
  useDeleteRescheduleRequestMutation,
  useUpdateRescheduleRequestMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingRescheduleRequestServices';
import { useDeleteMeetingMutation } from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
import toast from 'react-hot-toast';
import { useGetMyMeetingsQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { Link } from 'react-router-dom';

// ⬇️ NEW: import hook lấy dynamic categories
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';

// ===== Dynamic badge theo color (từ dynamic_category.color) =====
const StatusBadge = ({
  statusName,
  label,
  colorHex,
}: {
  statusName: string;
  label: string;
  colorHex?: string | null;
}) => {
  // Fallback màu khi DB chưa có color
  const fallback = useMemo(() => {
    switch (statusName) {
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#92400E' }; // yellow-100 / text-yellow-800
      case 'APPROVED':
        return { bg: '#D1FAE5', text: '#065F46' }; // green-100 / text-green-800
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#991B1B' }; // red-100 / text-red-800
      default:
        return { bg: '#F3F4F6', text: '#1F2937' }; // gray-100 / text-gray-800
    }
  }, [statusName]);

  const style = {
    backgroundColor: colorHex || fallback.bg,
    color: fallback.text, // text color giữ fallback để đảm bảo contrast
  };

  return (
    <span className="px-3 py-1 rounded-full text-sm font-medium" style={style}>
      {label}
    </span>
  );
};

const MeetingRescheduleRequestSend = () => {
  const { user } = useAuth();
  const accountId = user?.id;
  const role = user?.role;

  // 🔐 Quyền truy cập
  const allowedRoles = ['CLIENT', 'PROJECT_MANAGER', 'TEAM_LEADER'];
  if (!allowedRoles.includes(role || '')) {
    return (
      <div className="flex flex-col items-center justify-center mt-10 text-center">
        <img
          src="https://img.lovepik.com/element/40067/3013.png_860.png"
          alt="No Access"
          className="w-32 h-32 mb-4"
        />
        <p className="text-xl font-semibold text-red-600 mb-4">
          ⚠️ You do not have permission to access this page.
        </p>
        <Link
          to="/meeting"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ⬅ Back To Meeting
        </Link>
      </div>
    );
  }

  // ⬇️ NEW: fetch dynamic statuses
  const {
    data: statusResp,
    isLoading: statusLoading,
    isError: statusError,
  } = useGetCategoriesByGroupQuery('meetingReschedule_status');

  // Map: name -> {label, color}
  const statusMap = useMemo(() => {
    const m = new Map<
      string,
      { label: string; color: string | null; orderIndex: number }
    >();
    statusResp?.data?.forEach((c) => {
      m.set(c.name, { label: c.label || c.name, color: c.color, orderIndex: c.orderIndex ?? 999 });
    });
    return m;
  }, [statusResp]);

  // List option để filter, sort theo order_index
  const statusOptions = useMemo(() => {
    const list = Array.from(statusMap.entries())
      .map(([name, v]) => ({ name, label: v.label, orderIndex: v.orderIndex }))
      .sort((a, b) => a.orderIndex - b.orderIndex);
    return list;
  }, [statusMap]);

  const {
    data: allData,
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useGetAllRescheduleRequestsQuery(undefined, {
    skip: !(role === 'PROJECT_MANAGER' || role === 'TEAM_LEADER'),
  });

  const {
    data: clientData,
    isLoading: loadingClient,
    refetch: refetchClient,
  } = useGetRescheduleRequestsByRequesterIdQuery(accountId!, {
    skip: !(role === 'CLIENT'),
  });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [deleteRescheduleRequest] = useDeleteRescheduleRequestMutation();
  const [updateRescheduleRequest] = useUpdateRescheduleRequestMutation();

  const [pmNotes, setPmNotes] = useState<{ [key: number]: string }>({});
  const [search, setSearch] = useState('');
  // ⬇️ NEW: default filter là 'ALL', còn lại lấy từ dynamic
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleDeleteMeeting = async (meetingId: number) => {
    await deleteMeeting(meetingId).unwrap();
    toast.success('Meeting canceled successfully!');
  };

  const handleUpdateRequestStatus = async (
    req: any,
    statusName: string // dùng name từ dynamic (PENDING/APPROVED/REJECTED/…)
  ) => {
    const note = pmNotes[req.id] || '';
    if (!note.trim()) {
      toast.error('Please enter PM notes before approving/rejecting.');
      return;
    }
    try {
      if (statusName === 'APPROVED') {
        await handleDeleteMeeting(req.meetingId);
      }

      await updateRescheduleRequest({
        id: req.id,
        meetingId: req.meetingId,
        requesterId: req.requesterId,
        requestedDate: req.requestedDate,
        reason: req.reason,
        status: statusName, // gửi name chuẩn với DTO/DB
        pmId: accountId ?? null,
        pmProposedDate: new Date().toISOString(),
        pmNote: note,
      }).unwrap();

      const okLabel = statusMap.get(statusName)?.label || statusName;
      toast.success(`Updated: ${okLabel}`);

      if (role === 'CLIENT') await refetchClient();
      else await refetchAll();

      setPmNotes((prev) => ({ ...prev, [req.id]: '' }));
    } catch {
      toast.error('An error occurred while updating!');
    }
  };

  useEffect(() => {
    if (role === 'CLIENT') {
      refetchClient();
    } else {
      refetchAll();
    }
  }, [role, refetchAll, refetchClient]);

  const handleDeleteRescheduleRequest = async (rescheduleId: number) => {
    if (!confirm('Confirm cancellation of reschedule request?')) return;
    try {
      await deleteRescheduleRequest(rescheduleId).unwrap();
      toast.success('🗑️ Request cancelled successfully!');
      await refetchClient();
    } catch {
      toast.error('❌ Error canceling request!');
    }
  };

  const { data: myMeetings } = useGetMyMeetingsQuery();
  const meetingMap = new Map<number, string>();
  myMeetings?.forEach((meeting) => {
    meetingMap.set(meeting.id, meeting.meetingTopic);
  });

  const rawRequests = role === 'CLIENT' ? clientData?.data || [] : allData?.data || [];

  const filteredRequests = rawRequests
    .filter((r: any) => (statusFilter === 'ALL' ? true : r.status === statusFilter))
    .filter(
      (r: any) =>
        r.meetingId.toString().includes(search.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      // Ưu tiên PENDING (theo name, không hardcode label)
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
    });

  if (!accountId) {
    return <p className="mt-4 text-center font-semibold text-red-600">⚠️ You are not logged in.</p>;
  }
  if (loadingAll || loadingClient || statusLoading) {
    return <p className="mt-4 text-gray-500">⏳ Loading data…</p>;
  }
  if (statusError) {
    return <p className="mt-4 text-red-600">⚠️ Cannot load reschedule statuses.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Reschedule Request List</h1>

      <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Meeting ID or Reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2"
        />

        {/* ⬇️ NEW: filter options lấy từ dynamic */}
        <select
          className="border rounded-md px-3 py-2 w-fit"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">ALL</option>
          {statusOptions.map((s) => (
            <option key={s.name} value={s.name}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req: any) => {
          const st = statusMap.get(req.status);
          return (
            <div
              key={req.id}
              className="border rounded-xl p-5 shadow hover:shadow-lg transition bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <span>📌 {meetingMap.get(req.meetingId) ?? `Meeting #${req.meetingId}`}</span>
                <StatusBadge
                  statusName={req.status}
                  label={st?.label || req.status}
                  colorHex={st?.color}
                />
              </div>

              <p className="text-gray-600 mb-1">
                <span className="font-medium">Proposed date:</span>{' '}
                {new Date(req.requestedDate).toLocaleString()}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Reason:</span> {req.reason}
              </p>

              {req.pmProposedDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Suggested date:</span>{' '}
                  {new Date(req.pmProposedDate).toLocaleString()}
                </p>
              )}
              {req.pmNote && (
                <p className="text-gray-600">
                  <span className="font-medium">PM Note:</span> {req.pmNote}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-2">
                {/* Client self-cancel */}
                {role === 'CLIENT' && req.status === 'PENDING' && (
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={() => handleDeleteRescheduleRequest(req.id!)}
                  >
                    🗑️ Cancel request
                  </button>
                )}

                {/* PM/TL actions – dùng dynamic list, không hardcode */}
                {(role === 'PROJECT_MANAGER' || role === 'TEAM_LEADER') && req.status === 'PENDING' && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter PM note..."
                      value={pmNotes[req.id!] || ''}
                      onChange={(e) =>
                        setPmNotes((prev) => ({ ...prev, [req.id!]: e.target.value }))
                      }
                      className="w-full rounded border px-3 py-1 mb-2"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {statusOptions
                        // chỉ show các status đích khác PENDING (tuỳ policy của bạn)
                        .filter((s) => s.name !== 'PENDING')
                        .map((s) => (
                          <button
                            key={s.name}
                            className={`rounded px-3 py-1 text-sm text-white ${
                              s.name === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                            onClick={() => handleUpdateRequestStatus(req, s.name)}
                          >
                            {s.label.toUpperCase()}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingRescheduleRequestSend;
