import { useGetProgressDashboardQuery } from "../../../services/projectMetricApi";
import { useSearchParams } from "react-router-dom";

const ProgressPerSprint = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data, isLoading, error } = useGetProgressDashboardQuery(projectKey);

  if (isLoading) return <div>Loading progress...</div>;
  if (error || !data?.data) return <div>Error loading progress data</div>;

  return (
    <div className="p-4">
      {/* <h2 className="text-lg font-semibold mb-4">Progress</h2> */}
      <div className="space-y-2">
        {data.data.map((item, index) => (
          <div key={item.sprintId}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="w-2/3 truncate">{`${index + 1}. ${item.sprintName}`}</span>
              <span className="text-teal-500 font-medium">{item.percentComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-teal-400 h-2 rounded"
                style={{ width: `${Math.min(item.percentComplete, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPerSprint;
