import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';

interface MilestoneHeaderProps {
  projectKey: string;
  projectId: number;
  onCreateMilestone: () => void;
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({ projectKey, projectId, onCreateMilestone }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  const { data: membersData, isLoading: membersLoading } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  const members = membersData?.data
    ?.filter((member) => member.status.toUpperCase() === 'ACTIVE')
    ?.map((member) => ({
      id: member.id,
      name: member.fullName || member.accountName || 'Unknown',
      avatar: member.picture || 'https://via.placeholder.com/30',
    })) || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  if (membersLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-md w-64 px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
          <svg
            fill="none"
            viewBox="0 0 16 16"
            className="w-4 h-4 text-gray-400 mr-2"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search milestones..."
            className="flex-1 bg-white border-none outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center">
          {members.length > 0 ? (
            isMembersExpanded ? (
              <div className="flex items-center">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="relative w-8 h-8 group"
                    style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                      onClick={toggleMembers}
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-8 h-8 group">
                <img
                  src={members[0].avatar}
                  alt={members[0].name}
                  className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                  onClick={toggleMembers}
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {members[0].name}
                </span>
                {members.length > 1 && (
                  <div
                    className="absolute -right-3 -bottom-1 bg-gray-100 border text-xs text-gray-700 px-1 rounded-full cursor-pointer"
                    onClick={toggleMembers}
                  >
                    +{members.length - 1}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateMilestone}
          className="flex items-center bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Milestone
        </button>
      </div>
    </div>
  );
};

export default MilestoneHeader;
