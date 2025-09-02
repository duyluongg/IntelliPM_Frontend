import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './CustomerHome.css';
import qrImage from '../../assets/qrcode.png';

const navLinks = [
  // { title: "Intro", path: "/intro" },
  { title: 'Feature', path: '/feature' },
  // { title: "Sponsors", path: "/sponsors" },
  // { title: "Contact", path: "/contact" },
];

const images = [
  'https://res.cloudinary.com/monday-blogs/fl_lossy,f_auto,q_auto/wp-blog/2021/05/project-management-skills.jpg',
  'https://www.insidenewcity.com/wp-content/uploads/2023/07/iStock-1227008534-1024x614.jpg',
  'https://xebrio.com/wp-content/uploads/2019/12/become-project-manager.jpg',
];

// ✅ Component hiển thị ảnh chuyển đổi mượt
function ImageSwitcher() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative w-full max-w-md mx-auto h-[300px] md:h-[350px] rounded-xl overflow-hidden shadow-xl'>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Slide ${i}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}

export default function CustomerHome() {
  return (
    <div className='customer-home min-h-screen bg-gray-50'>
      {/* Nav Bar */}
      <header className='bg-white shadow-md'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-blue-600'>IntelliPM</h1>
          <nav className='flex gap-6 items-center'>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className='text-gray-700 hover:text-blue-600 font-medium transition-colors'
              >
                {link.title}
              </Link>
            ))}
            <Link to='/login'>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all'>
                Login
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className='bg-gradient-to-r from-indigo-800 to-teal-600 text-white rounded-xl overflow-hidden shadow-xl'>
        <div className='flex flex-col md:flex-row items-center justify-between px-6 py-16 max-w-7xl mx-auto'>
          {/* Text Section */}
          <div className='md:w-1/2 text-center md:text-left space-y-6'>
            <motion.h2
              className='text-4xl md:text-5xl font-extrabold leading-tight'
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI-Powered
              <br />
              Project Management Software
              <br />
              for Enterprise Project Managers
            </motion.h2>
            <motion.p
              className='text-lg text-white/80'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Manage multiple projects, improve collaboration, and gain insights with IntelliPM –
              your smart project assistant.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Link to='/login'>
                <button className='bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition'>
                  GET STARTED
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Image Section */}
          <motion.div
            className='md:w-1/2 mt-12 md:mt-0'
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ImageSwitcher />
          </motion.div>
        </div>
      </section>

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

      {/* Project Introduction Section */}
      <main className='mt-20 max-w-6xl mx-auto px-4 py-20 text-center space-y-12 bg-gradient-to-br from-[#0a1f44] to-[#003366] rounded-xl text-white'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-left'>
          {/* Project Name */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-3-3v6m-6 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Project Name</h4>
            <p className='text-base text-white/90'>
              <strong>English:</strong> IntelliPM – AI-Powered Project Management Software for
              Enterprise Project Manager
              <br />
              {/* <strong>Vietnamese:</strong> Nền Tảng Trợ Lý Quản Lý Dự Án Thông Minh */}
            </p>
          </div>

          {/* Problem Statement */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6l4 2'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Problem Statement</h4>
            <p className='text-base text-white/90'>
              Project managers face challenges managing sub-projects and reporting. IntelliPM solves
              this with AI-supported automation and collaboration.
            </p>
          </div>

          {/* Context */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 10h4l3 8 4-16 3 8h4'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Context</h4>
            <p className='text-base text-white/90'>
              Targets IT companies, startups, and universities needing project status tracking,
              meeting summarization, and simulation-based learning.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-left mt-12'>
          {/* Solution */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 17v-6h13M5 12l4 4L20 5'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Solution</h4>
            <p className='text-base text-white/90'>
              Portfolio management, AI summaries, productivity tracking, and mobile access for all
              roles. Real-time analytics included.
            </p>
          </div>

          {/* Tech Stack */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h7'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Tech Stack</h4>
            <ul className='text-base text-white/90 list-disc list-inside text-left'>
              <li>
                <strong>Server:</strong> C#.NET
              </li>
              <li>
                <strong>Database:</strong> PostgreSQL
              </li>
              <li>
                <strong>Web:</strong> React
              </li>
              <li>
                <strong>Mobile:</strong> Flutter
              </li>
              <li>
                <strong>Payment:</strong> PayOS
              </li>
            </ul>
          </div>

          {/* Key Modules */}
          <div className='group flex flex-col items-center text-center space-y-4 transform transition duration-300 hover:-translate-y-2'>
            <div className='w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full transition-transform duration-500 group-hover:scale-110'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-10 w-10 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h4 className='text-xl font-bold'>Key Modules</h4>
            <ul className='text-base text-white/90 list-disc list-inside text-left'>
              <li>Project portfolio management</li>
              <li>AI summarization and team mood tracking</li>
              <li>PM Simulator with decision-making feedback</li>
              <li>Cross-team collaboration</li>
              <li>Check-ins and dashboards</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
