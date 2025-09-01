// import { useGetTimeDashboardQuery } from '../../../services/projectMetricApi';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LabelList,
//   ResponsiveContainer,
//   Cell,
// } from 'recharts';
// import { useSearchParams } from 'react-router-dom';

// interface TimeDashboardData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     plannedCompletion: number;
//     actualCompletion: number;
//     status: string;
//   };
// }

// const TimeComparisonChart = ({
//   data,
//   isLoading,
// }: {
//   data: TimeDashboardData | undefined;
//   isLoading: boolean;
// }) => {
//   if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
//   if (!data?.data) return <div>Error loading time dashboard</div>;

//   const { plannedCompletion, actualCompletion, status } = data.data;

//   const deltaValue = Math.abs(actualCompletion - plannedCompletion);

//   const chartData = [
//     {
//       name: 'Planned Completion',
//       value: plannedCompletion,
//       color:
//         status === 'Ahead'
//           ? '#00BFFF'
//           : status === 'Behind'
//           ? '#FFA500'
//           : status === 'Not Started'
//           ? '#D3D3D3'
//           : '#00C49F', // On Time
//     },
//     {
//       name: 'Actual Completion',
//       value: actualCompletion,
//       color:
//         status === 'Ahead'
//           ? '#00BFFF'
//           : status === 'Behind'
//           ? '#FFA500'
//           : status === 'Not Started'
//           ? '#D3D3D3'
//           : '#00C49F',
//     },
//     {
//       name:
//         status === 'Ahead'
//           ? 'Ahead'
//           : status === 'Behind'
//           ? 'Behind'
//           : status === 'Not Started'
//           ? 'Not Started'
//           : 'On Time',
//       value: deltaValue,
//       color:
//         status === 'Ahead'
//           ? '#00BFFF'
//           : status === 'Behind'
//           ? '#FFA500'
//           : status === 'Not Started'
//           ? '#D3D3D3'
//           : '#00C49F',
//     },
//   ];

//   // const chartData = [
//   //   {
//   //     name: 'Planned Completion',
//   //     value: plannedCompletion,
//   //     color:
//   //       status === 'Ahead'
//   //         ? '#00BFFF' // Blue
//   //         : status === 'Behind'
//   //         ? '#FFA500' // Orange
//   //         : '#00C49F', // On Time
//   //   },
//   //   {
//   //     name: 'Actual Completion',
//   //     value: actualCompletion,
//   //     color:
//   //       status === 'Ahead'
//   //         ? '#00BFFF' // Blue
//   //         : status === 'Behind'
//   //         ? '#FFA500' // Orange
//   //         : '#00C49F', // On Time
//   //   },
//   //   {
//   //     name: status === 'Ahead' ? 'Ahead' : status === 'Behind' ? 'Behind' : 'On Time',
//   //     value: deltaValue,
//   //     color: status === 'Ahead' ? '#00BFFF' : status === 'Behind' ? '#FFA500' : '#00C49F',
//   //   },
//   // ];

//   const WrappedYAxisTick = (props: any) => {
//     const { x, y, payload } = props;
//     const words = String(payload.value).split(' '); // Tách từ để wrap

//     return (
//       <g transform={`translate(${x},${y})`}>
//         <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
//           {words.map((word: string, index: number) => (
//             <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
//               {word}
//             </tspan>
//           ))}
//         </text>
//       </g>
//     );
//   };

//   return (
//     <div className='p-4'>
//       <div className='flex items-center justify-between mb-4'>
//         {/* <h2 className='text-lg font-semibold'>Time</h2> */}
//         <div className='flex gap-4 text-sm text-gray-600'>
//           <div className='flex items-center gap-1'>
//             <span className='w-3 h-3 bg-[#00BFFF] rounded-full inline-block' />
//             Ahead
//           </div>
//           <div className='flex items-center gap-1'>
//             <span className='w-3 h-3 bg-[#FFA500] rounded-full inline-block' />
//             Behind
//           </div>
//           <div className='flex items-center gap-1'>
//             <span className='w-3 h-3 bg-[#00C49F] rounded-full inline-block' />
//             On Time
//           </div>
//           <div className='flex items-center gap-1'>
//             <span className='w-3 h-3 bg-[#D3D3D3] rounded-full inline-block' />
//             Not Started
//           </div>
//         </div>
//       </div>

//       <ResponsiveContainer width='100%' height={200}>
//         <BarChart
//           layout='vertical'
//           data={chartData}
//           margin={{ top: 10, right: 20, left: -60, bottom: 10 }}
//           barCategoryGap={15}
//         >
//           <XAxis type='number' domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} reversed />
//           {/* <YAxis type='category' dataKey='name' width={130} tick={{ fontSize: 12 }} /> */}
//           <YAxis type='category' dataKey='name' width={130} tick={<WrappedYAxisTick />} />
//           <Tooltip formatter={(value) => `${value}%`} />
//           <Bar dataKey='value' isAnimationActive={false}>
//             {chartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//             <LabelList
//               dataKey='value'
//               position='insideRight'
//               formatter={(value) => (typeof value === 'number' ? `${value}%` : '')}
//               fill='#fff'
//             />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>

