// import React, { useEffect, useState } from 'react';
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
// } from '../../../services/projectMetricApi';
// import {
//   useLazyGetAIRecommendationsByProjectKeyQuery,
//   useCreateProjectRecommendationMutation,
//   useGetRecommendationsByProjectKeyQuery,
//   useLazyGetAIForecastByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import { useCreateAiResponseHistoryMutation } from '../../../services/aiResponseHistoryApi'; // Import new hook
// import { AlertTriangle, CheckCircle, Edit, Trash2, Save, X } from 'lucide-react';
// import HealthOverview from './HealthOverview';
// import ProgressPerSprint from './ProgressPerSprint';
// import TimeComparisonChart from './TimeComparisonChart';
// import CostBarChart from './CostBarChart';
// import WorkloadChart from './WorkloadChart';
// import TaskStatusChart from './TaskStatusChart';
// import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
// import ImpactChart from './ImpactChart';
// import DashboardCard from './DashboardCard';
// import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';

// interface AIRecommendation {
//   id?: number;
//   recommendation: string;
//   details: string;
//   type: string;
//   affectedTasks: string[];
//   expectedImpact: string;
//   suggestedChanges: string;
//   priority: number;
// }

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

// interface AIForecastResponse {
//   isSuccess: boolean;
//   code: number;
//   data: AIForecast;
//   message: string;
// }

// const ProjectDashboard: React.FC = () => {
//   const [calculate] = useCalculateMetricsBySystemMutation();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const { data: metricData, refetch } = useGetProjectMetricByProjectKeyQuery(projectKey);
//   const { data: healthData, isLoading: isHealthLoading, refetch: refetchHealth } = useGetHealthDashboardQuery(projectKey);
//   const { data: progressData, isLoading: isProgressLoading, refetch: refetchProgress } = useGetProgressDashboardQuery(projectKey);
//   const { data: taskStatusData, isLoading: isTaskStatusLoading, refetch: refetchTaskStatus } = useGetTaskStatusDashboardQuery(projectKey);
//   const { data: timeData, isLoading: isTimeLoading, refetch: refetchTime } = useGetTimeDashboardQuery(projectKey);
//   const { data: costData, isLoading: isCostLoading, refetch: refetchCost } = useGetCostDashboardQuery(projectKey);
//   const { data: workloadData, isLoading: isWorkloadLoading, refetch: refetchWorkload } = useGetWorkloadDashboardQuery(projectKey);
//   const { data: recRes, isLoading: isRecsLoading, refetch: refetchRec } = useGetRecommendationsByProjectKeyQuery(projectKey);
//   const [triggerForecast, { data: forecastRes, isLoading: isForecastLoading }] = useLazyGetAIForecastByProjectKeyQuery();
//   const { data: metricAIData, isLoading: isAIMetricLoading, refetch: refetchAIData } = useGetProjectMetricAIByProjectKeyQuery(projectKey);
//   const location = useLocation();

//   const [triggerGetRecommendations, { data: recData, isLoading: isRecLoading }] = useLazyGetAIRecommendationsByProjectKeyQuery();
//   const [createRecommendation, { isLoading: isCreateLoading }] = useCreateProjectRecommendationMutation();
//   const [createAiResponseHistory] = useCreateAiResponseHistoryMutation(); // Use new hook

//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [approvedIds, setApprovedIds] = useState<number[]>([]);
//   const [recommendations, setRecommendations] = useState<AIRecommendation[]>(recData?.data ?? []);
//   const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false); // Popup state
//   const [aiResponseJson, setAiResponseJson] = useState<string>(''); // JSON for popup

//   useEffect(() => {
//     const doCalculateThenRefetch = async () => {
//       try {
//         await calculate({ projectKey }).unwrap();
//         await refetch();
//       } catch (err) {
//         console.error('❌ Error calculating/refetching metrics:', err);
//       }
//     };
//     doCalculateThenRefetch();
//   }, [location.key, calculate, refetch]);

//   useEffect(() => {
//     refetchHealth();
//     refetchProgress();
//     refetchTaskStatus();
//     refetchTime();
//     refetchCost();
//     refetchWorkload();
//     refetchRec();
//     if (showRecommendations) {
//       triggerGetRecommendations(projectKey);
//     }
//   }, [location.key, refetchHealth, refetchProgress, refetchTaskStatus, refetchTime, refetchCost, refetchWorkload, refetchRec, projectKey, triggerGetRecommendations, showRecommendations]);

//   useEffect(() => {
//     setRecommendations(recData?.data ?? []);
//   }, [recData]);

//   const approvedRecs = recRes?.data?.map((rec) => ({
//     id: rec.id,
//     projectId: rec.projectId,
//     type: rec.type,
//     recommendation: rec.recommendation,
//     details: rec.details,
//     suggestedChanges: rec.suggestedChanges,
//     createdAt: rec.createdAt,
//   })) ?? [];

//   const handleAfterDeleteRecommendation = async () => {
//     try {
//       await refetchRec();
//       await triggerForecast(projectKey).unwrap();
//       await refetchAIData();
//     } catch (error) {
//       console.error('❌ Error in handleAfterDeleteRecommendation:', error);
//     }
//   };

//   const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
//   const cpi = metricData?.data?.costPerformanceIndex ?? 0;

//   const projectId = metricData?.data?.projectId;

