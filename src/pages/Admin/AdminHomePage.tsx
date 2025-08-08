// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\Admin\HomePage.tsx
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useGetAllProjectsQuery, type ProjectDetails } from '../../services/projectApi';
import { Link } from 'react-router-dom';
import {
  Rocket,
  CalendarCheck,
  Users,
  BarChart2,
  CheckSquare,
  Users as UsersIcon,
} from 'lucide-react';
import projectIcon from '../../assets/projectManagement.png';
import Chart from 'chart.js/auto'; // Import Chart.js

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

  // Xử lý dữ liệu recentProjects từ API
  const recentProjects: Project[] = projectsData?.isSuccess
    ? (projectsData.data as ProjectDetails[]).slice(0, 3).map((proj) => ({
        id: proj.id,
        name: proj.name,
        projectKey: proj.projectKey,
        iconUrl: proj.iconUrl || projectIcon,
        status: proj.status,
      }))
    : [];

  // Số liệu thống kê
  const stats = {
    totalProjects: projectsData?.data ? (projectsData.data as ProjectDetails[]).length : 0,
    activeTasks: 12,
    teamMembers: 8,
  };

 const getProjectsByMonth = () => {
  if (!projectsData?.isSuccess || !projectsData.data) {
    return {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 12,
      August: 3,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };
  }

  const monthCount: { [key: string]: number } = {};
  (projectsData.data as ProjectDetails[]).forEach((proj) => {
    const month = new Date(proj.createdAt).toLocaleString('en-US', {
      month: 'long',
    });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const result: { [key: string]: number } = {};
  months.forEach((month) => {
    result[month] = monthCount[month] || 0;
  });

  return result;
};


  const projectsByMonth = getProjectsByMonth();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Render biểu đồ khi dữ liệu thay đổi
  useEffect(() => {
    if (chartRef.current && !isLoading && projectsData?.isSuccess) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Clear old chart
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(projectsByMonth).map((m) =>
              m.replace('tháng ', '').replace('năm ', '')
            ), // clean label
            datasets: [
              {
                data: Object.values(projectsByMonth),
                backgroundColor: '#3366FF', // xanh giống mẫu
                borderRadius: 6, // góc bo tròn
                barThickness: 26, // điều chỉnh độ dày
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
                  stepSize: 100,
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
  }, [projectsData, isLoading]);

  return (
    <div className='w-full max-w-7xl mx-auto p-6 bg-white min-h-screen'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>
        Welcome, {user?.username || 'Admin'}!
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Recent Projects Card */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-700'>Recent Projects</h2>
            <Link to='/project/list' className='text-blue-500 hover:underline text-sm'>
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className='text-gray-500'>Loading projects...</div>
          ) : error ? (
            <div className='text-red-500'>Failed to load projects.</div>
          ) : recentProjects.length === 0 ? (
            <div className='text-gray-500'>No projects found.</div>
          ) : (
            <ul className='space-y-3'>
              {recentProjects.map((project) => (
                <li key={project.projectKey} className='flex items-center space-x-3'>
                  <img
                    src={project.iconUrl}
                    alt={`${project.name} icon`}
                    className='w-8 h-8 rounded-full'
                  />
                  <div className='flex-1'>
                    <Link
                      to={`/project?projectKey=${project.projectKey}`}
                      className='text-gray-800 hover:text-blue-500 truncate'
                    >
                      {project.name}
                    </Link>
                    <p className='text-xs text-gray-500 mt-1'>{project.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-lg font-semibold text-gray-700 mb-4'>Quick Actions</h2>
          <div className='space-y-3'>
            <Link
              to='/project/introduction'
              className='flex items-center space-x-2 text-blue-500 hover:bg-blue-50 p-2 rounded'
            >
              <Rocket className='w-5 h-5' />
              <span>Create New Project</span>
            </Link>
            <Link
              to='/meeting'
              className='flex items-center space-x-2 text-blue-500 hover:bg-blue-50 p-2 rounded'
            >
              <CalendarCheck className='w-5 h-5' />
              <span>Schedule Meeting</span>
            </Link>
            <Link
              to='/teams'
              className='flex items-center space-x-2 text-blue-500 hover:bg-blue-50 p-2 rounded'
            >
              <Users className='w-5 h-5' />
              <span>Manage Teams</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 gap-6'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white'>
            <div className='flex items-center space-x-3'>
              <BarChart2 className='w-6 h-6' />
              <h3 className='text-sm font-medium'>Total Projects</h3>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.totalProjects}</p>
          </div>
          <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white'>
            <div className='flex items-center space-x-3'>
              <CheckSquare className='w-6 h-6' />
              <h3 className='text-sm font-medium'>Active Tasks</h3>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.activeTasks}</p>
          </div>
          <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white'>
            <div className='flex items-center space-x-3'>
              <UsersIcon className='w-6 h-6' />
              <h3 className='text-sm font-medium'>Team Members</h3>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.teamMembers}</p>
          </div>
        </div>
      </div>

      {/* New Chart for Projects by Month */}
      <div className='mt-6 bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-lg font-semibold text-gray-700 mb-4'>Projects Created by Month</h2>
        {isLoading ? (
          <div className='text-gray-500'>Loading chart data...</div>
        ) : error || !projectsData?.isSuccess ? (
          <div className='text-red-500'>Failed to load chart data.</div>
        ) : Object.keys(projectsByMonth).length === 0 ? (
          <div className='text-gray-500'>No data available.</div>
        ) : (
          <div className='chart-container'>
            <canvas ref={chartRef} style={{ maxWidth: '100%' }}></canvas>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;
