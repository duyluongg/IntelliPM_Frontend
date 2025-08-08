// import { useState } from 'react';
// import { Trash2 } from 'lucide-react';
// import { useDeleteRecommendationByIdMutation } from '../../../services/projectRecommendationApi';
// import { useSearchParams } from 'react-router-dom';
// import { useEffect } from 'react';

// export interface AIForecast {
//   schedulePerformanceIndex: number;
//   costPerformanceIndex: number;
//   estimateAtCompletion: number;
//   estimateToComplete: number;
//   varianceAtCompletion: number;
//   estimatedDurationAtCompletion: number;
// }

// interface ProjectMetricAI {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     projectId: number;
//     plannedValue: number;
//     earnedValue: number;
//     actualCost: number;
//     budgetAtCompletion: number;
//     durationAtCompletion: number;
//     costVariance: number;
//     scheduleVariance: number;
//     costPerformanceIndex: number;
//     schedulePerformanceIndex: number;
//     estimateAtCompletion: number;
//     estimateToComplete: number;
//     varianceAtCompletion: number;
//     estimateDurationAtCompletion: number;
//     calculatedBy: string;
//     createdAt: string;
//     updatedAt: string;
//   };
// }

// export interface ApprovedRecommendation {
//   id: number;
//   projectId: number;
//   taskId: string | null;
//   taskTitle: string;
//   type: string;
//   recommendation: string;
//   createdAt: string;
// }

// interface MetricData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     projectId: number;
//     plannedValue: number;
//     earnedValue: number;
//     actualCost: number;
//     budgetAtCompletion: number;
//     durationAtCompletion: number;
//     costVariance: number;
//     scheduleVariance: number;
//     costPerformanceIndex: number;
//     schedulePerformanceIndex: number;
//     estimateAtCompletion: number;
//     estimateToComplete: number;
//     varianceAtCompletion: number;
//     estimateDurationAtCompletion: number;
//     calculatedBy: string;
//     createdAt: string;
//     updatedAt: string;
//   };
// }

// interface ApprovedAIImpactPanelProps {
//   forecast?: ProjectMetricAI;
//   approvedRecs: ApprovedRecommendation[];
//   metricData?: MetricData;
//   refetchApprovedRecs?: () => void;
//   triggerForecast?: (projectKey: string) => void;
//   refetchAIData?: () => void;
// }

// interface ImpactChartProps {
//   forecast?: ProjectMetricAI;
//   metricData?: MetricData;
// }

