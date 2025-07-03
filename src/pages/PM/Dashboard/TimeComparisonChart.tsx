import { useGetTimeDashboardQuery } from '../../../services/projectMetricApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useSearchParams } from 'react-router-dom';

const TimeComparisonChart = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data, isLoading, error } = useGetTimeDashboardQuery(projectKey);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data?.data) return <div>Error loading time dashboard</div>;

  const { plannedCompletion, actualCompletion, status } = data.data;

  const deltaValue = Math.abs(actualCompletion - plannedCompletion);

  const chartData = [
    {
      name: 'Planned Completion',
      value: plannedCompletion,
      color:
        status === 'Ahead'
          ? '#00BFFF' // Blue
          : status === 'Behind'
          ? '#FFA500' // Orange
          : '#00C49F', // On Time
    },
    {
      name: 'Actual Completion',
      value: actualCompletion,
      color:
        status === 'Ahead'
          ? '#00BFFF' // Blue
          : status === 'Behind'
          ? '#FFA500' // Orange
          : '#00C49F', // On Time
    },
    {
      name: status === 'Ahead' ? 'Ahead' : status === 'Behind' ? 'Behind' : 'On Time',
      value: deltaValue,
      color: status === 'Ahead' ? '#00BFFF' : status === 'Behind' ? '#FFA500' : '#00C49F',
    },
  ];

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        {/* <h2 className='text-lg font-semibold'>Time</h2> */}
        <div className='flex gap-4 text-sm text-gray-600'>
          <div className='flex items-center gap-1'>
            <span className='w-3 h-3 bg-[#00BFFF] rounded-full inline-block' />
            Ahead
          </div>
          <div className='flex items-center gap-1'>
            <span className='w-3 h-3 bg-[#FFA500] rounded-full inline-block' />
            Behind
          </div>
          <div className='flex items-center gap-1'>
            <span className='w-3 h-3 bg-[#00C49F] rounded-full inline-block' />
            On Time
          </div>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={200}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 10, right: 20, left: -60, bottom: 10 }}
          barCategoryGap={15} 
        >
          <XAxis type='number' domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} reversed />
          <YAxis type='category' dataKey='name' width={130} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey='value' isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey='value'
              position='insideRight'
              formatter={(value) => (typeof value === 'number' ? `${value}%` : '')}
              fill='#fff'
            //   style={{ fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className='text-sm text-gray-600 mt-2'>
        Status:{' '}
        <span
          className={
            status === 'Ahead'
              ? 'text-blue-500'
              : status === 'Behind'
              ? 'text-orange-500'
              : 'text-green-500'
          }
        >
          {status === 'Ahead'
            ? '🚀 Ahead of schedule'
            : status === 'Behind'
            // ? '⏳ Behind schedule'
            ? '🔺 Behind schedule'
            : '✅ On time'}
            {/* ⏫ hoặc 🔺 */}
        </span>
      </p>
    </div>
  );
};

export default TimeComparisonChart;
