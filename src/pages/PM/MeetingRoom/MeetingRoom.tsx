import { useEffect, useState } from 'react';
import type { FC } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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
}

const MeetingRoom: FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);

  const { data: meetingData, isLoading, isError } = useGetMeetingsWithParticipantStatusQuery(accountId!, {
    skip: !accountId,
  });

  useEffect(() => {
    if (meetingData && Array.isArray(meetingData)) {
      const mapped: MeetingEvent[] = meetingData.map((m) => {
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
        return '#22c55e'; // Green
      case 'Absent':
        return '#ef4444'; // Red
      case 'Active':
      default:
        return '#9ca3af'; // Gray
    }
  };

  if (!accountId) {
    return <div className="text-red-500 text-center mt-6 font-medium">⚠️ Bạn chưa đăng nhập.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📅 Meeting schedule</h1>

      {isLoading ? (
        <p className="text-center text-gray-500">Đang tải lịch họp...</p>
      ) : isError ? (
        <p className="text-center text-red-500">Lỗi khi tải lịch.</p>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            events={events.map((ev) => ({
              id: ev.id,
              title: ev.title,
              start: ev.start,
              end: ev.end,
              backgroundColor: getStatusColor(ev.status),
              borderColor: getStatusColor(ev.status),
              textColor: '#fff',
            }))}
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
