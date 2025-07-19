import React, { useState } from 'react';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetAllRescheduleRequestsQuery,
  useGetRescheduleRequestsByRequesterIdQuery,
  useDeleteRescheduleRequestMutation,
  useUpdateRescheduleRequestMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingRescheduleRequestServices';
import { useDeleteMeetingMutation } from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }: { status: string }) => {
  let color = '';
  switch (status) {
    case 'PENDING':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'APPROVED':
      color = 'bg-green-100 text-green-800';
      break;
    case 'REJECTED':
      color = 'bg-red-100 text-red-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
};

const MeetingRescheduleRequestSend = () => {
  const { user } = useAuth();
  const accountId = user?.id;
  const role = user?.role;

  const { data: allData, isLoading: loadingAll, refetch: refetchAll } = useGetAllRescheduleRequestsQuery(undefined, {
    skip: !(role === 'PROJECT_MANAGER' || role === 'TEAM_LEADER'),
  });

  const { data: clientData, isLoading: loadingClient, refetch: refetchClient } = useGetRescheduleRequestsByRequesterIdQuery(accountId!, {
    skip: !(role === 'CLIENT'),
  });

  const [deleteMeeting] = useDeleteMeetingMutation();
  const [deleteRescheduleRequest] = useDeleteRescheduleRequestMutation();
  const [updateRescheduleRequest] = useUpdateRescheduleRequestMutation();

  const [pmNotes, setPmNotes] = useState<{ [key: number]: string }>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleDeleteMeeting = async (meetingId: number) => {
    await deleteMeeting(meetingId).unwrap();
    toast.success('Đã huỷ cuộc họp thành công!');
  };

  const handleUpdateRequestStatus = async (req: any, status: 'APPROVED' | 'REJECTED') => {
    const note = pmNotes[req.id] || '';
    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú PM trước khi duyệt / từ chối.');
      return;
    }
    try {
      if (status === 'APPROVED') {
        await handleDeleteMeeting(req.meetingId);
      }

      await updateRescheduleRequest({
        id: req.id,
        meetingId: req.meetingId,
        requesterId: req.requesterId,
        requestedDate: req.requestedDate,
        reason: req.reason,
        status,
        pmId: accountId ?? null,
        pmProposedDate: new Date().toISOString(),
        pmNote: note,
      }).unwrap();

      toast.success(status === 'APPROVED' ? '✅ Duyệt thành công' : '❌ Đã từ chối');

      if (role === 'CLIENT') {
        await refetchClient();
      } else {
        await refetchAll();
      }

      setPmNotes((prev) => ({ ...prev, [req.id]: '' }));
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleDeleteRescheduleRequest = async (rescheduleId: number) => {
    if (!confirm('Xác nhận huỷ yêu cầu dời lịch?')) return;
    try {
      await deleteRescheduleRequest(rescheduleId).unwrap();
      toast.success('🗑️ Huỷ yêu cầu thành công!');
      await refetchClient();
    } catch {
      toast.error('❌ Có lỗi khi huỷ yêu cầu!');
    }
  };

  const rawRequests =
    role === 'CLIENT'
      ? clientData?.data || []
      : allData?.data || [];

  const filteredRequests = rawRequests
    .filter((r: any) =>
      statusFilter === 'ALL' ? true : r.status === statusFilter
    )
    .filter(
      (r: any) =>
        r.meetingId.toString().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
    });

  if (!accountId) {
    return <p className="mt-4 text-center font-semibold text-red-600">⚠️ Bạn chưa đăng nhập.</p>;
  }
  if (loadingAll || loadingClient) {
    return <p className="mt-4 text-gray-500">⏳ Đang tải dữ liệu…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Danh Sách Yêu Cầu Dời Lịch</h1>

      <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm theo Meeting ID hoặc Lý do..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-md px-3 py-2"
        />
        <select
          className="border rounded-md px-3 py-2 w-fit"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="border rounded-xl p-5 shadow hover:shadow-lg transition bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Meeting #{req.meetingId}</h2>
              <StatusBadge status={req.status} />
            </div>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Ngày đề xuất:</span>{' '}
              {new Date(req.requestedDate).toLocaleString()}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Lý do:</span> {req.reason}
            </p>
            {req.pmProposedDate && (
              <p className="text-gray-600">
                <span className="font-medium">PM đề xuất:</span>{' '}
                {new Date(req.pmProposedDate).toLocaleString()}
              </p>
            )}
            {req.pmNote && (
              <p className="text-gray-600">
                <span className="font-medium">Ghi chú PM:</span> {req.pmNote}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {role === 'CLIENT' && req.status === 'PENDING' && (
                <button
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  onClick={() => handleDeleteRescheduleRequest(req.id!)}
                >
                  🗑️ Huỷ yêu cầu
                </button>
              )}

              {(role === 'PROJECT_MANAGER' || role === 'TEAM_LEADER') && req.status === 'PENDING' && (
                <>
                  <input
                    type="text"
                    placeholder="Nhập ghi chú PM..."
                    value={pmNotes[req.id!] || ''}

onChange={(e) =>
  setPmNotes((prev) => ({ ...prev, [req.id!]: e.target.value }))
}

                    className="w-full rounded border px-3 py-1 mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                      onClick={() => handleUpdateRequestStatus(req, 'APPROVED')}
                    >
                      ✅ Duyệt đơn
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      onClick={() => handleUpdateRequestStatus(req, 'REJECTED')}
                    >
                      ❌ Không duyệt
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingRescheduleRequestSend;
