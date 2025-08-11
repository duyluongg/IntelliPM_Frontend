import React, { useState } from 'react';
import { useAuth } from '../../../../services/AuthContext';
import {
  useGetMeetingFeedbacksByAccountQuery,
  useSubmitFeedbackMutation,
  useApproveMilestoneMutation,
  useGetRejectedFeedbacksQuery,
  useGetMyMeetingsQuery,
  useDeleteMeetingSummaryMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { API_BASE_URL } from '../../../../constants/api';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import "./MeetingFeedbackPage.css";

const MeetingFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;
const [deleteMeetingSummary] = useDeleteMeetingSummaryMutation();
const handleDeleteSummary = async (meetingTranscriptId: number) => {
  if (!window.confirm('Bạn có chắc chắn muốn xoá meeting summary này không?')) return;

  try {
    await deleteMeetingSummary(meetingTranscriptId);
    alert('Đã xoá meeting summary thành công.');
    refetch(); // refetch feedbacks
  } catch (error) {
    console.error('Delete failed', error);
    alert('Xoá meeting summary thất bại.');
  }
};


const { data: managedMeetings = [] } = useGetMeetingsManagedByQuery(accountId!, {
  skip: !accountId, // đảm bảo không gọi khi accountId chưa có
});
const { data: myMeetings = [] } = useGetMyMeetingsQuery();

const meetingIdToTopicMap = new Map<number, string>();
myMeetings.forEach((meeting) => {
  meetingIdToTopicMap.set(meeting.id, meeting.meetingTopic);
});


  const {
    data: feedbacks = [],
    isLoading,
    isError,
    error,
    refetch, // Refetch data after file upload
  } = useGetMeetingFeedbacksByAccountQuery(accountId!, {
    skip: !accountId,
  });

  const [submitFeedback] = useSubmitFeedbackMutation();
  const [approveMilestone] = useApproveMilestoneMutation();

  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [videoUrl, setVideoUrl] = useState('');

  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});
  const [uploadedTranscript, setUploadedTranscript] = useState<{ [key: number]: string }>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState<'All' | 'Today'>('All');


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

  // const handleFileUpload = async (meetingId: number) => {
  //   if (!file || !accountId) return;

  //   setIsUploading((prev) => ({ ...prev, [meetingId]: true }));

  //   const formData = new FormData();
  //   formData.append('meetingId', meetingId.toString());
  //   formData.append('audioFile', file);

  //   try {
  //     const response = await fetch(`${API_BASE_URL}meeting-transcripts`, {

  //       method: 'POST',
  //       headers: {
  //         accept: '*/*',
  //       },
  //       body: formData,
  //     });

  //     const data = await response.json();
  //     alert('Đã tải lên thành công!');
      
  //     // Store the transcript text in the uploadedTranscript state for the specific meeting
  //     setUploadedTranscript((prev) => ({
  //       ...prev,
  //       [meetingId]: data.transcriptText,
  //     }));

  //     refetch(); // Re-fetch data to update the meeting feedback list
  //   } catch (error) {
  //     console.error('Upload failed', error);
  //     alert('Tải lên thất bại.');
  //   } finally {
  //     setIsUploading((prev) => ({ ...prev, [meetingId]: false }));
  //   }
  // };
