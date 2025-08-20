// import React, { useState,useEffect, useRef } from 'react';
// import toast from 'react-hot-toast';
// import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog';
// import {
//   ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   PieChart, Pie, Cell,
// } from 'recharts';
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
// import MeetingAnalytics from './MeetingAnalytics';

// const MeetingManagementPage: React.FC = () => {
//   const { user } = useAuth();
//   const accountId = user?.id;

//   const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
//   const [editOpen, setEditOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [attendanceOpen, setAttendanceOpen] = useState(false);
//   const [currentTab, setCurrentTab] = useState<string>('ACTIVE');
//   const [formData, setFormData]   = useState<any>({});
//   const [attendanceDraft, setAttendanceDraft] = useState<Record<number, string>>({});
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




//   const { data: meetings = [], isLoading, isError, error , refetch } =
//     useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });
//     console.log(meetings)
    

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
//           toast.success(`🗑️ The meeting "${meeting.meetingTopic}" has been deleted due to expiration`);
//           await refetch(); // cập nhật lại danh sách
//         } catch (error) {
//           console.error(`❌ Error while deleting meeting ${meeting.id}:`, error);
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
//         status: newStatus, 
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
//           <MeetingAnalytics
//       meetings={meetings}
//       statusOptions={statusOptions}
//     />
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
// const memberCount = participants.filter(
//   (p) => p.meetingId === m.id
// ).length;
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

//           {/* <p className="text-sm text-gray-700">🧑‍🤝‍🧑 {memberCount} member</p> */}
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
// onClick={() => {
//   const start = new Date(m.startTime);
//   const end = new Date(m.endTime);

//   const pad2 = (n: number) => String(n).padStart(2, '0');

//   const formattedFormData = {
//     ...m,
//     // YYYY-MM-DD theo giờ local
//     meetingDate: `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
//     // HH:mm theo giờ local
//     startTime: `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
//     endTime: `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
//     status: m.status,
//   };

//   setSelectedMeeting(m);
//   setFormData(formattedFormData);
//   setEditOpen(true);
// }}

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
// <label className="mb-2 mt-4 block text-sm font-medium">Time Slot</label>
// <select
//   className="w-full rounded border px-3 py-2"
//   value={`${formData.startTime}|${formData.endTime}`}
//   onChange={(e) => {
//     const [start, end] = e.target.value.split('|');
//     setFormData({ ...formData, startTime: start, endTime: end });
//   }}
// >
//   {(() => {
//     const editingToday = isToday(formData.meetingDate);
//     const now = new Date();

//     return (
//       <>
//         {timeSlots.map((slot) => {
//           const slotStart = new Date(`${formData.meetingDate}T${slot.start}`);
//           // Nếu là hôm nay và slot đã BẮT ĐẦU (now >= slotStart) => disable
//           const started = editingToday && now >= slotStart;

//           return (
//             <option
//               key={slot.label}
//               value={`${slot.start}|${slot.end}`}
//               disabled={started}
//             >
//               {slot.label}{started ? ' (Started - unavailable)' : ''}
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
//                         🗑️ Delete
//                       </button>
//                     </DialogContent>
//                   </Dialog>
//                 )}
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
//       projectId={selectedMeeting?.projectId}
//       meetingStatus={selectedMeeting?.status}
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetMeetingsManagedByQuery,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import {
  useDeleteMeetingMutation,
  useUpdateMeetingMutation,
  useGetParticipantsByMeetingIdQuery,
  useUpdateParticipantStatusMutation,
  useCompleteMeetingMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
import { useGetAllQuery as useGetAllSystemConfigsQuery } from '../../../../services/systemConfigurationApi';
import AttendanceModal from '../MeetingManagementPage/AttendanceModal';
import MeetingAnalytics from './MeetingAnalytics';

/** ===================== Fallback defaults ===================== */
const DEFAULTS = {
  TOPIC_LEN_MAX: 150,
  TOPIC_LEN_MIN: 1,

  DURATION_MIN: 15,
  DURATION_MAX: 240,
  DURATION_STEP: 15,
  DURATION_EST: 60,

  WORK_START: '08:00',
  WORK_END: '23:00',
  SLOT_STEP_MIN: 15,
};

/** ===================== Helpers ===================== */
const toInt = (v: any, fb: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fromMinutes = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
// local date(YYYY-MM-DD) + time(HH:mm) -> ISO
const toLocalIso = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
};
const isToday = (yyyyMmDd?: string) => {
  if (!yyyyMmDd) return false;
  const now = new Date();
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return now.getFullYear() === y && (now.getMonth() + 1) === m && now.getDate() === d;
};
const isValidMeetingUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    if (u.hostname === 'meet.google.com') {
      return /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(u.pathname);
    }
    if (u.hostname.endsWith('.zoom.us')) {
      return /^\/j\/\d+\/?$/i.test(u.pathname);
    }
    return false;
  } catch {
    return false;
  }
};

const MeetingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('ACTIVE');
  const [formData, setFormData] = useState<any>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY'>('ALL');
  const toastIds = useRef<{ [key: string]: boolean }>({});

  // ===== Dynamic status =====
  const { data: statusResp, isLoading: statusLoading } =
    useGetCategoriesByGroupQuery('meeting_status');
  const statusOptions = (statusResp?.data ?? []).map(c => ({
    value: c.name, label: c.label, color: c.color, iconLink: c.iconLink
  }));
  const getStatusMeta = (status?: string) =>
    statusOptions.find(s => s.value === status);

  const statusKeys = {
    active: statusOptions.find(s =>
      /active|upcoming|pending/i.test(s.value) || /active|upcoming|pending/i.test(s.label)
    )?.value,
    completed: statusOptions.find(s =>
      /complete|done|finished/i.test(s.value) || /complete|done|finished/i.test(s.label)
    )?.value,
    cancelled: statusOptions.find(s =>
      /cancel|void|abort/i.test(s.value) || /cancel|void|abort/i.test(s.label)
    )?.value,
  };
  useEffect(() => {
    if (statusOptions.length && !statusOptions.some(o => o.value === currentTab)) {
      setCurrentTab(statusOptions[0].value);
    }
  }, [statusOptions]); 

  // ===== Meetings =====
  const { data: meetings = [], isLoading, isError, error , refetch } =
    useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();
  const [completeMeeting] = useCompleteMeetingMutation();

  // ===== Participants for attendance =====
  const {
    data: participants = [],
    refetch: refetchParticipants,
  } = useGetParticipantsByMeetingIdQuery(
    selectedMeeting?.id,
    { skip: !attendanceOpen }
  );
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, string>>({});
  useEffect(() => {
    if (attendanceOpen && participants.length > 0) {
      const initialDraft: Record<number, string> = {};
      participants.forEach((p) => {
        if (p.status) initialDraft[p.id] = p.status;
      });
      setAttendanceDraft(initialDraft);
    }
  }, [attendanceOpen, participants]);

  useEffect(() => {
    if (accountId) refetch();
  }, [accountId]);

  useEffect(() => {
  if (attendanceOpen) {
    setEditOpen(false);
    setDeleteOpen(false);
  }
}, [attendanceOpen]);


  // Auto delete after 24h if still active
  useEffect(() => {
    if (!meetings || meetings.length === 0) return;
    const now = new Date();
    meetings.forEach(async (meeting) => {
      if (meeting.status === statusKeys.active) {
        const meetingDate = new Date(meeting.meetingDate);
        const deadline = new Date(meetingDate);
        deadline.setDate(meetingDate.getDate() + 1);
        if (now > deadline) {
          try {
            await deleteMeeting(meeting.id);
            toast.success(`🗑️ The meeting "${meeting.meetingTopic}" has been deleted due to expiration`);
            await refetch();
          } catch (err) {
            console.error(`❌ Error while deleting meeting ${meeting.id}:`, err);
          }
        }
      }
    });
  }, [meetings]);

  // ===== System configuration (like CreateMeetingPage) =====
  const { data: cfgResp, isLoading: cfgLoading } = useGetAllSystemConfigsQuery();
  const cfg = useMemo(() => {
    const list = Array.isArray(cfgResp?.data) ? (cfgResp!.data as any[]) : [];
    const byKey = new Map<string, any>(list.map((c) => [c.configKey, c]));

    const topic = byKey.get('meeting_topic_length');
    const duration = byKey.get('meeting_duration_minutes');

    return {
      TOPIC_LEN_MIN: toInt(topic?.minValue, DEFAULTS.TOPIC_LEN_MIN),
      TOPIC_LEN_MAX: toInt(topic?.valueConfig, DEFAULTS.TOPIC_LEN_MAX),

      DURATION_MIN: toInt(duration?.minValue, DEFAULTS.DURATION_MIN),
      DURATION_MAX: toInt(duration?.maxValue, DEFAULTS.DURATION_MAX),
      DURATION_STEP: DEFAULTS.DURATION_STEP,
      DURATION_EST: toInt(duration?.estimateValue, DEFAULTS.DURATION_EST),

      WORK_START: DEFAULTS.WORK_START,
      WORK_END: DEFAULTS.WORK_END,
      SLOT_STEP_MIN: DEFAULTS.SLOT_STEP_MIN,
    };
  }, [cfgResp]);

  // ===== Edit helpers: start options + duration options + end auto =====
  const getStartTimeOptions = (dateYmd: string, durationMin: number) => {
    if (!dateYmd) return [];
    const selected = new Date(dateYmd);
    const today = new Date();
    const isTodayFlag = selected.toDateString() === today.toDateString();

    const workStart = toMinutes(cfg.WORK_START);
    const workEnd = toMinutes(cfg.WORK_END);
    const nowMin = isTodayFlag ? (today.getHours() * 60 + today.getMinutes()) : workStart;

    const options: string[] = [];
    for (let t = workStart; t + durationMin <= workEnd; t += cfg.SLOT_STEP_MIN) {
      if (isTodayFlag && t <= nowMin) continue;
      options.push(fromMinutes(t));
    }
    return options;
  };

  const durationOptions = useMemo(() => {
    const arr: number[] = [];
    for (let m = cfg.DURATION_MIN; m <= cfg.DURATION_MAX; m += cfg.DURATION_STEP) {
      arr.push(m);
    }
    return arr;
  }, [cfg.DURATION_MIN, cfg.DURATION_MAX, cfg.DURATION_STEP]);

  useEffect(() => {
    // Khi mở edit, nếu chưa có duration -> gán estimate
    if (editOpen) {
      setFormData((prev: any) => {
        const dur = prev._duration ?? cfg.DURATION_EST;
        return { ...prev, _duration: dur };
      });
    }
  }, [editOpen, cfg.DURATION_EST]);

  // Khi thay đổi start hoặc duration -> end auto
  useEffect(() => {
    if (!formData.startTime || !formData._duration) return;
    const end = toMinutes(formData.startTime) + Number(formData._duration);
    setFormData((prev: any) => ({ ...prev, endTime: fromMinutes(end) }));
  }, [formData.startTime, formData._duration]);

  // ===== Edit validation =====
  const validateEditForm = (data: any) => {
    const e: Record<string, string> = {};
    const title = String(data.meetingTopic ?? '').trim();

    if (title.length < cfg.TOPIC_LEN_MIN) {
      e.topic = `Title must be ≥ ${cfg.TOPIC_LEN_MIN} chars.`;
    } else if (title.length > cfg.TOPIC_LEN_MAX) {
      e.topic = `Title must be ≤ ${cfg.TOPIC_LEN_MAX} chars.`;
    }

    if (!data.meetingUrl) e.url = 'Meeting link is required.';
    else if (!/^https:\/\//i.test(data.meetingUrl)) e.url = 'Link must start with https://';
    else if (!isValidMeetingUrl(data.meetingUrl)) e.url = 'Link must be a valid Zoom or Google Meet.';

    if (!data.meetingDate) e.date = 'Please select a date.';
    if (!data.startTime) e.time = 'Please select a start time.';
    if (!data._duration) e.duration = 'Please select a duration.';

    if (data.startTime && data._duration) {
      const s = toMinutes(data.startTime);
      const eMin = s + Number(data._duration);
      const wStart = toMinutes(cfg.WORK_START);
      const wEnd = toMinutes(cfg.WORK_END);

      if (eMin <= s) e.time = 'Start time must be before end time.';
      if (s < wStart || eMin > wEnd) e.time = `Meeting must be within working hours ${cfg.WORK_START}–${cfg.WORK_END}.`;
      if (data._duration < cfg.DURATION_MIN || data._duration > cfg.DURATION_MAX) {
        e.duration = `Duration must be between ${cfg.DURATION_MIN}–${cfg.DURATION_MAX} minutes.`;
      }
    }

    setEditErrors(e);
    return e;
  };

  // ===== Attendance handler =====
  const handleAttendance = async (participantId: number, newStatus: string) => {
    const participant = participants.find((p) => Number(p.id) === participantId);
    if (!participant) return;

    const currentTime = new Date();
    const meetingTime = new Date(selectedMeeting?.meetingDate);

    const meetingStartTime = new Date(meetingTime);
    meetingStartTime.setHours(
      new Date(selectedMeeting?.startTime).getHours(),
      new Date(selectedMeeting?.startTime).getMinutes(),
      0, 0
    );

    if (currentTime < meetingStartTime) {
      if (!toastIds.current['attendance-time-not-reached']) {
        toast.error('Cannot change attendance because meeting time is not yet!');
        toastIds.current['attendance-time-not-reached'] = true;
      }
      return;
    }

    const meetingDayEnd = new Date(meetingTime);
    meetingDayEnd.setHours(23, 59, 59, 999);

    if (currentTime > meetingDayEnd) {
      if (!toastIds.current['attendance-date-passed']) {
        toast.error('Cannot change attendance because meeting date has passed!');
        toastIds.current['attendance-date-passed'] = true;
      }
      return;
    }

    await updateParticipantStatus({
      participantId,
      data: {
        meetingId: participant.meetingId,
        accountId: participant.accountId,
        role: participant.role,
        status: newStatus,
      },
    });

    await refetchParticipants();

    if (!toastIds.current['attendance-success']) {
      toast.success('Check Attendance success');
      toastIds.current['attendance-success'] = true;
    }

    await completeMeeting(selectedMeeting.id);
    await refetch();
  };

  // ===== Guards =====
  if (!accountId)
    return (
      <p className="mt-4 text-center font-semibold text-red-600">
        ⚠️ You are not logged in.
      </p>
    );
  if (isLoading || cfgLoading) return <p className="mt-4 text-gray-500">⏳ Loading…</p>;
  if (isError) return <p className="mt-4 text-red-500">❌ {JSON.stringify(error)}</p>;
  if (statusLoading) return <p className="mt-4 text-gray-500">⏳ Loading statuses...</p>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">🛠 Manage the meetings you create</h1>

      <MeetingAnalytics meetings={meetings} statusOptions={statusOptions} />

      <div className="mb-6 flex gap-2 flex-wrap">
        {statusOptions.map(s => (
          <button
            key={s.value}
            onClick={() => setCurrentTab(s.value)}
            className={`rounded px-3 py-2 text-sm font-semibold ${
              currentTab === s.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={s.label}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="🔍 Find..."
          className="w-full rounded border px-3 py-2 md:w-1/2"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <select
          className="rounded border px-3 py-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as 'ALL' | 'TODAY')}
        >
          <option value="ALL">📋 ALL</option>
          <option value="TODAY">📅 Today</option>
        </select>
      </div>

      {/* --- Danh sách cuộc họp --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {meetings
          .slice()
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .filter((m) => m.status === currentTab)
          .filter((m) => m.meetingTopic.toLowerCase().includes(searchKeyword.toLowerCase()))
          .filter((m) => {
            if (dateFilter === 'TODAY') {
              const now = new Date();
              const d = new Date(m.startTime);
              return (
                d.getDate() === now.getDate() &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }
            return true;
          })
          .map((m) => {
            const meta = getStatusMeta(m.status);
            return (
              <div
                key={m.id}
                className="rounded-xl border p-4 shadow transition"
                style={{
                  background: meta?.color ? `${meta.color}20` : undefined,
                  borderColor: meta?.color || undefined,
                  opacity: m.status === statusKeys.cancelled ? 0.6 : 1,
                  pointerEvents: m.status === statusKeys.cancelled ? 'none' : 'auto',
                }}
              >
                <h2 className="text-lg font-semibold" style={{ color: meta?.color || '#1d4ed8' }}>
                  {m.meetingTopic}
                </h2>

                <p className="mt-1 text-sm font-bold" style={{ color: meta?.color || '#374151' }}>
                  {meta?.label ?? m.status}
                </p>

                <p className="text-sm text-gray-600">
                  📅 {new Date(m.startTime).toLocaleDateString('vi-VN')} — 🕒{' '}
                  {new Date(m.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} -{' '}
                  {new Date(m.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>

                <p className="text-sm text-gray-700">
                  🔗{' '}
                  <a href={m.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                    Link meeting
                  </a>
                </p>

<div className="mt-3 flex gap-2">
  {/* ===== Edit ===== */}
  {m.status !== statusKeys.completed && !attendanceOpen && (
    <Dialog open={editOpen && selectedMeeting?.id === m.id} onOpenChange={setEditOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            const start = new Date(m.startTime);
            const end = new Date(m.endTime);
            const pad2 = (n: number) => String(n).padStart(2, '0');

            const startHHmm = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`;
            const endHHmm = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`;
            const durationMin = toMinutes(endHHmm) - toMinutes(startHHmm);

            setSelectedMeeting(m);
            setFormData({
              ...m,
              meetingDate: `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
              startTime: startHHmm,
              endTime: endHHmm,
              _duration: durationMin,
              status: m.status,
            });
            setEditErrors({});
            setEditOpen(true);
          }}
        >
          ✏️ Edit
        </button>
      </DialogTrigger>

      <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">✏️ Meeting Update</h3>
        {/* Title */}
                        <label className="mb-2 block text-sm font-medium">
                          Meeting Title:
                          <span className="ml-2 text-xs text-gray-500">
                            {(String(formData.meetingTopic ?? '').trim().length)}/{cfg.TOPIC_LEN_MAX}
                          </span>
                        </label>
                        <input
                          className="w-full rounded border px-3 py-2"
                          value={formData.meetingTopic || ''}
                          maxLength={cfg.TOPIC_LEN_MAX}
                          onChange={(e) => setFormData({ ...formData, meetingTopic: e.target.value })}
                        />
                        {editErrors.topic && <p className="mt-1 text-xs text-red-600">{editErrors.topic}</p>}

                        {/* URL */}
                        <label className="mb-2 mt-4 block text-sm font-medium">Link Meeting:</label>
                        <input
                          type="url"
                          className="w-full rounded border px-3 py-2"
                          value={formData.meetingUrl || ''}
                          onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                        />
                        {editErrors.url && <p className="mt-1 text-xs text-red-600">{editErrors.url}</p>}

                        {/* Date */}
                        <label className="mb-2 mt-4 block text-sm font-medium">Day:</label>
                        <input
                          type="date"
                          className="w-full rounded border px-3 py-2"
                          value={formData.meetingDate || ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                        />
                        {editErrors.date && <p className="mt-1 text-xs text-red-600">{editErrors.date}</p>}

                        {/* Time block: Start + Duration + End (auto) */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Start */}
                          <div>
                            <label className="block text-xs text-gray-600">Start</label>
                            <select
                              className="w-full mt-1 rounded border px-3 py-2"
                              value={formData.startTime || ''}
                              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                              disabled={!formData.meetingDate}
                            >
                              <option value="" disabled>-- Select Start --</option>
                              {getStartTimeOptions(formData.meetingDate, Number(formData._duration || cfg.DURATION_EST)).map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          {/* Duration */}
                          <div>
                            <label className="block text-xs text-gray-600">Duration</label>
                            <select
                              className="w-full mt-1 rounded border px-3 py-2"
                              value={formData._duration || cfg.DURATION_EST}
                              onChange={(e) => setFormData({ ...formData, _duration: Number(e.target.value) })}
                              disabled={!formData.meetingDate}
                            >
                              {durationOptions.map((mins) => (
                                <option key={mins} value={mins}>
                                  {mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`}
                                </option>
                              ))}
                            </select>
                            {editErrors.duration && <p className="mt-1 text-xs text-red-600">{editErrors.duration}</p>}
                          </div>

                          {/* End (auto) */}
                          <div>
                            <label className="block text-xs text-gray-600">End (auto)</label>
                            <input
                              className="w-full mt-1 rounded border px-3 py-2 bg-gray-100"
                              value={formData.endTime || ''}
                              readOnly
                              placeholder="Auto after start & duration"
                            />
                          </div>
                        </div>
                        {editErrors.time && <p className="mt-1 text-xs text-red-600">{editErrors.time}</p>}

                        <button
                          className="mt-5 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          onClick={async () => {
                            const errs = validateEditForm(formData);
                            if (Object.keys(errs).length > 0) {
                              toast.error('Please fix the highlighted fields.');
                              return;
                            }

                            const startISO = toLocalIso(formData.meetingDate, formData.startTime);
                            const endISO = toLocalIso(formData.meetingDate, formData.endTime);

                            await updateMeeting({
                              meetingId: selectedMeeting.id,
                              data: {
                                projectId: selectedMeeting.projectId,
                                meetingTopic: String(formData.meetingTopic).trim(),
                                meetingDate: toLocalIso(formData.meetingDate, '00:00'),
                                meetingUrl: formData.meetingUrl,
                                startTime: startISO,
                                endTime: endISO,
                                attendees: selectedMeeting.attendees || 0,
                                participantIds: selectedMeeting.participantIds || [],
                                status: formData.status || selectedMeeting.status,
                              },
                            });

                            toast.success('✅ Meeting update successful!');
                            await refetch();
                            setEditOpen(false);
                          }}
                        >
                          💾 Save
                        </button>

      </DialogContent>
    </Dialog>
  )}

  {/* ===== Delete ===== */}
  {m.status !== statusKeys.completed && !attendanceOpen && (
    <Dialog open={deleteOpen && selectedMeeting?.id === m.id} onOpenChange={setDeleteOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          onClick={() => {
            setSelectedMeeting(m);
            setDeleteOpen(true);
          }}
        >
          🗑️ Delete
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">❗ Confirm Delete</h3>
        <p>
          Are you sure you want to delete the meeting <strong>{selectedMeeting?.meetingTopic}</strong>?
        </p>
        <button
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          onClick={async () => {
            await deleteMeeting(m.id);
            await refetch();
            setDeleteOpen(false);
          }}
        >
          🗑️ Delete
        </button>
      </DialogContent>
    </Dialog>
  )}

  {/* ===== Attendance ===== */}
  <Dialog
    open={attendanceOpen && selectedMeeting?.id === m.id}
    onOpenChange={(open) => {
      setAttendanceOpen(open);
      if (open) setSelectedMeeting(m);
      else setAttendanceDraft({});
    }}
  >
    <DialogTrigger asChild>
      <button
        className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
        onClick={() => {
          setSelectedMeeting(m);
          setAttendanceOpen(true);
        }}
      >
        📋 Check Attendance
      </button>
    </DialogTrigger>
    <AttendanceModal
      meetingTopic={selectedMeeting?.meetingTopic}
      projectId={selectedMeeting?.projectId}
      meetingStatus={selectedMeeting?.status}
      participants={participants}
      draft={attendanceDraft}
      setDraft={setAttendanceDraft}
      onSave={async () => {
        for (const [participantIdStr, newStatus] of Object.entries(attendanceDraft)) {
          const participantId = Number(participantIdStr);
          await handleAttendance(participantId, newStatus);
        }
        setAttendanceDraft({});
        setAttendanceOpen(false);
      }}
    />
  </Dialog>
</div>


              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MeetingManagementPage;
