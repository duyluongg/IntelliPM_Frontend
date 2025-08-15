import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useGetProjectDetailsQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingServices';
import { useAddParticipantsToMeetingMutation, useGetParticipantsByMeetingIdQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingParticipantServices';

type Props = {
  projectId: number;
  meetingId: number;
  onClose?: () => void;
  onAdded?: (addedIds: number[]) => void;
};

const AddMembersModal: React.FC<Props> = ({ projectId, meetingId, onClose, onAdded }) => {
  const { data: projectDetails, isLoading: loadingProject } = useGetProjectDetailsQuery(projectId, {
    skip: !projectId,
  });

  const {
    data: participants = [],
    isLoading: loadingParticipants,
    refetch: refetchParticipants,
  } = useGetParticipantsByMeetingIdQuery(meetingId, { skip: !meetingId });

  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [addMembers, { isLoading: adding }] = useAddParticipantsToMeetingMutation();

  const existingAccountIds = useMemo(
    () => new Set(participants.map((p) => p.accountId)),
    [participants]
  );

  const candidates = useMemo(() => {
    const list = projectDetails?.data?.projectMembers ?? [];
    return list.filter((m: any) => !existingAccountIds.has(m.accountId));
  }, [projectDetails, existingAccountIds]);

  const filtered = useMemo(() => {
    if (!q.trim()) return candidates;
    const k = q.toLowerCase();
    return candidates.filter(
      (m: any) =>
        m.fullName?.toLowerCase().includes(k) ||
        m.username?.toLowerCase().includes(k)
    );
  }, [candidates, q]);

  const allChecked = filtered.length > 0 && filtered.every((m: any) => selected[m.accountId]);
  const toggleAll = () => {
    const next = { ...selected };
    const target = !allChecked;
    for (const m of filtered) next[m.accountId] = target;
    setSelected(next);
  };

  const toggleOne = (id: number) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAdd = async () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));

    if (ids.length === 0) {
      alert('Select at least one member.');
      return;
    }

    const res = await addMembers({ meetingId, participantIds: ids }).unwrap();
    await refetchParticipants();
    onAdded?.(res.added ?? []);
    onClose?.();
  };

  const busy = loadingProject || loadingParticipants;

  return (
    <Dialog.Portal>
      {/* Nền mờ */}
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />

      {/* Nội dung modal ở giữa màn hình */}
      <Dialog.Content
        className="fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="mb-3 text-xl font-bold">Add members to meeting</h3>

        <div className="mb-3 text-sm text-gray-600">
          Project ID: <span className="font-medium">{projectId}</span> • Meeting ID:{' '}
          <span className="font-medium">{meetingId}</span>
        </div>

        <input
          className="mb-4 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
          placeholder="Search by name or username…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={busy}
        />

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} (not in meeting yet)
          </span>
          <button
            className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400"
            onClick={toggleAll}
            disabled={busy || filtered.length === 0}
          >
            {allChecked ? 'Unselect all' : 'Select all'}
          </button>
        </div>

        <div className="max-h-72 overflow-auto rounded-xl border">
          {busy ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No candidates found.</div>
          ) : (
            <ul className="divide-y">
              {filtered.map((m: any) => (
                <li key={m.accountId} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!selected[m.accountId]}
                    onChange={() => toggleOne(m.accountId)}
                  />
                  <img
                    src={m.picture || 'https://placehold.co/40x40'}
                    alt={m.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{m.fullName}</div>
                    <div className="text-xs text-gray-500">@{m.username}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          onClick={handleAdd}
          disabled={adding || busy}
        >
          {adding ? 'Adding…' : 'Add selected members'}
        </button>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default AddMembersModal;
