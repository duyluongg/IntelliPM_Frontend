import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import {
  UserPlus,
  Mail,
  Users,
  ChevronDown,
  Search,
  User,
  Briefcase,
  CheckCircle,
  Clock,
  Send,
  X,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useGetProjectsByAccountIdQuery } from '../../services/accountApi';
import {
  useGetProjectMembersWithPositionsQuery,
  useCreateProjectMemberMutation,
} from '../../services/projectMemberApi';
import { useGetCategoriesByGroupQuery } from '../../services/dynamicCategoryApi';
import { useGetAccountsQuery } from '../../services/adminApi';
import { useSendInvitationToTeamMemberMutation } from '../../services/projectApi';
import {
  useCreateProjectPositionMutation,
  useDeleteProjectPositionMutation,
} from '../../services/projectPositionApi';
import { createSlice, configureStore, type PayloadAction } from '@reduxjs/toolkit';

interface Invitee {
  email: string;
  fullName: string;
  position: string;
}

interface InviteeState {
  invitees: Invitee[];
}

const inviteeSlice = createSlice({
  name: 'invitee',
  initialState: { invitees: [] as Invitee[] } as InviteeState,
  reducers: {
    addInvitee: (state: InviteeState, action: PayloadAction<Invitee>) => {
      state.invitees.push(action.payload);
    },
    clearInvitees: (state: InviteeState) => {
      state.invitees = [];
    },
  },
});

export const store = configureStore({
  reducer: { invitee: inviteeSlice.reducer },
});

export const { addInvitee, clearInvitees } = inviteeSlice.actions;

// Define interface for project member to resolve TS7006
interface ProjectMember {
  id: number;
  accountId: number;
  fullName: string;
  email: string | null;
  status: string;
  projectPositions: { id: number; position: string }[];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED':
        return {
          icon: Clock,
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          text: 'Pending',
        };
      case 'INVITED':
        return { icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Invited' };
      case 'ACCEPTED':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'Active',
        };
      default:
        return { icon: User, color: 'bg-gray-100 text-gray-700 border-gray-200', text: status };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      <IconComponent className='w-4 h-4 mr-1' />
      {config.text}
    </span>
  );
};

