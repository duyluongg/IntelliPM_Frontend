import React, { useState, useEffect } from 'react';
import { useLoginMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../services/AuthContext';
import { useGetProjectsByAccountQuery } from '../services/accountApi';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAPI, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const { 
    data: projectData, 
    isSuccess: hasProjects, 
    error: projectError 
  } = useGetProjectsByAccountQuery(user?.accessToken || '', {
    skip: !user?.accessToken,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginAPI({ username, password }).unwrap();

      if (result.isSuccess) {
        const normalizedRole = result.data.role.toUpperCase().replace(/\s/g, '_') as Role;

        const userData = {
          id: result.data.id,
          username: result.data.username,
          email: result.data.email,
          role: normalizedRole,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };

        localStorage.setItem('accountId', result.data.id.toString());
        localStorage.setItem('username', result.data.username);
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('email', result.data.email);

        login(userData);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  useEffect(() => {
    const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(user?.role ?? '');

    if (isAccessRole) {
      if (projectError) {
        navigate('/');
        return;
      }
      const hasData = hasProjects && projectData?.data?.length > 0;
      const firstProject = hasData ? projectData.data[0] : null;

      if (hasData && firstProject) {
        navigate(`/project?projectKey=${firstProject.projectKey}#list`);
      } else {
        navigate('/');
      }
    } else if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else if (user?.role === 'CLIENT') {
      navigate('/meeting');
    }
  }, [user, hasProjects, projectData, projectError, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm space-y-6 animate-fade-in"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>

        {loginError && (
          <div className="text-red-500 text-sm text-center animate-shake">
            Login failed! Please try again.
          </div>
        )}

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;