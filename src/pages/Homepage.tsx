import React from 'react';
import { Link } from 'react-router-dom';
import qrImage from '../assets/App_IntelliPM.png';
import { ChartBarIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline';

// const AppStoreBadge = () => (
//   <a href='#' target='_blank' rel='noopener noreferrer'>
//     <img src='https://tools.apple.com/assets/badges/download-on-the-app-store/black/en-us.svg' alt='Download on the App Store' className='h-12 w-auto' />
//   </a>
// );

// // Official-looking Google Play Badge
// const GooglePlayBadge = () => (
//   <a href='#' target='_blank' rel='noopener noreferrer'>
//     <img src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' alt='Get it on Google Play' className='h-12 w-auto' />
//   </a>
// );

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
      <div className='container mx-auto px-6 py-16 md:py-24'>
        <div className='bg-indigo-600 text-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-around gap-12 relative overflow-hidden'>
          {/* Decorative background elements */}
          <div className='absolute -top-10 -left-10 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob'></div>
          <div className='absolute -bottom-10 -right-10 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000'></div>

          {/* Text content */}
          <div className='text-center md:text-left relative z-10'>
            <h2 className='text-4xl md:text-5xl font-bold mb-4 leading-tight'>
              Get IntelliPM on the Go! 🚀
            </h2>
            <p className='text-indigo-100 mb-8 text-lg max-w-md mx-auto md:mx-0'>
              {/* Thay đổi ở đây */}
              Manage your projects from anywhere with our native Android app. Scan the QR code or
              tap the badge to download from Googe Drive.
            </p>
          </div>

          {/* QR Code */}
          <div className='flex justify-center items-center relative z-10'>
            <div className='bg-white p-6 rounded-3xl shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500'>
              <img
                src={qrImage}
                alt='QR code to download the mobile app'
                className='w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl'
              />
              <p className='text-center text-gray-700 text-sm mt-3 font-semibold'>
                Scan to Download!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <footer className='container mx-auto px-6 py-8 mt-16 text-center text-gray-500'>
        <div className='border-t border-gray-200 pt-8'>
          <p>&copy; {new Date().getFullYear()} IntelliPM. All rights reserved.</p>
          <div className='mt-4 flex justify-center gap-6'>
            <Link to='/privacy' className='hover:text-indigo-600 transition-colors'>
              Privacy Policy
            </Link>
            <Link to='/terms' className='hover:text-indigo-600 transition-colors'>
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
