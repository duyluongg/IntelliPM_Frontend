import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';
import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
import Gantt from '../pages/PM/Gantt/Gantt';
import ProtectedRoute from '../components/ProtectedRoute';
import ProjectDetail from '../pages/ProjectDetail/ProjectDetail';
import WorkItemDetail from '../pages/WorkItem/WorkItemDetail';
import ChildWorkItem from '../pages/WorkItem/ChildWorkItem';
import MeetingCore from '../pages/PM/Meeting/MeetingCorePage/MeetingCore';
import CreateMeetingPage from '../pages/PM/Meeting/CreateMeetingPage/CreateMeetingPage';

export const router = createBrowserRouter([
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
      {
        path: 'gantt-chart',
        element: <Gantt />,
      },
      {
        path: 'work-item-detail',
        element: <WorkItemDetail />,
      },
      {
        path: 'child-work/:key', 
        element: <ChildWorkItem />,
      },
        {
        path: '/projects', 
        element: <ProjectDetail />,
      },
      {
        path: 'meeting',
        element: <MeetingCore />, // ✅ mới
      },
      {
        path: 'meeting-room',
        element: <MeetingRoom />,
      },
      {
        path: 'create-meeting-room',
        element: <CreateMeetingPage />,
      },
    ],
  },

  {
    path: '/pm',
    element: (
      <ProtectedRoute allowedRoles={['PROJECT MANAGER']}>
        <PMLayout />
      </ProtectedRoute>
    ),
    children: [
      // {
      //   path: 'meeting',
      //   element: <MeetingCore />, // ✅ mới
      // },
      // {
      //   path: 'meeting-room',
      //   element: <MeetingRoom />,
      // },
    ],
  },


  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },

  
  


]);
