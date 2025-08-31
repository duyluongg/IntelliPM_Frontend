// import React, { useEffect, useState, useMemo } from 'react';
// import { useSearchParams, useLocation } from 'react-router-dom';
// import {
//   useCalculateMetricsBySystemMutation,
//   useGetProjectMetricByProjectKeyQuery,
//   useGetHealthDashboardQuery,
//   useGetProgressDashboardQuery,
//   useGetTaskStatusDashboardQuery,
//   useGetTimeDashboardQuery,
//   useGetCostDashboardQuery,
//   useGetWorkloadDashboardQuery,
//   useGetProjectMetricAIByProjectKeyQuery,
//   useGetMetricHistoryByProjectKeyQuery,
// } from '../../../services/projectMetricApi';
// import {
//   useGetRecommendationsByProjectKeyQuery,
//   useLazyGetAIForecastByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import { AlertTriangle } from 'lucide-react';
// import HealthOverview from './HealthOverview';
// import ProgressPerSprint from './ProgressPerSprint';
// import TimeComparisonChart from './TimeComparisonChart';
// import CostBarChart from './CostBarChart';
// import WorkloadChart from './WorkloadChart';
// import TaskStatusChart from './TaskStatusChart';
// import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
// import ImpactChart from './ImpactChart';
// import DashboardCard from './DashboardCard';
// import SuggestedRecommendationsModal from './SuggestedRecommendationsModal';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import aiIcon from '../../../assets/icon/ai.png';
// import { Tooltip as ReactTooltip } from 'react-tooltip';

// interface AIForecast {
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

// interface MetricHistoryItem {
//   id: number;
//   projectId: number;
//   metricKey: string;
//   value: string;
//   recordedAt: string;
// }

// interface HealthData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     projectStatus: string;
//     timeStatus: string;
//     tasksToBeCompleted: number;
//     overdueTasks: number;
//     progressPercent: number;
//     costStatus: number;
//     cost: ProjectMetric;
//     showAlert: boolean;
//   };
// }

// interface ProjectMetric {
//   projectId: number;
//   plannedValue: number;
//   earnedValue: number;
//   actualCost: number;
//   budgetAtCompletion: number;
//   durationAtCompletion: number;
//   costVariance: number;
//   scheduleVariance: number;
//   costPerformanceIndex: number;
//   schedulePerformanceIndex: number;
//   estimateAtCompletion: number;
//   estimateToComplete: number;
//   varianceAtCompletion: number;
//   estimateDurationAtCompletion: number;
//   calculatedBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const ProjectDashboard: React.FC = () => {
//   const [calculate] = useCalculateMetricsBySystemMutation();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const { data: metricData, refetch } = useGetProjectMetricByProjectKeyQuery(projectKey);
//   const {
//     data: healthData,
//     isLoading: isHealthLoading,
//     refetch: refetchHealth,
//   } = useGetHealthDashboardQuery(projectKey);
//   const {
//     data: progressData,
//     isLoading: isProgressLoading,
//     refetch: refetchProgress,
//   } = useGetProgressDashboardQuery(projectKey);
//   const {
//     data: taskStatusData,
//     isLoading: isTaskStatusLoading,
//     refetch: refetchTaskStatus,
//   } = useGetTaskStatusDashboardQuery(projectKey);
//   const {
//     data: timeData,
//     isLoading: isTimeLoading,
//     refetch: refetchTime,
//   } = useGetTimeDashboardQuery(projectKey);
//   const {
//     data: costData,
//     isLoading: isCostLoading,
//     refetch: refetchCost,
//   } = useGetCostDashboardQuery(projectKey);
//   const {
//     data: workloadData,
//     isLoading: isWorkloadLoading,
//     refetch: refetchWorkload,
//   } = useGetWorkloadDashboardQuery(projectKey);
//   const {
//     data: recRes,
//     isLoading: isRecsLoading,
//     refetch: refetchRec,
//   } = useGetRecommendationsByProjectKeyQuery(projectKey);
//   const [triggerForecast, { isLoading: isForecastLoading }] =
//     useLazyGetAIForecastByProjectKeyQuery();
//   const {
//     data: metricAIData,
//     isLoading: isAIMetricLoading,
//     refetch: refetchAIData,
//   } = useGetProjectMetricAIByProjectKeyQuery(projectKey);
//   const {
//     data: historyData,
//     isLoading: isHistoryLoading,
//     refetch: refetchHistory,
//   } = useGetMetricHistoryByProjectKeyQuery(projectKey);

//   useGetHealthDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetTaskStatusDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetProgressDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetTimeDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetWorkloadDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetCostDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetProjectMetricAIByProjectKeyQuery(projectKey, { pollingInterval: 5000 });

//   const location = useLocation();
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [modalKey, setModalKey] = useState(Date.now());
//   const [isCalculateDone, setIsCalculateDone] = useState(false);

//   useEffect(() => {
//     const doCalculateThenRefetch = async () => {
//       try {
//         await calculate({ projectKey }).unwrap();
//         await refetch();
//         setIsCalculateDone(true);
//       } catch (err) {
//         console.error('❌ Error calculating/refetching metrics:', err);
//         setIsCalculateDone(true);
//       }
//     };
//     setIsCalculateDone(false);
//     doCalculateThenRefetch();
//   }, [location.key, calculate, refetch]);

//   useEffect(() => {
//     if (!isCalculateDone) return;
//     const doRefetches = async () => {
//       try {
//         await Promise.all([
//           refetchHealth(),
//           refetchProgress(),
//           refetchTaskStatus(),
//           refetchTime(),
//           refetchCost(),
//           refetchWorkload(),
//           refetchRec(),
//           refetchHistory(),
//         ]);
//       } catch (err) {
//         console.error('❌ Error refetching dashboard data:', err);
//       }
//     };
//     doRefetches();
//   }, [
//     isCalculateDone,
//     refetchHealth,
//     refetchProgress,
//     refetchTaskStatus,
//     refetchTime,
//     refetchCost,
//     refetchWorkload,
//     refetchRec,
//     refetchHistory,
//   ]);