//   const ForecastCard: React.FC<{
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ eac, etc, vac, edac }) => (
//     <DashboardCard title="Project Forecast">
//       <div className="flex flex-col gap-3 text-sm text-gray-700">
//         <div>
//           <strong className="text-blue-700">Estimate at Completion (EAC):</strong> {eac.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Expected total cost of the project based on current data.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Estimate to Complete (ETC):</strong> {etc.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Projected cost to finish remaining work.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Variance at Completion (VAC):</strong> {vac.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Difference between budget and estimated cost. Negative means over budget.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Estimated Duration (EDAC):</strong> {edac} months
//           <p className="ml-1 text-xs text-gray-500">Estimated total time to complete based on progress.</p>
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
//     const isSPIBad = spi < 1;
//     const isCPIBad = cpi < 1;
//     if (!isSPIBad && !isCPIBad) return null;

//     return (
//       <DashboardCard title="Project Alerts">
//         <div className="flex flex-col gap-3 text-sm text-red-700">
//           <div className="flex items-start gap-2">
//             <AlertTriangle className="text-red-500" size={20} />
//             <div className="flex flex-col">
//               <strong className="text-red-700">Warning:</strong>
//               {isSPIBad && <span>• Schedule Performance Index (SPI) is below 1.</span>}
//               {isCPIBad && <span>• Cost Performance Index (CPI) is below 1.</span>}
//               <span>• Review AI-suggested actions below.</span>
//             </div>
//           </div>
//           {!showRecommendations && (
//             <button
//               onClick={onShowAIRecommendations}
//               disabled={isRecLoading}
//               className="self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//               </svg>
//               View AI Suggestions
//               {isRecLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
//             </button>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

//   const validTypes = ['Schedule', 'Cost', 'Scope', 'Resource', 'Performance', 'Design', 'Testing'];

//   const RecommendationCard: React.FC<{
//     rec: AIRecommendation;
//     index: number;
//     projectId: number | undefined;
//     approvedIds: number[];
//     setApprovedIds: React.Dispatch<React.SetStateAction<number[]>>;
//   }> = ({ rec, index, projectId, approvedIds, setApprovedIds }) => {
//     const isApproved = approvedIds.includes(index);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedRec, setEditedRec] = useState<AIRecommendation>({ ...rec });
//     const [errors, setErrors] = useState<{ recommendation?: string; type?: string; api?: string }>({});

//     const validateFields = () => {
//       const newErrors: { recommendation?: string; type?: string } = {};
//       if (!editedRec.recommendation.trim()) {
//         newErrors.recommendation = 'Recommendation is required';
//       }
//       if (!editedRec.type || !validTypes.includes(editedRec.type)) {
//         newErrors.type = 'Valid type is required';
//       }
//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };

//     const handleApprove = async () => {
//       if (!projectId || isApproved) return;
//       if (!validateFields()) return;
//       try {
//         const payload = {
//           projectId,
//           type: editedRec.type,
//           recommendation: editedRec.recommendation,
//           suggestedChanges: editedRec.suggestedChanges || '',
//           details: editedRec.details || '',
//         };
//         console.log('Sending payload:', payload);
//         await createRecommendation(payload).unwrap();
//         setApprovedIds((prev) => [...prev, index]);
//         setRecommendations((prev) =>
//           prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//         );
//         await refetchRec();
//         await triggerForecast(projectKey);
//         await refetchAIData();
//         setErrors({});
//       } catch (err: any) {
//         console.error('Error saving recommendation:', err);
//         console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//       }
//     };

//     const handleEdit = () => {
//       setIsEditing(true);
//       setEditedRec({ ...rec });
//       setErrors({});
//     };

//     const handleSaveEdit = () => {
//       if (!validateFields()) return;
//       setRecommendations((prev) =>
//         prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//       );
//       setIsEditing(false);
//       setErrors({});
//     };

//     const handleDelete = () => {
//       if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
//       setRecommendations((prev) => prev.filter((_, i) => i !== index));
//       setApprovedIds((prev) => prev.filter((id) => id !== index));
//     };

//     return (
//       <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
//         {isEditing ? (
//           <div className="flex flex-col gap-3">
//             <div>
//               <label className="text-sm font-medium text-gray-700">Recommendation</label>
//               <input
//                 type="text"
//                 value={editedRec.recommendation}
//                 onChange={(e) => setEditedRec({ ...editedRec, recommendation: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter recommendation"
//               />
//               {errors.recommendation && <p className="text-xs text-red-500">{errors.recommendation}</p>}
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Type</label>
//               <select
//                 value={editedRec.type}
//                 onChange={(e) => setEditedRec({ ...editedRec, type: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Select type</option>
//                 {validTypes.map((type) => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//               {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Details</label>
//               <textarea
//                 value={editedRec.details}
//                 onChange={(e) => setEditedRec({ ...editedRec, details: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter details"
//                 rows={4}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Suggested Changes</label>
//               <input
//                 type="text"
//                 value={editedRec.suggestedChanges}
//                 onChange={(e) => setEditedRec({ ...editedRec, suggestedChanges: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter suggested changes"
//               />
//             </div>
//             {errors.api && <p className="text-xs text-red-500">{errors.api}</p>}
//             <div className="flex gap-2">
//               <button
//                 onClick={handleSaveEdit}
//                 className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                 disabled={isCreateLoading}
//               >
//                 <Save size={16} /> Save
//               </button>
//               <button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setErrors({});
//                 }}
//                 className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="text-sm text-gray-600 font-semibold">
//               Recommendation #{index + 1} - {rec.type} (Priority: {rec.priority})
//             </div>
//             <div className="font-medium text-gray-900">{rec.recommendation}</div>
//             <div className="text-sm text-gray-600 whitespace-pre-wrap">{rec.details}</div>
//             <div className="text-xs text-gray-500">
//               <strong>Expected Impact:</strong> {rec.expectedImpact}
//             </div>
//             {rec.suggestedChanges && (
//               <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
//                 <strong>Suggested Changes:</strong>
//                 <div className="text-sm text-gray-700 whitespace-pre-wrap">{rec.suggestedChanges}</div>
//               </div>
//             )}
//             {errors.api && <p className="text-xs text-red-500 mt-2">{errors.api}</p>}
//             <div className="flex gap-2 mt-3 items-center">
//               <button
//                 onClick={handleApprove}
//                 className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved || isCreateLoading}
//               >
//                 <CheckCircle size={16} />
//                 {isCreateLoading ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   'Approve'
//                 )}
//               </button>
//               <button
//                 onClick={handleEdit}
//                 className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved}
//               >
//                 <Edit size={16} /> Edit
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved}
//               >
//                 <Trash2 size={16} /> Delete
//               </button>
//               {isApproved && <span className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle size={16} /> Approved</span>}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   const handleSaveAll = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }

//       const responseJson = JSON.stringify(recData.data);
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);

//       await refetchRec();
//       await refetchAIData();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error saving all recommendations:', err);
//       console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//     }
//   };

//   const handleExit = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }
//       const responseJson = JSON.stringify(recData.data);
//       // const aiResponsePayload = {
//       //   aiFeature: 'RECOMMENDATION_SUGGESTION',
//       //   projectId: projectId,
//       //   responseJson,
//       //   status: 'ACTIVE',
//       // };

//       // // Save to AiResponseHistory
//       // await createAiResponseHistory(aiResponsePayload).unwrap();

//       // Update state for popup
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);

//       await refetchRec();
//       await refetchAIData();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error saving all recommendations:', err);
//       console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//     }
//   };

//   const handleCloseEvaluationPopup = () => {
//     setIsEvaluationPopupOpen(false);
//     setAiResponseJson('');
//   };

//   const handleEvaluationSubmitSuccess = async () => {
//     await refetchRec();
//     // await triggerForecast(projectKey);
//     await refetchAIData();
//   };

//   return (
//     <div className="container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="col-span-1">
//           <DashboardCard title="Impact of AI Recommendations">
//             {(recRes?.data?.length ?? 0) > 0 && metricData && metricAIData ? (
//               <ImpactChart
//                 spiBefore={metricData.data?.schedulePerformanceIndex ?? 0}
//                 spiAfter={metricAIData.data?.schedulePerformanceIndex ?? 0}
//                 cpiBefore={metricData.data?.costPerformanceIndex ?? 0}
//                 cpiAfter={metricAIData.data?.costPerformanceIndex ?? 0}
//               />
//             ) : (
//               <p className="text-sm text-gray-500 italic">No AI recommendations applied yet.</p>
//             )}
//           </DashboardCard>
//         </div>
//         <div className="col-span-2">
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
//         onShowAIRecommendations={() => {
//           triggerGetRecommendations(projectKey, false);
//           setShowRecommendations(true);
//         }}
//       />

//       <ForecastCard
//         eac={metricData?.data?.estimateAtCompletion ?? 0}
//         etc={metricData?.data?.estimateToComplete ?? 0}
//         vac={metricData?.data?.varianceAtCompletion ?? 0}
//         edac={metricData?.data?.estimateDurationAtCompletion ?? 0}
//       />

//       <DashboardCard title="Health Overview">
//         <HealthOverview data={healthData} isLoading={isHealthLoading} />
//       </DashboardCard>

//       <DashboardCard title="Task Status">
//         <TaskStatusChart data={taskStatusData} isLoading={isTaskStatusLoading} />
//       </DashboardCard>

//       <DashboardCard title="Progress">
//         <ProgressPerSprint data={progressData} isLoading={isProgressLoading} />
//       </DashboardCard>

