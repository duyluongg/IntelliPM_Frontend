import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetMeetingFeedbacksByAccountQuery,
  useGetMyMeetingsQuery,
  useLazyGetRejectedFeedbacksQuery,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import './MeetingFeedbackPage.css';

const STATUS_GROUP = 'milestone_feedback_status';

// ---------- Small UI helpers ----------
const EmptyState: React.FC<{ title?: string; hint?: string }> = ({
  title = 'Không có dữ liệu',
  hint = 'Thử đổi bộ lọc hoặc nhập từ khoá khác.',
}) => (
  <div className="w-full rounded-xl border bg-white p-10 text-center text-gray-500">
    <div className="text-xl font-semibold">{title}</div>
    <div className="mt-1 text-sm">{hint}</div>
  </div>
);

const PillButton: React.FC<
  React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>
> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-sm transition ${
      active
        ? 'bg-blue-500 text-white border-blue-500 shadow'
        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
    }`}
  >
    {children}
  </button>
);
type RowT = {
  statusKey: string | null;
  createdAt: Date | null;
};

function buildStatusCount(normalized: RowT[]) {
  const map = new Map<string, number>();
  for (const r of normalized) {
    const k = r.statusKey || 'OTHER';
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function buildDailyTrend(normalized: RowT[]) {
  const map = new Map<string, { APPROVED: number; WAITING_UPDATE: number; OTHER: number }>();
  for (const r of normalized) {
    const day = r.createdAt ? r.createdAt.toISOString().slice(0, 10) : 'pending';
    if (!map.has(day)) map.set(day, { APPROVED: 0, WAITING_UPDATE: 0, OTHER: 0 });
    const bucket = map.get(day)!;
    const key = (r.statusKey as 'APPROVED' | 'WAITING_UPDATE') || 'OTHER';
    bucket[key] += 1;
  }
  return Array.from(map.entries())
    .map(([date, o]) => ({ date, ...o }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Main Page ----------
const MeetingFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;
const [rejectedMeetingIds, setRejectedMeetingIds] = useState<number[]>([]);
const [triggerGetRejected] = useLazyGetRejectedFeedbacksQuery();

  // ✅ Detect role only for conditional JSX (không dùng để conditionally call hooks)
  const roleRaw = String((user as any)?.role ?? '');
  const isClient = /client|customer/i.test(roleRaw);

  // ❗️HOOKS: luôn gọi theo cùng thứ tự, không bọc trong if/return
  useGetMeetingsManagedByQuery(accountId as any, { skip: !accountId });
  const { data: myMeetings = [] } = useGetMyMeetingsQuery(undefined, { skip: !accountId });
  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
  } = useGetMeetingFeedbacksByAccountQuery(accountId as any, { skip: !accountId });
  const { data: statusResp } = useGetCategoriesByGroupQuery(STATUS_GROUP);
  useEffect(() => {
  const fetchRejectedStatuses = async () => {
    if (!feedbacks || feedbacks.length === 0) return;

    const idsWithRejected: number[] = [];

    for (const f of feedbacks) {
      try {
        const res = await triggerGetRejected(f.meetingTranscriptId).unwrap();
        if (res.some((item) => item.status === 'REJECTED')) {
          idsWithRejected.push(f.meetingTranscriptId);
        }
      } catch (err) {
        console.error(`Lỗi khi gọi rejected feedbacks cho meeting ${f.meetingTranscriptId}`, err);
      }
    }

    setRejectedMeetingIds(idsWithRejected);
  };

  fetchRejectedStatuses();
}, [feedbacks, triggerGetRejected]);


  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<'All' | 'Today'>('All');
  const [sort, setSort] = useState<{ key: 'topic' | 'status' | 'createdAt'; dir: 'asc' | 'desc' }>(
    { key: 'createdAt', dir: 'desc' }
  );

  // Build status meta map
  const statusMap = useMemo(() => {
    const m = new Map<string, { label: string; color: string | null }>();
    statusResp?.data
      ?.filter((c) => c.isActive)
      ?.sort((a, b) => a.orderIndex - b.orderIndex)
      ?.forEach((c) => m.set(c.name, { label: c.label || c.name, color: c.color }));
    return m;
  }, [statusResp]);

  const StatusBadge = ({ value, fallback }: { value?: string | null; fallback?: string }) => {
    if (!value) return null;
    const meta = statusMap.get(value);
    const label = meta?.label ?? fallback ?? value;
    const color = meta?.color ?? '#6B7280';
    return (
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold border"
        style={{ color, borderColor: color, backgroundColor: '#fff' }}
        title={value}
      >
        {label}
      </span>
    );
  };

  const meetingIdToTopicMap = useMemo(() => {
    const map = new Map<number, string>();
    myMeetings.forEach((m: any) => map.set(m.id, m.meetingTopic));
    return map;
  }, [myMeetings]);

  // ⛔️ Guard UI (đặt SAU hooks)
  if (!accountId) {
    return (
      <div className="mt-10 flex flex-col items-center">
        <p className="rounded bg-red-100 px-5 py-3 text-center text-red-600 font-semibold">
          ⚠️ Bạn chưa đăng nhập.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mt-10 flex justify-center text-gray-500">⏳ Loading...</div>;
  }

  if (isError) {
    return (
      <div className="mt-10 flex justify-center">
        <p className="rounded bg-red-100 px-5 py-3 text-red-600">
          ❌ Lỗi: {JSON.stringify(error)}
        </p>
      </div>
    );
  }

  // ---------- Data shaping ----------
  const normalized = (feedbacks as any[])
    .filter((f) => f.meetingStatus === 'COMPLETED')
    .map((f) => {
      const topic = meetingIdToTopicMap.get(f.meetingTranscriptId) || 'Không có tiêu đề';
      let statusKey: string | null = null;
      let fallbackLabel = '';
      if (f.isApproved) {
  statusKey = 'APPROVED';

} else if (f.summaryText === 'Wait for update') {
  statusKey = 'WAITING_UPDATE';
 
} else if (rejectedMeetingIds.includes(f.meetingTranscriptId)) {
  statusKey = 'REJECTED';
 
} else {
  statusKey = 'PENDING';
  
}


      const createdAt = f.createdAt === '0001-01-01T00:00:00' ? null : new Date(f.createdAt);
      return {
        id: f.meetingTranscriptId,
        topic,
        statusKey,
        fallbackLabel,
        createdAt,
        createdAtText: createdAt ? createdAt.toLocaleString() : 'pending',
      };
    })
    .filter((row) => {
      if (filterOption === 'Today') {
        if (!row.createdAt) return false;
        const todayISO = new Date().toISOString().slice(0, 10);
        return row.createdAt.toISOString().slice(0, 10) === todayISO;
      }
      return true;
    })
    .filter((row) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return row.topic.toLowerCase().includes(q);
    });

  const sorted = [...normalized].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'topic') return a.topic.localeCompare(b.topic) * dir;
    if (sort.key === 'status') return (a.statusKey || '').localeCompare(b.statusKey || '') * dir;
    // createdAt
    const at = a.createdAt ? a.createdAt.getTime() : 0;
    const bt = b.createdAt ? b.createdAt.getTime() : 0;
    return (at - bt) * dir;
  });

  // ---------- Chart data ----------
  // vẫn dùng useMemo (không đổi số lượng hooks); nếu là client => array rỗng
// (A) statusCount mới — KHÔNG dùng hook
const statusCount = isClient ? [] : buildStatusCount(normalized as any);

// (B) dailyTrend mới — KHÔNG dùng hook
const dailyTrend = isClient ? [] : buildDailyTrend(normalized as any);
  // ---------- Render ----------
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          📝 Meeting Feedback
          {isClient && (
            <span className="ml-2 text-sm text-gray-500">(Charts hidden for client role)</span>
          )}
        </h1>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search meeting..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <PillButton active={filterOption === 'All'} onClick={() => setFilterOption('All')}>
            All
          </PillButton>
          <PillButton active={filterOption === 'Today'} onClick={() => setFilterOption('Today')}>
            Today
          </PillButton>
        </div>
      </div>

      {/* Charts — hide for CLIENT/CUSTOMER */}
      {!isClient && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-gray-700">By Status</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCount} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-gray-700">Daily Trend</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="APPROVED" />
                  <Line type="monotone" dataKey="WAITING_UPDATE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">Feedback List</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Sort by:</span>
            <select
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = (e.target.value as string).split(':') as any;
                setSort({ key, dir });
              }}
              className="rounded-md border border-gray-300 p-1"
            >
              <option value="createdAt:desc">Newest</option>
              <option value="createdAt:asc">Oldest</option>
              <option value="topic:asc">Topic A → Z</option>
              <option value="topic:desc">Topic Z → A</option>
              <option value="status:asc">Status A → Z</option>
              <option value="status:desc">Status Z → A</option>
            </select>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState title="Không có feedback" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 font-medium">{row.topic}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.statusKey ? (
                        <StatusBadge value={row.statusKey} fallback={row.fallbackLabel} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.createdAtText}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/meeting-feedback/${row.id}`}
                        className="inline-block rounded-lg border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingFeedbackPage;

