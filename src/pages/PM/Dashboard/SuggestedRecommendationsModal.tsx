// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   useLazyGetAIRecommendationsByProjectKeyQuery,
//   useCreateProjectRecommendationMutation,
//   useGetAIRecommendationsByProjectKeyQuery,
// } from '../../../services/projectRecommendationApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
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
//   isEditing?: boolean;
// }

// interface Props {
//   onClose: () => void;
//   projectKey: string;
//   projectId?: number;
//   onSubmitSuccess: () => void;
// }

// const SuggestedRecommendationsModal: React.FC<Props> = ({
//   onClose,
//   projectKey,
//   projectId,
//   onSubmitSuccess,
// }) => {
//   const [trigger, { data, isLoading: isRecLoading, error: recError }] =
//     useLazyGetAIRecommendationsByProjectKeyQuery();
//   const [createRecommendation, { isLoading: isCreateLoading }] =
//     useCreateProjectRecommendationMutation();
//   const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
//   const [originalRecommendations, setOriginalRecommendations] = useState<AIRecommendation[]>([]);
//   const [approvedIds, setApprovedIds] = useState<number[]>([]);
//   const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
//   const [aiResponseJson, setAiResponseJson] = useState<string>('');

//   const { data: categoryData, isLoading: isCategoryLoading } =
//     useGetCategoriesByGroupQuery('recommendation_type');

//   const validTypes = useMemo(
//     () =>
//       categoryData?.data
//         ?.filter((category: any) => ['SCHEDULE', 'COST'].includes(category.name.toUpperCase()))
//         ?.map((category: any) => category.name.toUpperCase()) ?? ['SCHEDULE', 'COST'],
//     [categoryData]
//   );

//   useEffect(() => {
//     console.log('Modal mounted, triggering API call with projectKey:', projectKey);
//     trigger(projectKey, true)
//       .unwrap()
//       .then(() => console.log('API call successful'))
//       .catch((err) => console.error('API call failed:', err));
//   }, [projectKey, trigger]);

//   useEffect(() => {
//     if (data?.data) {
//       console.log('Received new data:', data.data);
//       const mapped = data.data.map((item, idx) => ({
//         ...item,
//         id: idx + 1,
//         isEditing: false,
//       }));
//       setRecommendations(mapped);
//       setOriginalRecommendations(data.data);
//       setApprovedIds([]);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (recError) {
//       console.error('Error fetching recommendations:', recError);
//     }
//   }, [recError]);

//   const handleUpdateField = <K extends keyof AIRecommendation>(
//     index: number,
//     field: K,
//     value: AIRecommendation[K]
//   ) => {
//     const updated = [...recommendations];
//     updated[index] = { ...updated[index], [field]: value };
//     setRecommendations(updated);
//   };

//   const toggleEditMode = (index: number) => {
//     const updated = [...recommendations];
//     updated[index].isEditing = !updated[index].isEditing;
//     setRecommendations(updated);
//   };

//   const handleApprove = async (rec: AIRecommendation, index: number) => {
//     if (!projectId || approvedIds.includes(index)) return;
//     try {
//       const payload = {
//         projectId,
//         type: rec.type,
//         recommendation: rec.recommendation,
//         suggestedChanges: rec.suggestedChanges || '',
//         details: rec.details || '',
//       };
//       await createRecommendation(payload).unwrap();
//       setApprovedIds((prev) => [...prev, index]);
//       setRecommendations((prev) =>
//         prev.map((r, i) => (i === index ? { ...r, isEditing: false } : r))
//       );
//       onSubmitSuccess();
//     } catch (err: any) {
//       console.error('Error saving recommendation:', err);
//       alert('Failed to approve recommendation. Please try again.');
//     }
//   };

//   const handleDelete = (index: number) => {
//     if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
//     setRecommendations((prev) => prev.filter((_, i) => i !== index));
//     setApprovedIds((prev) => prev.filter((id) => id !== index));
//   };

//   const handleClose = () => {
//     if (originalRecommendations.length > 0) {
//       const responseJson = JSON.stringify(originalRecommendations);
//       setAiResponseJson(responseJson);
//       setIsEvaluationPopupOpen(true);
//     } else {
//       onClose();
//     }
//   };

//   const handleCloseEvaluationPopup = () => {
//     setIsEvaluationPopupOpen(false);
//     setAiResponseJson('');
//     onClose();
//   };

