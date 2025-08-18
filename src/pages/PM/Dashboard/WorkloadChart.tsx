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
import { useSearchParams } from 'react-router-dom';

interface WorkloadMember {
  memberName: string;
  completed: number;
  remaining: number;
  overdue: number;
}

interface WorkloadDashboardData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: WorkloadMember[];
}

const WorkloadChart = ({
  data,
  isLoading,
}: {
  data: WorkloadDashboardData | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
  if (!data?.data) return <div>Failed to load workload chart</div>;

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
