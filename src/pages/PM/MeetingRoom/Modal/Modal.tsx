// import type { FC } from 'react'
// import { useState } from 'react'

// interface ModalProps {
//   date: string
//   onClose: () => void
//   onSave: (data: {
//     title: string
//     startTime: string
//     endTime: string
//     participants: string
//     roomUrl: string
//   }) => void
// }

// export const Modal: FC<ModalProps> = ({ date, onClose, onSave }) => {
//   const [title, setTitle] = useState('')
//   const [startTime, setStartTime] = useState('')
//   const [endTime, setEndTime] = useState('')
//   const [participants, setParticipants] = useState('')
//   const [roomUrl, setRoomUrl] = useState('')

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white rounded p-6 w-96 shadow-lg">
//         <h2 className="text-xl font-semibold mb-4">📝 Tạo Cuộc Họp vào {date}</h2>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Nhập tiêu đề cuộc họp"
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <div className="flex gap-2 mb-2">
//           <input
//             type="time"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             className="w-1/2 p-2 border border-gray-300 rounded"
//           />
//           <input
//             type="time"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             className="w-1/2 p-2 border border-gray-300 rounded"
//           />
//         </div>
//         <input
//           type="text"
//           value={participants}
//           onChange={(e) => setParticipants(e.target.value)}
//           placeholder="Tên thành viên (cách nhau bởi dấu phẩy)"
//           className="w-full p-2 border border-gray-300 rounded mb-2"
//         />
//         <input
//           type="text"
//           value={roomUrl}
//           onChange={(e) => setRoomUrl(e.target.value)}
//           placeholder="URL phòng họp"
//           className="w-full p-2 border border-gray-300 rounded mb-4"
//         />
//         <div className="flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
//           >
//             Hủy
//           </button>
//           <button
//             onClick={() => onSave({ title, startTime, endTime, participants, roomUrl })}
//             className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
//           >
//             Lưu
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

import type { FC } from 'react'
import { useState } from 'react'

interface ModalProps {
  date: string
  onClose: () => void
  onSave: (data: {
    title: string
    startTime: string
    endTime: string
    participants: string
    roomUrl: string
  }) => void
}

// Hàm tạo các slot 2h30 từ 07:30 đến trước 18:00
const generateMeetingSlots = () => {
  const slots: { start: string; end: string }[] = []
  let start = new Date()
  start.setHours(7, 30, 0, 0) // 07:30

  const endLimit = new Date()
  endLimit.setHours(18, 0, 0, 0) // 18:00

  while (start < endLimit) {
    const end = new Date(start.getTime() + 2.5 * 60 * 60 * 1000)
    if (end > endLimit) break

    const format = (d: Date) =>
      d.toTimeString().slice(0, 5) // hh:mm

    slots.push({ start: format(start), end: format(end) })
    start = end
  }

  return slots
}

export const Modal: FC<ModalProps> = ({ date, onClose, onSave }) => {
  const [title, setTitle] = useState('')
  const [slotIndex, setSlotIndex] = useState(0)
  const [participants, setParticipants] = useState('')
  const [roomUrl, setRoomUrl] = useState('')

  const slots = generateMeetingSlots()
  const selectedSlot = slots[slotIndex]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">📝 Tạo Cuộc Họp vào {date}</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề cuộc họp"
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />

        <select
          value={slotIndex}
          onChange={(e) => setSlotIndex(parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded mb-2"
        >
          {slots.map((slot, index) => (
            <option key={index} value={index}>
              {slot.start} - {slot.end}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="Tên thành viên (cách nhau bởi dấu phẩy)"
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />

        <input
          type="text"
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
          placeholder="URL phòng họp"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                participants,
                roomUrl,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
