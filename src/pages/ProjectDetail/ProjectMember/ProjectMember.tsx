// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import {
//   useGetProjectMembersWithTasksQuery,
//   useChangeHourlyRateMutation,
//   useChangeWorkingHoursPerDayMutation,
// } from '../../../services/projectMemberApi';
// import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';

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

//   const [changeHourlyRate] = useChangeHourlyRateMutation();
//   const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

//   useEffect(() => {
//     if (isSuccess && members.length > 0 && !selectedMember) {
//       setSelectedMember(members[0]);
//       setHourlyRate(members[0].hourlyRate || null);
//       setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
//     }
//   }, [members, isSuccess, selectedMember]);

//   const handleHourlyRateChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedMember || hourlyRate === null) return;

//     try {
//       console.log('PATCH hourly rate request', {
//         projectId: projectId!,
//         memberId: selectedMember.id,
//         hourlyRate,
//       });
//       const result = await changeHourlyRate({
//         projectId: projectId!,
//         memberId: selectedMember.id,
//         hourlyRate,
//       });
//       if ('data' in result && result.data?.isSuccess) {
//         setSuccess('Hourly rate updated successfully');
//         setError(null);
//         refetch(); // Refresh member data
//       } else if ('error' in result) {
//         setError('Failed to update hourly rate');
//         setSuccess(null);
//       }
//     } catch (err) {
//       setError('An error occurred while updating hourly rate');
//       setSuccess(null);
//     }
//   };

//   const handleWorkingHoursChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedMember || workingHoursPerDay === null) return;

//     try {
//       const result = await changeWorkingHoursPerDay({
//         projectId: projectId!,
//         memberId: selectedMember.id,
//         workingHoursPerDay,
//       });
//       if ('data' in result && result.data?.isSuccess) {
//         setSuccess('Working hours per day updated successfully');
//         setError(null);
//         refetch(); // Refresh member data
//       } else if ('error' in result) {
//         setError('Failed to update working hours per day');
//         setSuccess(null);
//       }
//     } catch (err) {
//       setError('An error occurred while updating working hours per day');
//       setSuccess(null);
//     }
//   };

