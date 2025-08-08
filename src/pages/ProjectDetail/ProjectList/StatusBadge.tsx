import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold shadow-sm';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'INVITED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <span className={getStatusBadge(status)}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
