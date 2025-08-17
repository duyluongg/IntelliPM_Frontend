import React, { useState } from 'react';
import { ChevronDown, LineChart, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import CompleteSprintPopup from './CompleteSprintPopup';
import { useGetTasksBySprintIdQuery } from '../../../services/taskApi';
import { useGetActiveSprintByProjectKeyQuery } from '../../../services/sprintApi';
import { User2 } from 'lucide-react';

const SprintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill='none'
    viewBox='0 0 16 16'
    role='presentation'
    {...props}
    className='w-4 h-4 mr-1 text-gray-700'
  >
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M8 1.5A4.75 4.75 0 0 0 8 11h5.44l-2.22-2.22 1.06-1.06 3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5-1.06-1.06 2.22-2.22H0V11h3.938A6.25 6.25 0 1 1 14.25 6.25h-1.5A4.75 4.75 0 0 0 8 1.5'
      clipRule='evenodd'
    />
  </svg>
);

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

const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface BacklogHeaderProps {
  projectKey: string;
  sprintName?: string;
  projectId: number;
  onSearch: (query: string) => void;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
}

const KanbanHeader: React.FC<BacklogHeaderProps> = ({
  projectKey,
  sprintName,
  projectId,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [isSprintDropdownOpen, setIsSprintDropdownOpen] = useState(false);
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useGetProjectMembersWithPositionsQuery(projectId, {
    skip: !projectId || projectId === 0,
  });

  const {
    data: sprintData,
    isLoading: sprintLoading,
    error: sprintError,
  } = useGetActiveSprintByProjectKeyQuery(projectKey, {
    skip: !projectId || projectId === 0,
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useGetTasksBySprintIdQuery(sprintData?.id ?? 0, {
    skip: !sprintData?.id,
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

  const toggleSprintDropdown = () => {
    setIsSprintDropdownOpen(!isSprintDropdownOpen);
  };

  const toggleCompletePopup = () => {
    setIsCompletePopupOpen(!isCompletePopupOpen);
  };

  const sprint = {
    name: sprintData?.name || sprintName || 'No active sprint',
    startDate: sprintData?.plannedStartDate
      ? formatDate(sprintData.plannedStartDate)
      : sprintData?.startDate
      ? formatDate(sprintData.startDate)
      : 'N/A',
    endDate: sprintData?.plannedEndDate
      ? formatDate(sprintData.plannedEndDate)
      : sprintData?.endDate
      ? formatDate(sprintData.endDate)
      : 'N/A',
    daysLeft: sprintData?.plannedEndDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(sprintData.plannedEndDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : sprintData?.endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(sprintData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 0,
  };
  const workItem = tasks.length;
  const workItemCompleted = tasks.filter((task) => task.status === 'DONE').length;
  const workItemOpen = workItem - workItemCompleted;

  if (membersLoading || tasksLoading || sprintLoading) {
    return <div className='p-4 text-center text-gray-500'>Loading...</div>;
  }

  if (membersError || tasksError || sprintError) {
    if (sprintError && 'status' in sprintError && sprintError.status === 404) {
      return (
        <div className='flex items-center justify-between px-1 pb-5 bg-white'>
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
                          alt={member.name}
                          className='w-8 h-8 rounded-full object-cover border cursor-pointer'
                          onClick={toggleMembers}
                        />
                        <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity'>
                          {member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='relative w-8 h-8 group'>
                    <img
                      src={members[0].avatar}
                      alt={members[0].name}
                      className='w-8 h-8 rounded-full object-cover border cursor-pointer'
                      onClick={toggleMembers}
                    />
                    <span className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity'>
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
                <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center'>
                  <User2 size={18} className='text-gray-400' />
                </div>
              )}
            </div>

            <button className='flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50'>
              Epic <ChevronDown className='w-4 h-4 ml-1' />
            </button>
          </div>

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
    }
    return (
      <div className='p-4 text-center text-red-500'>
        Error loading data:{' '}
        {(membersError as any)?.data?.message ||
          (tasksError as any)?.data?.message ||
          (sprintError as any)?.data?.message ||
          'Unknown error'}
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between px-1 pb-5 bg-white'>
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
                      alt={member.name}
                      className='w-8 h-8 rounded-full object-cover border cursor-pointer'
                      onClick={toggleMembers}
                    />
                    <span
                      className='absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5
                 text-xs bg-gray-800 text-white rounded 
                 opacity-0 group-hover:opacity-100 transition-opacity 
                 whitespace-nowrap'
                    >
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='relative w-8 h-8 group'>
                <img
                  src={members[0].avatar}
                  alt={members[0].name}
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
            <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center'>
              <User2 size={18} className='text-gray-400' />
            </div>
          )}
        </div>

        <button className='flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50'>
          Epic <ChevronDown className='w-4 h-4 ml-1' />
        </button>
      </div>

      <div className='flex items-center gap-2'>
        {sprintData && (
          <>
            <button
              onClick={toggleCompletePopup}
              className='bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700'
            >
              Complete sprint
            </button>

            <CompleteSprintPopup
              isOpen={isCompletePopupOpen}
              onClose={toggleCompletePopup}
              sprintId={sprintData?.id ?? projectId}
              sprintName={sprint.name}
              projectKey={projectKey}
              projectId={projectId}
              workItem={workItem}
              workItemCompleted={workItemCompleted}
              workItemOpen={workItemOpen}
            />

            <div className='relative'>
              <button
                onClick={toggleSprintDropdown}
                className='flex items-center border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50'
              >
                <SprintIcon />
                Sprint <ChevronDown className='w-4 h-4 ml-1' />
              </button>

              {isSprintDropdownOpen && (
                <div className='absolute right-0 mt-2 w-64 bg-white border rounded shadow-md p-4 z-10'>
                  <h3 className='text-sm font-semibold text-gray-800 mb-1'>{sprint.name}</h3>
                  {sprintData?.goal && (
                    <p className='text-sm text-gray-600 mb-2'>Goal: {sprintData.goal}</p>
                  )}
                  <p className='text-sm text-gray-600 mb-2'>{sprint.daysLeft} days left</p>
                  <div className='flex justify-between text-xs text-gray-500'>
                    <div>
                      <p className='font-medium'>Start date</p>
                      <p>{sprint.startDate}</p>
                    </div>
                    <div>
                      <p className='font-medium'>End date</p>
                      <p>{sprint.endDate}</p>
                    </div>
                  </div>
                  {sprintData?.status && (
                    <p className='text-xs text-gray-500 mt-2'>Status: {sprintData.status}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

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

export default KanbanHeader;
