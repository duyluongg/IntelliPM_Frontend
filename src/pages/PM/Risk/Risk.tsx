import { useSearchParams } from 'react-router-dom';
import { useGetRisksByProjectKeyQuery, useCreateRiskMutation } from '../../../services/riskApi';
import './Risk.css';
import { Check } from 'lucide-react';
import { useState } from 'react';
import RiskDetail from './RiskDetail';
import ManualRiskModal from './ManualRiskModal';
import SuggestedRisksModal from './SuggestedRisksModal';

const Risk = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data, isLoading, error } = useGetRisksByProjectKeyQuery(projectKey);
  const [createRisk] = useCreateRiskMutation();
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);

  if (isLoading) return <div className='text-sm text-gray-500'>Loading risks...</div>;
  if (error || !data?.data) return <div>Error loading risks</div>;

  const risks = data.data;

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  function getDueClass(dueDate: string): string {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate === today) return 'due-today';
    if (dueDate < today) return 'due-warning';
    return '';
  }

  // Component Severity
  const Severity: React.FC<{ status: string }> = ({ status }) => {
    const formatStatusForDisplay = (status: string) => {
      switch (status.toLowerCase()) {
        case 'high':
          return 'HIGH';
        case 'medium':
          return 'MEDIUM';
        case 'low':
          return 'LOW';
        default:
          return status;
      }
    };

    const getStatusStyle = () => {
      switch (status.toLowerCase()) {
        case 'high':
          return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
        case 'medium':
          return { backgroundColor: '#FEF3C7', color: '#D97706' };
        case 'low':
          return { backgroundColor: '#D1FAE5', color: '#047857' };
        default:
          return { backgroundColor: '#E5E7EB', color: '#6B7280' };
      }
    };

    return (
      <div className='status-container'>
        <span className='status-line' style={getStatusStyle()}>
          {formatStatusForDisplay(status)}
        </span>
      </div>
    );
  };

  type Assignee = {
    fullName: string;
    userName: string;
    picture?: string;
    avatarColor: string;
    initials: string;
  };

  const Avatar = ({ person }: { person: Assignee }) =>
    person.fullName && person.fullName !== 'Unknown' ? (
      <div className='reporter'>
        {person.picture ? (
          <img
            src={person.picture}
            alt={`${person.fullName}'s avatar`}
            className='avatar'
            style={{ backgroundColor: person.avatarColor }}
          />
        ) : (
          <button
            className='w-8 h-8 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full text-xs'
            title={person.fullName}
          >
            {person.userName.slice(0, 2).toUpperCase()}
          </button>
        )}
        <span className='reporter-name'>{person.fullName}</span>
      </div>
    ) : null;

  // const handleToggleRiskStatus = () => {
  //   console.log('Toggling risk status:');
  // };

  const RiskStatusToggle = () => {
    const [clicked, setClicked] = useState(false);

    return (
      <button
        className={`risk-status-toggle ${clicked ? 'clicked' : ''}`}
        onClick={() => setClicked(!clicked)}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    );
  };

  const openCreateRiskModal = () => {
    console.log('Open create risk modal');
    setShowCreateModal(true);
  };

  const closeCreateRiskModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveRisk = async (newRisk: any) => {
    try {
      const request = {
        projectKey: projectKey,
        responsibleId: null,
        taskId: null,
        riskScope: 'GENERAL',
        title: newRisk.title,
        description: newRisk.description,
        status: 'OPEN',
        type: newRisk.type,
        generatedBy: 'Manual',
        probability: newRisk.probability || newRisk.likelihood,
        impactLevel: newRisk.impactLevel || newRisk.impact,
        severityLevel: 'Moderate',
        isApproved: true,
        dueDate: newRisk.dueDate + 'T00:00:00Z',
      };

      const res = await createRisk(request).unwrap();
      console.log('Created risk:', res.data);
    } catch (error) {
      console.error('Failed to create risk:', error);
    }
  };

  const openSuggestedRisks = () => {
    setShowSuggestedModal(true);
  };

  const closeSuggestedRisks = () => {
    setShowSuggestedModal(false);
  };

  const handleApproveSuggestedRisk = (risk: any) => {
    console.log('Approved suggested risk:', risk);
    // TODO: Gửi request API để lưu risk mới nếu cần
  };

  return (
    <div className='risk-page-wrapper'>
      <div className='risk-toolbar'>
        <button className='btn btn-primary' onClick={() => openCreateRiskModal()}>
          + Add Risk
        </button>
        <button className='btn btn-secondary' onClick={() => openSuggestedRisks()}>
          🤖 Suggest by AI
        </button>
      </div>

      <div className='risk-table-container'>
        <table className='risk-table'>
          <thead>
            <tr>
              <th>Status</th>
              <th>Risk Name</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Responsible</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id} onClick={() => setSelectedRisk(risk)} style={{ cursor: 'pointer' }}>
                <td>
                  <RiskStatusToggle />
                </td>
                <td>
                  <div className='risk-key-wrapper'>
                    {/* <div className='risk-id-small'>{risk.id}</div> */}
                    <div className='risk-key'>{risk.title}</div>
                  </div>
                </td>
                <td>
                  <span className='label-tag'>{risk.type}</span>
                </td>
                <td>
                  <span className={`risk-severity-${risk.severityLevel}`}>
                    {/* {risk.severityLevel} */}
                    <Severity status={risk.severityLevel} />
                  </span>
                </td>
                <td>
                  <Avatar
                    person={{
                      fullName: risk.responsibleFullName || '',
                      userName: risk.responsibleUserName || '',
                      picture: risk.responsiblePicture || undefined,
                      avatarColor: '#4C9AFF',
                      initials: getInitials(risk.responsibleFullName),
                    }}
                  />
                </td>
                <td className={getDueClass(risk.dueDate?.split('T')[0])}>
                  {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString('vi-VN') : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRisk && <RiskDetail risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
      {showCreateModal && (
        <ManualRiskModal onClose={closeCreateRiskModal} onSave={handleSaveRisk} />
      )}
      {showSuggestedModal && (
        <SuggestedRisksModal onClose={closeSuggestedRisks} onApprove={handleApproveSuggestedRisk} />
      )}
    </div>
  );
};

export default Risk;
