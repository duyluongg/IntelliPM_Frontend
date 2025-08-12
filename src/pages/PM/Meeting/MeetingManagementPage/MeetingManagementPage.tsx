import React, { useState,useEffect, useRef } from 'react';
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
import AttendanceModal from '../MeetingManagementPage/AttendanceModal';

const MeetingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('ACTIVE');
  const [formData, setFormData]   = useState<any>({});
const [attendanceDraft, setAttendanceDraft] = useState<Record<number, string>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY'>('ALL');
  const toastIds = useRef<{ [key: string]: boolean }>({});

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
      const initialDraft: Record<number, string> = {};
      participants.forEach((p) => {
        if (p.status) initialDraft[p.id] = p.status; // không hardcode
      });
      setAttendanceDraft(initialDraft);
    }
  }, [attendanceOpen, participants]);

useEffect(() => {
  if (!meetings || meetings.length === 0) return;

  const now = new Date();

  meetings.forEach(async (meeting) => {
    // Điều kiện: chưa điểm danh (ACTIVE) + quá 24h kể từ meetingDate
    if (meeting.status === statusKeys.active) {
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
        ⚠️ You are not logged in.
      </p>
    );
  if (isLoading) return <p className="mt-4 text-gray-500">⏳ Loading</p>;
  if (isError) return <p className="mt-4 text-red-500">❌ {JSON.stringify(error)}</p>;
  if (statusLoading) return <p className="mt-4 text-gray-500">⏳ Loading statuses...</p>;


// Điểm danh và cập nhật trạng thái cuộc họp
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
        status: newStatus, // 👈 lấy từ dynamic category
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


  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        🛠 Manage the meetings you create
      </h1>
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
      const meta = getStatusMeta(m.status); // 👈 lấy color/label theo dynamic category

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

          {/* label status động */}
          <p className="mt-1 text-sm font-bold" style={{ color: meta?.color || '#374151' }}>
            {meta?.label ?? m.status}
          </p>

          <p className="text-sm text-gray-600">
            📅 {new Date(m.startTime).toLocaleDateString('vi-VN')} — 🕒{' '}
            {new Date(m.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} -{' '}
            {new Date(m.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>

          <p className="text-sm text-gray-700">🧑‍🤝‍🧑 {m.attendees} member</p>
          <p className="text-sm text-gray-700">
            🔗{' '}
            <a href={m.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
              Link meeting
            </a>
          </p>

          <div className="mt-3 flex gap-2">
            {!(attendanceOpen && selectedMeeting?.id === m.id) && (
              <>
                {/* Sửa */}
                {m.status !== statusKeys.completed && (
                  <Dialog open={editOpen && selectedMeeting?.id === m.id} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                        onClick={() => {
                          const formattedFormData = {
                            ...m,
                            meetingDate: m.meetingDate.split('T')[0], // YYYY-MM-DD
                            startTime: new Date(m.startTime).toISOString().substring(11, 16), // HH:mm
                            endTime: new Date(m.endTime).toISOString().substring(11, 16),   // HH:mm
                            status: m.status,
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

                      {/* Status động từ Dynamic Category */}
                      {/* <label className="mb-2 mt-4 block text-sm font-medium">Status</label>
                      <select
                        className="w-full rounded border px-3 py-2"
                        value={formData.status || ''}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select> */}

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
                          const isSelected = slot.start === formData.startTime && slot.end === formData.endTime;
                          return (
                            <option key={slot.label} value={`${slot.start}|${slot.end}`} disabled={isSelected}>
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
                              status: formData.status || m.status, // 👈 dynamic
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
                {m.status !== statusKeys.completed && (
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

