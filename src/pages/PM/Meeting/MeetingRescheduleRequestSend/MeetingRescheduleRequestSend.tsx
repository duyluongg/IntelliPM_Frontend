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
import RescheduleStatsChart from './RescheduleStatsChart';

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
{/* ====== STATS CHART ====== */}
{role !== 'CLIENT' && (
  <div className="mb-6">
    <RescheduleStatsChart
      requests={rawRequests || []}
      statusMap={statusMap}
    />
  </div>
)}

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
