import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDeleteRecommendationByIdMutation } from '../../../services/projectRecommendationApi';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export interface AIForecast {
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  estimatedDurationAtCompletion: number;
}

interface ProjectMetricAI {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
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
  };
}

export interface ApprovedRecommendation {
  id: number;
  projectId: number;
  taskId: string | null;
  taskTitle: string;
  type: string;
  recommendation: string;
  createdAt: string;
}

interface MetricData {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
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
  };
}

interface ApprovedAIImpactPanelProps {
  forecast?: ProjectMetricAI;
  approvedRecs: ApprovedRecommendation[];
  metricData?: MetricData;
  refetchApprovedRecs?: () => void;
  triggerForecast?: (projectKey: string) => void;
  refetchAIData?: () => void;
}

interface ImpactChartProps {
  forecast?: ProjectMetricAI;
  metricData?: MetricData;
}

const ImpactChart = ({ forecast, metricData }: ImpactChartProps) => {
  return (
    <div className='w-full'>
      <h3 className='text-base font-semibold mb-2'>Performance Metrics</h3>
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-gray-100 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-1'>Before AI</h4>
          <ul className='text-sm text-gray-600 space-y-1'>
            <li>⏱ SPI: {metricData?.data.schedulePerformanceIndex?.toFixed(2) ?? '--'}</li>
            <li>💰 CPI: {metricData?.data.costPerformanceIndex?.toFixed(2) ?? '--'}</li>
            <li>📊 EAC: {metricData?.data.estimateAtCompletion?.toLocaleString() ?? '--'}</li>
            <li>🛠 ETC: {metricData?.data.estimateToComplete?.toLocaleString() ?? '--'}</li>
            <li>📉 VAC: {metricData?.data.varianceAtCompletion?.toLocaleString() ?? '--'}</li>
            <li>
              ⏳ Duration: {metricData?.data.estimateDurationAtCompletion?.toLocaleString() ?? '--'}{' '}
              months
            </li>
          </ul>
        </div>
        <div className='bg-green-50 rounded-lg p-4'>
          <h4 className='text-sm font-medium text-green-700 mb-1'>After AI</h4>
          <ul className='text-sm text-green-800 space-y-1'>
            <li>⏱ SPI: {forecast?.data.schedulePerformanceIndex?.toFixed(2) ?? '--'}</li>
            <li>💰 CPI: {forecast?.data.costPerformanceIndex?.toFixed(2) ?? '--'}</li>
            <li>📊 EAC: {forecast?.data.estimateAtCompletion?.toLocaleString() ?? '--'}</li>
            <li>🛠 ETC: {forecast?.data.estimateToComplete?.toLocaleString() ?? '--'}</li>
            <li>📉 VAC: {forecast?.data.varianceAtCompletion?.toLocaleString() ?? '--'}</li>
            <li>
              ⏳ Duration: {forecast?.data.estimateDurationAtCompletion?.toLocaleString() ?? '--'}{' '}
              months
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ApprovedAIImpactPanel = ({
  forecast,
  approvedRecs,
  metricData,
  refetchApprovedRecs,
  triggerForecast,
  refetchAIData,
}: ApprovedAIImpactPanelProps) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [tab, setTab] = useState<'summary' | 'recommendations'>('summary');
  const [deleteRecommendation] = useDeleteRecommendationByIdMutation();
  const [impactKey, setImpactKey] = useState(0);

  // useEffect(() => {
  //   if (tab === 'summary' && refetchAIData) {
  //     refetchAIData();
  //   }
  // }, [tab, refetchAIData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteRecommendation(id).unwrap();
      refetchApprovedRecs?.();
      triggerForecast?.(projectKey);
      refetchAIData?.();
      setImpactKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
    }
  };

  return (
    <div className='w-full mt-6'>
      <div className='flex border-b mb-4'>
        <button
          onClick={() => setTab('summary')}
          className={`px-4 py-2 text-sm font-medium ${
            tab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
        >
          📊 Summary Impact
        </button>
        <button
          onClick={() => setTab('recommendations')}
          className={`ml-4 px-4 py-2 text-sm font-medium ${
            tab === 'recommendations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
        >
          ✅ Approved Recommendations
        </button>
      </div>

      {tab === 'summary' && (
        <div className='bg-white shadow rounded-lg p-4'>
          <h2 className='text-lg font-semibold mb-2'>
            📈 Project Performance (Before vs After AI)
          </h2>
          <ImpactChart forecast={forecast} metricData={metricData} key={impactKey} />
        </div>
      )}

      {tab === 'recommendations' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* {approvedRecs.map((rec, idx) => (
            <div key={idx} className='bg-white shadow rounded-lg p-4'>
              <h3 className='font-semibold text-sm mb-1'>
                #{idx + 1} — {rec.type} Optimization
              </h3>
              <p className='text-gray-800 text-sm mb-2'>{rec.recommendation}</p>
              <p className='text-xs text-gray-400'>
                Approved on: {new Date(rec.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))} */}
          {approvedRecs.map((rec, idx) => (
            <div key={idx} className='bg-white shadow rounded-lg p-4 relative'>
              <button
                onClick={() => handleDelete(rec.id)}
                className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                title='Delete recommendation'
              >
                <Trash2 size={16} />
              </button>
              <h3 className='font-semibold text-sm mb-1'>
                #{idx + 1} — {rec.type} Optimization
              </h3>
              <p className='text-gray-800 text-sm mb-2'>{rec.recommendation}</p>
              <p className='text-xs text-gray-400'>
                Approved on: {new Date(rec.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovedAIImpactPanel;
