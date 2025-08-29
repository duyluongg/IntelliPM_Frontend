// MeetingAnalytics.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

type StatusOption = { value: string; label: string; color?: string | null };

type Props = {
  meetings: any[]; // [{ startTime: ISOString, status: string, ... }]
  statusOptions: StatusOption[];
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

const lastNDays = (n: number) => {
  const out: { key: string; label: string; date: Date }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      key: dateKey(d),
      label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' }), // "T3 14"
      date: d,
    });
  }
  return out;
};

const MeetingAnalytics: React.FC<Props> = ({ meetings, statusOptions }) => {
  const fallback = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#22c55e'];

  const statusColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    statusOptions.forEach((s, i) => (map[s.value] = s.color ?? fallback[i % fallback.length]));
    return map;
  }, [statusOptions]);

  const { last7, byStatus } = React.useMemo(() => {
    // --- 7 ngày gần nhất (Bar) ---
    const days = lastNDays(7);
    const dayCount = new Map<string, number>(days.map(d => [d.key, 0]));
    for (const m of meetings) {
      const k = dateKey(new Date(m.startTime));
      if (dayCount.has(k)) dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
    }
    const last7 = days.map(d => ({ day: d.label, count: dayCount.get(d.key) ?? 0 }));

    // --- Phân bổ status (Pie) ---
    const statusCount = new Map<string, number>();
    for (const m of meetings) {
      const s = m.status ?? 'UNKNOWN';
      statusCount.set(s, (statusCount.get(s) ?? 0) + 1);
    }
    const byStatus = Array.from(statusCount.entries()).map(([status, count], i) => ({
      status,
      label: statusOptions.find(x => x.value === status)?.label ?? status,
      count,
      color: statusColorMap[status] ?? fallback[i % fallback.length],
    }));

    return { last7, byStatus };
  }, [meetings, statusOptions, statusColorMap]);

return (
  <div className="mb-8">
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Bar: 7 ngày gần nhất */}
      <div className="flex-1 rounded-2xl border bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-gray-700">Meetings in last 7 days</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Meetings" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie: phân bổ status */}
      <div className="flex-1 rounded-2xl border bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold text-gray-700">Status distribution</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={byStatus}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {byStatus.map((s) => (
                  <Cell key={s.status} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

};

export default MeetingAnalytics;
