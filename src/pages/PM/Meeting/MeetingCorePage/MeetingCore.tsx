import { useNavigate } from 'react-router-dom';

export default function MeetingCore() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Grid Layout */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[500px]">
          {/* Top full-width box */}
          <div className="col-span-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 rounded-lg flex items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">📅</h3>
              <p className="mt-2 max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Manage your meetings with ease
              </p>
            </div>
          </div>

          {/* Bottom-left: Blue Box */}
          <div
            onClick={() => navigate('/create-meeting-room')}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer flex flex-col justify-center items-center p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">📝 Create Meeting</h3>
            <p className="text-sm text-white text-center">Create a new meeting</p>
          </div>

          {/* Bottom-middle-left: Purple Box (2 rows tall) */}
          <div
            onClick={() => navigate('/meeting-room')}
            className="col-span-1 row-span-2 bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer flex flex-col justify-center items-center p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">📂 View Meeting Room</h3>
            <p className="text-sm text-white text-center">View your scheduled meetings</p>
          </div>

          {/* Bottom-right: Orange Box (2 rows tall) */}
          <div
            onClick={() => navigate('/meeting-feedback')}
            className="col-span-1 row-span-2 bg-orange-600 hover:bg-orange-700 rounded-lg cursor-pointer flex flex-col justify-center items-center p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">💬 Meeting Feedback</h3>
            <p className="text-sm text-white text-center">View or submit feedback</p>
          </div>

          {/* Bottom-left below blue: Yellow Box */}
          <div
            onClick={() => navigate('/meeting-management')}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-lg cursor-pointer flex flex-col justify-center items-center p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">🛠️ Meeting Management</h3>
            <p className="text-sm text-gray-700 text-center">Manage meetings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
