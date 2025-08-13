// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   useGetProjectsByAccountIdQuery,
//   useGetProjectDetailsQuery,
//   useCreateMeetingMutation,
//   useCreateInternalMeetingMutation,
// } from '../../../../services/ProjectManagement/MeetingServices/MeetingServices';
// import './CreateMeetingPage.css';

// import { useAuth } from '../../../../services/AuthContext';
// import { useShareDocumentViaEmailMutation } from '../../../../services/Document/documentAPI';
// import axios from 'axios';
// import { API_BASE_URL } from '../../../../constants/api';

// const CreateMeetingPage: React.FC = () => {
//   const { user } = useAuth();
//   const accountId = user?.id;
//   const navigate = useNavigate();

//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
//   const [meetingTopic, setMeetingTopic] = useState('');
//   const [meetingUrl, setMeetingUrl] = useState('');
//   const [meetingDate, setMeetingDate] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [participantIds, setParticipantIds] = useState<number[]>([]);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [customMessage, setCustomMessage] = useState('');
// const [shareDocumentViaEmail, { isLoading: isSharing }] = useShareDocumentViaEmailMutation();  

//   const [conflictMessage, setConflictMessage] = useState<string | null>(null);
// useEffect(() => {
//   const shouldCheck =
//     meetingDate && startTime && endTime && participantIds.length > 0;

//   if (!shouldCheck) {
//     setConflictMessage(null);
//     return;
//   }

//   const checkConflicts = async () => {
//     try {
//       const start = new Date(`${meetingDate}T${startTime}`).toISOString();
//       const end = new Date(`${meetingDate}T${endTime}`).toISOString();
//       const dateIso = new Date(meetingDate).toISOString();

//       const queryParams = new URLSearchParams();
//       participantIds.concat(user!.id).forEach((id) => {
//         queryParams.append('participantIds', id.toString());
//       });
//       queryParams.append('date', dateIso);
//       queryParams.append('startTime', start);
//       queryParams.append('endTime', end);

//       const { data } = await axios.get(
//         `${API_BASE_URL}meetings/check-conflict?${queryParams.toString()}`
//       );

//       if (data.conflictingAccountIds?.length > 0) {
//         const conflictedNames = data.conflictingAccountIds.map((id: number) => {
//           if (id === user?.id) return 'You';
//           const member = projectDetails?.data.projectMembers.find(
//             (m) => m.accountId === id
//           );
//           return member?.fullName || `User ${id}`;
//         });

//         setConflictMessage(
//           `⚠️ These members are busy during this time: ${conflictedNames.join(', ')}`
//         );
//       } else {
//         setConflictMessage(null);
//       }
//     } catch (error) {
//       console.error('Error checking conflict:', error);
//       setConflictMessage('❌ Unable to check conflict at this time.');
//     }
//   };

//   checkConflicts();
// }, [participantIds, meetingDate, startTime, endTime]);

//   const { data: projectsData, isLoading: loadingProjects } = useGetProjectsByAccountIdQuery(
//     accountId!,
//     {
//       skip: !accountId,
//     }
//   );

//   const { data: projectDetails } = useGetProjectDetailsQuery(selectedProjectId!, {
//     skip: !selectedProjectId,
//   });

//   const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
//   const [createInternalMeeting, { isLoading: isCreatingInternal }] = useCreateInternalMeetingMutation();

//   // const [createInternalMeeting] = useCreateInternalMeetingMutation();

//   const handleParticipantToggle = (accountId: number) => {
//     setParticipantIds((prev) =>
//       prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
//     );
//   };

//   const isValidMeetingUrl = (url: string): boolean => {
//     const zoomRegex = /https:\/\/.*zoom\.us\/j\/\d+/i;
//     const googleMeetRegex = /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i;
//     return zoomRegex.test(url) || googleMeetRegex.test(url);
//   };

//   const timeSlots = [
//     { label: '08:00 AM - 10:30 AM', start: '08:00', end: '10:30' },
//     { label: '10:30 AM - 1:00 PM', start: '10:30', end: '13:00' },
//     { label: '1:00 PM - 3:30 PM', start: '13:00', end: '15:30' },
//     { label: '3:30 PM - 6:00 PM', start: '15:30', end: '18:00' },
//     { label: '6:00 PM - 8:30 PM', start: '18:00', end: '20:30' },
//     { label: '8:30 PM - 11:00 PM', start: '20:30', end: '23:00' },
//   ];

// const getFilteredTimeSlots = () => {
//   if (!meetingDate) return timeSlots;

//   const today = new Date();
//   const selectedDate = new Date(meetingDate);
//   const isToday = selectedDate.toDateString() === today.toDateString();

//   if (!isToday) return timeSlots;

//   const currentTime = today.getHours() + today.getMinutes() / 60;

//   return timeSlots.filter((slot) => {
//     const [hour, minute] = slot.start.split(':').map(Number);
//     const slotStartTime = hour + minute / 60;
//     return slotStartTime > currentTime;
//   });
// };

// const handleSelectAll = () => {
//   const members = projectDetails?.data?.projectMembers ?? [];
  
//   if (participantIds.length === members.length) {
//     // Nếu tất cả đã được chọn, bỏ chọn tất cả
//     setParticipantIds([]);
//   } else {
//     // Nếu chưa tất cả được chọn, chọn tất cả
//     setParticipantIds(members.map(member => member.accountId));
//   }
// };


//   const handleCreateMeeting = async () => {
//     // console.log("🔍 Bắt đầu handleCreateMeeting");
//     setErrorMessage(null);

//     if (
//       !selectedProjectId ||
//       !meetingTopic ||
//       !meetingUrl ||
//       !meetingDate ||
//       !startTime ||
//       !endTime ||
//       participantIds.length === 0
//     ) {
//       setErrorMessage('Please fill in all information and select at least 1 member.');
//       return;
//     }
//     if (!isValidMeetingUrl(meetingUrl)) {
//       setErrorMessage('Meeting link must be a valid Zoom or Google Meet.');
//       return;
//     }

//     // Đảm bảo user.id được thêm vào đầu danh sách, không bị trùng
//     const finalParticipantIds = [user!.id, ...participantIds.filter((id) => id !== user!.id)];

//     const startDateTime = new Date(`${meetingDate}T${startTime}`).toISOString();
//     const endDateTime = new Date(`${meetingDate}T${endTime}`).toISOString();
//     const selectedProject = projectsData?.data.find((p) => p.projectId === selectedProjectId);
//     const fullMeetingTopic = `${meetingTopic} - ${
//       selectedProject?.projectName ?? 'Unknown Project'
//     }`;

//     const meetingPayload = {
//       projectId: selectedProjectId,
//       meetingTopic: fullMeetingTopic,
//       meetingDate: new Date(meetingDate).toISOString(),
//       meetingUrl,
//       startTime: startDateTime,
//       endTime: endDateTime,
//       attendees: finalParticipantIds.length,
//       participantIds: finalParticipantIds,
//     };

//     // console.log("📤 Payload gửi đi:", meetingPayload);
//     // console.log("👥 Danh sách ID người tham gia:", finalParticipantIds);

//     try {
//       const role = user?.role as string;

//       const mutationToUse =
//         role === 'TEAM_LEADER' || role === 'TEAM_MEMBER'
//           ? createInternalMeeting
//           : role === 'PROJECT_MANAGER'
//           ? createMeeting
//           : null;

//       if (!mutationToUse) {
//         setErrorMessage('❌ You do not have permission to create a meeting.');
//         return;
//       }

//       const response = await mutationToUse(meetingPayload).unwrap();
//       if (uploadedFile) {
//         await shareDocumentViaEmail({
//           userIds: finalParticipantIds,
//           customMessage: customMessage,
//           file: uploadedFile,
//         }).unwrap();
//       }

//       // alert('✅ Cuộc họp đã được tạo thành công!');
//       console.log('📥 Response:', response);
//       setErrorMessage(null);
//       navigate('/meeting-room');
//     } catch (error: any) {
//       const apiError = error?.data;
//       let message =
//         apiError?.innerDetails ??
//         apiError?.details ??
//         apiError?.message ??
//         'An unknown error occurred.';

