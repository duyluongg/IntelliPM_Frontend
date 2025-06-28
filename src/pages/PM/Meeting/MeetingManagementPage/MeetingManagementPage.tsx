// src/pages/MeetingManagement/MeetingManagement.tsx

import React from 'react';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { useAuth } from '../../../../services/AuthContext';

const MeetingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const {
    data: meetings,
    isLoading,
    isError,
    error,
  } = useGetMeetingsManagedByQuery(accountId!, {
    skip: !accountId, // tránh gọi nếu chưa có user
  });

  if (!accountId) {
    return (
      <div className="text-red-600 font-semibold mt-4 text-center">
        ⚠️ Không tìm thấy thông tin người dùng.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-gray-600 mt-4">⏳ Đang tải danh sách cuộc họp...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-600 mt-4">
        ❌ Đã xảy ra lỗi khi tải cuộc họp: {(error as any)?.message}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛠 Quản lý cuộc họp bạn tạo</h1>

      {meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="border rounded-xl p-4 shadow hover:shadow-md transition bg-white">
              <h2 className="text-lg font-semibold text-blue-600">{meeting.meetingTopic}</h2>
              <p className="text-sm text-gray-600">📅 {new Date(meeting.meetingDate).toLocaleString()}</p>
              <p className="text-sm text-gray-700">🧑‍🤝‍🧑 Số người tham gia: {meeting.attendees}</p>
              <p className="text-sm text-gray-700">🔗 <a href={meeting.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">Tham gia họp</a></p>
              <p className="text-sm text-gray-500 mt-1">📌 Trạng thái: <strong>{meeting.status}</strong></p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 mt-4">📭 Bạn chưa tạo cuộc họp nào.</div>
      )}
    </div>
  );
};

export default MeetingManagementPage;
