// import { useGetHealthDashboardQuery } from "../../../services/projectMetricApi";

// const HealthOverview = () => {
//   const projectId = 1; // hoặc lấy từ props / context / route params
//   const { data, isLoading, error } = useGetHealthDashboardQuery(projectId);

//   if (isLoading) return <div>Loading...</div>;
//   if (error || !data || !data.data) return <div>Error fetching health data</div>;

//   const { timeStatus, tasksToBeCompleted, overdueTasks, progressPercent, costStatus } = data.data;

//   return (
//     <div>
//       <h2 className="text-lg font-semibold mb-2">Health Overview</h2>
//       <p>Status: {timeStatus}</p>
//       <p>SPI: {tasksToBeCompleted}</p>
//       <p>CPI: {overdueTasks}</p>
//       <p>Delay (days): {progressPercent}</p>
//       <p>Budget Overrun: {costStatus}</p>
//     </div>
//   );
// };

// export default HealthOverview;

import { useGetHealthDashboardQuery } from '../../../services/projectMetricApi';

const HealthOverview = () => {
  const projectId = 1;
  const { data, isLoading, error } = useGetHealthDashboardQuery(projectId);

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
