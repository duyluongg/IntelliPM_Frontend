import React from 'react';

interface HealthData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    projectStatus: string;
    timeStatus: string;
    tasksToBeCompleted: number;
    overdueTasks: number;
    progressPercent: number;
    costStatus: string;
    cost: ProjectMetric;
    showAlert: boolean;
  };
}

interface ProjectMetric {
  projectId: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  budgetAtCompletion: number;
  durationAtCompletion: number;
  costVariance: number;
  scheduleVariance: number;
  costPerformanceIndex: number;
  schedulePerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  estimateDurationAtCompletion: number;
  calculatedBy: string;
  createdAt: string;
  updatedAt: string;
}

const HealthOverview: React.FC<{
  data: HealthData | undefined;
  isLoading: boolean;
}> = ({ data, isLoading }) => {
  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!data || !data.data)
    return <div className="text-sm text-red-500">Error fetching health data</div>;

  const { projectStatus, timeStatus, tasksToBeCompleted, overdueTasks, progressPercent, costStatus, cost } =
    data.data;

  return (
    <div className="p-4">
      <div className="space-y-2 text-sm text-gray-700">
        <Row label="Project Status" value={projectStatus || 'No data'} />
        <Row label="Time status" value={timeStatus || 'No data'} />
        <Row label="Cost status" value={costStatus || 'No data'} />
        <Row label="Tasks" value={`${Math.max(0, tasksToBeCompleted)} tasks to be completed`} />
        <Row label="Workload" value={`${overdueTasks} tasks overdue`} />
        <Row label="Progress" value={`${progressPercent}% complete`} /> 
        {/* <Row
          label="Cost Performance Index"
          value={costStatus === 0 || costStatus === undefined ? '0' : `${costStatus}`}
        /> */}
        <Row label="Schedule Performance Index" value={`${cost.schedulePerformanceIndex}`} />
        <Row label="Cost Performance Index" value={`${cost.costPerformanceIndex}`} />
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-gray-100 pb-1">
    <span className="font-medium text-gray-800">{label}</span>
    <span className="text-gray-500">{value}</span>
  </div>
);

export default HealthOverview;