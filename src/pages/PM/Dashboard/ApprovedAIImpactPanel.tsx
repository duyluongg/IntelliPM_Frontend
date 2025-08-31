// import { useState } from 'react';
// import {
//   Trash2,
//   BarChart2,
//   CheckCircle2,
//   Clock,
//   DollarSign,
//   PieChart,
//   Calendar,
//   X,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import { useDeleteRecommendationByIdMutation } from '../../../services/projectRecommendationApi';
// import { useSearchParams } from 'react-router-dom';

// export interface AIForecast {
//   schedulePerformanceIndex: number;
//   costPerformanceIndex: number;
//   estimateAtCompletion: number;
//   estimateToComplete: number;
//   varianceAtCompletion: number;
//   estimatedDurationAtCompletion: number;
//   isImproved: boolean;
//   improvementSummary: string;
//   confidenceScore: number;
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
//     isImproved: boolean;
//     improvementSummary: string;
//     confidenceScore: number;
//     calculatedBy: string;
//     createdAt: string;
//     updatedAt: string;
//   };
// }

// export interface ApprovedRecommendation {
//   id: number;
//   projectId: number;
//   type: string;
//   recommendation: string;
//   details: string;
//   suggestedChanges: string;
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
//     isImproved: boolean;
//     improvementSummary: string;
//     confidenceScore: number;
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
//       <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
//         <BarChart2 className='h-6 w-6 text-blue-600' /> Performance Metrics Comparison
//       </h2>
//       <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//         <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
//           <h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center gap-2'>
//             <Clock className='h-5 w-5 text-gray-500' /> Before AI Recommendations
//           </h4>
//           <ul className='text-sm text-gray-600 space-y-2'>
//             <li className='flex items-center gap-2'>
//               <Clock className='h-4 w-4 text-blue-500' />
//               SPI: {metricData?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <DollarSign className='h-4 w-4 text-blue-500' />
//               CPI: {metricData?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-blue-500' />
//               EAC: {metricData?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-blue-500' />
//               ETC: {metricData?.data?.estimateToComplete?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-blue-500' />
//               VAC: {metricData?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <Calendar className='h-4 w-4 text-blue-500' />
//               Duration: {metricData?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'} months
//             </li>
//           </ul>
//         </div>
//         <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200'>
//           <h4 className='text-sm font-medium text-green-800 mb-3 flex items-center gap-2'>
//             <CheckCircle2 className='h-5 w-5 text-green-600' /> After AI Recommendations
//           </h4>
//           <ul className='text-sm text-green-800 space-y-2'>
//             <li className='flex items-center gap-2'>
//               <Clock className='h-4 w-4 text-green-500' />
//               SPI: {forecast?.data?.schedulePerformanceIndex?.toFixed(2) ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <DollarSign className='h-4 w-4 text-green-500' />
//               CPI: {forecast?.data?.costPerformanceIndex?.toFixed(2) ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-green-500' />
//               EAC: {forecast?.data?.estimateAtCompletion?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-green-500' />
//               ETC: {forecast?.data?.estimateToComplete?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <PieChart className='h-4 w-4 text-green-500' />
//               VAC: {forecast?.data?.varianceAtCompletion?.toLocaleString() ?? '--'}
//             </li>
//             <li className='flex items-center gap-2'>
//               <Calendar className='h-4 w-4 text-green-500' />
//               Duration: {forecast?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'} months
//             </li>
//           </ul>
//           {forecast?.data?.isImproved !== undefined && (
//             <div className='mt-4'>
//               <p className='text-sm font-medium text-gray-700'>
//                 <span className='flex items-center gap-2'>
//                   <CheckCircle2
//                     className={`h-5 w-5 ${forecast.data.isImproved ? 'text-green-500' : 'text-red-500'}`}
//                   />
//                   Status: {forecast.data.isImproved ? 'Improved' : 'No Improvement'}
//                 </span>
//               </p>
//               <p className='text-sm text-gray-600 mt-1'>
//                 {forecast.data.improvementSummary || 'No summary provided.'}
//               </p>
//               <p className='text-sm text-gray-600 mt-1'>
//                 Confidence: {forecast.data.confidenceScore?.toFixed(0) ?? '--'}%
//               </p>
//             </div>
//           )}
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
//   const [selectedRec, setSelectedRec] = useState<ApprovedRecommendation | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 4;

