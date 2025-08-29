import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/authApi';
import { useGetCategoriesByGroupQuery } from '../services/dynamicCategoryApi';
import { Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [position, setPosition] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [registerAPI, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
  const { data: positionData, isLoading: isPositionsLoading } =
    useGetCategoriesByGroupQuery('account_position');
  const navigate = useNavigate();

  // Extract position options from DynamicCategory
  const positionOptions = positionData?.data?.map((category) => category.name) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);

    try {
      const result = await registerAPI({
        username,
        password,
        email,
        gender,
        position,
      }).unwrap();

      if (result.isSuccess) {
        alert('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  // Extract error message from backend response
  const errorMessage =
    registerError && 'data' in registerError
      ? (registerError.data as { message?: string })?.message ||
        'Registration failed! Please try again.'
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4'
    >
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6'
      >
        <h2 className='text-3xl font-bold text-center text-gray-800'>Register</h2>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='username'>
            Username
          </label>
          <input
            id='username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            placeholder='Enter your username'
            required
            aria-required='true'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10'
              placeholder='Enter your password'
              required
              aria-required='true'
            />
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='confirmPassword'>
            Confirm Password
          </label>
          <div className='relative'>
            <input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10'
              placeholder='Confirm your password'
              required
              aria-required='true'
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='email'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            placeholder='Enter your email'
            required
            aria-required='true'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='gender'>
            Gender
          </label>
          <select
            id='gender'
            value={gender}
            onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            required
            aria-required='true'
          >
            <option value='MALE'>Male</option>
            <option value='FEMALE'>Female</option>
            <option value='OTHER'>Other</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='position'>
            Position
          </label>
          <select
            id='position'
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            required
            aria-required='true'
            disabled={isPositionsLoading}
          >
            {isPositionsLoading ? (
              <option value=''>Loading positions...</option>
            ) : positionOptions.length > 0 ? (
              positionOptions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos.replace(/_/g, ' ')}
                </option>
              ))
            ) : (
              <option value=''>No positions available</option>
            )}
          </select>
        </div>

        <button
          type='submit'
          disabled={isRegistering || isPositionsLoading}
          className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50'
        >
          {isRegistering ? 'Registering...' : 'Register'}
        </button>

        {(errorMessage || passwordMismatch) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-red-500 text-sm text-center animate-shake'
          >
            {passwordMismatch ? 'Passwords do not match' : errorMessage}
          </motion.div>
        )}

        <div className='text-center text-sm'>
          <span className='text-gray-600'>Already have an account? </span>
          <button
            type='button'
            onClick={() => navigate('/login')}
            className='text-blue-600 hover:underline font-medium'
          >
            Login
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Register;
