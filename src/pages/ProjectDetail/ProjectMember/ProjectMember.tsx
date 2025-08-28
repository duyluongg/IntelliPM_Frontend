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
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

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

//   const {
//     data: config,
//     isLoading: configLoading,
//     isError: configError,
//   } = useGetByConfigKeyQuery('hourly_rate_limit');
//   const {
//     data: configWHPD,
//     isLoading: configWHPDLoading,
//     isError: configWHPDError,
//   } = useGetByConfigKeyQuery('working_hours_per_day_limit');

//   const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
//   const [hourlyRate, setHourlyRate] = useState<number | null>(null);
//   const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
//   const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

//   const maxHourlyRate = configLoading
//     ? 10000000
//     : configError || !config?.data?.maxValue
//     ? 10000000
//     : parseInt(config.data.maxValue, 10);

//   const maxWorkingHoursPerDay = configWHPDLoading
//     ? 8
//     : configWHPDError || !configWHPD?.data?.maxValue
//     ? 8
//     : parseInt(configWHPD.data.maxValue, 10);

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

//   const updateHourlyRate = useCallback(
//     async (newHourlyRate: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         setError('Cannot update hourly rate for non-active members');
//         setSuccess(null);
//         return;
//       }
//       if (
//         isNaN(newHourlyRate) ||
//         newHourlyRate < 0 ||
//         newHourlyRate > maxHourlyRate
//       ) {
//         setError(`Hourly rate must be between 0 and ${maxHourlyRate} VND`);
//         setSuccess(null);
//         return;
//       }
//       setIsUpdatingHourlyRate(true);
//       try {
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
//     [selectedMember, projectId, refetch, maxHourlyRate]
//   );

//   const updateWorkingHoursPerDay = useCallback(
//     async (newWorkingHours: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         setError('Cannot update working hours for non-active members');
//         setSuccess(null);
//         return;
//       }
//       if (
//         isNaN(newWorkingHours) ||
//         newWorkingHours < 0 ||
//         newWorkingHours > maxWorkingHoursPerDay
//       ) {
//         setError(`Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`);
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
//     [selectedMember, projectId, refetch, maxWorkingHoursPerDay]
//   );

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

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
//   const isActive = selectedMember?.status === 'ACTIVE';