// const ImpactChart = ({ forecast, metricData }: ImpactChartProps) => {
//   return (
//     <div className='w-full'>
//       <h3 className='text-base font-semibold mb-2'>Performance Metrics</h3>
//       <div className='grid grid-cols-2 gap-4'>
//         <div className='bg-gray-100 rounded-lg p-4'>
//           <h4 className='text-sm font-medium text-gray-700 mb-1'>Before</h4>
//           <ul className='text-sm text-gray-600 space-y-1'>
//             <li>⏱ SPI: {metricData?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}</li>
//             <li>💰 CPI: {metricData?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}</li>
//             <li>📊 EAC: {metricData?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}</li>
//             <li>🛠 ETC: {metricData?.data?.estimateToComplete?.toLocaleString() ?? '--'}</li>
//             <li>📉 VAC: {metricData?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}</li>
//             <li>
//               ⏳ Duration: {metricData?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'}{' '}
//               months
//             </li>
//           </ul>
//         </div>
//         <div className='bg-green-50 rounded-lg p-4'>
//           <h4 className='text-sm font-medium text-green-700 mb-1'>After</h4>
//           <ul className='text-sm text-green-800 space-y-1'>
//             <li>⏱ SPI: {forecast?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}</li>
//             <li>💰 CPI: {forecast?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}</li>
//             <li>📊 EAC: {forecast?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}</li>
//             <li>🛠 ETC: {forecast?.data?.estimateToComplete?.toLocaleString() ?? '--'}</li>
//             <li>📉 VAC: {forecast?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}</li>
//             <li>
//               ⏳ Duration: {forecast?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'}{' '}
//               months
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ApprovedAIImpactPanel = ({
//   forecast,
//   approvedRecs,
//   metricData,
//   refetchApprovedRecs,
//   triggerForecast,
//   refetchAIData,
// }: ApprovedAIImpactPanelProps) => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const [tab, setTab] = useState<'summary' | 'recommendations'>('summary');
//   const [deleteRecommendation] = useDeleteRecommendationByIdMutation();
//   const [impactKey, setImpactKey] = useState(0);

//   const handleDelete = async (id: number) => {
//     try {
//       await deleteRecommendation(id).unwrap();
//       // refetchApprovedRecs?.();
//       // triggerForecast?.(projectKey);
//       refetchAIData?.();
//       setImpactKey((prev) => prev + 1);
//     } catch (err) {
//       console.error('Failed to delete recommendation:', err);
//     }
//   };

//   return (
//     <div className='w-full mt-6'>
//       <div className='flex border-b mb-4'>
//         <button
//           onClick={() => setTab('summary')}
//           className={`px-4 py-2 text-sm font-medium ${
//             tab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
//           }`}
//         >
//           📊 Summary Impact
//         </button>
//         <button
//           onClick={() => setTab('recommendations')}
//           className={`ml-4 px-4 py-2 text-sm font-medium ${
//             tab === 'recommendations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
//           }`}
//         >
//           ✅ Approved Recommendations
//         </button>
//       </div>

//       {tab === 'summary' && (
//         <div className='bg-white shadow rounded-lg p-4'>
//           <h2 className='text-lg font-semibold mb-2'>
//             📈 Project Performance (Before vs After)
//           </h2>
//           <ImpactChart forecast={forecast} metricData={metricData} key={impactKey} />
//         </div>
//       )}

//       {tab === 'recommendations' && (
//         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//           {/* {approvedRecs.map((rec, idx) => (
//             <div key={idx} className='bg-white shadow rounded-lg p-4'>
//               <h3 className='font-semibold text-sm mb-1'>
//                 #{idx + 1} — {rec.type} Optimization
//               </h3>
//               <p className='text-gray-800 text-sm mb-2'>{rec.recommendation}</p>
//               <p className='text-xs text-gray-400'>
//                 Approved on: {new Date(rec.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           ))} */}
//           {approvedRecs.map((rec, idx) => (
//             <div key={idx} className='bg-white shadow rounded-lg p-4 relative'>
//               <button
//                 onClick={() => handleDelete(rec.id)}
//                 className='absolute top-2 right-2 text-red-500 hover:text-red-700'
//                 title='Delete recommendation'
//               >
//                 <Trash2 size={16} />
//               </button>
//               <h3 className='font-semibold text-sm mb-1'>
//                 #{idx + 1} — {rec.type} Optimization
//               </h3>
//               <p className='text-gray-800 text-sm mb-2'>{rec.recommendation}</p>
//               <p className='text-xs text-gray-400'>
//                 Approved on: {new Date(rec.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApprovedAIImpactPanel;

import { useState } from 'react';
import {
  Trash2,
  BarChart2,
  CheckCircle2,
  Clock,
  DollarSign,
  PieChart,
  Calendar,
} from 'lucide-react';
import { useDeleteRecommendationByIdMutation } from '../../../services/projectRecommendationApi';
import { useSearchParams } from 'react-router-dom';

export interface AIForecast {
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  estimatedDurationAtCompletion: number;
  isImproved: boolean;
  improvementSummary: string;
  confidenceScore: number;
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
    isImproved: boolean;
    improvementSummary: string;
    confidenceScore: number;
    calculatedBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ApprovedRecommendation {
  id: number;
  projectId: number;
  type: string;
  recommendation: string;
  details: string,
  suggestedChanges: string,
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
    isImproved: boolean;
    improvementSummary: string;
    confidenceScore: number;
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
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>Performance Metrics Comparison</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-gray-50 rounded-xl p-6 shadow-sm'>
          <h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
            <Clock className='h-5 w-5 text-gray-500' /> Before AI Recommendations
          </h4>
          <ul className='text-sm text-gray-600 space-y-2'>
            <li className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-blue-500' />
              SPI: {metricData?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-blue-500' />
              CPI: {metricData?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-blue-500' />
              EAC: {metricData?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-blue-500' />
              ETC: {metricData?.data?.estimateToComplete?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-blue-500' />
              VAC: {metricData?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-blue-500' />
              Duration: {metricData?.data?.estimateDurationAtCompletion?.toLocaleString() ??
                '--'}{' '}
              months
            </li>
          </ul>
        </div>
        <div className='bg-green-50 rounded-xl p-6 shadow-sm'>
          <h4 className='text-sm font-medium text-green-800 mb-3 flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' /> After AI Recommendations
          </h4>
          <ul className='text-sm text-green-800 space-y-2'>
            <li className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-green-500' />
              SPI: {forecast?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-green-500' />
              CPI: {forecast?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-green-500' />
              EAC: {forecast?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-green-500' />
              ETC: {forecast?.data?.estimateToComplete?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <PieChart className='h-4 w-4 text-green-500' />
              VAC: {forecast?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}
            </li>
            <li className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-green-500' />
              Duration: {forecast?.data?.estimateDurationAtCompletion?.toLocaleString() ??
                '--'}{' '}
              months
            </li>
          </ul>
          {forecast?.data?.isImproved !== undefined && (
            <div className='mt-4'>
              <p className='text-sm font-medium text-gray-700'>
                <span className='flex items-center gap-2'>
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      forecast.data.isImproved ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  Status: {forecast.data.isImproved ? 'Improved' : 'No Improvement'}
                </span>
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {forecast.data.improvementSummary || 'No summary provided.'}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                Confidence: {forecast.data.confidenceScore?.toFixed(0) ?? '--'}%
              </p>
            </div>
          )}
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
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
      <div className='flex border-b border-gray-200 mb-6'>
        <button
          onClick={() => setTab('summary')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
            tab === 'summary'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 className='h-5 w-5' /> Summary Impact
        </button>
        <button
          onClick={() => setTab('recommendations')}
          className={`ml-4 px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
            tab === 'recommendations'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 className='h-5 w-5' /> Approved Recommendations
        </button>
      </div>

      {tab === 'summary' && (
        <div className='bg-white shadow-lg rounded-xl p-6'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <BarChart2 className='h-6 w-6 text-blue-600' /> Project Performance (Before vs After)
          </h2>
          {forecast?.data && metricData?.data ? (
            <ImpactChart forecast={forecast} metricData={metricData} key={impactKey} />
          ) : (
            <p className='text-sm text-gray-500 italic'>No forecast data available.</p>
          )}
        </div>
      )}

      {tab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedRecs.length > 0 ? (
            approvedRecs.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded-xl p-5 relative hover:shadow-lg transition-shadow duration-200"
              >
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200 group"
                  title="Delete recommendation"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 right-0">
                    Delete recommendation
                  </span>
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {rec.type} Optimization
                  </span>
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{rec.recommendation}</h3>
                {/* {rec.details && (
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{rec.details}</p>
                )} */}
                {rec.suggestedChanges && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Suggested Changes:</p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{rec.suggestedChanges}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Approved on: {new Date(rec.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic col-span-full">
              No approved recommendations available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovedAIImpactPanel;
