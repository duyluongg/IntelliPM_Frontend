import React, { useEffect, useRef } from 'react';
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
    <div ref={bgRef} className="min-h-screen transition-all duration-300 ease-out">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        {/* Banner */}
        <div className="relative bg-purple-600 overflow-hidden rounded-3xl bg-white/20 backdrop-blur-md shadow-md mb-10">
          <div className="flex h-48 items-center justify-center">
            <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight banner-heading">
              📅 Manage your meetings with ease
            </h2>
          </div>
        </div>

        {/* Main grid */}
        {isClient ? (
  <div className="grid gap-6 sm:grid-cols-2 items-stretch min-h-[300px]">
    <div
      onClick={() => navigate('/meeting-room')}
      className={`${boxBase} bg-purple-600 text-white hover:bg-purple-700 h-full`}
    >
      <span className="text-2xl">📂</span>
      <span className="mt-2 text-lg font-semibold">View Meeting Room</span>
      <span className="text-sm opacity-80 text-center">View your scheduled meetings</span>
    </div>

    <div
      onClick={() => navigate('/meeting-feedback')}
      className={`${boxBase} bg-orange-600 text-white hover:bg-orange-700 h-full`}
    >
      <span className="text-2xl">💬</span>
      <span className="mt-2 text-lg font-semibold">Meeting Feedback</span>
      <span className="text-sm opacity-80 text-center">View or submit feedback</span>
    </div>
  </div>
) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[500px]">
            {/* Top row: decorative only (không chứa tiêu đề nữa) */}
           
            <div
              onClick={() => navigate('/project/create-meeting-room')}
              className={`${boxBase} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <h3 className="text-lg font-semibold">📝 Create Meeting</h3>
              <p className="text-sm text-center">Create a new meeting</p>
            </div>

            <div
              onClick={() => navigate('/meeting-room')}
              className={`col-span-1 row-span-2 ${boxBase} bg-purple-600 text-white hover:bg-purple-700`}
            >
              <h3 className="text-lg font-semibold">📂 View Meeting Room</h3>
              <p className="text-sm text-center">View your scheduled meetings</p>
            </div>

            <div
              onClick={() => navigate('/meeting-feedback')}
              className={`col-span-1 row-span-2 ${boxBase} bg-orange-600 text-white hover:bg-orange-700`}
            >
              <h3 className="text-lg font-semibold">💬 Meeting Feedback</h3>
              <p className="text-sm text-center">View or submit feedback</p>
            </div>

            <div
              onClick={() => navigate('/project/meeting-management')}
              className={`${boxBase} bg-yellow-500 text-gray-800 hover:bg-yellow-600`}
            >
              <h3 className="text-lg font-semibold">🛠️ Meeting Management</h3>
              <p className="text-sm text-center">Manage meetings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
