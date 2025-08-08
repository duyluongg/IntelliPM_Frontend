// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import './SuggestedRisksModal.css';
// import {
//   useGetAiSuggestedRisksQuery,
//   useLazyGetAiSuggestedRisksQuery,
// } from '../../../services/riskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';

// interface SuggestedRisk {
//   id: number;
//   title: string;
//   description: string;
//   impactLevel: 'Low' | 'Medium' | 'High';
//   probability: 'Low' | 'Medium' | 'High';
//   type: string;
//   mitigationPlan: string;
//   contingencyPlan: string;
//   approved?: boolean;
// }

// interface Props {
//   onClose: () => void;
//   onApprove: (risk: any) => void;
//   // onApprove: (risk: SuggestedRisk) => void;
// }

// const SuggestedRisksModal: React.FC<Props> = ({ onClose, onApprove }) => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';

//   const [isReloading, setIsReloading] = useState(false);

//   const [trigger, { data, isLoading }] = useLazyGetAiSuggestedRisksQuery();
//   const [suggestedRisks, setSuggestedRisks] = useState<SuggestedRisk[]>([]);
//   const { data: categoryData, isLoading: isCategoryLoading } =
//     useGetCategoriesByGroupQuery('risk_type');
//   const riskTypes = categoryData?.data || [];

//   useEffect(() => {
//     trigger(projectKey);
//   }, [projectKey]);

//   const handleReload = async () => {
//     setIsReloading(true);
//     await trigger(projectKey).unwrap();
//     setIsReloading(false);
//   };

//   useEffect(() => {
//     if (data?.data) {
//       const mapped = data.data.map((item, idx) => ({
//         id: idx + 1,
//         title: item.title,
//         description: item.description,
//         impactLevel: item.impactLevel as 'Low' | 'Medium' | 'High',
//         probability: item.probability as 'Low' | 'Medium' | 'High',
//         type: item.type,
//         mitigationPlan: item.mitigationPlan,
//         contingencyPlan: item.contingencyPlan,
//       }));
//       setSuggestedRisks(mapped);
//     }
//   }, [data]);

//   const handleUpdateField = <K extends keyof SuggestedRisk>(
//     index: number,
//     field: K,
//     value: SuggestedRisk[K]
//   ) => {
//     const updated = [...suggestedRisks];
//     updated[index][field] = value;
//     setSuggestedRisks(updated);
//   };

//   // const handleApprove = (risk: any) => {
//   //   onApprove({
//   //     title: risk.title,
//   //     description: risk.description,
//   //     impactLevel: risk.impactLevel,
//   //     probability: risk.probability,
//   //     type: risk.type,
//   //     mitigationPlan: risk.mitigationPlan,
//   //     contingencyPlan: risk.contingencyPlan,
//   //   });
//   // };

//   const handleApprove = (risk: SuggestedRisk, index: number) => {
//     onApprove({
//       title: risk.title,
//       description: risk.description,
//       impactLevel: risk.impactLevel,
//       probability: risk.probability,
//       type: risk.type,
//       mitigationPlan: risk.mitigationPlan,
//       contingencyPlan: risk.contingencyPlan,
//     });

//     const updated = [...suggestedRisks];
//     updated[index].approved = true; // ✅ đánh dấu đã approved
//     setSuggestedRisks(updated);
//   };

//   if (isLoading || isReloading) {
//     return (
//       <div className='suggested-modal-overlay'>
//         <div className='suggested-modal'>
//           <h2 className='modal-title'>AI Suggested Risks</h2>
//           <div className='loading-container'>
//             <div className='spinner' />
//             <p>Loading AI suggestions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='suggested-modal-overlay'>
//       <div className='suggested-modal'>
//         <div className='modal-header'>
//           <h2 className='modal-title'>AI Suggested Risks</h2>
//           <button className='refresh-btn' onClick={handleReload} disabled={isReloading}>
//             ↻ Gọi lại AI
//           </button>
//         </div>
//         <div className='suggested-risk-list'>
//           {suggestedRisks.map((risk, index) => (
//             <div key={risk.id} className='suggested-risk-card'>
//               <div>
//                 <label>Title</label>
//                 <input
//                   className='modal-input'
//                   value={risk.title}
//                   onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label>Description</label>
//                 <textarea
//                   className='modal-textarea'
//                   value={risk.description}
//                   onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
//                 />
//               </div>

