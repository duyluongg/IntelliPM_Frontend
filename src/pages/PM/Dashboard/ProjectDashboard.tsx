import TaskStatusChart from './TaskStatusChart';
import DashboardCard from './DashboardCard';
import { useEffect } from 'react';
import { useCalculateProjectMetricsMutation } from '../../../services/projectMetricApi';
import HealthOverview from './HealthOverview';
import ProgressPerSprint from './ProgressPerSprint';
import TimeComparisonChart from './TimeComparisonChart';
import CostBarChart from './CostBarChart';
import WorkloadChart from './WorkloadChart';

const ProjectDashboard = () => {
  const [calculate] = useCalculateProjectMetricsMutation();
  const projectId = 1;

  // useEffect(() => {
  //   calculate({ projectId }).catch((err) => {
  //     console.error('Error calculating project metrics:', err);
  //   });
  // }, [calculate, projectId]);

  useEffect(() => {
    const doCalculation = async () => {
      try {
        await calculate({ projectId }).unwrap();
      } catch (err) {
        console.error('Error calculating project metrics:', err);
      }
    };

    doCalculation();
  }, [calculate, projectId]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      <DashboardCard title='Health Overview'>
        <HealthOverview />
      </DashboardCard>

      <DashboardCard title='Task Status'>
        <TaskStatusChart />
      </DashboardCard>

      <DashboardCard title='Progress'>
        <ProgressPerSprint />
      </DashboardCard>

      <DashboardCard title='Time Tracking'>
        <TimeComparisonChart />
      </DashboardCard>

      <DashboardCard title='Cost'>
        <CostBarChart />
      </DashboardCard>

      <DashboardCard title='Workload'>
        <WorkloadChart />
      </DashboardCard>
    </div>
  );
};

export default ProjectDashboard;
