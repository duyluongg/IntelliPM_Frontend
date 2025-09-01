// interface ProgressItem {
//   sprintId: number;
//   sprintName: string;
//   percentComplete: number;
// }

// interface ProgressDashboardData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: ProgressItem[];
// }

// const ProgressPerSprint = ({
//   data,
//   isLoading,
// }: {
//   data: ProgressDashboardData | undefined;
//   isLoading: boolean;
// }) => {
//   if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
//   if (!data?.data || data.data.length === 0) {
//     return <div className='text-sm text-gray-500'>There are currently no sprints with progress.</div>;
//   }

//   return (
//     <div className='p-4'>
//       <div className='space-y-2'>
//         {data.data.map((item, index) => (
//           <div key={item.sprintId}>
//             <div className='flex items-center justify-between text-sm mb-1'>
//               <span className='w-2/3 truncate'>{`${index + 1}. ${item.sprintName}`}</span>
//               <span className='text-teal-500 font-medium'>{item.percentComplete}%</span>
//             </div>
//             <div className='w-full bg-gray-200 rounded h-2'>
//               <div
//                 className='bg-teal-400 h-2 rounded'
//                 style={{ width: `${Math.min(item.percentComplete, 100)}%` }}
//               ></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProgressPerSprint;


import React from 'react';

interface ProgressItem {
  sprintId: number;
  sprintName: string;
  percentComplete: number;
}

interface ProgressDashboardData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: ProgressItem[];
}

const ProgressPerSprint: React.FC<{
  data: ProgressDashboardData | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">There are currently no sprints with progress.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div
        className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="space-y-3">
          {data.data.map((item, index) => (
            <div
              key={item.sprintId}
              className="flex flex-col gap-1 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="w-2/3 truncate font-medium text-gray-700">{`${index + 1}. ${item.sprintName}`}</span>
                <span className="text-teal-600 font-semibold">{item.percentComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(item.percentComplete, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPerSprint;