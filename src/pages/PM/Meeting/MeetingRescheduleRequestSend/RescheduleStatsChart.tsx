// src/pages/PM/Meeting/Reschedule/RescheduleStatsChart.tsx
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from 'recharts';

export interface RescheduleItem {
  id?: number;
  meetingId: number;
  requesterId: number;
  requestedDate: string; // ISO
  reason: string;
  status: string; // PENDING/APPROVED/REJECTED/...
  pmProposedDate?: string | null;
  pmNote?: string | null;
}

type StatusInfo = { label: string; color: string | null; orderIndex: number };

export default function RescheduleStatsChart({
  requests,
  statusMap,
}: {
  requests: RescheduleItem[];
  statusMap: Map<string, StatusInfo>;
}) {
  const [mode, setMode] = useState<'status' | 'daily'>('status');

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    requests.forEach(r => {
      counts.set(r.status, (counts.get(r.status) || 0) + 1);
    });
    const items = Array.from(counts.entries()).map(([name, value]) => {
      const info = statusMap.get(name);
      return {
        name,
        label: info?.label || name,
        value,
        color: info?.color || undefined,
        orderIndex: info?.orderIndex ?? 999,
      };
    }).sort((a, b) => a.orderIndex - b.orderIndex);
    return items;
  }, [requests, statusMap]);

  const dailyData = useMemo(() => {
    const dayMap = new Map<string, number>();
    requests.forEach(r => {
      const d = new Date(r.requestedDate);
      // group theo yyyy-mm-dd (local)
      const key = [d.getFullYear(), (d.getMonth()+1).toString().padStart(2,'0'), d.getDate().toString().padStart(2,'0')].join('-');
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });
    return Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [requests]);

  return (
    <div className="w-full rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">📊 Reschedule Stats</h2>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${mode==='status'?'bg-blue-600 text-white':'bg-gray-100'}`}
            onClick={() => setMode('status')}
          >
            By Status
          </button>
          <button
            className={`px-3 py-1 rounded ${mode==='daily'?'bg-blue-600 text-white':'bg-gray-100'}`}
            onClick={() => setMode('daily')}
          >
            By Day
          </button>
        </div>
      </div>

      <div className="h-64">
        {mode === 'status' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {/* Không set màu cứng; nếu cần dùng màu từ dynamic thì dùng fill={d.color} via a custom Bar */}
              <Bar dataKey="value" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Requests/Day" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
