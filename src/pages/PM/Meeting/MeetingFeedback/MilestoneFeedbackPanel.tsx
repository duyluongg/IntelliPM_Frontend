
// src/pages/.../MilestoneFeedbackPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../services/AuthContext';
import axios from 'axios';
import {
  useGetMeetingFeedbackByTranscriptIdQuery,
  useApproveMilestoneMutation,
  useSubmitFeedbackMutation,
  useGetRejectedFeedbacksQuery,
  useDeleteMeetingSummaryMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetMyMeetingsQuery,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { API_BASE_URL } from '../../../../constants/api';

// ⬇️ NEW: dynamic categories hook
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
import AiResponseEvaluationPopup from '../../../../components/AiResponse/AiResponseEvaluationPopup';

const MilestoneFeedbackPanel: React.FC = () => {
  const { transcriptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const accountId = user?.id;

  // ⚠️ hiện tại page dùng transcriptId và backend map meetingId == transcriptId
  const id = Number(transcriptId);

  // ====== ALL HOOKS MUST BE BEFORE ANY EARLY RETURN ======
  // local states
  const [activeReject, setActiveReject] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTranscript, setUploadedTranscript] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [evalPayload, setEvalPayload] = useState<string>('');





  // edit/delete feedback states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // queries & mutations
  const { data: feedback, isLoading, isError, error, refetch } =
    useGetMeetingFeedbackByTranscriptIdQuery(id, { skip: !id });

  const { data: myMeetings = [] } = useGetMyMeetingsQuery(undefined, { skip: !accountId });

  const { data: managedMeetings = [] } = useGetMeetingsManagedByQuery(accountId!, {
    skip: !accountId,
  });
  const currentMeeting: any = useMemo(
  () => myMeetings.find((m: any) => m.id === id),
  [myMeetings, id]
);
const projectIdFromMeeting: number = currentMeeting?.projectId ?? 0;

const AI_FEATURE = 'MEETING_SUMMARY';

  const [submitFeedback] = useSubmitFeedbackMutation();
  const [approveMilestone] = useApproveMilestoneMutation();
  const [deleteMeetingSummary] = useDeleteMeetingSummaryMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const {
    data: rejectedFeedbacks = [],
    refetch: refetchRejected,
  } = useGetRejectedFeedbacksQuery(id, { skip: !id });

  // ⬇️ NEW: load dynamic categories for milestone_feedback_status
  const { data: statusResp } = useGetCategoriesByGroupQuery('milestone_feedback_status');

  // Map: name -> { label, color }
  const statusMap = useMemo(() => {
    const m = new Map<string, { label: string; color: string | null }>();
    statusResp?.data
      ?.filter((c) => c.isActive)
      ?.sort((a, b) => a.orderIndex - b.orderIndex)
      ?.forEach((c) => m.set(c.name, { label: c.label || c.name, color: c.color }));
    return m;
  }, [statusResp]);

  // Options for <select>
  const statusOptions = useMemo(
    () =>
      (statusResp?.data || [])
        .filter((c) => c.isActive)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((c) => ({ value: c.name, label: c.label || c.name, color: c.color })),
    [statusResp]
  );

  // Selected status for new reject
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!selectedStatus && statusOptions.length > 0) {
      setSelectedStatus(statusOptions[0].value);
    }
  }, [statusOptions, selectedStatus]);

  const meetingTopic = useMemo(() => {
    const m = myMeetings.find((m: any) => m.id === id);
    return m?.meetingTopic || feedback?.meetingTopic || 'Không có tiêu đề';
  }, [myMeetings, id, feedback]);

  const canPMControl =
    user?.role === 'PROJECT_MANAGER' || managedMeetings.some((m: any) => m.id === id);

  // ====== BADGE COMPONENT ======
  const StatusBadge = ({ value }: { value?: string | null }) => {
    const meta = (value && statusMap.get(value)) || null;
    const label = meta?.label ?? value ?? '—';
    const color = meta?.color ?? '#6B7280'; // fallback gray-500

    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
        style={{ color, borderColor: color, backgroundColor: '#ffffff' }}
        title={value ?? ''}
      >
        {label}
      </span>
    );
  };

  // ====== EARLY RETURNS AFTER ALL HOOKS ======
  if (!accountId) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded bg-red-100 px-5 py-3 text-center text-red-600 font-semibold">
          ⚠️ You are not logged in.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-5xl p-6 text-gray-500">⏳ Loading detail…</div>;
  }
  if (isError || !feedback) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded bg-red-100 px-5 py-3 text-red-600">
          ❌ Error loading details: {JSON.stringify(error)}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded bg-gray-800 text-white px-4 py-2"
        >
          ← Back
        </button>
      </div>
    );
  }

  const isWaiting = feedback.summaryText === 'Wait for update';
  const hasAnyFeedback = feedback.isApproved || (rejectedFeedbacks?.length ?? 0) > 0;

  const onApprove = async () => {
    if (!accountId) return;
    await approveMilestone({ meetingId: id, accountId });
    toast.success('Approved successfully.');
    refetch();
  };

