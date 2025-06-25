import type { FC } from 'react'
import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { Modal } from './Modal/Modal'
import ModalDetailRoom from './Modal/MeetingDetailModal'
import './MeetingRoom.css' 
interface MeetingEvent {
  id: string
  title: string
  start: string
  end?: string
  startTime: string
  endTime: string
  participants: string
  roomUrl: string
}

const MeetingRoom: FC = () => {
  const [events, setEvents] = useState<MeetingEvent[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<MeetingEvent | null>(null)

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr)
    setModalOpen(true)
  }

  const handleAddMeeting = (data: {
    title: string
    startTime: string
    endTime: string
    participants: string
    roomUrl: string
  }) => {
    const id = Date.now().toString()

    const newEvent: MeetingEvent = {
      id,
      title: data.title,
      start: `${selectedDate}T${data.startTime}:00`,
      end: `${selectedDate}T${data.endTime}:00`,
      startTime: data.startTime,
      endTime: data.endTime,
      participants: data.participants,
      roomUrl: data.roomUrl,
    }

    setEvents(prev => [...prev, newEvent])
    setModalOpen(false)
  }

  const handleEventClick = (info: EventClickArg) => {
    const event = events.find(ev => ev.id === info.event.id)
    if (event) {
      setSelectedEvent(event)
    }
  }

  const handleDeleteMeeting = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(ev => ev.id !== selectedEvent.id))
      setSelectedEvent(null)
    }
  }

  return (
    <div className="meeting-container">
      <h1 className="meeting-title">📅 Tạo & Theo Dõi Lịch Họp</h1>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />

      {modalOpen && (
        <Modal
          date={selectedDate}
          onClose={() => setModalOpen(false)}
          onSave={handleAddMeeting}
        />
      )}

      {selectedEvent && (
        <ModalDetailRoom
          meeting={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteMeeting}
        />
      )}
    </div>
  )
}

export default MeetingRoom