const PositionManager: React.FC<{
  positions: any[];
  availablePositions: any[];
  onAddPosition: (position: string) => void;
  onRemovePosition: (positionId: number) => void;
  isLoading: boolean;
  memberId: number;
}> = ({ positions, availablePositions, onAddPosition, onRemovePosition, isLoading, memberId }) => {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPosition = (pos: string): string => {
    return pos
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleAddPosition = () => {
    if (selectedPosition) {
      onAddPosition(selectedPosition);
      setSelectedPosition('');
    }
  };

  return (
    <div className='mt-2'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center text-sm text-gray-600 hover:text-gray-900'
        aria-expanded={isExpanded}
        aria-controls={`positions-${memberId}`}
      >
        <ChevronRight
          className={`w-4 h-4 mr-1 transform ${isExpanded ? 'rotate-90' : ''} transition-transform`}
        />
        Positions
      </button>
      {isExpanded && (
        <div id={`positions-${memberId}`} className='mt-2 space-y-2'>
          <div className='flex flex-wrap gap-2'>
            {positions.length > 0 ? (
              positions.map((pos) => (
                <span
                  key={pos.id}
                  className='inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm'
                >
                  <Briefcase className='w-4 h-4 mr-1' />
                  {formatPosition(pos.position)}
                  <button
                    onClick={() => onRemovePosition(pos.id)}
                    className='ml-2 text-blue-500 hover:text-red-500 transition-colors'
                    disabled={isLoading}
                    aria-label={`Remove ${formatPosition(pos.position)} position`}
                  >
                    <X className='w-4 h-4' />
                  </button>
                </span>
              ))
            ) : (
              <span className='text-sm text-gray-500'>No positions assigned</span>
            )}
          </div>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className='w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none'
                disabled={isLoading}
                aria-label='Select position'
              >
                <option value=''>Add position...</option>
                {availablePositions?.map((pos) => (
                  <option key={pos.id} value={pos.name}>
                    {formatPosition(pos.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>
            <button
              onClick={handleAddPosition}
              disabled={!selectedPosition || isLoading}
              className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
              aria-label='Add position'
            >
              <Plus className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InviteesMemberPage: React.FC = () => {
  const dispatch = useDispatch();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [emailError, setEmailError] = useState<string>('');

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useGetProjectsByAccountIdQuery(accountId);
  const { data: positionsData, isLoading: positionsLoading } =
    useGetCategoriesByGroupQuery('account_position');
  const {
    data: accountsData,
    isLoading: accountsLoading,
    error: accountsError,
  } = useGetAccountsQuery();
  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useGetProjectMembersWithPositionsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });
  const [createProjectMember, { isLoading: createLoading }] = useCreateProjectMemberMutation();
  const [sendInvitationToTeamMember, { isLoading: invitationLoading }] =
    useSendInvitationToTeamMemberMutation();
  const [createProjectPosition, { isLoading: addPositionLoading }] =
    useCreateProjectPositionMutation();
  const [deleteProjectPosition, { isLoading: removePositionLoading }] =
    useDeleteProjectPositionMutation();

  const filteredMembers =
    membersData?.data?.filter(
      (member) =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) || [];

  const availableAccounts =
    accountsData?.data.filter(
      (account) =>
        !membersData?.data.some((member: ProjectMember) => member.accountId === account.id)
    ) || [];

  const formatPosition = (pos: string): string => {
    return pos
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      fill='none'
      viewBox='0 0 16 16'
      role='presentation'
      {...props}
      style={{ color: 'var(--ds-icon, #44546F)' }}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d='M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7'
        clipRule='evenodd'
      />
    </svg>
  );

  const handleSendInvitation = async (projectId: number, accountId: number) => {
    try {
      const result = await sendInvitationToTeamMember({ projectId, accountId }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Invitation Sent',
        text: result.message,
        confirmButtonColor: '#2563eb',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || 'Failed to send invitation. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleAddPosition = async (projectMemberId: number, position: string) => {
    try {
      await createProjectPosition({
        projectMemberId,
        position: { position },
      }).unwrap();
      refetchMembers();
      Swal.fire({
        icon: 'success',
        title: 'Position Added',
        text: `Position "${formatPosition(position)}" has been assigned.`,
        confirmButtonColor: '#2563eb',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || 'Failed to add position.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleRemovePosition = async (projectMemberId: number, positionId: number) => {
    try {
      await deleteProjectPosition({
        projectMemberId,
        positionId,
      }).unwrap();
      refetchMembers();
      Swal.fire({
        icon: 'success',
        title: 'Position Removed',
        text: 'Position has been removed successfully.',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || 'Failed to remove position.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Project Selected',
        text: 'Please select a project first.',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }
    if (!selectedAccountId) {
      setEmailError('Please select a member.');
      return;
    }

    const selectedProject = projectsData?.data.find((p) => p.projectId === selectedProjectId);
    const selectedAccount = accountsData?.data.find((a) => a.id === selectedAccountId);

    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Member Addition',
      html: `
        <div class="text-left text-sm">
          <p class="mb-2"><strong>Member:</strong> ${selectedAccount?.fullName}</p>
          <p class="mb-2"><strong>Project:</strong> ${selectedProject?.projectName}</p>
          <p class="text-gray-600">You can assign positions after adding the member.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Add Member',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await createProjectMember({
        projectId: selectedProjectId,
        request: { accountId: selectedAccountId },
      }).unwrap();

      dispatch(
        addInvitee({
          email: selectedAccount?.email || '',
          fullName: selectedAccount?.fullName || '',
          position: 'No position assigned',
        })
      );

      setSelectedAccountId(null);
      setEmailError('');
      setIsAddMemberModalOpen(false);
      refetchMembers();

      Swal.fire({
        icon: 'success',
        title: 'Member Added',
        text: `${selectedAccount?.fullName} has been added to ${selectedProject?.projectName}`,
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      setEmailError('Error adding member. Please try again.');
    }
  };

  const selectedProject = projectsData?.data.find((p) => p.projectId === selectedProjectId);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex'>
      {/* Sidebar */}
      <div className='w-80 bg-white shadow-lg p-6 flex-shrink-0 border-r border-gray-200'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center'>
            <Users className='w-6 h-6 mr-2 text-blue-600' />
            Team Management
          </h1>
          <p className='text-sm text-gray-500 mt-1'>Manage project members and roles</p>
        </div>

        {/* Project Selection */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Select Project</label>
          {projectsLoading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
              <span className='ml-2 text-gray-600 text-sm'>Loading...</span>
            </div>
          ) : projectsError ? (
            <div className='bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-sm'>
              Error loading projects.
            </div>
          ) : (
            <div className='relative'>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value) || null)}
                className='w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none'
                aria-label='Select project'
              >
                <option value=''>Choose a project</option>
                {projectsData?.data.map((project) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>
          )}
        </div>

        {/* Project Stats */}
        {selectedProjectId && membersData?.data && (
          <div className='space-y-4'>
            <div className='bg-blue-50 p-3 rounded-lg'>
              <div className='flex items-center'>
                <Users className='w-5 h-5 text-blue-600 mr-2' />
                <div>
                  <p className='text-xs text-blue-600'>Total Members</p>
                  <p className='text-lg font-semibold'>{membersData.data.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-green-50 p-3 rounded-lg'>
              <div className='flex items-center'>
                <CheckCircle className='w-5 h-5 text-green-600 mr-2' />
                <div>
                  <p className='text-xs text-green-600'>Active Members</p>
                  <p className='text-lg font-semibold'>
                    {membersData.data.filter((m) => m.status === 'ACCEPTED').length}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-amber-50 p-3 rounded-lg'>
              <div className='flex items-center'>
                <Clock className='w-5 h-5 text-amber-600 mr-2' />
                <div>
                  <p className='text-xs text-amber-600'>Pending Invites</p>
                  <p className='text-lg font-semibold'>
                    {
                      membersData.data.filter(
                        (m) => m.status === 'CREATED' || m.status === 'INVITED'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-6 overflow-auto'>
        <div className='max-w-5xl mx-auto'>
          {/* Header */}
          <div className='mb-6 flex justify-between items-center'>
            <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
              <Users className='w-5 h-5 text-purple-600 mr-2' />
              Team Members
              {selectedProject && (
                <span className='ml-2 text-sm text-gray-500'>{selectedProject.projectName}</span>
              )}
            </h2>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className='flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              aria-label='Open add member modal'
              disabled={!selectedProjectId}
            >
              <UserPlus className='w-5 h-5 mr-2' />
              Add Member
            </button>
          </div>

          {/* Search Bar */}
          {selectedProjectId && (
            <div className='mb-6'>
              <div className='flex items-center border border-gray-300 rounded-md w-80 px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white'>
                <CustomSearchIcon className='w-4 h-4 text-gray-400 mr-2' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search members...'
                  className='ml-2 flex-1 bg-white border-none outline-none appearance-none text-sm text-gray-700 placeholder-gray-400'
                  style={{ all: 'unset', width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Members List */}
          {selectedProjectId && (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              {membersLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600'></div>
                  <span className='ml-3 text-gray-600 text-sm'>Loading team members...</span>
                </div>
              ) : filteredMembers.length > 0 ? (
                <div className='divide-y divide-gray-200'>
                  {filteredMembers.map((member) => (
                    <div key={member.id} className='p-4 hover:bg-gray-50 transition-colors'>
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        <div className='flex items-center space-x-4'>
                          <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className='text-sm font-semibold text-gray-900'>
                              {member.fullName}
                            </h3>
                            <div className='flex items-center text-xs text-gray-500'>
                              <Mail className='w-4 h-4 mr-1' />
                              {member.email || 'No email'}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-4'>
                          <StatusBadge status={member.status} />
                          {(member.status === 'CREATED' || member.status === 'INVITED') && (
                            <button
                              onClick={() =>
                                handleSendInvitation(selectedProjectId!, member.accountId)
                              }
                              className='inline-flex items-center bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition-colors'
                              disabled={invitationLoading}
                              aria-label={`Send invitation to ${member.email || 'member'}`}
                            >
                              <Send className='w-4 h-4 mr-1' />
                              {invitationLoading ? 'Sending...' : 'Send Invite'}
                            </button>
                          )}
                        </div>
                      </div>
                      <PositionManager
                        positions={member.projectPositions}
                        availablePositions={positionsData?.data || []}
                        onAddPosition={(position) => handleAddPosition(member.id, position)}
                        onRemovePosition={(positionId) =>
                          handleRemovePosition(member.id, positionId)
                        }
                        isLoading={addPositionLoading || removePositionLoading}
                        memberId={member.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <Users className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                  <p className='text-sm text-gray-500'>
                    {searchTerm
                      ? 'No members found matching your search'
                      : 'No members found for this project'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className='mt-2 text-blue-600 hover:text-blue-800 text-sm transition-colors'
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className='fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
            aria-label='Open add member modal'
            disabled={!selectedProjectId}
          >
            <UserPlus className='w-6 h-6' />
          </button>

          {/* Add Member Modal */}
          {isAddMemberModalOpen && (
            <div
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              <div
                className='bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all scale-100'
                onClick={(e) => e.stopPropagation()}
                role='dialog'
                aria-modal='true'
                aria-label='Add new member modal'
              >
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-lg font-semibold text-gray-800 flex items-center'>
                    <UserPlus className='w-5 h-5 text-green-600 mr-2' />
                    Add New Member
                    {selectedProject && (
                      <span className='ml-2 text-sm text-gray-500'>
                        to {selectedProject.projectName}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className='text-gray-500 hover:text-gray-700'
                    aria-label='Close modal'
                  >
                    <X className='w-5 h-5' />
                  </button>
                </div>
                <form onSubmit={handleAddMember} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select Team Member
                    </label>
                    {accountsLoading ? (
                      <div className='flex items-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                        <span className='ml-2 text-gray-600 text-sm'>Loading members...</span>
                      </div>
                    ) : accountsError ? (
                      <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm'>
                        Error loading members.
                      </div>
                    ) : availableAccounts.length > 0 ? (
                      <div className='relative'>
                        <select
                          value={selectedAccountId || ''}
                          onChange={(e) => setSelectedAccountId(Number(e.target.value) || null)}
                          className='w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none disabled:opacity-50'
                          disabled={createLoading || accountsLoading}
                          aria-label='Select team member'
                        >
                          <option value=''>Choose a team member</option>
                          {availableAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.fullName} • {account.email || 'No email'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className='absolute right-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                      </div>
                    ) : (
                      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700 text-sm'>
                        All available members are already added to this project.
                      </div>
                    )}
                    {emailError && (
                      <div className='mt-2 bg-red-50 border-l-4 border-red-400 p-2 text-red-700 text-sm rounded'>
                        {emailError}
                      </div>
                    )}
                  </div>
                  <button
                    type='submit'
                    className='w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors'
                    disabled={
                      createLoading ||
                      accountsLoading ||
                      !selectedProjectId ||
                      availableAccounts.length === 0
                    }
                    aria-label='Add member to project'
                  >
                    {createLoading ? (
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Adding Member...
                      </div>
                    ) : (
                      <div className='flex items-center justify-center'>
                        <UserPlus className='w-5 h-5 mr-2' />
                        Add Member to Team
                      </div>
                    )}
                  </button>
                </form>
                <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700'>
                  <strong>Note:</strong> After adding a member, assign positions using the position
                  manager in the members list.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteesMemberPage;
