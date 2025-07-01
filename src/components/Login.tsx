// // import React, { useState } from 'react';
// // import { useLoginMutation } from '../services/authApi';
// // import { useNavigate } from 'react-router-dom';
// // import { useAuth, type Role } from '../services/AuthContext';
// // import { useGetProjectsByAccountQuery } from '../services/accountApi';

// // const Login: React.FC = () => {
// //   const [username, setUsername] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [loginAPI, {  isLoading, error }] = useLoginMutation();
// //   const navigate = useNavigate();
// //   const { login } = useAuth();
// //   const {user} = useAuth();
// //   const { data, isLoading, error } = useGetProjectsByAccountQuery(user?.accessToken || '');

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       const result = await loginAPI({ username, password }).unwrap();
// //       if (result.isSuccess) {
// //         const userData = {
// //           id: result.data.id,
// //           username: result.data.username,
// //           email: result.data.email,
// //           role: result.data.role as Role,
// //           accessToken: result.data.accessToken,
// //           refreshToken: result.data.refreshToken,
// //         };

// //         login(userData);

// //         switch (userData.role) {
// //           case 'PROJECT_MANAGER':
// //             navigate('/pm');
// //             break;
// //           case 'ADMIN':
// //             navigate('/admin/dashboard');
// //             break;
// //           // case 'CUSTOMER':
// //           //   navigate('/user/home');
// //           //   break;
// //           default:
// //             navigate('/');
// //         }
// //       }
// //     } catch (err) {
// //       console.error('Login failed:', err);
// //     }
// //   };

// //   return (
// //     <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4'>
// //       <form
// //         onSubmit={handleSubmit}
// //         className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in'
// //       >
// //         <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Đăng nhập</h2>

// //         <input
// //           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
// //           type='text'
// //           value={username}
// //           onChange={(e) => setUsername(e.target.value)}
// //           placeholder='Tên đăng nhập'
// //         />

// //         <input
// //           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
// //           type='password'
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //           placeholder='Mật khẩu'
// //         />

// //         <button
// //           type='submit'
// //           disabled={isLoading}
// //           className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50'
// //         >
// //           {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
// //         </button>

// //         {error && (
// //           <div className='text-red-500 text-sm mt-4 text-center animate-shake'>
// //             Đăng nhập thất bại! Vui lòng thử lại.
// //           </div>
// //         )}
// //       </form>
// //     </div>
// //   );
// // };

// // export default Login;
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
//   const hash = location.hash;
//   console.log(hash);

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

//         login(userData);
//         // Không gọi navigate tại đây vì cần chờ getProjectsByAccountQuery sau khi login
//       }
//     } catch (err) {
//       console.error('Login failed:', err);
//     }
//   };

//   useEffect(() => {
//     if (user?.role === 'PROJECT_MANAGER' && hasProjects && projectData?.data?.length > 0) {
//       const firstProject = projectData.data[0];
//       navigate({
//         pathname: '/pm/project',
//         search: `?projectKey=${firstProject.projectKey}`,
//         hash: '#list',
//       });
//     } else if (user?.role === 'ADMIN') {
//       navigate('/admin/dashboard');
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
//           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
//           type='text'
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder='Tên đăng nhập'
//         />

//         <input
//           className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
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
import React, { useState, useEffect } from 'react';
import { useLoginMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../services/AuthContext';
import { useGetProjectsByAccountQuery } from '../services/accountApi';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginAPI, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // ⚠️ Gọi API project chỉ sau khi có user (sau khi login thành công)
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

        login(userData); // ⚠️ Đợi useEffect phía dưới xử lý redirect
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'PROJECT_MANAGER' && hasProjects && projectData?.data?.length > 0) {
      const firstProject = projectData.data[0];
      navigate(`/pm/project?projectKey=${firstProject.projectKey}#list`);
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [user, hasProjects, projectData, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in'
      >
        <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>Đăng nhập</h2>

        <input
          className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg'
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='Tên đăng nhập'
        />

        <input
          className='w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Mật khẩu'
        />

        <button
          type='submit'
          disabled={isLoggingIn}
          className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50'
        >
          {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {loginError && (
          <div className='text-red-500 text-sm mt-4 text-center animate-shake'>
            Đăng nhập thất bại! Vui lòng thử lại.
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
