import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetMeetingFeedbacksByAccountQuery,
  useGetMyMeetingsQuery,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
import './MeetingFeedbackPage.css';

const STATUS_GROUP = 'milestone_feedback_status'; // 🔹 đổi đúng group bạn dùng

const MeetingFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const { data: managedMeetings = [] } = useGetMeetingsManagedByQuery(accountId!, {
    skip: !accountId,
  });
  const { data: myMeetings = [] } = useGetMyMeetingsQuery(undefined, { skip: !accountId });

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
  } = useGetMeetingFeedbacksByAccountQuery(accountId!, { skip: !accountId });
  

  

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<'All' | 'Today'>('All');

  // 🔹 load dynamic category statuses
  const { data: statusResp } = useGetCategoriesByGroupQuery(STATUS_GROUP);

  // Map: name -> { label, color }
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

  const filtered = feedbacks
    .filter((f: any) => f.meetingStatus === 'COMPLETED')
    .filter((f: any) => {
      if (filterOption === 'Today') {
        const today = new Date().toISOString().slice(0, 10);
        return f.createdAt.slice(0, 10) === today;
      }
      
      return true;
    })
    .filter((f: any) => {
      const topic = meetingIdToTopicMap.get(f.meetingTranscriptId) || '';
      return (
        topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.summaryText || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a: any, b: any) => {
      const aDate = a.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(a.createdAt).getTime();
      const bDate = b.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">📝 Meeting Feedback</h1>

      <div className="mb-5 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search meeting..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setFilterOption('All')}
            className={`rounded px-4 py-2 border ${
              filterOption === 'All'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterOption('Today')}
            className={`rounded px-4 py-2 border ${
              filterOption === 'Today'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">There is no feedback yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((f: any) => {
            const topic =
              meetingIdToTopicMap.get(f.meetingTranscriptId) || 'Không có tiêu đề';
            let statusKey: string | null = null;
            let fallbackLabel = '';

            if (f.isApproved) {
              statusKey = 'APPROVED'; 
              fallbackLabel = 'Approved';
            } else if (f.summaryText === 'Wait for update') {
              statusKey = 'WAITING_UPDATE';
              fallbackLabel = 'Waiting update';
            }

            return (
              <Link
                to={`/meeting-feedback/${f.meetingTranscriptId}`}
                key={f.meetingTranscriptId}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-blue-700">📌 {topic}</h2>
                  <div className="flex items-center gap-2">
                    {statusKey && (
                      <StatusBadge value={statusKey} fallback={fallbackLabel} />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🕒{' '}
                  {f.createdAt === '0001-01-01T00:00:00'
                    ? 'pending'
                    : new Date(f.createdAt).toLocaleString()}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MeetingFeedbackPage;