//       <DashboardCard title="Time Tracking">
//         <TimeComparisonChart data={timeData} isLoading={isTimeLoading} />
//       </DashboardCard>

//       <DashboardCard title="Cost">
//         <CostBarChart data={costData} isLoading={isCostLoading} />
//       </DashboardCard>

//       <DashboardCard title="Workload">
//         <WorkloadChart data={workloadData} isLoading={isWorkloadLoading} />
//       </DashboardCard>

//       {showRecommendations && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//                 </svg>
//                 AI Suggestions
//               </h2>
//               <button
//                 // onClick={() => setShowRecommendations(false)}
//                 onClick={handleExit}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {isRecLoading ? (
//               <div className="flex justify-center items-center h-32">
//                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             ) : recommendations.length > 0 ? (
//               <div className="flex flex-col gap-4">
//                 {recommendations.map((rec, idx) => (
//                   <RecommendationCard
//                     key={idx}
//                     rec={rec}
//                     index={idx}
//                     projectId={projectId}
//                     approvedIds={approvedIds}
//                     setApprovedIds={setApprovedIds}
//                   />
//                 ))}
//                 <div className="flex justify-end mt-4">
//                   <button
//                     onClick={handleSaveAll}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                   >
//                     <Save size={16} /> Done
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-sm text-gray-600">No AI suggestions available.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {isEvaluationPopupOpen && projectId && (
//         <AiResponseEvaluationPopup
//           isOpen={isEvaluationPopupOpen}
//           onClose={handleCloseEvaluationPopup}
//           aiResponseJson={aiResponseJson}
//           projectId={projectId}
//           aiFeature="RECOMMENDATION_SUGGESTION"
//           onSubmitSuccess={handleEvaluationSubmitSuccess}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectDashboard;

//---------------------------------------------------

// import React, { useEffect, useState } from 'react';
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
//   useLazyGetAIRecommendationsByProjectKeyQuery,
//   useCreateProjectRecommendationMutation,
//   useGetRecommendationsByProjectKeyQuery,
//   useLazyGetAIForecastByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import { useCreateAiResponseHistoryMutation } from '../../../services/aiResponseHistoryApi'; // Import new hook
// import { AlertTriangle, CheckCircle, Edit, Trash2, Save, X } from 'lucide-react';
// import HealthOverview from './HealthOverview';
// import ProgressPerSprint from './ProgressPerSprint';
// import TimeComparisonChart from './TimeComparisonChart';
// import CostBarChart from './CostBarChart';
// import WorkloadChart from './WorkloadChart';
// import TaskStatusChart from './TaskStatusChart';
// import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
// import ImpactChart from './ImpactChart';
// import DashboardCard from './DashboardCard';
// import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Assuming Recharts is installed for beautiful line charts

// interface AIRecommendation {
//   id?: number;
//   recommendation: string;
//   details: string;
//   type: string;
//   affectedTasks: string[];
//   expectedImpact: string;
//   suggestedChanges: string;
//   priority: number;
// }

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

// interface AIForecastResponse {
//   isSuccess: boolean;
//   code: number;
//   data: AIForecast;
//   message: string;
// }

// interface MetricHistoryItem {
//   id: number;
//   projectId: number;
//   metricKey: string;
//   value: string; // JSON string
//   recordedAt: string;
// }

// const ProjectDashboard: React.FC = () => {
//   const [calculate] = useCalculateMetricsBySystemMutation();
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const { data: metricData, refetch } = useGetProjectMetricByProjectKeyQuery(projectKey);
//   const { data: healthData, isLoading: isHealthLoading, refetch: refetchHealth } = useGetHealthDashboardQuery(projectKey);
//   const { data: progressData, isLoading: isProgressLoading, refetch: refetchProgress } = useGetProgressDashboardQuery(projectKey);
//   const { data: taskStatusData, isLoading: isTaskStatusLoading, refetch: refetchTaskStatus } = useGetTaskStatusDashboardQuery(projectKey);
//   const { data: timeData, isLoading: isTimeLoading, refetch: refetchTime } = useGetTimeDashboardQuery(projectKey);
//   const { data: costData, isLoading: isCostLoading, refetch: refetchCost } = useGetCostDashboardQuery(projectKey);
//   const { data: workloadData, isLoading: isWorkloadLoading, refetch: refetchWorkload } = useGetWorkloadDashboardQuery(projectKey);
//   const { data: recRes, isLoading: isRecsLoading, refetch: refetchRec } = useGetRecommendationsByProjectKeyQuery(projectKey);
//   const [triggerForecast, { data: forecastRes, isLoading: isForecastLoading }] = useLazyGetAIForecastByProjectKeyQuery();
//   const { data: metricAIData, isLoading: isAIMetricLoading, refetch: refetchAIData } = useGetProjectMetricAIByProjectKeyQuery(projectKey);
//   const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useGetMetricHistoryByProjectKeyQuery(projectKey);
//   const location = useLocation();

//   const [triggerGetRecommendations, { data: recData, isLoading: isRecLoading }] = useLazyGetAIRecommendationsByProjectKeyQuery();
//   const [createRecommendation, { isLoading: isCreateLoading }] = useCreateProjectRecommendationMutation();
//   const [createAiResponseHistory] = useCreateAiResponseHistoryMutation(); // Use new hook

//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [approvedIds, setApprovedIds] = useState<number[]>([]);
//   const [recommendations, setRecommendations] = useState<AIRecommendation[]>(recData?.data ?? []);
//   const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false); // Popup state
//   const [aiResponseJson, setAiResponseJson] = useState<string>(''); // JSON for popup

//   useEffect(() => {
//     const doCalculateThenRefetch = async () => {
//       try {
//         await calculate({ projectKey }).unwrap();
//         await refetch();
//       } catch (err) {
//         console.error('❌ Error calculating/refetching metrics:', err);
//       }
//     };
//     doCalculateThenRefetch();
//   }, [location.key, calculate, refetch]);

//   useEffect(() => {
//     refetchHealth();
//     refetchProgress();
//     refetchTaskStatus();
//     refetchTime();
//     refetchCost();
//     refetchWorkload();
//     refetchRec();
//     refetchHistory();
//     if (showRecommendations) {
//       triggerGetRecommendations(projectKey);
//     }
//   }, [location.key, refetchHealth, refetchProgress, refetchTaskStatus, refetchTime, refetchCost, refetchWorkload, refetchRec, refetchHistory, projectKey, triggerGetRecommendations, showRecommendations]);

//   useEffect(() => {
//     setRecommendations(recData?.data ?? []);
//   }, [recData]);

//   const approvedRecs = recRes?.data?.map((rec) => ({
//     id: rec.id,
//     projectId: rec.projectId,
//     type: rec.type,
//     recommendation: rec.recommendation,
//     details: rec.details,
//     suggestedChanges: rec.suggestedChanges,
//     createdAt: rec.createdAt,
//   })) ?? [];

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

//   const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
//   const cpi = metricData?.data?.costPerformanceIndex ?? 0;

//   const projectId = metricData?.data?.projectId;

//   // Process history data for chart
//   const processedHistory = historyData?.data?.map((item: MetricHistoryItem) => {
//     const metrics = JSON.parse(item.value);
//     return {
//       date: new Date(item.recordedAt).toLocaleDateString(),
//       SPI: metrics.SPI,
//       CPI: metrics.CPI,
//       EV: metrics.EV,
//       AC: metrics.AC,
//     };
//   }) ?? [];
//   console.log(processedHistory);

