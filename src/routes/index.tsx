import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';
import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
import Gantt from '../pages/PM/Gantt/Gantt';
import ProtectedRoute from '../components/ProtectedRoute';
import Form from '../pages/PM/YourProject/Form';
import FeatureRequestFormWrapper from '../pages/PM/YourProject/FeatureRequestFormWrapper';
// import DocBlank from '../pages/PM/YourProject/DocBlank';
// import FeatureRequestForm from '../pages/PM/YourProject/FeatureRequestForm';
import ProjectDetail from '../pages/ProjectDetail/ProjectDetail';
import WorkItemDetail from '../pages/WorkItem/WorkItemDetail';
import ChildWorkItem from '../pages/WorkItem/ChildWorkItem';
import MeetingCore from '../pages/PM/Meeting/MeetingCorePage/MeetingCore';
import CreateMeetingPage from '../pages/PM/Meeting/CreateMeetingPage/CreateMeetingPage';
import MeetingManagementPage from '../pages/PM/Meeting/MeetingManagementPage/MeetingManagementPage';
import ProjectDashboard from '../pages/PM/Dashboard/ProjectDashboard';
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
          onChildItemClick={(item) => console.log('Clicked child item', item)} // 👈 truyền vào hàm
          onChildPopupClose={() => console.log('Closed popup')}                // 👈 truyền vào hàm
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
      // {
      //   path: '/projects/form',
      //   element: <Homepage />,
      // },
       { path: 'projects/form', element: <Form /> },

       { path: 'projects/form/:formId', element: <Form /> },
       { path: 'projects/form/:formId/:id', element: <FeatureRequestFormWrapper /> },

       
     


      {
        path: 'gantt-chart',
        element: <Gantt />,
      },
      {
        path: 'project-dashboard',
        element: <ProjectDashboard />,
      },
      // {
      //   path: 'work-item',
      //   element: <WorkItemPage />,
      // },
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
      {
        path: 'meeting-management',
        element: <MeetingManagementPage />,
      },
    ],
  },

  {
    path: '/pm',
    element: (
      <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
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