//               <div className='grid-2'>
//                 <div>
//                   <label>Impact</label>
//                   <select
//                     value={risk.impactLevel}
//                     onChange={(e) =>
//                       handleUpdateField(
//                         index,
//                         'impactLevel',
//                         e.target.value as SuggestedRisk['impactLevel']
//                       )
//                     }
//                   >
//                     <option value='Low'>Low</option>
//                     <option value='Medium'>Medium</option>
//                     <option value='High'>High</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label>Likelihood</label>
//                   <select
//                     value={risk.probability}
//                     onChange={(e) =>
//                       handleUpdateField(
//                         index,
//                         'probability',
//                         e.target.value as SuggestedRisk['probability']
//                       )
//                     }
//                   >
//                     <option value='Low'>Low</option>
//                     <option value='Medium'>Medium</option>
//                     <option value='High'>High</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label>Type</label>
//                 {/* <input
//                   className='modal-input'
//                   value={risk.type}
//                   onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
//                 /> */}
//                 <select
//                   className='modal-input'
//                   value={risk.type}
//                   style={{ cursor: 'pointer' }}
//                   onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
//                 >
//                   {riskTypes.map((type: any) => (
//                     <option key={type.id} value={type.name}>
//                       {type.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label>Mitigation Plan</label>
//                 <textarea
//                   className='modal-textarea'
//                   value={risk.mitigationPlan}
//                   onChange={(e) => handleUpdateField(index, 'mitigationPlan', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label>Contingency Plan</label>
//                 <textarea
//                   className='modal-textarea'
//                   value={risk.contingencyPlan}
//                   onChange={(e) => handleUpdateField(index, 'contingencyPlan', e.target.value)}
//                 />
//               </div>

//               <div className='approve-btn-wrapper'>
//                 {/* <button className='approve-btn' onClick={() => handleApprove(risk)}>
//                   ✅ Approve
//                 </button> */}
//                 <button
//                   className='approve-btn'
//                   onClick={() => handleApprove(risk, index)}
//                   disabled={risk.approved}
//                 >
//                   {risk.approved ? '✔ Approved' : '✅ Approve'}
//                 </button>

//               </div>
//             </div>
//           ))}
//         </div>

//         <div className='modal-actions'>
//           <button className='btn btn-secondary' onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuggestedRisksModal;

// import { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import {
//   useLazyGetAiSuggestedRisksQuery,
// } from '../../../services/riskApi';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import './SuggestedRisksModal.css';

// interface SuggestedRisk {
//   id: number;
//   title: string;
//   description: string;
//   impactLevel: 'Low' | 'Medium' | 'High';
//   probability: 'Low' | 'Medium' | 'High';
//   type: string;
//   mitigationPlan: string;
//   contingencyPlan: string;
//   approved?: boolean;
//   isEditing?: boolean;
// }

// interface Props {
//   onClose: () => void;
//   onApprove: (risk: any) => void;
// }

// const SuggestedRisksModal: React.FC<Props> = ({ onClose, onApprove }) => {
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   const [isReloading, setIsReloading] = useState(false);
//   const [trigger, { data, isLoading }] = useLazyGetAiSuggestedRisksQuery();
//   const [suggestedRisks, setSuggestedRisks] = useState<SuggestedRisk[]>([]);
//   const { data: categoryData, isLoading: isCategoryLoading } =
//     useGetCategoriesByGroupQuery('risk_type');
//   const riskTypes = categoryData?.data || [];

//   useEffect(() => {
//     trigger(projectKey);
//   }, [projectKey, trigger]);

