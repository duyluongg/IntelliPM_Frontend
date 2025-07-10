import React, { useState, useEffect, useRef } from 'react';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateProjectMemberMutation, useDeleteProjectMemberMutation, useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useCreateProjectPositionMutation, useDeleteProjectPositionMutation } from '../../../services/projectPositionApi';
import { useGetAccountByEmailQuery } from '../../../services/accountApi';
import type { ProjectMember } from '../../../services/projectApi';
import { Trash2, UserPlus, Plus, X } from 'lucide-react';

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

  const { data: positionsData, isLoading: isPositionsLoading } = useGetCategoriesByGroupQuery('account_position');
  const { data: membersResponse, isLoading: isMembersLoading, refetch: refetchMembers } = useGetProjectMembersWithPositionsQuery(projectId);
  const [createProjectMember] = useCreateProjectMemberMutation();
  const [deleteProjectMember] = useDeleteProjectMemberMutation();
  const [createProjectPosition] = useCreateProjectPositionMutation();
  const [deleteProjectPosition] = useDeleteProjectPositionMutation();
  const { data: accountData, isLoading: isAccountLoading, error: accountError } = useGetAccountByEmailQuery(newMemberEmail, { skip: !newMemberEmail });

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
        setIsAddPositionOpen({});
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
    if (members.find((m) => m.accountId === memberId)?.projectPositions.some((p) => p.position === position)) {
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

  const renderSingleRowMembers = (title: string, members: ProjectMember[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[#1c73fd] mb-2 border-l-4 border-[#1c73fd] pl-3">
        {title} ({members.length})
      </h3>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition w-full sm:w-auto relative"
          >
            <button
              onClick={() => handleDeleteMember(member.accountId)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 rounded-full p-1 transition-all duration-200 hover:scale-110"
              title={`Remove ${member.fullName}`}
              aria-label={`Remove ${member.fullName}`}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col flex-grow">
              <p className="font-medium text-gray-800">
                {member.fullName}{' '}
                <span className="text-sm text-gray-500">(@{member.username})</span>
              </p>
              <div className="relative flex flex-wrap gap-2 mt-1" ref={(el) => { addPositionRef.current[member.accountId] = el; }}>
                {member.projectPositions.length > 0 ? (
                  member.projectPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center gap-1 bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      <span>{pos.position}</span>
                      {!PROTECTED_POSITIONS.includes(pos.position.toUpperCase()) && (
                        <button
                          onClick={() => handleDeletePosition(member.accountId, pos.id, pos.position)}
                          className="text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
                          title={`Remove ${pos.position}`}
                          aria-label={`Remove ${pos.position}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-600">No positions assigned</span>
                )}
                <button
                  onClick={() => setIsAddPositionOpen((prev) => ({ ...prev, [member.accountId]: !prev[member.accountId] }))}
                  className="flex items-center gap-1 bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium hover:bg-[#1c73fd]/20"
                  disabled={isPositionsLoading}
                  aria-expanded={isAddPositionOpen[member.accountId]}
                  aria-haspopup="listbox"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {isAddPositionOpen[member.accountId] && (
                  <ul className="absolute z-40 w-48 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto top-full left-0">
                    {positions.map((pos) => (
                      <li
                        key={pos.id}
                        onClick={() => handleAddPosition(member.accountId, pos.name)}
                        className="px-3 py-1.5 text-sm hover:bg-[#1c73fd]/10 cursor-pointer flex items-center gap-2 text-gray-900"
                        role="option"
                      >
                        {pos.iconLink && <img src={pos.iconLink} alt="" className="w-4 h-4" />}
                        {pos.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridMembers = (title: string, members: ProjectMember[]) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-[#1c73fd] mb-3 border-l-4 border-[#1c73fd] pl-3">
          {title} ({members.length})
        </h3>
 
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all relative"
          >
            <button
              onClick={() => handleDeleteMember(member.accountId)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 rounded-full p-1 transition-all duration-200 hover:scale-110"
              title={`Remove ${member.fullName}`}
              aria-label={`Remove ${member.fullName}`}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={member.picture || 'https://i.pravatar.cc/40'}
              alt={member.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#1c73fd]/20"
            />
            <div className="flex flex-col gap-1 flex-grow">
              <p>
                <span className="font-medium text-gray-900">{member.fullName}</span>{' '}
                <span className="text-sm text-gray-500">(@{member.username})</span>
              </p>
              <div className="relative flex flex-wrap gap-2 mt-1" ref={(el) => { addPositionRef.current[member.accountId] = el; }}>
                {member.projectPositions.length > 0 ? (
                  member.projectPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center gap-1 bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      <span>{pos.position}</span>
                      {!PROTECTED_POSITIONS.includes(pos.position.toUpperCase()) && (
                        <button
                          onClick={() => handleDeletePosition(member.accountId, pos.id, pos.position)}
                          className="text-red-500 hover:text-red-600 transition-transform duration-200 hover:scale-110"
                          title={`Remove ${pos.position}`}
                          aria-label={`Remove ${pos.position}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-600">No positions assigned</span>
                )}
                <button
                  onClick={() => setIsAddPositionOpen((prev) => ({ ...prev, [member.accountId]: !prev[member.accountId] }))}
                  className="flex items-center gap-1 bg-[#1c73fd]/10 text-[#1c73fd] px-2 py-0.5 rounded-full text-xs font-medium hover:bg-[#1c73fd]/20"
                  disabled={isPositionsLoading}
                  aria-expanded={isAddPositionOpen[member.accountId]}
                  aria-haspopup="listbox"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {isAddPositionOpen[member.accountId] && (
                  <ul className="absolute z-40 w-48 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto top-full left-0">
                    {positions.map((pos) => (
                      <li
                        key={pos.id}
                        onClick={() => handleAddPosition(member.accountId, pos.name)}
                        className="px-3 py-1.5 text-sm hover:bg-[#1c73fd]/10 cursor-pointer flex items-center gap-2 text-gray-900"
                        role="option"
                      >
                        {pos.iconLink && <img src={pos.iconLink} alt="" className="w-4 h-4" />}
                        {pos.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto p-6 bg-white rounded-lg ">
      {memberError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          Error: {memberError}
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-[#1c73fd]/30">
          Project Members ({projectMembers.length})
        </h2>
        <button
          onClick={() => setIsAddMemberPopupOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 text-sm font-medium"
          disabled={isAddingMember}
        >
          {isAddingMember ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Add Member
        </button>
      </div>
      {renderSingleRowMembers('Project Manager', groupedMembers.Manager)}
      {renderSingleRowMembers('Team Leader', groupedMembers.Leader)}
      {renderSingleRowMembers('Client', groupedMembers.Client)}
      {renderGridMembers('Team Members', groupedMembers.Member)}

      {isAddMemberPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-6 rounded-2xl shadow-md w-full max-w-md">
            {isAddingMember && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-2xl">
                <svg className="animate-spin h-4 w-4 text-[#1c73fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
            <h3 className="text-xl font-semibold text-[#1c73fd] mb-4 border-l-4 border-[#1c73fd] pl-3">
              Add New Project Member
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#1c73fd]" /> Email *
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  placeholder="Enter email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className={`mt-1 block w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd] ${
                    memberError ? 'border-red-400' : 'border-gray-200'
                  }`}
                  aria-describedby="email-error"
                />
                {memberError && (
                  <p id="email-error" className="text-red-600 text-xs mt-1">{memberError}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#1c73fd]" /> Positions
                </label>
                <div className="relative mt-1" ref={positionRef}>
                  <button
                    type="button"
                    onClick={() => setIsAddPositionOpen((prev) => ({ ...prev, 0: !prev[0] }))}
                    className={`w-full border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-900 text-left flex items-center justify-between bg-white ${
                      isPositionsLoading ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#1c73fd]/30 focus:border-[#1c73fd]'
                    }`}
                    disabled={isPositionsLoading}
                    aria-expanded={isAddPositionOpen[0]}
                    aria-haspopup="listbox"
                  >
                    <span className="flex items-center gap-2">
                      {selectedPositions.length > 0 ? selectedPositions.join(', ') : 'Select Positions'}
                    </span>
                    <Plus className="w-4 h-4 text-[#1c73fd]" />
                  </button>
                  {isAddPositionOpen[0] && (
                    <ul className="absolute z-40 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                      {positions.map((pos) => (
                        <li
                          key={pos.id}
                          onClick={() => handleTogglePosition(pos.name)}
                          className={`px-3 py-1.5 text-sm hover:bg-[#1c73fd]/10 cursor-pointer flex items-center gap-2 text-gray-900 ${
                            selectedPositions.includes(pos.name) ? 'bg-[#1c73fd]/10' : ''
                          }`}
                          role="option"
                          aria-selected={selectedPositions.includes(pos.name)}
                        >
                          {pos.iconLink && <img src={pos.iconLink} alt="" className="w-4 h-4" />}
                          {pos.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddMemberPopupOpen(false);
                  setNewMemberEmail('');
                  setSelectedPositions([]);
                  setMemberError(null);
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                disabled={isAccountLoading || isPositionsLoading || isAddingMember}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-3 py-1.5 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#1a68e0] hover:to-[#3e7ed1] transition-all duration-200 text-sm font-medium"
                disabled={isAccountLoading || isPositionsLoading || !newMemberEmail || isAddingMember}
              >
                {isAddingMember ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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