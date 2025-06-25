import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';
import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
import WorkItem from '../pages/WorkItem';
import ProtectedRoute from '../components/ProtectedRoute';
import ProjectDetailHeader from '../pages/ProjectDetail/ProjectDetailHeader/ProjectDetailHeader';
import WorkItemDetail from '../pages/WorkItemDetail';
import ChildWorkItem from '../pages/ChildWorkItem';
import React from 'react';

// Optional: Trang demo mở popup WorkItem
const WorkItemPage: React.FC = () => {
  const [isWorkItemOpen, setIsWorkItemOpen] = React.useState(false);

  // Dữ liệu mẫu cho child work items
  const childWorkItems = [
    { key: 'SAS-15', summary: 'hello', status: 'To Do' },
  ];

  return (
    <div>
      <h1>Work Item Management</h1>
      <button onClick={() => setIsWorkItemOpen(true)}>Open Work Item</button>
      {isWorkItemOpen && (
        <WorkItem
          isOpen={isWorkItemOpen}
          onClose={() => setIsWorkItemOpen(false)}
          childWorkItems={childWorkItems}
          onChildItemClick={(item) => console.log('Clicked child item', item)}
          onChildPopupClose={() => console.log('Closed popup')}
        />
      )}
    </div>
  );
};

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
        path: 'work-item',
        element: <WorkItemPage />,
      },
      {
        path: 'work-item-detail',
        element: <WorkItemDetail />,
      },
      {
        path: 'child-work/:key',
        element: <ChildWorkItem />,
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
        element: <MeetingRoom />, // Replace with a proper ProjectsList component if needed
      },
      {
        path: ':projectId', // Dynamic route for individual project details
        element: <ProjectDetailHeader />, // Or a ProjectDetail component
      },
    ],
  },

  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },
]);