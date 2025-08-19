// import { useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
// import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import './ManualRiskModal.css';

// interface ManualRiskModalProps {
//   onClose: () => void;
//   onSave: (risk: any) => void;
// }

// const ManualRiskModal: React.FC<ManualRiskModalProps> = ({ onClose, onSave }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [impact, setImpact] = useState('Low');
//   const [likelihood, setLikelihood] = useState('Low');
//   const [type, setType] = useState('');
//   const [responsible, setResponsible] = useState('');
//   const [responsibleId, setResponsibleId] = useState<string>('');
//   const [dueDate, setDueDate] = useState('');
//   const [errors, setErrors] = useState({ title: false, type: false });

//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';

//   const { data: categoryData, isLoading: isCategoryLoading } =
//     useGetCategoriesByGroupQuery('risk_type');
//   const riskTypes = categoryData?.data || [];

//   const { data: projectData, isLoading: isProjectLoading } =
//     useGetProjectDetailsByKeyQuery(projectKey);

//   const projectId = projectData?.data?.id;
//   const skipMembers = !projectId;
//   const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
//     skip: skipMembers,
//   });

//   const assignees =
//     membersData?.data?.map((m) => ({
//       id: m.accountId,
//       fullName: m.fullName,
//       userName: m.username,
//       picture: m.picture,
//     })) || [];

//   console.log('Assignees:', assignees);

//   const validateFields = () => {
//     const newErrors = {
//       title: !title.trim(),
//       type: !type,
//     };
//     setErrors(newErrors);
//     return !Object.values(newErrors).some((error) => error);
//   };

//   const handleSubmit = () => {
//     if (validateFields()) {
//       const newRisk = {
//         title,
//         description,
//         impactLevel: impact,
//         probability: likelihood,
//         type,
//         responsibleId: responsibleId ? Number(responsibleId) : null,
//         //responsibleUserName: responsible,
//         dueDate,
//       };
//       onSave(newRisk);
//       onClose();
//     }
//   };

//   return (
//     <div className='manual-risk-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
//       <div className='manual-risk-modal bg-white rounded-lg w-full max-w-md flex flex-col'>
//         <div className='modal-header flex justify-between items-center p-4 border-b border-gray-200'>
//           <h2 className='modal-title text-lg font-bold text-gray-800'>Create New Risk</h2>
//           <button
//             className='modal-close-btn text-gray-500 text-2xl font-bold hover:text-gray-700 transition'
//             onClick={onClose}
//             aria-label='Close modal'
//           >
//             &times;
//           </button>
//         </div>
//         <div className='modal-content flex-1 overflow-y-auto p-4'>
//           <div className='manual-risk-form flex-1 space-y-3'>
//             <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
//                   Title
//                 </label>
//               </div>
//               <div className='col-span-1 md:col-span-2'>
//                 <input
//                   className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
//                     errors.title ? 'border-red-500' : ''
//                   }`}
//                   value={title}
//                   onChange={(e) => {
//                     setTitle(e.target.value);
//                     setErrors({ ...errors, title: !e.target.value.trim() });
//                   }}
//                   placeholder='Enter risk title'
//                 />
//                 {errors.title && <p className='text-red-500 text-xs mt-1'>Title is required</p>}
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Description</label>
//               </div>
//               <div className='col-span-1 md:col-span-2'>
//                 <textarea
//                   className='modal-textarea w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   rows={3}
//                   placeholder='Enter risk description'
//                 />
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Impact</label>
//               </div>
//               <div>
//                 <select
//                   className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
//                   value={impact}
//                   onChange={(e) => setImpact(e.target.value)}
//                 >
//                   <option value='Low'>Low</option>
//                   <option value='Medium'>Medium</option>
//                   <option value='High'>High</option>
//                 </select>
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Likelihood</label>
//               </div>
//               <div>
//                 <select
//                   className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
//                   value={likelihood}
//                   onChange={(e) => setLikelihood(e.target.value)}
//                 >
//                   <option value='Low'>Low</option>
//                   <option value='Medium'>Medium</option>
//                   <option value='High'>High</option>
//                 </select>
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Type</label>
//               </div>
//               <div>
//                 <select
//                   className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
//                     errors.type ? 'border-red-500' : ''
//                   }`}
//                   value={type}
//                   onChange={(e) => {
//                     setType(e.target.value);
//                     setErrors({ ...errors, type: !e.target.value });
//                   }}
//                 >
//                   <option value=''>Select Type</option>
//                   {riskTypes.map((item) => (
//                     <option key={item.id} value={item.name}>
//                       {item.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.type && <p className='text-red-500 text-xs mt-1'>Type is required</p>}
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Responsible</label>
//               </div>
//               <div>
//                 <select
//                   className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
//                   value={responsibleId}
//                   onChange={(e) => {
//                     setResponsibleId(e.target.value);
//                     console.log('Selected responsibleId:', e.target.value);
//                   }}
//                 >
//                   <option value=''>Select a user</option>
//                   {assignees.map((user) => (
//                     <option key={user.id} value={user.id}>
//                       {user.fullName || user.userName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>Due Date</label>
//               </div>
//               <div>
//                 <input
//                   type='date'
//                   className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
//                   value={dueDate}
//                   onChange={(e) => {
//                     setDueDate(e.target.value);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className='manual-risk-actions flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50'>
//           <button
//             className='cancel-btn px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm'
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className='save-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm'
//             onClick={handleSubmit}
//             disabled={Object.values(errors).some((error) => error)}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );

