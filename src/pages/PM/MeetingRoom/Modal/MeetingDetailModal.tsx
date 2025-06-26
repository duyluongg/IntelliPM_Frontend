import type { FC } from 'react';

interface MeetingEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  startTime: string;
  endTime: string;
  participants: string;
  roomUrl: string;
}

interface Props {
  meeting: MeetingEvent;
  onClose: () => void;
  onDelete: () => void; // không dùng nhưng cần giữ để type match
}

const ModalDetailRoom: FC<Props> = ({ meeting, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">📋 Chi tiết cuộc họp</h2>
        <p><strong>Tiêu đề:</strong> {meeting.title}</p>
        <p><strong>Thời gian:</strong> {meeting.startTime} - {meeting.endTime}</p>
        <p><strong>Người tham dự:</strong> {meeting.participants}</p>
        <p><strong>Phòng họp:</strong> <a href={meeting.roomUrl} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">{meeting.roomUrl}</a></p>

        <div className="mt-6 flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailRoom;
