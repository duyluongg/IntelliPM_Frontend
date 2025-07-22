import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import {
  useGetRisksByProjectKeyQuery,
  useCreateRiskMutation,
  useUpdateRiskStatusMutation,
  useUpdateRiskTypeMutation,
  useUpdateRiskResponsibleMutation,
  useUpdateRiskDueDateMutation,
} from '../../../services/riskApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import './Risk.css';
import { Check } from 'lucide-react';
import { useState } from 'react';
import RiskDetail from './RiskDetail';
import ManualRiskModal from './ManualRiskModal';
import SuggestedRisksModal from './SuggestedRisksModal';

const Risk = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: projectData, isLoading: isProjectLoading } =
    useGetProjectDetailsByKeyQuery(projectKey);

  const projectId = projectData?.data?.id;
  const skipMembers = !projectId;

  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
    skip: skipMembers,
  });

  const { data, isLoading, error, refetch } = useGetRisksByProjectKeyQuery(projectKey);
  const [createRisk] = useCreateRiskMutation();
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [updateRiskStatus] = useUpdateRiskStatusMutation();
  const [updateRiskType] = useUpdateRiskTypeMutation();
  const [updateResponsible] = useUpdateRiskResponsibleMutation();
  const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
  const [editingResponsibleId, setEditingResponsibleId] = useState<number | null>(null);

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');

  if (isLoading) return <div className='text-sm text-gray-500'>Loading risks...</div>;
  if (error || !data?.data) return <div>Error loading risks</div>;

  const risks = data.data;
  const riskTypes = categoryData?.data || [];

  const assignees =
    membersData?.data?.map((m) => ({
      id: m.accountId,
      fullName: m.fullName,
      userName: m.username,
      picture: m.picture,
    })) || [];

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

  // type Assignee = {
  //   fullName: string;
  //   userName: string;
  //   picture?: string;
  //   avatarColor: string;
  //   initials: string;
  // };

  // const Avatar = ({ person }: { person: Assignee }) =>
  //   person.fullName && person.fullName !== 'Unknown' ? (
  //     <div className='reporter'>
  //       {person.picture ? (
  //         <img
  //           src={person.picture}
  //           alt={`${person.fullName}'s avatar`}
  //           className='avatar'
  //           style={{ backgroundColor: person.avatarColor }}
  //         />
  //       ) : (
  //         <button
  //           className='w-8 h-8 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full text-xs'
  //           title={person.fullName}
  //         >
  //           {person.userName.slice(0, 2).toUpperCase()}
  //         </button>
  //       )}
  //       <span className='reporter-name'>{person.fullName}</span>
  //     </div>
  //   ) : null;

  type Assignee = {
    id: number;
    fullName: string | null;
    userName: string;
    picture?: string | null;
  };

  const ResponsibleDropdown = ({
    assignees,
    selectedId,
    onChange,
  }: {
    assignees: Assignee[];
    selectedId: number | null;
    onChange: (id: number) => void;
  }) => {
    const getInitials = (name?: string | null) => {
      if (!name) return '';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // if (!isEditing) {
    //   return (
    //     <button
    //       onClick={() => setIsEditing(true)}
    //       className='text-xs text-gray-600 underline bg-transparent border-none cursor-pointer'
    //     >
    //       {selectedUser ? selectedUser.fullName || selectedUser.userName : 'No Assign'}
    //     </button>
    //   );
    // }

    return (
      <select
        className='responsible-dropdown'
        value={selectedId ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
      >
        <option value='' disabled>
          -- Select --
        </option>
        {assignees.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName || user.userName}
          </option>
        ))}
      </select>
    );
  };

  const RiskStatusDropdown = ({
    status,
    onChange,
  }: {
    status: string;
    onChange: (newStatus: string) => void;
  }) => {
    const getStyle = (status: string) => {
      switch (status.toUpperCase()) {
        case 'OPEN':
          return { backgroundColor: '#DBEAFE', color: '#1D4ED8' }; // blue
        case 'MITIGATED':
          return { backgroundColor: '#D1FAE5', color: '#047857' }; // green
        case 'CLOSED':
          return { backgroundColor: '#E5E7EB', color: '#6B7280' }; // gray
        default:
          return {};
      }
    };

    return (
      <select
        className={`risk-status-select status-${status.toLowerCase()}`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...getStyle(status),
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontWeight: 600,
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        <option value='OPEN'>OPEN</option>
        <option value='MITIGATED'>MITIGATED</option>
        <option value='CLOSED'>CLOSED</option>
      </select>
    );
  };

  // const RiskStatusToggle = () => {
  //   const [clicked, setClicked] = useState(false);

  //   return (
  //     <button
  //       className={`risk-status-toggle ${clicked ? 'clicked' : ''}`}
  //       onClick={() => setClicked(!clicked)}
  //     >
  //       <Check size={16} strokeWidth={3} />
  //     </button>
  //   );
  // };

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
              <th>Key</th>
              <th>Risk Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Responsible</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td onClick={() => setSelectedRisk(risk)} style={{ cursor: 'pointer' }}>
                  <div className='risk-key-wrapper'>
                    <div className='risk-key'>{risk.riskKey}</div>
                  </div>
                </td>
                <td onClick={() => setSelectedRisk(risk)} style={{ cursor: 'pointer' }}>
                  <div className='risk-key-wrapper'>
                    <div className='risk-key'>{risk.title}</div>
                  </div>
                </td>
                <td>
                  <select
                    className='risk-type-select'
                    value={risk.type}
                    style={{ cursor: 'pointer' }}
                    onChange={async (e) => {
                      const newType = e.target.value;
                      try {
                        await updateRiskType({ id: risk.id, type: newType }).unwrap();
                        refetch();
                      } catch (err) {
                        console.error('Failed to update risk type:', err);
                      }
                    }}
                  >
                    {riskTypes.map((type: any) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <RiskStatusDropdown
                    status={risk.status}
                    onChange={async (newStatus) => {
                      try {
                        await updateRiskStatus({ id: risk.id, status: newStatus }).unwrap();
                        refetch();
                        console.log(`Updated status for risk ${risk.id} to ${newStatus}`);
                      } catch (err) {
                        console.error('Failed to update status:', err);
                      }
                    }}
                  />
                </td>
                <td>
                  <span className={`risk-severity-${risk.severityLevel}`}>
                    <Severity status={risk.severityLevel} />
                  </span>
                </td>
                <td style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {risk.responsiblePicture ? (
                    <img
                      src={risk.responsiblePicture}
                      alt='avatar'
                      className='avatar'
                      style={{ width: 24, height: 24, borderRadius: '50%' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#4C9AFF',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    >
                      {getInitials(risk.responsibleFullName || risk.responsibleUserName)}
                    </div>
                  )}
                  <ResponsibleDropdown
                    assignees={assignees}
                    selectedId={risk.responsibleId}
                    onChange={async (newId) => {
                      try {
                        await updateResponsible({ id: risk.id, responsibleId: newId }).unwrap();
                        refetch();
                      } catch (error) {
                        console.error('Failed to update responsible:', error);
                      }
                    }}
                  />
                </td>

                {/* <td className={getDueClass(risk.dueDate?.split('T')[0])}>
                  {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString('vi-VN') : '--'}
                </td> */}
                <td>
                  <input
                    type='date'
                    value={risk.dueDate?.split('T')[0] || ''}
                    onChange={async (e) => {
                      const newDate = e.target.value + 'T00:00:00Z';
                      try {
                        await updateRiskDueDate({ id: risk.id, dueDate: newDate }).unwrap();
                        refetch();
                      } catch (err) {
                        console.error('Failed to update due date:', err);
                      }
                    }}
                    className={`due-date-input ${getDueClass(risk.dueDate?.split('T')[0])}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '13px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      cursor: 'pointer',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRisk && (
        <RiskDetail
          risk={selectedRisk}
          onClose={() => {
            setSelectedRisk(null);
            refetch();
          }}
          assignees={assignees}
          updateResponsible={({ id, responsibleId }) => {
            if (responsibleId !== null) {
              updateResponsible({ id, responsibleId }); // OK
            }
          }}
          refetch={refetch}
        />
      )}
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