// };

// export default ManualRiskModal;


import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
import './ManualRiskModal.css';

interface ManualRiskModalProps {
  onClose: () => void;
  onSave: (risk: any) => void;
}

const ManualRiskModal: React.FC<ManualRiskModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [likelihood, setLikelihood] = useState('');
  const [type, setType] = useState('');
  const [responsibleId, setResponsibleId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [riskScope, setRiskScope] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    riskScope: '',
    type: '',
    impact: '',
    likelihood: '',
    dueDate: '',
  });

  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  // Fetch dynamic categories
  const { data: typeData, isLoading: isTypeLoading } = useGetCategoriesByGroupQuery('risk_type');
  const riskTypes = typeData?.data || [];

  const { data: impactData, isLoading: isImpactLoading } = useGetCategoriesByGroupQuery('risk_impact_level');
  const impactLevels = impactData?.data || [];

  const { data: likelihoodData, isLoading: isLikelihoodLoading } = useGetCategoriesByGroupQuery('risk_probability_level');
  const likelihoods = likelihoodData?.data || [];

  const { data: scopeData, isLoading: isScopeLoading } = useGetCategoriesByGroupQuery('risk_scope');
  const scopeTypes = scopeData?.data || [];

  const { data: projectData, isLoading: isProjectLoading } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectData?.data?.id;
  const projectEndDate = projectData?.data?.endDate; 
  const skipMembers = !projectId;
  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, { skip: skipMembers });

  // Fetch dynamic max length for title
  const { data: titleLengthConfig } = useGetByConfigKeyQuery('risk_title_length');
  const maxTitleLength = titleLengthConfig?.data?.valueConfig ? parseInt(titleLengthConfig.data.valueConfig, 10) : 255;

  // const assignees =
  //   membersData?.data?.map((m) => ({
  //     id: m.accountId,
  //     fullName: m.fullName,
  //     userName: m.username,
  //     picture: m.picture,
  //   })) || [];

      // Filter out members with "CLIENT" position
  const assignees = membersData?.data
    ?.filter((member) => !member.projectPositions.some((position) => position.position === 'CLIENT'))
    .map((m) => ({
      id: m.accountId,
      fullName: m.fullName,
      userName: m.username,
      picture: m.picture,
    })) || [];

  const validateFields = () => {
    const newErrors = {
      title: !title.trim() ? 'Title is required' : title.length > maxTitleLength ? `Title exceeds maximum length of ${maxTitleLength} characters` : '',
      riskScope: !riskScope ? 'Risk scope is required' : !scopeTypes.some((s) => s.name === riskScope) ? 'Invalid risk scope' : '',
      type: !type ? 'Type is required' : !riskTypes.some((t) => t.name === type) ? 'Invalid risk type' : '',
      impact: !impact ? 'Impact is required' : !impactLevels.some((i) => i.name === impact) ? 'Invalid impact level' : '',
      likelihood: !likelihood ? 'Likelihood is required' : !likelihoods.some((l) => l.name === likelihood) ? 'Invalid likelihood' : '',
      dueDate: dueDate
        ? (new Date(dueDate) < new Date() ? 'Due date cannot be in the past' : projectEndDate && new Date(dueDate) > new Date(projectEndDate) ? 'Due date cannot exceed project end date' : '')
        : '',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = () => {
    if (validateFields()) {
      const newRisk = {
        projectKey,
        title,
        description,
        impactLevel: impact,
        probability: likelihood,
        type,
        responsibleId: responsibleId ? Number(responsibleId) : null,
        dueDate,
        riskScope,
      };
      onSave(newRisk);
      onClose();
    }
  };

  if (isTypeLoading || isImpactLoading || isLikelihoodLoading || isScopeLoading || isProjectLoading) {
    return (
      <div className='manual-risk-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='manual-risk-modal bg-white rounded-lg w-full max-w-md flex flex-col'>
          <div className='modal-header flex justify-between items-center p-4 border-b border-gray-200'>
            <h2 className='modal-title text-lg font-bold text-gray-800'>Create New Risk</h2>
            <button
              className='modal-close-btn text-gray-500 text-2xl font-bold hover:text-gray-700 transition'
              onClick={onClose}
              aria-label='Close modal'
            >
              &times;
            </button>
          </div>
          <div className='modal-content flex-1 overflow-y-auto p-4'>
            <div className='manual-risk-form flex-1 space-y-3'>
              <p className='text-gray-500 text-sm'>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='manual-risk-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='manual-risk-modal bg-white rounded-lg w-full max-w-md flex flex-col'>
        <div className='modal-header flex justify-between items-center p-4 border-b border-gray-200'>
          <h2 className='modal-title text-lg font-bold text-gray-800'>Create New Risk</h2>
          <button
            className='modal-close-btn text-gray-500 text-2xl font-bold hover:text-gray-700 transition'
            onClick={onClose}
            aria-label='Close modal'
          >
            &times;
          </button>
        </div>
        <div className='modal-content flex-1 overflow-y-auto p-4'>
          <div className='manual-risk-form flex-1 space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
              <div className='col-span-full'>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Title
                </label>
              </div>
              <div className='col-span-full'>
                <input
                  className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({
                      ...errors,
                      title: e.target.value.length > maxTitleLength
                        ? `Title exceeds maximum length of ${maxTitleLength} characters`
                        : !e.target.value.trim()
                        ? 'Title is required'
                        : '',
                    });
                  }}
                  placeholder='Enter risk title'
                />
                {errors.title && <p className='text-red-500 text-xs mt-1'>{errors.title}</p>}
              </div>
              <div className='col-span-full'>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
              </div>
              <div className='col-span-full'>
                <textarea
                  className='modal-textarea w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder='Enter risk description'
                />
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Risk Scope
                </label>
              </div>
              <div>
                <select
                  className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.riskScope ? 'border-red-500' : ''
                  }`}
                  value={riskScope}
                  onChange={(e) => {
                    setRiskScope(e.target.value);
                    setErrors({
                      ...errors,
                      riskScope: !e.target.value
                        ? 'Risk scope is required'
                        : !scopeTypes.some((s) => s.name === e.target.value)
                        ? 'Invalid risk scope'
                        : '',
                    });
                  }}
                >
                  <option value=''>Select Risk Scope</option>
                  {scopeTypes.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.label || item.name}
                    </option>
                  ))}
                </select>
                {errors.riskScope && <p className='text-red-500 text-xs mt-1'>{errors.riskScope}</p>}
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Impact
                </label>
              </div>
              <div>
                <select
                  className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.impact ? 'border-red-500' : ''
                  }`}
                  value={impact}
                  onChange={(e) => {
                    setImpact(e.target.value);
                    setErrors({
                      ...errors,
                      impact: !e.target.value
                        ? 'Impact is required'
                        : !impactLevels.some((i) => i.name === e.target.value)
                        ? 'Invalid impact level'
                        : '',
                    });
                  }}
                >
                  <option value=''>Select Impact</option>
                  {impactLevels.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.label || item.name}
                    </option>
                  ))}
                </select>
                {errors.impact && <p className='text-red-500 text-xs mt-1'>{errors.impact}</p>}
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Likelihood
                </label>
              </div>
              <div>
                <select
                  className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.likelihood ? 'border-red-500' : ''
                  }`}
                  value={likelihood}
                  onChange={(e) => {
                    setLikelihood(e.target.value);
                    setErrors({
                      ...errors,
                      likelihood: !e.target.value
                        ? 'Likelihood is required'
                        : !likelihoods.some((l) => l.name === e.target.value)
                        ? 'Invalid likelihood'
                        : '',
                    });
                  }}
                >
                  <option value=''>Select Likelihood</option>
                  {likelihoods.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.label || item.name}
                    </option>
                  ))}
                </select>
                {errors.likelihood && <p className='text-red-500 text-xs mt-1'>{errors.likelihood}</p>}
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Type
                </label>
              </div>
              <div>
                <select
                  className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.type ? 'border-red-500' : ''
                  }`}
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setErrors({
                      ...errors,
                      type: !e.target.value
                        ? 'Type is required'
                        : !riskTypes.some((t) => t.name === e.target.value)
                        ? 'Invalid risk type'
                        : '',
                    });
                  }}
                >
                  <option value=''>Select Type</option>
                  {riskTypes.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.label || item.name}
                    </option>
                  ))}
                </select>
                {errors.type && <p className='text-red-500 text-xs mt-1'>{errors.type}</p>}
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Responsible
                </label>
              </div>
              <div>
                <select
                  className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={responsibleId}
                  onChange={(e) => setResponsibleId(e.target.value)}
                >
                  <option value=''>Select a user</option>
                  {assignees.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.userName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Due Date
                </label>
              </div>
              <div>
                <input
                  type='date'
                  className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.dueDate ? 'border-red-500' : ''
                  }`}
                  value={dueDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const today = new Date().toISOString().split('T')[0];
                    setDueDate(newDate);
                    setErrors({
                      ...errors,
                      dueDate: newDate && (new Date(newDate) < new Date(today) ? 'Due date cannot be in the past' : projectEndDate && new Date(newDate) > new Date(projectEndDate) ? 'Due date cannot exceed project end date' : ''),
                    });
                  }}
                />
                {errors.dueDate && <p className='text-red-500 text-xs mt-1'>{errors.dueDate}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className='manual-risk-actions flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50'>
          <button
            className='cancel-btn px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm'
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className='save-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm'
            onClick={handleSubmit}
            disabled={Object.values(errors).some((error) => error)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualRiskModal;