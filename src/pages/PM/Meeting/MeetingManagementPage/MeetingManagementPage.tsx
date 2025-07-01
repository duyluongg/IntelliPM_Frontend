import React, { useState } from 'react';
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
} from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';

const MeetingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [formData, setFormData]   = useState<any>({});

  const { data: meetings = [], isLoading, isError, error , refetch } =
    useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();

const {
  data: participants = [],
  refetch: refetchParticipants,
} = useGetParticipantsByMeetingIdQuery(
  selectedMeeting?.id,
  { skip: !attendanceOpen }
);


  // … các hàm handle* giữ nguyên …

  if (!accountId)
    return (
      <p className="mt-4 text-center font-semibold text-red-600">
        ⚠️ Bạn chưa đăng nhập.
      </p>
    );
  if (isLoading) return <p className="mt-4 text-gray-500">⏳ Đang tải dữ liệu…</p>;
  if (isError) return <p className="mt-4 text-red-500">❌ {JSON.stringify(error)}</p>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        🛠 Quản lý cuộc họp bạn tạo
      </h1>

      {/* --- Danh sách cuộc họp --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {meetings.map((m) => (
<div
  key={m.id}
  className={`rounded-xl border bg-white p-4 shadow ${
    m.status === 'CANCELLED' ? 'opacity-50 pointer-events-none' : ''
  }`}
>

            <h2 className="text-lg font-semibold text-blue-700">{m.meetingTopic}</h2>
            {m.status === 'CANCELLED' && (
  <p className="mt-1 text-sm font-bold text-red-600">🚫 Đã huỷ</p>
)}
            <p className="text-sm text-gray-600">
              📅 {new Date(m.meetingDate).toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">
              🧑‍🤝‍🧑 {m.attendees} người tham gia
            </p>
            <p className="text-sm text-gray-700">
              🔗{' '}
              <a
                href={m.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                Link họp
              </a>
            </p>

            <div className="mt-3 flex gap-2">
              {/* Sửa */}
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
                    ✏️ Sửa
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
  <h3 className="mb-4 text-lg font-semibold">✏️ Cập nhật cuộc họp</h3>

  <label className="mb-2 block text-sm font-medium">Chủ đề</label>
  <input
    className="w-full rounded border px-3 py-2"
    value={formData.meetingTopic || ''}
    onChange={(e) => setFormData({ ...formData, meetingTopic: e.target.value })}
  />

  <label className="mb-2 mt-4 block text-sm font-medium">Link họp</label>
  <input
    type="url"
    className="w-full rounded border px-3 py-2"
    value={formData.meetingUrl || ''}
    onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
  />

  <label className="mb-2 mt-4 block text-sm font-medium">Ngày họp</label>
  <input
    type="date"
    className="w-full rounded border px-3 py-2"
    value={formData.meetingDate || ''}
    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
  />

  <label className="mb-2 mt-4 block text-sm font-medium">Giờ bắt đầu</label>
  <input
    type="time"
    className="w-full rounded border px-3 py-2"
    value={formData.startTime || ''}
    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
  />

  <label className="mb-2 mt-4 block text-sm font-medium">Giờ kết thúc</label>
  <input
    type="time"
    className="w-full rounded border px-3 py-2"
    value={formData.endTime || ''}
    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
  />

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
  💾 Lưu
</button>

</DialogContent>

              </Dialog>

              {/* Xoá */}
              <Dialog open={deleteOpen && selectedMeeting?.id === m.id} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={() => {
                      setSelectedMeeting(m);
                      setDeleteOpen(true);
                    }}
                  >
                    🗑️ Xoá
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-lg bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold">❗ Xác nhận xoá</h3>
                  <p>
                    Bạn chắc chắn muốn xoá cuộc họp{' '}
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
                    🗑️ Xoá
                  </button>
                </DialogContent>
              </Dialog>

              {/* Điểm danh */}
              <Dialog
                open={attendanceOpen && selectedMeeting?.id === m.id}
                onOpenChange={setAttendanceOpen}
              >
                <DialogTrigger asChild>
                  <button
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    onClick={() => {
                      setSelectedMeeting(m);
                      setAttendanceOpen(true);
                    }}
                  >
                    📋 Điểm danh
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-semibold">
                    📋 Điểm danh: {selectedMeeting?.meetingTopic}
                  </h3>

                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="mb-2 flex items-center justify-between rounded border p-3"
                    >
                      <div>
                        <p className="font-medium">👤 ID: {p.accountId}</p>
                        <p className="text-sm text-gray-600">Vai trò: {p.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`rounded px-3 py-1 text-sm ${
                            p.status === 'Present'
                              ? 'bg-blue-600 text-white'
                              : 'border hover:bg-gray-100'
                          }`}
onClick={async () => {
  await updateParticipantStatus({
    participantId: p.id,
    data: { ...p, status: 'Present' },
  });
  await refetchParticipants();
  toast.success('✅ Điểm danh thành công!');

  await updateMeeting({
    meetingId: selectedMeeting.id,
    data: {
      ...selectedMeeting,
      status: 'COMPLETED', // THÊM field này vào backend Meeting nếu chưa có
    },
  });
}}
                        >
                          Có mặt
                        </button>
                        <button
                          className={`rounded px-3 py-1 text-sm ${
                            p.status === 'Absent'
                              ? 'bg-red-600 text-white'
                              : 'border hover:bg-gray-100'
                          }`}
onClick={async () => {
  await updateParticipantStatus({
    participantId: p.id,
    data: { ...p, status: 'Absent' },
  });
  await refetchParticipants();
  toast.success('✅ Điểm danh thành công!');

  await updateMeeting({
    meetingId: selectedMeeting.id,
    data: {
      ...selectedMeeting,
      status: 'COMPLETED',
    },
  });
}}

                        >
                          Vắng
                        </button>
                      </div>
                    </div>
                  ))}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingManagementPage;