const handleFileUpload = async (meetingId: number) => {
  if (!accountId) return;

  setIsUploading((prev) => ({ ...prev, [meetingId]: true }));

  try {
    if (uploadMethod === 'file') {
      if (!file) return;

      const formData = new FormData();
      formData.append('meetingId', meetingId.toString());
      formData.append('audioFile', file);

      const response = await fetch(`${API_BASE_URL}meeting-transcripts`, {
        method: 'POST',
        headers: { accept: '*/*' },
        body: formData,
      });

      const data = await response.json();
      alert('Đã tải lên file thành công!');
      setUploadedTranscript((prev) => ({
        ...prev,
        [meetingId]: data.transcriptText,
      }));
    } else if (uploadMethod === 'url') {
      if (!videoUrl.trim()) {
        alert('Vui lòng nhập video URL!');
        return;
      }

      const adjustedUrl = videoUrl.replace(/dl=0/, 'raw=1');

      const response = await fetch(`${API_BASE_URL}meeting-transcripts/from-url`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          videoUrl: adjustedUrl,
        }),
      });

      const data = await response.json();
      alert('Đã tải lên từ URL thành công!');
      setUploadedTranscript((prev) => ({
        ...prev,
        [meetingId]: data.transcriptText,
      }));
    }

    refetch(); // Re-fetch data
  } catch (error) {
    console.error('Upload failed', error);
    alert('Tải lên thất bại.');
  } finally {
    setIsUploading((prev) => ({ ...prev, [meetingId]: false }));
  }
};

  const handleMeetingSelection = (meetingId: number) => {
    setSelectedMeetingId(meetingId);
    setFile(null); // Reset the selected file when a new meeting is selected
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

  // const filteredFeedbacks = [...feedbacks].sort(
  //   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  // );

  const filteredFeedbacks = feedbacks
  .filter((f) => {
    if (filterOption === 'Today') {
      const today = new Date().toISOString().slice(0, 10);
      return f.createdAt.slice(0, 10) === today;
    }
    return true;
  })
  .filter((f) => {
    const topic = meetingIdToTopicMap.get(f.meetingTranscriptId) || '';
    return (
      topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.summaryText || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.transcriptText || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  })
  // .sort((a, b) => {
  //   const dateA = a.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(a.createdAt).getTime();
  //   const dateB = b.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(b.createdAt).getTime();
  //   return dateB - dateA;
  // });
.sort((a, b) => {
  const isPM = user?.role === 'PROJECT_MANAGER';
  const isClient = user?.role === 'CLIENT';
  const isMeetingOwnerA = managedMeetings.some(m => m.id === a.meetingTranscriptId);
  const isMeetingOwnerB = managedMeetings.some(m => m.id === b.meetingTranscriptId);

  const aWait = a.summaryText === 'Wait for update';
  const bWait = b.summaryText === 'Wait for update';

  const aUnapproved = !a.isApproved;
  const bUnapproved = !b.isApproved;

  const today = new Date().toISOString().slice(0, 10);
  const aIsToday = a.createdAt.slice(0, 10) === today;
  const bIsToday = b.createdAt.slice(0, 10) === today;

  // Ưu tiên các buổi họp hôm nay trước
  if (aIsToday !== bIsToday) {
    return aIsToday ? -1 : 1;
  }

  // Ưu tiên theo vai trò
  if ((isPM || isMeetingOwnerA) && aWait !== bWait) {
    return aWait ? -1 : 1;
  }
  if ((isPM || isMeetingOwnerB) && aWait !== bWait) {
    return bWait ? 1 : -1;
  }

  if (isClient && aUnapproved !== bUnapproved) {
    return aUnapproved ? -1 : 1;
  }

  // Sắp theo độ gần với thời điểm hiện tại
  const now = Date.now();
  const aDate = a.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(a.createdAt).getTime();
  const bDate = b.createdAt === '0001-01-01T00:00:00' ? 0 : new Date(b.createdAt).getTime();

  const aDiff = Math.abs(now - aDate);
  const bDiff = Math.abs(now - bDate);

  return aDiff - bDiff;
});




  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        📝 Meeting Feedback & Transcript
      </h1>
      

      <div className="mb-5 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4">
  {/* 🔍 Thanh tìm kiếm */}
  <input
    type="text"
    placeholder="Search meeting..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full sm:w-1/2 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* 🔄 Bộ lọc thời gian */}
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


      {filteredFeedbacks.length === 0 ? (
        <p className="text-gray-500">There is no feedback yet.</p>
      ) : (
        <div className="space-y-6">
          {filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.meetingTranscriptId}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-md"
              onClick={() => handleMeetingSelection(feedback.meetingTranscriptId)} // Handle meeting selection
            >
              <div className="flex items-center justify-between mb-2">
<h2 className="text-xl font-semibold text-blue-700">
  📌 {meetingIdToTopicMap.get(feedback.meetingTranscriptId) || 'Không có tiêu đề'}
</h2>

                {feedback.isApproved && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
                    ✅ Approve
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

{/* Kiểm tra giá trị createdAt và thay thế nếu cần */}
{feedback.createdAt === '0001-01-01T00:00:00' ? (
  <p className="text-sm text-gray-500">🕒 Create at: pending</p>
) : (
  <p className="text-xs text-gray-400 mb-4">
    🕒 Create at: {new Date(feedback.createdAt).toLocaleString()}
  </p>
)}

              {/* Chỉ hiển thị nút "Tải lên video/audio" nếu cuộc họp đang được chọn và đã có file */}
{selectedMeetingId === feedback.meetingTranscriptId &&
  feedback.summaryText === 'Wait for update' &&
  (user?.role === 'PROJECT_MANAGER' ||
    managedMeetings.some(m => m.id === feedback.meetingTranscriptId)) && (

                <div className="mb-4">
                  {/* Chọn phương thức upload */}
{/* Chọn phương thức upload */}
<div className="mb-2 flex gap-4 items-center">
  <label className="text-sm font-semibold">Select method:</label>
  <select
    value={uploadMethod}
    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
    className="border rounded-md p-1 text-sm"
  >
    <option value="file">Upload flie WAV</option>
    <option value="url">Download from Dropbox URL</option>
  </select>
</div>

{uploadMethod === 'url' ? (
  <input
    type="text"
    placeholder="Nhập Dropbox URL..."
    value={videoUrl}
    onChange={(e) => setVideoUrl(e.target.value)}
    className="w-full mb-4 rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
  />
) : (
  <input
    type="file"
    accept="audio/*,video/*"
    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
    className="mb-4"
  />
)}

<button
  onClick={() => handleFileUpload(feedback.meetingTranscriptId)}
  disabled={
    isUploading[feedback.meetingTranscriptId] ||
    (uploadMethod === 'file' && !file) ||
    (uploadMethod === 'url' && !videoUrl)
  }
  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
    isUploading[feedback.meetingTranscriptId] ||
    (uploadMethod === 'file' && !file) ||
    (uploadMethod === 'url' && !videoUrl)
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-blue-500 hover:bg-blue-600'
  }`}
>
  {/* {isUploading[feedback.meetingTranscriptId]
    ? 'Uploading...'
    : uploadMethod === 'file'
    ? 'Upload video/audio'
    : 'Upload from URL'} */}
    {isUploading[feedback.meetingTranscriptId] ? (
  <div className="flex items-center gap-2">
    <span className="loader-videoupload" />
    <span>Uploading...</span>
  </div>
) : uploadMethod === 'file' ? (
  'Upload video/audio'
) : (
  'Upload from URL'
)}

</button>


                  {/* Hiển thị transcript sau khi tải lên thành công */}
                  {uploadedTranscript[feedback.meetingTranscriptId] && (
                    <div className="mt-4 p-4 rounded bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-800">Transcript Text:</h4>
                      <p>{uploadedTranscript[feedback.meetingTranscriptId]}</p>
                    </div>
                  )}                  
                </div>
              )}

              {selectedMeetingId === feedback.meetingTranscriptId &&
  feedback.summaryText !== 'Wait for update' &&
   rejectedFeedbacks.length === 0 && 
  (user?.role === 'PROJECT_MANAGER' ||
    managedMeetings.some(m => m.id === feedback.meetingTranscriptId)) && (

                <div className="mb-4">
                  
    <button
      onClick={() => handleDeleteSummary(feedback.meetingTranscriptId)}
      className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      Delete Summary
    </button>
                  
                </div>
                
              )}

              {/* Phần đồng ý và từ chối feedback */}
              {/* {user?.role === 'CLIENT' && feedback.summaryText !== 'Wait for update' && (
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
                      ✅ Approve
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
                      ❌ Reject
                    </button>
                  </div>

                 
                  {activeRejectId === feedback.meetingTranscriptId && !feedback.isApproved && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter reason for rejection..."
                      />
                      <button
                        onClick={() => handleRejectSubmit(feedback.meetingTranscriptId)}
                        className="self-start rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                      >
                        Send Feedback
                      </button>
                    </div>
                  )}
                </div>
              )} */}
              {user?.role === 'CLIENT' && feedback.summaryText !== 'Wait for update' && (
  <div className="flex flex-col gap-3 mb-4">
    {rejectedFeedbacks.length > 0 ? (
      // Nếu đã có reject feedback thì chỉ hiển thị status 
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
        ❌ Reject
      </span>
    ) : (
      // Nếu chưa có reject thì hiển thị 2 nút Approve / Reject
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
          ✅ Approve
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
          ❌ Reject
        </button>
      </div>
    )}

    {/* Nếu đang mở form nhập lý do từ chối */}
    {activeRejectId === feedback.meetingTranscriptId &&
      !feedback.isApproved &&
      rejectedFeedbacks.length === 0 && (
        <div className="flex flex-col gap-2">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
            placeholder="Enter reason for rejection..."
          />
          <button
            onClick={() => handleRejectSubmit(feedback.meetingTranscriptId)}
            className="self-start rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Send Feedback
          </button>
        </div>
      )}
  </div>
              )}


              {/* Hiển thị feedback bị từ chối của cuộc họp */}
              {selectedMeetingId === feedback.meetingTranscriptId && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-800">
                    🗂️ Feedback:
                  </h4>
                  {rejectedFeedbacks.length === 0 ? (
                    <p className="text-xs text-gray-500">There have been no rejections yet.</p>
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
      <div className="mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-yellow-700 flex items-center">
    <svg
      className="w-5 h-5 mr-2 text-yellow-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
      />
    </svg>
    Business Rule
  </h2>
  <p className="text-sm text-yellow-700 mt-2">
    If you're using <strong>Zoom platform</strong> and uploading a meeting recording, please ensure that:
    <br />
    – You upload <strong>.wav audio files</strong> under <strong>30MB</strong> using the direct file upload option.
    <br />
    – For <strong>larger video files</strong>, please use the <strong>Dropbox URL upload</strong> option instead.
  </p>
</div>

    </div>
  );
};

export default MeetingFeedbackPage;
