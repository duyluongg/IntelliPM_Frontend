import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import { type MilestoneResponseDTO } from '../../../services/milestoneApi';
import { useAuth } from '../../../services/AuthContext';
interface MilestoneHeaderProps {
  projectKey: string;
  projectId: number;
  sprints: SprintWithTaskListResponseDTO[];
  milestones: MilestoneResponseDTO[];
  keyFilter: string | null;
  onCreateMilestone: () => void;
  onSortChange: (dateFilter: string, sprintFilter: string | null) => void;
  onKeyFilter: (key: string | null) => void;
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({ projectKey, projectId, sprints, milestones, keyFilter, onCreateMilestone, onSortChange, onKeyFilter }) => {
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [dateFilter, setDateFilter] = useState('All');
  const [sprintFilter, setSprintFilter] = useState<string | null>('All');
  const { user } = useAuth();
  const accountId = user?.id;




  const { data: membersData, isLoading: membersLoading } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  // tìm chính mình trong danh sách members của project
const me = (membersData as any)?.data?.find(
  (m: any) => m?.accountId === accountId || m?.id === accountId
);


const roleName = String(
  me?.positionName ?? me?.role ?? me?.position?.name ?? user?.role ?? ''
).toUpperCase();


const isClient = roleName === 'CLIENT';

  const members = membersData?.data
    ?.filter((member) => member.status.toUpperCase() === 'ACTIVE')
    ?.map((member) => ({
      id: member.id,
      name: member.fullName || member.accountName || 'Unknown',
      avatar: member.picture || 'https://via.placeholder.com/30',
    })) || [];

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const thisWeekMilestones = milestones.filter((milestone) => {
    const endDate = new Date(milestone.endDate);
    return endDate >= startOfWeek && endDate <= endOfWeek;
  });

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDateFilter = e.target.value;
    setDateFilter(newDateFilter);
    onSortChange(newDateFilter, sprintFilter);
  };

  const handleSprintFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSprintFilter = e.target.value === 'All' ? 'All' : e.target.value === '' ? null : e.target.value;
    setSprintFilter(newSprintFilter);
    onSortChange(dateFilter, newSprintFilter);
  };

  if (membersLoading) {
    return (
      <div className="p-4 text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={handleDateFilterChange}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="Next Week">Next Week</option>
            <option value="This Month">This Month</option>
            <option value="Next Month">Next Month</option>
          </select>
          <select
            value={sprintFilter || ''}
            onChange={handleSprintFilterChange}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="All">All Sprints</option>
            <option value="">No Sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
        {!isClient && (
        <div className="flex items-center">
          {members.length > 0 ? (
            isMembersExpanded ? (
              <div className="flex space-x-2 overflow-x-auto max-w-xs py-2">
                {members.map((member) => (
                  <div key={member.id} className="relative group">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                      onClick={toggleMembers}
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={members[0].avatar}
                  alt={members[0].name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                  onClick={toggleMembers}
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {members[0].name}
                </span>
                {members.length > 1 && (
                  <div
                    className="absolute -right-2 -bottom-1 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full cursor-pointer"
                    onClick={toggleMembers}
                  >
                    +{members.length - 1}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          )}
        </div>
        )}
      </div>
      <div className="flex justify-center items-center max-w-md mx-auto">
        {thisWeekMilestones.length > 0 || keyFilter ? (
          <div className="flex flex-wrap gap-2">
            {thisWeekMilestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onKeyFilter(milestone.key ?? null)}
                className="px-2 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded-md font-medium hover:bg-yellow-200 transition-all duration-200"
              >
                {milestone.key}
              </button>
            ))}
            {keyFilter && (
              <button
                onClick={() => onKeyFilter(null)}
                className="px-2 py-1 bg-gray-200 border border-gray-300 text-gray-700 text-sm rounded-md font-medium hover:bg-gray-300 transition-all duration-200"
              >
                View All
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">No milestones due this week</span>
        )}
      </div>
      <div className="flex items-center gap-3">
{!isClient && (
  <button
    onClick={onCreateMilestone}
    className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
  >
    <Plus className="w-5 h-5 mr-2" />
    Create Milestone
  </button>
)}

      </div>
    </div>
  );
};

export default MilestoneHeader;