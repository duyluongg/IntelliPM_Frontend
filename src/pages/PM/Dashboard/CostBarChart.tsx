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
import { useGetCostDashboardQuery } from '../../../services/projectMetricApi';
import { useSearchParams } from 'react-router-dom';

// const CostBarChart = () => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const { data, isLoading, isError } = useGetCostDashboardQuery(projectKey);

interface CostDashboardData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    actualCost: number;
    actualTaskCost: number;
    actualResourceCost: number;
    plannedCost: number;
    plannedTaskCost: number;
    plannedResourceCost: number;
    budget: number;
  };
}

const CostBarChart = ({
  data,
  isLoading,
}: {
  data: CostDashboardData | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
  if (!data?.data) return <div>Failed to load cost data</div>;

  const { actualCost, plannedCost, budget } = data.data;

  const chartData = [
    {
      name: 'Cost',
      Actual: actualCost,
      Planned: plannedCost,
      Budget: budget,
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K VND`} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} VND`} />
          <Legend />
          <Bar dataKey='Actual' fill='#00C49F' barSize={20} />
          <Bar dataKey='Planned' fill='#00E0FF' barSize={20} />
          <Bar dataKey='Budget' fill='#3399FF' barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBarChart;