//       {/* <p className='text-sm text-gray-600 mt-2'>
//         Status:{' '}
//         <span
//           className={
//             status === 'Ahead'
//               ? 'text-blue-500'
//               : status === 'Behind'
//               ? 'text-orange-500'
//               : 'text-green-500'
//           }
//         >
//           {status === 'Ahead'
//             ? '🚀 Ahead of schedule'
//             : status === 'Behind'
//             ? 
//               '🔺 Behind schedule'
//             : '✅ On time'}
//         </span>
//       </p> */}
//       <p className='text-sm text-gray-600 mt-2'>
//         Status:{' '}
//         <span
//           className={
//             status === 'Ahead'
//               ? 'text-blue-500'
//               : status === 'Behind'
//               ? 'text-orange-500'
//               : status === 'Not Started'
//               ? 'text-gray-500'
//               : 'text-green-500'
//           }
//         >
//           {status === 'Ahead'
//             ? '🚀 Ahead of schedule'
//             : status === 'Behind'
//             ? '🔺 Behind schedule'
//             : status === 'Not Started'
//             ? '🕒 Not started yet'
//             : '✅ On time'}
//         </span>
//       </p>
//     </div>
//   );
// };

// export default TimeComparisonChart;


// import { useGetTimeDashboardQuery } from '../../../services/projectMetricApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LabelList,
//   ResponsiveContainer,
//   Cell,
// } from 'recharts';
// import { useSearchParams } from 'react-router-dom';

// interface TimeDashboardData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     plannedCompletion: number;
//     actualCompletion: number;
//     status: string;
//   };
// }

// interface HealthStatus {
//   name: string;
//   label: string;
//   color: string;
// }

// const TimeComparisonChart = ({
//   data,
//   isLoading,
// }: {
//   data: TimeDashboardData | undefined;
//   isLoading: boolean;
// }) => {
//   const { data: healthStatusData, isLoading: isHealthStatusLoading } = useGetCategoriesByGroupQuery('health_status');

//   if (isLoading || isHealthStatusLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
//   if (!data?.data) return <div className='text-sm text-red-500'>Error loading time dashboard</div>;

//   const { plannedCompletion, actualCompletion, status } = data.data;

//   // Map health_status categories to a lookup object
//   const healthStatusMap = healthStatusData?.data?.reduce((map: Record<string, HealthStatus>, category) => {
//     map[category.name] = {
//       name: category.name,
//       label: category.label,
//       color: category.color || '#D3D3D3', // Fallback color
//     };
//     return map;
//   }, {}) || {
//     AHEAD: { name: 'AHEAD', label: 'Ahead', color: '#00BFFF' },
//     BEHIND: { name: 'BEHIND', label: 'Behind', color: '#FFA500' },
//     ON_TIME: { name: 'ON_TIME', label: 'On Time', color: '#00C49F' },
//   };

//   const currentStatus = healthStatusMap[status] || {
//     name: status,
//     label: status,
//     color: '#D3D3D3', // Fallback for unmatched status
//   };

//   const deltaValue = Math.abs(actualCompletion - plannedCompletion).toFixed(2);

//   const chartData = [
//     {
//       name: 'Planned Completion',
//       value: plannedCompletion,
//       color: currentStatus.color,
//     },
//     {
//       name: 'Actual Completion',
//       value: actualCompletion,
//       color: currentStatus.color,
//     },
//     {
//       name: currentStatus.label,
//       value: deltaValue,
//       color: currentStatus.color,
//     },
//   ];

//   const WrappedYAxisTick = (props: any) => {
//     const { x, y, payload } = props;
//     const words = String(payload.value).split(' '); // Split words for wrapping

//     return (
//       <g transform={`translate(${x},${y})`}>
//         <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
//           {words.map((word: string, index: number) => (
//             <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
//               {word}
//             </tspan>
//           ))}
//         </text>
//       </g>
//     );
//   };

//   return (
//     <div className='p-4'>
//       <div className='flex items-center justify-between mb-4'>
//         <div className='flex gap-4 text-sm text-gray-600'>
//           {Object.values(healthStatusMap)
//             .filter(status => ['AHEAD', 'BEHIND', 'ON_TIME'].includes(status.name)) // Exclude NOT_STARTED, NO_PROGRESS
//             .map(status => (
//               <div key={status.name} className='flex items-center gap-1'>
//                 <span
//                   className='w-3 h-3 rounded-full inline-block'
//                   style={{ backgroundColor: status.color }}
//                 />
//                 {status.label}
//               </div>
//             ))}
//         </div>
//       </div>

