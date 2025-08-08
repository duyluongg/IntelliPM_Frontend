// import React from "react";

// interface DashboardCardProps {
//   title: string;
//   children: React.ReactNode;
// }

// const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-md p-4">
//       <h2 className="text-lg font-semibold mb-3">{title}</h2>
//       {children}
//     </div>
//   );
// };

// export default DashboardCard;

import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default DashboardCard;