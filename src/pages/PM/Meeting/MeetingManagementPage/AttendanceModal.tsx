import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DialogContent } from '@radix-ui/react-dialog';
import { useGetCategoriesByGroupQuery } from '../../../../services/dynamicCategoryApi';
import AddMembersModal from './AddMembersModal';

type Participant = {
  id: number;
  fullName: string;
  role?: string;
  status?: string;
  meetingId: number;
  accountId: number;
};

type MeetingStatusType = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

type Props = {
  meetingTopic?: string;
  projectId: number;
  meetingStatus: MeetingStatusType; // ✅ camelCase prop
  participants: Participant[];
  draft: Record<number, string>;
  setDraft: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onSave: () => Promise<void> | void;
  /** Optional: ưu tiên dùng hơn suy luận từ participants[0] */
  meetingId?: number;
};

type StatusOption = { value: string; label: string; color?: string };

/* ------------ color helpers ------------ */
const hexToRgb = (hex?: string) => {
  if (!hex) return { r: 37, g: 99, b: 235 }; // blue-600 fallback
  const m = hex.replace('#', '');
  const bigint = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};



const alpha = (hex: string | undefined, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const contrastText = (hex?: string) => {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return L > 0.55 ? '#111827' : '#ffffff';
};

const gradientFrom = (colors: Array<string | undefined>) => {
  const c1 = colors[0] ?? '#2563eb';
  const c2 = colors[1] ?? c1;
  return `linear-gradient(90deg, ${c1}, ${c2})`;
};
/* -------------------------------------- */

const AttendanceModal: React.FC<Props> = ({
  meetingTopic,
  projectId,
  meetingStatus, // ✅ dùng prop này để ẩn nút +
  participants,
  draft,
  setDraft,
  onSave,
  meetingId: meetingIdProp,
}) => {
  const { data: resp, isLoading, isError } =
    useGetCategoriesByGroupQuery('meeting_participant_status');

  const statusOptions: StatusOption[] = useMemo(
    () =>
      (resp?.data ?? [])
        .filter((c: any) => /present|absent/i.test(c.name))
        .map((c: any) => ({
          value: c.name,
          label: c.label ?? c.name,
          color: c.color as string | undefined,
        })),
    [resp]
  );

  const presentOpt = useMemo<StatusOption | undefined>(
    () => statusOptions.find((o) => /present/i.test(o.value) || /present/i.test(o.label)),
    [statusOptions]
  );

  // Suy ra meetingId nếu parent không truyền vào
  const inferredMeetingId = participants?.[0]?.meetingId;
  const meetingId = meetingIdProp ?? inferredMeetingId;

  // Modal Add Members
  const [openAdd, setOpenAdd] = useState(false);

  // Khởi tạo draft khi participants/statusOptions đổi
  useEffect(() => {
    if (!participants?.length || !statusOptions.length) return;
    setDraft((prev) => {
      const next = { ...prev };
      for (const p of participants) {
        if (!next[p.id]) {
          next[p.id] =
            statusOptions.find((o) => o.value === p.status)?.value ??
            statusOptions[0]?.value ??
            '';
        }
      }
      return next;
    });
  }, [participants, statusOptions, setDraft]);

  const handleSelectAllPresent = () => {
    if (!presentOpt) return;
    setDraft((prev) => {
      const next = { ...prev };
      for (const p of participants) next[p.id] = presentOpt.value;
      return next;
    });
  };

  const accentColors = statusOptions.map((s) => s.color).filter(Boolean);
  const headerBarStyle = {
    background: gradientFrom(accentColors),
    height: 6,
    borderRadius: 999,
    marginBottom: 16,
  } as const;

  const presentCount =
    presentOpt ? Object.values(draft).filter((v) => v === presentOpt.value).length : 0;

  const canAddMembers = meetingStatus === 'ACTIVE'; 

  // --- dưới các useMemo khác ---
const totalMembers = participants?.length ?? 0;

// đếm theo trạng thái đang chọn trong draft (ưu tiên draft > p.status)
const countsByStatus = useMemo(() => {
  const map: Record<string, number> = {};
  for (const opt of statusOptions) map[opt.value] = 0;
  for (const p of participants) {
    const v = draft[p.id] ?? p.status;
    if (v && v in map) map[v]++;
  }
  return map;
}, [participants, draft, statusOptions]);


  return (
    <>
      <DialogContent className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div style={headerBarStyle} />

        {/* Header: title + nút dấu cộng */}
<div className="mb-2 flex items-center justify-between">
  <h3 className="text-xl font-bold tracking-tight">
    📋 Attendance{meetingTopic ? `: ${meetingTopic}` : ''}
  </h3>

  <div className="flex items-center gap-2">
    {/* 👥 total members */}
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
      👥 {totalMembers} members
    </span>

    {/* present count (nếu có presentOpt) */}
    {presentOpt && (
      <span className="rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          background: alpha(presentOpt.color, 0.12),
          border: `1px solid ${alpha(presentOpt.color, 0.6)}`,
          color: contrastText(alpha(presentOpt.color, 0.8)),
        }}
      >
        ✅ {countsByStatus[presentOpt.value] ?? 0} {presentOpt.label}
      </span>
    )}

    {/* nút + chỉ hiện khi ACTIVE */}
    {canAddMembers && (
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
        title="Add members"
        onClick={() => setOpenAdd(true)}
        disabled={!meetingId}
      >
        +
      </button>
    )}
  </div>
</div>


        {/* toolbar: legend + Select all Present */}
        {!isLoading && statusOptions.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* legend */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <span
                  key={s.value}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: alpha(s.color, 0.12),
                    border: `1px solid ${alpha(s.color, 0.6)}`,
                    color: contrastText(alpha(s.color, 0.8)),
                  }}
                  title={s.value}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: s.color ?? '#9ca3af' }}
                  />
                  {s.label}
                </span>
              ))}
            </div>

            {/* Select all Present */}
            {presentOpt && (
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold transition"
                style={{
                  background: presentOpt.color,
                  color: contrastText(presentOpt.color),
                  border: `1px solid ${presentOpt.color}`,
                  boxShadow: `0 4px 14px ${alpha(presentOpt.color, 0.35)}`,
                }}
                onClick={handleSelectAllPresent}
                title="Mark all as Present"
              >
                Select all {presentOpt.label}
              </button>
            )}
          </div>
        )}

        {/* mini progress */}
        {presentOpt && (
          <div className="mb-4 text-xs text-gray-500">
            {presentCount}/{participants.length} marked as {presentOpt.label}
          </div>
        )}

        {isLoading && <p className="text-sm text-gray-500">Loading participant statuses…</p>}
        {isError && (
          <p className="text-sm text-red-500">
            Couldn’t load participant statuses. Please try again.
          </p>
        )}

        {!isLoading &&
          participants.map((p) => (
            <div
              key={p.id}
              className="mb-3 rounded-2xl border p-4 shadow-sm"
              style={{ borderColor: alpha('#e5e7eb', 1), background: '#ffffff' }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
<div className="text-xs leading-snug">
  <p className="font-medium text-gray-700">👤 {p.fullName}</p>
  <p className="text-gray-500">Role: {p.role || '—'}</p>
</div>


                {/* chip group từ dynamicCategory */}
                <div className="flex gap-2">
                  {statusOptions.map((opt) => {
                    const active = draft[p.id] === opt.value;
                    const bg = active ? opt.color : alpha(opt.color, 0.1);
                    const bd = active ? opt.color : alpha(opt.color, 0.5);
                    const fg = active ? contrastText(opt.color) : '#374151';
                    return (
                      <button
                        key={opt.value}
                        className="rounded-full px-4 py-2 text-sm font-medium transition"
                        style={{
                          background: bg,
                          border: `1px solid ${bd}`,
                          color: fg,
                          boxShadow: active ? `0 4px 14px ${alpha(opt.color, 0.35)}` : 'none',
                        }}
                        onClick={() => setDraft((prev) => ({ ...prev, [p.id]: opt.value }))}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

        <button
          className="mt-6 w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
          style={{
            background: gradientFrom(accentColors.length ? accentColors : ['#2563eb']),
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
          onClick={async () => {
            await onSave();
          }}
        >
          💾 Save Attendance
        </button>
      </DialogContent>

      {/* Nested dialog cho Add Members */}
      <Dialog.Root open={openAdd} onOpenChange={setOpenAdd}>
        <Dialog.Portal>
          {openAdd && meetingId && (
            <AddMembersModal
              projectId={projectId}
              meetingId={meetingId}
              onClose={() => setOpenAdd(false)}
              onAdded={() => setOpenAdd(false)}
            />
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default AttendanceModal;