//   const ForecastCard: React.FC<{
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ eac, etc, vac, edac }) => (
//     <DashboardCard title="Project Forecast">
//       <div className="flex flex-col gap-3 text-sm text-gray-700">
//         <div>
//           <strong className="text-blue-700">Estimate at Completion (EAC):</strong> {eac.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Expected total cost of the project based on current data.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Estimate to Complete (ETC):</strong> {etc.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Projected cost to finish remaining work.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Variance at Completion (VAC):</strong> {vac.toLocaleString()}
//           <p className="ml-1 text-xs text-gray-500">Difference between budget and estimated cost. Negative means over budget.</p>
//         </div>
//         <div>
//           <strong className="text-blue-700">Estimated Duration (EDAC):</strong> {edac} months
//           <p className="ml-1 text-xs text-gray-500">Estimated total time to complete based on progress.</p>
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
//     const isSPIBad = spi < 1;
//     const isCPIBad = cpi < 1;
//     if (!isSPIBad && !isCPIBad) return null;

//     return (
//       <DashboardCard title="Project Alerts">
//         <div className="flex flex-col gap-3 text-sm text-red-700">
//           <div className="flex items-start gap-2">
//             <AlertTriangle className="text-red-500" size={20} />
//             <div className="flex flex-col">
//               <strong className="text-red-700">Warning:</strong>
//               {isSPIBad && <span>• Schedule Performance Index (SPI) is below 1.</span>}
//               {isCPIBad && <span>• Cost Performance Index (CPI) is below 1.</span>}
//               <span>• Review AI-suggested actions below.</span>
//             </div>
//           </div>
//           {!showRecommendations && (
//             <button
//               onClick={onShowAIRecommendations}
//               disabled={isRecLoading}
//               className="self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//               </svg>
//               View AI Suggestions
//               {isRecLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
//             </button>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

//   const validTypes = ['Schedule', 'Cost', 'Scope', 'Resource', 'Performance', 'Design', 'Testing'];

//   const RecommendationCard: React.FC<{
//     rec: AIRecommendation;
//     index: number;
//     projectId: number | undefined;
//     approvedIds: number[];
//     setApprovedIds: React.Dispatch<React.SetStateAction<number[]>>;
//   }> = ({ rec, index, projectId, approvedIds, setApprovedIds }) => {
//     const isApproved = approvedIds.includes(index);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedRec, setEditedRec] = useState<AIRecommendation>({ ...rec });
//     const [errors, setErrors] = useState<{ recommendation?: string; type?: string; api?: string }>({});

//     const validateFields = () => {
//       const newErrors: { recommendation?: string; type?: string } = {};
//       if (!editedRec.recommendation.trim()) {
//         newErrors.recommendation = 'Recommendation is required';
//       }
//       if (!editedRec.type || !validTypes.includes(editedRec.type)) {
//         newErrors.type = 'Valid type is required';
//       }
//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };

//     const handleApprove = async () => {
//       if (!projectId || isApproved) return;
//       if (!validateFields()) return;
//       try {
//         const payload = {
//           projectId,
//           type: editedRec.type,
//           recommendation: editedRec.recommendation,
//           suggestedChanges: editedRec.suggestedChanges || '',
//           details: editedRec.details || '',
//         };
//         console.log('Sending payload:', payload);
//         await createRecommendation(payload).unwrap();
//         setApprovedIds((prev) => [...prev, index]);
//         setRecommendations((prev) =>
//           prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//         );
//         await refetchRec();
//         await triggerForecast(projectKey);
//         await refetchAIData();
//         await refetchHistory();
//         setErrors({});
//       } catch (err: any) {
//         console.error('Error saving recommendation:', err);
//         console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//       }
//     };

//     const handleEdit = () => {
//       setIsEditing(true);
//       setEditedRec({ ...rec });
//       setErrors({});
//     };

//     const handleSaveEdit = () => {
//       if (!validateFields()) return;
//       setRecommendations((prev) =>
//         prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//       );
//       setIsEditing(false);
//       setErrors({});
//     };

//     const handleDelete = () => {
//       if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
//       setRecommendations((prev) => prev.filter((_, i) => i !== index));
//       setApprovedIds((prev) => prev.filter((id) => id !== index));
//     };

//     return (
//       <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
//         {isEditing ? (
//           <div className="flex flex-col gap-3">
//             <div>
//               <label className="text-sm font-medium text-gray-700">Recommendation</label>
//               <input
//                 type="text"
//                 value={editedRec.recommendation}
//                 onChange={(e) => setEditedRec({ ...editedRec, recommendation: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter recommendation"
//               />
//               {errors.recommendation && <p className="text-xs text-red-500">{errors.recommendation}</p>}
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Type</label>
//               <select
//                 value={editedRec.type}
//                 onChange={(e) => setEditedRec({ ...editedRec, type: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Select type</option>
//                 {validTypes.map((type) => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//               {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Details</label>
//               <textarea
//                 value={editedRec.details}
//                 onChange={(e) => setEditedRec({ ...editedRec, details: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter details"
//                 rows={4}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Suggested Changes</label>
//               <input
//                 type="text"
//                 value={editedRec.suggestedChanges}
//                 onChange={(e) => setEditedRec({ ...editedRec, suggestedChanges: e.target.value })}
//                 className="w-full border rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter suggested changes"
//               />
//             </div>
//             {errors.api && <p className="text-xs text-red-500">{errors.api}</p>}
//             <div className="flex gap-2">
//               <button
//                 onClick={handleSaveEdit}
//                 className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                 disabled={isCreateLoading}
//               >
//                 <Save size={16} /> Save
//               </button>
//               <button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setErrors({});
//                 }}
//                 className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="text-sm text-gray-600 font-semibold">
//               Recommendation #{index + 1} - {rec.type} (Priority: {rec.priority})
//             </div>
//             <div className="font-medium text-gray-900">{rec.recommendation}</div>
//             <div className="text-sm text-gray-600 whitespace-pre-wrap">{rec.details}</div>
//             <div className="text-xs text-gray-500">
//               <strong>Expected Impact:</strong> {rec.expectedImpact}
//             </div>
//             {rec.suggestedChanges && (
//               <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
//                 <strong>Suggested Changes:</strong>
//                 <div className="text-sm text-gray-700 whitespace-pre-wrap">{rec.suggestedChanges}</div>
//               </div>
//             )}
//             {errors.api && <p className="text-xs text-red-500 mt-2">{errors.api}</p>}
//             <div className="flex gap-2 mt-3 items-center">
//               <button
//                 onClick={handleApprove}
//                 className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved || isCreateLoading}
//               >
//                 <CheckCircle size={16} />
//                 {isCreateLoading ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   'Approve'
//                 )}
//               </button>
//               <button
//                 onClick={handleEdit}
//                 className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved}
//               >
//                 <Edit size={16} /> Edit
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={isApproved}
//               >
//                 <Trash2 size={16} /> Delete
//               </button>
//               {isApproved && <span className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle size={16} /> Approved</span>}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   const handleSaveAll = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }

//       const responseJson = JSON.stringify(recData.data);
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);

//       await refetchRec();
//       await refetchAIData();
//       await refetchHistory();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error saving all recommendations:', err);
//       console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//     }
//   };

//   const handleExit = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }
//       const responseJson = JSON.stringify(recData.data);
//       // const aiResponsePayload = {
//       //   aiFeature: 'RECOMMENDATION_SUGGESTION',
//       //   projectId: projectId,
//       //   responseJson,
//       //   status: 'ACTIVE',
//       // };

