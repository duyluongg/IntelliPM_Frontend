import TaskStatusChart from './TaskStatusChart';
import DashboardCard from './DashboardCard';
import { useEffect, useState } from 'react';
import {
  useCalculateProjectMetricsMutation,
  useGetProjectMetricByProjectKeyQuery,
} from '../../../services/projectMetricApi';
import HealthOverview from './HealthOverview';
import ProgressPerSprint from './ProgressPerSprint';
import TimeComparisonChart from './TimeComparisonChart';
import CostBarChart from './CostBarChart';
import WorkloadChart from './WorkloadChart';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLazyGetAIRecommendationsByProjectKeyQuery, useCreateProjectRecommendationMutation } from '../../../services/projectRecommendationApi';

const ProjectDashboard = () => {
  const [calculate] = useCalculateProjectMetricsMutation();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  useEffect(() => {
    calculate({ projectKey }).catch((err) => {
      console.error('Error calculating project metrics:', err);
    });
  }, [calculate, projectKey]);

  const { data: metricData } = useGetProjectMetricByProjectKeyQuery(projectKey);
  const spi = metricData?.data?.spi || 1;
  const cpi = metricData?.data?.cpi || 1;

  const AlertCard = ({
    spi,
    cpi,
    onShowAIRecommendations,
    showRecommendations,
  }: {
    spi: number;
    cpi: number;
    onShowAIRecommendations: () => void;
    showRecommendations: boolean;
  }) => {
    const isSPIBad = spi < 1;
    const isCPIBad = cpi < 1;

    if (!isSPIBad && !isCPIBad) return null;

    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded col-span-full'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-start gap-2'>
            <AlertTriangle className='text-red-500' size={20} />
            <div className='flex flex-col text-sm'>
              <strong>Warning:</strong>
              {isSPIBad && <span>• Schedule Performance Index (SPI) is below 1.</span>}
              {isCPIBad && <span>• Cost Performance Index (CPI) is below 1.</span>}
              <span>• Please review suggested actions from AI below.</span>
            </div>
          </div>

          {!showRecommendations && (
            <button
              onClick={onShowAIRecommendations}
              className='self-start bg-blue-600 text-white px-4 py-1.5 mt-1 rounded hover:bg-blue-700 text-sm'
            >
              📥 Xem gợi ý từ AI
            </button>
          )}
        </div>
      </div>
    );
  };

  interface AIRecommendation {
    recommendation: string;
    details: string;
    type: string;
    affectedTasks: string[];
    suggestedTask: string | null;
    expectedImpact: string;
    suggestedChanges: Record<string, any>;
  }

  const [triggerGetRecommendations, { data: recData, isLoading: isRecLoading }] =
    useLazyGetAIRecommendationsByProjectKeyQuery();

  const [showRecommendations, setShowRecommendations] = useState(false);
  const recommendations: AIRecommendation[] = recData?.data ?? [];

  const RecommendationCard = ({ rec, index, projectId }: { rec: AIRecommendation; index: number; projectId: number | undefined; }) => {
    const [approved, setApproved] = useState<boolean | null>(null);
    const [createRecommendation] = useCreateProjectRecommendationMutation();

    const handleApprove = async () => {
    if (!projectId) return;
    try {
      await createRecommendation({
        projectId,
        taskId: rec.suggestedTask,
        type: rec.type,
        recommendation: rec.details,
      }).unwrap();
      setApproved(true);
    } catch (err) {
      console.error('Error saving recommendation:', err);
    }
  };

    const handleReject = () => {
      setApproved(false);
    };

    return (
      <div className='border rounded-lg p-4 shadow bg-white flex flex-col gap-2'>
        <div className='text-sm text-gray-600 font-semibold'>
          Recommendation #{index + 1} - {rec.type}
        </div>
        <div className='font-medium text-black'>{rec.recommendation}</div>
        <div className='text-sm text-gray-700 whitespace-pre-wrap'>{rec.details}</div>
        <div className='text-xs text-gray-500'>
          <strong>Expected Impact:</strong> {rec.expectedImpact}
        </div>
        {rec.suggestedChanges && Object.keys(rec.suggestedChanges).length > 0 && (
          <div className='text-sm text-gray-600 bg-gray-100 p-2 rounded'>
            <strong>Suggested Changes:</strong>
            <ul className='list-disc list-inside mt-1'>
              {Object.entries(rec.suggestedChanges).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className='flex gap-2 mt-2'>
          <button
            onClick={handleApprove}
            className='bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm'
          >
            ✅ Approve
          </button>
          <button
            onClick={handleReject}
            className='bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 text-sm'
          >
            ❌ Reject
          </button>
          {approved !== null && (
            <span className='text-xs text-green-600'>{approved ? 'Approved' : 'Rejected'}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      {/* <AlertCard spi={spi} cpi={cpi} /> */}
      <AlertCard
        spi={spi}
        cpi={cpi}
        showRecommendations={showRecommendations}
        onShowAIRecommendations={() => {
          triggerGetRecommendations(projectKey);
          setShowRecommendations(true);
        }}
      />

      <DashboardCard title='Health Overview'>
        <HealthOverview />
      </DashboardCard>

      <DashboardCard title='Task Status'>
        <TaskStatusChart />
      </DashboardCard>

      <DashboardCard title='Progress'>
        <ProgressPerSprint />
      </DashboardCard>

      <DashboardCard title='Time Tracking'>
        <TimeComparisonChart />
      </DashboardCard>

      <DashboardCard title='Cost'>
        <CostBarChart />
      </DashboardCard>

      <DashboardCard title='Workload'>
        <WorkloadChart />
      </DashboardCard>

      {showRecommendations && (
        <div className='col-span-full space-y-4 mt-4'>
          {isRecLoading ? (
            <p>Đang lấy gợi ý...</p>
          ) : (
            <>
              <h2>📌 Suggested actions from AI</h2>
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} rec={rec} index={idx} projectId={metricData?.data?.projectId} />
                ))
              ) : (
                <p className='text-sm text-gray-600'>Không có gợi ý nào từ AI.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
