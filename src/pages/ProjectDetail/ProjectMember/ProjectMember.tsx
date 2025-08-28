// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetProjectMembersWithTasksQuery,
//   useChangeHourlyRateMutation,
//   useChangeWorkingHoursPerDayMutation,
// } from '../../../services/projectMemberApi';
// import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';
// import debounce from 'lodash/debounce';

// const ProjectMember: React.FC = () => {
//   const { projectKey } = useParams<{ projectKey: string }>();

//   const { data: project, isSuccess: isProjectLoaded } = useGetProjectDetailsByKeyQuery(
//     projectKey || ''
//   );

//   const projectId = project?.data?.id;

//   const {
//     data: members = [],
//     isLoading,
//     isSuccess,
//     refetch,
//   } = useGetProjectMembersWithTasksQuery(projectId!, {
//     skip: !projectId,
//   });

//   const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
//   const [hourlyRate, setHourlyRate] = useState<number | null>(null);
//   const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
//   const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

//   // Group members by position with custom sorting
//   const groupedMembers = useCallback(() => {
//     const groups: { [key: string]: ProjectMemberWithTasksResponse[] } = {
//       Unassigned: [],
//     };
//     members.forEach((member) => {
//       const positions = Array.isArray(member.positions) ? member.positions : [];
//       if (positions.length === 0) {
//         groups['Unassigned'].push(member);
//       } else {
//         positions.forEach((position) => {
//           if (!groups[position]) {
//             groups[position] = [];
//           }
//           groups[position].push(member);
//         });
//       }
//     });

//     // Custom sort order: Project Manager, Team Leader, then others alphabetically, Unassigned last
//     const positionOrder = ['PROJECT_MANAGER', 'TEAM_LEADER'];
//     const sortedGroups = Object.keys(groups)
//       .sort((a, b) => {
//         if (a === 'Unassigned') return 1;
//         if (b === 'Unassigned') return -1;
//         const aIndex = positionOrder.indexOf(a);
//         const bIndex = positionOrder.indexOf(b);
//         if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
//         if (aIndex !== -1) return -1;
//         if (bIndex !== -1) return 1;
//         return a.localeCompare(b);
//       })
//       .reduce((acc, position) => {
//         if (groups[position].length > 0) {
//           acc[position] = groups[position];
//         }
//         return acc;
//       }, {} as { [key: string]: ProjectMemberWithTasksResponse[] });
//     return sortedGroups;
//   }, [members]);

//   // Update functions for onBlur
//   const updateHourlyRate = useCallback(
//     async (newHourlyRate: number) => {
//       if (!selectedMember || isNaN(newHourlyRate) || newHourlyRate < 0) {
//         setError('Please enter a valid positive hourly rate');
//         setSuccess(null);
//         return;
//       }
//       setIsUpdatingHourlyRate(true);
//       try {
//         console.log('PATCH hourly rate request', {
//           projectId: projectId!,
//           memberId: selectedMember.id,
//           hourlyRate: newHourlyRate,
//         });
//         const result = await changeHourlyRate({
//           projectId: projectId!,
//           memberId: selectedMember.id,
//           hourlyRate: newHourlyRate,
//         });
//         if ('data' in result && result.data?.isSuccess) {
//           setSuccess('Hourly rate updated successfully');
//           setError(null);
//           refetch();
//         } else if ('error' in result) {
//           setError('Failed to update hourly rate');
//           setSuccess(null);
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         setError('An error occurred while updating hourly rate');
//         setSuccess(null);
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingHourlyRate(false);
//       }
//     },
//     [selectedMember, projectId, refetch]
//   );

//   const updateWorkingHoursPerDay = useCallback(
//     async (newWorkingHours: number) => {
//       if (!selectedMember || isNaN(newWorkingHours) || newWorkingHours < 0) {
//         setError('Please enter a valid positive working hours per day');
//         setSuccess(null);
//         return;
//       }
//       setIsUpdatingWorkingHours(true);
//       try {
//         const result = await changeWorkingHoursPerDay({
//           projectId: projectId!,
//           memberId: selectedMember.id,
//           workingHoursPerDay: newWorkingHours,
//         });
//         if ('data' in result && result.data?.isSuccess) {
//           setSuccess('Working hours per day updated successfully');
//           setError(null);
//           refetch();
//         } else if ('error' in result) {
//           setError('Failed to update working hours per day');
//           setSuccess(null);
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         setError('An error occurred while updating working hours per day');
//         setSuccess(null);
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingWorkingHours(false);
//       }
//     },
//     [selectedMember, projectId, refetch]
//   );

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

//   // Handle input changes
//   const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setHourlyRate(newValue);
//   };

//   const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setWorkingHoursPerDay(newValue);
//   };

//   const handleHourlyRateBlur = () => {
//     if (hourlyRate !== null) updateHourlyRate(hourlyRate);
//   };

//   const handleWorkingHoursBlur = () => {
//     if (workingHoursPerDay !== null) updateWorkingHoursPerDay(workingHoursPerDay);
//   };

//   const isClient = selectedMember?.positions?.includes('CLIENT') || false;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 h-full">
//       {/* Sidebar */}
//       <div className="border-r bg-white p-4">
//         <h3 className="font-semibold text-gray-700 mb-4">PROJECT MEMBER</h3>
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : (
//           <div>
//             {Object.entries(groupedMembers()).map(([position, members]) => (
//               <div key={position} className="mb-4">
//                 <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
//                   {position.replace('_', ' ').toLowerCase()}
//                 </h4>
//                 <ul className="mt-2">
//                   {members.map((member) => (
//                     <li
//                       key={member.id}
//                       onClick={() => {
//                         setSelectedMember(member);
//                         setHourlyRate(member.hourlyRate || null);
//                         setWorkingHoursPerDay(member.workingHoursPerDay || null);
//                         setError(null);
//                         setSuccess(null);
//                       }}
//                       className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm flex items-center gap-2 ${
//                         selectedMember?.id === member.id ? 'bg-blue-100 font-medium' : ''
//                       }`}
//                     >
//                       {member.accountPicture && (
//                         <img
//                           src={member.accountPicture}
//                           alt={`${member.fullName}'s avatar`}
//                           className="w-6 h-6 rounded-full object-cover"
//                         />
//                       )}
//                       <span>{member.fullName}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//       {/* Member Details */}
//       <div className="col-span-2 p-6">
//         {isLoading ? (
//           <div className="text-gray-500">Loading member details...</div>
//         ) : selectedMember ? (
//           <>
//             <div className="flex items-center gap-4 mb-6">
//               {selectedMember.accountPicture && (
//                 <img
//                   src={selectedMember.accountPicture}
//                   alt={`${selectedMember.fullName}'s avatar`}
//                   className="w-16 h-16 rounded-full object-cover border"
//                 />
//               )}
//               <div>
//                 <h2 className="text-lg font-semibold">{selectedMember.fullName}</h2>
//                 <p className="text-sm text-gray-500">@{selectedMember.username}</p>
//                 <p className="text-sm text-gray-500">
//                   Position:{' '}
//                   {(Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
//                     ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
//                     : 'Unassigned')}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Email: {selectedMember.email || 'N/A'}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Phone: {selectedMember.phone || 'N/A'}
//                 </p>
//                 {!isClient && (
//                   <>
//                     <p className="text-sm text-gray-500">
//                       Hourly Rate:
//                       <input
//                         type="number"
//                         step="0.01"
//                         value={hourlyRate ?? ''}
//                         onChange={handleHourlyRateChange}
//                         onBlur={handleHourlyRateBlur}
//                         className="border p-1 rounded w-20 inline-block bg-white"
//                         disabled={isUpdatingHourlyRate}
//                       />{' '}
//                      VND/hour
//                       {isUpdatingHourlyRate && (
//                         <span className="ml-2 text-gray-500">
//                           <svg
//                             className="animate-spin h-5 w-5 inline-block"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                             ></path>
//                           </svg>
//                         </span>
//                       )}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Working Hours/Day:{' '}
//                       <input
//                         type="number"
//                         step="0.5"
//                         value={workingHoursPerDay ?? ''}
//                         onChange={handleWorkingHoursChange}
//                         onBlur={handleWorkingHoursBlur}
//                         className="border p-1 rounded w-20 inline-block bg-white"
//                         disabled={isUpdatingWorkingHours}
//                       />{' '}h
//                       {isUpdatingWorkingHours && (
//                         <span className="ml-2 text-gray-500">
//                           <svg
//                             className="animate-spin h-5 w-5 inline-block"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                             ></path>
//                           </svg>
//                         </span>
//                       )}
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div>

//             {error && <div className="text-red-500">{error}</div>}
//             {success && <div className="text-green-500">{success}</div>}

//             {!isClient && (
//               <>
//                 <h3 className="text-base font-semibold mb-4 mt-6">Assigned Tasks</h3>
//                 <div className="grid gap-4">
//                   {selectedMember.tasks.length === 0 ? (
//                     <div className="text-gray-500">No tasks assigned</div>
//                   ) : (
//                     selectedMember.tasks.map((task, idx) => (
//                       <div key={task.id || idx} className="bg-white shadow rounded-lg p-4 border">
//                         <div className="flex justify-between mb-1">
//                           <span className="text-sm font-medium text-gray-700">{task.title}</span>
//                           <span className="text-xs text-gray-500">{task.status}</span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-blue-500 h-2 rounded-full"
//                             style={{ width: `${task.percentComplete ?? 0}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <div className="text-gray-500">Select a member to view tasks</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectMember;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import {
  useGetProjectMembersWithTasksQuery,
  useChangeHourlyRateMutation,
  useChangeWorkingHoursPerDayMutation,
} from '../../../services/projectMemberApi';
import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';
import debounce from 'lodash/debounce';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

