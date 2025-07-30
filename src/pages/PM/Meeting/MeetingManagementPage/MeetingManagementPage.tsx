import React, { useState,useEffect } from 'react';
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

const MeetingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [formData, setFormData]   = useState<any>({});
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, 'Present' | 'Absent'>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY'>('ALL');
  



  const { data: meetings = [], isLoading, isError, error , refetch } =
    useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();
  const [completeMeeting] = useCompleteMeetingMutation();

  const timeSlots = [
  { label: '08:00 AM - 10:30 AM', start: '08:00', end: '10:30' },
  { label: '10:30 AM - 1:00 PM', start: '10:30', end: '13:00' },
  { label: '1:00 PM - 3:30 PM', start: '13:00', end: '15:30' },
  { label: '3:30 PM - 6:00 PM', start: '15:30', end: '18:00' },
  { label: '6:00 PM - 8:30 PM', start: '18:00', end: '20:30' },
  { label: '8:30 PM - 11:00 PM', start: '20:30', end: '23:00' },
];


const {
  data: participants = [],
  refetch: refetchParticipants,
} = useGetParticipantsByMeetingIdQuery(
  selectedMeeting?.id,
  { skip: !attendanceOpen }
);

useEffect(() => {
  if (accountId) {
    refetch();
  }
}, [accountId]);

useEffect(() => {
  if (attendanceOpen && participants.length > 0) {
    const initialDraft: Record<number, 'Present' | 'Absent'> = {};
    participants.forEach((p) => {
      if (p.status === 'Present' || p.status === 'Absent') {
        initialDraft[p.id] = p.status;
      }
    });
    setAttendanceDraft(initialDraft);
  }
}, [attendanceOpen, participants]);

useEffect(() => {
  if (!meetings || meetings.length === 0) return;

  const now = new Date();

  meetings.forEach(async (meeting) => {
    // Điều kiện: chưa điểm danh (ACTIVE) + quá 24h kể từ meetingDate
    if (meeting.status === 'ACTIVE') {
      const meetingDate = new Date(meeting.meetingDate);
      const deadline = new Date(meetingDate);
      deadline.setDate(meetingDate.getDate() + 1); // +24h

      if (now > deadline) {
        try {
          await deleteMeeting(meeting.id); // dùng API cũ
          toast.success(`🗑️ Cuộc họp "${meeting.meetingTopic}" đã bị xoá vì quá hạn`);
          await refetch(); // cập nhật lại danh sách
        } catch (error) {
          console.error(`❌ Lỗi khi xoá cuộc họp ${meeting.id}:`, error);
        }
      }
    }
  });
}, [meetings]);




  // … các hàm handle* giữ nguyên …

  if (!accountId)
    return (
      <p className="mt-4 text-center font-semibold text-red-600">
        ⚠️ Bạn chưa đăng nhập.
      </p>
    );
  if (isLoading) return <p className="mt-4 text-gray-500">⏳ Đang tải dữ liệu…</p>;
  if (isError) return <p className="mt-4 text-red-500">❌ {JSON.stringify(error)}</p>;

// Điểm danh và cập nhật trạng thái cuộc họp
const handleAttendance = async (participantId: number, newStatus: 'Present' | 'Absent' | 'Active') => {
  // Lấy thông tin cuộc họp hiện tại
  const participant = participants.find((p) => Number(p.id) === participantId);
  if (!participant) return;

  // Kiểm tra thời gian hiện tại và ngày giờ cuộc họp
  const currentTime = new Date();
  const meetingTime = new Date(selectedMeeting?.meetingDate);  // Sử dụng selectedMeeting để lấy ngày và giờ cuộc họp

  // Cập nhật giờ bắt đầu của cuộc họp (startTime)
  const meetingStartTime = new Date(meetingTime);
  meetingStartTime.setHours(new Date(selectedMeeting?.startTime).getHours(), new Date(selectedMeeting?.startTime).getMinutes(), 0, 0);

  // Kiểm tra nếu thời gian hiện tại đã qua thời gian bắt đầu cuộc họp
  if (currentTime < meetingStartTime) {
    // Nếu chưa đến giờ cuộc họp, không cho phép thay đổi điểm danh
    toast.error('❌ Không thể thay đổi điểm danh vì chưa đến giờ cuộc họp!');
    return;
  }

  // Kiểm tra nếu ngày hiện tại đã qua ngày diễn ra cuộc họp
  const meetingDayEnd = new Date(meetingTime);
  meetingDayEnd.setHours(23, 59, 59, 999); // Đặt giờ cuối cùng của ngày cuộc họp

  if (currentTime > meetingDayEnd) {
    // Nếu đã qua ngày cuộc họp, không cho phép thay đổi điểm danh
    toast.error('❌ Không thể thay đổi điểm danh vì đã qua ngày cuộc họp!');
    return;
  }

  // Thực hiện điểm danh
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
  toast.success('✅ Điểm danh thành công!');

  // Chỉ hoàn tất cuộc họp khi tất cả người tham gia đã điểm danh (hoặc theo logic khác của bạn)
  
    await completeMeeting(selectedMeeting.id);  // 👈 Gọi API mới ở đây để hoàn thành cuộc họp
  

  await refetch();
};




  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        🛠 Manage the meetings you create
      </h1>