//   useEffect(() => {
//     if (showRecommendations) {
//       setModalKey(Date.now());
//     }
//   }, [showRecommendations]);

//   const handleAfterDeleteRecommendation = async () => {
//     try {
//       await refetchRec();
//       await triggerForecast(projectKey).unwrap();
//       await refetchAIData();
//       await refetchHistory();
//     } catch (error) {
//       console.error('❌ Error in handleAfterDeleteRecommendation:', error);
//     }
//   };

//   const handleSubmitSuccess = async () => {
//     await refetchRec();
//     await triggerForecast(projectKey).unwrap();
//     await refetchAIData();
//     await refetchHistory();
//   };

//   const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
//   const cpi = metricData?.data?.costPerformanceIndex ?? 0;
//   const projectId = metricData?.data?.projectId;

//   const processedHistory = useMemo(
//     () =>
//       historyData?.data?.map((item: MetricHistoryItem) => {
//         const metrics = JSON.parse(item.value);
//         return {
//           date: new Date(item.recordedAt).toLocaleDateString(),
//           SPI: metrics.SPI.toFixed(2),
//           CPI: metrics.CPI.toFixed(2),
//           EV: metrics.EV,
//           AC: metrics.AC,
//         };
//       }) ?? [],
//     [historyData]
//   );

//   const approvedRecs = useMemo(
//     () =>
//       recRes?.data?.map((rec) => ({
//         id: rec.id,
//         projectId: rec.projectId,
//         type: rec.type,
//         recommendation: rec.recommendation,
//         details: rec.details,
//         suggestedChanges: rec.suggestedChanges,
//         createdAt: rec.createdAt,
//       })) ?? [],
//     [recRes]
//   );

//   const ForecastCard: React.FC<{
//     pv: number;
//     ev: number;
//     ac: number;
//     spi: number;
//     cpi: number;
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ pv, ev, ac, spi, cpi, eac, etc, vac, edac }) => (
//     <DashboardCard title='Project Forecast'>
//       <div className='flex flex-col gap-3 text-sm text-gray-700'>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Planned Value (PV): </strong>
//           <span>{Math.round(pv).toLocaleString()}</span>{' '}VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Earned Value (EV): </strong>
//           <span>{Math.round(ev).toLocaleString()}</span>{' '}VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Actual Cost (AC): </strong>
//           <span>{Math.round(ac).toLocaleString()}</span>{' '}VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI): </strong>
//           <span>{spi.toFixed(2)}</span>
//           {/* <p className='text-xs text-gray-500'>
//             Measures schedule efficiency. Above 1 means ahead of schedule.
//           </p> */}
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI): </strong>
//           <span>{cpi.toFixed(2)}</span>
//           {/* <p className='text-xs text-gray-500'>
//             Measures cost efficiency. Above 1 means under budget.
//           </p> */}
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
//           {eac.toLocaleString()} VND
//           {/* <p className='ml-1 text-xs text-gray-500'>
//             Expected total cost of the project based on current data.
//           </p> */}
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
//           {etc.toLocaleString()} VND
//           {/* <p className='ml-1 text-xs text-gray-500'>Projected cost to finish remaining work.</p> */}
//         </div>
//         <div>
//           <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
//           {vac.toLocaleString()} VND
//           {/* <p className='ml-1 text-xs text-gray-500'>
//             Difference between budget and estimated cost. Negative means over budget.
//           </p> */}
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
//           {/* <p className='ml-1 text-xs text-gray-500'>
//             Estimated total time to complete based on progress.
//           </p> */}
//         </div>
//       </div>
//     </DashboardCard>
//   );

//   const AlertCard: React.FC<{
//     spi: number;
//     cpi: number;
//     onShowAIRecommendations: () => void;
//     showRecommendations: boolean;
//   }> = ({ spi, cpi, onShowAIRecommendations, showRecommendations }) => {
//     if (!healthData?.data?.showAlert) return null;

//     return (
//       <DashboardCard title='Project Alerts'>
//         <div className='flex flex-col gap-3 text-sm text-red-700'>
//           <div className='flex items-start gap-2'>
//             <AlertTriangle className='text-red-500' size={20} />
//             <div className='flex flex-col'>
//               <strong className='text-red-700'>Warning:</strong>
//               {spi < 1 && <span> - Schedule Performance Index (SPI) is below threshold.</span>}
//               {cpi < 1 && <span> - Cost Performance Index (CPI) is below threshold.</span>}
//               <span> - Review AI-suggested actions below.</span>
//             </div>
//           </div>
//           {!showRecommendations && (
//             // <button
//             //   onClick={onShowAIRecommendations}
//             //   className='self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
//             // >
//             //   <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
//             //     <path
//             //       strokeLinecap='round'
//             //       strokeLinejoin='round'
//             //       strokeWidth='2'
//             //       d='M12 4v16m8-8H4'
//             //     />
//             //   </svg>
//             //   View AI Suggestions
//             // </button>
//             <div
//               className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer'
//               onClick={onShowAIRecommendations}
//               data-tooltip-id='generate-ai-tooltip'
//               data-tooltip-content='View AI Suggestions'
//             >
//               <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
//               <span>View AI Suggestions</span>
//               <ReactTooltip id='generate-ai-tooltip' />
//             </div>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

//   const formatCurrency = (value: number): string => {
//   if (value >= 1_000_000_000) {
//     return `${(value / 1_000_000_000).toFixed(2)}B VND`;
//   } else if (value >= 100_000_000) {
//     return `${(value / 1_000_000).toFixed(2)}M VND`;
//   } else if (value >= 1_000_000) {
//     return `${value.toLocaleString('vi-VN')} VND`;
//   } else if (value >= 1_000) {
//     return `${(value / 1_000).toFixed(2)}K VND`;
//   } else {
//     return `${value.toLocaleString('vi-VN')} VND`;
//   }
// };

