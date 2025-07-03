import React, { useState } from 'react';
import {
  useGetProjectsByAccountIdQuery,
  useGetProjectDetailsQuery,
  useCreateMeetingMutation,
  useCreateInternalMeetingMutation,
} from '../../../../services/ProjectManagement/MeetingServices/MeetingServices';

import { useAuth } from '../../../../services/AuthContext';

const CreateMeetingPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [participantIds, setParticipantIds] = useState<number[]>([]);

  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsByAccountIdQuery(accountId!, {
    skip: !accountId,
  });

  const { data: projectDetails } = useGetProjectDetailsQuery(selectedProjectId!, {
    skip: !selectedProjectId,
  });

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
  const [createInternalMeeting] = useCreateInternalMeetingMutation();


  const handleParticipantToggle = (accountId: number) => {
    setParticipantIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
    console.log(`🟩 ${participantIds.includes(accountId) ? 'Bỏ chọn' : 'Chọn'} account ID: ${accountId}`);
  };
  

const handleCreateMeeting = async () => {
  console.log("🔍 Bắt đầu handleCreateMeeting");
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
    setErrorMessage('Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 thành viên.');
    return;
  }

  // Đảm bảo user.id được thêm vào đầu danh sách, không bị trùng
  const finalParticipantIds = [user!.id, ...participantIds.filter(id => id !== user!.id)];

  const startDateTime = new Date(`${meetingDate}T${startTime}`).toISOString();
  const endDateTime = new Date(`${meetingDate}T${endTime}`).toISOString();

  const meetingPayload = {
    projectId: selectedProjectId,
    meetingTopic,
    meetingDate: new Date(meetingDate).toISOString(),
    meetingUrl,
    startTime: startDateTime,
    endTime: endDateTime,
    attendees: finalParticipantIds.length,
    participantIds: finalParticipantIds,
  };

  console.log("📤 Payload gửi đi:", meetingPayload);
  console.log("👥 Danh sách ID người tham gia:", finalParticipantIds);

  try {
    const role = user?.role as string;

    const mutationToUse =
      role === 'TEAM_LEADER'
        ? createInternalMeeting
        : role === 'PROJECT_MANAGER'
        ? createMeeting
        : null;

    if (!mutationToUse) {
      setErrorMessage('❌ Bạn không có quyền tạo cuộc họp.');
      return;
    }

    const response = await mutationToUse(meetingPayload).unwrap();

    alert('✅ Cuộc họp đã được tạo thành công!');
    console.log('📥 Response:', response);
    setErrorMessage(null);
  } catch (error: any) {
    const apiError = error?.data;
    const message =
      apiError?.innerDetails ?? apiError?.details ?? apiError?.message ?? 'Đã xảy ra lỗi không xác định.';
    setErrorMessage(message);
    console.error('❌ Lỗi tạo cuộc họp:', error);
    console.error('📦 Dữ liệu gửi đi:', meetingPayload);
  }
};



  
  if (!accountId) {
    return (
      <div className="text-red-500 text-center mt-6 font-medium">
        ⚠️ Bạn chưa đăng nhập hoặc thiếu thông tin người dùng.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Tạo cuộc họp mới</h1>

        {loadingProjects ? (
          <p className="text-gray-600">Đang tải danh sách dự án...</p>
        ) : (
          <div>
            <label className="block mb-1 font-medium text-gray-700">Dự án</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              value={selectedProjectId ?? ''}
            >
              <option value="" disabled>-- Chọn dự án --</option>
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
            <div>
              <label className="block mb-2 font-medium text-gray-700">Chọn thành viên tham dự</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {projectDetails.data.projectMembers.map((member) => {
  const isSelected = participantIds.includes(member.accountId); // ✅
  return (
    <label
      key={member.id}
      className={`flex items-center p-2 rounded-md cursor-pointer transition 
        ${isSelected ? 'bg-blue-100 border border-blue-500' : 'bg-white border border-gray-300'}`}
      onClick={() => handleParticipantToggle(member.accountId)} // ✅
    >
      <input
        type="checkbox"
        checked={isSelected}
        readOnly
        className="mr-2"
      />
      {member.fullName} ({member.username})
    </label>
  );
})}

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
                <input
                  type="text"
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  placeholder="VD: Họp Sprint Planning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Link họp</label>
                <input
                  type="text"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  placeholder="VD: Zoom/Google Meet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <strong className="font-semibold">Lỗi:</strong> <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition"
            >
              {isCreating ? 'Đang tạo cuộc họp...' : 'Tạo cuộc họp'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateMeetingPage;
