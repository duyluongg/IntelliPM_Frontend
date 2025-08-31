// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
// } from 'recharts';
// import { useGetCostDashboardQuery } from '../../../services/projectMetricApi';
// import { useSearchParams } from 'react-router-dom';

// interface CostDashboardData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     actualCost: number;
//     actualTaskCost: number;
//     actualResourceCost: number;
//     plannedCost: number;
//     plannedTaskCost: number;
//     plannedResourceCost: number;
//     earnedValue: number;
//     budget: number;
//   };
// }

// // Utility function to format large numbers into K, M, or B
// const formatCurrency = (value: number): string => {
//   if (value >= 1_000_000_000) {
//     return `${(value / 1_000_000_000).toFixed(2)}B VND`; // Billions, 2 decimals
//   } else if (value >= 100_000_000) {
//     return `${(value / 1_000_000).toFixed(2)}M VND`; // Millions (≥100M), 2 decimals
//   } else if (value >= 1_000_000) {
//     return `${value.toLocaleString('vi-VN')} VND`; // Low millions (<100M), full number
//   } else if (value >= 1_000) {
//     return `${(value / 1_000).toFixed(2)}K VND`; // Thousands, 2 decimals
//   } else {
//     return `${value.toLocaleString('vi-VN')} VND`; // Less than 1,000, full number
//   }
// };

// const CostBarChart = ({
//   data,
//   isLoading,
// }: {
//   data: CostDashboardData | undefined;
//   isLoading: boolean;
// }) => {
//   if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
//   if (!data?.data) return <div>Failed to load cost data</div>;

//   console.log('CostDashboard data:', data);

//   const { actualCost, plannedCost, earnedValue, budget } = data.data;

//   const chartData = [
//     {
//       name: 'Cost',
//       Actual: actualCost,
//       Planned: plannedCost,
//       Earned : earnedValue,
//       Budget: budget,
//     },
//   ];

//   return (
//     <div style={{ width: '100%', height: 300 }}>
//       <ResponsiveContainer>
//         <BarChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis
//             tickFormatter={(value) => formatCurrency(value)} // Use dynamic formatter
//             width={100} // Increased width for longer labels
//             tick={{ fontSize: 12 }} // Smaller font for better fit
//           />
//           <Tooltip formatter={(value: number) => formatCurrency(value)} />
//           <Legend />
//           <Bar dataKey="Actual" fill="#00C49F" barSize={20} />
//           <Bar dataKey="Planned" fill="#00E0FF" barSize={20} />
//           <Bar dataKey="Earned" fill="#00E0FF" barSize={20} />
//           <Bar dataKey="Budget" fill="#3399FF" barSize={20} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default CostBarChart;

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
    earnedValue: number;
    budget: number;
  };
}

// Utility function to format large numbers into K, M, or B
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B VND`; // Billions, 2 decimals
  } else if (value >= 100_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M VND`; // Millions (≥100M), 2 decimals
  } else if (value >= 1_000_000) {
    return `${value.toLocaleString('vi-VN')} VND`; // Low millions (<100M), full number
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K VND`; // Thousands, 2 decimals
  } else {
    return `${value.toLocaleString('vi-VN')} VND`; // Less than 1,000, full number
  }
};

const CostBarChart = ({
  data,
  isLoading,
}: {
  data: CostDashboardData | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!data?.data) return <div className="text-sm text-red-500">Failed to load cost data</div>;

  console.log('CostDashboard data:', data);

  const { actualCost, plannedCost, earnedValue, budget } = data.data;

  const chartData = [
    {
      name: 'Cost Metrics',
      Actual: actualCost,
      Planned: plannedCost,
      Earned: earnedValue,
      Budget: budget,
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }} className="bg-white p-4 rounded-lg shadow">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" fontSize={14} tick={{ fill: '#374151' }} />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            width={100}
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Cost']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Bar dataKey="Actual" fill="#ef4444" barSize={20} radius={[4, 4, 0, 0]} /> {/* Red for actual cost, signals overspending */}
          <Bar dataKey="Planned" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} /> {/* Blue for planned cost, neutral baseline */}
          <Bar dataKey="Earned" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} /> {/* Green for earned value, progress indicator */}
          <Bar dataKey="Budget" fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} /> {/* Purple for budget, fixed reference */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBarChart;