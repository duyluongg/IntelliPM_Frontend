import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  useGetRisksByProjectKeyQuery,
  useCreateRiskMutation,
  useUpdateRiskStatusMutation,
  useUpdateRiskTypeMutation,
  useUpdateRiskResponsibleMutation,
  useUpdateRiskDueDateMutation,
  useCheckOverdueTasksMutation,
} from '../../../services/riskApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateRiskSolutionMutation } from '../../../services/riskSolutionApi';
import RiskDetail from './RiskDetail';
import ManualRiskModal from './ManualRiskModal';
import SuggestedRisksModal from './SuggestedRisksModal';
import { useGetProjectsByAccountIdQuery } from '../../../services/accountApi';
import aiIcon from '../../../assets/icon/ai.png';
import { Tooltip } from 'react-tooltip';
import { useAuth } from '../../../services/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Risk = () => {
  const [searchParams] = useSearchParams();
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const userJson = localStorage.getItem('user');
  const accountId = userJson ? JSON.parse(userJson).id : null;
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [dueDateFilter, setDueDateFilter] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedResponsibleId, setSelectedResponsibleId] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  const { user } = useAuth();
  const rawRole = (user?.role ?? '').toString().trim();
  const isTeamLeaderOrMember = ['TEAM_LEADER', 'TEAM_MEMBER'].includes(rawRole.toUpperCase());
  const isTeamMember = rawRole.toUpperCase() === 'TEAM_MEMBER';

  const { data: projectData, isLoading: isProjectLoading } =
    useGetProjectDetailsByKeyQuery(projectKey);

  const projectId = projectData?.data?.id;
  const skipMembers = !projectId;

  const { data: membersData } = useGetProjectMembersWithPositionsQuery(projectId!, {
    skip: skipMembers,
  });

  const { data: scopeCategoriesData, isLoading: isScopeCategoriesLoading } =
    useGetCategoriesByGroupQuery('risk_scope');

  const { data: generatedByCategoriesData, isLoading: isGeneratedByCategoriesLoading } =
    useGetCategoriesByGroupQuery('risk_generated_by');

  const { data, isLoading, error, refetch } = useGetRisksByProjectKeyQuery(projectKey);
  const [createRisk] = useCreateRiskMutation();
  const [checkOverdueTasks] = useCheckOverdueTasksMutation();
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [updateRiskStatus] = useUpdateRiskStatusMutation();
  const [updateRiskType] = useUpdateRiskTypeMutation();
  const [updateResponsible] = useUpdateRiskResponsibleMutation();
  const [updateRiskDueDate] = useUpdateRiskDueDateMutation();
  const [createRiskSolution] = useCreateRiskSolutionMutation();

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetCategoriesByGroupQuery('risk_type');

  const { data: severityCategoriesData, isLoading: isSeverityLoading } =
    useGetCategoriesByGroupQuery('risk_severity_level');

  const navigate = useNavigate();

  useEffect(() => {
    if (projectKey && projectKey !== 'NotFound') {
      checkOverdueTasks(projectKey)
        .unwrap()
        .then(() => refetch())
        .catch((err) => console.error('Failed to check overdue tasks:', err));
    }
  }, [projectKey, checkOverdueTasks, refetch]);

  const validateDueDate = (newDate: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(newDate);
    const projectEndDate = projectData?.data?.endDate ? new Date(projectData.data.endDate) : null;

    if (selectedDate < today) {
      return 'Due date cannot be in the past';
    }
    if (projectEndDate && selectedDate > projectEndDate) {
      return 'Due date cannot be later than project end date';
    }
    return null;
  };

  if (
    isLoading ||
    isProjectLoading ||
    isCategoryLoading ||
    isSeverityLoading ||
    isScopeCategoriesLoading ||
    isGeneratedByCategoriesLoading
  ) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
        Loading risks...
      </div>
    );
  }
  if (error || !data?.data) {
    return (
      <div className='flex items-center justify-center h-full text-red-500 text-sm'>
        Error loading risks
      </div>
    );
  }

  const risks = data.data;
  const riskTypes = categoryData?.data || [];
  const scopeTypes = scopeCategoriesData?.data || [];
  const generatedByTypes = generatedByCategoriesData?.data || [];
  const assignees =
    membersData?.data
      ?.filter((m) => !m.projectPositions.some((p) => p.position.toUpperCase() === 'CLIENT'))
      .map((m) => ({
        id: m.accountId,
        fullName: m.fullName,
        userName: m.username,
        picture: m.picture,
      })) || [];
  const members = assignees.map((a) => ({
    id: a.id,
    name: a.fullName || a.userName,
    avatar: a.picture || '',
  }));

  const filteredRisks = risks
    .filter((risk) => {
      const isScopeMatch =
        scopeFilter === 'ALL' ||
        (scopeFilter === 'TASK' && risk.riskScope !== 'PROJECT') ||
        (scopeFilter === 'PROJECT' && risk.riskScope === 'PROJECT');

      const dueDate = risk.dueDate?.split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const isDueDateMatch =
        dueDateFilter === 'ALL' ||
        (dueDateFilter === 'ACTIVE' &&
          dueDate &&
          (dueDate >= today || !risk.status.toUpperCase().includes('CLOSED')));

      const isStatusMatch =
        !selectedStatus || risk.status.toLowerCase() === selectedStatus.toLowerCase();
      const isTypeMatch = !selectedType || risk.type.toLowerCase() === selectedType.toLowerCase();
      const isSeverityMatch =
        !selectedSeverity || risk.severityLevel.toLowerCase() === selectedSeverity.toLowerCase();
      const isResponsibleMatch =
        !selectedResponsibleId || risk.responsibleId === selectedResponsibleId;

      // Date range filter
      const createdAtDate = new Date(risk.createdAt);
      const startDateObj = selectedStartDate ? new Date(selectedStartDate) : null;
      const endDateObj = selectedDueDate ? new Date(selectedDueDate) : null;

      const matchesCreatedRange =
        (!startDateObj && !endDateObj) ||
        (startDateObj && endDateObj
          ? createdAtDate >= startDateObj && createdAtDate <= endDateObj
          : startDateObj
          ? createdAtDate >= startDateObj
          : endDateObj
          ? createdAtDate <= endDateObj
          : true);

      const dueDateObj = risk.dueDate ? new Date(risk.dueDate) : null;

      const matchesDueRange =
        (!startDateObj && !endDateObj) ||
        (startDateObj && endDateObj
          ? !!dueDateObj && dueDateObj >= startDateObj && dueDateObj <= endDateObj
          : startDateObj
          ? !!dueDateObj && dueDateObj >= startDateObj
          : endDateObj
          ? !!dueDateObj && dueDateObj <= endDateObj
          : true);

      const isSearchMatch =
        !searchQuery ||
        risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.riskKey.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        isScopeMatch &&
        isDueDateMatch &&
        isStatusMatch &&
        isTypeMatch &&
        isSeverityMatch &&
        isResponsibleMatch &&
        matchesCreatedRange &&
        matchesDueRange &&
        isSearchMatch
      );
    })
    .sort((a, b) => {
      const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      const aIsClosed = a.status.toUpperCase().includes('CLOSED');
      const bIsClosed = b.status.toUpperCase().includes('CLOSED');

      if (aIsClosed && !bIsClosed) return 1;
      if (!aIsClosed && bIsClosed) return -1;
      return aDueDate - bDueDate;
    });

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getDueClass = (dueDate: string): string => {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate === today) return 'bg-yellow-100 text-yellow-800';
    if (dueDate < today) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const Severity: React.FC<{ status: string }> = ({ status }) => {
    const getStatusStyle = () => {
      const category = severityCategoriesData?.data?.find(
        (cat) => cat.name.toLowerCase() === status.toLowerCase()
      );
      if (!category?.color) return 'bg-gray-100 text-gray-700';
      const [bgColor, textColor] = category.color.split(',');
      return `bg-${bgColor} text-${textColor}`;
    };

    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle()}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

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
    onChange: (id: number | null) => void;
  }) => {
    return (
      <select
        className='w-50 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        value={selectedId?.toString() ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        disabled={isTeamMember}
      >
        <option value=''>No Assignee</option>
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
    const {
      data: categoriesData,
      isLoading,
      isError,
    } = useGetCategoriesByGroupQuery('risk_status');

    const categories = categoriesData?.data?.filter((cat) => cat.isActive);

    const getStyle = (categoryName: string) => {
      const category = categories?.find((cat) => cat.name === categoryName);
      if (!category?.color) return 'bg-gray-100 text-gray-700';
      const [bgColor, textColor] = category.color.includes(',')
        ? category.color.split(',')
        : [category.color, category.color];
      return `bg-${bgColor} text-${textColor}`;
    };

    return (
      <select
        className={`p-2 text-xs font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStyle(
          status
        )}`}
        value={status}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        {isLoading ? (
          <option value=''>Loading...</option>
        ) : (
          categories?.map((category) => (
            <option key={category.name} value={category.name}>
              {category.label}
            </option>
          ))
        )}
      </select>
    );
  };

  const handleMemberClick = (id: number) => {
    setSelectedMemberId(id === selectedMemberId ? null : id);
    setSelectedResponsibleId(id === selectedResponsibleId ? null : id);
  };

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  const openCreateRiskModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateRiskModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveRisk = async (newRisk: any) => {
    try {
      const defaultScope =
        scopeTypes.find((scope: any) => scope.name === 'PROJECT')?.name || 'PROJECT';
      const defaultGeneratedBy =
        generatedByTypes.find((gen: any) => gen.name === 'MANUAL')?.name || 'MANUAL';

      const request = {
        projectKey,
        responsibleId: newRisk.responsibleId,
        createdBy: accountId,
        taskId: newRisk.taskId,
        riskScope: newRisk.riskScope,
        title: newRisk.title,
        description: newRisk.description,
        status: newRisk.status,
        type: newRisk.type,
        generatedBy: defaultGeneratedBy,
        probability: newRisk.probability,
        impactLevel: newRisk.impactLevel,
        isApproved: true,
        dueDate: newRisk.dueDate ? newRisk.dueDate + 'T00:00:00Z' : undefined,
      };
      await createRisk(request).unwrap();
      refetch();
    } catch (error: any) {
      console.error('Failed to create risk:', error);
      if (error.status === 400 && error.data?.message) {
        setShowCreateModal(false);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Create Risk',
          text: error.data.message,
          width: '500px',
          confirmButtonColor: 'rgba(44, 104, 194, 1)',
          customClass: {
            title: 'small-title',
            popup: 'small-popup',
            icon: 'small-icon',
            htmlContainer: 'small-html',
          },
        });
      }
    }
  };

  const openSuggestedRisks = () => {
    setShowSuggestedModal(true);
  };

  const closeSuggestedRisks = () => {
    setShowSuggestedModal(false);
  };

  const handleApproveSuggestedRisk = async (risk: any) => {
    const today = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
    try {
      const defaultScope =
        scopeTypes.find((scope: any) => scope.name === 'PROJECT')?.name || 'PROJECT';
      const defaultGeneratedBy =
        generatedByTypes.find((gen: any) => gen.name === 'AI')?.name || 'AI';

      const request = {
        projectKey,
        responsibleId: null,
        createdBy: accountId,
        taskId: null,
        riskScope: defaultScope,
        title: risk.title,
        description: risk.description,
        status: risk.status,
        type: risk.type,
        generatedBy: defaultGeneratedBy,
        probability: risk.probability || risk.likelihood,
        impactLevel: risk.impactLevel || risk.impact,
        isApproved: true,
        dueDate: undefined,
      };

      const res = await createRisk(request).unwrap();
      if (risk.mitigationPlan || risk.contingencyPlan) {
        await createRiskSolution({
          riskId: res.data.id,
          mitigationPlan: risk.mitigationPlan,
          contingencyPlan: risk.contingencyPlan,
          createdBy: accountId,
        });
      }
      refetch();
    } catch (error: any) {
      console.error('Failed to create risk:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Approve Risk',
        text: error.data?.message || 'An error occurred while approving the risk',
        width: '500px',
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
    }
  };

  const openRiskStatistics = () => {
    navigate(`/project/${projectKey}/risk-statistics`);
  };

  return (
    <div className='p-6 min-h-screen'>
      {/* Action Buttons with Filter */}
      <div className='flex items-center justify-between gap-4 mb-6 flex-wrap'>
        <div className='w-full sm:w-auto'>
          <button
            className='flex items-center justify-between w-48 h-12 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 ease-in-out'
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <span>Filters</span>
            <span className='text-xs text-gray-500'>{isFilterExpanded ? '▲' : '▼'}</span>
          </button>
          {isFilterExpanded && (
            <div
              className='mt-2 bg-white shadow-md rounded-lg p-6 transition-max-height duration-300 ease-in-out'
              style={{
                maxHeight: isFilterExpanded ? '500px' : '0',
                overflow: 'hidden',
              }}
            >
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value=''>All Statuses</option>
                  {data?.data
                    .map((risk) => risk.status)
                    .filter((status, index, self) => self.indexOf(status) === index)
                    .map((status) => (
                      <option key={status} value={status.toLowerCase()}>
                        {status}
                      </option>
                    ))}
                </select>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value=''>All Types</option>
                  {riskTypes.map((type) => (
                    <option key={type.id} value={type.name.toLowerCase()}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <option value=''>All Severities</option>
                  {severityCategoriesData?.data.map((sev) => (
                    <option key={sev.id} value={sev.name.toLowerCase()}>
                      {sev.name}
                    </option>
                  ))}
                </select>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={selectedResponsibleId?.toString() ?? ''}
                  onChange={(e) =>
                    setSelectedResponsibleId(e.target.value === '' ? null : Number(e.target.value))
                  }
                >
                  <option value=''>All Responsibles</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.fullName || assignee.userName}
                    </option>
                  ))}
                </select>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                >
                  <option value='ALL'>All Scopes</option>
                  {scopeTypes.map((scope) => (
                    <option key={scope.name} value={scope.name}>
                      {scope.label}
                    </option>
                  ))}
                </select>
                <select
                  className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={dueDateFilter}
                  onChange={(e) => setDueDateFilter(e.target.value)}
                >
                  <option value='ALL'>All Due Dates</option>
                  <option value='ACTIVE'>Active Due Dates</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className='flex items-center gap-4'>
          {!isTeamLeaderOrMember && (
            <>
              <button
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
                onClick={openCreateRiskModal}
              >
                + Add Risk
              </button>
              <div
                className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer'
                onClick={openSuggestedRisks}
                data-tooltip-id='generate-ai-tooltip'
                data-tooltip-content='Generate risks using AI'
              >
                <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
                <span>Generate Risks by AI</span>
                <Tooltip id='generate-ai-tooltip' />
              </div>
              <button
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition'
                onClick={openRiskStatistics}
              >
                View Risk Statistics
              </button>
            </>
          )}
        </div>
      </div>
      {/* <div className='filter-container'>
        <button
          className={`filter-button ${isFilterExpanded ? 'expanded' : ''}`}
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <span>Filters</span>
          <span className='text-xs text-gray-500'>{isFilterExpanded ? '▲' : '▼'}</span>
        </button>
        {isFilterExpanded && (
          <div className={`filter-content ${isFilterExpanded ? 'expanded' : ''}`}>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value=''>All Statuses</option>
              {data?.data
                .map((risk) => risk.status)
                .filter((status, index, self) => self.indexOf(status) === index)
                .map((status) => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
            </select>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value=''>All Types</option>
              {riskTypes.map((type) => (
                <option key={type.id} value={type.name.toLowerCase()}>
                  {type.name}
                </option>
              ))}
            </select>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value=''>All Severities</option>
              {severityCategoriesData?.data.map((sev) => (
                <option key={sev.id} value={sev.name.toLowerCase()}>
                  {sev.name}
                </option>
              ))}
            </select>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedResponsibleId?.toString() ?? ''}
              onChange={(e) =>
                setSelectedResponsibleId(e.target.value === '' ? null : Number(e.target.value))
              }
            >
              <option value=''>All Responsibles</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.fullName || assignee.userName}
                </option>
              ))}
            </select>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
            >
              <option value='ALL'>All Scopes</option>
              {scopeTypes.map((scope) => (
                <option key={scope.name} value={scope.name}>
                  {scope.label}
                </option>
              ))}
            </select>
            <select
              className='w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
            >
              <option value='ALL'>All Due Dates</option>
              <option value='ACTIVE'>Active Due Dates</option>
            </select>
          </div>
        )}
        <div className='flex items-center gap-4'>
          {!isTeamLeaderOrMember && (
            <>
              <button
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
                onClick={openCreateRiskModal}
              >
                + Add Risk
              </button>
              <div
                className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer'
                onClick={openSuggestedRisks}
                data-tooltip-id='generate-ai-tooltip'
                data-tooltip-content='Generate risks using AI'
              >
                <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
                <span>Generate Risks by AI</span>
                <Tooltip id='generate-ai-tooltip' />
              </div>
              <button
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition'
                onClick={openRiskStatistics}
              >
                View Risk Statistics
              </button>
            </>
          )}
        </div>
      </div> */}

      {/* Table Section */}
      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <div className='max-h-96 overflow-y-auto'>
            <table className='w-full table-auto'>
              <thead className='bg-gray-100 sticky top-0 z-10'>
                <tr>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-32'>
                    Key
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-64'>
                    Risk Name
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-40'>
                    Task ID
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-48'>
                    Type
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-40'>
                    Status
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-32'>
                    Severity
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-64'>
                    Responsible
                  </th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap w-48'>
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className='border-b hover:bg-gray-50'>
                    <td className='p-3 whitespace-nowrap'>
                      <span
                        className='text-gray-600 cursor-pointer hover:underline'
                        onClick={() => setSelectedRisk(risk)}
                      >
                        {risk.riskKey}
                      </span>
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <span
                        className='text-gray-600 cursor-pointer hover:underline'
                        onClick={() => setSelectedRisk(risk)}
                      >
                        {risk.title}
                      </span>
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      {risk.taskId ? (
                        <Link
                          to={`/project/${projectKey}/work-item-detail?taskId=${risk.taskId}`}
                          className='inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:underline'
                        >
                          {risk.taskId}
                        </Link>
                      ) : (
                        <span className='text-gray-500'>-</span>
                      )}
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <select
                        className='w-48 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={risk.type}
                        onChange={async (e) => {
                          try {
                            await updateRiskType({
                              id: risk.id,
                              type: e.target.value,
                              createdBy: accountId,
                            }).unwrap();
                            refetch();
                          } catch (err: any) {
                            console.error('Failed to update risk type:', err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Failed to Update Risk Type',
                              text:
                                err.data?.message ||
                                'An error occurred while updating the risk type',
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                          }
                        }}
                      >
                        {riskTypes.map((type: any) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <RiskStatusDropdown
                        status={risk.status}
                        onChange={async (newStatus) => {
                          try {
                            await updateRiskStatus({
                              id: risk.id,
                              status: newStatus,
                              createdBy: accountId,
                            }).unwrap();
                            refetch();
                          } catch (err: any) {
                            console.error('Failed to update status:', err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Failed to Update Status',
                              text:
                                err.data?.message || 'An error occurred while updating the status',
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                          }
                        }}
                      />
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <Severity status={risk.severityLevel} />
                    </td>
                    <td className='p-3 whitespace-nowrap flex items-center space-x-2'>
                      {risk.responsibleId ? (
                        risk.responsiblePicture ? (
                          <img
                            src={risk.responsiblePicture}
                            alt='avatar'
                            className='w-6 h-6 rounded-full'
                          />
                        ) : (
                          <div className='w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold'>
                            {getInitials(risk.responsibleFullName || risk.responsibleUserName)}
                          </div>
                        )
                      ) : (
                        <span className='text-gray-500 text-sm'>No Assignee</span>
                      )}
                      <ResponsibleDropdown
                        assignees={assignees}
                        selectedId={risk.responsibleId}
                        onChange={async (newId) => {
                          try {
                            await updateResponsible({
                              id: risk.id,
                              responsibleId: newId,
                              createdBy: accountId,
                            }).unwrap();
                            refetch();
                          } catch (err: any) {
                            console.error('Failed to update responsible:', err);
                            Swal.fire({
                              icon: 'error',
                              title: 'Failed to Update Responsible',
                              text:
                                err.data?.message ||
                                'An error occurred while updating the responsible',
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                          }
                        }}
                      />
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <input
                        type='date'
                        value={risk.dueDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          const newDate = e.target.value ? e.target.value + 'T00:00:00Z' : '';
                          e.target.dataset.newDate = newDate;
                        }}
                        onBlur={async (e) => {
                          const newDate = e.target.dataset.newDate || '';
                          if (!newDate) {
                            return;
                          }
                          const validationError = validateDueDate(newDate);
                          if (validationError) {
                            Swal.fire({
                              icon: 'error',
                              title: 'Invalid Due Date',
                              text: validationError,
                              width: '500px',
                              confirmButtonColor: 'rgba(44, 104, 194, 1)',
                              customClass: {
                                title: 'small-title',
                                popup: 'small-popup',
                                icon: 'small-icon',
                                htmlContainer: 'small-html',
                              },
                            });
                            e.target.value = risk.dueDate?.split('T')[0] || '';
                            return;
                          }
                          if (newDate !== risk.dueDate) {
                            try {
                              await updateRiskDueDate({
                                id: risk.id,
                                dueDate: newDate,
                                createdBy: accountId,
                              }).unwrap();
                              refetch();
                            } catch (err: any) {
                              console.error('Failed to update due date:', err);
                              Swal.fire({
                                icon: 'error',
                                title: 'Failed to Update Due Date',
                                text:
                                  err.data?.message ||
                                  'An error occurred while updating the due date',
                                width: '500px',
                                confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                customClass: {
                                  title: 'small-title',
                                  popup: 'small-popup',
                                  icon: 'small-icon',
                                  htmlContainer: 'small-html',
                                },
                              });
                              e.target.value = risk.dueDate?.split('T')[0] || '';
                            }
                          }
                        }}
                        className={`p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDueClass(
                          risk.dueDate?.split('T')[0] || ''
                        )}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRisk && (
        <RiskDetail
          risk={selectedRisk}
          onClose={() => {
            setSelectedRisk(null);
            refetch();
          }}
        />
      )}
      {showCreateModal && (
        <ManualRiskModal onClose={closeCreateRiskModal} onSave={handleSaveRisk} />
      )}
      {showSuggestedModal && (
        <SuggestedRisksModal
          onClose={closeSuggestedRisks}
          onApprove={handleApproveSuggestedRisk}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default Risk;
