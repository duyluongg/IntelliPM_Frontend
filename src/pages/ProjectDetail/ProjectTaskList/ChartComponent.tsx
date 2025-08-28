import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useGetWorkItemsByProjectIdQuery } from "../../../services/projectApi";
import type { WorkItemList } from "../../../services/projectApi";

interface ChartComponentProps {
  projectId: number;
  onClose?: () => void; // thêm prop onClose
}

const COLORS = ["#007fd3", "#00c49f", "#ffbb28", "#ff8042", "#8884d8", "#82ca9d"];

const ChartComponent: React.FC<ChartComponentProps> = ({ projectId, onClose }) => {
  const { data, isLoading, error } = useGetWorkItemsByProjectIdQuery(projectId, { skip: !projectId });

  const [selectedField, setSelectedField] = useState<"type" | "status" | "assignee" | "priority">("type");
  const [chartType, setChartType] = useState<"bar" | "horizontal-bar" | "donut">("horizontal-bar");
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

  // 🔹 Tính toán chartData từ API data
  useEffect(() => {
    if (!data?.data) return;

    const map = new Map<string, number>();

    data.data.forEach((item: WorkItemList) => {
      let key: string;
      if (selectedField === "type") key = item.type;
      else if (selectedField === "status") key = item.status.replace("_", " ");
      else if (selectedField === "priority") key = item.priority || "";
      else key = item.assignees.map((a) => a.fullname).join(", ") || "Unassigned";

      // cộng dồn
      map.set(key, (map.get(key) || 0) + 1);
    });

    // lọc bỏ giá trị rỗng và Unassigned
    const filtered = Array.from(map.entries())
      .filter(([label]) => label.trim() !== "" && label !== "Unassigned" && label !== "Unknown")
      .map(([label, value]) => ({ label, value }));

    setChartData(filtered);
  }, [data, selectedField]);

  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart data.</div>;

  return (
    <div className="w-full relative border rounded-lg shadow p-4 bg-white">
      {/* Nút X */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}

      {/* Dropdown Field */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value as any)}
          className="w-full border rounded p-2 text-sm"
        >
          <option value="type">Issue Type</option>
          <option value="status">Status</option>
          <option value="priority">Priority</option>
          {/* <option value="assignee">Assignee</option> */}
        </select>
      </div>

      {/* Dropdown Chart Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Chart type</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as any)}
          className="w-full border rounded p-2 text-sm"
        >
          <option value="horizontal-bar">Horizontal bar chart</option>
          <option value="donut">Donut chart</option>
          <option value="bar">Vertical bar chart</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer>
          {chartType === "horizontal-bar" ? (
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#007fd3">
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          ) : chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#007fd3">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartComponent;