//   const handleDelete = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
//     try {
//       await deleteRecommendation(id).unwrap();
//       refetchApprovedRecs?.();
//       triggerForecast?.(projectKey);
//       refetchAIData?.();
//       setImpactKey((prev) => prev + 1);
//       // Adjust current page if necessary
//       const totalPages = Math.ceil(approvedRecs.length / itemsPerPage);
//       if (currentPage > totalPages) {
//         setCurrentPage(totalPages || 1);
//       }
//     } catch (err) {
//       console.error('Failed to delete recommendation:', err);
//     }
//   };

//   const handleOpenDetails = (rec: ApprovedRecommendation) => {
//     setSelectedRec(rec);
//   };

//   const handleCloseDetails = () => {
//     setSelectedRec(null);
//   };

//   // Calculate paginated recommendations
//   const totalPages = Math.ceil(approvedRecs.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedRecs = approvedRecs.slice(startIndex, startIndex + itemsPerPage);

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   return (
//     <div className='w-full mt-6'>
//       <div className='flex border-b border-gray-200 mb-6'>
//         <button
//           onClick={() => setTab('summary')}
//           className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
//             tab === 'summary'
//               ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
//               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
//           } rounded-t-md`}
//         >
//           <BarChart2 className='h-5 w-5' /> Summary Impact
//         </button>
//         <button
//           onClick={() => setTab('recommendations')}
//           className={`ml-4 px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
//             tab === 'recommendations'
//               ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
//               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
//           } rounded-t-md`}
//         >
//           <CheckCircle2 className='h-5 w-5' /> Approved Recommendations
//         </button>
//       </div>

//       {tab === 'summary' && (
//         <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-100'>
//           {/* <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
//             <BarChart2 className='h-6 w-6 text-blue-600' /> Project Performance (Before vs After)
//           </h2> */}
//           {forecast?.data && metricData?.data ? (
//             <ImpactChart forecast={forecast} metricData={metricData} key={impactKey} />
//           ) : (
//             <p className='text-sm text-gray-500 italic'>No forecast data available.</p>
//           )}
//         </div>
//       )}

//       {tab === 'recommendations' && (
//         <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-100'>
//           <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
//             <CheckCircle2 className='h-6 w-6 text-blue-600' /> Approved Recommendations
//           </h2>
//           {paginatedRecs.length > 0 ? (
//             <div className='flex flex-col gap-3'>
//               {paginatedRecs.map((rec, idx) => (
//                 <div
//                   key={idx}
//                   className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-200'
//                   onClick={() => handleOpenDetails(rec)}
//                 >
//                   <div className='flex-1'>
//                     <div className='flex items-center gap-2 mb-2'>
//                       <span className='text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full'>
//                         {rec.type} Optimization
//                       </span>
//                       <span className='text-xs text-gray-500'>#{startIndex + idx + 1}</span>
//                     </div>
//                     <h3 className='text-sm font-semibold text-gray-800'>{rec.recommendation}</h3>
//                     <p className='text-xs text-gray-400 mt-1'>
//                       Approved on: {new Date(rec.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(rec.id);
//                     }}
//                     className='text-red-500 hover:text-red-700 transition-colors duration-200 group relative'
//                     title='Delete recommendation'
//                   >
//                     <Trash2 className='h-5 w-5' />
//                     <span className='absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 right-0'>
//                       Delete recommendation
//                     </span>
//                   </button>
//                 </div>
//               ))}
//               {totalPages > 1 && (
//                 <div className='flex justify-center items-center gap-2 mt-4'>
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       currentPage === 1
//                         ? 'text-gray-400 cursor-not-allowed'
//                         : 'text-blue-600 hover:bg-blue-50'
//                     } flex items-center gap-1`}
//                   >
//                     <ChevronLeft className='h-4 w-4' /> Previous
//                   </button>
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageChange(page)}
//                       className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
//                         currentPage === page
//                           ? 'bg-blue-600 text-white'
//                           : 'text-blue-600 hover:bg-blue-50'
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       currentPage === totalPages
//                         ? 'text-gray-400 cursor-not-allowed'
//                         : 'text-blue-600 hover:bg-blue-50'
//                     } flex items-center gap-1`}
//                   >
//                     Next <ChevronRight className='h-4 w-4' />
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className='text-sm text-gray-500 italic'>No approved recommendations available.</p>
//           )}
//         </div>
//       )}