<div className="mb-6 flex gap-4">
  <button
    onClick={() => setCurrentTab('ACTIVE')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    📆 Coming soon
  </button>
  <button
    onClick={() => setCurrentTab('COMPLETED')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'COMPLETED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    ✅ Completed
  </button>
  <button
    onClick={() => setCurrentTab('CANCELLED')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'CANCELLED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    ❌ Cancelled
  </button>
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
         .filter((m) => m.status === currentTab)
         .filter((m) =>
    m.meetingTopic.toLowerCase().includes(searchKeyword.toLowerCase())
  )
.filter((m) => {
  if (dateFilter === 'TODAY') {
    const now = new Date();
    const meetingDate = new Date(m.startTime); // dùng startTime đáng tin cậy hơn

    return (
      meetingDate.getDate() === now.getDate() &&
      meetingDate.getMonth() === now.getMonth() &&
      meetingDate.getFullYear() === now.getFullYear()
    );
  }
  return true;
})

         
  .map((m) => (
    <div
      key={m.id}
      className={`
       
        ${m.status === 'CANCELLED' ? 'opacity-50 pointer-events-none bg-red-100 border-red-300' : ''}
        ${m.status === 'COMPLETED' ? '' : ''}
        ${m.status === 'ACTIVE' ? 'bg-gray-100 border-gray-300' : ''}
      `}
    >
<div
  key={m.id}
  className={`
  rounded-xl border p-4 shadow transition
  ${m.status === 'CANCELLED' ? 'opacity-50 pointer-events-none bg-red-100 border-red-300' : ''}
  ${m.status === 'COMPLETED' ? 'bg-green-100 border-green-300' : ''}
  ${m.status === 'ACTIVE' ? 'bg-gray-100 border-gray-300' : ''}
`}

>

            <h2 className="text-lg font-semibold text-blue-700">{m.meetingTopic}</h2>
            {m.status === 'CANCELLED' && (
  <p className="mt-1 text-sm font-bold text-red-600">🚫 Cancelled</p>
)}
<p className="text-sm text-gray-600">
  📅 {new Date(m.startTime).toLocaleDateString('vi-VN')} — 🕒{' '}
  {new Date(m.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })} -{' '}
  {new Date(m.endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}
</p>

            <p className="text-sm text-gray-700">
              🧑‍🤝‍🧑 {m.attendees} member
            </p>
            <p className="text-sm text-gray-700">
              🔗{' '}
              <a
                href={m.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                Link meeting
              </a>
            </p>
<div className="mt-3 flex gap-2">
    {!(attendanceOpen && selectedMeeting?.id === m.id) && (
    <>
  {/* Sửa */}
  {m.status !== 'COMPLETED' && (
    <Dialog open={editOpen && selectedMeeting?.id === m.id} onOpenChange={setEditOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => {
            const formattedFormData = {
              ...m,
              meetingDate: m.meetingDate.split('T')[0], // YYYY-MM-DD
              startTime: new Date(m.startTime).toISOString().substring(11, 16), // HH:mm
              endTime: new Date(m.endTime).toISOString().substring(11, 16),     // HH:mm
            };
            setSelectedMeeting(m);
            setFormData(formattedFormData);
            setEditOpen(true);
          }}
        >
          ✏️ Edit
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">✏️ Meeting Update</h3>

        <label className="mb-2 block text-sm font-medium">Meeting Title:</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={formData.meetingTopic || ''}
          onChange={(e) => setFormData({ ...formData, meetingTopic: e.target.value })}
        />

        <label className="mb-2 mt-4 block text-sm font-medium">Link Meeting:</label>
        <input
          type="url"
          className="w-full rounded border px-3 py-2"
          value={formData.meetingUrl || ''}
          onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
        />

        <label className="mb-2 mt-4 block text-sm font-medium">Day:</label>
        <input
          type="date"
          className="w-full rounded border px-3 py-2"
          value={formData.meetingDate || ''}
          onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
        />

        {/* <label className="mb-2 mt-4 block text-sm font-medium">Start time</label>
        <input
          type="time"
          className="w-full rounded border px-3 py-2"
          value={formData.startTime || ''}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
        />

        <label className="mb-2 mt-4 block text-sm font-medium">End time</label>
        <input
          type="time"
          className="w-full rounded border px-3 py-2"
          value={formData.endTime || ''}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
        /> */}
<label className="mb-2 mt-4 block text-sm font-medium">Time Slot</label>
<select
  className="w-full rounded border px-3 py-2"
  value={`${formData.startTime}|${formData.endTime}`}
  onChange={(e) => {
    const [start, end] = e.target.value.split('|');
    setFormData({ ...formData, startTime: start, endTime: end });
  }}
>
  {timeSlots.map((slot) => {
    const isSelected =
      slot.start === formData.startTime && slot.end === formData.endTime;

    return (
      <option
        key={slot.label}
        value={`${slot.start}|${slot.end}`}
        disabled={isSelected}
      >
        {slot.label} {isSelected ? '(Current)' : ''}
      </option>
    );
  })}
</select>

        <button
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={async () => {
            const startISO = new Date(`${formData.meetingDate}T${formData.startTime}`).toISOString();
            const endISO = new Date(`${formData.meetingDate}T${formData.endTime}`).toISOString();

            await updateMeeting({
              meetingId: m.id,
              data: {
                projectId: m.projectId,
                meetingTopic: formData.meetingTopic,
                meetingDate: startISO,
                meetingUrl: formData.meetingUrl,
                startTime: startISO,
                endTime: endISO,
                attendees: m.attendees || 0,
                participantIds: m.participantIds || [],
              },
            });

            toast.success('✅ Cập nhật cuộc họp thành công!');
            await refetch();
            setEditOpen(false);
          }}
        >
          💾 Save
        </button>
      </DialogContent>
    </Dialog>
  )}

  {/* Xoá */}
  {m.status !== 'COMPLETED' && (
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
          Are you sure you want to delete the meeting{' '}
          <strong>{selectedMeeting?.meetingTopic}</strong>?
        </p>
        <button
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          onClick={async () => {
            await deleteMeeting(m.id);
            await refetch();
            setDeleteOpen(false);
          }}
        >
          🗑️ delete
        </button>
      </DialogContent>
    </Dialog>
  )}
  </>
 )}
  {/* Điểm danh */}

<Dialog
  open={attendanceOpen && selectedMeeting?.id === m.id} 
onOpenChange={(open) => {
  setAttendanceOpen(open);
  if (open) {
    setSelectedMeeting(m);
  } else {
    setAttendanceDraft({});
  }
}}


>
  <DialogTrigger asChild>
    <button
      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
      onClick={() => {
        // Cập nhật selectedMeeting khi mở dialog
        setSelectedMeeting(m);  // Cập nhật cuộc họp đang được chọn
        setAttendanceOpen(true); // Mở dialog
      }}
    >
      📋 Check Attendance:
    </button>
  </DialogTrigger>
 
<DialogContent className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
  <h3 className="mb-4 text-lg font-semibold">
    📋 Attendance: {selectedMeeting?.meetingTopic}
  </h3>

  {participants.map((p) => (
    <div
      key={p.id}
      className="mb-3 flex flex-col rounded border p-4 shadow-sm md:flex-row md:items-start md:justify-between"
    >
      <div className="mb-2 md:mb-0">
        <p className="font-semibold text-gray-800">👤 Name: {p.fullName}</p>
        <p className="text-sm text-gray-600">Role: {p.role}</p>
      </div>

      {/* Nút dọc: flex-col */}
      <div className="flex w-full flex-col gap-2 md:w-28">
        <button
          className={`w-full rounded px-4 py-2 text-sm font-medium ${
            attendanceDraft[p.id] === 'Present'
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setAttendanceDraft((prev) => ({ ...prev, [p.id]: 'Present' }))}
        >
          Present
        </button>
        <button
          className={`w-full rounded px-4 py-2 text-sm font-medium ${
            attendanceDraft[p.id] === 'Absent'
              ? 'bg-red-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setAttendanceDraft((prev) => ({ ...prev, [p.id]: 'Absent' }))}
        >
          Absent
        </button>
      </div>
    </div>
  ))}

  <button
    className="mt-6 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    onClick={async () => {
      for (const [participantIdStr, newStatus] of Object.entries(attendanceDraft)) {
        const participantId = Number(participantIdStr);
        await handleAttendance(participantId, newStatus);
      }

      setAttendanceDraft({});
      setAttendanceOpen(false);
    }}
  >
    💾 Save Attendance
  </button>
</DialogContent>
</Dialog>
</div>
          </div>
           </div>
        ))}
       
      </div>
    </div>
  );
};

export default MeetingManagementPage;

