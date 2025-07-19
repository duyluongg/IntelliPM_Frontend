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

  const { data: meetings = [], isLoading, isError, error , refetch } =
    useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [updateMeeting] = useUpdateMeetingMutation();
  const [updateParticipantStatus] = useUpdateParticipantStatusMutation();
  const [completeMeeting] = useCompleteMeetingMutation();

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

// Điểm danh và cập nhật trạng thái cuộc họp
// const handleAttendance = async (participantId: number, newStatus: 'Present' | 'Absent' | 'Active') => {
//   // Lấy thông tin cuộc họp hiện tại
//   const participant = participants.find((p) => Number(p.id) === participantId);
//   if (!participant) return;

//   // Kiểm tra thời gian hiện tại và ngày cuộc họp
//   const currentTime = new Date();
//   const meetingTime = new Date(selectedMeeting?.meetingDate);  // Sử dụng selectedMeeting để lấy ngày và giờ cuộc họp

//   // Kiểm tra nếu ngày hiện tại đã qua ngày diễn ra cuộc họp
//   const meetingDayEnd = new Date(meetingTime);
//   meetingDayEnd.setHours(23, 59, 59, 999); // Đặt giờ cuối cùng của ngày cuộc họp

//   if (currentTime > meetingDayEnd) {
//     // Nếu đã qua ngày cuộc họp, không cho phép thay đổi điểm danh
//     toast.error('❌ Không thể thay đổi điểm danh vì đã qua ngày cuộc họp!');
//     return;
//   }

//   // Thực hiện điểm danh
//   await updateParticipantStatus({
//     participantId,
//     data: {
//       meetingId: participant.meetingId,
//       accountId: participant.accountId,
//       role: participant.role,
//       status: newStatus,
//     },
//   });

//   await refetchParticipants();
//   toast.success('✅ Điểm danh thành công!');

//   // Chỉ hoàn tất cuộc họp khi tất cả người tham gia đã điểm danh (hoặc theo logic khác của bạn)
//     // Kiểm tra xem tất cả người tham gia đã có trạng thái khác "Active"
//     await completeMeeting(selectedMeeting.id);  // 👈 Gọi API mới ở đây để hoàn thành cuộc họp
  

//   await refetch();
// };

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
        🛠 Quản lý cuộc họp bạn tạo
      </h1>
<div className="mb-6 flex gap-4">
  <button
    onClick={() => setCurrentTab('ACTIVE')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    📆 Sắp diễn ra
  </button>
  <button
    onClick={() => setCurrentTab('COMPLETED')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'COMPLETED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    ✅ Đã diễn ra
  </button>
  <button
    onClick={() => setCurrentTab('CANCELLED')}
    className={`rounded px-4 py-2 font-semibold ${
      currentTab === 'CANCELLED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    ❌ Đã huỷ
  </button>
</div>

      {/* --- Danh sách cuộc họp --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {meetings  .filter((m) => m.status === currentTab)
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
  )}

  {/* Điểm danh */}

<Dialog
  open={attendanceOpen && selectedMeeting?.id === m.id} 
  onOpenChange={(open) => {
    // Khi mở/đóng dialog, cập nhật trạng thái attendanceOpen
    setAttendanceOpen(open);

    // Nếu mở dialog, cập nhật selectedMeeting với cuộc họp đang mở
    if (open) {
      setSelectedMeeting(m);
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
              p.status === 'Present' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
            }`}
            onClick={() => handleAttendance(p.id, 'Present')}
          >
            Có mặt
          </button>
          <button
            className={`rounded px-3 py-1 text-sm ${
              p.status === 'Absent' ? 'bg-red-600 text-white' : 'border hover:bg-gray-100'
            }`}
            onClick={() => handleAttendance(p.id, 'Absent')}
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
           </div>
        ))}
       
      </div>
    </div>
  );
};

export default MeetingManagementPage;

