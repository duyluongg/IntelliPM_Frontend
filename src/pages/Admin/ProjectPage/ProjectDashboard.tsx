import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/api';

const COLORS = ['#40d454ff', '#007fd3ff', '#8d8c8dff'];

interface WorkItem {
  type: 'EPIC' | 'TASK' | 'STORY' | 'BUG' | 'SUBTASK';
  status: 'DONE' | 'IN_PROGRESS' | 'TO_DO' | 'TO-DO';
  key: string;
  summary: string;
}

interface ProjectDetails {
  id: number;
  name: string;
  projectKey: string;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  count: number;
}

interface PieData {
  type: string;
  data: ChartData[];
  total: number;
}

const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{ type: string; status: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      try {
        const workItemsResponse = await axios.get(
          `${API_BASE_URL}project/${projectId}/workitems`,
          {
            headers: {
              accept: '*/*',
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (workItemsResponse.data.isSuccess) {
          setWorkItems(workItemsResponse.data.data || []);
        } else {
          throw new Error('Failed to load work items');
        }

        const projectResponse = await axios.get(
          `${API_BASE_URL}project/${projectId}`,
          {
            headers: {
              accept: '*/*',
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (projectResponse.data.isSuccess) {
          setProject(projectResponse.data.data || null);
        } else {
          throw new Error('Failed to load project details');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const processData = (): { pieData: PieData[]; barData: any[]; overallProgress: number } => {
    if (!workItems || workItems.length === 0) {
      const types = ['EPIC', 'TASK', 'STORY', 'BUG', 'SUBTASK'];
      const pieData: PieData[] = types.map((type) => ({
        type,
        data: [
          { name: 'DONE', value: 0, count: 0 },
          { name: 'IN_PROGRESS', value: 0, count: 0 },
          { name: 'TO_DO', value: 0, count: 0 },
        ],
        total: 0,
      }));
      const barData = types.map((type) => ({ type, DONE: 0, IN_PROGRESS: 0, TO_DO: 0 }));
      return { pieData, barData, overallProgress: 0 };
    }

    const types = ['EPIC', 'TASK', 'STORY', 'BUG', 'SUBTASK'];
    const grouped: { [key: string]: { [status: string]: number } } = {};

    workItems.forEach((item) => {
      const normalizedStatus = item.status === 'TO-DO' ? 'TO_DO' : item.status;
      if (!grouped[item.type]) grouped[item.type] = { DONE: 0, IN_PROGRESS: 0, TO_DO: 0 };
      grouped[item.type][normalizedStatus] = (grouped[item.type][normalizedStatus] || 0) + 1;
    });

    const pieData: PieData[] = types.map((type) => {
      const counts = grouped[type] || { DONE: 0, IN_PROGRESS: 0, TO_DO: 0 };
      const total = counts.DONE + counts.IN_PROGRESS + counts.TO_DO;
      return {
        type,
        data: [
          { name: 'DONE', value: total ? (counts.DONE / total) * 100 : 0, count: counts.DONE },
          { name: 'IN_PROGRESS', value: total ? (counts.IN_PROGRESS / total) * 100 : 0, count: counts.IN_PROGRESS },
          { name: 'TO_DO', value: total ? (counts.TO_DO / total) * 100 : 0, count: counts.TO_DO },
        ],
        total,
      };
    });

    const barData = types.map((type) => {
      const counts = grouped[type] || { DONE: 0, IN_PROGRESS: 0, TO_DO: 0 };
      return { type, DONE: counts.DONE, IN_PROGRESS: counts.IN_PROGRESS, TO_DO: counts.TO_DO };
    });

    const totalItems = workItems.length;
    const totalDone = workItems.filter((item) => item.status === 'DONE').length;
    const overallProgress = totalItems ? (totalDone / totalItems) * 100 : 0;

    return { pieData, barData, overallProgress };
  };

  const { pieData, barData, overallProgress } = processData();

  const filteredItems = selectedFilter
    ? workItems.filter(
        (item) =>
          item.type === selectedFilter.type &&
          (item.status === selectedFilter.status || (selectedFilter.status === 'TO_DO' && item.status === 'TO-DO'))
      )
    : [];

  const legendData = [
    { name: 'DONE', color: COLORS[0] },
    { name: 'IN_PROGRESS', color: COLORS[1] },
    { name: 'TO_DO', color: COLORS[2] },
  ];

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 p-6">
        Loading dashboard...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 p-6">
        Error: {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {project ? `${project.name} (${project.projectKey}) Dashboard` : `Project ${projectId} Dashboard`}
        </h1>
        <button className="text-blue-600 hover:text-blue-800" onClick={() => navigate('/admin/projects')}>
          Back to Projects
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Overall Progress: {overallProgress.toFixed(1)}% Done</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <motion.div
            className="bg-green-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Status by Work Item Type</h2>
      <div className="flex justify-center mb-4">
        {legendData.map((item) => (
          <div key={item.name} className="flex items-center mx-4">
            <span
              className="inline-block w-4 h-4 mr-2 rounded-full"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {pieData.map(({ type, data, total }) => (
          <motion.div
            key={type}
            className="bg-white p-4 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-center font-medium">{type}</h3>
            {total === 0 ? (
              <p className="text-center text-gray-500">No items</p>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index, payload }) => {
                      if (!midAngle) return null;
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#000"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{ fontSize: '14px' }}
                        >
                          {payload.count}
                        </text>
                      );
                    }}
                    onClick={(entry: ChartData) => setSelectedFilter({ type, status: entry.name })}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props) => [
                      `${value.toFixed(1)}% (${props.payload.count} items)`,
                      name,
                    ]}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '24px', fontWeight: 'bold' }}
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '12px' }}
                  >
                    Total
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Status Overview (Stacked Bar)</h2>
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="DONE" stackId="a" fill={COLORS[0]} />
            <Bar dataKey="IN_PROGRESS" stackId="a" fill={COLORS[1]} />
            <Bar dataKey="TO_DO" stackId="a" fill={COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedFilter && filteredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-4 rounded-lg shadow"
        >
          <h2 className="text-lg font-semibold mb-2">
            {selectedFilter.type} - {selectedFilter.status} Items
          </h2>
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left text-sm font-semibold">Key</th>
                <th className="py-2 px-4 text-left text-sm font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.key} className="border-b">
                  <td className="py-2 px-4 text-sm">{item.key}</td>
                  <td className="py-2 px-4 text-sm">{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-2 text-blue-600 hover:text-blue-800"
            onClick={() => setSelectedFilter(null)}
          >
            Clear Filter
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProjectDashboard;