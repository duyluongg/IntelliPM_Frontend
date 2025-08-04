import React, { useState, useEffect, useRef } from 'react';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import {
  useCreateProjectMemberMutation,
  useDeleteProjectMemberMutation,
  useGetProjectMembersWithPositionsQuery,
} from '../../../services/projectMemberApi';
import {
  useCreateProjectPositionMutation,
  useDeleteProjectPositionMutation,
} from '../../../services/projectPositionApi';
import { useGetAccountByEmailQuery } from '../../../services/accountApi';
import type { ProjectMember } from '../../../services/projectApi';
import { UserPlus, Plus, X, Mail } from 'lucide-react';

interface MembersSectionProps {
  projectMembers: ProjectMember[];
  projectId: number;
  refetch: () => void;
}

interface FetchBaseQueryError {
  status: number;
  data?: { message?: string };
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error != null && 'status' in error && 'data' in error;

const PROTECTED_POSITIONS = ['PROJECT_MANAGER', 'TEAM_LEADER', 'CLIENT'];

const MembersSection: React.FC<MembersSectionProps> = ({ projectMembers, projectId, refetch }) => {
  const [isAddMemberPopupOpen, setIsAddMemberPopupOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState<{ [key: number]: boolean }>({});
  const [isAddingMember, setIsAddingMember] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  const addPositionRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetCategoriesByGroupQuery('account_position');
  const {
    data: membersResponse,
    isLoading: isMembersLoading,
    refetch: refetchMembers,
  } = useGetProjectMembersWithPositionsQuery(projectId);
  const [createProjectMember] = useCreateProjectMemberMutation();
  const [deleteProjectMember] = useDeleteProjectMemberMutation();
  const [createProjectPosition] = useCreateProjectPositionMutation();
  const [deleteProjectPosition] = useDeleteProjectPositionMutation();
  const {
    data: accountData,
    isLoading: isAccountLoading,
    error: accountError,
  } = useGetAccountByEmailQuery(newMemberEmail, { skip: !newMemberEmail });

  const positions = positionsData?.data || [];
  const members = membersResponse?.data || projectMembers;

  const groupedMembers = {
    Manager: [] as ProjectMember[],
    Leader: [] as ProjectMember[],
    Client: [] as ProjectMember[],
    Member: [] as ProjectMember[],
  };

  members.forEach((member) => {
    const roles = member.projectPositions.map((p) => p.position.toUpperCase());
    if (roles.includes('PROJECT_MANAGER')) groupedMembers.Manager.push(member);
    else if (roles.includes('TEAM_LEADER')) groupedMembers.Leader.push(member);
    else if (roles.includes('CLIENT')) groupedMembers.Client.push(member);
    else groupedMembers.Member.push(member);
  });

  useEffect(() => {
    if (isAddMemberPopupOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isAddMemberPopupOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (positionRef.current && !positionRef.current.contains(event.target as Node)) {
        setIsAddPositionOpen((prev) => ({ ...prev, 0: false }));
      }
      Object.entries(addPositionRef.current).forEach(([memberId, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setIsAddPositionOpen((prev) => ({ ...prev, [memberId]: false }));
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getErrorMessage = (error: unknown): string => {
    if (isFetchBaseQueryError(error)) {
      return error.data?.message || 'An error occurred.';
    }
    return 'An error occurred.';
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      setMemberError('Email is required');
      return;
    }
    if (!accountData?.data) {
      setMemberError(accountError ? getErrorMessage(accountError) : 'Account not found');
      return;
    }
    if (!accountData.data.id) {
      setMemberError('Invalid account data');
      return;
    }
    if (accountData?.data?.id && members.some((m) => m.accountId === accountData.data!.id)) {
      setMemberError('Member already exists in project');
      return;
    }
    try {
      setIsAddingMember(true);
      const memberResponse = await createProjectMember({
        projectId,
        request: { accountId: accountData.data.id },
      }).unwrap();
      if (selectedPositions.length > 0 && memberResponse.data?.id) {
        for (const position of selectedPositions) {
          await createProjectPosition({
            projectMemberId: memberResponse.data.id,
            position: { position },
          }).unwrap();
        }
      }
      setNewMemberEmail('');
      setSelectedPositions([]);
      setMemberError(null);
      setIsAddMemberPopupOpen(false);
      refetchMembers();
      refetch();
    } catch (error) {
      setMemberError(getErrorMessage(error));
      console.error('Failed to add project member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this project member?')) {
      try {
        await deleteProjectMember({ projectId, id: memberId }).unwrap();
        refetchMembers();
        refetch();
      } catch (error) {
        setMemberError(getErrorMessage(error));
        console.error('Failed to delete project member:', error);
      }
    }
  };

  const handleAddPosition = async (memberId: number, position: string) => {
    if (
      members.find((m) => m.id === memberId)?.projectPositions.some((p) => p.position === position)
    ) {
      setMemberError('Position already assigned');
      return;
    }
    try {
      await createProjectPosition({
        projectMemberId: memberId,
        position: { position },
      }).unwrap();
      setIsAddPositionOpen((prev) => ({ ...prev, [memberId]: false }));
      refetchMembers();
      refetch();
    } catch (error) {
      setMemberError(getErrorMessage(error));
      console.error('Failed to add position:', error);
    }
  };

  const handleDeletePosition = async (memberId: number, positionId: number, position: string) => {
    if (PROTECTED_POSITIONS.includes(position.toUpperCase())) {
      setMemberError('Cannot delete protected position');
      return;
    }
    try {
      await deleteProjectPosition({ projectMemberId: memberId, positionId }).unwrap();
      refetchMembers();
      refetch();
    } catch (error) {
      setMemberError(getErrorMessage(error));
      console.error('Failed to delete position:', error);
    }
  };

  const handleTogglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]
    );
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailClick = (email: string) => {
    console.log('Email clicked:', email); // Debugging
    if (isValidEmail(email)) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
      const newWindow = window.open(gmailUrl, '_blank');
      if (!newWindow) {
        setErrorMessage(
          'Failed to open Gmail. Please allow pop-ups or check your browser settings.'
        );
        setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
      }
    } else {
      console.error('Invalid email:', email);
      setErrorMessage('Invalid email address.');
      setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
    }
  };

  const handleMouseEnter = (email: string) => {
    console.log('Hovering email:', email); // Debugging tooltip hover
  };

  const renderSingleRowMembers = (title: string, members: ProjectMember[]) => (
    <div className='mb-8'>
      <h3 className='text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-4'>
        {title} ({members.length})
      </h3>
      <div className='flex flex-wrap gap-4'>
        {members.map((member) => (
          <div
            key={member.id}
            className='relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)]'
          >
            <button
              onClick={() => handleDeleteMember(member.id)}
              className='absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300'
              title={`Remove ${member.fullName}`}
              aria-label={`Remove ${member.fullName}`}
            >
              <X className='w-4 h-4' />
            </button>
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className='w-12 h-12 rounded-full object-cover border-2 border-blue-100'
            />
            <div className='flex flex-col flex-grow'>
              <div className='font-semibold text-gray-900 text-base'>{member.fullName}</div>
              <div className='text-sm text-gray-500 font-normal'>
                {member.email && isValidEmail(member.email) ? (
                  <button
                    onClick={() => handleEmailClick(member.email!)}
                    onMouseEnter={() => handleMouseEnter(member.email!)}
                    className='relative flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group z-10 max-w-[300px]'
                    role='button'
                    aria-label={`Email ${member.fullName}`}
                  >
                    <Mail className='w-4 h-4 text-blue-500 shrink-0' />
                    <span className='truncate inline-block overflow-hidden whitespace-nowrap max-w-[120px]'>
                      {member.email}
                    </span>
                    <span className='absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-fit z-20'>
                      Send to {member.email}
                    </span>
                  </button>
                ) : (
                  <span className='text-gray-400 italic'>No email provided</span>
                )}
              </div>
              <div
                className='relative flex flex-wrap gap-2 mt-2'
                ref={(el) => {
                  addPositionRef.current[member.id] = el;
                }}
              >
                {member.projectPositions.length > 0 ? (
                  member.projectPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className='relative flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium'
                    >
                      <span>{pos.position}</span>
                      {!PROTECTED_POSITIONS.includes(pos.position.toUpperCase()) && (
                        <button
                          onClick={() => handleDeletePosition(member.id, pos.id, pos.position)}
                          className='absolute -top-1 -right-1 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-0.5 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300'
                          title={`Remove ${pos.position}`}
                          aria-label={`Remove ${pos.position}`}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className='text-sm text-gray-500'>No positions assigned</span>
                )}
                <button
                  onClick={() =>
                    setIsAddPositionOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))
                  }
                  className='flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300'
                  disabled={isPositionsLoading}
                  aria-expanded={isAddPositionOpen[member.id]}
                  aria-haspopup='listbox'
                >
                  <Plus className='w-3 h-3' />
                  Add Position
                </button>
                {isAddPositionOpen[member.id] && (
                  <ul className='absolute z-50 w-48 bg-white border border-gray-100 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto top-full left-0'>
                    {positions.map((pos) => (
                      <li
                        key={pos.id}
                        onClick={() => handleAddPosition(member.id, pos.name)}
                        className='px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-900 transition-colors duration-200 focus:outline-none focus:bg-blue-50'
                        role='option'
                      >
                        {pos.iconLink && <img src={pos.iconLink} alt='' className='w-4 h-4' />}
                        {pos.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridMembers = (title: string, members: ProjectMember[]) => (
    <div className='mb-8'>
      <h3 className='text-lg font-semibold text-gray-900 mb-3 border-l-4 border-blue-500 pl-4'>
        {title} ({members.length})
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {members.map((member) => (
          <div
            key={member.id}
            className='relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300'
          >
            <button
              onClick={() => handleDeleteMember(member.id)}
              className='absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300'
              title={`Remove ${member.fullName}`}
              aria-label={`Remove ${member.fullName}`}
            >
              <X className='w-4 h-4' />
            </button>
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className='w-12 h-12 rounded-full object-cover border-2 border-blue-100'
            />
            <div className='flex flex-col gap-1 flex-grow'>
              <div className='font-semibold text-gray-900 text-base'>{member.fullName}</div>
              <div className='text-sm text-gray-500 font-normal'>
                {member.email && isValidEmail(member.email) ? (
                  <button
                    onClick={() => handleEmailClick(member.email!)}
                    onMouseEnter={() => handleMouseEnter(member.email!)}
                    className='relative flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group z-10 max-w-[300px]'
                    role='button'
                    aria-label={`Email ${member.fullName}`}
                  >
                    <Mail className='w-4 h-4 text-blue-500 shrink-0' />
                    <span className='truncate inline-block overflow-hidden whitespace-nowrap max-w-[120px]'>
                      {member.email}
                    </span>
                    <span className='absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-fit z-20'>
                      Send to {member.email}
                    </span>
                  </button>
                ) : (
                  <span className='text-gray-400 italic'>No email provided</span>
                )}
              </div>

              <div
                className='relative flex flex-wrap gap-2 mt-2'
                ref={(el) => {
                  addPositionRef.current[member.id] = el;
                }}
              >
                {member.projectPositions.length > 0 ? (
                  member.projectPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className='relative flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium'
                    >
                      <span>{pos.position}</span>
                      {!PROTECTED_POSITIONS.includes(pos.position.toUpperCase()) && (
                        <button
                          onClick={() => handleDeletePosition(member.id, pos.id, pos.position)}
                          className='absolute -top-1 -right-1 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-0.5 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300'
                          title={`Remove ${pos.position}`}
                          aria-label={`Remove ${pos.position}`}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className='text-sm text-gray-500'>No positions assigned</span>
                )}
                <button
                  onClick={() =>
                    setIsAddPositionOpen((prev) => ({ ...prev, [member.id]: !prev[member.id] }))
                  }
                  className='flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300'
                  disabled={isPositionsLoading}
                  aria-expanded={isAddPositionOpen[member.id]}
                  aria-haspopup='listbox'
                >
                  <Plus className='w-3 h-3' />
                  Add Position
                </button>
                {isAddPositionOpen[member.id] && (
                  <ul className='absolute z-50 w-48 bg-white border border-gray-100 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto top-full left-0'>
                    {positions.map((pos) => (
                      <li
                        key={pos.id}
                        onClick={() => handleAddPosition(member.id, pos.name)}
                        className='px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-900 transition-colors duration-200 focus:outline-none focus:bg-blue-50'
                        role='option'
                      >
                        {pos.iconLink && <img src={pos.iconLink} alt='' className='w-4 h-4' />}
                        {pos.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className='max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm'>
      {memberError && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            ></path>
          </svg>
          Error: {memberError}
        </div>
      )}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold text-gray-900 border-b-2 pb-2 border-blue-100'>
          Project Members ({projectMembers.length})
        </h2>
        <button
          onClick={() => setIsAddMemberPopupOpen(true)}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300'
          disabled={isAddingMember}
        >
          {isAddingMember ? (
            <svg
              className='animate-spin h-4 w-4 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
          ) : (
            <UserPlus className='w-4 h-4' />
          )}
          Add Member
        </button>
      </div>
      {renderSingleRowMembers('Project Manager', groupedMembers.Manager)}
      {renderSingleRowMembers('Team Leader', groupedMembers.Leader)}
      {renderSingleRowMembers('Client', groupedMembers.Client)}
      {renderGridMembers('Team Members', groupedMembers.Member)}

      {isAddMemberPopupOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
          <div className='bg-white border border-gray-100 p-6 rounded-2xl shadow-xl w-full max-w-md relative'>
            {isAddingMember && (
              <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-2xl'>
                <svg
                  className='animate-spin h-5 w-5 text-blue-600'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              </div>
            )}
            <h3 className='text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-500 pl-4'>
              Add New Project Member
            </h3>
            <div className='space-y-5'>
              <div>
                <label className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                  <UserPlus className='w-4 h-4 text-blue-600' /> Email *
                </label>
                <input
                  ref={emailInputRef}
                  type='email'
                  placeholder='Enter email'
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className={`mt-1 block w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
                    memberError ? 'border-red-300' : 'border-gray-200'
                  }`}
                  aria-describedby='email-error'
                />
                {memberError && (
                  <p id='email-error' className='text-red-600 text-xs mt-1.5'>
                    {memberError}
                  </p>
                )}
              </div>
              <div>
                <label className='text-sm font-medium text-gray-900 flex items-center gap-2'>
                  <UserPlus className='w-4 h-4 text-blue-600' /> Positions
                </label>
                <div className='relative mt-1' ref={positionRef}>
                  <button
                    type='button'
                    onClick={() => setIsAddPositionOpen((prev) => ({ ...prev, 0: !prev[0] }))}
                    className={`w-full border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                      isPositionsLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500'
                    }`}
                    disabled={isPositionsLoading}
                    aria-expanded={isAddPositionOpen[0]}
                    aria-haspopup='listbox'
                  >
                    <span className='flex items-center gap-2 flex-wrap'>
                      {selectedPositions.length > 0
                        ? selectedPositions.join(', ')
                        : 'Select Positions'}
                    </span>
                    <Plus className='w-4 h-4 text-blue-600' />
                  </button>
                  {isAddPositionOpen[0] && (
                    <ul className='absolute z-50 w-full bg-white border border-gray-100 rounded-xl mt-2 shadow-lg max-h-60 overflow-auto'>
                      {positions.map((pos) => (
                        <li
                          key={pos.id}
                          onClick={() => handleTogglePosition(pos.name)}
                          className={`px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-gray-900 transition-colors duration-200 ${
                            selectedPositions.includes(pos.name) ? 'bg-blue-50' : ''
                          } focus:outline-none focus:bg-blue-50`}
                          role='option'
                          aria-selected={selectedPositions.includes(pos.name)}
                        >
                          {pos.iconLink && <img src={pos.iconLink} alt='' className='w-4 h-4' />}
                          {pos.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={() => {
                  setIsAddMemberPopupOpen(false);
                  setNewMemberEmail('');
                  setSelectedPositions([]);
                  setMemberError(null);
                }}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300'
                disabled={isAccountLoading || isPositionsLoading || isAddingMember}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className='px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300'
                disabled={
                  isAccountLoading || isPositionsLoading || !newMemberEmail || isAddingMember
                }
              >
                {isAddingMember ? (
                  <svg
                    className='animate-spin h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MembersSection;
