import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { ChevronDown, LineChart, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';

interface BacklogHeaderProps {
  onSearch: (query: string) => void;
  projectId: number;
}

const BacklogHeader: React.FC<BacklogHeaderProps> = ({ onSearch, projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  const { data: membersData, isLoading, error } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  // Filter members with status IN_PROGRESS
  const members = membersData?.data
    ?.filter(member => member.status.toUpperCase() === 'IN_PROGRESS')
    ?.map(member => ({
      id: member.id,
      name: member.fullName || member.accountName || 'Unknown',
      avatar: member.picture || 'https://via.placeholder.com/30',
    })) || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading members...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading members: {(error as any)?.data?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search backlog..."
            className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      alt={`${member.name} avatar`}
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
                  alt={`${members[0].name} avatar`}
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
            <div className="text-xs text-gray-500">No active members</div>
          )}
        </div>

        <button className="flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Epic <ChevronDown className="w-4 h-4 ml-1" />
        </button>

        <button className="flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Type <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded hover:bg-gray-100">
          <LineChart className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default BacklogHeader;