//       // // Save to AiResponseHistory
//       // await createAiResponseHistory(aiResponsePayload).unwrap();

//       // Update state for popup
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);

//       await refetchRec();
//       await refetchAIData();
//       await refetchHistory();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error saving all recommendations:', err);
//       console.log('API Error Details:', JSON.stringify(err.data, null, 2));
//     }
//   };

//   const handleCloseEvaluationPopup = () => {
//     setIsEvaluationPopupOpen(false);
//     setAiResponseJson('');
//   };

//   const handleEvaluationSubmitSuccess = async () => {
//     await refetchRec();
//     // await triggerForecast(projectKey);
//     await refetchAIData();
//     await refetchHistory();
//   };

//   return (
//     <div className="container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="col-span-1">
//           <DashboardCard title="Impact of AI Recommendations">
//             {(recRes?.data?.length ?? 0) > 0 && metricData && metricAIData ? (
//               <ImpactChart
//                 spiBefore={metricData.data?.schedulePerformanceIndex ?? 0}
//                 spiAfter={metricAIData.data?.schedulePerformanceIndex ?? 0}
//                 cpiBefore={metricData.data?.costPerformanceIndex ?? 0}
//                 cpiAfter={metricAIData.data?.costPerformanceIndex ?? 0}
//               />
//             ) : (
//               <p className="text-sm text-gray-500 italic">No AI recommendations applied yet.</p>
//             )}
//           </DashboardCard>
//         </div>
//         <div className="col-span-2">
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
//         onShowAIRecommendations={() => {
//           triggerGetRecommendations(projectKey, false);
//           setShowRecommendations(true);
//         }}
//       />

//       <ForecastCard
//         eac={metricData?.data?.estimateAtCompletion ?? 0}
//         etc={metricData?.data?.estimateToComplete ?? 0}
//         vac={metricData?.data?.varianceAtCompletion ?? 0}
//         edac={metricData?.data?.estimateDurationAtCompletion ?? 0}
//       />

//       <DashboardCard title="Health Overview">
//         <HealthOverview data={healthData} isLoading={isHealthLoading} />
//       </DashboardCard>

//       <DashboardCard title="Task Status">
//         <TaskStatusChart data={taskStatusData} isLoading={isTaskStatusLoading} />
//       </DashboardCard>

//       <DashboardCard title="Progress">
//         <ProgressPerSprint data={progressData} isLoading={isProgressLoading} />
//       </DashboardCard>

//       <DashboardCard title="Time Tracking">
//         <TimeComparisonChart data={timeData} isLoading={isTimeLoading} />
//       </DashboardCard>

//       <DashboardCard title="Cost">
//         <CostBarChart data={costData} isLoading={isCostLoading} />
//       </DashboardCard>

//       <DashboardCard title="Workload">
//         <WorkloadChart data={workloadData} isLoading={isWorkloadLoading} />
//       </DashboardCard>

//       <DashboardCard title="Metric Trends">
//         {isHistoryLoading ? (
//           <div className="flex justify-center items-center h-32">
//             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//         ) : processedHistory.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={processedHistory}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="SPI" stroke="#8884d8" activeDot={{ r: 8 }} />
//               <Line type="monotone" dataKey="CPI" stroke="#82ca9d" />
//               <Line type="monotone" dataKey="EV" stroke="#ffc658" />
//               <Line type="monotone" dataKey="AC" stroke="#ff7300" />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="text-sm text-gray-500 italic">No historical metric data available yet.</p>
//         )}
//       </DashboardCard>

//       {showRecommendations && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//                 </svg>
//                 AI Suggestions
//               </h2>
//               <button
//                 // onClick={() => setShowRecommendations(false)}
//                 onClick={handleExit}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {isRecLoading ? (
//               <div className="flex justify-center items-center h-32">
//                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             ) : recommendations.length > 0 ? (
//               <div className="flex flex-col gap-4">
//                 {recommendations.map((rec, idx) => (
//                   <RecommendationCard
//                     key={idx}
//                     rec={rec}
//                     index={idx}
//                     projectId={projectId}
//                     approvedIds={approvedIds}
//                     setApprovedIds={setApprovedIds}
//                   />
//                 ))}
//                 <div className="flex justify-end mt-4">
//                   <button
//                     onClick={handleSaveAll}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                   >
//                     <Save size={16} /> Done
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-sm text-gray-600">No AI suggestions available.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {isEvaluationPopupOpen && projectId && (
//         <AiResponseEvaluationPopup
//           isOpen={isEvaluationPopupOpen}
//           onClose={handleCloseEvaluationPopup}
//           aiResponseJson={aiResponseJson}
//           projectId={projectId}
//           aiFeature="RECOMMENDATION_SUGGESTION"
//           onSubmitSuccess={handleEvaluationSubmitSuccess}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectDashboard;

//******* */
// import React, { useEffect, useState } from 'react';
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
//   useLazyGetAIRecommendationsByProjectKeyQuery,
//   useCreateProjectRecommendationMutation,
//   useGetRecommendationsByProjectKeyQuery,
//   useLazyGetAIForecastByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import { useCreateAiResponseHistoryMutation } from '../../../services/aiResponseHistoryApi';
// import { AlertTriangle, CheckCircle, Edit, Trash2, Save, X } from 'lucide-react';
// import HealthOverview from './HealthOverview';
// import ProgressPerSprint from './ProgressPerSprint';
// import TimeComparisonChart from './TimeComparisonChart';
// import CostBarChart from './CostBarChart';
// import WorkloadChart from './WorkloadChart';
// import TaskStatusChart from './TaskStatusChart';
// import ApprovedAIImpactPanel from './ApprovedAIImpactPanel';
// import ImpactChart from './ImpactChart';
// import DashboardCard from './DashboardCard';
// import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import aiIcon from '../../../assets/icon/ai.png';

// interface AIRecommendation {
//   id?: number;
//   recommendation: string;
//   details: string;
//   type: string;
//   affectedTasks: string[];
//   expectedImpact: string;
//   suggestedChanges: string;
//   priority: number;
// }

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

// interface AIForecastResponse {
//   isSuccess: boolean;
//   code: number;
//   data: AIForecast;
//   message: string;
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
//   //projectStatus: string;
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
//   const [triggerForecast, { data: forecastRes, isLoading: isForecastLoading }] =
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
//   //useGetMetricHistoryByProjectKeyQuery(projectKey, { pollingInterval: 5000 });

//   const location = useLocation();

//   const [triggerGetRecommendations, { data: recData, isLoading: isRecLoading }] =
//     useLazyGetAIRecommendationsByProjectKeyQuery();
//   const [createRecommendation, { isLoading: isCreateLoading }] =
//     useCreateProjectRecommendationMutation();
//   const [createAiResponseHistory] = useCreateAiResponseHistoryMutation();
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [approvedIds, setApprovedIds] = useState<number[]>([]);
//   const [recommendations, setRecommendations] = useState<AIRecommendation[]>(recData?.data ?? []);
//   const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
//   const [aiResponseJson, setAiResponseJson] = useState<string>('');
//   const { data: recommendationTypeCategoriesData, isLoading: isRecommendationTypeLoading } =
//     useGetCategoriesByGroupQuery('recommendation_type');
//   const [isCalculateDone, setIsCalculateDone] = useState(false);

