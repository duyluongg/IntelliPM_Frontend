import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import './ManualRiskModal.css';

interface ManualRiskModalProps {
  onClose: () => void;
  onSave: (risk: any) => void;
}

const ManualRiskModal: React.FC<ManualRiskModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('Low');
  const [likelihood, setLikelihood] = useState('Low');
  const [type, setType] = useState('');
  const [responsible, setResponsible] = useState('');
  const [responsibleId, setResponsibleId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({ title: false, type: false });

  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');
  const riskTypes = categoryData?.data || [];

  const { data: projectData, isLoading: isProjectLoading } =
    useGetProjectDetailsByKeyQuery(projectKey);

  const projectId = projectData?.data?.id;
  const skipMembers = !projectId;
  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
    skip: skipMembers,
  });

  const assignees =
    membersData?.data?.map((m) => ({
      id: m.accountId,
      fullName: m.fullName,
      userName: m.username,
      picture: m.picture,
    })) || [];

  console.log('Assignees:', assignees);

  const validateFields = () => {
    const newErrors = {
      title: !title.trim(),
      type: !type,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = () => {
    if (validateFields()) {
      const newRisk = {
        title,
        description,
        impactLevel: impact,
        probability: likelihood,
        type,
        responsibleId: responsibleId ? Number(responsibleId) : null,
        //responsibleUserName: responsible,
        dueDate,
      };
      onSave(newRisk);
      onClose();
    }
  };

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
          <div className='manual-risk-form space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
              <div>
                <label className='modal-label block text-sm font-medium text-gray-700 mb-1'>
                  Title
                </label>
              </div>
              <div className='col-span-1 md:col-span-2'>
                <input
                  className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: !e.target.value.trim() });
                  }}
                  placeholder='Enter risk title'
                />
                {errors.title && <p className='text-red-500 text-xs mt-1'>Title is required</p>}
              </div>
              <div>
                <label className='modal-label'>Description</label>
              </div>
              <div className='col-span-1 md:col-span-2'>
                <textarea
                  className='modal-textarea w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder='Enter risk description'
                />
              </div>
              <div>
                <label className='modal-label'>Impact</label>
              </div>
              <div>
                <select
                  className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                >
                  <option value='Low'>Low</option>
                  <option value='Medium'>Medium</option>
                  <option value='High'>High</option>
                </select>
              </div>
              <div>
                <label className='modal-label'>Likelihood</label>
              </div>
              <div>
                <select
                  className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={likelihood}
                  onChange={(e) => setLikelihood(e.target.value)}
                >
                  <option value='Low'>Low</option>
                  <option value='Medium'>Medium</option>
                  <option value='High'>High</option>
                </select>
              </div>
              <div>
                <label className='modal-label'>Type</label>
              </div>
              <div>
                <select
                  className={`modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.type ? 'border-red-500' : ''
                  }`}
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setErrors({ ...errors, type: !e.target.value });
                  }}
                >
                  <option value=''>Select Type</option>
                  {riskTypes.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.type && <p className='text-red-500 text-xs mt-1'>Type is required</p>}
              </div>
              <div>
                <label className='modal-label'>Responsible</label>
              </div>
              <div>
                <select
                  className='modal-select w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                  value={responsibleId}
                  onChange={(e) => {
                    setResponsibleId(e.target.value);
                    console.log('Selected responsibleId:', e.target.value);
                  }}
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
                <label className='modal-label'>Due Date</label>
              </div>
              <div>
                <input
                  type='date'
                  className={`modal-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                  }}
                />
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