//       {selectedRec && (
//         <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300'>
//           <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300'>
//             <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-5 flex items-center justify-between'>
//               <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
//                 <CheckCircle2 className='h-6 w-6' /> Recommendation Details
//               </h2>
//               <button
//                 onClick={handleCloseDetails}
//                 className='text-white hover:text-gray-200 transition-colors duration-200'
//               >
//                 <X className='h-6 w-6' />
//               </button>
//             </div>
//             <div className='p-6'>
//               <div className='mb-4'>
//                 <h3 className='text-sm font-semibold text-gray-700'>Recommendation</h3>
//                 <p className='text-sm text-gray-600 mt-1'>{selectedRec.recommendation}</p>
//               </div>
//               {selectedRec.details && (
//                 <div className='mb-4'>
//                   <h3 className='text-sm font-semibold text-gray-700'>Details</h3>
//                   <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap'>{selectedRec.details}</p>
//                 </div>
//               )}
//               {selectedRec.suggestedChanges && (
//                 <div className='mb-4'>
//                   <h3 className='text-sm font-semibold text-gray-700'>Suggested Changes</h3>
//                   <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap'>{selectedRec.suggestedChanges}</p>
//                 </div>
//               )}
//               <div className='mb-4'>
//                 <h3 className='text-sm font-semibold text-gray-700'>Type</h3>
//                 <p className='text-sm text-gray-600 mt-1'>{selectedRec.type}</p>
//               </div>
//               <div className='mb-4'>
//                 <h3 className='text-sm font-semibold text-gray-700'>Approved On</h3>
//                 <p className='text-sm text-gray-600 mt-1'>{new Date(selectedRec.createdAt).toLocaleDateString()}</p>
//               </div>
//             </div>
//             <div className='p-6 bg-gray-50 border-t border-gray-200 flex justify-end'>
//               <button
//                 onClick={handleCloseDetails}
//                 className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200'
//               >
//                 Close
//               </button>
//             </div>
//           </div>
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
  X,
  ChevronLeft,
  ChevronRight,
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
  details: string;
  suggestedChanges: string;
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
      <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
        <BarChart2 className='h-5 w-5 text-blue-600' /> Performance Metrics Comparison
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
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
              Duration: {metricData?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'} months
            </li>
          </ul>
        </div>
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200'>
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
              Duration: {forecast?.data?.estimateDurationAtCompletion?.toLocaleString() ?? '--'} months
            </li>
          </ul>
          {forecast?.data?.isImproved !== undefined && (
            <div className='mt-4'>
              <p className='text-sm font-medium text-gray-700'>
                <span className='flex items-center gap-2'>
                  <CheckCircle2
                    className={`h-5 w-5 ${forecast.data.isImproved ? 'text-green-500' : 'text-red-500'}`}
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
  const [selectedRec, setSelectedRec] = useState<ApprovedRecommendation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
    try {
      await deleteRecommendation(id).unwrap();
      refetchApprovedRecs?.();
      triggerForecast?.(projectKey);
      refetchAIData?.();
      setImpactKey((prev) => prev + 1);
      // Adjust current page if necessary
      const totalPages = Math.ceil((approvedRecs.length - 1) / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
    }
  };

  const handleOpenDetails = (rec: ApprovedRecommendation) => {
    setSelectedRec(rec);
  };

  const handleCloseDetails = () => {
    setSelectedRec(null);
  };

  // Calculate paginated recommendations
  const totalPages = Math.ceil(approvedRecs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecs = approvedRecs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='w-full mt-6'>
      <div className='flex border-b border-gray-200 mb-6'>
        <button
          onClick={() => setTab('summary')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
            tab === 'summary'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          } rounded-t-md`}
        >
          <BarChart2 className='h-5 w-5' /> Summary Impact
        </button>
        <button
          onClick={() => setTab('recommendations')}
          className={`ml-4 px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
            tab === 'recommendations'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          } rounded-t-md`}
        >
          <CheckCircle2 className='h-5 w-5' /> Approved Recommendations
        </button>
      </div>

      {tab === 'summary' && (
        <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <BarChart2 className='h-6 w-6 text-blue-600' /> Project Performance (Before vs After)
          </h2>
          {approvedRecs.length > 0 && forecast?.data && metricData?.data ? (
            <ImpactChart forecast={forecast} metricData={metricData} key={impactKey} />
          ) : (
            <p className='text-sm text-gray-500 italic'>No AI recommendations applied yet.</p>
          )}
        </div>
      )}

      {tab === 'recommendations' && (
        <div className='bg-white shadow-lg rounded-xl p-6 border border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <CheckCircle2 className='h-6 w-6 text-blue-600' /> Approved Recommendations
          </h2>
          {paginatedRecs.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {paginatedRecs.map((rec, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-gray-200'
                  onClick={() => handleOpenDetails(rec)}
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full'>
                        {rec.type} Optimization
                      </span>
                      <span className='text-xs text-gray-500'>#{startIndex + idx + 1}</span>
                    </div>
                    <h3 className='text-sm font-semibold text-gray-800'>{rec.recommendation}</h3>
                    <p className='text-xs text-gray-400 mt-1'>
                      Approved on: {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rec.id);
                    }}
                    className='text-red-500 hover:text-red-700 transition-colors duration-200 group relative'
                    title='Delete recommendation'
                  >
                    <Trash2 className='h-5 w-5' />
                    <span className='absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -top-8 right-0'>
                      Delete recommendation
                    </span>
                  </button>
                </div>
              ))}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-4'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                    } flex items-center gap-1`}
                  >
                    <ChevronLeft className='h-4 w-4' /> Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                    } flex items-center gap-1`}
                  >
                    Next <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className='text-sm text-gray-500 italic'>No approved recommendations available.</p>
          )}
        </div>
      )}

      {selectedRec && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300'>
            <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-5 flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-white flex items-center gap-2'>
                <CheckCircle2 className='h-6 w-6' /> Recommendation Details
              </h2>
              <button
                onClick={handleCloseDetails}
                className='text-white hover:text-gray-200 transition-colors duration-200'
              >
                <X className='h-6 w-6' />
              </button>
            </div>
            <div className='p-6'>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-gray-700'>Recommendation</h3>
                <p className='text-sm text-gray-600 mt-1'>{selectedRec.recommendation}</p>
              </div>
              {selectedRec.details && (
                <div className='mb-4'>
                  <h3 className='text-sm font-semibold text-gray-700'>Details</h3>
                  <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap'>{selectedRec.details}</p>
                </div>
              )}
              {selectedRec.suggestedChanges && (
                <div className='mb-4'>
                  <h3 className='text-sm font-semibold text-gray-700'>Suggested Changes</h3>
                  <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap'>{selectedRec.suggestedChanges}</p>
                </div>
              )}
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-gray-700'>Type</h3>
                <p className='text-sm text-gray-600 mt-1'>{selectedRec.type}</p>
              </div>
              <div className='mb-4'>
                <h3 className='text-sm font-semibold text-gray-700'>Approved On</h3>
                <p className='text-sm text-gray-600 mt-1'>{new Date(selectedRec.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className='p-6 bg-gray-50 border-t border-gray-200 flex justify-end'>
              <button
                onClick={handleCloseDetails}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200'
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

export default ApprovedAIImpactPanel;