//   return (
//     <div className='grid grid-cols-1 md:grid-cols-3 h-full'>
//       {/* Sidebar */}
//       <div className='border-r bg-white p-4'>
//         <h3 className='font-semibold text-gray-700 mb-2'>People</h3>
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : (
//           <ul>
//             {members.map((member) => (
//               <li
//                 key={member.id}
//                 onClick={() => {
//                   setSelectedMember(member);
//                   setHourlyRate(member.hourlyRate || null);
//                   setWorkingHoursPerDay(member.workingHoursPerDay || null);
//                   setError(null);
//                   setSuccess(null);
//                 }}
//                 className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm flex items-center gap-2 ${
//                   selectedMember?.id === member.id ? 'bg-blue-100 font-medium' : ''
//                 }`}
//               >
//                 {member.accountPicture && (
//                   <img
//                     src={member.accountPicture}
//                     alt={`${member.fullName}'s avatar`}
//                     className='w-6 h-6 rounded-full object-cover'
//                   />
//                 )}
//                 <span>{member.fullName}</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       {/* Member Details */}
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
//                   Hourly Rate: $
//                   {selectedMember.hourlyRate != null ? selectedMember.hourlyRate.toFixed(2) : '0'} /
//                   hour
//                 </p>
//                 <p className='text-sm text-gray-500'>
//                   Working Hours/Day:{' '}
//                   {selectedMember.workingHoursPerDay != null
//                     ? `${selectedMember.workingHoursPerDay}h`
//                     : '0'}
//                 </p>
//               </div>
//             </div>

//             {/* Edit Forms */}
//             <div className='space-y-4'>
//               <form onSubmit={handleHourlyRateChange} className='flex gap-2'>
//                 <input
//                   type='number'
//                   step='0.01'
//                   value={hourlyRate ?? ''}
//                   onChange={(e) => setHourlyRate(parseFloat(e.target.value) || null)}
//                   placeholder='Enter hourly rate'
//                   className='border p-2 rounded w-1/3'
//                 />
//                 <button type='submit' className='bg-blue-500 text-white p-2 rounded'>
//                   Update Hourly Rate
//                 </button>
//               </form>

//               <form onSubmit={handleWorkingHoursChange} className='flex gap-2'>
//                 <input
//                   type='number'
//                   step='0.1'
//                   value={workingHoursPerDay ?? ''}
//                   onChange={(e) => setWorkingHoursPerDay(parseFloat(e.target.value) || null)}
//                   placeholder='Enter working hours/day'
//                   className='border p-2 rounded w-1/3'
//                 />
//                 <button type='submit' className='bg-blue-500 text-white p-2 rounded'>
//                   Update Working Hours
//                 </button>
//               </form>

//               {error && <div className='text-red-500'>{error}</div>}
//               {success && <div className='text-green-500'>{success}</div>}
//             </div>

//             <h3 className='text-base font-semibold mb-4 mt-6'>Assigned Tasks</h3>
//             <div className='grid gap-4'>
//               {selectedMember.tasks.length === 0 ? (
//                 <div className='text-gray-500'>No tasks assigned</div>
//               ) : (
//                 selectedMember.tasks.map((task, idx) => (
//                   <div key={task.id || idx} className='bg-white shadow rounded-lg p-4 border'>
//                     <div className='flex justify-between mb-1'>
//                       <span className='text-sm font-medium text-gray-700'>{task.title}</span>
//                       <span className='text-xs text-gray-500'>{task.status}</span>
//                     </div>
//                     <div className='w-full bg-gray-200 rounded-full h-2'>
//                       <div
//                         className='bg-blue-500 h-2 rounded-full'
//                         style={{ width: `${task.percentComplete ?? 0}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </>
//         ) : (
//           <div className='text-gray-500'>Select a member to view tasks</div>
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

  const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [changeHourlyRate] = useChangeHourlyRateMutation();
  const [changeWorkingHoursPerDay] = useChangeWorkingHoursPerDayMutation();

  // Debounced update functions
  const updateHourlyRate = useCallback(
    debounce(async (newHourlyRate: number) => {
      if (!selectedMember || isNaN(newHourlyRate) || newHourlyRate < 0) {
        setError('Please enter a valid positive hourly rate');
        setSuccess(null);
        return;
      }
      try {
        console.log('PATCH hourly rate request', {
          projectId: projectId!,
          memberId: selectedMember.id,
          hourlyRate: newHourlyRate,
        });
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
      }
    }, 500), // 500ms debounce delay
    [selectedMember, projectId, refetch]
  );

  const updateWorkingHoursPerDay = useCallback(
    debounce(async (newWorkingHours: number) => {
      if (!selectedMember || isNaN(newWorkingHours) || newWorkingHours < 0) {
        setError('Please enter a valid positive working hours per day');
        setSuccess(null);
        return;
      }
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
      }
    }, 500), // 500ms debounce delay
    [selectedMember, projectId, refetch]
  );

  useEffect(() => {
    if (isSuccess && members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
      setHourlyRate(members[0].hourlyRate || null);
      setWorkingHoursPerDay(members[0].workingHoursPerDay || null);
    }
  }, [members, isSuccess, selectedMember]);

  // Handle input changes with debouncing
  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || null;
    setHourlyRate(newValue);
    if (newValue !== null) updateHourlyRate(newValue);
  };

  const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || null;
    setWorkingHoursPerDay(newValue);
    if (newValue !== null) updateWorkingHoursPerDay(newValue);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 h-full'>
      {/* Sidebar */}
      <div className='border-r bg-white p-4'>
        <h3 className='font-semibold text-gray-700 mb-2'>People</h3>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
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
        )}
      </div>
      {/* Member Details */}
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
                  Hourly Rate: VND
                  <input
                    type='number'
                    step='0.01'
                    value={hourlyRate ?? ''}
                    onChange={handleHourlyRateChange}
                    className='border p-1 rounded w-20 inline-block bg-white'
                  />{' '}
                  / hour
                </p>
                <p className='text-sm text-gray-500'>
                  Working Hours/Day:{' '}
                  <input
                    type='number'
                    step='0.1'
                    value={workingHoursPerDay ?? ''}
                    onChange={handleWorkingHoursChange}
                    className='border p-1 rounded w-20 inline-block bg-white'
                  />h
                </p>
              </div>
            </div>

            {error && <div className='text-red-500'>{error}</div>}
            {success && <div className='text-green-500'>{success}</div>}

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
        ) : (
          <div className='text-gray-500'>Select a member to view tasks</div>
        )}
      </div>
    </div>
  );
};

export default ProjectMember;