// đặt constant ở trên component (ngay dưới các hook cũng được)
const DEFAULT_REJECT_STATUS = 'Rejected'; // nhớ khớp đúng với backend (case-sensitive)

const onRejectSubmit = async () => {
  if (!accountId) {
    alert('Missing accountId, please re-login.');
    return;
  }
  if (!feedbackText.trim()) {
    alert('Please enter a reason.');
    return;
  }

  // Dùng selectedStatus nếu có, còn không thì mặc định "Rejected"
  const statusToSend = selectedStatus ?? DEFAULT_REJECT_STATUS;

  try {
    await submitFeedback({
      meetingId: id,
      accountId,
      feedbackText,
      status: statusToSend,
    }).unwrap();

    toast.success('Rejection response sent.');
    setFeedbackText('');
    setActiveReject(false);
    refetchRejected();
    refetch();
  } catch (e) {
    console.error(e);
    alert('Response sending failed. Check status or try again.');
  }
};


  const onDeleteSummary = async () => {
    if (!window.confirm('Are you sure you want to delete this meeting summary?')) return;
    await deleteMeetingSummary(id);
    toast.success('Meeting summary deleted successfully.');
    refetch();
  };

  
// const onUpload = async () => {
//   if (!accountId) return;
//   setIsUploading(true);
//   setUploadProgress(null);

//   try {
//     if (uploadMethod === 'file') {
//       if (!file) return;
//       const formData = new FormData();
//       formData.append('meetingId', String(id));
//       formData.append('audioFile', file);

//       const res = await axios.post(
//         `${API_BASE_URL}meeting-transcripts`,
//         formData,
//         {
//           headers: { accept: '*/*' },
//           onUploadProgress: (evt) => {
//             if (!evt.total) return;
//             const percent = Math.round((evt.loaded * 100) / evt.total);
//             setUploadProgress(percent);
//           },
//         }
//       );

//       toast.success('File uploaded successfully!');
//       setUploadedTranscript(res.data?.transcriptText ?? null);
      
      
//     } else {
//       if (!videoUrl.trim()) {
//         alert('Please enter video URL!');
//         return;
//       }
//       const adjustedUrl = videoUrl.replace(/dl=0/, 'raw=1');
//       const res = await fetch(`${API_BASE_URL}meeting-transcripts/from-url`, {
//         method: 'POST',
//         headers: { accept: '*/*', 'Content-Type': 'application/json' },
//         body: JSON.stringify({ meetingId: id, videoUrl: adjustedUrl }),
//       });
//       const data = await res.json();
//       toast.success('Uploaded from URL successfully!');
//       setUploadedTranscript(data.transcriptText ?? null);
      
