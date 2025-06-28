// import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useGetWorkloadDashboardQuery } from '../../../services/projectMetricApi';

// interface WorkloadChartProps {
//   projectId: number;
// }

// const WorkloadChart: React.FC<WorkloadChartProps> = ({ projectId }) => {
const WorkloadChart = () => {
  const projectId = 1;
  const { data, isLoading, isError } = useGetWorkloadDashboardQuery(projectId);

  if (isLoading) return <div>Loading workload chart...</div>;
  if (isError || !data?.data) return <div>Failed to load workload chart</div>;

  const chartData = data.data.map((member) => ({
    name: member.memberName,
    Completed: member.completed,
    Remaining: member.remaining,
    Overdue: member.overdue,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout='vertical'
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          barCategoryGap={25} 
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' allowDecimals={false} />
          <YAxis dataKey='name' type='category' tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey='Completed' stackId='a' fill='#00C49F' />
          <Bar dataKey='Remaining' stackId='a' fill='#00E0FF' />
          <Bar dataKey='Overdue' stackId='a' fill='#FF4D4F' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkloadChart;
