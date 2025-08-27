// src/pages/.../MilestoneFeedbackPanel.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
import {
  useUpdateTranscriptMutation,
  useGetTranscriptHistoryQuery,
  useRestoreTranscriptMutation,
    useUpdateSummaryMutation,
  useGetSummaryHistoryQuery,
  useRestoreSummaryMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingTranscriptSnapService';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { API_BASE_URL } from '../../../../constants/api';

// Dynamic category
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
// System config
import { useGetAllQuery as useGetAllSystemConfigsQuery } from '../../../../services/systemConfigurationApi';
import AiResponseEvaluationPopup from '../../../../components/AiResponse/AiResponseEvaluationPopup';

const DEFAULTS = {
  FEEDBACK_MIN: 5,
  FEEDBACK_MAX: 2000,
};

const toInt = (v: any, fb: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

// + NEW: subcomponent cho update + history + restore
const TranscriptEditorPanel: React.FC<{
  meetingId: number;
  initialText: string;
  canEdit: boolean;
}> = ({ meetingId, initialText, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText ?? '');
  const [saving, setSaving] = useState(false);


  

const { data: rawHistory = [], refetch: refetchHistory } = useGetTranscriptHistoryQuery(meetingId, {
  skip: !meetingId,
});
// normalize tuple { item1, item2 } -> { fileName, takenAtUtc }
const history = React.useMemo(
  () =>
    (rawHistory as any[]).map((h) => {
      const taken = h?.takenAtUtc ?? h?.Item2 ?? h?.item2 ?? null;
      return {
        fileName: h?.fileName ?? h?.Item1 ?? h?.item1 ?? '',
        takenAtUtc: taken && new Date(taken).toString() !== 'Invalid Date' ? taken : null,
      };
    }),
  [rawHistory]
);



  const [updateTranscript] = useUpdateTranscriptMutation();
  const [restoreTranscript] = useRestoreTranscriptMutation();

  useEffect(() => setText(initialText ?? ''), [initialText]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateTranscript({
        meetingId,
        transcriptText: text,
        editReason: 'manual edit',
      }).unwrap();
      toast.success('Transcript updated (snapshot saved).');
      setIsEditing(false);
      await refetchHistory();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const onRestore = async (fileName: string) => {
    if (!confirm(`Restore snapshot "${fileName}"?`)) return;
    try {
      await restoreTranscript({ meetingId, fileName, reason: 'manual restore' }).unwrap();
      toast.success('Restored from snapshot.');
      await refetchHistory();
      // NOTE: Trang đang dùng dữ liệu từ query feedback, dev có thể trigger refetch ở parent nếu cần
    } catch (e: any) {
      console.error(e);
      toast.error(e?.data?.message || 'Restore failed.');
    }
  };

  if (!canEdit) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">✍️ Edit Transcript / Snapshots</h3>
        {!isEditing ? (
          <button
            className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="rounded bg-gray-200 px-3 py-1 text-sm"
              onClick={() => {
                setIsEditing(false);
                setText(initialText ?? '');
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className={`rounded px-3 py-1 text-sm text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <textarea
          className="mt-3 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {/* History */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Snapshot History</h4>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500">No snapshots yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li
                key={h.fileName}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-mono">{h.fileName}</span>
                  <span className="text-[11px] text-gray-500">
  🕒 {h.takenAtUtc && !isNaN(new Date(h.takenAtUtc).getTime())
        ? new Date(h.takenAtUtc).toLocaleString()
        : '—'}
                  </span>
                </div>
                <button
                  className="rounded bg-gray-800 text-white px-3 py-1 text-xs hover:bg-black"
                  onClick={() => onRestore(h.fileName)}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// + NEW: subcomponent cho update + history + restore Summary
const SummaryEditorPanel: React.FC<{
  meetingTranscriptId: number;
  initialText: string;
  canEdit: boolean;
}> = ({ meetingTranscriptId, initialText, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText ?? '');
  const [saving, setSaving] = useState(false);

  const { data: rawHistory = [], refetch: refetchHistory } = useGetSummaryHistoryQuery(
    meetingTranscriptId,
    { skip: !meetingTranscriptId }
  );
  // normalize tuple { item1, item2 } -> { fileName, takenAtUtc }
  const history = React.useMemo(
    () =>
      (rawHistory as any[]).map((h) => {
        const taken = h?.takenAtUtc ?? h?.Item2 ?? h?.item2 ?? null;
        return {
          fileName: h?.fileName ?? h?.Item1 ?? h?.item1 ?? '',
          takenAtUtc: taken && new Date(taken).toString() !== 'Invalid Date' ? taken : null,
        };
      }),
    [rawHistory]
  );

  const [updateSummary] = useUpdateSummaryMutation();
  const [restoreSummary] = useRestoreSummaryMutation();

  useEffect(() => setText(initialText ?? ''), [initialText]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateSummary({
        meetingTranscriptId,
        summaryText: text,
        editReason: 'manual edit',
      }).unwrap();
      toast.success('Summary updated (snapshot saved).');
      setIsEditing(false);
      await refetchHistory();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const onRestore = async (fileName: string) => {
    if (!confirm(`Restore snapshot "${fileName}"?`)) return;
    try {
      await restoreSummary({ meetingTranscriptId, fileName, reason: 'manual restore' }).unwrap();
      toast.success('Restored from snapshot.');
      await refetchHistory();
      // NOTE: Parent component sẽ tự động refetch qua useGetMeetingFeedbackByTranscriptIdQuery
    } catch (e: any) {
      console.error(e);
      toast.error(e?.data?.message || 'Restore failed.');
    }
  };

  if (!canEdit) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">✍️ Edit Summary / Snapshots</h3>
        {!isEditing ? (
          <button
            className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="rounded bg-gray-200 px-3 py-1 text-sm"
              onClick={() => {
                setIsEditing(false);
                setText(initialText ?? '');
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className={`rounded px-3 py-1 text-sm text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <textarea
          className="mt-3 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {/* History */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Snapshot History</h4>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500">No snapshots yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li
                key={h.fileName}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-mono">{h.fileName}</span>
                  <span className="text-[11px] text-gray-500">
                    🕒{' '}
                    {h.takenAtUtc && !isNaN(new Date(h.takenAtUtc).getTime())
                      ? new Date(h.takenAtUtc).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <button
                  className="rounded bg-gray-800 text-white px-3 py-1 text-xs hover:bg-black"
                  onClick={() => onRestore(h.fileName)}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


const MilestoneFeedbackPanel: React.FC = () => {
  const { transcriptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const accountId = user?.id;

  // Map transcriptId ~ meetingId theo BE hiện tại
  const id = Number(transcriptId);

  // ===== Local states =====
  const [activeReject, setActiveReject] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [payloadPreview, setPayloadPreview] = useState<string>(''); // debug payload khi Reject

  // Upload transcript
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTranscript, setUploadedTranscript] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // AI rating popup
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [evalPayload, setEvalPayload] = useState<string>('');
  const AI_FEATURE = 'MEETING_SUMMARY';

  // ===== System config (feedback min/max) =====
  const { data: cfgResp } = useGetAllSystemConfigsQuery();
  const cfg = useMemo(() => {
    const list = Array.isArray(cfgResp?.data) ? (cfgResp!.data as any[]) : [];
    const byKey = new Map<string, any>(list.map((c) => [c.configKey, c]));
    const fbCfg = byKey.get('milestone_feedback_text');
    return {
      FEEDBACK_MIN: toInt(fbCfg?.minValue, DEFAULTS.FEEDBACK_MIN),
      FEEDBACK_MAX: toInt(fbCfg?.maxValue ?? fbCfg?.valueConfig, DEFAULTS.FEEDBACK_MAX),
    };
  }, [cfgResp]);

  // ===== Queries & Mutations =====
  const { data: feedback, isLoading, isError, error, refetch } =
    useGetMeetingFeedbackByTranscriptIdQuery(id, { skip: !id });

  const { data: myMeetings = [] } = useGetMyMeetingsQuery(undefined, { skip: !accountId });
  const { data: managedMeetings = [] } = useGetMeetingsManagedByQuery(accountId!, { skip: !accountId });

  const [submitFeedback] = useSubmitFeedbackMutation();
  const [approveMilestone] = useApproveMilestoneMutation();
  const [deleteMeetingSummary] = useDeleteMeetingSummaryMutation();
  const [updateFeedback] = useUpdateFeedbackMutation();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  // rejected feedback list
  const {
    data: rejectedFeedbacks = [],
    refetch: refetchRejected,
  } = useGetRejectedFeedbacksQuery(id, { skip: !id });

  // Auto refetch mỗi lần vào / đổi id
  useEffect(() => {
    refetch();
    refetchRejected();
  }, [id, refetch, refetchRejected]);

  // Dynamic categories for milestone_feedback_status
  const { data: statusResp } = useGetCategoriesByGroupQuery('milestone_feedback_status');

  // Options mapping
  const statusOptions = useMemo(
    () =>
      (statusResp?.data || [])
        .filter((c) => c.isActive)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((c) => ({ value: c.name, label: c.label || c.name, color: c.color })),
    [statusResp]
  );

  const statusMap = useMemo(() => {
    const m = new Map<string, { label: string; color: string | null }>();
    statusOptions.forEach((c) => m.set(c.value, { label: c.label, color: c.color ?? null }));
    return m;
  }, [statusOptions]);

  // chọn status Reject từ dynamic nếu có, fallback "Reject"
  const DEFAULT_REJECT_STATUS = 'Reject';
  const rejectStatusFromCategory = useMemo(() => {
    const arr = statusOptions;
    const exact = arr.find((c) => c.value === 'Reject');
    if (exact) return exact.value;
    const fuzzy = arr.find((c) => /reject/i.test(c.value));
    return fuzzy?.value || null;
  }, [statusOptions]);

  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    // nếu chưa chọn, ưu tiên status Reject; còn không thì status đầu tiên
    if (!selectedStatus) {
      setSelectedStatus(rejectStatusFromCategory || statusOptions[0]?.value);
    }
  }, [selectedStatus, rejectStatusFromCategory, statusOptions]);

  // Meeting context
  const currentMeeting: any = useMemo(
    () => myMeetings.find((m: any) => m.id === id),
    [myMeetings, id]
  );
  const projectIdFromMeeting: number = currentMeeting?.projectId ?? 0;

  const meetingTopic = useMemo(() => {
    const m = myMeetings.find((mm: any) => mm.id === id);
    return m?.meetingTopic || feedback?.meetingTopic || 'Không có tiêu đề';
  }, [myMeetings, id, feedback]);

  const canPMControl =
    user?.role === 'PROJECT_MANAGER' || managedMeetings.some((m: any) => m.id === id);

  // ====== EDIT FEEDBACK (UI + state) ======
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingStatus, setEditingStatus] = useState<string | undefined>(undefined);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setEditingText(item.feedbackText || '');
    // nếu status của feedback nằm trong DS dynamic thì dùng, ngược lại fallback
    const validStatus = statusOptions.some((s) => s.value === item.status)
      ? item.status
      : rejectStatusFromCategory || statusOptions[0]?.value;
    setEditingStatus(validStatus);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditingStatus(undefined);
  };
// + (optional) nếu backend có trường createdById trên meeting:
const createdById = (currentMeeting as any)?.createdById ?? null;
const isCreator = createdById ? createdById === accountId : false;

// Quyền edit: creator hoặc PM quản lý meeting
const canEditTranscript = Boolean(isCreator || canPMControl);

  const saveEdit = async (item: any) => {
    const msg = editingText.trim();
    if (msg.length < cfg.FEEDBACK_MIN) {
      toast.error(`Feedback must be at least ${cfg.FEEDBACK_MIN} characters.`);
      return;
    }
    if (msg.length > cfg.FEEDBACK_MAX) {
      toast.error(`Feedback must be ≤ ${cfg.FEEDBACK_MAX} characters.`);
      return;
    }
    const statusToSend =
      (editingStatus && statusOptions.some((s) => s.value === editingStatus) && editingStatus) ||
      rejectStatusFromCategory ||
      DEFAULT_REJECT_STATUS;

    try {
      setIsSavingEdit(true);
      await updateFeedback({
        id: item.id,
        meetingId: id,        // mapping meetingId == transcriptId
        accountId: accountId!, // chủ feedback
        feedbackText: msg,
        status: statusToSend,
      }).unwrap();

      toast.success('Saved.');
      cancelEdit();
      await refetchRejected();
    } catch (e: any) {
      console.error(e);
      const detail = e?.data?.message || e?.data?.details || e?.status || 'Unknown error';
      toast.error(`Save failed: ${detail}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Small UI badge
  const StatusBadge = ({ value }: { value?: string | null }) => {
    const meta = (value && statusMap.get(value)) || null;
    const label = meta?.label ?? value ?? '—';
    const color = meta?.color ?? '#6B7280';
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
        style={{ color, borderColor: color, backgroundColor: '#fff' }}
        title={value ?? ''}
      >
        {label}
      </span>
    );
  };

  // Early returns
  if (!accountId) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded bg-red-100 px-5 py-3 text-center text-red-600 font-semibold">
          ⚠️ You are not logged in.
        </p>
      </div>
    );
  }
  if (isLoading) return <div className="mx-auto max-w-5xl p-6 text-gray-500">⏳ Loading detail…</div>;
  if (isError || !feedback) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="rounded bg-red-100 px-5 py-3 text-red-600">
          ❌ Error loading details: {JSON.stringify(error)}
        </p>
        <button onClick={() => navigate(-1)} className="mt-4 rounded bg-gray-800 text-white px-4 py-2">
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

  // ====== Reject Submit (with payload preview) ======
  const onRejectSubmit = async () => {
    if (!accountId) {
      toast.error('Missing accountId, please re-login.');
      return;
    }
    const msg = feedbackText.trim();
    if (msg.length < cfg.FEEDBACK_MIN) {
      toast.error(`Feedback must be at least ${cfg.FEEDBACK_MIN} characters.`);
      return;
    }
    if (msg.length > cfg.FEEDBACK_MAX) {
      toast.error(`Feedback must be ≤ ${cfg.FEEDBACK_MAX} characters.`);
      return;
    }

    const statusToSend = rejectStatusFromCategory || selectedStatus || DEFAULT_REJECT_STATUS;

    const payload = {
      meetingId: id,
      accountId,
      feedbackText: msg,
      status: statusToSend,
    };

    setPayloadPreview(JSON.stringify(payload, null, 2));
    console.log('[MilestoneFeedbackPanel] Reject payload:', payload);

    try {
      setIsSubmittingFeedback(true);
      await submitFeedback(payload).unwrap();
      toast.success('Rejection response sent.');

      setFeedbackText('');
      setActiveReject(false);
      await Promise.all([refetchRejected(), refetch()]);
    } catch (e: any) {
      console.error(e);
      const detail = e?.data?.message || e?.data?.details || e?.status || 'Unknown error';
      toast.error(`Send failed: ${detail}`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const onDeleteSummary = async () => {
    if (!window.confirm('Are you sure you want to delete this meeting summary?')) return;
    await deleteMeetingSummary(id);
    toast.success('Meeting summary deleted successfully.');
    refetch();
  };

  // ===== Upload transcript (file / url) =====
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

        const res = await axios.post(`${API_BASE_URL}meeting-transcripts`, formData, {
          headers: { accept: '*/*' },
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          },
        });

        toast.success('File uploaded successfully!');
        const newTranscript = res.data?.transcriptText ?? null;
        setUploadedTranscript(newTranscript);

        if (newTranscript) {
          const payload = {
            meetingId: id,
            projectId: projectIdFromMeeting,
            source: 'file',
            uploaderAccountId: accountId,
            uploadedAt: new Date().toISOString(),
            transcriptPreview: newTranscript.slice(0, 1000),
          };
          setEvalPayload(JSON.stringify(payload));
          setIsEvalOpen(true);
        }
      } else {
        if (!videoUrl.trim()) {
          toast.error('Please enter video URL!');
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
      }

      await Promise.all([refetch(), refetchRejected()]);

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
        <Link to="/meeting-feedback" className="rounded bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-700">
          ← Back
        </Link>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        🕒 {feedback.createdAt === '0001-01-01T00:00:00' ? 'pending' : new Date(feedback.createdAt).toLocaleString()}
      </p>

      {/* Summary */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Summary</h2>
        <pre className="whitespace-pre-wrap text-gray-700 text-sm">{feedback.summaryText}</pre>
          <SummaryEditorPanel
    meetingTranscriptId={id}
    initialText={feedback.summaryText}
 canEdit={canPMControl && !feedback.isApproved}
  />
      </div>

      {/* Transcript + upload */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Transcript</h2>
        <pre className="whitespace-pre-wrap text-gray-700 text-sm">{feedback.transcriptText}</pre>
<TranscriptEditorPanel
    meetingId={id}
    initialText={feedback.transcriptText}
     canEdit={canEditTranscript && !feedback.isApproved}
    
  />
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
              disabled={isUploading || (uploadMethod === 'file' && !file) || (uploadMethod === 'url' && !videoUrl)}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                isUploading || (uploadMethod === 'file' && !file) || (uploadMethod === 'url' && !videoUrl)
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
                  <p className="text-sm text-gray-700">In progress… {uploadProgress ?? ''}</p>
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
                placeholder={`Enter reason (${cfg.FEEDBACK_MIN}-${cfg.FEEDBACK_MAX} chars)...`}
                maxLength={cfg.FEEDBACK_MAX}
              />
              <p className="text-xs text-gray-500">
                {feedbackText.trim().length}/{cfg.FEEDBACK_MAX}
              </p>

              



              <button
                onClick={onRejectSubmit}
                disabled={isSubmittingFeedback}
                className={`self-start rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  isSubmittingFeedback ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSubmittingFeedback ? 'Sending…' : 'Send Feedback'}
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

                const inEdit = editingId === item.id;

                return (
                  <li key={item.id} className="rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-700">
                    {/* EDIT MODE */}
                    {inEdit ? (
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-600">Feedback</label>
                        <textarea
                          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={cfg.FEEDBACK_MAX}
                        />
                        <p className="text-[11px] text-gray-500">
                          {editingText.trim().length}/{cfg.FEEDBACK_MAX}
                        </p>

                        <label className="block text-xs text-gray-600">Status</label>
                        <select
                          className="w-full rounded border px-3 py-2 text-sm"
                          value={editingStatus ?? ''}
                          onChange={(e) => setEditingStatus(e.target.value)}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2 pt-1">
                          <button
                            className={`rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 ${
                              isSavingEdit ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            disabled={isSavingEdit}
                            onClick={() => saveEdit(item)}
                          >
                            {isSavingEdit ? 'Saving…' : 'Save'}
                          </button>
                          <button className="rounded bg-gray-200 px-3 py-1" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* VIEW MODE */}
                        <div className="flex items-start justify-between gap-2">
                          <p>
                            <strong>{item.accountName}:</strong> {item.feedbackText}
                          </p>
                          <StatusBadge value={item.status} />
                        </div>
                        <p className="text-[10px] text-gray-400">🕒 {new Date(item.createdAt).toLocaleString()}</p>

                        {canModify && (
                          <div className="mt-2 flex gap-2">
                            <button
                              className="rounded bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1"
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-1"
                              onClick={async () => {
                                if (!confirm('Delete this feedback?')) return;
                                try {
                                  await deleteFeedback(item.id).unwrap();
                                  toast.success('Deleted.');
                                  refetchRejected();
                                } catch (e: any) {
                                  console.error(e);
                                  toast.error('Delete failed.');
                                }
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
          <br />– For <strong>larger video files</strong>, please use the <strong>Dropbox URL upload</strong> option
          instead.
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
