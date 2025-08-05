// import { useState } from 'react';
// import React from 'react';

// const sampleData = [
//   {
//     name: 'Hanntnse171332',
//     email: 'hanntnse171332@fpt.edu.vn',
//     tasks: [
//       {
//         title: '8. Meeting',
//         project: 'IT Project Plan',
//         progress: 0
//       }
//     ]
//   },
//   {
//     name: 'Jennifer Jones',
//     email: 'jennifer@example.com',
//     tasks: [
//       { title: 'Design Phase', project: 'Marketing Campaign', progress: 60 }
//     ]
//   }
// ];

// const ProjectMember: React.FC = () => {
//   const [selectedMember, setSelectedMember] = useState(sampleData[0]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 h-full">
//       {/* Sidebar */}
//       <div className="border-r bg-white p-4">
//         <h3 className="font-semibold text-gray-700 mb-2">People</h3>
//         <ul>
//           {sampleData.map((member) => (
//             <li
//               key={member.email}
//               onClick={() => setSelectedMember(member)}
//               className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm ${
//                 selectedMember.email === member.email ? 'bg-blue-100 font-medium' : ''
//               }`}
//             >
//               {member.name}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="col-span-2 p-6">
//         <h2 className="text-lg font-semibold mb-4">
//           {selectedMember.name}&apos;s Tasks
//         </h2>
//         <div className="grid gap-4">
//           {selectedMember.tasks.map((task, idx) => (
//             <div
//               key={idx}
//               className="bg-white shadow rounded-lg p-4 border"
//             >
//               <div className="flex justify-between mb-1">
//                 <span className="text-sm font-medium text-gray-700">
//                   {task.title}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   {task.project}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-500 h-2 rounded-full"
//                   style={{ width: `${task.progress}%` }}
//                 ></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProjectMember;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetProjectMembersWithTasksQuery } from '../../../services/projectMemberApi';
import type { ProjectMemberWithTasksResponse } from '../../../services/projectMemberApi';

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
  } = useGetProjectMembersWithTasksQuery(projectId!, {
    skip: !projectId,
  });

  const [selectedMember, setSelectedMember] = useState<ProjectMemberWithTasksResponse | null>(null);

  useEffect(() => {
    if (isSuccess && members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members, isSuccess]);

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
                onClick={() => setSelectedMember(member)}
                className={`cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-sm ${
                  selectedMember?.id === member.id ? 'bg-blue-100 font-medium' : ''
                }`}
              >
                {member.fullName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Content */}
      {/* <div className="col-span-2 p-6">
        {selectedMember ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {selectedMember.fullName}&apos;s Tasks
            </h2>
            <div className="grid gap-4">
              {selectedMember.tasks.length === 0 ? (
                <div className="text-gray-500">No tasks assigned</div>
              ) : (
                selectedMember.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow rounded-lg p-4 border"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {task.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: '50%' }} // Giả định progress nếu không có trong API
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500">Select a member to view tasks</div>
        )}
      </div> */}
      {/* Main Content */}
      <div className='col-span-2 p-6'>
        {selectedMember ? (
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
                  Hourly Rate: ${selectedMember.hourlyRate.toFixed(2)} / hour
                </p>
                <p className='text-sm text-gray-500'>
                  Working Hours/Day: {selectedMember.workingHoursPerDay}h
                </p>
              </div>
            </div>

            <h3 className='text-base font-semibold mb-4'>Assigned Tasks</h3>
            <div className='grid gap-4'>
              {selectedMember.tasks.length === 0 ? (
                <div className='text-gray-500'>No tasks assigned</div>
              ) : (
                selectedMember.tasks.map((task, idx) => (
                  <div key={idx} className='bg-white shadow rounded-lg p-4 border'>
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
