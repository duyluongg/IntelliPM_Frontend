import React, { useState } from 'react';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetMeetingFeedbacksByAccountQuery,
  useSubmitFeedbackMutation,
  useApproveMilestoneMutation,
  useGetRejectedFeedbacksQuery,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';

const MeetingFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
  } = useGetMeetingFeedbacksByAccountQuery(accountId!, {
    skip: !accountId,
  });

  const [submitFeedback] = useSubmitFeedbackMutation();
  const [approveMilestone] = useApproveMilestoneMutation();

  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);

  const {
    data: rejectedFeedbacks = [],
    refetch: refetchRejected,
  } = useGetRejectedFeedbacksQuery(selectedMeetingId!, {
    skip: !selectedMeetingId,
  });

  const handleRejectSubmit = async (meetingId: number) => {
    if (!accountId || !feedbackText.trim()) return;

    await submitFeedback({
      meetingId,
      accountId,
      feedbackText,
      status: 'Reject',
    });

    alert('Đã gửi phản hồi từ chối.');
    setFeedbackText('');
    setActiveRejectId(null);

    setSelectedMeetingId(meetingId);
    refetchRejected();
  };

  const handleApprove = async (meetingId: number) => {
    if (!accountId) return;

    await approveMilestone({
      meetingId,
      accountId,
    });

    alert('Đã duyệt thành công.');
  };

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
    return (
      <div className="mt-10 flex justify-center">
        <p className="text-gray-500">⏳ Đang tải dữ liệu feedback...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 flex justify-center">
        <p className="rounded bg-red-100 px-5 py-3 text-red-600">
          ❌ Đã xảy ra lỗi: {JSON.stringify(error)}
        </p>
      </div>
    );
  }

  const sortedFeedbacks = [...feedbacks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        📝 Meeting Feedback & Transcript
      </h1>

      {sortedFeedbacks.length === 0 ? (
        <p className="text-gray-500">Hiện chưa có feedback nào.</p>
      ) : (
        <div className="space-y-6">
          {sortedFeedbacks.map((feedback) => (
            <div
              key={feedback.meetingTranscriptId}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-blue-700">
                  📌 {feedback.meetingTopic}
                </h2>
                {feedback.isApproved && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
                    ✅ Đã duyệt
                  </span>
                )}
              </div>

              <p className="text-base text-gray-700 whitespace-pre-wrap mb-2">
                <strong className="text-gray-800">Summary:</strong><br />
                {feedback.summaryText}
              </p>

              <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">
                <strong className="text-gray-800">Transcript:</strong><br />
                {feedback.transcriptText}
              </p>

              <p className="text-xs text-gray-400 mb-4">
                🕒 Tạo lúc: {new Date(feedback.createdAt).toLocaleString()}
              </p>

              {user?.role === 'CLIENT' && feedback.summaryText !== 'Chờ cập nhật' && (
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(feedback.meetingTranscriptId)}
                      disabled={feedback.isApproved}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                        feedback.isApproved
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      ✅ Đồng ý
                    </button>
                    <button
                      onClick={() => {
                        setActiveRejectId(feedback.meetingTranscriptId);
                        setSelectedMeetingId(feedback.meetingTranscriptId);
                        refetchRejected();
                      }}
                      disabled={feedback.isApproved}
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                        feedback.isApproved
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      ❌ Từ chối
                    </button>
                  </div>

                  {activeRejectId === feedback.meetingTranscriptId && !feedback.isApproved && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Nhập lý do từ chối..."
                      />
                      <button
                        onClick={() => handleRejectSubmit(feedback.meetingTranscriptId)}
                        className="self-start rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                      >
                        Gửi phản hồi từ chối
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedMeetingId === feedback.meetingTranscriptId && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-800">
                    🗂️ Các feedback từ chối:
                  </h4>
                  {rejectedFeedbacks.length === 0 ? (
                    <p className="text-xs text-gray-500">Chưa có phản hồi từ chối nào.</p>
                  ) : (
                    <ul className="space-y-2">
                      {rejectedFeedbacks
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                        .map((item) => (
                          <li
                            key={item.id}
                            className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700"
                          >
                            <p>
                              <strong>{item.accountName}:</strong> {item.feedbackText}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              🕒 {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingFeedbackPage;
