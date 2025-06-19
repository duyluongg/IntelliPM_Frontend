import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';

import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';

import ProtectedRoute from '../components/ProtectedRoute';
import Form from '../pages/PM/YourProject/Form';
import FeatureRequestFormWrapper from '../pages/PM/YourProject/FeatureRequestFormWrapper';
// import FeatureRequestForm from '../pages/PM/YourProject/FeatureRequestForm';

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
      // {
      //   path: '/projects/form',
      //   element: <Homepage />,
      // },
       { path: 'projects/form', element: <Form /> },

       { path: 'projects/form/:formId', element: <Form /> },
       { path: 'projects/form/:formId/:id', element: <FeatureRequestFormWrapper /> },

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
]);