//   useEffect(() => {
//     const doCalculateThenRefetch = async () => {
//       try {
//         await calculate({ projectKey }).unwrap();
//         await refetch();
//         //await refetchHealth();
//         setIsCalculateDone(true);
//       } catch (err) {
//         console.error('❌ Error calculating/refetching metrics:', err);
//         setIsCalculateDone(true);
//       }
//     };
//     setIsCalculateDone(false);
//     doCalculateThenRefetch();
//   }, [location.key, calculate, refetch]);

//   // useEffect(() => {
//   //   refetchHealth();
//   //   refetchProgress();
//   //   refetchTaskStatus();
//   //   refetchTime();
//   //   refetchCost();
//   //   refetchWorkload();
//   //   refetchRec();
//   //   refetchHistory();
//   //   if (showRecommendations) {
//   //     triggerGetRecommendations(projectKey, false);
//   //   }
//   // }, [location.key, refetchHealth, refetchProgress, refetchTaskStatus, refetchTime, refetchCost, refetchWorkload, refetchRec, refetchHistory, projectKey, triggerGetRecommendations, showRecommendations]);

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
//           showRecommendations ? triggerGetRecommendations(projectKey, false) : Promise.resolve(),
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
//     triggerGetRecommendations,
//     triggerForecast,
//     projectKey,
//     showRecommendations,
//   ]);

//   useEffect(() => {
//     setRecommendations(recData?.data ?? []);
//   }, [recData]);

//   const approvedRecs =
//     recRes?.data?.map((rec) => ({
//       id: rec.id,
//       projectId: rec.projectId,
//       type: rec.type,
//       recommendation: rec.recommendation,
//       details: rec.details,
//       suggestedChanges: rec.suggestedChanges,
//       createdAt: rec.createdAt,
//     })) ?? [];

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

//   const spi = metricData?.data?.schedulePerformanceIndex ?? 0;
//   const cpi = metricData?.data?.costPerformanceIndex ?? 0;
//   const projectId = metricData?.data?.projectId;

//   // Process history data for chart
//   const processedHistory =
//     historyData?.data?.map((item: MetricHistoryItem) => {
//       const metrics = JSON.parse(item.value);
//       return {
//         date: new Date(item.recordedAt).toLocaleDateString(),
//         SPI: metrics.SPI.toFixed(2),
//         CPI: metrics.CPI.toFixed(2),
//         EV: metrics.EV,
//         AC: metrics.AC,
//       };
//     }) ?? [];

//   const ForecastCard: React.FC<{
//     spi: number;
//     cpi: number;
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ spi, cpi, eac, etc, vac, edac }) => (
//     <DashboardCard title='Project Forecast'>
//       <div className='flex flex-col gap-3 text-sm text-gray-700'>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI):</strong>
//           <span>{spi.toFixed(2)}</span>
//           <p className='text-xs text-gray-500'>
//             Measures schedule efficiency. Above 1 means ahead of schedule.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI):</strong>
//           <span>{cpi.toFixed(2)}</span>
//           <p className='text-xs text-gray-500'>
//             Measures cost efficiency. Above 1 means under budget.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
//           {eac.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>
//             Expected total cost of the project based on current data.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
//           {etc.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>Projected cost to finish remaining work.</p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
//           {vac.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>
//             Difference between budget and estimated cost. Negative means over budget.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
//           <p className='ml-1 text-xs text-gray-500'>
//             Estimated total time to complete based on progress.
//           </p>
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
//               {spi < 0.9 && <span>• Schedule Performance Index (SPI) is below threshold.</span>}
//               {cpi < 0.9 && <span>• Cost Performance Index (CPI) is below threshold.</span>}
//               <span>• Review AI-suggested actions below.</span>
//             </div>
//           </div>
//           {!showRecommendations && (
//             <button
//               onClick={onShowAIRecommendations}
//               disabled={isRecLoading}
//               className='self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
//             >
//               <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
//                 <path
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                   strokeWidth='2'
//                   d='M12 4v16m8-8H4'
//                 />
//               </svg>
//               View AI Suggestions
//               {isRecLoading && (
//                 <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
//               )}
//             </button>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

//   // const validTypes = ['Schedule', 'Cost'];
//   const validTypes = recommendationTypeCategoriesData?.data
//     ?.filter((category: any) => ['SCHEDULE', 'COST'].includes(category.name.toUpperCase()))
//     ?.map((category: any) => category.name.toUpperCase()) ?? ['SCHEDULE', 'COST'];

//   const RecommendationCard: React.FC<{
//     rec: AIRecommendation;
//     index: number;
//     projectId: number | undefined;
//     approvedIds: number[];
//     setApprovedIds: React.Dispatch<React.SetStateAction<number[]>>;
//   }> = ({ rec, index, projectId, approvedIds, setApprovedIds }) => {
//     const isApproved = approvedIds.includes(index);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedRec, setEditedRec] = useState<AIRecommendation>({ ...rec });
//     const [errors, setErrors] = useState<{ recommendation?: string; type?: string; api?: string }>(
//       {}
//     );

//     const validateFields = () => {
//       const newErrors: { recommendation?: string; type?: string } = {};
//       if (!editedRec.recommendation.trim()) {
//         newErrors.recommendation = 'Recommendation is required';
//       }
//       if (!editedRec.type || !validTypes.includes(editedRec.type)) {
//         newErrors.type = 'Valid type is required';
//       }
//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };

//     const handleApprove = async () => {
//       if (!projectId || isApproved) return;
//       if (!validateFields()) return;
//       try {
//         const payload = {
//           projectId,
//           type: editedRec.type,
//           recommendation: editedRec.recommendation,
//           suggestedChanges: editedRec.suggestedChanges || '',
//           details: editedRec.details || '',
//         };
//         await createRecommendation(payload).unwrap();
//         setApprovedIds((prev) => [...prev, index]);
//         setRecommendations((prev) =>
//           prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//         );
//         await refetchRec();
//         await triggerForecast(projectKey);
//         await refetchAIData();
//         await refetchHistory();
//         setErrors({});
//       } catch (err: any) {
//         console.error('Error saving recommendation:', err);
//         setErrors({ api: 'Failed to save recommendation. Please try again.' });
//       }
//     };

//     const handleEdit = () => {
//       setIsEditing(true);
//       setEditedRec({ ...rec });
//       setErrors({});
//     };

//     const handleSaveEdit = () => {
//       if (!validateFields()) return;
//       setRecommendations((prev) =>
//         prev.map((r, i) => (i === index ? { ...editedRec, id: rec.id } : r))
//       );
//       setIsEditing(false);
//       setErrors({});
//     };

//     const handleDelete = () => {
//       if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
//       setRecommendations((prev) => prev.filter((_, i) => i !== index));
//       setApprovedIds((prev) => prev.filter((id) => id !== index));
//     };

//     return (
//       <div className='border border-gray-200 rounded-md p-4 bg-gray-50'>
//         {isEditing ? (
//           <div className='space-y-4'>
//             <div>
//               <label className='block text-sm font-semibold text-gray-700 mb-1'>
//                 Recommendation
//               </label>
//               <input
//                 type='text'
//                 value={editedRec.recommendation}
//                 onChange={(e) => setEditedRec({ ...editedRec, recommendation: e.target.value })}
//                 className='w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 border border-gray-300'
//                 placeholder='Enter recommendation'
//               />
//               {errors.recommendation && (
//                 <p className='text-xs text-red-500 mt-1'>{errors.recommendation}</p>
//               )}
//             </div>
//             <div>
//               <label className='block text-sm font-semibold text-gray-700 mb-1'>Type</label>
//               <select
//                 value={editedRec.type}
//                 onChange={(e) => setEditedRec({ ...editedRec, type: e.target.value })}
//                 className='w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 border border-gray-300'
//               >
//                 <option value=''>Select type</option>
//                 {validTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//               {errors.type && <p className='text-xs text-red-500 mt-1'>{errors.type}</p>}
//             </div>
//             <div>
//               <label className='block text-sm font-semibold text-gray-700 mb-1'>Details</label>
//               <textarea
//                 value={editedRec.details}
//                 onChange={(e) => setEditedRec({ ...editedRec, details: e.target.value })}
//                 className='w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 border border-gray-300'
//                 placeholder='Enter details'
//                 rows={4}
//               />
//             </div>
//             <div>
//               <label className='block text-sm font-semibold text-gray-700 mb-1'>
//                 Suggested Changes
//               </label>
//               <input
//                 type='text'
//                 value={editedRec.suggestedChanges}
//                 onChange={(e) => setEditedRec({ ...editedRec, suggestedChanges: e.target.value })}
//                 className='w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 border border-gray-300'
//                 placeholder='Enter suggested changes'
//               />
//             </div>
//             {errors.api && <p className='text-xs text-red-500 mt-1'>{errors.api}</p>}
//             <div className='flex justify-end gap-4'>
//               <button
//                 onClick={handleSaveEdit}
//                 className='px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
//                 disabled={isCreateLoading}
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setErrors({});
//                 }}
//                 className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className='text-sm font-semibold text-gray-700 mb-2'>
//               Recommendation #{index + 1} - {rec.type} (Priority: {rec.priority})
//             </div>
//             <div className='font-medium text-gray-900 mb-2'>{rec.recommendation}</div>
//             <div className='text-sm text-gray-600 whitespace-pre-wrap mb-2'>{rec.details}</div>
//             <div className='text-xs text-gray-500 mb-2'>
//               <strong>Expected Impact:</strong> {rec.expectedImpact}
//             </div>
//             {rec.suggestedChanges && (
//               <div className='text-sm text-gray-600 bg-gray-100 p-2 rounded mb-2'>
//                 <strong>Suggested Changes:</strong>
//                 <div className='text-sm text-gray-700 whitespace-pre-wrap'>
//                   {rec.suggestedChanges}
//                 </div>
//               </div>
//             )}
//             {errors.api && <p className='text-xs text-red-500 mt-2'>{errors.api}</p>}
//             <div className='flex justify-end gap-4'>
//               <button
//                 onClick={handleApprove}
//                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
//                   isApproved
//                     ? 'bg-gray-400 text-white cursor-not-allowed'
//                     : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
//                 }`}
//                 disabled={isApproved || isCreateLoading}
//               >
//                 {isApproved ? 'Approved' : 'Approve'}
//               </button>
//               <button
//                 onClick={handleEdit}
//                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
//                   isApproved
//                     ? 'bg-gray-400 text-white cursor-not-allowed'
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//                 disabled={isApproved}
//               >
//                 Edit
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   const handleSaveAll = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }
//       const responseJson = JSON.stringify(recData.data);
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);
//       await refetchRec();
//       await refetchAIData();
//       await refetchHistory();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error saving all recommendations:', err);
//     }
//   };