// // Utility function to format ratios (SPI, CPI)
// const formatRatio = (value: number): string => {
//   return value.toFixed(2);
// };

//   return (
//     <div className='container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
//       <div className='col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6'>
//         <div className='col-span-1'>
//           <DashboardCard title='Impact of AI Recommendations'>
//             {(recRes?.data?.length ?? 0) > 0 && metricData && metricAIData ? (
//               <ImpactChart
//                 spiBefore={metricData.data?.schedulePerformanceIndex ?? 0}
//                 spiAfter={metricAIData.data?.schedulePerformanceIndex ?? 0}
//                 cpiBefore={metricData.data?.costPerformanceIndex ?? 0}
//                 cpiAfter={metricAIData.data?.costPerformanceIndex ?? 0}
//               />
//             ) : (
//               <p className='text-sm text-gray-500 italic'>No AI recommendations applied yet.</p>
//             )}
//           </DashboardCard>
//         </div>
//         <div className='col-span-2'>
//           <ApprovedAIImpactPanel
//             approvedRecs={approvedRecs}
//             forecast={metricAIData}
//             metricData={metricData}
//             refetchApprovedRecs={refetchRec}
//             triggerForecast={triggerForecast}
//             refetchAIData={handleAfterDeleteRecommendation}
//           />
//         </div>
//       </div>

//       <AlertCard
//         spi={spi}
//         cpi={cpi}
//         showRecommendations={showRecommendations}
//         onShowAIRecommendations={() => setShowRecommendations(true)}
//       />

//       <ForecastCard
//         pv={metricData?.data?.plannedValue ?? 0}
//         ev={metricData?.data?.earnedValue ?? 0}
//         ac={metricData?.data?.actualCost ?? 0}
//         spi={metricData?.data?.schedulePerformanceIndex ?? 0}
//         cpi={metricData?.data?.costPerformanceIndex ?? 0}
//         eac={metricData?.data?.estimateAtCompletion ?? 0}
//         etc={metricData?.data?.estimateToComplete ?? 0}
//         vac={metricData?.data?.varianceAtCompletion ?? 0}
//         edac={metricData?.data?.estimateDurationAtCompletion ?? 0}
//       />

//       <DashboardCard title='Health Overview'>
//         <HealthOverview data={healthData} isLoading={isHealthLoading} />
//       </DashboardCard>

//       <DashboardCard title='Task Status'>
//         <TaskStatusChart data={taskStatusData} isLoading={isTaskStatusLoading} />
//       </DashboardCard>

//       <DashboardCard title='Progress Per Sprint'>
//         <ProgressPerSprint data={progressData} isLoading={isProgressLoading} />
//       </DashboardCard>

//       <DashboardCard title='Time Tracking'>
//         <TimeComparisonChart data={timeData} isLoading={isTimeLoading} />
//       </DashboardCard>

//       <DashboardCard title='Cost'>
//         <CostBarChart data={costData} isLoading={isCostLoading} />
//       </DashboardCard>

//       <DashboardCard title='Workload'>
//         <WorkloadChart data={workloadData} isLoading={isWorkloadLoading} />
//       </DashboardCard>

//       <DashboardCard title='Metric Trends'>
//         {isHistoryLoading ? (
//           <div className='flex justify-center items-center h-32'>
//             <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
//           </div>
//         ) : processedHistory.length > 0 ? (
//           // <ResponsiveContainer width='100%' height={300}>
//           //   <LineChart data={processedHistory}>
//           //     <CartesianGrid strokeDasharray='3 3' />
//           //     <XAxis dataKey='date' />
//           //     <YAxis />
//           //     <Tooltip />
//           //     <Legend />
//           //     <Line type='monotone' dataKey='SPI' stroke='#8884d8' activeDot={{ r: 8 }} />
//           //     <Line type='monotone' dataKey='CPI' stroke='#82ca9d' />
//           //     <Line type='monotone' dataKey='EV' stroke='#ffc658' />
//           //     <Line type='monotone' dataKey='AC' stroke='#ff7300' />
//           //   </LineChart>
//           // </ResponsiveContainer>
//           <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={processedHistory}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" />
//             <YAxis
//               tickFormatter={(value, index) => {
//                 return formatCurrency(value);
//               }}
//               width={100} 
//               tick={{ fontSize: 12 }} 
//             />
//             <Tooltip
//               formatter={(value: number, name: string) => {
//                 if (name === 'SPI' || name === 'CPI') {
//                   return [formatRatio(value), name];
//                 }
//                 return [formatCurrency(value), name];
//               }}
//             />
//             <Legend />
//             <Line type="monotone" dataKey="SPI" stroke="#8884d8" activeDot={{ r: 8 }} />
//             <Line type="monotone" dataKey="CPI" stroke="#82ca9d" />
//             <Line type="monotone" dataKey="EV" stroke="#ffc658" />
//             <Line type="monotone" dataKey="AC" stroke="#ff7300" />
//           </LineChart>
//         </ResponsiveContainer>
//         ) : (
//           <p className='text-sm text-gray-500 italic'>No historical metric data available yet.</p>
//         )}
//       </DashboardCard>

//       {showRecommendations && (
//         <SuggestedRecommendationsModal
//           key={modalKey}
//           onClose={() => setShowRecommendations(false)}
//           projectKey={projectKey}
//           projectId={projectId}
//           onSubmitSuccess={handleSubmitSuccess}
//           modalKey={modalKey}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectDashboard;


