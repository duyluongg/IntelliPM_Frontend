import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const VerifyFail: React.FC = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" aria-hidden="true" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800">Verification Failed</h2>
        <p className="text-gray-600">
          This account is already verified or the verification link has expired. Please contact{' '}
          <a
            href="mailto:intellipm.official@gmail.com"
            className="text-blue-600 hover:underline font-medium"
          >
            intellipm.official@gmail.com
          </a>{' '}
          for assistance.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to login in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          aria-label="Go to login page"
        >
          Go to Login
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VerifyFail;