//       <ResponsiveContainer width='100%' height={200}>
//         <BarChart
//           layout='vertical'
//           data={chartData}
//           margin={{ top: 10, right: 20, left: -60, bottom: 10 }}
//           barCategoryGap={15}
//         >
//           <XAxis type='number' domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} reversed />
//           <YAxis type='category' dataKey='name' width={130} tick={<WrappedYAxisTick />} />
//           <Tooltip formatter={(value) => `${value}%`} />
//           <Bar dataKey='value' isAnimationActive={false}>
//             {chartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//             <LabelList
//               dataKey='value'
//               position='insideRight'
//               formatter={(value) => (typeof value === 'number' ? `${value}%` : '')}
//               fill='#fff'
//             />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>

//       <p className='text-sm text-gray-600 mt-2'>
//         Status:{' '}
//         <span
//           className={
//             status === 'AHEAD'
//               ? 'text-blue-500'
//               : status === 'BEHIND'
//               ? 'text-orange-500'
//               : 'text-green-500'
//           }
//         >
//           {status === 'AHEAD'
//             ? `🚀 ${currentStatus.label}`
//             : status === 'BEHIND'
//             ? `🔺 ${currentStatus.label}`
//             : `✅ ${currentStatus.label}`}
//         </span>
//       </p>
//     </div>
//   );
// };

// export default TimeComparisonChart;


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
import { useGetTimeDashboardQuery } from '../../../services/projectMetricApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

interface TimeDashboardData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    plannedCompletion: number;
    actualCompletion: number;
    status: string;
  };
}

interface HealthStatus {
  name: string;
  label: string;
  color: string;
}

const TimeComparisonChart: React.FC<{
  data: TimeDashboardData | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  const { data: healthStatusData, isLoading: isHealthStatusLoading } = useGetCategoriesByGroupQuery('health_status');

  if (isLoading || isHealthStatusLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-red-500">Error loading time dashboard</div>
      </div>
    );
  }

  const { plannedCompletion, actualCompletion, status } = data.data;

  // Normalize status to match healthStatusMap keys (e.g., "On Time" -> "ON_TIME")
  const normalizedStatus = status
    .toUpperCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^A-Z_]/g, ''); // Remove any non-uppercase or non-underscore characters

  // Map health_status categories to a lookup object
  const healthStatusMap = healthStatusData?.data?.reduce((map: Record<string, HealthStatus>, category) => {
    map[category.name] = {
      name: category.name,
      label: category.label,
      color: category.color || '#D3D3D3', // Fallback color
    };
    return map;
  }, {}) || {
    AHEAD: { name: 'AHEAD', label: 'Ahead', color: '#00BFFF' },
    BEHIND: { name: 'BEHIND', label: 'Behind', color: '#FFA500' },
    ON_TIME: { name: 'ON_TIME', label: 'On Time', color: '#00C49F' },
  };

  const currentStatus = healthStatusMap[normalizedStatus] || {
    name: status,
    label: status,
    color: '#D3D3D3', // Fallback for unmatched status
  };

  const deltaValue = Math.abs(actualCompletion - plannedCompletion).toFixed(2);

  const chartData = [
    {
      name: 'Planned Completion',
      value: plannedCompletion,
      color: currentStatus.color,
    },
    {
      name: 'Actual Completion',
      value: actualCompletion,
      color: currentStatus.color,
    },
    {
      name: currentStatus.label,
      value: Number(deltaValue),
      color: currentStatus.color,
    },
  ];

  const WrappedYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const words = String(payload.value).split(' '); // Split words for wrapping

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={12}>
          {words.map((word: string, index: number) => (
            <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
              {word}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 text-sm text-gray-600">
          {Object.values(healthStatusMap)
            .filter((status) => ['AHEAD', 'BEHIND', 'ON_TIME'].includes(status.name)) // Exclude NOT_STARTED, NO_PROGRESS
            .map((status) => (
              <div key={status.name} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: status.color }}
                />
                {status.label}
              </div>
            ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: -60, bottom: 10 }}
          barCategoryGap={15}
        >
          <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} reversed />
          <YAxis type="category" dataKey="name" width={130} tick={<WrappedYAxisTick />} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="value" isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList
              dataKey="value"
              position="insideRight"
              formatter={(value) => (typeof value === 'number' ? `${value}%` : '')}
              fill="#fff"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-600 mt-2">
        Status:{' '}
        <span
          className={
            normalizedStatus === 'AHEAD'
              ? 'text-blue-500'
              : normalizedStatus === 'BEHIND'
              ? 'text-orange-500'
              : 'text-green-500'
          }
        >
          {normalizedStatus === 'AHEAD'
            ? `🚀 ${currentStatus.label}`
            : normalizedStatus === 'BEHIND'
            ? `🔺 ${currentStatus.label}`
            : `✅ ${currentStatus.label}`}
        </span>
      </p>
    </div>
  );
};

export default TimeComparisonChart;