//   useEffect(() => {
//     if (data?.data) {
//       const mapped = data.data.map((item, idx) => ({
//         id: idx + 1,
//         title: item.title,
//         description: item.description,
//         impactLevel: item.impactLevel as 'Low' | 'Medium' | 'High',
//         probability: item.probability as 'Low' | 'Medium' | 'High',
//         type: item.type,
//         mitigationPlan: item.mitigationPlan,
//         contingencyPlan: item.contingencyPlan,
//         approved: false,
//         isEditing: false,
//       }));
//       setSuggestedRisks(mapped);
//     }
//   }, [data]);

//   const handleReload = async () => {
//     setIsReloading(true);
//     await trigger(projectKey).unwrap();
//     setIsReloading(false);
//   };

//   const handleUpdateField = <K extends keyof SuggestedRisk>(
//     index: number,
//     field: K,
//     value: SuggestedRisk[K]
//   ) => {
//     const updated = [...suggestedRisks];
//     updated[index][field] = value;
//     setSuggestedRisks(updated);
//   };

//   const toggleEditMode = (index: number) => {
//     const updated = [...suggestedRisks];
//     updated[index].isEditing = !updated[index].isEditing;
//     setSuggestedRisks(updated);
//   };

//   const handleApprove = (risk: SuggestedRisk, index: number) => {
//     onApprove({
//       title: risk.title,
//       description: risk.description,
//       impactLevel: risk.impactLevel,
//       probability: risk.probability,
//       type: risk.type,
//       mitigationPlan: risk.mitigationPlan,
//       contingencyPlan: risk.contingencyPlan,
//     });
//     const updated = [...suggestedRisks];
//     updated[index].approved = true;
//     updated[index].isEditing = false; // Disable editing after approval
//     setSuggestedRisks(updated);
//   };

//   if (isLoading || isReloading || isCategoryLoading) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">AI Suggested Risks</h2>
//           <div className="flex items-center justify-center">
//             <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
//             <p className="ml-4 text-gray-600">Loading AI suggestions...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-bold text-gray-800">AI Suggested Risks</h2>
//           <div className="space-x-4">
//             <button
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//               onClick={handleReload}
//               disabled={isReloading}
//             >
//               ↻ Refresh AI Suggestions
//             </button>
//             <button
//               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
//               onClick={onClose}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//         <div className="space-y-4">
//           {suggestedRisks.map((risk, index) => (
//             <div
//               key={risk.id}
//               className="border border-gray-200 rounded-md p-4 bg-gray-50"
//             >
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Title</label>
//                 <input
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={risk.title}
//                   onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
//                   disabled={!risk.isEditing || risk.approved}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={risk.description}
//                   onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
//                   rows={3}
//                   disabled={!risk.isEditing || risk.approved}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Impact</label>
//                   <select
//                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={risk.impactLevel}
//                     onChange={(e) =>
//                       handleUpdateField(
//                         index,
//                         'impactLevel',
//                         e.target.value as SuggestedRisk['impactLevel']
//                       )
//                     }
//                     disabled={!risk.isEditing || risk.approved}
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Likelihood</label>
//                   <select
//                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={risk.probability}
//                     onChange={(e) =>
//                       handleUpdateField(
//                         index,
//                         'probability',
//                         e.target.value as SuggestedRisk['probability']
//                       )
//                     }
//                     disabled={!risk.isEditing || risk.approved}
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Type</label>
//                 <select
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={risk.type}
//                   onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
//                   disabled={!risk.isEditing || risk.approved}
//                 >
//                   {riskTypes.map((type: any) => (
//                     <option key={type.id} value={type.name}>
//                       {type.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Mitigation Plan</label>
//                 <textarea
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={risk.mitigationPlan}
//                   onChange={(e) => handleUpdateField(index, 'mitigationPlan', e.target.value)}
//                   rows={3}
//                   disabled={!risk.isEditing || risk.approved}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Contingency Plan</label>
//                 <textarea
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={risk.contingencyPlan}
//                   onChange={(e) => handleUpdateField(index, 'contingencyPlan', e.target.value)}
//                   rows={3}
//                   disabled={!risk.isEditing || risk.approved}
//                 />
//               </div>
//               <div className="flex justify-end space-x-4">
//                 {!risk.approved && (
//                   <button
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//                     onClick={() => toggleEditMode(index)}
//                   >
//                     {risk.isEditing ? 'Save Edit' : 'Edit'}
//                   </button>
//                 )}
//                 <button
//                   className={`px-4 py-2 rounded-md transition ${
//                     risk.approved
//                       ? 'bg-green-100 text-green-700 cursor-not-allowed'
//                       : 'bg-green-600 text-white hover:bg-green-700'
//                   }`}
//                   onClick={() => handleApprove(risk, index)}
//                   disabled={risk.approved}
//                 >
//                   {risk.approved ? '✔ Approved' : '✅ Approve'}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuggestedRisksModal;

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLazyGetAiSuggestedRisksQuery } from '../../../services/riskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import './SuggestedRisksModal.css';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';

