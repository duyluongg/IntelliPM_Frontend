import React, { useState } from 'react';
import { useLoginMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../services/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginAPI, {  isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginAPI({ username, password }).unwrap();
      if (result.isSuccess) {
        const userData = {
          id: result.data.id,
          username: result.data.username,
          email: result.data.email,
          role: result.data.role as Role,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };

        login(userData);

        switch (userData.role) {
          case 'PROJECT MANAGER':
            navigate('/pm/meeting-room');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          // case 'CUSTOMER':
          //   navigate('/user/home');
          //   break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in'
      >
        <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Đăng nhập</h2>

        <input
          className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Tên đăng nhập'
        />

        <input
          className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Mật khẩu'
        />

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50'
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {error && (
          <div className='text-red-500 text-sm mt-4 text-center animate-shake'>
            Đăng nhập thất bại! Vui lòng thử lại.
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
