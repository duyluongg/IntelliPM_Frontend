import TaskStatusChart from './TaskStatusChart';
import DashboardCard from './DashboardCard';
import { useEffect } from 'react';
import { useCalculateProjectMetricsMutation } from '../../../services/projectMetricApi';
import HealthOverview from './HealthOverview';
import ProgressPerSprint from './ProgressPerSprint';
import TimeComparisonChart from './TimeComparisonChart';

const ProjectDashboard = () => {
  const [calculate] = useCalculateProjectMetricsMutation();
  const projectId = 1;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    calculate({ projectId, calculatedBy: 'system' }).catch((err) => {
      console.log('Token:', token);
      console.error('Error calculating project metrics:', err);
    });
  }, [calculate, projectId]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      <DashboardCard title='Health Overview'>
        <HealthOverview />
      </DashboardCard>

      <DashboardCard title='Task Status'>
        <TaskStatusChart />
      </DashboardCard>

      <DashboardCard title='Progress per Sprint'>
        <ProgressPerSprint />
      </DashboardCard>

      <DashboardCard title='Time Tracking'>
        <TimeComparisonChart />
      </DashboardCard>

      <DashboardCard title='Project Cost'>
        <TaskStatusChart />
      </DashboardCard>

      <DashboardCard title='Workload Analysis'>
        <TaskStatusChart />
      </DashboardCard>
    </div>
  );
};

export default ProjectDashboard;
