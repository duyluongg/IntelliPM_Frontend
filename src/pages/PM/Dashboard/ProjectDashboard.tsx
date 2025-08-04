import TaskStatusChart from './TaskStatusChart';
import DashboardCard from './DashboardCard';
import { useEffect, useState } from 'react';
import {
  useCalculateMetricsBySystemMutation,
  useGetProjectMetricByProjectKeyQuery,
  useGetHealthDashboardQuery,
  useGetProgressDashboardQuery,
  useGetTaskStatusDashboardQuery,
  useGetTimeDashboardQuery,
  useGetCostDashboardQuery,
  useGetWorkloadDashboardQuery,
  useGetProjectMetricAIByProjectKeyQuery,
} from '../../../services/projectMetricApi';
import HealthOverview from './HealthOverview';
import ProgressPerSprint from './ProgressPerSprint';
import TimeComparisonChart from './TimeComparisonChart';
import CostBarChart from './CostBarChart';
import WorkloadChart from './WorkloadChart';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  useLazyGetAIRecommendationsByProjectKeyQuery,
  useCreateProjectRecommendationMutation,
  useGetRecommendationsByProjectKeyQuery,
  useGetAIForecastByProjectKeyQuery,
  useLazyGetAIForecastByProjectKeyQuery,
} from '../../../services/projectRecommendationApi';
import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
import ImpactChart from './ImpactChart';
import './ProjectDashboard.css';

