import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ManualRiskModal.css';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';

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
  const [dueDate, setDueDate] = useState('');

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

  const handleSubmit = () => {
    const newRisk = {
      title,
      description,
      impactLevel: impact,
      probability: likelihood,
      type,
      responsibleUserName: responsible,
      dueDate,
    };
    onSave(newRisk);
    onClose();
  };

  return (
    <div className='manual-risk-modal-overlay'>
      <div className='manual-risk-modal'>
        <h2 className='modal-title'>Create New Risk</h2>

        <div className='manual-risk-form'>
          <label className='modal-label'>Title</label>
          <input className='modal-input' value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className='modal-label'>Description</label>
          <textarea
            className='modal-textarea'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className='modal-label'>Impact</label>
          <select
            className='modal-select'
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
          >
            <option value='Low'>Low</option>
            <option value='Medium'>Medium</option>
            <option value='High'>High</option>
          </select>

          <label className='modal-label'>Likelihood</label>
          <select
            className='modal-select'
            value={likelihood}
            onChange={(e) => setLikelihood(e.target.value)}
          >
            <option value='Low'>Low</option>
            <option value='Medium'>Medium</option>
            <option value='High'>High</option>
          </select>

          {/* <label className='modal-label'>Type</label>
          <input className='modal-input' value={type} onChange={(e) => setType(e.target.value)} /> */}

          <label className='modal-label'>Type</label>
          <select className='modal-input' value={type} onChange={(e) => setType(e.target.value)}>
            {riskTypes.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          {/* <label className='modal-label'>Responsible (username)</label>
          <input
            className='modal-input'
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          /> */}

          <label className='modal-label'>Responsible</label>
          <select
            className='modal-input'
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          >
            <option value=''>Select a user</option>
            {assignees.map((user) => (
              <option key={user.id} value={user.userName}>
                {user.fullName || user.userName}
              </option>
            ))}
          </select>

          <label className='modal-label'>Due Date</label>
          <input
            type='date'
            className='modal-input'
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className='manual-risk-actions'>
          <button className='cancel-btn' onClick={onClose}>
            Cancel
          </button>
          <button className='save-btn' onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualRiskModal;