//   const handleExit = async () => {
//     try {
//       if (!recData?.data || recData.data.length === 0) {
//         console.warn('No original AI recommendations to save.');
//         setShowRecommendations(false);
//         return;
//       }
//       const responseJson = JSON.stringify(recData.data);
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);
//       await refetchRec();
//       await refetchAIData();
//       await refetchHistory();
//       setShowRecommendations(false);
//     } catch (err: any) {
//       console.error('Error exiting recommendations:', err);
//     }
//   };

//   const handleCloseEvaluationPopup = () => {
//     setIsEvaluationPopupOpen(false);
//     setAiResponseJson('');
//   };

//   const handleEvaluationSubmitSuccess = async () => {
//     await refetchRec();
//     await refetchAIData();
//     await refetchHistory();
//   };

//   const handleRefreshSuggestions = () => {
//     triggerGetRecommendations(projectKey, false);
//   };

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
//         onShowAIRecommendations={() => {
//           triggerGetRecommendations(projectKey, false);
//           setShowRecommendations(true);
//         }}
//       />

//       <ForecastCard
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
//           <ResponsiveContainer width='100%' height={300}>
//             <LineChart data={processedHistory}>
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type='monotone' dataKey='SPI' stroke='#8884d8' activeDot={{ r: 8 }} />
//               <Line type='monotone' dataKey='CPI' stroke='#82ca9d' />
//               <Line type='monotone' dataKey='EV' stroke='#ffc658' />
//               <Line type='monotone' dataKey='AC' stroke='#ff7300' />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className='text-sm text-gray-500 italic'>No historical metric data available yet.</p>
//         )}
//       </DashboardCard>

//       {/* {showRecommendations && (
//         <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4'>
//           <div className='bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
//             <div className='flex justify-between items-center mb-6'>
//               <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
//                 <svg
//                   className='w-5 h-5 text-blue-600'
//                   fill='none'
//                   stroke='currentColor'
//                   viewBox='0 0 24 24'
//                 >
//                   <path
//                     strokeLinecap='round'
//                     strokeLinejoin='round'
//                     strokeWidth='2'
//                     d='M12 4v16m8-8H4'
//                   />
//                 </svg>
//                 AI Suggestions
//               </h2>
//               <button onClick={handleExit} className='text-gray-500 hover:text-gray-700'>
//                 <X size={24} />
//               </button>
//             </div>

