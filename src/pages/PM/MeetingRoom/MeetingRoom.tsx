// import { useEffect, useState } from 'react';
// import type { FC } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import type { EventClickArg } from '@fullcalendar/core';
// import { useAuth } from '../../../services/AuthContext';
// import ModalDetailRoom from './Modal/MeetingDetailModal';
// import { useGetMeetingsWithParticipantStatusQuery } from '../../../services/ProjectManagement/MeetingServices/MeetingServices';
// import './MeetingRoom.css';

// interface MeetingEvent {
//   id: string;
//   title: string;
//   start: string;
//   end: string;
//   startTime: string;
//   endTime: string;
//   participants: string;
//   roomUrl: string;
//   status: 'Present' | 'Absent' | 'Active';
//   meetingStatus: string; 
// }

// const MeetingRoom: FC = () => {
//   const { user } = useAuth();
//   const accountId = user?.id;

//   const [events, setEvents] = useState<MeetingEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(true);


//   const { data: meetingData, isLoading, isError, refetch } = useGetMeetingsWithParticipantStatusQuery(accountId!, {
//     skip: !accountId,
//   });

//   useEffect(() => {
//   if (accountId) {
//     setIsRefreshing(true);
//     refetch().finally(() => setIsRefreshing(false)); // 👈 Sau khi gọi API xong, tắt loading
//   }
// }, [accountId]);
// useEffect(() => {
//   if (meetingData && Array.isArray(meetingData)) {
//     console.log(meetingData);
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // reset time to 00:00

//     const mapped: MeetingEvent[] = meetingData
//       .filter((m) => m.meetingStatus !== 'CANCELLED')
//       .filter((m) => {
//         const endDate = new Date(m.end);
//         const meetingDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

//         // Chỉ ẩn các cuộc họp có status là ACTIVE mà đã kết thúc (ngày họp < hôm nay)
//         const isOutdatedActive = m.meetingStatus === 'ACTIVE' && meetingDay < today;

//         return !isOutdatedActive;
//       })
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



//   const handleEventClick = (info: EventClickArg) => {
//     const event = events.find((e) => e.id === info.event.id);
//     if (event) setSelectedEvent(event);
//   };
//   const getStatusColor = (status: MeetingEvent['status']) => {
//   switch (status) {
//     case 'Present':
//       return '#22c55e'; // Xanh lá
//     case 'Absent':
//       return '#ef4444'; // Đỏ
//     case 'Active':
//     default:
//       return '#3b82f6'; // Xanh dương
//   }
// };


//   if (!accountId) {
//     return <div className="text-red-500 text-center mt-6 font-medium">⚠️ You are not logged in.</div>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto py-6 px-4">
//       <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📅 Meeting schedule</h1>

// {isLoading || isRefreshing ? (
//   <div className="flex justify-center items-center py-10">
//     <span className="loader"></span>
//   </div>
// ) : isError ? (
//         <p className="text-center text-red-500">Error loading calendar.</p>
//       ) : (
//         <div className="bg-white p-4 rounded-xl shadow-lg">
//           <div className="flex flex-wrap items-center gap-4 mb-4">
//   <div className="flex items-center gap-2">
//     <div className="w-4 h-4 rounded bg-green-500"></div>
//     <span className="text-sm text-gray-700">Present</span>
//   </div>
//   <div className="flex items-center gap-2">
//     <div className="w-4 h-4 rounded bg-red-500"></div>
//     <span className="text-sm text-gray-700">Absent</span>
//   </div>
//   <div className="flex items-center gap-2">
//     <div className="w-4 h-4 rounded bg-blue-500"></div>
//     <span className="text-sm text-gray-700">Upcoming</span>
//   </div>
// </div>

//           <FullCalendar
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             initialView="dayGridMonth"
//             headerToolbar={{
//               left: 'prev,next today',
//               center: 'title',
//               right: 'dayGridMonth,timeGridWeek',
//             }}
//             events={events.map((ev) => {
//               const color = getStatusColor(ev.status);
//               return {
//                 id: ev.id,
//                 title: ev.title,
//                 start: ev.start,
//                 end: ev.end,
//                 backgroundColor: color,
//                 borderColor: color,
//                 textColor: '#fff',
//               };
//             })}
//             eventClick={handleEventClick}
            
//             height="auto"
//           />
//         </div>
//       )}

//       {selectedEvent && (
//         <ModalDetailRoom
//           meeting={selectedEvent}
//           onClose={() => setSelectedEvent(null)}
//           onDelete={() => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default MeetingRoom;
// src/pages/ProjectManagement/Meetings/MeetingRoom.tsx
// src/pages/ProjectManagement/Meetings/MeetingRoom.tsx
import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { useAuth } from '../../../services/AuthContext';
import ModalDetailRoom from './Modal/MeetingDetailModal';
import { useGetMeetingsWithParticipantStatusQuery } from '../../../services/ProjectManagement/MeetingServices/MeetingServices';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
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
  status: string;        // dynamic participant status "name"
  meetingStatus: string; // dynamic meeting status "name"
}

// ---- color utils (no deps)
const hexToRgb = (hex?: string) => {
  if (!hex) return { r: 37, g: 99, b: 235 }; // blue-600 fallback
  const m = hex.replace('#', '');
  const bigint = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};