const ProjectMember: React.FC = () => {
  const { projectKey } = useParams<{ projectKey: string }>();

  const { data: project, isSuccess: isProjectLoaded } = useGetProjectDetailsByKeyQuery(
    projectKey || ''
  );

  const projectId = project?.data?.id;

  const {
    data: members = [],
    isLoading,
    isSuccess,
    refetch,
  } = useGetProjectMembersWithTasksQuery(projectId!, {
    skip: !projectId,
  });

  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useGetByConfigKeyQuery('hourly_rate_limit');
  const {
    data: configWHPD,
    isLoading: configWHPDLoading,
    isError: configWHPDError,
  } = useGetByConfigKeyQuery('working_hours_per_day_limit');

  const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
  const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);

  const [changeHourlyRate] = useChangeHourlyRateMutation();
  const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

  // const maxHourlyRate = parseInt(config?.find((c) => c.config_key === 'hourly_rate_limit')?.max_value || '500000');
  // const maxWorkingHoursPerDay = parseInt(config?.find((c) => c.config_key === 'working_hours_per_day_limit')?.max_value || '8');

  const maxHourlyRate = configLoading
    ? 10000000 // Giá trị mặc định khi đang tải
    : configError || !config?.data?.maxValue
    ? 10000000 // Giá trị mặc định khi lỗi hoặc không có dữ liệu
    : parseInt(config.data.maxValue, 10);
  console.log('maxActualHours: ', maxHourlyRate);

  const maxWorkingHoursPerDay = configWHPDLoading
    ? 8 // Giá trị mặc định khi đang tải
    : configWHPDError || !configWHPD?.data?.maxValue
    ? 8 // Giá trị mặc định khi lỗi hoặc không có dữ liệu
    : parseInt(configWHPD.data.maxValue, 10);
  console.log('maxActualHours: ', maxWorkingHoursPerDay);

  const groupedMembers = useCallback(() => {
    const groups: { [key: string]: ProjectMemberWithTasksResponse[] } = {
      Unassigned: [],
    };
    members.forEach((member) => {
      const positions = Array.isArray(member.positions) ? member.positions : [];
      if (positions.length === 0) {
        groups['Unassigned'].push(member);
      } else {
        positions.forEach((position) => {
          if (!groups[position]) {
            groups[position] = [];
          }
          groups[position].push(member);
        });
      }
    });

    const positionOrder = ['PROJECT_MANAGER', 'TEAM_LEADER'];
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        const aIndex = positionOrder.indexOf(a);
        const bIndex = positionOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
      })
      .reduce((acc, position) => {
        if (groups[position].length > 0) {
          acc[position] = groups[position];
        }
        return acc;
      }, {} as { [key: string]: ProjectMemberWithTasksResponse[] });
    return sortedGroups;
  }, [members]);

  const updateHourlyRate = useCallback(
    async (newHourlyRate: number) => {
      if (
        !selectedMember ||
        isNaN(newHourlyRate) ||
        newHourlyRate < 0 ||
        newHourlyRate > maxHourlyRate
      ) {
        setError(`Hourly rate must be between 0 and ${maxHourlyRate} VND`);
        setSuccess(null);
        return;
      }
      setIsUpdatingHourlyRate(true);
      try {
        const result = await changeHourlyRate({
          projectId: projectId!,
          memberId: selectedMember.id,
          hourlyRate: newHourlyRate,
        });
        if ('data' in result && result.data?.isSuccess) {
          setSuccess('Hourly rate updated successfully');
          setError(null);
          refetch();
        } else if ('error' in result) {
          setError('Failed to update hourly rate');
          setSuccess(null);
          console.error('API Error:', result.error);
        }
      } catch (err) {
        setError('An error occurred while updating hourly rate');
        setSuccess(null);
        console.error('Catch Error:', err);
      } finally {
        setIsUpdatingHourlyRate(false);
      }
    },
    [selectedMember, projectId, refetch, maxHourlyRate]
  );

  const updateWorkingHoursPerDay = useCallback(
    async (newWorkingHours: number) => {
      if (
        !selectedMember ||
        isNaN(newWorkingHours) ||
        newWorkingHours < 0 ||
        newWorkingHours > maxWorkingHoursPerDay
      ) {
        setError(`Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`);
        setSuccess(null);
        return;
      }
      setIsUpdatingWorkingHours(true);
      try {
        const result = await changeWorkingHoursPerDay({
          projectId: projectId!,
          memberId: selectedMember.id,
          workingHoursPerDay: newWorkingHours,
        });
        if ('data' in result && result.data?.isSuccess) {
          setSuccess('Working hours per day updated successfully');
          setError(null);
          refetch();
        } else if ('error' in result) {
          setError('Failed to update working hours per day');
          setSuccess(null);
          console.error('API Error:', result.error);
        }
      } catch (err) {
        setError('An error occurred while updating working hours per day');
        setSuccess(null);
        console.error('Catch Error:', err);
      } finally {
        setIsUpdatingWorkingHours(false);
      }
    },
    [selectedMember, projectId, refetch, maxWorkingHoursPerDay]
  );

  useEffect(() => {
    if (isSuccess && members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
      setHourlyRate(members[0].hourlyRate || null);
      setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
    }
  }, [members, isSuccess, selectedMember]);

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || null;
    setHourlyRate(newValue);
  };

  const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || null;
    setWorkingHoursPerDay(newValue);
  };

  const handleHourlyRateBlur = () => {
    if (hourlyRate !== null) updateHourlyRate(hourlyRate);
  };

  const handleWorkingHoursBlur = () => {
    if (workingHoursPerDay !== null) updateWorkingHoursPerDay(workingHoursPerDay);
  };

  const isClient = selectedMember?.positions?.includes('CLIENT') || false;

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 h-full'>
      <div className='border-r bg-white p-4'>
        <h3 className='font-semibold text-gray-700 mb-4'>PROJECT MEMBER</h3>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {Object.entries(groupedMembers()).map(([position, members]) => (
              <div key={position} className='mb-4'>
                <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
                  {position.replace('_', ' ').toLowerCase()}
                </h4>
                <ul className='mt-2'>
                  {members.map((member) => (
                    <li
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setHourlyRate(member.hourlyRate || null);
                        setWorkingHoursPerDay(member.workingHoursPerDay || null);
                        setError(null);
                        setSuccess(null);
                      }}
                      className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm flex items-center gap-2 ${
                        selectedMember?.id === member.id ? 'bg-blue-100 font-medium' : ''
                      }`}
                    >
                      {member.accountPicture && (
                        <img
                          src={member.accountPicture}
                          alt={`${member.fullName}'s avatar`}
                          className='w-6 h-6 rounded-full object-cover'
                        />
                      )}
                      <span>{member.fullName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='col-span-2 p-6'>
        {isLoading ? (
          <div className='text-gray-500'>Loading member details...</div>
        ) : selectedMember ? (
          <>
            <div className='flex items-center gap-4 mb-6'>
              {selectedMember.accountPicture && (
                <img
                  src={selectedMember.accountPicture}
                  alt={`${selectedMember.fullName}'s avatar`}
                  className='w-16 h-16 rounded-full object-cover border'
                />
              )}
              <div>
                <h2 className='text-lg font-semibold'>{selectedMember.fullName}</h2>
                <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
                <p className='text-sm text-gray-500'>
                  Position:{' '}
                  {Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
                    ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
                    : 'Unassigned'}
                </p>
                <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
                <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
                {!isClient && (
                  <>
                    <p className='text-sm text-gray-500'>
                      Hourly Rate:
                      <input
                        type='number'
                        step='0.01'
                        value={hourlyRate ?? ''}
                        onChange={handleHourlyRateChange}
                        onBlur={handleHourlyRateBlur}
                        className='border p-1 rounded w-20 inline-block bg-white'
                        disabled={isUpdatingHourlyRate}
                        max={maxHourlyRate}
                      />{' '}
                      VND/hour
                      {isUpdatingHourlyRate && (
                        <span className='ml-2 text-gray-500'>
                          <svg
                            className='animate-spin h-5 w-5 inline-block'
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
                              d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                            ></path>
                          </svg>
                        </span>
                      )}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Working Hours/Day:{' '}
                      <input
                        type='number'
                        step='0.5'
                        value={workingHoursPerDay ?? ''}
                        onChange={handleWorkingHoursChange}
                        onBlur={handleWorkingHoursBlur}
                        className='border p-1 rounded w-20 inline-block bg-white'
                        disabled={isUpdatingWorkingHours}
                        max={maxWorkingHoursPerDay}
                      />{' '}
                      h
                      {isUpdatingWorkingHours && (
                        <span className='ml-2 text-gray-500'>
                          <svg
                            className='animate-spin h-5 w-5 inline-block'
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
                              d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                            ></path>
                          </svg>
                        </span>
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && <div className='text-red-500'>{error}</div>}
            {success && <div className='text-green-500'>{success}</div>}

            {!isClient && (
              <>
                <h3 className='text-base font-semibold mb-4 mt-6'>Assigned Tasks</h3>
                <div className='grid gap-4'>
                  {selectedMember.tasks.length === 0 ? (
                    <div className='text-gray-500'>No tasks assigned</div>
                  ) : (
                    selectedMember.tasks.map((task, idx) => (
                      <div key={task.id || idx} className='bg-white shadow rounded-lg p-4 border'>
                        <div className='flex justify-between mb-1'>
                          <span className='text-sm font-medium text-gray-700'>{task.title}</span>
                          <span className='text-xs text-gray-500'>{task.status}</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-500 h-2 rounded-full'
                            style={{ width: `${task.percentComplete ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className='text-gray-500'>Select a member to view tasks</div>
        )}
      </div>
    </div>
  );
};

export default ProjectMember;
