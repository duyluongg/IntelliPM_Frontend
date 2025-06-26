import { PieChart, Pie, Cell } from 'recharts';
import { useGetTaskStatusDashboardQuery } from "../../../services/projectMetricApi";

const COLORS = {
  notStarted: '#d3d3d3',
  inProgress: '#00BFFF',
  completed: '#00C49F',
};

const TaskStatusChart = () => {
  const projectId = 1; // Có thể truyền props sau
  const { data, isLoading, error } = useGetTaskStatusDashboardQuery(projectId);

  if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;
  if (error || !data?.data) return <div>Error loading task status</div>;

  const { notStarted, inProgress, completed } = data.data;
  const chartData = [
    { name: 'Not Started', value: notStarted, color: COLORS.notStarted },
    { name: 'In Progress', value: inProgress, color: COLORS.inProgress },
    { name: 'Complete', value: completed, color: COLORS.completed },
  ];

  const total = notStarted + inProgress + completed;

  return (
    <div className="flex flex-col items-center">
      {/* <h2 className="text-lg font-semibold mb-2 self-start">Tasks</h2> */}

      <div className="relative">
        <PieChart width={180} height={180}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
          {total}
        </div>
      </div>

      <div className="mt-4 text-sm space-y-1 w-full">
        <div className="flex justify-between">
          <span className="flex items-center gap-1 text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d3d3d3]"></span> Not Started
          </span>
          <span className="text-gray-700 font-medium">{notStarted}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1 text-green-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00C49F]"></span> Complete
          </span>
          <span className="text-gray-700 font-medium">{completed}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1 text-blue-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00BFFF]"></span> In Progress
          </span>
          <span className="text-gray-700 font-medium">{inProgress}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusChart;