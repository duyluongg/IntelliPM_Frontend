import React, { useEffect, useState } from 'react';
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

const CreateMeetingPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [shareDocumentViaEmail] = useShareDocumentViaEmailMutation();
  

  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

useEffect(() => {
  const shouldCheck =
    meetingDate && startTime && endTime && participantIds.length > 0;

  if (!shouldCheck) {
    setConflictMessage(null);
    return;
  }

  const checkConflicts = async () => {
    try {
      const start = new Date(`${meetingDate}T${startTime}`).toISOString();
      const end = new Date(`${meetingDate}T${endTime}`).toISOString();
      const dateIso = new Date(meetingDate).toISOString();

      const queryParams = new URLSearchParams();
      participantIds.concat(user!.id).forEach((id) => {
        queryParams.append('participantIds', id.toString());
      });
      queryParams.append('date', dateIso);
      queryParams.append('startTime', start);
      queryParams.append('endTime', end);

      const response = await fetch(
        `https://localhost:7128/api/meetings/check-conflict?${queryParams.toString()}`
      );

      if (!response.ok) throw new Error('Failed to check conflicts');

      const data = await response.json();

      if (data.conflictingAccountIds?.length > 0) {
        const conflictedNames = data.conflictingAccountIds.map((id: number) => {
          if (id === user?.id) return 'You';
          const member = projectDetails?.data.projectMembers.find(
            (m) => m.accountId === id
          );
          return member?.fullName || `User ${id}`;
        });

        setConflictMessage(
          `⚠️ These members are busy during this time: ${conflictedNames.join(', ')}`
        );
      } else {
        setConflictMessage(null);
      }
    } catch (error) {
      console.error('Error checking conflict:', error);
      setConflictMessage('❌ Unable to check conflict at this time.');
    }
  };

  checkConflicts();
}, [participantIds, meetingDate, startTime, endTime]);

  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsByAccountIdQuery(
    accountId!,
    {
      skip: !accountId,
    }
  );

  const { data: projectDetails } = useGetProjectDetailsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [createInternalMeeting, { isLoading: isCreatingInternal }] = useCreateInternalMeetingMutation();

  // const [createInternalMeeting] = useCreateInternalMeetingMutation();

  const handleParticipantToggle = (accountId: number) => {
    setParticipantIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const isValidMeetingUrl = (url: string): boolean => {
    const zoomRegex = /https:\/\/.*zoom\.us\/j\/\d+/i;
    const googleMeetRegex = /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i;
    return zoomRegex.test(url) || googleMeetRegex.test(url);
  };

  const timeSlots = [
    { label: '08:00 AM - 10:30 AM', start: '08:00', end: '10:30' },
    { label: '10:30 AM - 1:00 PM', start: '10:30', end: '13:00' },
    { label: '1:00 PM - 3:30 PM', start: '13:00', end: '15:30' },
    { label: '3:30 PM - 6:00 PM', start: '15:30', end: '18:00' },
    { label: '6:00 PM - 8:30 PM', start: '18:00', end: '20:30' },
    { label: '8:30 PM - 11:00 PM', start: '20:30', end: '23:00' },
  ];


const handleSelectAll = () => {
  const members = projectDetails?.data?.projectMembers ?? [];
  
  if (participantIds.length === members.length) {
    // Nếu tất cả đã được chọn, bỏ chọn tất cả
    setParticipantIds([]);
  } else {
    // Nếu chưa tất cả được chọn, chọn tất cả
    setParticipantIds(members.map(member => member.accountId));
  }
};


  const handleCreateMeeting = async () => {
    // console.log("🔍 Bắt đầu handleCreateMeeting");
    setErrorMessage(null);

    if (
      !selectedProjectId ||
      !meetingTopic ||
      !meetingUrl ||
      !meetingDate ||
      !startTime ||
      !endTime ||
      participantIds.length === 0
    ) {
      setErrorMessage('Please fill in all information and select at least 1 member.');
      return;
    }
    if (!isValidMeetingUrl(meetingUrl)) {
      setErrorMessage('Meeting link must be a valid Zoom or Google Meet.');
      return;
    }

    // Đảm bảo user.id được thêm vào đầu danh sách, không bị trùng
    const finalParticipantIds = [user!.id, ...participantIds.filter((id) => id !== user!.id)];

    const startDateTime = new Date(`${meetingDate}T${startTime}`).toISOString();
    const endDateTime = new Date(`${meetingDate}T${endTime}`).toISOString();
    const selectedProject = projectsData?.data.find((p) => p.projectId === selectedProjectId);
    const fullMeetingTopic = `${meetingTopic} - ${
      selectedProject?.projectName ?? 'Unknown Project'
    }`;

    const meetingPayload = {
      projectId: selectedProjectId,
      meetingTopic: fullMeetingTopic,
      meetingDate: new Date(meetingDate).toISOString(),
      meetingUrl,
      startTime: startDateTime,
      endTime: endDateTime,
      attendees: finalParticipantIds.length,
      participantIds: finalParticipantIds,
    };

    // console.log("📤 Payload gửi đi:", meetingPayload);
    // console.log("👥 Danh sách ID người tham gia:", finalParticipantIds);

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

      // alert('✅ Cuộc họp đã được tạo thành công!');
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
            (m) => m.accountId === conflictId
          );

          if (conflictedMember) {
            message = `⚠️ Member "${conflictedMember.fullName}" had a meeting during this time.`;
          } else {
            console.warn(`⚠️ No member found with accountId: ${conflictId}`);
          }
        }
      }

      setErrorMessage(message);

      setErrorMessage(message);
      // console.error('❌ Lỗi tạo cuộc họp:', error);
      // console.error('📦 Dữ liệu gửi đi:', meetingPayload);
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
              {projectsData?.data.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedProjectId && projectDetails && (
          <>
            {/* <div>
              <label className='block mb-2 font-medium text-gray-700'>Select participants</label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                {projectDetails.data.projectMembers
                  .filter((member) => member.accountId !== user?.id)
                  .map((member) => {
                    const isSelected = participantIds.includes(member.accountId); // ✅
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition 
        ${isSelected ? 'bg-blue-100 border border-blue-500' : 'bg-white border border-gray-300'}`}
                        onClick={() => handleParticipantToggle(member.accountId)} // ✅
                      >
                        <input type='checkbox' checked={isSelected} readOnly className='mr-2' />
                        {member.fullName} ({member.username})
                      </label>
                    );
                  })}
              </div>
            </div> */}

<div>

  <label className="block mb-3 text-lg font-semibold text-gray-800">Select participants</label>
    <div className="flex justify-end mb-4">
    <button
      onClick={() => handleSelectAll()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
    >
      Select All
    </button>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {projectDetails.data.projectMembers
      .filter((member) => member.accountId !== user?.id)
      .map((member) => {
        const isSelected = participantIds.includes(member.accountId);
        return (
          <label
            key={member.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
              ${isSelected ? 'bg-blue-100 border-2 border-blue-500 shadow-lg' : 'bg-white border-2 border-gray-300 hover:border-blue-300 hover:shadow-md'}`}
            onClick={() => handleParticipantToggle(member.accountId)} // Chọn khi click vào label
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
</div>


            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Meeting Title</label>
                <input
                  type='text'
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  placeholder='VD: Meeting Sprint Planning'
                />
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
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Time:</label>
                <select
                  className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                  onChange={(e) => {
                    const [start, end] = e.target.value.split('|');
                    setStartTime(start);
                    setEndTime(end);
                  }}
                  defaultValue=''
                >
                  <option value='' disabled>
                    -- Select Time Slot --
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot.label} value={`${slot.start}|${slot.end}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
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
            </div>

            {/* Custom note */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Custom Message</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className='w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400'
                placeholder='Nội dung ghi chú gửi kèm email'
              />
            </div>

            {errorMessage && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg'>
                <strong className='font-semibold'>Error:</strong> <span>{errorMessage}</span>
              </div>
            )}

            {/* <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-medium transition 
              ${
                isCreating
                  ? 'bg-blue-400 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCreating ? <div className='loadermeeting scale-75' /> : 'Create Meeting'}
            </button> */}

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
  disabled={isCreating || isCreatingInternal}
  className={`w-full flex justify-center items-center py-2 px-4 rounded-lg font-medium transition 
  ${isCreating || isCreatingInternal
    ? 'bg-blue-400 cursor-not-allowed opacity-50'
    : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`}
>
  {(isCreating || isCreatingInternal) ? <div className='loadermeeting scale-75' /> : 'Create Meeting'}
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
