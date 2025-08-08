import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateRescheduleRequestMutation } from '../../../services/ProjectManagement/MeetingServices/MeetingRescheduleRequestServices';
import type { FC } from 'react';
import { useAuth } from '../../../services/AuthContext';
const MeetingRescheduleRequest: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { meeting } = location.state || {}; // Lấy thông tin meeting từ state
  const { user } = useAuth(); 
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createRescheduleRequest] = useCreateRescheduleRequestMutation();

  // Hàm xử lý gửi yêu cầu hoãn
// const handleSubmit = async () => {
//   if (!reason) {
//     alert('Please provide a reason for rescheduling');
//     return;
//   }

//   setIsSubmitting(true);

//   const requestData = {
//     meetingId: parseInt(meeting.id),  // Đảm bảo meetingId là số
//     requesterId: user.id,  // Giả sử ID người yêu cầu là 1, thay bằng user.id thực tế
//     requestedDate: new Date().toISOString(),
//     reason,
//     status: 'PENDING',  // Chắc chắn 'status' là 'Pending', 'Approved' hoặc 'Rejected'
//     pmId: null,  // Thay bằng ID PM thực tế
//     pmProposedDate: new Date().toISOString(),  // Ngày hoãn
//     pmNote: 'Proposed for rescheduling.',
//   };

//   // Thêm console.log để xem dữ liệu gửi đi
//   console.log('Request Data:', requestData);

//   try {
//     await createRescheduleRequest(requestData);
//     alert('Reschedule request submitted successfully');
//     navigate('/meeting');  // Điều hướng về trang lịch họp sau khi gửi yêu cầu
//   } catch (error) {
//     console.error(error); // Log lỗi để kiểm tra nguyên nhân
//     alert('Error submitting reschedule request');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

const handleSubmit = async () => {
  if (!reason) {
    alert('Please provide a reason for rescheduling');
    return;
  }

  if (!user) {
    alert('⚠️ You must login first!');
    return;
  }

  setIsSubmitting(true);

  const requestData = {
    meetingId: parseInt(meeting.id),
    requesterId: user.id,
    requestedDate: new Date().toISOString(),
    reason,
    status: 'PENDING',
    pmId: null,
    pmProposedDate: new Date().toISOString(),
    pmNote: 'Proposed for rescheduling.',
  };

  try {
    const response = await createRescheduleRequest(requestData);

    // Kiểm tra lỗi trong trường hợp response chứa error
    if (response.error) {
      if ('status' in response.error && response.error.status === 409) {
        toast.error('A pending reschedule request already exists for this meeting and requester.');
        setIsSubmitting(false); // Đảm bảo trạng thái đang gửi không bị thay đổi nếu có lỗi
        return;
      } else {
        toast.error('Error submitting reschedule request');
      }
    }

    // Nếu không có lỗi, thực hiện các hành động tiếp theo
    alert('Reschedule request submitted successfully');
    navigate('/meeting');
  } catch (error) {
    console.error(error);
    toast.error('Error submitting reschedule request');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Reschedule Meeting</h1>

      <div className="bg-white p-4 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>
        <p><strong>Title:</strong> {meeting.title}</p>
        <p><strong>Scheduled Time:</strong> {meeting.startTime} - {meeting.endTime}</p>

        <div className="mt-4">
          <h3 className="font-semibold">Reason for Rescheduling</h3>
          <textarea
            className="w-full p-2 mt-2 border rounded"
            placeholder="Provide a reason for rescheduling"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Reschedule Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRescheduleRequest;
