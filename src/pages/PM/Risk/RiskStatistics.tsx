import { useParams } from 'react-router-dom';
import { useGetRiskStatisticsByProjectKeyQuery } from '../../../services/riskApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const RiskStatistics = () => {
  const { projectKey } = useParams();
  const { data: projectData } = useGetProjectDetailsByKeyQuery(projectKey || 'NotFound');
  const {
    data: statsData,
    isLoading,
    error,
  } = useGetRiskStatisticsByProjectKeyQuery(projectKey || 'NotFound');

  // Log data for debugging
  console.log('Stats Data:', statsData, 'Error:', error);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
        Loading statistics...
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className='flex items-center justify-center h-full text-red-500 text-sm'>
        Error loading statistics: {error ? error.toString() : 'No data received'}
      </div>
    );
  }

  const stats = statsData; // Use statsData directly since it's the raw response

  // Chart data for risks by status
  const statusChartData = {
    labels: Object.keys(stats.risksByStatus),
    datasets: [
      {
        label: 'Risks by Status',
        data: Object.values(stats.risksByStatus),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Chart data for risks by type
  const typeChartData = {
    labels: Object.keys(stats.risksByType),
    datasets: [
      {
        label: 'Risks by Type',
        data: Object.values(stats.risksByType),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Chart data for risks by severity (pie chart)
  const severityChartData = {
    labels: Object.keys(stats.risksBySeverity),
    datasets: [
      {
        data: Object.values(stats.risksBySeverity),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Colors for low, medium, high, critical
      },
    ],
  };

  // Chart data for risks by responsible
  const responsibleChartData = {
    labels: Object.keys(stats.risksByResponsible),
    datasets: [
      {
        label: 'Risks by Responsible',
        data: Object.values(stats.risksByResponsible),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
  };

  return (
    <div className='p-6 min-h-screen'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>
        Risk Statistics for Project {projectKey}
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Total Risks: {stats.totalRisks}</h2>
          <h2 className='text-lg font-semibold mb-4'>Overdue Risks: {stats.overdueRisks}</h2>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Risks by Status</h2>
          <Bar data={statusChartData} />
        </div>
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Risks by Type</h2>
          <Bar data={typeChartData} />
        </div>
        {/* <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Risks by Severity</h2>
          <Pie data={severityChartData} />
        </div> */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Risks by Severity</h2>
          <div className='w-64 h-64 mx-auto'>
            {' '}
            {/* Giới hạn kích thước vòng tròn */}
            <Pie data={severityChartData} />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-lg font-semibold mb-4'>Risks by Responsible</h2>
          <Bar data={responsibleChartData} />
        </div>
      </div>
    </div>
  );
};

export default RiskStatistics;
