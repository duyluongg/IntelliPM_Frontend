import { useEffect, useState } from 'react';
import type { FC } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { useAuth } from '../../../services/AuthContext';
import ModalDetailRoom from './Modal/MeetingDetailModal';
import { useGetMeetingsWithParticipantStatusQuery } from '../../../services/ProjectManagement/MeetingServices/MeetingServices';
import './MeetingRoom.css';

interface MeetingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  participants: string;
  roomUrl: string;
  status: 'Present' | 'Absent' | 'Active';
  meetingStatus: string; 
}

const MeetingRoom: FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);


  const { data: meetingData, isLoading, isError, refetch } = useGetMeetingsWithParticipantStatusQuery(accountId!, {
    skip: !accountId,
  });

  useEffect(() => {
  if (accountId) {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false)); // 👈 Sau khi gọi API xong, tắt loading
  }
}, [accountId]);


  // useEffect(() => {
  //   if (meetingData && Array.isArray(meetingData)) {
  //     const mapped: MeetingEvent[] = meetingData
  //       .filter((m) => m.meetingStatus !== 'CANCELLED') 
  //       .map((m) => {
  //         const startDate = new Date(m.start);
  //         const endDate = new Date(m.end);

  //         return {
  //           id: m.id,
  //           title: m.title,
  //           start: m.start,
  //           end: m.end,
  //           startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //           endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //           participants: m.participants,
  //           roomUrl: m.roomUrl,
  //           status: m.status,
  //           meetingStatus: m.meetingStatus, 
  //         };
  //       });

  //     setEvents(mapped);
  //   }
  // }, [meetingData]);
useEffect(() => {
  if (meetingData && Array.isArray(meetingData)) {
    console.log(meetingData);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // reset time to 00:00

    const mapped: MeetingEvent[] = meetingData
      .filter((m) => m.meetingStatus !== 'CANCELLED')
      .filter((m) => {
        const endDate = new Date(m.end);
        const meetingDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        // Chỉ ẩn các cuộc họp có status là ACTIVE mà đã kết thúc (ngày họp < hôm nay)
        const isOutdatedActive = m.meetingStatus === 'ACTIVE' && meetingDay < today;

        return !isOutdatedActive;
      })
      .map((m) => {
        const startDate = new Date(m.start);
        const endDate = new Date(m.end);

        return {
          id: m.id,
          title: m.title,
          start: m.start,
          end: m.end,
          startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          participants: m.participants,
          roomUrl: m.roomUrl,
          status: m.status,
          meetingStatus: m.meetingStatus,
        };
      });

    setEvents(mapped);
  }
}, [meetingData]);



  const handleEventClick = (info: EventClickArg) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) setSelectedEvent(event);
  };
  const getStatusColor = (status: MeetingEvent['status']) => {
  switch (status) {
    case 'Present':
      return '#22c55e'; // Xanh lá
    case 'Absent':
      return '#ef4444'; // Đỏ
    case 'Active':
    default:
      return '#3b82f6'; // Xanh dương
  }
};


  if (!accountId) {
    return <div className="text-red-500 text-center mt-6 font-medium">⚠️ You are not logged in.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📅 Meeting schedule</h1>

{isLoading || isRefreshing ? (
  <div className="flex justify-center items-center py-10">
    <span className="loader"></span>
  </div>
) : isError ? (
        <p className="text-center text-red-500">Error loading calendar.</p>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="flex flex-wrap items-center gap-4 mb-4">
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-green-500"></div>
    <span className="text-sm text-gray-700">Present</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-red-500"></div>
    <span className="text-sm text-gray-700">Absent</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-blue-500"></div>
    <span className="text-sm text-gray-700">Upcoming</span>
  </div>
  {/* <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-gray-300"></div>
    <span className="text-sm text-gray-700">Past</span>
  </div> */}
</div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            events={events.map((ev) => {
              const color = getStatusColor(ev.status);
              return {
                id: ev.id,
                title: ev.title,
                start: ev.start,
                end: ev.end,
                backgroundColor: color,
                borderColor: color,
                textColor: '#fff',
              };
            })}
            eventClick={handleEventClick}
            
            height="auto"
          />
        </div>
      )}

      {selectedEvent && (
        <ModalDetailRoom
          meeting={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default MeetingRoom;