// import React, { useEffect, useState, useMemo } from 'react';
// import { useSearchParams, useLocation } from 'react-router-dom';
// import {
//   useCalculateMetricsBySystemMutation,
//   useGetProjectMetricByProjectKeyQuery,
//   useGetHealthDashboardQuery,
//   useGetProgressDashboardQuery,
//   useGetTaskStatusDashboardQuery,
//   useGetTimeDashboardQuery,
//   useGetCostDashboardQuery,
//   useGetWorkloadDashboardQuery,
//   useGetProjectMetricAIByProjectKeyQuery,
//   useGetMetricHistoryByProjectKeyQuery,
// } from '../../../services/projectMetricApi';
// import {
//   useGetRecommendationsByProjectKeyQuery,
//   useLazyGetAIForecastByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import {
//   useGetByConfigKeyQuery,
//   useUpdateMutation,
// } from '../../../services/systemConfigurationApi';
// import { AlertTriangle } from 'lucide-react';
// import HealthOverview from './HealthOverview';
// import ProgressPerSprint from './ProgressPerSprint';
// import TimeComparisonChart from './TimeComparisonChart';
// import CostBarChart from './CostBarChart';
// import WorkloadChart from './WorkloadChart';
// import TaskStatusChart from './TaskStatusChart';
// import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
// import ImpactChart from './ImpactChart';
// import DashboardCard from './DashboardCard';
// import SuggestedRecommendationsModal from './SuggestedRecommendationsModal';
// import AlertSettings from './AlertSettings';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import aiIcon from '../../../assets/icon/ai.png';
// import { Tooltip as ReactTooltip } from 'react-tooltip';

// interface AIForecast {
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

// interface MetricHistoryItem {
//   id: number;
//   projectId: number;
//   metricKey: string;
//   value: string;
//   recordedAt: string;
// }

// interface HealthData {
//   isSuccess: boolean;
//   code: number;
//   message: string;
//   data: {
//     projectStatus: string;
//     timeStatus: string;
//     tasksToBeCompleted: number;
//     overdueTasks: number;
//     progressPercent: number;
//     costStatus: number;
//     cost: ProjectMetric;
//     showAlert: boolean;
//   };
// }

// interface ProjectMetric {
//   projectId: number;
//   plannedValue: number;
//   earnedValue: number;
//   actualCost: number;
//   budgetAtCompletion: number;
//   durationAtCompletion: number;
//   costVariance: number;
//   scheduleVariance: number;
//   costPerformanceIndex: number;
//   schedulePerformanceIndex: number;
//   estimateAtCompletion: number;
//   estimateToComplete: number;
//   varianceAtCompletion: number;
//   estimateDurationAtCompletion: number;
//   calculatedBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface SystemConfiguration {
//   id: number;
//   configKey: string;
//   valueConfig: string;
//   minValue: string | null;
//   maxValue: string | null;
//   estimateValue: string | null;
//   description: string;
//   note: string | null;
//   effectedFrom: string;
//   effectedTo: string | null;
// }

// const ProjectDashboard: React.FC = () => {
//   const [calculate] = useCalculateMetricsBySystemMutation();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const { data: metricData, refetch } = useGetProjectMetricByProjectKeyQuery(projectKey);
//   const {
//     data: healthData,
//     isLoading: isHealthLoading,
//     refetch: refetchHealth,
//   } = useGetHealthDashboardQuery(projectKey);
//   const {
//     data: progressData,
//     isLoading: isProgressLoading,
//     refetch: refetchProgress,
//   } = useGetProgressDashboardQuery(projectKey);
//   const {
//     data: taskStatusData,
//     isLoading: isTaskStatusLoading,
//     refetch: refetchTaskStatus,
//   } = useGetTaskStatusDashboardQuery(projectKey);
//   const {
//     data: timeData,
//     isLoading: isTimeLoading,
//     refetch: refetchTime,
//   } = useGetTimeDashboardQuery(projectKey);
//   const {
//     data: costData,
//     isLoading: isCostLoading,
//     refetch: refetchCost,
//   } = useGetCostDashboardQuery(projectKey);
//   const {
//     data: workloadData,
//     isLoading: isWorkloadLoading,
//     refetch: refetchWorkload,
//   } = useGetWorkloadDashboardQuery(projectKey);
//   const {
//     data: recRes,
//     isLoading: isRecsLoading,
//     refetch: refetchRec,
//   } = useGetRecommendationsByProjectKeyQuery(projectKey);
//   const [triggerForecast, { isLoading: isForecastLoading }] =
//     useLazyGetAIForecastByProjectKeyQuery();
//   const {
//     data: metricAIData,
//     isLoading: isAIMetricLoading,
//     refetch: refetchAIData,
//   } = useGetProjectMetricAIByProjectKeyQuery(projectKey);
//   const {
//     data: historyData,
//     isLoading: isHistoryLoading,
//     refetch: refetchHistory,
//   } = useGetMetricHistoryByProjectKeyQuery(projectKey);

//   // Fetch configuration for alert settings
//   const { data: minDaysConfig } = useGetByConfigKeyQuery('minimum_days_for_alert');
//   const { data: minProgressConfig } = useGetByConfigKeyQuery('minimum_progress_for_alert');
//   const [updateConfig] = useUpdateMutation();

//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [modalKey, setModalKey] = useState(Date.now());
//   const [isCalculateDone, setIsCalculateDone] = useState(false);
//   const [minDays, setMinDays] = useState<string>('');
//   const [minProgress, setMinProgress] = useState<string>('');

//   useGetHealthDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetTaskStatusDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetProgressDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetTimeDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetWorkloadDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetCostDashboardQuery(projectKey, { pollingInterval: 5000 });
//   useGetProjectMetricAIByProjectKeyQuery(projectKey, { pollingInterval: 5000 });

//   const location = useLocation();

//   useEffect(() => {
//     const doCalculateThenRefetch = async () => {
//       try {
//         await calculate({ projectKey }).unwrap();
//         await refetch();
//         setIsCalculateDone(true);
//       } catch (err) {
//         console.error('❌ Error calculating/refetching metrics:', err);
//         setIsCalculateDone(true);
//       }
//     };
//     setIsCalculateDone(false);
//     doCalculateThenRefetch();
//   }, [location.key, calculate, refetch]);

