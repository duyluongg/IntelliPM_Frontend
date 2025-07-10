import { useGetHealthDashboardQuery } from '../../../services/projectMetricApi';
import { useSearchParams } from 'react-router-dom';

const HealthOverview = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data, isLoading, error } = useGetHealthDashboardQuery(projectKey);

  if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
  if (error || !data || !data.data)
    return <div className='text-sm text-red-500'>Error fetching health data</div>;

  const { timeStatus, tasksToBeCompleted, overdueTasks, progressPercent, costStatus } = data.data;

  return (
    <div className='p-4'>
      {/* <h2 className='text-lg font-semibold text-gray-800 mb-3'>Health</h2> */}
      <div className='space-y-2 text-sm text-gray-700'>
        <Row label='Time' value={timeStatus || 'No data'} />
        <Row label='Tasks' value={`${Math.max(0, tasksToBeCompleted)} tasks to be completed`} />
        <Row label='Workload' value={`${overdueTasks} tasks overdue`} />
        <Row label='Progress' value={`${progressPercent}% complete`} />
        <Row
          label='Cost Performance Index'
          value={
            costStatus === 0 || costStatus === undefined ? 'No budget specified.' : `${costStatus}`
          }
        />
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className='flex justify-between border-b border-gray-100 pb-1'>
    <span className='font-medium text-gray-800'>{label}</span>
    <span className='text-gray-500'>{value}</span>
  </div>
);

export default HealthOverview;
