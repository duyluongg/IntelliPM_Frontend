// import React, { useState, useEffect } from 'react';
// import { useLoginMutation } from '../services/authApi';
// import { useNavigate } from 'react-router-dom';
// import { useAuth, type Role } from '../services/AuthContext';
// import { useGetProjectsByAccountQuery } from '../services/accountApi';

// const Login: React.FC = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loginAPI, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
//   const navigate = useNavigate();
//   const { login, user } = useAuth();

//   // ⚠️ Gọi API project chỉ sau khi có user (sau khi login thành công)
//   const { data: projectData, isSuccess: hasProjects } = useGetProjectsByAccountQuery(
//     user?.accessToken || '',
//     {
//       skip: !user?.accessToken,
//     }
//   );

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const result = await loginAPI({ username, password }).unwrap();

//       if (result.isSuccess) {
//         const normalizedRole = result.data.role.toUpperCase().replace(/\s/g, '_') as Role;

//         const userData = {
//           id: result.data.id,
//           username: result.data.username,
//           email: result.data.email,
//           role: normalizedRole,
//           accessToken: result.data.accessToken,
//           refreshToken: result.data.refreshToken,
//         };

//         // ✅ Save to localStorage
//         localStorage.setItem('accountId', result.data.id.toString());
//         localStorage.setItem('username', result.data.username);
//         localStorage.setItem('accessToken', result.data.accessToken);
//         localStorage.setItem('email', result.data.email);

//         login(userData); // ⚠️ Đợi useEffect phía dưới xử lý redirect
//       }
//     } catch (err) {
//       console.error('Login failed:', err);
//     }
//   };

//   //   useEffect(() => {
//   //   const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(user?.role ?? '');

//   //   if (isAccessRole && hasProjects && projectData?.data?.length > 0) {
//   //     const firstProject = projectData.data[0];
//   //     navigate(`/project?projectKey=${firstProject.projectKey}#list`);
//   //   } else if (user?.role === 'ADMIN') {
//   //     navigate('/admin/dashboard');
//   //   } else if (user?.role === 'CLIENT') {
//   //     navigate('/meeting');
//   //   } else if (user?.role === 'TEAM_LEADER') {
//   //     navigate(`/team-leader/project?projectKey=${firstProject.projectKey}#list`);
//   //   }
//   // }, [user, hasProjects, projectData, navigate]);

//   useEffect(() => {
//     const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(
//       user?.role ?? ''
//     );
//     const hasData = hasProjects && projectData?.data?.length > 0;
//     const firstProject = hasData ? projectData.data[0] : null;

//     if (isAccessRole && hasData && firstProject) {
//       if (user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_MEMBER') {
//         navigate(`/project?projectKey=${firstProject.projectKey}#list`);
//       }
//     } else if (user?.role === 'ADMIN') {
//       navigate('/admin/dashboard');
//     } else if (user?.role === 'CLIENT') {
//       navigate('/meeting');
//     }
//   }, [user, hasProjects, projectData, navigate]);

//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4'>
//       <form
//         onSubmit={handleSubmit}
//         className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in'
//       >
//         <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Đăng nhập</h2>

//         <input
//           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg'
//           type='text'
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder='Tên đăng nhập'
//         />

//         <input
//           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg'
//           type='password'
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder='Mật khẩu'
//         />

//         <button
//           type='submit'
//           disabled={isLoggingIn}
//           className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50'
//         >
//           {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
//         </button>

//         {loginError && (
//           <div className='text-red-500 text-sm mt-4 text-center animate-shake'>
//             Đăng nhập thất bại! Vui lòng thử lại.
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useLoginMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../services/AuthContext';
import { useGetProjectsByAccountQuery } from '../services/accountApi';
import { Eye, EyeOff } from 'lucide-react'; // npm install lucide-react

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAPI, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const { data: projectData, isSuccess: hasProjects } = useGetProjectsByAccountQuery(
    user?.accessToken || '',
    {
      skip: !user?.accessToken,
    }
  );

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

  React.useEffect(() => {
    const isAccessRole = ['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER'].includes(user?.role ?? '');
    const hasData = hasProjects && projectData?.data?.length > 0;
    const firstProject = hasData ? projectData.data[0] : null;

    if (isAccessRole && hasData && firstProject) {
      navigate(`/project?projectKey=${firstProject.projectKey}#list`);
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'CLIENT') {
      navigate('/meeting');
    }
  }, [user, hasProjects, projectData, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-4'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-xl shadow-xl w-full max-w-sm space-y-6 animate-fade-in'
      >
        <h2 className='text-3xl font-bold text-center text-gray-800'>Login</h2>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            placeholder='Enter your username'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
    placeholder="Enter your password"
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
          type='submit'
          disabled={isLoggingIn}
          className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50'
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>

        {loginError && (
          <div className='text-red-500 text-sm text-center animate-shake'>
            Login failed! Please try again.
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