//   useEffect(() => {
//     if (!isCalculateDone) return;
//     const doRefetches = async () => {
//       try {
//         await Promise.all([
//           refetchHealth(),
//           refetchProgress(),
//           refetchTaskStatus(),
//           refetchTime(),
//           refetchCost(),
//           refetchWorkload(),
//           refetchRec(),
//           refetchHistory(),
//         ]);
//       } catch (err) {
//         console.error('❌ Error refetching dashboard data:', err);
//       }
//     };
//     doRefetches();
//   }, [
//     isCalculateDone,
//     refetchHealth,
//     refetchProgress,
//     refetchTaskStatus,
//     refetchTime,
//     refetchCost,
//     refetchWorkload,
//     refetchRec,
//     refetchHistory,
//   ]);

//   useEffect(() => {
//     if (showRecommendations) {
//       setModalKey(Date.now());
//     }
//   }, [showRecommendations]);

//   useEffect(() => {
//     if (minDaysConfig?.data?.valueConfig) {
//       setMinDays(minDaysConfig.data.valueConfig);
//     }
//     if (minProgressConfig?.data?.valueConfig) {
//       setMinProgress(minProgressConfig.data.valueConfig);
//     }
//   }, [minDaysConfig, minProgressConfig]);

//   const handleAfterDeleteRecommendation = async () => {
//     try {
//       await refetchRec();
//       await triggerForecast(projectKey).unwrap();
//       await refetchAIData();
//       await refetchHistory();
//     } catch (error) {
//       console.error('❌ Error in handleAfterDeleteRecommendation:', error);
//     }
//   };

//   const handleSubmitSuccess = async () => {
//     await refetchRec();
//     await triggerForecast(projectKey).unwrap();
//     await refetchAIData();
//     await refetchHistory();
//   };

//   const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
//   const cpi = metricData?.data?.costPerformanceIndex ?? 0;
//   const projectId = metricData?.data?.projectId;

//   const processedHistory = useMemo(
//     () =>
//       historyData?.data?.map((item: MetricHistoryItem) => {
//         const metrics = JSON.parse(item.value);
//         return {
//           date: new Date(item.recordedAt).toLocaleDateString(),
//           SPI: Number(metrics.SPI), // Keep as number
//           CPI: Number(metrics.CPI), // Keep as number
//           EV: Number(metrics.EV),
//           AC: Number(metrics.AC),
//         };
//       }) ?? [],
//     [historyData]
//   );

//   const approvedRecs = useMemo(
//     () =>
//       recRes?.data?.map((rec) => ({
//         id: rec.id,
//         projectId: rec.projectId,
//         type: rec.type,
//         recommendation: rec.recommendation,
//         details: rec.details,
//         suggestedChanges: rec.suggestedChanges,
//         createdAt: rec.createdAt,
//       })) ?? [],
//     [recRes]
//   );

//   const formatCurrency = (value: number): string => {
//     if (value >= 1_000_000_000) {
//       return `${(value / 1_000_000_000).toFixed(2)}B VND`;
//     } else if (value >= 100_000_000) {
//       return `${(value / 1_000_000).toFixed(2)}M VND`;
//     } else if (value >= 1_000_000) {
//       return `${value.toLocaleString('vi-VN')} VND`;
//     } else if (value >= 1_000) {
//       return `${(value / 1_000).toFixed(2)}K VND`;
//     } else {
//       return `${value.toLocaleString('vi-VN')} VND`;
//     }
//   };

//   const formatRatio = (value: number): string => {
//     return Number(value).toFixed(2); // Ensure value is a number
//   };

//   const ForecastCard: React.FC<{
//     pv: number;
//     ev: number;
//     ac: number;
//     spi: number;
//     cpi: number;
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ pv, ev, ac, spi, cpi, eac, etc, vac, edac }) => (
//     <DashboardCard title='Project Forecast'>
//       <div className='flex flex-col gap-3 text-sm text-gray-700'>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Planned Value (PV): </strong>
//           <span>{Math.round(pv).toLocaleString()}</span> VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Earned Value (EV): </strong>
//           <span>{Math.round(ev).toLocaleString()}</span> VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Actual Cost (AC): </strong>
//           <span>{Math.round(ac).toLocaleString()}</span> VND
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI): </strong>
//           <span>{spi.toFixed(2)}</span>
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI): </strong>
//           <span>{cpi.toFixed(2)}</span>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
//           {eac.toLocaleString()} VND
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
//           {etc.toLocaleString()} VND
//         </div>
//         <div>
//           <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
//           {vac.toLocaleString()} VND
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
//         </div>
//       </div>
//     </DashboardCard>
//   );

//   const AlertCard: React.FC<{
//     spi: number;
//     cpi: number;
//     onShowAIRecommendations: () => void;
//     showRecommendations: boolean;
//   }> = ({ spi, cpi, onShowAIRecommendations, showRecommendations }) => {
//     if (!healthData?.data?.showAlert) return null;

//     return (
//       <DashboardCard title='Project Alerts'>
//         <div className='flex flex-col gap-3 text-sm text-red-700'>
//           <div className='flex items-start gap-2'>
//             <AlertTriangle className='text-red-500' size={20} />
//             <div className='flex flex-col'>
//               <strong className='text-red-700'>Warning:</strong>
//               {spi < 1 && <span> - Schedule Performance Index (SPI) is below threshold.</span>}
//               {cpi < 1 && <span> - Cost Performance Index (CPI) is below threshold.</span>}
//               <span> - Review AI-suggested actions below.</span>
//             </div>
//           </div>
//           {!showRecommendations && (
//             <div
//               className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer'
//               onClick={onShowAIRecommendations}
//               data-tooltip-id='generate-ai-tooltip'
//               data-tooltip-content='View AI Suggestions'
//             >
//               <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
//               <span>View AI Suggestions</span>
//               <ReactTooltip id='generate-ai-tooltip' />
//             </div>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

