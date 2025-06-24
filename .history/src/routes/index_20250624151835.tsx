import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';

import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';

import ProtectedRoute from '../components/ProtectedRoute';
import ProjectDetailHeader from '../pages/ProjectDetail/ProjectDetailHeader/ProjectDetailHeader';

export const router = createBrowserRouter([
  // Route riêng cho trang login
  {
    path: '/login',
    element: <Login />,
  },


  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
 
    ],
  },

  // Route cho PROJECT MANAGER
  {
    path: '/pm',
    element: (
      <ProtectedRoute allowedRoles={['PROJECT MANAGER']}>
        <PMLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'meeting-room',
        element: <MeetingRoom />,
      },
     
    ],
  },

  
  {
    path: '/projects',
    element: (
      <ProtectedRoute allowedRoles={['PROJECT MANAGER', 'TEAM MEMBER', 'TEAM LEADER', 'CLIENT']}>
        <ProjectDetailHeader />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'list',
        element: <MeetingRoom />, // Có thể đổi sau nếu bạn muốn hiển thị tab khác
      },
    ],
  },



]);
