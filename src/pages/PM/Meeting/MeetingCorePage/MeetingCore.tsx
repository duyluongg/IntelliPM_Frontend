import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../services/AuthContext';
import './MeetingCore.css';

export default function MeetingCore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 100;
      const y = (e.clientY / innerHeight) * 100;

      if (bgRef.current) {
        bgRef.current.style.background = `
          radial-gradient(circle at ${x}% ${y}%, rgba(180, 200, 255, 0.3), rgba(160, 130, 255, 0.2), transparent 70%)
        `;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const boxBase =
    'rounded-lg cursor-pointer flex flex-col justify-center items-center p-6 ' +
    'transition-transform duration-150 ease-out hover:scale-105 active:scale-95 shadow-md';

  return (
    <div ref={bgRef} className='min-h-screen transition-all duration-300 ease-out'>
      <div className='mx-auto max-w-7xl px-6 py-24 lg:px-8'>
        {/* Banner */}
        <div className='relative bg-purple-600 overflow-hidden rounded-3xl bg-white/20 backdrop-blur-md shadow-md mb-10'>
          <div className='flex h-48 items-center justify-center'>
            <h2 className='text-center text-3xl sm:text-4xl font-bold tracking-tight banner-heading'>
              📅 Manage your meetings with ease
            </h2>
          </div>
        </div>

        {/* Main grid */}
        {isClient ? (
          <div className='grid gap-6 sm:grid-cols-2 items-stretch'>
            <div
              onClick={() => navigate('/meeting-room')}
              className={`${boxBase} bg-purple-600 text-white hover:bg-purple-700`}
            >
              <span className='text-2xl'>📂</span>
              <span className='mt-2 text-lg font-semibold'>View Meeting Room</span>
              <span className='text-sm opacity-80 text-center'>View your scheduled meetings</span>
            </div>

            <div
              onClick={() => navigate('/meeting-reschedule-request-send')}
              className={`${boxBase} bg-teal-600 text-white hover:bg-teal-700`}
            >
              <span className='text-2xl'>⏳</span>
              <span className='mt-2 text-lg font-semibold'>Reschedule Request</span>
              <span className='text-sm opacity-80 text-center'>
                Request to reschedule a meeting
              </span>
            </div>

            <div
              onClick={() => navigate('/meeting-feedback')}
              className={`${boxBase} bg-orange-600 text-white hover:bg-orange-700 col-span-full py-10`}
            >
              <span className='text-3xl'>💬</span>
              <span className='mt-3 text-xl font-semibold'>Meeting Feedback</span>
              <span className='text-base opacity-80 text-center mt-1'>
                View or submit feedback about your meetings
              </span>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-4 grid-rows-2 gap-4 min-h-[400px]'>
            {/* Ô lớn chiếm 3 cột ở hàng đầu */}
            <div
              onClick={() => navigate('/meeting-room')}
              className={`${boxBase} bg-orange-600 text-white col-span-3 row-span-1 h-[180px]`}
            >
              <h2 className='text-xl font-bold'>📂 View Meeting Room</h2>
              <p className='text-center text-sm mt-1'>Your scheduled meetings</p>
            </div>

            {/* Ô đứng cao chiếm 1 cột và 2 hàng */}
            <div
              onClick={() => navigate('/meeting-feedback')}
              className={`${boxBase} bg-cyan-600 text-white col-span-1 row-span-2 h-full`}
            >
              <h2 className='text-xl font-bold'>💬 Feedback</h2>
              <p className='text-center text-sm mt-1'>Submit or view feedback</p>
            </div>

            {/* 3 ô nhỏ bên dưới */}
            <div
              onClick={() => navigate('/project/create-meeting-room')}
              className={`${boxBase} bg-amber-500 text-white col-span-1 h-full`}
            >
              <h2 className='text-base font-semibold'>📝 Create</h2>
              <p className='text-xs text-center'>New meeting</p>
            </div>

            <div
              onClick={() => navigate('/meeting-reschedule-request-send')}
              className={`${boxBase} bg-green-600 text-white col-span-1 h-full`}
            >
              <h2 className='text-base font-semibold'>⏳ Reschedule</h2>
              <p className='text-xs text-center'>Send request</p>
            </div>

            <div
              onClick={() => navigate('/project/meeting-management')}
              className={`${boxBase} bg-pink-500 text-white col-span-1 h-full`}
            >
              <h2 className='text-base font-semibold'>🛠️ Management</h2>
              <p className='text-xs text-center'>Manage meetings</p>
            </div>

            <div
              onClick={() => navigate('/project/meeting-management/view-reject')}
              className={`${boxBase} bg-pink-500 text-white col-span-1 h-full`}
            >
              <h2 className='text-base font-semibold'>View Rejected Meetings</h2>
              <p className='text-xs text-center'>View rejected meetings</p>
            </div>

            <div
              onClick={() => navigate('/project/meeting-management/send-request')}
              className={`${boxBase} bg-pink-500 text-white col-span-1 h-full`}
            >
              <h2 className='text-base font-semibold'>Send Requests</h2>
              <p className='text-xs text-center'>Send document requests from Team Leaders</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