//   return (
//     <div className='container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative'>
//       <AlertSettings
//         minDaysConfig={minDaysConfig}
//         minProgressConfig={minProgressConfig}
//         cpiWarningConfig={cpiWarningConfig}
//         spiWarningConfig={spiWarningConfig}
//         minDays={minDays}
//         setMinDays={setMinDays}
//         minProgress={minProgress}
//         setMinProgress={setMinProgress}
//         cpiWarning={cpiWarning}
//         setCpiWarning={setCpiWarning}
//         spiWarning={spiWarning}
//         setSpiWarning={setSpiWarning}
//         updateConfig={updateConfig}
//       />

//       <div className='col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6'>
//         <div className='col-span-1'>
//           <DashboardCard title='Impact of AI Recommendations'>
//             {(recRes?.data?.length ?? 0) > 0 && metricData && metricAIData ? (
//               <ImpactChart
//                 spiBefore={metricData.data?.schedulePerformanceIndex ?? 0}
//                 spiAfter={metricAIData.data?.schedulePerformanceIndex ?? 0}
//                 cpiBefore={metricData.data?.costPerformanceIndex ?? 0}
//                 cpiAfter={metricAIData.data?.costPerformanceIndex ?? 0}
//               />
//             ) : (
//               <p className='text-sm text-gray-500 italic'>No AI recommendations applied yet.</p>
//             )}
//           </DashboardCard>
//         </div>
//         <div className='col-span-2'>
//           <ApprovedAIImpactPanel
//             approvedRecs={approvedRecs}
//             forecast={metricAIData}
//             metricData={metricData}
//             refetchApprovedRecs={refetchRec}
//             triggerForecast={triggerForecast}
//             refetchAIData={handleAfterDeleteRecommendation}
//           />
//         </div>
//       </div>

//       <AlertCard
//         spi={spi}
//         cpi={cpi}
//         showRecommendations={showRecommendations}
//         onShowAIRecommendations={() => setShowRecommendations(true)}
//       />

//       <ForecastCard
//         pv={metricData?.data?.plannedValue ?? 0}
//         ev={metricData?.data?.earnedValue ?? 0}
//         ac={metricData?.data?.actualCost ?? 0}
//         spi={metricData?.data?.schedulePerformanceIndex ?? 0}
//         cpi={metricData?.data?.costPerformanceIndex ?? 0}
//         eac={metricData?.data?.estimateAtCompletion ?? 0}
//         etc={metricData?.data?.estimateToComplete ?? 0}
//         vac={metricData?.data?.varianceAtCompletion ?? 0}
//         edac={metricData?.data?.estimateDurationAtCompletion ?? 0}
//       />

//       <DashboardCard title='Health Overview'>
//         <HealthOverview data={healthData} isLoading={isHealthLoading} />
//       </DashboardCard>

//       <DashboardCard title='Task Status'>
//         <TaskStatusChart data={taskStatusData} isLoading={isTaskStatusLoading} />
//       </DashboardCard>

//       <DashboardCard title='Progress Per Sprint'>
//         <ProgressPerSprint data={progressData} isLoading={isProgressLoading} />
//       </DashboardCard>

//       <DashboardCard title='Time Tracking'>
//         <TimeComparisonChart data={timeData} isLoading={isTimeLoading} />
//       </DashboardCard>

//       <DashboardCard title='Cost'>
//         <CostBarChart data={costData} isLoading={isCostLoading} />
//       </DashboardCard>

//       <DashboardCard title='Workload'>
//         <WorkloadChart data={workloadData} isLoading={isWorkloadLoading} />
//       </DashboardCard>

//       <DashboardCard title='Metric Trends'>
//         {isHistoryLoading ? (
//           <div className='flex justify-center items-center h-32'>
//             <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
//           </div>
//         ) : processedHistory.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={processedHistory}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis
//                 tickFormatter={(value) => formatCurrency(value)}
//                 width={100}
//                 tick={{ fontSize: 12 }}
//               />
//               <Tooltip
//                 formatter={(value: number, name: string) => {
//                   if (name === 'SPI' || name === 'CPI') {
//                     return [formatRatio(value), name];
//                   }
//                   return [formatCurrency(value), name];
//                 }}
//               />
//               <Legend />
//               <Line type="monotone" dataKey="SPI" stroke="#8884d8" activeDot={{ r: 8 }} />
//               <Line type="monotone" dataKey="CPI" stroke="#82ca9d" />
//               <Line type="monotone" dataKey="EV" stroke="#ffc658" />
//               <Line type="monotone" dataKey="AC" stroke="#ff7300" />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className='text-sm text-gray-500 italic'>No historical metric data available yet.</p>
//         )}
//       </DashboardCard>

//       {showRecommendations && (
//         <SuggestedRecommendationsModal
//           key={modalKey}
//           onClose={() => setShowRecommendations(false)}
//           projectKey={projectKey}
//           projectId={projectId}
//           onSubmitSuccess={handleSubmitSuccess}
//           modalKey={modalKey}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectDashboard;


import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
  useGetMetricHistoryByProjectKeyQuery,
} from '../../../services/projectMetricApi';
import {
  useGetRecommendationsByProjectKeyQuery,
  useLazyGetAIForecastByProjectKeyQuery,
} from '../../../services/projectRecommendationApi';
import {
  useGetByConfigKeyQuery,
  useUpdateMutation,
} from '../../../services/systemConfigurationApi';
import { AlertTriangle } from 'lucide-react';
import HealthOverview from './HealthOverview';
import ProgressPerSprint from './ProgressPerSprint';
import TimeComparisonChart from './TimeComparisonChart';
import CostBarChart from './CostBarChart';
import WorkloadChart from './WorkloadChart';
import TaskStatusChart from './TaskStatusChart';
import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
import ImpactChart from './ImpactChart';
import DashboardCard from './DashboardCard';
import SuggestedRecommendationsModal from './SuggestedRecommendationsModal';
import AlertSettings from './AlertSettings';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import aiIcon from '../../../assets/icon/ai.png';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface AIForecast {
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

interface MetricHistoryItem {
  id: number;
  projectId: number;
  metricKey: string;
  value: string;
  recordedAt: string;
}

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
    costStatus: number;
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

interface SystemConfiguration {
  id: number;
  configKey: string;
  valueConfig: string;
  minValue: string | null;
  maxValue: string | null;
  estimateValue: string | null;
  description: string;
  note: string | null;
  effectedFrom: string;
  effectedTo: string | null;
}

const ProjectDashboard: React.FC = () => {
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
  const [triggerForecast, { isLoading: isForecastLoading }] =
    useLazyGetAIForecastByProjectKeyQuery();
  const {
    data: metricAIData,
    isLoading: isAIMetricLoading,
    refetch: refetchAIData,
  } = useGetProjectMetricAIByProjectKeyQuery(projectKey);
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetMetricHistoryByProjectKeyQuery(projectKey);

  // Fetch configuration for alert settings
  const { data: minDaysConfig } = useGetByConfigKeyQuery('minimum_days_for_alert');
  const { data: minProgressConfig } = useGetByConfigKeyQuery('minimum_progress_for_alert');
  const { data: cpiWarningConfig } = useGetByConfigKeyQuery('cpi_warning_threshold');
  const { data: spiWarningConfig } = useGetByConfigKeyQuery('spi_warning_threshold');
  const [updateConfig] = useUpdateMutation();

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [modalKey, setModalKey] = useState(Date.now());
  const [isCalculateDone, setIsCalculateDone] = useState(false);
  const [minDays, setMinDays] = useState<string>('');
  const [minProgress, setMinProgress] = useState<string>('');
  const [cpiWarning, setCpiWarning] = useState<string>('');
  const [spiWarning, setSpiWarning] = useState<string>('');

  useGetHealthDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetTaskStatusDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetProgressDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetTimeDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetWorkloadDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetCostDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetProjectMetricAIByProjectKeyQuery(projectKey, { pollingInterval: 5000 });

  const location = useLocation();

  useEffect(() => {
    const doCalculateThenRefetch = async () => {
      try {
        await calculate({ projectKey }).unwrap();
        await refetch();
        setIsCalculateDone(true);
      } catch (err) {
        console.error('❌ Error calculating/refetching metrics:', err);
        setIsCalculateDone(true);
      }
    };
    setIsCalculateDone(false);
    doCalculateThenRefetch();
  }, [location.key, calculate, refetch]);

  useEffect(() => {
    if (!isCalculateDone) return;
    const doRefetches = async () => {
      try {
        await Promise.all([
          refetchHealth(),
          refetchProgress(),
          refetchTaskStatus(),
          refetchTime(),
          refetchCost(),
          refetchWorkload(),
          refetchRec(),
          refetchHistory(),
        ]);
      } catch (err) {
        console.error('❌ Error refetching dashboard data:', err);
      }
    };
    doRefetches();
  }, [
    isCalculateDone,
    refetchHealth,
    refetchProgress,
    refetchTaskStatus,
    refetchTime,
    refetchCost,
    refetchWorkload,
    refetchRec,
    refetchHistory,
  ]);

  useEffect(() => {
    if (showRecommendations) {
      setModalKey(Date.now());
    }
  }, [showRecommendations]);

  useEffect(() => {
    if (minDaysConfig?.data?.valueConfig) {
      setMinDays(minDaysConfig.data.valueConfig);
    }
    if (minProgressConfig?.data?.valueConfig) {
      setMinProgress(minProgressConfig.data.valueConfig);
    }
    if (cpiWarningConfig?.data?.valueConfig) {
      setCpiWarning(cpiWarningConfig.data.valueConfig);
    }
    if (spiWarningConfig?.data?.valueConfig) {
      setSpiWarning(spiWarningConfig.data.valueConfig);
    }
  }, [minDaysConfig, minProgressConfig, cpiWarningConfig, spiWarningConfig]);

  const handleAfterDeleteRecommendation = async () => {
    try {
      await refetchRec();
      await triggerForecast(projectKey).unwrap();
      await refetchAIData();
      await refetchHistory();
    } catch (error) {
      console.error('❌ Error in handleAfterDeleteRecommendation:', error);
    }
  };

  const handleSubmitSuccess = async () => {
    await refetchRec();
    await triggerForecast(projectKey).unwrap();
    await refetchAIData();
    await refetchHistory();
  };

  const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
  const cpi = metricData?.data?.costPerformanceIndex ?? 0;
  const projectId = metricData?.data?.projectId;

  const processedHistory = useMemo(
    () =>
      historyData?.data?.map((item: MetricHistoryItem) => {
        const metrics = JSON.parse(item.value);
        return {
          date: new Date(item.recordedAt).toLocaleDateString(),
          SPI: Number(metrics.SPI),
          CPI: Number(metrics.CPI),
          EV: Number(metrics.EV),
          AC: Number(metrics.AC),
        };
      }) ?? [],
    [historyData]
  );

  const approvedRecs = useMemo(
    () =>
      recRes?.data?.map((rec) => ({
        id: rec.id,
        projectId: rec.projectId,
        type: rec.type,
        recommendation: rec.recommendation,
        details: rec.details,
        suggestedChanges: rec.suggestedChanges,
        createdAt: rec.createdAt,
      })) ?? [],
    [recRes]
  );

  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B VND`;
    } else if (value >= 100_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M VND`;
    } else if (value >= 1_000_000) {
      return `${value.toLocaleString('vi-VN')} VND`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K VND`;
    } else {
      return `${value.toLocaleString('vi-VN')} VND`;
    }
  };

  const formatRatio = (value: number): string => {
    return Number(value).toFixed(2);
  };

  const ForecastCard: React.FC<{
    pv: number;
    ev: number;
    ac: number;
    spi: number;
    cpi: number;
    eac: number;
    etc: number;
    vac: number;
    edac: number;
  }> = ({ pv, ev, ac, spi, cpi, eac, etc, vac, edac }) => (
    <DashboardCard title='Project Forecast'>
      <div className='flex flex-col gap-3 text-sm text-gray-700'>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Planned Value (PV): </strong>
          <span>{Math.round(pv).toLocaleString()}</span> VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Earned Value (EV): </strong>
          <span>{Math.round(ev).toLocaleString()}</span> VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Actual Cost (AC): </strong>
          <span>{Math.round(ac).toLocaleString()}</span> VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI): </strong>
          <span>{spi.toFixed(2)}</span>
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI): </strong>
          <span>{cpi.toFixed(2)}</span>
        </div>
        <div>
          <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
          {eac.toLocaleString()} VND
        </div>
        <div>
          <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
          {etc.toLocaleString()} VND
        </div>
        <div>
          <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
          {vac.toLocaleString()} VND
        </div>
        <div>
          <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
        </div>
      </div>
    </DashboardCard>
  );

  const AlertCard: React.FC<{
    spi: number;
    cpi: number;
    onShowAIRecommendations: () => void;
    showRecommendations: boolean;
  }> = ({ spi, cpi, onShowAIRecommendations, showRecommendations }) => {
    if (!healthData?.data?.showAlert) return null;

    return (
      <DashboardCard title='Project Alerts'>
        <div className='flex flex-col gap-3 text-sm text-red-700'>
          <div className='flex items-start gap-2'>
            <AlertTriangle className='text-red-500' size={20} />
            <div className='flex flex-col'>
              <strong className='text-red-700'>Warning:</strong>
              {spi < (parseFloat(spiWarningConfig?.data?.valueConfig || '1')) && <span> - Schedule Performance Index (SPI) is below threshold.</span>}
              {cpi < (parseFloat(cpiWarningConfig?.data?.valueConfig || '1')) && <span> - Cost Performance Index (CPI) is below threshold.</span>}
              <span> - Review AI-suggested actions below.</span>
            </div>
          </div>
          {!showRecommendations && (
            <div
              className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer'
              onClick={onShowAIRecommendations}
              data-tooltip-id='generate-ai-tooltip'
              data-tooltip-content='View AI Suggestions'
            >
              <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
              <span>View AI Suggestions</span>
              <ReactTooltip id='generate-ai-tooltip' />
            </div>
          )}
        </div>
      </DashboardCard>
    );
  };

  return (
    <div className='container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative'>
      <AlertSettings
        minDaysConfig={minDaysConfig}
        minProgressConfig={minProgressConfig}
        cpiWarningConfig={cpiWarningConfig}
        spiWarningConfig={spiWarningConfig}
        minDays={minDays}
        setMinDays={setMinDays}
        minProgress={minProgress}
        setMinProgress={setMinProgress}
        cpiWarning={cpiWarning}
        setCpiWarning={setCpiWarning}
        spiWarning={spiWarning}
        setSpiWarning={setSpiWarning}
        updateConfig={updateConfig}
      />

      <div className='col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='col-span-1'>
          <DashboardCard title='Impact of AI Recommendations'>
            {(recRes?.data?.length ?? 0) > 0 && metricData && metricAIData ? (
              <ImpactChart
                spiBefore={metricData.data?.schedulePerformanceIndex ?? 0}
                spiAfter={metricAIData.data?.schedulePerformanceIndex ?? 0}
                cpiBefore={metricData.data?.costPerformanceIndex ?? 0}
                cpiAfter={metricAIData.data?.costPerformanceIndex ?? 0}
              />
            ) : (
              <p className='text-sm text-gray-500 italic'>No AI recommendations applied yet.</p>
            )}
          </DashboardCard>
        </div>
        <div className='col-span-2'>
          <ApprovedAIImpactPanel
            approvedRecs={approvedRecs}
            forecast={metricAIData}
            metricData={metricData}
            refetchApprovedRecs={refetchRec}
            triggerForecast={triggerForecast}
            refetchAIData={handleAfterDeleteRecommendation}
          />
        </div>
      </div>

      <AlertCard
        spi={spi}
        cpi={cpi}
        showRecommendations={showRecommendations}
        onShowAIRecommendations={() => setShowRecommendations(true)}
      />

      <ForecastCard
        pv={metricData?.data?.plannedValue ?? 0}
        ev={metricData?.data?.earnedValue ?? 0}
        ac={metricData?.data?.actualCost ?? 0}
        spi={metricData?.data?.schedulePerformanceIndex ?? 0}
        cpi={metricData?.data?.costPerformanceIndex ?? 0}
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

      <DashboardCard title='Progress Per Sprint'>
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

      <DashboardCard title='Metric Trends'>
        {isHistoryLoading ? (
          <div className='flex justify-center items-center h-32'>
            <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : processedHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'SPI' || name === 'CPI') {
                    return [formatRatio(value), name];
                  }
                  return [formatCurrency(value), name];
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="SPI" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="CPI" stroke="#82ca9d" />
              <Line type="monotone" dataKey="EV" stroke="#ffc658" />
              <Line type="monotone" dataKey="AC" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-sm text-gray-500 italic'>No historical metric data available yet.</p>
        )}
      </DashboardCard>

      {showRecommendations && (
        <SuggestedRecommendationsModal
          key={modalKey}
          onClose={() => setShowRecommendations(false)}
          projectKey={projectKey}
          projectId={projectId}
          onSubmitSuccess={handleSubmitSuccess}
          modalKey={modalKey}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;