//   if (isRecLoading || isCategoryLoading) {
//     return (
//       <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
//         <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
//           <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
//             <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
//             <h2 className='text-2xl font-bold text-white'>AI Suggestions</h2>
//           </div>
//           <div className='p-6 flex flex-col items-center justify-center py-8'>
//             <svg className='animate-spin w-10 h-10 text-purple-600' fill='none' viewBox='0 0 24 24'>
//               <circle
//                 className='opacity-25'
//                 cx='12'
//                 cy='12'
//                 r='10'
//                 stroke='currentColor'
//                 strokeWidth='4'
//               />
//               <path
//                 className='opacity-75'
//                 fill='currentColor'
//                 d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//               />
//             </svg>
//             <p className='mt-4 text-gray-600 text-lg'>AI is generating your suggestions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
//       <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
//         <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
//           <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
//           <h2 className='text-2xl font-bold text-white'>AI Suggestions</h2>
//         </div>
//         <div className='p-6 overflow-y-auto max-h-[60vh]'>
//           {recError && (
//             <div className='text-center py-8 text-red-500 text-lg'>
//               Failed to load AI suggestions. Please try again later.
//             </div>
//           )}
//           {recommendations.length === 0 && !recError ? (
//             <div className='text-center py-8 text-gray-500 text-lg'>
//               No AI suggestions available. Try again later!
//             </div>
//           ) : (
//             <div className='space-y-4'>
//               {recommendations.map((rec, index) => (
//                 <div key={index} className='border border-gray-200 rounded-md p-4 bg-gray-50'>
//                   <div className='mb-4'>
//                     <label className='block text-sm font-semibold text-gray-700 mb-1'>Recommendation</label>
//                     <input
//                       className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
//                         !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
//                       }`}
//                       value={rec.recommendation}
//                       onChange={(e) => handleUpdateField(index, 'recommendation', e.target.value)}
//                       disabled={!rec.isEditing || approvedIds.includes(index)}
//                       readOnly={!rec.isEditing || approvedIds.includes(index)}
//                     />
//                   </div>
//                   <div className='mb-4'>
//                     <label className='block text-sm font-semibold text-gray-700 mb-1'>Type</label>
//                     <select
//                       className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
//                         !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
//                       }`}
//                       value={rec.type}
//                       onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
//                       disabled={!rec.isEditing || approvedIds.includes(index)}
//                     >
//                       <option value=''>Select type</option>
//                       {validTypes.map((type) => (
//                         <option key={type} value={type}>
//                           {type}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className='mb-4'>
//                     <label className='block text-sm font-semibold text-gray-700 mb-1'>Details</label>
//                     <textarea
//                       className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
//                         !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
//                       }`}
//                       value={rec.details}
//                       onChange={(e) => handleUpdateField(index, 'details', e.target.value)}
//                       rows={4}
//                       disabled={!rec.isEditing || approvedIds.includes(index)}
//                       readOnly={!rec.isEditing || approvedIds.includes(index)}
//                     />
//                   </div>
//                   <div className='mb-4'>
//                     <label className='block text-sm font-semibold text-gray-700 mb-1'>Suggested Changes</label>
//                     <input
//                       className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
//                         !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
//                       }`}
//                       value={rec.suggestedChanges}
//                       onChange={(e) => handleUpdateField(index, 'suggestedChanges', e.target.value)}
//                       disabled={!rec.isEditing || approvedIds.includes(index)}
//                       readOnly={!rec.isEditing || approvedIds.includes(index)}
//                     />
//                   </div>
//                   <div className='text-xs text-gray-500 mb-4'>
//                     <strong>Expected Impact:</strong> {rec.expectedImpact}
//                   </div>
//                   <div className='text-xs text-gray-500 mb-4'>
//                     <strong>Priority:</strong> {rec.priority}
//                   </div>
//                   <div className='flex justify-end gap-4'>
//                     {!approvedIds.includes(index) && (
//                       <button
//                         onClick={() => toggleEditMode(index)}
//                         className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
//                           rec.isEditing
//                             ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
//                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                         }`}
//                       >
//                         {rec.isEditing ? 'Save' : 'Edit'}
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleApprove(rec, index)}
//                       disabled={approvedIds.includes(index) || isCreateLoading}
//                       className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
//                         approvedIds.includes(index)
//                           ? 'bg-gray-400 text-white cursor-not-allowed'
//                           : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
//                       }`}
//                     >
//                       {approvedIds.includes(index) ? 'Approved' : 'Approve'}
//                     </button>
//                     <button
//                       onClick={() => handleDelete(index)}
//                       disabled={approvedIds.includes(index)}
//                       className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
//                         approvedIds.includes(index)
//                           ? 'bg-gray-400 text-white cursor-not-allowed'
//                           : 'bg-red-600 text-white hover:bg-red-700'
//                       }`}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}

