// src/components/SwipeActionCard.tsx
import React, { useEffect, useRef, useState } from 'react';

export default function SwipeActionCard({
  children,
  disabled,
  onApprove,
  onReject,
  approveLabel = 'APPROVE',
  rejectLabel = 'REJECT',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onApprove: (note: string) => Promise<void> | void;
  onReject: (note: string) => Promise<void> | void;
  approveLabel?: string;
  rejectLabel?: string;
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [enabled, setEnabled] = useState(false); // sau long-press mới kéo
  const [showNote, setShowNote] = useState<null | 'approve' | 'reject'>(null);
  const [note, setNote] = useState('');
  const startX = useRef(0);
  const holdTimer = useRef<number | null>(null);

  const THRESHOLD = 120; // px
  const LONGPRESS_MS = 300;

  const reset = () => {
    setDragX(0);
    setIsDragging(false);
    setEnabled(false);
  };

  const onStart = (clientX: number) => {
    if (disabled) return;
    startX.current = clientX;
    setIsDragging(true);
    holdTimer.current = window.setTimeout(() => {
      setEnabled(true);
    }, LONGPRESS_MS);
  };

  const onMove = (clientX: number) => {
    if (!isDragging || !enabled) return;
    const delta = clientX - startX.current;
    setDragX(delta);
  };

  const onEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (!enabled) {
      // chưa đủ long-press, coi như click thường
      setIsDragging(false);
      return;
    }
    if (dragX <= -THRESHOLD) {
      setShowNote('approve'); // kéo trái = approve
    } else if (dragX >= THRESHOLD) {
      setShowNote('reject'); // kéo phải = reject
    }
    reset();
  };

  useEffect(() => {
    const cancel = () => {
      if (isDragging) onEnd();
    };
    window.addEventListener('mouseup', cancel);
    window.addEventListener('touchend', cancel);
    return () => {
      window.removeEventListener('mouseup', cancel);
      window.removeEventListener('touchend', cancel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, enabled, dragX]);

  if (showNote) {
    const isApprove = showNote === 'approve';
    return (
      <div className="rounded-xl border p-4 bg-white shadow">
        <div className={`mb-2 text-sm font-semibold ${isApprove ? 'text-green-700' : 'text-red-700'}`}>
          {isApprove ? 'Approve request' : 'Reject request'}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="PM note..."
          className="w-full rounded border px-3 py-2 mb-3"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => { setShowNote(null); setNote(''); }}
          >
            Cancel
          </button>
          <button
            className={`px-3 py-1 rounded text-white ${isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            onClick={async () => {
              const n = note.trim();
              if (!n) return alert('Please enter PM note.');
              if (isApprove) await onApprove(n);
              else await onReject(n);
              setShowNote(null);
              setNote('');
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl border bg-white overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onMouseUp={onEnd}
      onTouchEnd={onEnd}
    >
      {/* Background lanes */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-50 flex items-center justify-start pl-4 text-green-700 font-semibold">
          ← {approveLabel}
        </div>
        <div className="flex-1 bg-red-50 flex items-center justify-end pr-4 text-red-700 font-semibold">
          {rejectLabel} →
        </div>
      </div>

      {/* Foreground content draggable */}
      <div
        className="relative z-10 p-5 transition-transform"
        style={{ transform: `translateX(${enabled ? dragX : 0}px)` }}
      >
        {children}
        {!disabled && (
          <div className="mt-3 text-xs text-gray-500">
            Nhấn giữ 0.3s rồi kéo: trái = Approve, phải = Reject
          </div>
        )}
      </div>
    </div>
  );
}
