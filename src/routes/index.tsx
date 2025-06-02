import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import Homepage from '../pages/Homepage';
// import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
    ],
  },
]);