//             </div>
//           )}
//         </div>
//         <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
//           <button
//             onClick={handleClose}
//             className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
//           >
//             OK
//           </button>
//         </div>
//         {isEvaluationPopupOpen && projectId && (
//           <AiResponseEvaluationPopup
//             isOpen={isEvaluationPopupOpen}
//             onClose={handleCloseEvaluationPopup}
//             aiResponseJson={aiResponseJson}
//             projectId={projectId}
//             aiFeature='RECOMMENDATION_SUGGESTION'
//             onSubmitSuccess={onSubmitSuccess}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SuggestedRecommendationsModal;

import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetAIRecommendationsByProjectKeyQuery,
  useCreateProjectRecommendationMutation,
} from '../../../services/projectRecommendationApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
import aiIcon from '../../../assets/icon/ai.png';

interface AIRecommendation {
  id?: number;
  recommendation: string;
  details: string;
  type: string;
  affectedTasks: string[];
  expectedImpact: string;
  suggestedChanges: string;
  priority: number;
  isEditing?: boolean;
}

interface Props {
  onClose: () => void;
  projectKey: string;
  projectId?: number;
  onSubmitSuccess: () => void;
  modalKey: number;
}

const SuggestedRecommendationsModal: React.FC<Props> = ({
  onClose,
  projectKey,
  projectId,
  onSubmitSuccess,
  modalKey,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [originalRecommendations, setOriginalRecommendations] = useState<AIRecommendation[]>([]);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [aiResponseJson, setAiResponseJson] = useState<string>('');

  const queryKey = `${projectKey}_${modalKey}`;
  console.log('Query key:', queryKey);

  const {
    data,
    isLoading: isRecLoading,
    error: recError,
    refetch,
  } = useGetAIRecommendationsByProjectKeyQuery(queryKey, { skip: !projectKey });

  const [createRecommendation, { isLoading: isCreateLoading }] =
    useCreateProjectRecommendationMutation();

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('recommendation_type');

  const validTypes = useMemo(
    () =>
      categoryData?.data
        ?.filter((category: any) => ['SCHEDULE', 'COST'].includes(category.name.toUpperCase()))
        ?.map((category: any) => category.name.toUpperCase()) ?? ['SCHEDULE', 'COST'],
    [categoryData]
  );

  useEffect(() => {
    if (data?.isSuccess && Array.isArray(data.data)) {
      console.log('Received new data:', data.data);
      const mapped = data.data.map((item, idx) => ({
        ...item,
        id: idx + 1,
        isEditing: false,
      }));
      setRecommendations(mapped);
      setOriginalRecommendations(data.data);
      setApprovedIds([]);
    }
  }, [data]);

  useEffect(() => {
    if (recError) {
      console.error('Error fetching recommendations:', JSON.stringify(recError, null, 2));
    }
  }, [recError]);

  const handleUpdateField = <K extends keyof AIRecommendation>(
    index: number,
    field: K,
    value: AIRecommendation[K]
  ) => {
    const updated = [...recommendations];
    updated[index] = { ...updated[index], [field]: value };
    setRecommendations(updated);
  };

  const toggleEditMode = (index: number) => {
    const updated = [...recommendations];
    updated[index].isEditing = !updated[index].isEditing;
    setRecommendations(updated);
  };

  const handleApprove = async (rec: AIRecommendation, index: number) => {
    if (!projectId || approvedIds.includes(index)) return;
    try {
      const payload = {
        projectId,
        type: rec.type,
        recommendation: rec.recommendation,
        suggestedChanges: rec.suggestedChanges || null,
        details: rec.details || null,
      };
      await createRecommendation(payload).unwrap();
      setApprovedIds((prev) => [...prev, index]);
      setRecommendations((prev) =>
        prev.map((r, i) => (i === index ? { ...r, isEditing: false } : r))
      );
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Error saving recommendation:', err);
      alert('Failed to approve recommendation. Please try again.');
    }
  };

  const handleDelete = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
    setRecommendations((prev) => prev.filter((_, i) => i !== index));
    setApprovedIds((prev) => prev.filter((id) => id !== index));
  };

  const handleClose = () => {
    if (originalRecommendations.length > 0) {
      const responseJson = JSON.stringify(originalRecommendations);
      setAiResponseJson(responseJson);
      setIsEvaluationPopupOpen(true);
    } else {
      onClose();
    }
  };

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
    setAiResponseJson('');
    onClose();
  };

  if (isRecLoading || isCategoryLoading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
        <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
          <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
            <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
            <h2 className='text-2xl font-bold text-white'>AI Suggestions</h2>
          </div>
          <div className='p-6 flex flex-col items-center justify-center py-8'>
            <svg className='animate-spin w-10 h-10 text-purple-600' fill='none' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
              />
            </svg>
            <p className='mt-4 text-gray-600 text-lg'>AI is generating your suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
        <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
          <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
          <h2 className='text-2xl font-bold text-white'>AI Suggestions</h2>
        </div>
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {recError && (
            <div className='text-center py-8'>
              <p className='text-red-500 text-lg'>
                {recError &&
                'data' in recError &&
                recError.data &&
                typeof recError.data === 'object' &&
                (recError.data as any).message === 'Internal Server Error: Project not found'
                  ? 'Project not found. Please check the project key and try again.'
                  : 'Failed to load AI suggestions. Please try again.'}
                {process.env.NODE_ENV === 'development' && (
                  <pre className='text-sm text-gray-600 mt-2'>
                    {JSON.stringify(recError, null, 2)}
                  </pre>
                )}
              </p>
              <button
                onClick={() => refetch()}
                className='mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600'
              >
                Retry
              </button>
            </div>
          )}
          {recommendations.length === 0 && !recError ? (
            <div className='text-center py-8 text-gray-500 text-lg'>
              No AI suggestions available. Try again later!
            </div>
          ) : (
            // <div className='space-y-4'>
            //   {recommendations.map((rec, index) => (
            //     <div key={index} className='border border-gray-200 rounded-md p-4 bg-gray-50'>
            //       <div className='mb-4'>
            //         <label className='block text-sm font-semibold text-gray-700 mb-1'>Recommendation</label>
            //         <input
            //           className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
            //             !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
            //           }`}
            //           value={rec.recommendation}
            //           onChange={(e) => handleUpdateField(index, 'recommendation', e.target.value)}
            //           disabled={!rec.isEditing || approvedIds.includes(index)}
            //           readOnly={!rec.isEditing || approvedIds.includes(index)}
            //         />
            //       </div>
            //       <div className='mb-4'>
            //         <label className='block text-sm font-semibold text-gray-700 mb-1'>Type</label>
            //         <select
            //           className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
            //             !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
            //           }`}
            //           value={rec.type}
            //           onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
            //           disabled={!rec.isEditing || approvedIds.includes(index)}
            //         >
            //           <option value=''>Select type</option>
            //           {validTypes.map((type) => (
            //             <option key={type} value={type}>
            //               {type}
            //             </option>
            //           ))}
            //         </select>
            //       </div>
            //       <div className='mb-4'>
            //         <label className='block text-sm font-semibold text-gray-700 mb-1'>Details</label>
            //         <textarea
            //           className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
            //             !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
            //           }`}
            //           value={rec.details}
            //           onChange={(e) => handleUpdateField(index, 'details', e.target.value)}
            //           rows={4}
            //           disabled={!rec.isEditing || approvedIds.includes(index)}
            //           readOnly={!rec.isEditing || approvedIds.includes(index)}
            //         />
            //       </div>
            //       <div className='mb-4'>
            //         <label className='block text-sm font-semibold text-gray-700 mb-1'>Suggested Changes</label>
            //         <input
            //           className={`w-full p-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
            //             !rec.isEditing && !approvedIds.includes(index) ? 'bg-gray-100 border-0' : 'border border-gray-300'
            //           }`}
            //           value={rec.suggestedChanges}
            //           onChange={(e) => handleUpdateField(index, 'suggestedChanges', e.target.value)}
            //           disabled={!rec.isEditing || approvedIds.includes(index)}
            //           readOnly={!rec.isEditing || approvedIds.includes(index)}
            //         />
            //       </div>
            //       <div className='text-xs text-gray-500 mb-4'>
            //         <strong>Expected Impact:</strong> {rec.expectedImpact}
            //       </div>
            //       <div className='text-xs text-gray-500 mb-4'>
            //         <strong>Priority:</strong> {rec.priority}
            //       </div>
            //       <div className='flex justify-end gap-4'>
            //         {!approvedIds.includes(index) && (
            //           <button
            //             onClick={() => toggleEditMode(index)}
            //             className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
            //               rec.isEditing
            //                 ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
            //                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            //             }`}
            //           >
            //             {rec.isEditing ? 'Save' : 'Edit'}
            //           </button>
            //         )}
            //         <button
            //           onClick={() => handleApprove(rec, index)}
            //           disabled={approvedIds.includes(index) || isCreateLoading}
            //           className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
            //             approvedIds.includes(index)
            //               ? 'bg-gray-400 text-white cursor-not-allowed'
            //               : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
            //           }`}
            //         >
            //           {approvedIds.includes(index) ? 'Approved' : 'Approve'}
            //         </button>
            //       </div>
            //     </div>
            //   ))}
            // </div>

            <div className='space-y-4'>
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-md p-4 bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200'
                >
                  <div className='text-sm font-semibold text-gray-600 mb-2'>
                    Recommendation #{index + 1} - {rec.type} (Priority: {rec.priority})
                  </div>
                  {rec.isEditing ? (
                    <div className='space-y-3'>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1'>
                          Recommendation
                        </label>
                        <input
                          className='w-full p-2 rounded-lg text-sm border border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          value={rec.recommendation}
                          onChange={(e) =>
                            handleUpdateField(index, 'recommendation', e.target.value)
                          }
                          disabled={approvedIds.includes(index)}
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1'>
                          Type
                        </label>
                        <select
                          className='w-full p-2 rounded-lg text-sm border border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          value={rec.type}
                          onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                          disabled={approvedIds.includes(index)}
                        >
                          <option value=''>Select type</option>
                          {validTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1'>
                          Details
                        </label>
                        <textarea
                          className='w-full p-2 rounded-lg text-sm border border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          value={rec.details}
                          onChange={(e) => handleUpdateField(index, 'details', e.target.value)}
                          rows={4}
                          disabled={approvedIds.includes(index)}
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1'>
                          Suggested Changes
                        </label>
                        <input
                          className='w-full p-2 rounded-lg text-sm border border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          value={rec.suggestedChanges}
                          onChange={(e) =>
                            handleUpdateField(index, 'suggestedChanges', e.target.value)
                          }
                          disabled={approvedIds.includes(index)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='font-medium text-gray-900 mb-2'>{rec.recommendation}</div>
                      <div className='text-sm text-gray-600 whitespace-pre-wrap mb-2'>
                        {rec.details}
                      </div>
                      <div className='text-xs text-gray-500 mb-2'>
                        <strong>Expected Impact:</strong> {rec.expectedImpact}
                      </div>
                      {rec.suggestedChanges && (
                        <div className='text-sm text-gray-600 bg-gray-100 p-2 rounded mb-2'>
                          <strong>Suggested Changes:</strong>
                          <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                            {rec.suggestedChanges}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className='flex justify-end gap-4 mt-4'>
                    <button
                      onClick={() => handleApprove(rec, index)}
                      disabled={approvedIds.includes(index) || isCreateLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                        approvedIds.includes(index)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
                      }`}
                    >
                      {approvedIds.includes(index) ? 'Approved' : 'Approve'}
                    </button>
                    {!approvedIds.includes(index) && (
                      <button
                        onClick={() => toggleEditMode(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          rec.isEditing
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {rec.isEditing ? 'Save' : 'Edit'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
          <button
            onClick={handleClose}
            className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
          >
            OK
          </button>
        </div>
        {isEvaluationPopupOpen && projectId && (
          <AiResponseEvaluationPopup
            isOpen={isEvaluationPopupOpen}
            onClose={handleCloseEvaluationPopup}
            aiResponseJson={aiResponseJson}
            projectId={projectId}
            aiFeature='RECOMMENDATION_SUGGESTION'
            onSubmitSuccess={onSubmitSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SuggestedRecommendationsModal;
