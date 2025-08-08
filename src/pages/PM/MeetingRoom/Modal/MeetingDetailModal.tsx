import { useNavigate } from 'react-router-dom';  // Dùng useNavigate để điều hướng
import { useAuth } from '../../../../services/AuthContext';  // Đảm bảo dùng AuthContext để kiểm tra role người dùng
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
  status: 'Present' | 'Absent' | 'Active';
  
}

interface Props {
  meeting: MeetingEvent;
  onClose: () => void;
  onDelete: () => void;
}

const ModalDetailRoom: FC<Props> = ({ meeting, onClose }) => {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT'; // Kiểm tra nếu người dùng có vai trò CLIENT
  const navigate = useNavigate(); // Dùng navigate để điều hướng

  // Hàm điều hướng khi bấm nút Reschedule Meeting
  const handleRescheduleClick = () => {
    navigate('/meeting-reschedule-request', { state: { meeting } }); // Truyền thông tin cuộc họp qua state
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">📋 Meeting details</h2>
        <p><strong>Title:</strong> {meeting.title}</p>
        <p><strong>Meeting Time:</strong> {meeting.startTime} - {meeting.endTime}</p>
        <p><strong>Participants:</strong> {parseInt(meeting.participants)} member</p>

        <p>
  <strong>Room Meeting URL:</strong>{' '}
  <a
    href={meeting.roomUrl}
    className="text-blue-500 underline break-all"
    target="_blank"
    rel="noopener noreferrer"
  >
    {meeting.roomUrl.length > 50
      ? meeting.roomUrl.slice(0, 35) + '...' + meeting.roomUrl.slice(-10)
      : meeting.roomUrl}
  </a>
</p>


        {isClient && meeting.status === 'Active' && (
          <div className="mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleRescheduleClick}
            >
              Reschedule Meeting
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailRoom;
