import React, { useEffect, useState } from 'react';
import { useGetMeetingsManagedByQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingLogServices';
import { useAuth } from '../../../../services/AuthContext';
import { CalendarDays, Link2, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { useLazyGetRejectedFeedbacksQuery } from '../../../../services/ProjectManagement/MeetingServices/MeetingFeedbackServices';
import { useNavigate } from 'react-router-dom';
import { useLazyGetProjectByIdQuery } from '../../../../services/projectApi';
import RequestFormModal from './RequestFormModal';

export default function CreateDocumentRequestMeeting() {
  const { user } = useAuth();
  const accountId = user?.id;
  const navigate = useNavigate();
  const [triggerGetProjectById] = useLazyGetProjectByIdQuery();

  const {
    data: managedMeetings = [],
    isLoading,
    isError,
  } = useGetMeetingsManagedByQuery(accountId!, {
    skip: !accountId,
  });

  const [meetingsWithReject, setMeetingsWithReject] = useState<any[]>([]);
  const [triggerGetFeedback] = useLazyGetRejectedFeedbacksQuery();

  useEffect(() => {
    const fetchRejectedFeedbacks = async () => {
      const result = await Promise.all(
        managedMeetings.map(async (meeting) => {
          const { data, isSuccess } = await triggerGetFeedback(meeting.id, true);
          return isSuccess && data.length > 0 ? { ...meeting, rejectedFeedbacks: data } : null;
        })
      );
      setMeetingsWithReject(result.filter(Boolean));
    };

    if (managedMeetings.length > 0) {
      fetchRejectedFeedbacks();
    }
  }, [managedMeetings]);

  const [selectedFeedback, setSelectedFeedback] = useState<{
    feedbackId: number;
    projectManagerId: number;
  } | null>(null);

  const handleRequest = (feedbackId: number, projectManagerId: number) => {
    setSelectedFeedback({ feedbackId, projectManagerId });
  };

  if (isLoading) return <div className='p-4'>Đang tải dữ liệu...</div>;
  if (isError) return <div className='p-4 text-red-500'>Lỗi khi tải dữ liệu cuộc họp</div>;

  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Cuộc họp có feedback bị từ chối</h1>
      {meetingsWithReject.length === 0 ? (
        <div className='text-gray-500'>Không có cuộc họp nào bị reject.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {meetingsWithReject.map((meeting) => (
            <div key={meeting.id} className='bg-white p-4 rounded-lg shadow border border-gray-200'>
              <h2 className='text-xl font-semibold text-blue-700 mb-2'>{meeting.meetingTopic}</h2>
              <div className='text-sm text-gray-600 flex items-center gap-2 mb-1'>
                <CalendarDays size={16} />
                Ngày: {dayjs(meeting.meetingDate).format('DD/MM/YYYY')}
              </div>
              <div className='text-sm text-gray-600 flex items-center gap-2 mb-1'>
                🕒 {dayjs(meeting.startTime).format('HH:mm')} -{' '}
                {dayjs(meeting.endTime).format('HH:mm')}
              </div>
              <div className='text-sm text-gray-600 flex items-center gap-2 mb-1'>
                <Users size={16} /> {meeting.attendees} người tham gia
              </div>
              <div className='text-sm text-gray-600 flex items-center gap-2 break-all'>
                <Link2 size={16} />
                <a
                  href={meeting.meetingUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 underline'
                >
                  {meeting.meetingUrl}
                </a>
              </div>

              {/* Feedback */}
              <div className='mt-3 text-sm text-red-600'>
                <strong>Feedback bị từ chối:</strong>
                <ul className='list-disc list-inside'>
                  {meeting.rejectedFeedbacks?.map((fb: any) => (
                    <li key={fb.id}>
                      <span className='font-medium'>{fb.accountName}:</span> {fb.feedbackText}
                    </li>
                  ))}
                </ul>
              </div>

              <div className='text-xs text-gray-400 mt-2'>
                Tạo lúc: {dayjs(meeting.createdAt).format('DD/MM/YYYY HH:mm')}
              </div>
              <button
                onClick={() =>
                  handleRequest(meeting.rejectedFeedbacks[0].id, meeting.projectManagerId)
                }
                className='bg-blue-400 p-3 text-center rounded-lg text-white hover:bg-blue-500 transition-colors mt-4'
              >
                Create a Request
              </button>
            </div>
          ))}
          <RequestFormModal
            isOpen={!!selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
            feedbackId={selectedFeedback?.feedbackId || 0}
            projectManagerId={selectedFeedback?.projectManagerId || 0}
          />
        </div>
      )}
    </div>
  );
}
