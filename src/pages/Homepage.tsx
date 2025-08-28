import React from 'react';
import { Link } from 'react-router-dom';
// Để sử dụng icon, bạn cần cài đặt thư viện heroicons
// npm install @heroicons/react
import { ChartBarIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline';

const Homepage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white text-gray-800'>
      {/* ===== Navbar ===== */}
      <nav className='container mx-auto px-6 py-4 flex justify-between items-center'>
        <div className='text-2xl font-bold text-indigo-700'>IntelliPM</div>
        <div>
          <Link
            to='/login'
            className='bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105'
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className='container mx-auto px-6 py-16 md:py-24'>
        {/* ===== Hero Section ===== */}
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='text-center md:text-left'>
            <h1 className='text-5xl md:text-6xl font-extrabold text-indigo-900 mb-6 leading-tight'>
              Your Smart Project Management Solution
            </h1>
            <p className='text-xl text-gray-600 mb-12'>
              Plan, collaborate, and deliver projects of all sizes with unparalleled efficiency and
              insight.
            </p>
            <Link
              to='/login'
              className='bg-indigo-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            >
              Jump In
            </Link>
          </div>
          <div className='hidden md:block'>
            {/* Bạn có thể thay thế bằng hình ảnh hoặc animation của riêng mình */}
          </div>
        </div>

        {/* ===== Features Section ===== */}
        <div className='mt-24 md:mt-32'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-800'>Core Features</h2>
            <p className='text-gray-500 mt-2'>Everything you need to succeed in one place.</p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {/* Feature Card 1 */}
            <div className='p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mb-6'>
                <ClipboardDocumentListIcon className='h-8 w-8' />
              </div>
              <h3 className='text-2xl font-semibold text-gray-800 mb-4'>Project Planning</h3>
              <p className='text-gray-600'>
                Streamline your project planning with intelligent roadmaps and task dependencies.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className='p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mb-6'>
                <UsersIcon className='h-8 w-8' />
              </div>
              <h3 className='text-2xl font-semibold text-gray-800 mb-4'>Team Collaboration</h3>
              <p className='text-gray-600'>
                Work together seamlessly with real-time comments, file sharing, and team dashboards.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className='p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <div className='bg-purple-100 text-purple-600 rounded-full h-16 w-16 flex items-center justify-center mb-6'>
                <ChartBarIcon className='h-8 w-8' />
              </div>
              <h3 className='text-2xl font-semibold text-gray-800 mb-4'>Powerful Analytics</h3>
              <p className='text-gray-600'>
                Get actionable insights with customizable reports and powerful analytics tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
