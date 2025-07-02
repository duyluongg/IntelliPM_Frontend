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

const CostBarChart = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data, isLoading, isError } = useGetCostDashboardQuery(projectKey);

  if (isLoading) return <div>Loading cost data...</div>;
  if (isError || !data?.data) return <div>Failed to load cost data</div>;

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
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
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
