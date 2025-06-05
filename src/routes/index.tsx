import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import Homepage from '../pages/Homepage';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
import PMLayout from '../layout/PMLayout';
import Login from '../components/Login';


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />, // Route riêng cho login
  },
  {
    path: '/',
    element: <RootLayout />,
    // errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: 'pm',
        element: <PMLayout />,
        children: [
          { path: 'meeting-room', element: <MeetingRoom /> },

        ],
      },
    ],
  },
]);