interface SuggestedRisk {
  id: number;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  type: string;
  mitigationPlan: string;
  contingencyPlan: string;
  approved?: boolean;
  isEditing?: boolean;
}

interface Props {
  onClose: () => void;
  onApprove: (risk: any) => void;
  projectId?: number;
}

const SuggestedRisksModal: React.FC<Props> = ({ onClose, onApprove, projectId }) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [isReloading, setIsReloading] = useState(false);
  const [trigger, { data, isLoading }] = useLazyGetAiSuggestedRisksQuery();
  const [suggestedRisks, setSuggestedRisks] = useState<SuggestedRisk[]>([]);
  const [aiResponseJson, setAiResponseJson] = useState<any>('');
  // const [aiResponseJson, setAiResponseJson] = useState<string>('');
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');
  const riskTypes = categoryData?.data || [];

  useEffect(() => {
    trigger(projectKey);
  }, [projectKey, trigger]);

  useEffect(() => {
    if (data?.data) {
      // setAiResponseJson(data.data);
      const mapped = data.data.map((item, idx) => ({
        id: idx + 1,
        title: item.title,
        description: item.description,
        impactLevel: item.impactLevel as 'Low' | 'Medium' | 'High',
        probability: item.probability as 'Low' | 'Medium' | 'High',
        type: item.type,
        mitigationPlan: item.mitigationPlan,
        contingencyPlan: item.contingencyPlan,
        approved: false,
        isEditing: false,
      }));
      setSuggestedRisks(mapped);
    }
  }, [data]);

  const handleReload = async () => {
    setIsReloading(true);
    await trigger(projectKey).unwrap();
    setIsReloading(false);
  };

  const handleUpdateField = <K extends keyof SuggestedRisk>(
    index: number,
    field: K,
    value: SuggestedRisk[K]
  ) => {
    const updated = [...suggestedRisks];
    updated[index][field] = value;
    setSuggestedRisks(updated);
  };

  const toggleEditMode = (index: number) => {
    const updated = [...suggestedRisks];
    updated[index].isEditing = !updated[index].isEditing;
    setSuggestedRisks(updated);
  };

  const handleApprove = (risk: SuggestedRisk, index: number) => {
    onApprove({
      title: risk.title,
      description: risk.description,
      impactLevel: risk.impactLevel,
      probability: risk.probability,
      type: risk.type,
      mitigationPlan: risk.mitigationPlan,
      contingencyPlan: risk.contingencyPlan,
    });
    const updated = [...suggestedRisks];
    updated[index].approved = true;
    updated[index].isEditing = false; 
    setSuggestedRisks(updated);
  };

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
  };

  const handleEvaluationSubmitSuccess = () => {
    setIsEvaluationPopupOpen(false);
    onClose();
  };

  const handleClose = () => {
    const responseJson = JSON.stringify(data?.data);
    setAiResponseJson(responseJson);
    setIsEvaluationPopupOpen(true);
  };

  if (isLoading || isReloading || isCategoryLoading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>AI Suggested Risks</h2>
          <div className='flex items-center justify-center'>
            <div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full'></div>
            <p className='ml-4 text-gray-600'>Loading AI suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-800'>AI Suggested Risks</h2>
          <div className='space-x-4'>
            <button
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
              onClick={handleReload}
              disabled={isReloading}
            >
              ↻ Refresh AI Suggestions
            </button>
            <button
              className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition'
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
        <div className='space-y-4'>
          {suggestedRisks.map((risk, index) => (
            <div key={risk.id} className='border border-gray-200 rounded-md p-4 bg-gray-50'>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>Title</label>
                <input
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !risk.isEditing && !risk.approved
                      ? 'bg-gray-100 border-0'
                      : 'border border-gray-300'
                  }`}
                  value={risk.title}
                  onChange={(e) => handleUpdateField(index, 'title', e.target.value)}
                  disabled={!risk.isEditing || risk.approved}
                  readOnly={!risk.isEditing || risk.approved}
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>Description</label>
                <textarea
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !risk.isEditing && !risk.approved
                      ? 'bg-gray-100 border-0'
                      : 'border border-gray-300'
                  }`}
                  value={risk.description}
                  onChange={(e) => handleUpdateField(index, 'description', e.target.value)}
                  rows={3}
                  disabled={!risk.isEditing || risk.approved}
                  readOnly={!risk.isEditing || risk.approved}
                />
              </div>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Impact</label>
                  <select
                    className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !risk.isEditing && !risk.approved
                        ? 'bg-gray-100 border-0'
                        : 'border border-gray-300'
                    }`}
                    value={risk.impactLevel}
                    onChange={(e) =>
                      handleUpdateField(
                        index,
                        'impactLevel',
                        e.target.value as SuggestedRisk['impactLevel']
                      )
                    }
                    disabled={!risk.isEditing || risk.approved}
                  >
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Likelihood</label>
                  <select
                    className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !risk.isEditing && !risk.approved
                        ? 'bg-gray-100 border-0'
                        : 'border border-gray-300'
                    }`}
                    value={risk.probability}
                    onChange={(e) =>
                      handleUpdateField(
                        index,
                        'probability',
                        e.target.value as SuggestedRisk['probability']
                      )
                    }
                    disabled={!risk.isEditing || risk.approved}
                  >
                    <option value='Low'>Low</option>
                    <option value='Medium'>Medium</option>
                    <option value='High'>High</option>
                  </select>
                </div>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>Type</label>
                <select
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !risk.isEditing && !risk.approved
                      ? 'bg-gray-100 border-0'
                      : 'border border-gray-300'
                  }`}
                  value={risk.type}
                  onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                  disabled={!risk.isEditing || risk.approved}
                >
                  {riskTypes.map((type: any) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>Mitigation Plan</label>
                <textarea
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !risk.isEditing && !risk.approved
                      ? 'bg-gray-100 border-0'
                      : 'border border-gray-300'
                  }`}
                  value={risk.mitigationPlan}
                  onChange={(e) => handleUpdateField(index, 'mitigationPlan', e.target.value)}
                  rows={3}
                  disabled={!risk.isEditing || risk.approved}
                  readOnly={!risk.isEditing || risk.approved}
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>Contingency Plan</label>
                <textarea
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !risk.isEditing && !risk.approved
                      ? 'bg-gray-100 border-0'
                      : 'border border-gray-300'
                  }`}
                  value={risk.contingencyPlan}
                  onChange={(e) => handleUpdateField(index, 'contingencyPlan', e.target.value)}
                  rows={3}
                  disabled={!risk.isEditing || risk.approved}
                  readOnly={!risk.isEditing || risk.approved}
                />
              </div>
              <div className='flex justify-end space-x-4'>
                {!risk.approved && (
                  <button
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
                    onClick={() => toggleEditMode(index)}
                  >
                    {risk.isEditing ? 'Save Edit' : 'Edit'}
                  </button>
                )}
                <button
                  className={`px-4 py-2 rounded-md transition ${
                    risk.approved
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  onClick={() => handleApprove(risk, index)}
                  disabled={risk.approved}
                >
                  {risk.approved ? '✔ Approved' : '✅ Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {isEvaluationPopupOpen && projectId && (
          <AiResponseEvaluationPopup
            isOpen={isEvaluationPopupOpen}
            onClose={handleCloseEvaluationPopup}
            aiResponseJson={aiResponseJson}
            projectId={projectId}
            aiFeature='RISK_PREDICTION'
            onSubmitSuccess={handleEvaluationSubmitSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default SuggestedRisksModal;