const contrastText = (hex?: string) => {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return L > 0.55 ? '#111827' : '#ffffff';
};
const fallbackColor = (v?: string) => {
  if (!v) return '#3b82f6';
  if (/present/i.test(v)) return '#22c55e';
  if (/absent/i.test(v)) return '#ef4444';
  if (/active|upcoming|pending/i.test(v)) return '#3b82f6';
  return '#3b82f6';
};
// ----------------------------

const MeetingRoom: FC = () => {
  const { user } = useAuth();
  const accountId = user?.id;

  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);

  // meetings
  const { data: meetingData, isLoading, isError, refetch } =
    useGetMeetingsWithParticipantStatusQuery(accountId!, { skip: !accountId });

  // dynamic categories
  const { data: partCat, isLoading: partLoading } =
    useGetCategoriesByGroupQuery('meeting_participant_status');
  const { data: meetCat, isLoading: meetLoading } =
    useGetCategoriesByGroupQuery('meeting_status');

  // map dynamic options
  const participantStatus = useMemo(
    () =>
      (partCat?.data ?? []).map((c: any) => ({
        value: String(c.name),
        label: String(c.label ?? c.name),
        color: (c.color as string) || undefined,
      })),
    [partCat]
  );

  const meetingStatus = useMemo(
    () =>
      (meetCat?.data ?? []).map((c: any) => ({
        value: String(c.name),
        label: String(c.label ?? c.name),
        color: (c.color as string) || undefined,
      })),
    [meetCat]
  );

  // quick lookup
  const getParticipantMeta = (v?: string) =>
    participantStatus.find(
      (s) => s.value?.toLowerCase() === (v ?? '').toLowerCase()
    );

  const getMeetingMetaByRegex = (re: RegExp) =>
    meetingStatus.find(
      (s) => re.test(s.value) || re.test(s.label)
    );

  const meetingKeys = useMemo(() => ({
    cancelled: getMeetingMetaByRegex(/cancel|void|abort/i)?.value,
    active:    getMeetingMetaByRegex(/active|upcoming|pending/i)?.value,
  }), [meetingStatus]);

  // refresh on mount / account change
  useEffect(() => {
    if (!accountId) return;
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  }, [accountId, refetch]);

  // map API -> calendar events (filter by dynamic meeting status)
  useEffect(() => {
    if (!meetingData || !Array.isArray(meetingData)) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const mapped: MeetingEvent[] = meetingData
      .filter((m) => {
        // hide cancelled
        if (meetingKeys.cancelled && m.meetingStatus === meetingKeys.cancelled) return false;
        return true;
      })
      .filter((m) => {
        // hide outdated ACTIVE
        if (!meetingKeys.active) return true;
        const endDate = new Date(m.end);
        const meetingDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const isOutdatedActive = m.meetingStatus === meetingKeys.active && meetingDay < today;
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
          status: m.status,              // dynamic participant status "name"
          meetingStatus: m.meetingStatus // dynamic meeting status "name"
        };
      });

    setEvents(mapped);
  }, [meetingData, meetingKeys]);

  const handleEventClick = (info: EventClickArg) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) setSelectedEvent(event);
  };

  if (!accountId) {
    return <div className="text-red-500 text-center mt-6 font-medium">⚠️ You are not logged in.</div>;
  }

  const loading = isLoading || isRefreshing || partLoading || meetLoading;

  // Legacy mapping cho ModalDetailRoom (nếu Modal còn xài union type cũ)
  type LegacyStatus = 'Present' | 'Absent' | 'Active';
  const toLegacyStatus = (s: string): LegacyStatus =>
    /present/i.test(s) ? 'Present' : /absent/i.test(s) ? 'Absent' : 'Active';

  const ACTIVE_DEFAULT = '#3b82f6';

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📅 Meeting schedule</h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loader"></span>
        </div>
      ) : isError ? (
        <p className="text-center text-red-500">Error loading calendar.</p>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          {/* Legend lấy từ dynamic participant status */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {participantStatus.map(s => (
              <div key={s.value} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ background: s.color ?? fallbackColor(s.value) }}
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </div>
            ))}
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
            events={events.map((ev) => {
              const meta = getParticipantMeta(ev.status);
              const bg =
                meta?.color
                  ?? (/active/i.test(ev.status) ? ACTIVE_DEFAULT : fallbackColor(ev.status));

              return {
                id: ev.id,
                title: ev.title,
                start: ev.start,
                end: ev.end,
                backgroundColor: bg,
                borderColor: bg,
                textColor: contrastText(bg),
                extendedProps: { bg }, // tránh CSS override
              };
            })}
            eventClick={handleEventClick}
            eventDidMount={(info) => {
              const bg = (info.event.extendedProps as any)?.bg as string | undefined;
              if (bg) {
                info.el.style.backgroundColor = bg;
                info.el.style.borderColor = bg;
                info.el.style.color = contrastText(bg);
              }
            }}
            height="auto"
          />
        </div>
      )}

      {selectedEvent && (
        <ModalDetailRoom
          meeting={{ ...selectedEvent, status: toLegacyStatus(selectedEvent.status) }}
          onClose={() => setSelectedEvent(null)}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default MeetingRoom;