//   return (
//     <div className='grid grid-cols-1 md:grid-cols-3 h-full'>
//       <div className='border-r bg-white p-4'>
//         <h3 className='font-semibold text-gray-700 mb-4'>PROJECT MEMBER</h3>
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : (
//           <div>
//             {Object.entries(groupedMembers()).map(([position, members]) => (
//               <div key={position} className='mb-4'>
//                 <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
//                   {position.replace('_', ' ').toLowerCase()}
//                 </h4>
//                 <ul className='mt-2'>
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
//                           className='w-6 h-6 rounded-full object-cover'
//                         />
//                       )}
//                       <span>{member.fullName}</span>
//                       {member.status !== 'ACTIVE' && (
//                         <span className='text-xs text-gray-400'>({member.status})</span>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//       <div className='col-span-2 p-6'>
//         {isLoading ? (
//           <div className='text-gray-500'>Loading member details...</div>
//         ) : selectedMember ? (
//           <>
//             <div className='flex items-center gap-4 mb-6'>
//               {selectedMember.accountPicture && (
//                 <img
//                   src={selectedMember.accountPicture}
//                   alt={`${selectedMember.fullName}'s avatar`}
//                   className='w-16 h-16 rounded-full object-cover border'
//                 />
//               )}
//               <div>
//                 <h2 className='text-lg font-semibold'>{selectedMember.fullName}</h2>
//                 <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
//                 <p className='text-sm text-gray-500'>
//                   Position:{' '}
//                   {Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
//                     ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
//                     : 'Unassigned'}
//                 </p>
//                 <p className='text-sm text-gray-500'>
//                   Status: <span className={isActive ? 'text-green-500' : 'text-red-500'}>{selectedMember.status}</span>
//                 </p>
//                 <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
//                 <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
//                 {!isClient && (
//                   <>
//                     <p className='text-sm text-gray-500'>
//                       Hourly Rate:{' '}
//                       <input
//                         type='number'
//                         step='0.01'
//                         value={hourlyRate ?? ''}
//                         onChange={handleHourlyRateChange}
//                         onBlur={handleHourlyRateBlur}
//                         className={`border p-1 rounded w-20 inline-block bg-white ${
//                           !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                         }`}
//                         disabled={isUpdatingHourlyRate || !isActive}
//                         max={maxHourlyRate}
//                       />{' '}
//                       VND/hour
//                       {isUpdatingHourlyRate && (
//                         <span className='ml-2 text-gray-500'>
//                           <svg
//                             className='animate-spin h-5 w-5 inline-block'
//                             xmlns='http://www.w3.org/2000/svg'
//                             fill='none'
//                             viewBox='0 0 24 24'
//                           >
//                             <circle
//                               className='opacity-25'
//                               cx='12'
//                               cy='12'
//                               r='10'
//                               stroke='currentColor'
//                               strokeWidth='4'
//                             ></circle>
//                             <path
//                               className='opacity-75'
//                               fill='currentColor'
//                               d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                             ></path>
//                           </svg>
//                         </span>
//                       )}
//                       {!isActive && (
//                         <span className='ml-2 text-xs text-gray-400'>(Only active members can edit)</span>
//                       )}
//                     </p>
//                     <p className='text-sm text-gray-500'>
//                       Working Hours/Day:{' '}
//                       <input
//                         type='number'
//                         step='0.5'
//                         value={workingHoursPerDay ?? ''}
//                         onChange={handleWorkingHoursChange}
//                         onBlur={handleWorkingHoursBlur}
//                         className={`border p-1 rounded w-20 inline-block bg-white ${
//                           !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                         }`}
//                         disabled={isUpdatingWorkingHours || !isActive}
//                         max={maxWorkingHoursPerDay}
//                       />{' '}
//                       h
//                       {isUpdatingWorkingHours && (
//                         <span className='ml-2 text-gray-500'>
//                           <svg
//                             className='animate-spin h-5 w-5 inline-block'
//                             xmlns='http://www.w3.org/2000/svg'
//                             fill='none'
//                             viewBox='0 0 24 24'
//                           >
//                             <circle
//                               className='opacity-25'
//                               cx='12'
//                               cy='12'
//                               r='10'
//                               stroke='currentColor'
//                               strokeWidth='4'
//                             ></circle>
//                             <path
//                               className='opacity-75'
//                               fill='currentColor'
//                               d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                             ></path>
//                           </svg>
//                         </span>
//                       )}
//                       {!isActive && (
//                         <span className='ml-2 text-xs text-gray-400'>(Only active members can edit)</span>
//                       )}
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div>

//             {error && <div className='text-red-500 mb-4'>{error}</div>}
//             {success && <div className='text-green-500 mb-4'>{success}</div>}

//             {!isClient && (
//               <>
//                 <h3 className='text-base font-semibold mb-4 mt-6'>Assigned Tasks</h3>
//                 <div className='grid gap-4'>
//                   {selectedMember.tasks.length === 0 ? (
//                     <div className='text-gray-500'>No tasks assigned</div>
//                   ) : (
//                     selectedMember.tasks.map((task, idx) => (
//                       <div key={task.id || idx} className='bg-white shadow rounded-lg p-4 border'>
//                         <div className='flex justify-between mb-1'>
//                           <span className='text-sm font-medium text-gray-700'>{task.title}</span>
//                           <span className='text-xs text-gray-500'>{task.status}</span>
//                         </div>
//                         <div className='w-full bg-gray-200 rounded-full h-2'>
//                           <div
//                             className='bg-blue-500 h-2 rounded-full'
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
//           <div className='text-gray-500'>Select a member to view tasks</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectMember;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetProjectMembersWithTasksQuery,
//   useChangeHourlyRateMutation,
//   useChangeWorkingHoursPerDayMutation,
// } from '../../../services/projectMemberApi';
// import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';
// import { UserCheck, UserX } from 'lucide-react';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

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

//   const {
//     data: config,
//     isLoading: configLoading,
//     isError: configError,
//   } = useGetByConfigKeyQuery('hourly_rate_limit');
//   const {
//     data: configWHPD,
//     isLoading: configWHPDLoading,
//     isError: configWHPDError,
//   } = useGetByConfigKeyQuery('working_hours_per_day_limit');

//   const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
//   const [hourlyRate, setHourlyRate] = useState<number | null>(null);
//   const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
//   const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

//   const maxHourlyRate = configLoading
//     ? 10000000
//     : configError || !config?.data?.maxValue
//     ? 10000000
//     : parseInt(config.data.maxValue, 10);

//   const maxWorkingHoursPerDay = configWHPDLoading
//     ? 8
//     : configWHPDError || !configWHPD?.data?.maxValue
//     ? 8
//     : parseInt(configWHPD.data.maxValue, 10);

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

//   const updateHourlyRate = useCallback(
//     async (newHourlyRate: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         setError('Cannot update hourly rate for non-active members');
//         setSuccess(null);
//         return;
//       }
//       if (
//         isNaN(newHourlyRate) ||
//         newHourlyRate < 0 ||
//         newHourlyRate > maxHourlyRate
//       ) {
//         setError(`Hourly rate must be between 0 and ${maxHourlyRate} VND`);
//         setSuccess(null);
//         return;
//       }
//       setIsUpdatingHourlyRate(true);
//       try {
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
//     [selectedMember, projectId, refetch, maxHourlyRate]
//   );

//   const updateWorkingHoursPerDay = useCallback(
//     async (newWorkingHours: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         setError('Cannot update working hours for non-active members');
//         setSuccess(null);
//         return;
//       }
//       if (
//         isNaN(newWorkingHours) ||
//         newWorkingHours < 0 ||
//         newWorkingHours > maxWorkingHoursPerDay
//       ) {
//         setError(`Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`);
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
//     [selectedMember, projectId, refetch, maxWorkingHoursPerDay]
//   );

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

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
//   const isActive = selectedMember?.status === 'ACTIVE';

//   return (
//     <div className='grid grid-cols-1 md:grid-cols-3 h-full bg-gray-50'>
//       <div className='border-r bg-white shadow-lg rounded-l-xl'>
//         <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-4 rounded-t-xl'>
//           <h3 className='text-lg font-semibold text-white'>Project Members</h3>
//         </div>
//         <div className='p-4'>
//           {isLoading ? (
//             <div className='text-gray-500 text-sm'>Loading...</div>
//           ) : (
//             <div className='flex flex-col gap-3'>
//               {Object.entries(groupedMembers()).map(([position, members]) => (
//                 <div key={position} className='mb-6'>
//                   <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide mb-2'>
//                     {position.replace('_', ' ').toLowerCase()}
//                   </h4>
//                   <ul className='flex flex-col gap-2'>
//                     {members.map((member) => (
//                       <li
//                         key={member.id}
//                         onClick={() => {
//                           setSelectedMember(member);
//                           setHourlyRate(member.hourlyRate || null);
//                           setWorkingHoursPerDay(member.workingHoursPerDay || null);
//                           setError(null);
//                           setSuccess(null);
//                         }}
//                         className={`cursor-pointer p-3 rounded-lg hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 text-sm flex items-center gap-3 bg-white border border-gray-200 shadow-sm ${
//                           selectedMember?.id === member.id ? 'bg-blue-100 font-medium border-blue-300' : ''
//                         }`}
//                       >
//                         {member.accountPicture && (
//                           <img
//                             src={member.accountPicture}
//                             alt={`${member.fullName}'s avatar`}
//                             className='w-8 h-8 rounded-full object-cover border border-gray-300'
//                           />
//                         )}
//                         <span className='flex-1'>{member.fullName}</span>
//                         {member.status === 'ACTIVE' ? (
//                           <UserCheck className='h-4 w-4 text-green-500' />
//                         ) : (
//                           <UserX className='h-4 w-4 text-red-500' />
//                         )}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div className='col-span-2 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-r-xl shadow-lg'>
//         {isLoading ? (
//           <div className='text-gray-500 text-sm'>Loading member details...</div>
//         ) : selectedMember ? (
//           <>
//             <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6'>
//               <div className='flex items-center gap-4'>
//                 {selectedMember.accountPicture && (
//                   <img
//                     src={selectedMember.accountPicture}
//                     alt={`${selectedMember.fullName}'s avatar`}
//                     className='w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm'
//                   />
//                 )}
//                 <div>
//                   <h2 className='text-xl font-semibold text-gray-800'>{selectedMember.fullName}</h2>
//                   <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
//                   <p className='text-sm text-gray-500'>
//                     Position:{' '}
//                     {Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
//                       ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
//                       : 'Unassigned'}
//                   </p>
//                   <p className='text-sm text-gray-500'>
//                     Status: <span className={isActive ? 'text-green-500' : 'text-red-500'}>{selectedMember.status}</span>
//                   </p>
//                   <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
//                   <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
//                   {!isClient && (
//                     <>
//                       <p className='text-sm text-gray-600 mt-2'>
//                         Hourly Rate:{' '}
//                         <input
//                           type='number'
//                           step='0.01'
//                           value={hourlyRate ?? ''}
//                           onChange={handleHourlyRateChange}
//                           onBlur={handleHourlyRateBlur}
//                           className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                             !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                           }`}
//                           disabled={isUpdatingHourlyRate || !isActive}
//                           max={maxHourlyRate}
//                         />{' '}
//                         VND/hour
//                         {isUpdatingHourlyRate && (
//                           <span className='ml-2 text-gray-500'>
//                             <svg
//                               className='animate-spin h-5 w-5 inline-block'
//                               xmlns='http://www.w3.org/2000/svg'
//                               fill='none'
//                               viewBox='0 0 24 24'
//                             >
//                               <circle
//                                 className='opacity-25'
//                                 cx='12'
//                                 cy='12'
//                                 r='10'
//                                 stroke='currentColor'
//                                 strokeWidth='4'
//                               ></circle>
//                               <path
//                                 className='opacity-75'
//                                 fill='currentColor'
//                                 d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                               ></path>
//                             </svg>
//                           </span>
//                         )}
//                         {!isActive && (
//                           <span className='ml-2 text-xs text-gray-400'>(Only active members can edit)</span>
//                         )}
//                       </p>
//                       <p className='text-sm text-gray-600 mt-2'>
//                         Working Hours/Day:{' '}
//                         <input
//                           type='number'
//                           step='0.5'
//                           value={workingHoursPerDay ?? ''}
//                           onChange={handleWorkingHoursChange}
//                           onBlur={handleWorkingHoursBlur}
//                           className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                             !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                           }`}
//                           disabled={isUpdatingWorkingHours || !isActive}
//                           max={maxWorkingHoursPerDay}
//                         />{' '}
//                         h
//                         {isUpdatingWorkingHours && (
//                           <span className='ml-2 text-gray-500'>
//                             <svg
//                               className='animate-spin h-5 w-5 inline-block'
//                               xmlns='http://www.w3.org/2000/svg'
//                               fill='none'
//                               viewBox='0 0 24 24'
//                             >
//                               <circle
//                                 className='opacity-25'
//                                 cx='12'
//                                 cy='12'
//                                 r='10'
//                                 stroke='currentColor'
//                                 strokeWidth='4'
//                               ></circle>
//                               <path
//                                 className='opacity-75'
//                                 fill='currentColor'
//                                 d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                               ></path>
//                             </svg>
//                           </span>
//                         )}
//                         {!isActive && (
//                           <span className='ml-2 text-xs text-gray-400'>(Only active members can edit)</span>
//                         )}
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {error && (
//               <div className='text-red-500 bg-red-50 p-3 rounded-lg mb-4 shadow-sm'>
//                 {error}
//               </div>
//             )}
//             {success && (
//               <div className='text-green-500 bg-green-50 p-3 rounded-lg mb-4 shadow-sm'>
//                 {success}
//               </div>
//             )}

//             {!isClient && (
//               <>
//                 <h3 className='text-lg font-semibold text-gray-800 mb-4 mt-6'>Assigned Tasks</h3>
//                 <div className='grid gap-4'>
//                   {selectedMember.tasks.length === 0 ? (
//                     <div className='text-gray-500 text-sm'>No tasks assigned</div>
//                   ) : (
//                     selectedMember.tasks.map((task, idx) => (
//                       <div key={task.id || idx} className='bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200'>
//                         <div className='flex justify-between mb-2'>
//                           <span className='text-sm font-medium text-gray-700'>{task.title}</span>
//                           <span className='text-xs text-gray-500 capitalize'>{task.status}</span>
//                         </div>
//                         <div className='w-full bg-gray-200 rounded-full h-3'>
//                           <div
//                             className='bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full'
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
//           <div className='text-gray-500 text-sm'>Select a member to view tasks</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectMember;

// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetProjectMembersWithTasksQuery,
//   useChangeHourlyRateMutation,
//   useChangeWorkingHoursPerDayMutation,
// } from '../../../services/projectMemberApi';
// import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';
// import { UserCheck, UserX } from 'lucide-react';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
// import Swal from 'sweetalert2';

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

//   const {
//     data: config,
//     isLoading: configLoading,
//     isError: configError,
//   } = useGetByConfigKeyQuery('hourly_rate_limit');
//   const {
//     data: configWHPD,
//     isLoading: configWHPDLoading,
//     isError: configWHPDError,
//   } = useGetByConfigKeyQuery('working_hours_per_day_limit');

//   const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
//   const [hourlyRate, setHourlyRate] = useState<number | null>(null);
//   const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
//   const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();
//   const [isEditingHourlyRate, setIsEditingHourlyRate] = useState<boolean>(false);

//   const maxHourlyRate = configLoading
//     ? 10000000
//     : configError || !config?.data?.maxValue
//     ? 10000000
//     : parseInt(config.data.maxValue, 10);

//   const maxWorkingHoursPerDay = configWHPDLoading
//     ? 8
//     : configWHPDError || !configWHPD?.data?.maxValue
//     ? 8
//     : parseInt(configWHPD.data.maxValue, 10);

//   const formatVND = (value: number | null): string => {
//     if (value === null || isNaN(value)) return 'N/A';
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND',
//       minimumFractionDigits: 0,
//     }).format(value);
//   };

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

//   const updateHourlyRate = useCallback(
//     async (newHourlyRate: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Cannot update hourly rate for non-active members',
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       if (isNaN(newHourlyRate) || newHourlyRate < 0 || newHourlyRate > maxHourlyRate) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: `Hourly rate must be between 0 and ${maxHourlyRate} VND`,
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       setIsUpdatingHourlyRate(true);
//       try {
//         const result = await changeHourlyRate({
//           projectId: projectId!,
//           memberId: selectedMember.id,
//           hourlyRate: newHourlyRate,
//         });
//         if ('data' in result && result.data?.isSuccess) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: 'Hourly rate updated successfully',
//             confirmButtonColor: '#3085d6',
//           });
//           refetch();
//         } else if ('error' in result) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Failed to update hourly rate',
//             confirmButtonColor: '#3085d6',
//           });
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'An error occurred while updating hourly rate',
//           confirmButtonColor: '#3085d6',
//         });
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingHourlyRate(false);
//       }
//     },
//     [selectedMember, projectId, refetch, maxHourlyRate]
//   );

//   const updateWorkingHoursPerDay = useCallback(
//     async (newWorkingHours: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Cannot update working hours for non-active members',
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       if (
//         isNaN(newWorkingHours) ||
//         newWorkingHours < 0 ||
//         newWorkingHours > maxWorkingHoursPerDay
//       ) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: `Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`,
//           confirmButtonColor: '#3085d6',
//         });
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
//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: 'Working hours per day updated successfully',
//             confirmButtonColor: '#3085d6',
//           });
//           refetch();
//         } else if ('error' in result) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Failed to update working hours per day',
//             confirmButtonColor: '#3085d6',
//           });
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'An error occurred while updating working hours per day',
//           confirmButtonColor: '#3085d6',
//         });
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingWorkingHours(false);
//       }
//     },
//     [selectedMember, projectId, refetch, maxWorkingHoursPerDay]
//   );

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

//   const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setHourlyRate(newValue);
//   };

//   const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setWorkingHoursPerDay(newValue);
//   };

//   const handleHourlyRateFocus = () => {
//     setIsEditingHourlyRate(true);
//   };

//   const handleHourlyRateBlur = () => {
//     if (hourlyRate !== null) updateHourlyRate(hourlyRate);
//   };

//   const handleWorkingHoursBlur = () => {
//     if (workingHoursPerDay !== null) updateWorkingHoursPerDay(workingHoursPerDay);
//   };

//   const isClient = selectedMember?.positions?.includes('CLIENT') || false;
//   const isActive = selectedMember?.status === 'ACTIVE';

//   return (
//     <div className='flex flex-col h-full bg-gray-50'>
//       <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-4 rounded-t-xl shadow-md'>
//         <h3 className='text-lg font-semibold text-white'>Project Members</h3>
//       </div>
//       <div className='grid grid-cols-1 md:grid-cols-3 flex-1'>
//         <div className='border-r bg-white shadow-lg rounded-bl-xl overflow-y-auto max-h-[calc(100vh-100px)]'>
//           <div className='p-4'>
//             {isLoading ? (
//               <div className='text-gray-500 text-sm'>Loading...</div>
//             ) : (
//               <div className='flex flex-col gap-3'>
//                 {Object.entries(groupedMembers()).map(([position, members]) => (
//                   <div key={position} className='mb-6'>
//                     <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide mb-2'>
//                       {position.replace('_', ' ').toLowerCase()}
//                     </h4>
//                     <ul className='flex flex-col gap-2'>
//                       {members.map((member) => (
//                         <li
//                           key={member.id}
//                           onClick={() => {
//                             setSelectedMember(member);
//                             setHourlyRate(member.hourlyRate || null);
//                             setWorkingHoursPerDay(member.workingHoursPerDay || null);
//                           }}
//                           className={`cursor-pointer p-3 rounded-lg hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 text-sm flex items-center gap-3 bg-white border border-gray-200 shadow-sm ${
//                             selectedMember?.id === member.id
//                               ? 'bg-blue-100 font-medium border-blue-300'
//                               : ''
//                           }`}
//                         >
//                           {member.accountPicture && (
//                             <img
//                               src={member.accountPicture}
//                               alt={`${member.fullName}'s avatar`}
//                               className='w-8 h-8 rounded-full object-cover border border-gray-300'
//                             />
//                           )}
//                           <span className='flex-1'>{member.fullName}</span>
//                           {member.status === 'ACTIVE' ? (
//                             <UserCheck className='h-4 w-4 text-green-500' />
//                           ) : (
//                             <UserX className='h-4 w-4 text-red-500' />
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className='col-span-2 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-br-xl shadow-lg'>
//           {isLoading ? (
//             <div className='text-gray-500 text-sm'>Loading member details...</div>
//           ) : selectedMember ? (
//             <>
//               <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6'>
//                 <div className='flex items-center gap-4'>
//                   {selectedMember.accountPicture && (
//                     <img
//                       src={selectedMember.accountPicture}
//                       alt={`${selectedMember.fullName}'s avatar`}
//                       className='w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm'
//                     />
//                   )}
//                   <div>
//                     <h2 className='text-xl font-semibold text-gray-800'>
//                       {selectedMember.fullName}
//                     </h2>
//                     <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
//                     <p className='text-sm text-gray-500'>
//                       Position:{' '}
//                       {Array.isArray(selectedMember.positions) &&
//                       selectedMember.positions.length > 0
//                         ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
//                         : 'Unassigned'}
//                     </p>
//                     <p className='text-sm text-gray-500'>
//                       Status:{' '}
//                       <span className={isActive ? 'text-green-500' : 'text-red-500'}>
//                         {selectedMember.status}
//                       </span>
//                     </p>
//                     <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
//                     <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
//                     {!isClient && (
//                       <>
//                         <p className='text-sm text-gray-600 mt-2'>
//                           Hourly Rate:{' '}
//                           <input
//                             type='number'
//                             step='1'
//                             value={hourlyRate ?? ''}
//                             onChange={handleHourlyRateChange}
//                             onBlur={handleHourlyRateBlur}
//                             className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                               !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                             }`}
//                             disabled={isUpdatingHourlyRate || !isActive}
//                             max={maxHourlyRate}
//                           />{' '}
//                           VND/hour
//                           {isUpdatingHourlyRate && (
//                             <span className='ml-2 text-gray-500'>
//                               <svg
//                                 className='animate-spin h-5 w-5 inline-block'
//                                 xmlns='http://www.w3.org/2000/svg'
//                                 fill='none'
//                                 viewBox='0 0 24 24'
//                               >
//                                 <circle
//                                   className='opacity-25'
//                                   cx='12'
//                                   cy='12'
//                                   r='10'
//                                   stroke='currentColor'
//                                   strokeWidth='4'
//                                 ></circle>
//                                 <path
//                                   className='opacity-75'
//                                   fill='currentColor'
//                                   d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                                 ></path>
//                               </svg>
//                             </span>
//                           )}
//                           {!isActive && (
//                             <span className='ml-2 text-xs text-gray-400'>
//                               (Only active members can edit)
//                             </span>
//                           )}
//                         </p>
//                         <p className='text-sm text-gray-600 mt-2'>
//                           Working Hours/Day:{' '}
//                           <input
//                             type='number'
//                             step='0.5'
//                             value={workingHoursPerDay ?? ''}
//                             onChange={handleWorkingHoursChange}
//                             onBlur={handleWorkingHoursBlur}
//                             className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                               !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                             }`}
//                             disabled={isUpdatingWorkingHours || !isActive}
//                             max={maxWorkingHoursPerDay}
//                           />{' '}
//                           h
//                           {isUpdatingWorkingHours && (
//                             <span className='ml-2 text-gray-500'>
//                               <svg
//                                 className='animate-spin h-5 w-5 inline-block'
//                                 xmlns='http://www.w3.org/2000/svg'
//                                 fill='none'
//                                 viewBox='0 0 24 24'
//                               >
//                                 <circle
//                                   className='opacity-25'
//                                   cx='12'
//                                   cy='12'
//                                   r='10'
//                                   stroke='currentColor'
//                                   strokeWidth='4'
//                                 ></circle>
//                                 <path
//                                   className='opacity-75'
//                                   fill='currentColor'
//                                   d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                                 ></path>
//                               </svg>
//                             </span>
//                           )}
//                           {!isActive && (
//                             <span className='ml-2 text-xs text-gray-400'>
//                               (Only active members can edit)
//                             </span>
//                           )}
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {error && (
//                 <div className='text-red-500 bg-red-50 p-3 rounded-lg mb-4 shadow-sm'>{error}</div>
//               )}
//               {success && (
//                 <div className='text-green-500 bg-green-50 p-3 rounded-lg mb-4 shadow-sm'>
//                   {success}
//                 </div>
//               )}

//               {!isClient && (
//                 <>
//                   <h3 className='text-lg font-semibold text-gray-800 mb-4 mt-6'>Assigned Tasks</h3>
//                   <div className='grid gap-4'>
//                     {selectedMember?.tasks.length === 0 ? (
//                       <div className='text-gray-500 text-sm'>No tasks assigned</div>
//                     ) : (
//                       selectedMember?.tasks.map((task, idx) => (
//                         <div
//                           key={task.id || idx}
//                           className='bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200'
//                         >
//                           <div className='flex justify-between mb-2'>
//                             <span className='text-sm font-medium text-gray-700'>{task.title}</span>
//                             <span className='text-xs text-gray-500 capitalize'>{task.status}</span>
//                           </div>
//                           <div className='w-full bg-gray-200 rounded-full h-3'>
//                             <div
//                               className='bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full'
//                               style={{ width: `${task.percentComplete ?? 0}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </>
//               )}
//             </>
//           ) : (
//             <div className='text-gray-500 text-sm'>Select a member to view tasks</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectMember;


//v1
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetProjectMembersWithTasksQuery,
//   useChangeHourlyRateMutation,
//   useChangeWorkingHoursPerDayMutation,
// } from '../../../services/projectMemberApi';
// import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';
// import { UserCheck, UserX } from 'lucide-react';
// import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
// import Swal from 'sweetalert2';

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

//   const {
//     data: config,
//     isLoading: configLoading,
//     isError: configError,
//   } = useGetByConfigKeyQuery('hourly_rate_limit');
//   const {
//     data: configWHPD,
//     isLoading: configWHPDLoading,
//     isError: configWHPDError,
//   } = useGetByConfigKeyQuery('working_hours_per_day_limit');

//   const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
//   const [hourlyRate, setHourlyRate] = useState<number | null>(null);
//   const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
//   const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
//   const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);
//   const [isEditingHourlyRate, setIsEditingHourlyRate] = useState<boolean>(false);

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

//   const maxHourlyRate = configLoading
//     ? 10000000
//     : configError || !config?.data?.maxValue
//     ? 10000000
//     : parseInt(config.data.maxValue, 10);

//   const maxWorkingHoursPerDay = configWHPDLoading
//     ? 8
//     : configWHPDError || !configWHPD?.data?.maxValue
//     ? 8
//     : parseInt(configWHPD.data.maxValue, 10);

//   const formatVND = (value: number | null): string => {
//     if (value === null || isNaN(value)) return '0';
//     return new Intl.NumberFormat('en-US', {
//       style: 'decimal',
//       minimumFractionDigits: 0,
//     }).format(value);
//   };

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

//   const updateHourlyRate = useCallback(
//     async (newHourlyRate: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Cannot update hourly rate for non-active members',
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       if (
//         isNaN(newHourlyRate) ||
//         newHourlyRate < 0 ||
//         newHourlyRate > maxHourlyRate
//       ) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: `Hourly rate must be between 0 and ${formatVND(maxHourlyRate)}`,
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       setIsUpdatingHourlyRate(true);
//       try {
//         const result = await changeHourlyRate({
//           projectId: projectId!,
//           memberId: selectedMember.id,
//           hourlyRate: newHourlyRate,
//         });
//         if ('data' in result && result.data?.isSuccess) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: 'Hourly rate updated successfully',
//             confirmButtonColor: '#3085d6',
//             timer: 1500,
//             timerProgressBar: true,
//           });
//           refetch();
//         } else if ('error' in result) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Failed to update hourly rate',
//             confirmButtonColor: '#3085d6',
//           });
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'An error occurred while updating hourly rate',
//           confirmButtonColor: '#3085d6',
//         });
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingHourlyRate(false);
//         setIsEditingHourlyRate(false);
//       }
//     },
//     [selectedMember, projectId, refetch, maxHourlyRate]
//   );

//   const updateWorkingHoursPerDay = useCallback(
//     async (newWorkingHours: number) => {
//       if (!selectedMember) return;
//       if (selectedMember.status !== 'ACTIVE') {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Cannot update working hours for non-active members',
//           confirmButtonColor: '#3085d6',
//         });
//         return;
//       }
//       if (
//         isNaN(newWorkingHours) ||
//         newWorkingHours < 0 ||
//         newWorkingHours > maxWorkingHoursPerDay
//       ) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: `Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`,
//           confirmButtonColor: '#3085d6',
//         });
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
//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: 'Working hours per day updated successfully',
//             confirmButtonColor: '#3085d6',
//             timer: 1500,
//             timerProgressBar: true,
//           });
//           refetch();
//         } else if ('error' in result) {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Failed to update working hours per day',
//             confirmButtonColor: '#3085d6',
//           });
//           console.error('API Error:', result.error);
//         }
//       } catch (err) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'An error occurred while updating working hours per day',
//           confirmButtonColor: '#3085d6',
//         });
//         console.error('Catch Error:', err);
//       } finally {
//         setIsUpdatingWorkingHours(false);
//       }
//     },
//     [selectedMember, projectId, refetch, maxWorkingHoursPerDay]
//   );

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

//   const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setHourlyRate(newValue);
//   };

//   const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = parseFloat(e.target.value) || null;
//     setWorkingHoursPerDay(newValue);
//   };

//   const handleHourlyRateFocus = () => {
//     setIsEditingHourlyRate(true);
//   };

//   const handleHourlyRateBlur = () => {
//     if (hourlyRate !== null) updateHourlyRate(hourlyRate);
//   };

//   const handleWorkingHoursBlur = () => {
//     if (workingHoursPerDay !== null) updateWorkingHoursPerDay(workingHoursPerDay);
//   };

//   const isClient = selectedMember?.positions?.includes('CLIENT') || false;
//   const isActive = selectedMember?.status === 'ACTIVE';

//   return (
//     <div className='flex flex-col h-full bg-gray-50'>
//       <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-4 shadow-md'>
//         <h3 className='text-lg font-semibold text-white'>Project Members</h3>
//       </div>
//       <div className='grid grid-cols-1 md:grid-cols-3 flex-1'>
//         <div className='border-r bg-white shadow-lg overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100'>
//           <div className='p-4'>
//             {isLoading ? (
//               <div className='text-gray-500 text-sm'>Loading...</div>
//             ) : (
//               <div className='flex flex-col gap-3'>
//                 {Object.entries(groupedMembers()).map(([position, members]) => (
//                   <div key={position} className='mb-6'>
//                     <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide mb-2'>
//                       {position.replace('_', ' ').toLowerCase()}
//                     </h4>
//                     <ul className='flex flex-col gap-2'>
//                       {members.map((member) => (
//                         <li
//                           key={member.id}
//                           onClick={() => {
//                             setSelectedMember(member);
//                             setHourlyRate(member.hourlyRate || null);
//                             setWorkingHoursPerDay(member.workingHoursPerDay || null);
//                           }}
//                           className={`cursor-pointer p-3 rounded-lg hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 text-sm flex items-center gap-3 bg-white border border-gray-200 shadow-sm ${
//                             selectedMember?.id === member.id ? 'bg-blue-100 font-medium border-blue-300' : ''
//                           }`}
//                         >
//                           {member.accountPicture && (
//                             <img
//                               src={member.accountPicture}
//                               alt={`${member.fullName}'s avatar`}
//                               className='w-8 h-8 rounded-full object-cover border border-gray-300'
//                             />
//                           )}
//                           <span className='flex-1'>{member.fullName}</span>
//                           {member.status === 'ACTIVE' ? (
//                             <UserCheck className='h-4 w-4 text-green-500' />
//                           ) : (
//                             <UserX className='h-4 w-4 text-red-500' />
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className='col-span-2 p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg'>
//           {isLoading ? (
//             <div className='text-gray-500 text-sm'>Loading member details...</div>
//           ) : selectedMember ? (
//             <div>
//               <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6'>
//                 <div className='flex items-center gap-4'>
//                   {selectedMember.accountPicture && (
//                     <img
//                       src={selectedMember.accountPicture}
//                       alt={`${selectedMember.fullName}'s avatar`}
//                       className='w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm'
//                     />
//                   )}
//                   <div>
//                     <h2 className='text-xl font-semibold text-gray-800'>{selectedMember.fullName}</h2>
//                     <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
//                     <p className='text-sm text-gray-500'>
//                       Position:{' '}
//                       {Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
//                         ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
//                         : 'Unassigned'}
//                     </p>
//                     <p className='text-sm text-gray-500'>
//                       Status:{' '}
//                       <span className={isActive ? 'text-green-500' : 'text-red-500'}>
//                         {selectedMember.status}
//                       </span>
//                     </p>
//                     <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
//                     <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
//                     {!isClient && (
//                       <>
//                         <p className='text-sm text-gray-600 mt-2'>
//                           Hourly Rate:{' '}
//                           {isEditingHourlyRate || isUpdatingHourlyRate ? (
//                             <input
//                               type='number'
//                               step='1'
//                               value={hourlyRate ?? ''}
//                               onChange={handleHourlyRateChange}
//                               onFocus={handleHourlyRateFocus}
//                               onBlur={handleHourlyRateBlur}
//                               className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                                 !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                               }`}
//                               disabled={isUpdatingHourlyRate || !isActive}
//                               max={maxHourlyRate}
//                             />
//                           ) : (
//                             <span
//                               className='inline-block border p-2 rounded-lg'
//                               onClick={() => isActive && setIsEditingHourlyRate(true)}
//                             >
//                               {formatVND(hourlyRate)} 
//                             </span>
//                           )}{' '}VND/hour
//                           {isUpdatingHourlyRate && (
//                             <span className='ml-2 text-gray-500'>
//                               <svg
//                                 className='animate-spin h-5 w-5 inline-block'
//                                 xmlns='http://www.w3.org/2000/svg'
//                                 fill='none'
//                                 viewBox='0 0 24 24'
//                               >
//                                 <circle
//                                   className='opacity-25'
//                                   cx='12'
//                                   cy='12'
//                                   r='10'
//                                   stroke='currentColor'
//                                   strokeWidth='4'
//                                 ></circle>
//                                 <path
//                                   className='opacity-75'
//                                   fill='currentColor'
//                                   d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                                 ></path>
//                               </svg>
//                             </span>
//                           )}
//                           {!isActive && (
//                             <span className='ml-2 text-xs text-gray-400'>
//                               (Only active members can edit)
//                             </span>
//                           )}
//                         </p>
//                         <p className='text-sm text-gray-600 mt-2'>
//                           Working Hours/Day:{' '}
//                           <input
//                             type='number'
//                             step='0.5'
//                             value={workingHoursPerDay ?? ''}
//                             onChange={handleWorkingHoursChange}
//                             onBlur={handleWorkingHoursBlur}
//                             className={`border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ${
//                               !isActive ? 'bg-gray-100 cursor-not-allowed' : ''
//                             }`}
//                             disabled={isUpdatingWorkingHours || !isActive}
//                             max={maxWorkingHoursPerDay}
//                           />{' '}
//                           h
//                           {isUpdatingWorkingHours && (
//                             <span className='ml-2 text-gray-500'>
//                               <svg
//                                 className='animate-spin h-5 w-5 inline-block'
//                                 xmlns='http://www.w3.org/2000/svg'
//                                 fill='none'
//                                 viewBox='0 0 24 24'
//                               >
//                                 <circle
//                                   className='opacity-25'
//                                   cx='12'
//                                   cy='12'
//                                   r='10'
//                                   stroke='currentColor'
//                                   strokeWidth='4'
//                                 ></circle>
//                                 <path
//                                   className='opacity-75'
//                                   fill='currentColor'
//                                   d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
//                                 ></path>
//                               </svg>
//                             </span>
//                           )}
//                           {!isActive && (
//                             <span className='ml-2 text-xs text-gray-400'>
//                               (Only active members can edit)
//                             </span>
//                           )}
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               {!isClient && (
//                 <div>
//                   <h3 className='text-lg font-semibold text-gray-800 mb-4 mt-6'>Assigned Tasks</h3>
//                   <div className='grid gap-4'>
//                     {selectedMember.tasks.length === 0 ? (
//                       <div className='text-gray-500 text-sm'>No tasks assigned</div>
//                     ) : (
//                       selectedMember.tasks.map((task, idx) => (
//                         <div
//                           key={task.id || idx}
//                           className='bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200'
//                         >
//                           <div className='flex justify-between mb-2'>
//                             <span className='text-sm font-medium text-gray-700'>{task.title}</span>
//                             <span className='text-xs text-gray-500 capitalize'>{task.status}</span>
//                           </div>
//                           <div className='w-full bg-gray-200 rounded-full h-3'>
//                             <div
//                               className='bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full'
//                               style={{ width: `${task.percentComplete ?? 0}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className='text-gray-500 text-sm'>Select a member to view tasks</div>
//           )}
//         </div>
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
import { UserCheck, UserX } from 'lucide-react';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';
import Swal from 'sweetalert2';

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
  const [isUpdatingHourlyRate, setIsUpdatingHourlyRate] = useState<boolean>(false);
  const [isUpdatingWorkingHours, setIsUpdatingWorkingHours] = useState<boolean>(false);
  const [isEditingHourlyRate, setIsEditingHourlyRate] = useState<boolean>(false);

  const [changeHourlyRate] = useChangeHourlyRateMutation();
  const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

  const maxHourlyRate = configLoading
    ? 10000000
    : configError || !config?.data?.maxValue
    ? 10000000
    : parseInt(config.data.maxValue, 10);

  const maxWorkingHoursPerDay = configWHPDLoading
    ? 8
    : configWHPDError || !configWHPD?.data?.maxValue
    ? 8
    : parseInt(configWHPD.data.maxValue, 10);

  const formatVND = (value: number | null): string => {
    if (value === null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
      if (!selectedMember) return;
      if (
        isNaN(newHourlyRate) ||
        newHourlyRate < 0 ||
        newHourlyRate > maxHourlyRate
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Hourly rate must be between 0 and ${formatVND(maxHourlyRate)} VND/h`,
          confirmButtonColor: '#3085d6',
        });
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
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Hourly rate updated successfully',
            confirmButtonColor: '#3085d6',
            timer: 1500,
            timerProgressBar: true,
          });
          refetch();
        } else if ('error' in result) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update hourly rate',
            confirmButtonColor: '#3085d6',
          });
          console.error('API Error:', result.error);
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating hourly rate',
          confirmButtonColor: '#3085d6',
        });
        console.error('Catch Error:', err);
      } finally {
        setIsUpdatingHourlyRate(false);
        setIsEditingHourlyRate(false);
      }
    },
    [selectedMember, projectId, refetch, maxHourlyRate]
  );

  const updateWorkingHoursPerDay = useCallback(
    async (newWorkingHours: number) => {
      if (!selectedMember) return;
      if (
        isNaN(newWorkingHours) ||
        newWorkingHours < 0 ||
        newWorkingHours > maxWorkingHoursPerDay
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Working hours per day must be between 0 and ${maxWorkingHoursPerDay} hours`,
          confirmButtonColor: '#3085d6',
        });
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
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Working hours per day updated successfully',
            confirmButtonColor: '#3085d6',
            timer: 1500,
            timerProgressBar: true,
          });
          refetch();
        } else if ('error' in result) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update working hours per day',
            confirmButtonColor: '#3085d6',
          });
          console.error('API Error:', result.error);
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating working hours per day',
          confirmButtonColor: '#3085d6',
        });
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

  const handleHourlyRateFocus = () => {
    setIsEditingHourlyRate(true);
  };

  const handleHourlyRateBlur = () => {
    if (hourlyRate !== null) updateHourlyRate(hourlyRate);
  };

  const handleWorkingHoursBlur = () => {
    if (workingHoursPerDay !== null) updateWorkingHoursPerDay(workingHoursPerDay);
  };

  const isClient = selectedMember?.positions?.includes('CLIENT') || false;
  const isActive = selectedMember?.status === 'ACTIVE';

  return (
    <div className='flex flex-col h-full bg-gray-50'>
      <div className='bg-gradient-to-r from-blue-600 to-purple-500 p-4 shadow-md'>
        <h3 className='text-lg font-semibold text-white'>Project Members</h3>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 flex-1'>
        <div className='border-r bg-white shadow-lg overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100'>
          <div className='p-4'>
            {isLoading ? (
              <div className='text-gray-500 text-sm'>Loading...</div>
            ) : (
              <div className='flex flex-col gap-3'>
                {Object.entries(groupedMembers()).map(([position, members]) => (
                  <div key={position} className='mb-6'>
                    <h4 className='text-sm font-medium text-gray-600 uppercase tracking-wide mb-2'>
                      {position.replace('_', ' ').toLowerCase()}
                    </h4>
                    <ul className='flex flex-col gap-2'>
                      {members.map((member) => (
                        <li
                          key={member.id}
                          onClick={() => {
                            setSelectedMember(member);
                            setHourlyRate(member.hourlyRate || null);
                            setWorkingHoursPerDay(member.workingHoursPerDay || null);
                          }}
                          className={`cursor-pointer p-3 rounded-lg hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 text-sm flex items-center gap-3 bg-white border border-gray-200 shadow-sm ${
                            selectedMember?.id === member.id ? 'bg-blue-100 font-medium border-blue-300' : ''
                          }`}
                        >
                          {member.accountPicture && (
                            <img
                              src={member.accountPicture}
                              alt={`${member.fullName}'s avatar`}
                              className='w-8 h-8 rounded-full object-cover border border-gray-300'
                            />
                          )}
                          <span className='flex-1'>{member.fullName}</span>
                          {member.status === 'ACTIVE' ? (
                            <UserCheck className='h-4 w-4 text-green-500' />
                          ) : (
                            <UserX className='h-4 w-4 text-red-500' />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='col-span-2 p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg'>
          {isLoading ? (
            <div className='text-gray-500 text-sm'>Loading member details...</div>
          ) : selectedMember ? (
            <div>
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6'>
                <div className='flex items-center gap-4'>
                  {selectedMember.accountPicture && (
                    <img
                      src={selectedMember.accountPicture}
                      alt={`${selectedMember.fullName}'s avatar`}
                      className='w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm'
                    />
                  )}
                  <div>
                    <h2 className='text-xl font-semibold text-gray-800'>{selectedMember.fullName}</h2>
                    <p className='text-sm text-gray-500'>@{selectedMember.username}</p>
                    <p className='text-sm text-gray-500'>
                      Position:{' '}
                      {Array.isArray(selectedMember.positions) && selectedMember.positions.length > 0
                        ? selectedMember.positions.join(', ').replace('_', ' ').toLowerCase()
                        : 'Unassigned'}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Status:{' '}
                      <span className={isActive ? 'text-green-500' : 'text-red-500'}>
                        {selectedMember.status}
                      </span>
                    </p>
                    <p className='text-sm text-gray-500'>Email: {selectedMember.email || 'N/A'}</p>
                    <p className='text-sm text-gray-500'>Phone: {selectedMember.phone || 'N/A'}</p>
                    {!isClient && (
                      <>
                        <p className='text-sm text-gray-600 mt-2'>
                          Hourly Rate:{' '}
                          {isEditingHourlyRate || isUpdatingHourlyRate ? (
                            <input
                              type='number'
                              step='1'
                              value={hourlyRate ?? ''}
                              onChange={handleHourlyRateChange}
                              onFocus={handleHourlyRateFocus}
                              onBlur={handleHourlyRateBlur}
                              className='border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                              disabled={isUpdatingHourlyRate}
                              max={maxHourlyRate}
                            />
                          ) : (
                            <span
                              className='inline-block border p-2 rounded-lg bg-gray-100 cursor-pointer'
                              onClick={() => setIsEditingHourlyRate(true)}
                            >
                              {formatVND(hourlyRate)} 
                            </span>
                          )}{' '}VND/h
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
                        <p className='text-sm text-gray-600 mt-2'>
                          Working Hours/Day:{' '}
                          <input
                            type='number'
                            step='0.5'
                            value={workingHoursPerDay ?? ''}
                            onChange={handleWorkingHoursChange}
                            onBlur={handleWorkingHoursBlur}
                            className='border p-2 rounded-lg w-24 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
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
              </div>
              {!isClient && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4 mt-6'>Assigned Tasks</h3>
                  <div className='grid gap-4'>
                    {selectedMember.tasks.length === 0 ? (
                      <div className='text-gray-500 text-sm'>No tasks assigned</div>
                    ) : (
                      selectedMember.tasks.map((task, idx) => (
                        <div
                          key={task.id || idx}
                          className='bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200'
                        >
                          <div className='flex justify-between mb-2'>
                            <span className='text-sm font-medium text-gray-700'>{task.title}</span>
                            <span className='text-xs text-gray-500 capitalize'>{task.status}</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-3'>
                            <div
                              className='bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full'
                              style={{ width: `${task.percentComplete ?? 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-gray-500 text-sm'>Select a member to view tasks</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectMember;