const ProjectDashboard = () => {
  const [calculate] = useCalculateMetricsBySystemMutation();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: metricData, refetch } = useGetProjectMetricByProjectKeyQuery(projectKey);
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useGetHealthDashboardQuery(projectKey);
  const {
    data: progressData,
    isLoading: isProgressLoading,
    refetch: refetchProgress,
  } = useGetProgressDashboardQuery(projectKey);
  const {
    data: taskStatusData,
    isLoading: isTaskStatusLoading,
    refetch: refetchTaskStatus,
  } = useGetTaskStatusDashboardQuery(projectKey);
  const {
    data: timeData,
    isLoading: isTimeLoading,
    refetch: refetchTime,
  } = useGetTimeDashboardQuery(projectKey);
  const {
    data: costData,
    isLoading: isCostLoading,
    refetch: refetchCost,
  } = useGetCostDashboardQuery(projectKey);
  const {
    data: workloadData,
    isLoading: isWorkloadLoading,
    refetch: refetchWorkload,
  } = useGetWorkloadDashboardQuery(projectKey);

  const {
    data: recRes,
    isLoading: isRecsLoading,
    refetch: refetchRec,
  } = useGetRecommendationsByProjectKeyQuery(projectKey);

  const [triggerForecast, { data: forecastRes, isLoading: isForecastLoading }] =
    useLazyGetAIForecastByProjectKeyQuery();

  const {
    data: metricAIData,
    isLoading: isAIMetricLoading,
    refetch: refetchAIData,
  } = useGetProjectMetricAIByProjectKeyQuery(projectKey);

  const location = useLocation();

  useEffect(() => {
    const doCalculateThenRefetch = async () => {
      try {
        await calculate({ projectKey }).unwrap();
        await refetch();
      } catch (err) {
        console.error('❌ Error calculating/refetching metrics:', err);
      }
    };

    doCalculateThenRefetch();
  }, [location.key]);

  useEffect(() => {
    refetchHealth();
    refetchProgress();
    refetchTaskStatus();
    refetchTime();
    refetchCost();
    refetchWorkload();
  }, [location.key]);

  const approvedRecs =
    recRes?.data.map((rec) => ({
      id: rec.id,
      projectId: rec.projectId,
      taskId: rec.taskId,
      taskTitle: rec.taskTitle,
      type: rec.type,
      recommendation: rec.recommendation,
      createdAt: rec.createdAt,
    })) ?? [];

  const [approvedIds, setApprovedIds] = useState<number[]>([]);

  const spi = metricData?.data?.schedulePerformanceIndex || 1;
  const cpi = metricData?.data?.costPerformanceIndex || 1;

  const ForecastCard = ({
    eac,
    etc,
    vac,
    edac,
  }: {
    eac: number;
    etc: number;
    vac: number;
    edac: number;
  }) => {
    return (
      <div className='bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded col-span-full'>
        <div className='flex flex-col gap-2 text-sm'>
          <div className='font-semibold text-base mb-1'>📊 Project Forecast</div>
          <div>
            <strong>Estimate at Completion (EAC):</strong> {eac.toLocaleString()}
            <span className='block ml-1 text-xs text-gray-600'>
              — This is the expected total cost of the project when completed. It considers actual
              costs so far and remaining estimates.
            </span>
          </div>
          <div>
            <strong>Estimate to Complete (ETC):</strong> {etc.toLocaleString()}
            <span className='block ml-1 text-xs text-gray-600'>
              — The projected cost required to finish the remaining work in the project.
            </span>
          </div>
          <div>
            <strong>Variance at Completion (VAC):</strong> {vac.toLocaleString()}
            <span className='block ml-1 text-xs text-gray-600'>
              — The difference between the original budget and the estimated cost at completion. A
              negative value means over budget.
            </span>
          </div>
          <div>
            <strong>Estimated Duration (EDAC):</strong> {edac} months
            <span className='block ml-1 text-xs text-gray-600'>
              — The estimated total time to complete the project based on current progress and
              trends.
            </span>
          </div>
        </div>
      </div>
    );
  };

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
              disabled={isRecLoading}
              className='self-start bg-blue-600 text-white px-4 py-1.5 mt-1 rounded hover:bg-blue-700 text-sm flex items-center gap-2'
            >
              📥 View AI suggestion
              {isRecLoading && <span className='loader small'></span>}
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
    // suggestedChanges: Record<string, any>;
    suggestedChanges: string;
  }

  const [triggerGetRecommendations, { data: recData, isLoading: isRecLoading }] =
    useLazyGetAIRecommendationsByProjectKeyQuery();

  const [showRecommendations, setShowRecommendations] = useState(false);
  const recommendations: AIRecommendation[] = recData?.data ?? [];

  const RecommendationCard = ({
    rec,
    index,
    projectId,
    approvedIds,
    setApprovedIds,
  }: {
    rec: AIRecommendation;
    index: number;
    projectId: number | undefined;
    approvedIds: number[];
    setApprovedIds: React.Dispatch<React.SetStateAction<number[]>>;
  }) => {
    const [createRecommendation, { isLoading }] = useCreateProjectRecommendationMutation();

    const isApproved = approvedIds.includes(index);

    const handleApprove = async () => {
      if (!projectId || isApproved) return;
      try {
        await createRecommendation({
          projectId,
          taskId: rec.suggestedTask ?? null,
          type: rec.type,
          recommendation: rec.suggestedChanges,
        }).unwrap();
        setApprovedIds((prev) => [...prev, index]);
        await refetchRec();
        await triggerForecast(projectKey);
        await refetchAIData();
      } catch (err) {
        console.error('Error saving recommendation:', err);
      }
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
            <div className='text-sm text-gray-700 whitespace-pre-wrap'>{rec.suggestedChanges}</div>
          </div>
        )}

        <div className='flex gap-2 mt-2 items-center'>
          <button
            onClick={handleApprove}
            className='bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isApproved || isLoading}
          >
            {isLoading ? (
              <span className='flex items-center gap-1'>
                <svg
                  className='animate-spin h-4 w-4 text-white'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z'
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              '✅ Approve'
            )}
          </button>

          {isApproved && <span className='text-sm text-green-600 font-medium'>✅ Approved</span>}
        </div>
      </div>
    );
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      <div className='col-span-full grid grid-cols-3 gap-4'>
        <div className='col-span-1'>
          <DashboardCard title='Impact of AI Recommendations'>
            <ImpactChart />
          </DashboardCard>
        </div>

        <div className='col-span-2'>
          <ApprovedAIImpactPanel
            approvedRecs={approvedRecs}
            // forecast={forecastRes?.data}
            forecast={metricAIData}
            metricData={metricData}
            refetchApprovedRecs={refetchRec}
            triggerForecast={triggerForecast}
            refetchAIData={refetchAIData}
          />
        </div>
      </div>

      <AlertCard
        spi={spi}
        cpi={cpi}
        showRecommendations={showRecommendations}
        onShowAIRecommendations={() => {
          triggerGetRecommendations(projectKey);
          setShowRecommendations(true);
        }}
      />

      <ForecastCard
        eac={metricData?.data?.estimateAtCompletion ?? 0}
        etc={metricData?.data?.estimateToComplete ?? 0}
        vac={metricData?.data?.varianceAtCompletion ?? 0}
        edac={metricData?.data?.estimateDurationAtCompletion ?? 0}
      />

      <DashboardCard title='Health Overview'>
        <HealthOverview data={healthData} isLoading={isHealthLoading} />
      </DashboardCard>

      <DashboardCard title='Task Status'>
        <TaskStatusChart data={taskStatusData} isLoading={isTaskStatusLoading} />
      </DashboardCard>

      <DashboardCard title='Progress'>
        <ProgressPerSprint data={progressData} isLoading={isProgressLoading} />
      </DashboardCard>

      <DashboardCard title='Time Tracking'>
        <TimeComparisonChart data={timeData} isLoading={isTimeLoading} />
      </DashboardCard>

      <DashboardCard title='Cost'>
        <CostBarChart data={costData} isLoading={isCostLoading} />
      </DashboardCard>

      <DashboardCard title='Workload'>
        <WorkloadChart data={workloadData} isLoading={isWorkloadLoading} />
      </DashboardCard>

      {showRecommendations && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto'>
            <h2 className='text-lg font-semibold mb-4'>📌 AI Suggestions</h2>

            {isRecLoading ? (
              <p>Đang lấy gợi ý...</p>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  rec={rec}
                  index={idx}
                  projectId={metricData?.data?.projectId}
                  approvedIds={approvedIds}
                  setApprovedIds={setApprovedIds}
                />
              ))
            ) : (
              <p className='text-sm text-gray-600'>Không có gợi ý nào từ AI.</p>
            )}

            <div className='mt-4 text-right'>
              <button
                onClick={() => setShowRecommendations(false)}
                className='px-4 py-1.5 bg-gray-200 rounded hover:bg-gray-300'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