//             {isRecLoading ? (
//               <div className='flex justify-center items-center h-32'>
//                 <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
//               </div>
//             ) : recommendations.length > 0 ? (
//               <div className='flex flex-col gap-4'>
//                 {recommendations.map((rec, idx) => (
//                   <RecommendationCard
//                     key={idx}
//                     rec={rec}
//                     index={idx}
//                     projectId={projectId}
//                     approvedIds={approvedIds}
//                     setApprovedIds={setApprovedIds}
//                   />
//                 ))}
//                 <div className='flex justify-end mt-4'>
//                   <button
//                     onClick={handleSaveAll}
//                     className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
//                   >
//                     <Save size={16} /> Done
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <p className='text-sm text-gray-600'>No AI suggestions available.</p>
//             )}
//           </div>
//         </div>
//       )} */}
//       {showRecommendations && (
//         <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
//           <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
//             <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
//               <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
//               <h2 className='text-2xl font-bold text-white'>AI Suggestions</h2>
//             </div>
//             <div className='p-6 overflow-y-auto max-h-[60vh]'>
//               {isRecLoading ? (
//                 <div className='flex justify-center items-center h-32'>
//                   <svg
//                     className='animate-spin w-10 h-10 text-purple-600'
//                     fill='none'
//                     viewBox='0 0 24 24'
//                   >
//                     <circle
//                       className='opacity-25'
//                       cx='12'
//                       cy='12'
//                       r='10'
//                       stroke='currentColor'
//                       strokeWidth='4'
//                     />
//                     <path
//                       className='opacity-75'
//                       fill='currentColor'
//                       d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                     />
//                   </svg>
//                   <p className='mt-4 text-gray-600 text-lg'>AI is generating your suggestions...</p>
//                 </div>
//               ) : recommendations.length > 0 ? (
//                 <div className='space-y-4'>
//                   {recommendations.map((rec, idx) => (
//                     <RecommendationCard
//                       key={idx}
//                       rec={rec}
//                       index={idx}
//                       projectId={projectId}
//                       approvedIds={approvedIds}
//                       setApprovedIds={setApprovedIds}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className='text-center py-8 text-gray-500 text-lg'>
//                   No AI suggestions available. Try again later!
//                 </div>
//               )}
//             </div>
//             <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
//               <button
//                 onClick={handleRefreshSuggestions}
//                 disabled={isRecLoading}
//                 className={`px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 ${
//                   isRecLoading
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'
//                 }`}
//               >
//                 {isRecLoading ? 'Refreshing...' : 'Refresh AI Suggestions'}
//               </button>
//               <button
//                 onClick={handleExit}
//                 className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isEvaluationPopupOpen && projectId && (
//         <AiResponseEvaluationPopup
//           isOpen={isEvaluationPopupOpen}
//           onClose={handleCloseEvaluationPopup}
//           aiResponseJson={aiResponseJson}
//           projectId={projectId}
//           aiFeature='RECOMMENDATION_SUGGESTION'
//           onSubmitSuccess={handleEvaluationSubmitSuccess}
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
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

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
//     spi: number;
//     cpi: number;
//     eac: number;
//     etc: number;
//     vac: number;
//     edac: number;
//   }> = ({ spi, cpi, eac, etc, vac, edac }) => (
//     <DashboardCard title='Project Forecast'>
//       <div className='flex flex-col gap-3 text-sm text-gray-700'>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI):</strong>
//           <span>{spi.toFixed(2)}</span>
//           <p className='text-xs text-gray-500'>
//             Measures schedule efficiency. Above 1 means ahead of schedule.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI):</strong>
//           <span>{cpi.toFixed(2)}</span>
//           <p className='text-xs text-gray-500'>
//             Measures cost efficiency. Above 1 means under budget.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
//           {eac.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>
//             Expected total cost of the project based on current data.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
//           {etc.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>Projected cost to finish remaining work.</p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
//           {vac.toLocaleString()}
//           <p className='ml-1 text-xs text-gray-500'>
//             Difference between budget and estimated cost. Negative means over budget.
//           </p>
//         </div>
//         <div>
//           <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
//           <p className='ml-1 text-xs text-gray-500'>
//             Estimated total time to complete based on progress.
//           </p>
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
//             <button
//               onClick={onShowAIRecommendations}
//               className='self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
//             >
//               <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
//                 <path
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                   strokeWidth='2'
//                   d='M12 4v16m8-8H4'
//                 />
//               </svg>
//               View AI Suggestions
//             </button>
//           )}
//         </div>
//       </DashboardCard>
//     );
//   };

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
//           <ResponsiveContainer width='100%' height={300}>
//             <LineChart data={processedHistory}>
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type='monotone' dataKey='SPI' stroke='#8884d8' activeDot={{ r: 8 }} />
//               <Line type='monotone' dataKey='CPI' stroke='#82ca9d' />
//               <Line type='monotone' dataKey='EV' stroke='#ffc658' />
//               <Line type='monotone' dataKey='AC' stroke='#ff7300' />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className='text-sm text-gray-500 italic'>No historical metric data available yet.</p>
//         )}
//       </DashboardCard>

//       {showRecommendations && (
//         <SuggestedRecommendationsModal
//           onClose={() => setShowRecommendations(false)}
//           projectKey={projectKey}
//           projectId={projectId}
//           onSubmitSuccess={handleSubmitSuccess}
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

  useGetHealthDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetTaskStatusDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetProgressDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetTimeDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetWorkloadDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetCostDashboardQuery(projectKey, { pollingInterval: 5000 });
  useGetProjectMetricAIByProjectKeyQuery(projectKey, { pollingInterval: 5000 });

  const location = useLocation();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [modalKey, setModalKey] = useState(Date.now());
  const [isCalculateDone, setIsCalculateDone] = useState(false);

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
          SPI: metrics.SPI.toFixed(2),
          CPI: metrics.CPI.toFixed(2),
          EV: metrics.EV,
          AC: metrics.AC,
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
          <span>{Math.round(pv).toLocaleString()}</span>{' '}VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Earned Value (EV): </strong>
          <span>{Math.round(ev).toLocaleString()}</span>{' '}VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Actual Cost (AC): </strong>
          <span>{Math.round(ac).toLocaleString()}</span>{' '}VND
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Schedule Performance Index (SPI): </strong>
          <span>{spi.toFixed(2)}</span>
          {/* <p className='text-xs text-gray-500'>
            Measures schedule efficiency. Above 1 means ahead of schedule.
          </p> */}
        </div>
        <div>
          <strong className='text-blue-700 min-w-[160px]'>Cost Performance Index (CPI):</strong>
          <span>{cpi.toFixed(2)}</span>
          {/* <p className='text-xs text-gray-500'>
            Measures cost efficiency. Above 1 means under budget.
          </p> */}
        </div>
        <div>
          <strong className='text-blue-700'>Estimate at Completion (EAC):</strong>{' '}
          {eac.toLocaleString()} VND
          {/* <p className='ml-1 text-xs text-gray-500'>
            Expected total cost of the project based on current data.
          </p> */}
        </div>
        <div>
          <strong className='text-blue-700'>Estimate to Complete (ETC):</strong>{' '}
          {etc.toLocaleString()} VND
          {/* <p className='ml-1 text-xs text-gray-500'>Projected cost to finish remaining work.</p> */}
        </div>
        <div>
          <strong className='text-blue-700'>Variance at Completion (VAC):</strong>{' '}
          {vac.toLocaleString()} VND
          {/* <p className='ml-1 text-xs text-gray-500'>
            Difference between budget and estimated cost. Negative means over budget.
          </p> */}
        </div>
        <div>
          <strong className='text-blue-700'>Estimated Duration (EDAC):</strong> {edac} months
          {/* <p className='ml-1 text-xs text-gray-500'>
            Estimated total time to complete based on progress.
          </p> */}
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
              {spi < 1 && <span> - Schedule Performance Index (SPI) is below threshold.</span>}
              {cpi < 1 && <span> - Cost Performance Index (CPI) is below threshold.</span>}
              <span> - Review AI-suggested actions below.</span>
            </div>
          </div>
          {!showRecommendations && (
            // <button
            //   onClick={onShowAIRecommendations}
            //   className='self-start bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            // >
            //   <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            //     <path
            //       strokeLinecap='round'
            //       strokeLinejoin='round'
            //       strokeWidth='2'
            //       d='M12 4v16m8-8H4'
            //     />
            //   </svg>
            //   View AI Suggestions
            // </button>
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

// Utility function to format ratios (SPI, CPI)
const formatRatio = (value: number): string => {
  return value.toFixed(2);
};

  return (
    <div className='container mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
          // <ResponsiveContainer width='100%' height={300}>
          //   <LineChart data={processedHistory}>
          //     <CartesianGrid strokeDasharray='3 3' />
          //     <XAxis dataKey='date' />
          //     <YAxis />
          //     <Tooltip />
          //     <Legend />
          //     <Line type='monotone' dataKey='SPI' stroke='#8884d8' activeDot={{ r: 8 }} />
          //     <Line type='monotone' dataKey='CPI' stroke='#82ca9d' />
          //     <Line type='monotone' dataKey='EV' stroke='#ffc658' />
          //     <Line type='monotone' dataKey='AC' stroke='#ff7300' />
          //   </LineChart>
          // </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value, index) => {
                return formatCurrency(value);
              }}
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
