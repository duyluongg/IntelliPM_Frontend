import React, { useState } from 'react';
import { ChevronDown, LineChart, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';

// Custom Search Icon Component
const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill='none'
    viewBox='0 0 16 16'
    role='presentation'
    {...props} // Spread props to allow className and other SVG attributes
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

interface BacklogHeaderProps {
  onSearch: (query: string) => void;
  projectId: number;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
}

const BacklogHeader: React.FC<BacklogHeaderProps> = ({ onSearch, projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  const {
    data: membersData,
    isLoading,
    error,
  } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  const members: Member[] =
    membersData?.data
      ?.filter((member) => member.status.toUpperCase() === 'ACTIVE')
      ?.map((member) => ({
        id: member.id,
        name: member.fullName || member.accountName || 'Unknown',
        avatar: member.picture || 'https://via.placeholder.com/30',
      })) || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleMembers = () => {
    setIsMembersExpanded(!isMembersExpanded);
  };

  if (isLoading) {
    return <div className='p-4 text-center text-gray-500'>Loading members...</div>;
  }

  if (error) {
    return (
      <div className='p-4 text-center text-red-500'>
        Error loading members: {(error as any)?.data?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between px-6 py-3 bg-white'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center border border-gray-300 rounded-md w-64 px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white'>
          <CustomSearchIcon className='w-4 h-4 text-gray-400 mr-2' />
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearch}
            placeholder='Search backlog...'
            className='ml-2 flex-1 bg-white border-none outline-none appearance-none text-sm text-gray-700 placeholder-gray-400'
            style={{ all: 'unset', width: '100%' }}
          />
        </div>

        {/* Members Display */}
        <div className='flex items-center'>
          {members.length > 0 ? (
            isMembersExpanded ? (
              <div className='flex items-center'>
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className='relative w-8 h-8 group'
                    style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                  >
                    <img
                      src={member.avatar}
                      alt={`${member.name} avatar`}
                      className='w-8 h-8 rounded-full object-cover border cursor-pointer'
                      onClick={toggleMembers}
                    />
                    <span className='absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5
                 text-xs bg-gray-800 text-white rounded 
                 opacity-0 group-hover:opacity-100 transition-opacity 
                 whitespace-nowrap'>
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='relative w-8 h-8 group'>
                <img
                  src={members[0].avatar}
                  alt={`${members[0].name} avatar`}
                  className='w-8 h-8 rounded-full object-cover border cursor-pointer'
                  onClick={toggleMembers}
                />
                <span
                  className='absolute top-full left-1/2 mt-1 px-2 py-0.5
               text-xs bg-gray-800 text-white rounded 
               opacity-0 group-hover:opacity-100 transition-opacity 
               whitespace-nowrap pointer-events-none z-10'
                  style={{ transform: 'translateX(-50%)' }} // luôn căn giữa
                >
                  {members[0].name}
                </span>
                {members.length > 1 && (
                  <div
                    className='absolute -right-3 -bottom-1 bg-gray-100 border text-xs text-gray-700 px-1 rounded-full cursor-pointer'
                    onClick={toggleMembers}
                  >
                    +{members.length - 1}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className='text-xs text-gray-500'>No active members</div>
          )}
        </div>

        {/* Epic Dropdown */}
        <button className='flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50'>
          Epic <ChevronDown className='w-4 h-4 ml-1' />
        </button>

        {/* Type Dropdown */}
        <button className='flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50'>
          Type <ChevronDown className='w-4 h-4 ml-1' />
        </button>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center gap-2'>
        <button className='p-2 rounded hover:bg-gray-100'>
          <LineChart className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 rounded hover:bg-gray-100'>
          <SlidersHorizontal className='w-5 h-5 text-gray-700' />
        </button>
        <button className='p-2 rounded hover:bg-gray-100'>
          <MoreHorizontal className='w-5 h-5 text-gray-700' />
        </button>
      </div>
    </div>
  );
};

export default BacklogHeader;