//       const conflictMatch = message.match(/Participant (\d+) has a conflicting meeting/);
//       if (conflictMatch) {
//         const conflictId = Number(conflictMatch[1]);

//         if (conflictId === user?.id) {
//           message = '⚠️ You have a meeting during this time.';
//         } else {
//           const conflictedMember = projectDetails?.data.projectMembers.find(
//             (m) => m.accountId === conflictId
//           );

//           if (conflictedMember) {
//             message = `⚠️ Member "${conflictedMember.fullName}" had a meeting during this time.`;
//           } else {
//             console.warn(`⚠️ No member found with accountId: ${conflictId}`);
//           }
//         }
//       }

//       setErrorMessage(message);

//       setErrorMessage(message);
//       // console.error('❌ Lỗi tạo cuộc họp:', error);
//       // console.error('📦 Dữ liệu gửi đi:', meetingPayload);
//     }
//   };

//   if (!accountId) {
//     return (
//       <div className='text-red-500 text-center mt-6 font-medium'>⚠️ You are not logged in</div>
//     );
//   }

//   return (
//     <div className='max-w-3xl mx-auto p-6'>
//       <div className='bg-white shadow-xl rounded-2xl p-8 space-y-6'>
//         <h1 className='text-2xl font-bold text-gray-800'>Create Meeting Room</h1>

//         {loadingProjects ? (
//           <p className='text-gray-600'>Loading project list...</p>
//         ) : (
//           <div>
//             <label className='block mb-1 font-medium text-gray-700'>Project</label>
//             <select
//               className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//               onChange={(e) => setSelectedProjectId(Number(e.target.value))}
//               value={selectedProjectId ?? ''}
//             >
//               <option value='' disabled>
//                 --Select project--
//               </option>
//               {projectsData?.data.map((project) => (
//                 <option key={project.projectId} value={project.projectId}>
//                   {project.projectName}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {selectedProjectId && projectDetails && (
//           <>

// <div>

//   <label className="block mb-3 text-lg font-semibold text-gray-800">Select participants</label>
//     <div className="flex justify-end mb-4">
//     <button
//       onClick={() => handleSelectAll()}
//       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
//     >
//       Select All
//     </button>
//   </div>
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//     {projectDetails.data.projectMembers
//       .filter((member) => member.accountId !== user?.id)
//       .map((member) => {
//         const isSelected = participantIds.includes(member.accountId);
//         return (
//           <label
//             key={member.id}
//             className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
//               ${isSelected ? 'bg-blue-100 border-2 border-blue-500 shadow-lg' : 'bg-white border-2 border-gray-300 hover:border-blue-300 hover:shadow-md'}`}
//             onClick={() => handleParticipantToggle(member.accountId)} // Chọn khi click vào label
//           >
//             <input
//               type="checkbox"
//               checked={isSelected}
//               readOnly
//               className="mr-3 h-5 w-5 text-blue-600"
//             />
//             <div className="flex flex-col">
//               <span className="text-sm font-medium text-gray-800">{member.fullName}</span>
//               <span className="text-xs text-gray-500">{member.username}</span>
//             </div>
//           </label>
//         );
//       })}
//   </div>
// </div>


//             <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//               <div>
//                 <label className='block text-sm font-medium text-gray-700'>Meeting Title</label>
//                 <input
//                   type='text'
//                   value={meetingTopic}
//                   onChange={(e) => setMeetingTopic(e.target.value)}
//                   className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//                   placeholder='VD: Meeting Sprint Planning'
//                 />
//               </div>

//               <div>
//                 <label className='block text-sm font-medium text-gray-700'>Link Meeting</label>
//                 <input
//                   type='text'
//                   value={meetingUrl}
//                   onChange={(e) => setMeetingUrl(e.target.value)}
//                   className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//                   placeholder='VD: Zoom/Google Meet'
//                 />
//               </div>

//               <div>
//                 <label className='block text-sm font-medium text-gray-700'>Day</label>
//                 <input
//                   type='date'
//                   value={meetingDate}
//                   min={new Date().toISOString().split('T')[0]}
//                   onChange={(e) => setMeetingDate(e.target.value)}
//                   className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//                 />
//               </div>
//               <div>
//                 <label className='block text-sm font-medium text-gray-700'>Time:</label>
//                 <select
//                   className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//                   onChange={(e) => {
//                     const [start, end] = e.target.value.split('|');
//                     setStartTime(start);
//                     setEndTime(end);
//                   }}
//                   defaultValue=''
//                 >
//                   <option value='' disabled>
//                     -- Select Time Slot --
//                   </option>
//                  {getFilteredTimeSlots().map((slot) => (
//                     <option key={slot.label} value={`${slot.start}|${slot.end}`}>
//                       {slot.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Upload file */}
//             <div>
//               <label className='block text-sm font-medium text-gray-700'>Upload File</label>
//               <input
//                 type='file'
//                 accept='.pdf,.doc,.docx'
//                 onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
//                 className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//               />
//             </div>

//             {/* Custom note */}
//             <div>
//               <label className='block text-sm font-medium text-gray-700'>Custom Message</label>
//               <textarea
//                 value={customMessage}
//                 onChange={(e) => setCustomMessage(e.target.value)}
//                 rows={3}
//                 className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
//                 placeholder='Content of note sent with email'
//               />
//             </div>

//             {errorMessage && (
//               <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
//                 <strong className='font-semibold'>Error:</strong> <span>{errorMessage}</span>
//               </div>
//             )}
// {conflictMessage && (
//   <div className="mt-6 flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
//     <div className="flex-shrink-0">
//       <svg
//         className="h-6 w-6 text-red-500 mt-1"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//         strokeWidth={2}
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
//         />
//       </svg>
//     </div>
//     <div className="ml-3">
//       <div className="mt-1 text-sm text-red-700">{conflictMessage}</div>
//     </div>
//   </div>
// )}
// <button
//   onClick={handleCreateMeeting}
//   disabled={isCreating || isCreatingInternal || isSharing}
//   className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-medium transition 
//   ${(isCreating || isCreatingInternal || isSharing)
//     ? 'bg-blue-400 cursor-not-allowed opacity-50'
//     : 'bg-blue-600 hover:bg-blue-700 text-white'
//   }`}
// >
//   {(isCreating || isCreatingInternal || isSharing)
//     ? <div className='loadermeeting scale-75' />
//     : 'Create Meeting'}
// </button>
//           </>
//         )}
//       </div>
//       <div className='mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-sm'>
//         <h2 className='text-lg font-semibold text-yellow-700 flex items-center'>
//           <svg
//             className='w-5 h-5 mr-2 text-yellow-600'
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth={2}
//               d='M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z'
//             />
//           </svg>
//           Business Rule
//         </h2>
//         <p className='text-sm text-yellow-700 mt-2'>
//           A <strong>Project Manager</strong> can only create{' '}
//           <strong>one meeting per project</strong> for <strong>each working day</strong>. Please
//           ensure you haven’t already scheduled a meeting today for this project.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CreateMeetingPage;
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProjectsByAccountIdQuery,
  useGetProjectDetailsQuery,
  useCreateMeetingMutation,
  useCreateInternalMeetingMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingServices';
import './CreateMeetingPage.css';

import { useAuth } from '../../../../services/AuthContext';
import { useShareDocumentViaEmailMutation } from '../../../../services/Document/documentAPI';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants/api';

const MAX_FILE_MB = 10;
const ACCEPT_EXTS = ['pdf', 'doc', 'docx'];

const timeSlots = [
  { label: '08:00 AM - 10:30 AM', start: '08:00', end: '10:30' },
  { label: '10:30 AM - 1:00 PM', start: '10:30', end: '13:00' },
  { label: '1:00 PM - 3:30 PM', start: '13:00', end: '15:30' },
  { label: '3:30 PM - 6:00 PM', start: '15:30', end: '18:00' },
  { label: '6:00 PM - 8:30 PM', start: '18:00', end: '20:30' },
  { label: '8:30 PM - 11:00 PM', start: '20:30', end: '23:00' },
];

// helper: local datetime -> ISO (tránh lệch timezone)
const toLocalIso = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
};

const CreateMeetingPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const [shareDocumentViaEmail, { isLoading: isSharing }] = useShareDocumentViaEmailMutation();

  // queries
  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsByAccountIdQuery(
    accountId!,
    { skip: !accountId }
  );
  const { data: projectDetails } = useGetProjectDetailsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [createInternalMeeting, { isLoading: isCreatingInternal }] = useCreateInternalMeetingMutation();

  // reset time when date changes
  useEffect(() => {
    setStartTime('');
    setEndTime('');
  }, [meetingDate]);

  // clear participants when switching project
  useEffect(() => {
    setParticipantIds([]);
  }, [selectedProjectId]);

  const handleParticipantToggle = (accId: number) => {
    setParticipantIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };
const isValidMeetingUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;

    // Google Meet: abc-defg-hij với optional '/' và query
    if (u.hostname === 'meet.google.com') {
      return /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(u.pathname);
    }

    // Zoom: /j/1234567890 (+ optional '/' và query)
    if (u.hostname.endsWith('.zoom.us')) {
      return /^\/j\/\d+\/?$/i.test(u.pathname);
    }

    return false;
  } catch {
    return false;
  }
};

  const getFilteredTimeSlots = () => {
    if (!meetingDate) return timeSlots;
    const today = new Date();
    const selectedDate = new Date(meetingDate);
    const isToday = selectedDate.toDateString() === today.toDateString();
    if (!isToday) return timeSlots;

    const currentTime = today.getHours() + today.getMinutes() / 60;
    return timeSlots.filter((slot) => {
      const [hour, minute] = slot.start.split(':').map(Number);
      const slotStartTime = hour + minute / 60;
      return slotStartTime > currentTime;
    });
  };

  const handleSelectAll = () => {
    const members = projectDetails?.data?.projectMembers ?? [];
    if (participantIds.length === members.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(members.map((m: any) => m.accountId));
    }
  };

  // Debounce conflict-check
  useEffect(() => {
    const shouldCheck = meetingDate && startTime && endTime && participantIds.length > 0 && selectedProjectId;
    if (!shouldCheck) {
      setConflictMessage(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const start = toLocalIso(meetingDate, startTime);
        const end = toLocalIso(meetingDate, endTime);
        const dateIso = toLocalIso(meetingDate, '00:00');

        const queryParams = new URLSearchParams();
        participantIds.concat(user!.id).forEach((id) => queryParams.append('participantIds', id.toString()));
        queryParams.append('projectId', String(selectedProjectId)); // nếu BE dùng
        queryParams.append('date', dateIso);
        queryParams.append('startTime', start);
        queryParams.append('endTime', end);

        const { data } = await axios.get(
          `${API_BASE_URL}meetings/check-conflict?${queryParams.toString()}`,
          { signal: controller.signal }
        );

        if (data?.conflictingAccountIds?.length > 0) {
          const conflictedNames = data.conflictingAccountIds.map((id: number) => {
            if (id === user?.id) return 'You';
            const member = projectDetails?.data.projectMembers.find((m: any) => m.accountId === id);
            return member?.fullName || `User ${id}`;
          });
          setConflictMessage(`⚠️ These members are busy during this time: ${conflictedNames.join(', ')}`);
        } else {
          setConflictMessage(null);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('Error checking conflict:', err);
          setConflictMessage('❌ Unable to check conflict at this time.');
        }
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [participantIds, meetingDate, startTime, endTime, projectDetails, user, selectedProjectId]);

  // Validate form
  const validateForm = () => {
    const e: Record<string, string> = {};

    if (!selectedProjectId) e.project = 'Please select a project.';

    const topic = meetingTopic.trim();
    if (!topic) e.topic = 'Meeting title is required.';
    else if (topic.length > 150) e.topic = 'Title must be ≤ 150 chars.';

    if (!meetingUrl) e.url = 'Meeting link is required.';
    else if (!/^https:\/\//i.test(meetingUrl)) e.url = 'Link must start with https://';
if (!isValidMeetingUrl(meetingUrl)) {
  e.url = 'Link must be a valid Zoom or Google Meet.';
}

    if (!meetingDate) e.date = 'Please select a date.';
    if (!startTime || !endTime) e.time = 'Please select a time slot.';
    else {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      if (startMinutes >= endMinutes) e.time = 'Start time must be before end time.';
    }

    if (participantIds.length === 0) e.participants = 'Select at least one participant.';

    if (uploadedFile) {
      const sizeMb = uploadedFile.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_MB) e.file = `File must be ≤ ${MAX_FILE_MB}MB.`;
      const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      if (!ACCEPT_EXTS.includes(ext)) e.file = 'Only PDF, DOC, DOCX are allowed.';
    }

    if (conflictMessage) e.conflict = 'There is a scheduling conflict. Please adjust time/participants.';

    setErrors(e);
    return e;
  };

  const isSubmitting = isCreating || isCreatingInternal || isSharing;
  const isReady =
    !!selectedProjectId &&
    meetingTopic.trim().length > 0 &&
    !!meetingUrl &&
    !!meetingDate &&
    !!startTime &&
    !!endTime &&
    participantIds.length > 0 &&
    !conflictMessage;

  const handleCreateMeeting = async () => {
    setErrorMessage(null);
      if (selectedProjectId == null) {
    setErrorMessage('Please select a project.');
    return;
  }
    const e = validateForm();
    if (Object.keys(e).length > 0) {
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    // add self to participants (unique)
    const finalParticipantIds = [user!.id, ...participantIds.filter((id) => id !== user!.id)];

    const startDateTime = toLocalIso(meetingDate, startTime);
    const endDateTime = toLocalIso(meetingDate, endTime);
    const selectedProject = projectsData?.data.find((p: any) => p.projectId === selectedProjectId);
    const fullMeetingTopic = `${meetingTopic.trim()} - ${selectedProject?.projectName ?? 'Unknown Project'}`;

    const meetingPayload = {
      projectId: selectedProjectId,
      meetingTopic: fullMeetingTopic,
      meetingDate: toLocalIso(meetingDate, '00:00'),
      meetingUrl,
      startTime: startDateTime,
      endTime: endDateTime,
      attendees: finalParticipantIds.length,
      participantIds: finalParticipantIds,
    };

    try {
      const role = user?.role as string;
      const mutationToUse =
        role === 'TEAM_LEADER' || role === 'TEAM_MEMBER'
          ? createInternalMeeting
          : role === 'PROJECT_MANAGER'
          ? createMeeting
          : null;

      if (!mutationToUse) {
        setErrorMessage('❌ You do not have permission to create a meeting.');
        return;
      }

      const response = await mutationToUse(meetingPayload).unwrap();

      if (uploadedFile) {
        await shareDocumentViaEmail({
          userIds: finalParticipantIds,
          customMessage: customMessage,
          file: uploadedFile,
        }).unwrap();
      }

      console.log('📥 Response:', response);
      setErrorMessage(null);
      navigate('/meeting-room');
    } catch (error: any) {
      const apiError = error?.data;
      let message =
        apiError?.innerDetails ??
        apiError?.details ??
        apiError?.message ??
        'An unknown error occurred.';

      const conflictMatch = message.match(/Participant (\d+) has a conflicting meeting/);
      if (conflictMatch) {
        const conflictId = Number(conflictMatch[1]);
        if (conflictId === user?.id) {
          message = '⚠️ You have a meeting during this time.';
        } else {
          const conflictedMember = projectDetails?.data.projectMembers.find(
            (m: any) => m.accountId === conflictId
          );
          if (conflictedMember) {
            message = `⚠️ Member "${conflictedMember.fullName}" had a meeting during this time.`;
          }
        }
      }

      setErrorMessage(message);
    }
  };

  if (!accountId) {
    return (
      <div className='text-red-500 text-center mt-6 font-medium'>⚠️ You are not logged in</div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='bg-white shadow-xl rounded-2xl p-8 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Create Meeting Room</h1>

        {loadingProjects ? (
          <p className='text-gray-600'>Loading project list...</p>
        ) : (
          <div>
            <label className='block mb-1 font-medium text-gray-700'>Project</label>
            <select
              className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              value={selectedProjectId ?? ''}
            >
              <option value='' disabled>
                --Select project--
              </option>
              {projectsData?.data.map((project: any) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>
            {errors.project && <p className='mt-1 text-sm text-red-600'>{errors.project}</p>}
          </div>
        )}

        {selectedProjectId && projectDetails && (
          <>
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-800">Select participants</label>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {projectDetails.data.projectMembers
                  .filter((member: any) => member.accountId !== user?.id)
                  .map((member: any) => {
                    const isSelected = participantIds.includes(member.accountId);
                    return (
                      <label
                        key={member.accountId}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
                          ${isSelected ? 'bg-blue-100 border-2 border-blue-500 shadow-lg' : 'bg-white border-2 border-gray-300 hover:border-blue-300 hover:shadow-md'}`}
                        onClick={() => handleParticipantToggle(member.accountId)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mr-3 h-5 w-5 text-blue-600"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{member.fullName}</span>
                          <span className="text-xs text-gray-500">{member.username}</span>
                        </div>
                      </label>
                    );
                  })}
              </div>
              {errors.participants && <p className='mt-2 text-sm text-red-600'>{errors.participants}</p>}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Meeting Title <span className='text-gray-400 text-xs'>({meetingTopic.trim().length}/150)</span>
                </label>
                <input
                  type='text'
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  placeholder='VD: Meeting Sprint Planning'
                />
                {errors.topic && <p className='mt-1 text-sm text-red-600'>{errors.topic}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Link Meeting</label>
                <input
                  type='text'
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  placeholder='VD: Zoom/Google Meet'
                />
                {errors.url && <p className='mt-1 text-sm text-red-600'>{errors.url}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Day</label>
                <input
                  type='date'
                  value={meetingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                />
                {errors.date && <p className='mt-1 text-sm text-red-600'>{errors.date}</p>}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>Time:</label>
                <select
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('|');
                    setStartTime(start || '');
                    setEndTime(end || '');
                  }}
                  value={startTime && endTime ? `${startTime}|${endTime}` : ''}
                >
                  <option value='' disabled>
                    -- Select Time Slot --
                  </option>
                  {getFilteredTimeSlots().map((slot) => (
                    <option key={slot.label} value={`${slot.start}|${slot.end}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {errors.time && <p className='mt-1 text-sm text-red-600'>{errors.time}</p>}
              </div>
            </div>

            {/* Upload file */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Upload File</label>
              <input
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
              />
              {errors.file && <p className='mt-1 text-sm text-red-600'>{errors.file}</p>}
            </div>

            {/* Custom note */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Custom Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                placeholder='Content of note sent with email'
              />
            </div>

            {errorMessage && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
                <strong className='font-semibold'>Error:</strong> <span>{errorMessage}</span>
              </div>
            )}

            {conflictMessage && (
              <div className="mt-6 flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-500 mt-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="mt-1 text-sm text-red-700">{conflictMessage}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateMeeting}
              disabled={isSubmitting || !isReady}
              className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-medium transition 
                ${isSubmitting || !isReady
                  ? 'bg-blue-400 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isSubmitting ? <div className='loadermeeting scale-75' /> : 'Create Meeting'}
            </button>
          </>
        )}
      </div>

      <div className='mt-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg shadow-sm'>
        <h2 className='text-lg font-semibold text-yellow-700 flex items-center'>
          <svg
            className='w-5 h-5 mr-2 text-yellow-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z'
            />
          </svg>
          Business Rule
        </h2>
        <p className='text-sm text-yellow-700 mt-2'>
          A <strong>Project Manager</strong> can only create{' '}
          <strong>one meeting per project</strong> for <strong>each working day</strong>. Please
          ensure you haven’t already scheduled a meeting today for this project.
        </p>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