//     }
//     refetch();
//   } catch (e) {
//     console.error(e);
//   } finally {
//     setIsUploading(false);
//     setUploadProgress(null);
//   }
// };
const onUpload = async () => {
  if (!accountId) return;
  setIsUploading(true);
  setUploadProgress(null);

  try {
    if (uploadMethod === 'file') {
      if (!file) return;
      const formData = new FormData();
      formData.append('meetingId', String(id));
      formData.append('audioFile', file);

      const res = await axios.post(
        `${API_BASE_URL}meeting-transcripts`,
        formData,
        {
          headers: { accept: '*/*' },
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          },
        }
      );

      toast.success('File uploaded successfully!');
      const newTranscript = res.data?.transcriptText ?? null;
      setUploadedTranscript(newTranscript);

      // 🔽🔽🔽 MỞ POPUP ĐÁNH GIÁ — chèn NGAY SAU setUploadedTranscript
      if (newTranscript) {
        const payload = {
          meetingId: id,
          projectId: projectIdFromMeeting, // đã tính bằng useMemo ở trên
          source: 'file',
          uploaderAccountId: accountId,
          uploadedAt: new Date().toISOString(),
          transcriptPreview: newTranscript.slice(0, 1000),
        };
        setEvalPayload(JSON.stringify(payload));
        setIsEvalOpen(true);
      }
      // 🔼🔼🔼

    } else {
      if (!videoUrl.trim()) {
        alert('Please enter video URL!');
        return;
      }
      const adjustedUrl = videoUrl.replace(/dl=0/, 'raw=1');
      const res = await fetch(`${API_BASE_URL}meeting-transcripts/from-url`, {
        method: 'POST',
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: id, videoUrl: adjustedUrl }),
      });
      const data = await res.json();
      toast.success('Uploaded from URL successfully!');
      const newTranscript = data?.transcriptText ?? null;
      setUploadedTranscript(newTranscript);

      // 🔽🔽🔽 MỞ POPUP ĐÁNH GIÁ — chèn NGAY SAU setUploadedTranscript
      if (newTranscript) {
        const payload = {
          meetingId: id,
          projectId: projectIdFromMeeting,
          source: 'url',
          uploaderAccountId: accountId,
          originalUrl: videoUrl,
          uploadedAt: new Date().toISOString(),
          transcriptPreview: newTranscript.slice(0, 1000),
        };
        setEvalPayload(JSON.stringify(payload));
        setIsEvalOpen(true);
      }
      // 🔼🔼🔼
    }

    refetch();
  } catch (e) {
    console.error(e);
  } finally {
    setIsUploading(false);
    setUploadProgress(null);
  }
};

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">📌 {meetingTopic}</h1>
        <Link
          to="/meeting-feedback"
          className="rounded bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-700"
        >
          ← Back
        </Link>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        🕒{' '}
        {feedback.createdAt === '0001-01-01T00:00:00'
          ? 'pending'
          : new Date(feedback.createdAt).toLocaleString()}
      </p>

      {/* Summary */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Summary</h2>
        <pre className="whitespace-pre-wrap text-gray-700 text-sm">{feedback.summaryText}</pre>
      </div>

      {/* Transcript */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Transcript</h2>
        <pre className="whitespace-pre-wrap text-gray-700 text-sm">
          {feedback.transcriptText}
        </pre>

        {/* Upload khi đang Wait for update + PM/owner */}
        {isWaiting && canPMControl && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex gap-4 items-center">
              <label className="text-sm font-semibold">Select method:</label>
              <select
                value={uploadMethod}
                onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                className="border rounded-md p-1 text-sm"
              >
                <option value="file">Upload file WAV</option>
                <option value="url">Download from Dropbox URL</option>
              </select>
            </div>

            {uploadMethod === 'url' ? (
              <input
                type="text"
                placeholder="Enter Dropbox URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full mb-3 rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="mb-3"
              />
            )}

            <button
              onClick={onUpload}
              disabled={
                isUploading ||
                (uploadMethod === 'file' && !file) ||
                (uploadMethod === 'url' && !videoUrl)
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                isUploading ||
                (uploadMethod === 'file' && !file) ||
                (uploadMethod === 'url' && !videoUrl)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isUploading ? 'Uploading…' : uploadMethod === 'file' ? 'Upload video/audio' : 'Upload from URL'}
            </button>

           {isUploading && (
  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
    <div className="flex flex-col items-center gap-2">
      <div className="loader-videoupload" />
      <p className="text-sm text-gray-700">Uploading… {uploadProgress ?? ''}</p>
    </div>
  </div>
)}


            {uploadedTranscript && (
              <div className="mt-4 p-4 rounded bg-white border">
                <h4 className="text-sm font-semibold text-gray-800">Transcript Text (new):</h4>
                <pre className="whitespace-pre-wrap text-gray-700 text-sm">{uploadedTranscript}</pre>
              </div>
            )}
          </div>
        )}

        {/* Delete summary nếu đã có summary (không phải Wait for update),
            là PM/owner và CHƯA có bất kỳ feedback nào */}
        {!isWaiting && canPMControl && !hasAnyFeedback && (
          <div className="mt-4">
            <button
              onClick={onDeleteSummary}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Delete Summary
            </button>
          </div>
        )}
      </div>

      {/* Client actions */}
      {user?.role === 'CLIENT' && !isWaiting && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Client Actions</h2>
          <div className="flex gap-3 mb-3">
            <button
              onClick={onApprove}
              disabled={feedback.isApproved}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                feedback.isApproved ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              ✅ Approve
            </button>
            <button
              onClick={() => setActiveReject((v) => !v)}
              disabled={feedback.isApproved}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                feedback.isApproved ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              ❌ Reject
            </button>
          </div>

          {activeReject && !feedback.isApproved && (
            <div className="flex flex-col gap-2">
              {/* Lý do */}
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="Enter reason for rejection..."
              />

              <button
                onClick={onRejectSubmit}
                className="self-start rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Send Feedback
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rejected feedback history */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">🗂️ Feedback</h2>
        {rejectedFeedbacks.length === 0 ? (
          <p className="text-xs text-gray-500">There have been no rejections yet.</p>
        ) : (
          <ul className="space-y-2">
            {rejectedFeedbacks
              .slice()
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item: any) => {
                const isOwner = item.accountId === accountId;
                const canModify = user?.role === 'CLIENT' && !feedback.isApproved && isOwner;

                return (
                  <li
                    key={item.id}
                    className="rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-700"
                  >
                    {/* View mode vs Edit mode */}
                    {editingId === item.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-blue-500 hover:bg-blue-600 text-white px-3 py-1"
                            onClick={async () => {
                              await updateFeedback({
                                id: item.id,
                                meetingId: id, // hiện mapping meetingId == transcriptId
                                accountId: accountId!,
                                feedbackText: editingText,
                                status: item.status ?? selectedStatus ?? statusOptions[0]?.value,
                              });
                              setEditingId(null);
                              setEditingText('');
                              refetchRejected();
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="rounded bg-gray-200 px-3 py-1"
                            onClick={() => {
                              setEditingId(null);
                              setEditingText('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p>
                            <strong>{item.accountName}:</strong> {item.feedbackText}
                          </p>
                          {/* Badge status từ dynamic category */}
                          <StatusBadge value={item.status} />
                        </div>
                        <p className="text-[10px] text-gray-400">
                          🕒 {new Date(item.createdAt).toLocaleString()}
                        </p>

                        {canModify && (
                          <div className="mt-2 flex gap-2">
                            <button
                              className="rounded bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1"
                              onClick={() => {
                                setEditingId(item.id);
                                setEditingText(item.feedbackText);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-1"
                              onClick={async () => {
                                if (!confirm('Delete this feedback?')) return;
                                await deleteFeedback(item.id);
                                refetchRejected();
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {/* Rule box */}
      <div className="mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-yellow-700 flex items-center">Business Rule</h2>
        <p className="text-sm text-yellow-700 mt-2">
          If you're using <strong>Zoom platform</strong> and uploading a meeting recording, please ensure that:
          <br />– You upload <strong>.wav audio files</strong> under <strong>30MB</strong> via direct file upload.
          <br />– For <strong>larger video files</strong>, please use the <strong>Dropbox URL upload</strong> option instead.
        </p>
      </div>
      <AiResponseEvaluationPopup
  isOpen={isEvalOpen}
  onClose={() => setIsEvalOpen(false)}
  aiResponseJson={evalPayload}
  projectId={projectIdFromMeeting}
  aiFeature={AI_FEATURE}
  onSubmitSuccess={(aiResponseId: number) => {
    toast.success(`Thanks! Saved rating (ID: ${aiResponseId}).`);
  }}
/>

    </div>
  );
};

export default MilestoneFeedbackPanel;
