import React, { useState } from 'react';
import { X, Users, UserPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { useGetTeamsByAccountIdQuery } from '../../../services/accountApi';

interface TeamMember {
  id: number;
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountPicture: string;
  projectId: number;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

interface Team {
  projectId: number;
  projectName: string;
  projectKey: string;
  totalMembers: number;
  members: TeamMember[];
}

interface TeamsPopupProps {
  accountId: number;
  onClose: () => void;
  onAddSelected: (selectedMembers: TeamMember[]) => void;
  existingEmails: string[];
}

const TeamsPopup: React.FC<TeamsPopupProps> = ({ accountId, onClose, onAddSelected, existingEmails }) => {
  const { data: teamsData, isLoading, isError, error } = useGetTeamsByAccountIdQuery(accountId);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<number[]>([]);
  // Track which project each accountId was selected from to avoid duplicates
  const [selectedMemberProjects, setSelectedMemberProjects] = useState<{ [accountId: number]: number }>({});

  // Toggle expand/collapse for a team
  const handleExpandToggle = (projectId: number) => {
    setExpandedTeams((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  // Check if a team can be selected (no members selected elsewhere or already in invitees)
  const canSelectTeam = (team: Team) => {
    return team.members.every(
      (member) =>
        (!selectedAccountIds.includes(member.accountId) || selectedMemberProjects[member.accountId] === team.projectId) &&
        !existingEmails.includes(member.accountEmail)
    );
  };

  // Toggle whole team select
  const handleTeamToggle = (projectId: number) => {
    const team = teamsData?.data.teams.find((t) => t.projectId === projectId);
    if (!team) return;

    const teamAccountIds = team.members.map((m) => m.accountId);

    if (selectedTeams.includes(projectId)) {
      // Unselect team
      setSelectedTeams((prev) => prev.filter((id) => id !== projectId));
      setSelectedAccountIds((prev) => prev.filter((id) => !teamAccountIds.includes(id)));
      setSelectedMemberProjects((prev) => {
        const updated = { ...prev };
        teamAccountIds.forEach((id) => delete updated[id]);
        return updated;
      });
    } else {
      // Select team (only select members not already selected or in invitees)
      const availableAccountIds = teamAccountIds.filter(
        (id) =>
          (!selectedAccountIds.includes(id) || selectedMemberProjects[id] === team.projectId) &&
          !existingEmails.includes(team.members.find((m) => m.accountId === id)?.accountEmail || '')
      );
      if (availableAccountIds.length > 0) {
        setSelectedTeams((prev) => [...prev, projectId]);
        setSelectedAccountIds((prev) => [...prev, ...availableAccountIds]);
        setSelectedMemberProjects((prev) => {
          const updated = { ...prev };
          availableAccountIds.forEach((id) => {
            updated[id] = team.projectId;
          });
          return updated;
        });
      }
    }
  };

  // Toggle single member select
  const handleMemberToggle = (member: TeamMember, projectId: number) => {
    const isChosenElsewhere =
      selectedAccountIds.includes(member.accountId) &&
      selectedMemberProjects[member.accountId] !== projectId;
    const isAlreadyInvited = existingEmails.includes(member.accountEmail);

    if (isChosenElsewhere || isAlreadyInvited) return;

    if (selectedAccountIds.includes(member.accountId)) {
      // Unselect member
      setSelectedAccountIds((prev) => {
        const updated = prev.filter((id) => id !== member.accountId);

        // If no members of the team are selected, uncheck the team
        const teamMembers = teamsData?.data.teams.find((t) => t.projectId === projectId)?.members || [];
        const stillSelected = teamMembers.some((m) => updated.includes(m.accountId));
        if (!stillSelected) {
          setSelectedTeams((prev) => prev.filter((id) => id !== projectId));
        }

        return updated;
      });
      setSelectedMemberProjects((prev) => {
        const updated = { ...prev };
        delete updated[member.accountId];
        return updated;
      });
    } else {
      // Select member
      setSelectedAccountIds((prev) => [...prev, member.accountId]);
      setSelectedMemberProjects((prev) => ({
        ...prev,
        [member.accountId]: projectId,
      }));

      // If all members of the team are selected, check the team
      const team = teamsData?.data.teams.find((t) => t.projectId === projectId);
      if (team && team.members.every((m) => [...selectedAccountIds, member.accountId].includes(m.accountId))) {
        setSelectedTeams((prev) => [...prev, projectId]);
      }
    }
  };

  // Submit selected members
  const handleAddSelected = () => {
    const selected = teamsData?.data.teams
      .flatMap((team) =>
        team.members.filter(
          (member) =>
            selectedAccountIds.includes(member.accountId) &&
            selectedMemberProjects[member.accountId] === team.projectId &&
            !existingEmails.includes(member.accountEmail)
        )
      )
      .filter((member): member is TeamMember => member !== undefined) || [];
    onAddSelected(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 relative max-h-[85vh] overflow-y-auto animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <Users className="text-[#1c73fd]" size={20} />
          <h4 className="text-xl font-bold text-[#1c73fd]">Previous Teams</h4>
        </div>

        {/* Loading / Error */}
        {isLoading && <p className="text-sm text-gray-500">Loading teams...</p>}
        {isError && <p className="text-sm text-red-500">Error: {error?.toString() || 'Unknown error'}</p>}

        {/* Teams List */}
        {teamsData?.isSuccess && teamsData.data.teams.length > 0 ? (
          <div className="space-y-4">
            {teamsData.data.teams.map((team) => {
              const isExpanded = expandedTeams.includes(team.projectId);
              const isTeamDisabled = !canSelectTeam(team);

              return (
                <div key={team.projectId} className="bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                  {/* Team Header */}
                  <div
                    className={`flex items-center gap-3 p-4 cursor-pointer ${isTeamDisabled ? 'opacity-50' : ''}`}
                    onClick={() => handleExpandToggle(team.projectId)}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.projectId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!isTeamDisabled) handleTeamToggle(team.projectId);
                      }}
                      className="h-4 w-4 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded"
                      disabled={isTeamDisabled}
                      onClick={(e) => e.stopPropagation()}
                      title={isTeamDisabled ? 'Some members are already added or selected in another project' : ''}
                    />
                    <div className="flex-1">
                      <h5 className="text-md font-semibold text-gray-800">
                        {team.projectName} <span className="text-gray-500">({team.projectKey})</span>
                      </h5>
                      <p className="text-xs text-gray-500">{team.members.length} members</p>
                    </div>
                  </div>

                  {/* Members */}
                  {isExpanded && (
                    <div className="px-6 pb-4 space-y-2">
                      {team.members.map((member) => {
                        const isSelected = selectedAccountIds.includes(member.accountId);
                        const isChosenElsewhere =
                          selectedAccountIds.includes(member.accountId) &&
                          selectedMemberProjects[member.accountId] !== team.projectId;
                        const isAlreadyInvited = existingEmails.includes(member.accountEmail);
                        const isDisabled = isChosenElsewhere || isAlreadyInvited;

                        return (
                          <div
                            key={member.id}
                            className={`flex items-center gap-3 p-2 rounded-md transition relative ${
                              isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => handleMemberToggle(member, team.projectId)}
                              className="h-4 w-4 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded"
                              title={
                                isAlreadyInvited
                                  ? 'This member is already added to the project'
                                  : isChosenElsewhere
                                  ? 'This member is already selected in another project'
                                  : ''
                              }
                            />
                            <img
                              src={member.accountPicture}
                              alt={`${member.accountName} avatar`}
                              className="w-8 h-8 rounded-full border border-gray-200"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{member.accountName}</p>
                              <p className="text-xs text-gray-500">{member.accountEmail}</p>
                              <p className="text-xs text-gray-400">Status: {member.status}</p>
                              {isDisabled && (
                                <p className="text-xs text-red-500 italic">
                                  {isAlreadyInvited
                                    ? 'Already added to project'
                                    : 'Already selected in another project'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Action Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleAddSelected}
                className={`px-5 py-2 flex items-center gap-2 rounded-lg text-white shadow-md transition-all ${
                  selectedAccountIds.length > 0
                    ? 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#1a68e0] hover:to-[#3e7ed1]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedAccountIds.length === 0}
              >
                <UserPlus size={16} />
                Add Selected ({selectedAccountIds.length})
              </button>
            </div>
          </div>
        ) : (
          !isLoading && <p className="text-sm text-gray-500">No previous teams found</p>
        )}
      </div>
    </div>
  );
};

export default TeamsPopup;
