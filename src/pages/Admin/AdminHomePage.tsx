import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../services/AuthContext';
import {
  useGetAllProjectsQuery,
  useGetWorkItemsByProjectIdQuery,
  useGetProjectDetailsByIdQuery,
  type ProjectDetails,
} from '../../services/projectApi';
import { Link } from 'react-router-dom';
import { BarChart2, CheckSquare, Users as UsersIcon } from 'lucide-react';
import projectIcon from '../../assets/projectManagement.png';
import Chart from 'chart.js/auto';

interface Project {
  id: number;
  name: string;
  projectKey: string;
  iconUrl?: string;
  status?: string;
}

const AdminHomePage: React.FC = () => {
  const { user } = useAuth();
  const { data: projectsData, isLoading, error } = useGetAllProjectsQuery();

  // Fetch work items and project details
  const projectIds = projectsData?.isSuccess ? projectsData.data.map((proj) => proj.id) : [];
  const workItemsQueries = projectIds.map((projectId) =>
    useGetWorkItemsByProjectIdQuery(projectId, { skip: !projectsData?.isSuccess })
  );
  const projectDetailsQueries = projectIds.map((projectId) =>
    useGetProjectDetailsByIdQuery(projectId, { skip: !projectsData?.isSuccess })
  );

  // Calculate active tasks
  const activeTasks = workItemsQueries.reduce((total, query) => {
    if (query.isSuccess && query.data?.isSuccess) {
      return (
        total +
        query.data.data.filter((item) => item.status.toLowerCase() === 'in_progress').length
      );
    }
    return total;
  }, 0);

  // Calculate unique team members
  const teamMembers = projectDetailsQueries.reduce((uniqueMembers, query) => {
    if (query.isSuccess && query.data?.isSuccess) {
      query.data.data.projectMembers.forEach((member) => {
        uniqueMembers.add(member.accountId);
      });
    }
    return uniqueMembers;
  }, new Set<number>()).size;

  // Stats object
  const stats = {
    totalProjects: projectsData?.data ? (projectsData.data as ProjectDetails[]).length : 0,
    activeTasks,
    teamMembers,
  };

  // Recent projects
  const recentProjects: Project[] = projectsData?.isSuccess
    ? (projectsData.data as ProjectDetails[])
        .slice(0, 3)
        .map((proj) => ({
          id: proj.id,
          name: proj.name,
          projectKey: proj.projectKey,
          iconUrl: proj.iconUrl || projectIcon,
          status: proj.status,
        }))
    : [];

  // Projects by month
  const getProjectsByMonth = () => {
    const monthCount: { [key: string]: number } = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    if (projectsData?.isSuccess && projectsData.data) {
      (projectsData.data as ProjectDetails[]).forEach((proj) => {
        const month = new Date(proj.createdAt).toLocaleString('en-US', {
          month: 'long',
        });
        monthCount[month] = (monthCount[month] || 0) + 1;
      });
    }

    return monthCount;
  };

  const projectsByMonth = getProjectsByMonth();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Render chart
  useEffect(() => {
    if (chartRef.current && !isLoading && projectsData?.isSuccess) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(projectsByMonth),
            datasets: [
              {
                data: Object.values(projectsByMonth),
                backgroundColor: '#3366FF',
                borderRadius: 6,
                barThickness: 26,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: {
              x: {
                ticks: {
                  font: { family: 'Inter', size: 12 },
                  color: '#2E3A59',
                },
                grid: { display: false },
              },
              y: {
                ticks: {
                  stepSize: 1,
                  font: { family: 'Inter', size: 12 },
                  color: '#2E3A59',
                },
                grid: {
                  color: '#f0f0f0',
                },
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectsByMonth, isLoading, projectsData]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {user?.username || 'Admin'}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Recent Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Projects</h2>
            <Link to="/project/list" className="text-blue-500 hover:underline text-sm">
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="text-gray-500">Loading projects...</div>
          ) : error ? (
            <div className="text-red-500">Failed to load projects.</div>
          ) : recentProjects.length === 0 ? (
            <div className="text-gray-500">No projects found.</div>
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((project) => (
                <li key={project.projectKey} className="flex items-center space-x-3">
                  <img
                    src={project.iconUrl}
                    alt={`${project.name} icon`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/project?projectKey=${project.projectKey}`}
                      className="text-gray-800 hover:text-blue-500 truncate"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{project.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
            <div className="flex items-center space-x-3">
              <BarChart2 className="w-6 h-6" />
              <h3 className="text-sm font-medium">Total Projects</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalProjects}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-6 h-6" />
              <h3 className="text-sm font-medium">Active Tasks</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.activeTasks}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
            <div className="flex items-center space-x-3">
              <UsersIcon className="w-6 h-6" />
              <h3 className="text-sm font-medium">Team Members</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.teamMembers}</p>
          </div>
        </div>
      </div>

      {/* Projects by Month Chart */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Projects Created by Month</h2>
        {isLoading ? (
          <div className="text-gray-500">Loading chart data...</div>
        ) : error || !projectsData?.isSuccess ? (
          <div className="text-red-500">Failed to load chart data.</div>
        ) : Object.values(projectsByMonth).every((count) => count === 0) ? (
          <div className="text-gray-500">No data available.</div>
        ) : (
          <div className="chart-container" style={{ height: '300px' }}>
            <canvas ref={chartRef} style={{ maxWidth: '100%' }}></canvas>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;