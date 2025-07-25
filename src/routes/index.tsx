import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';
import Homepage from '../pages/Homepage';
import Login from '../components/Login';
import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
import Gantt from '../pages/PM/Gantt/Gantt';
import ProtectedRoute from '../components/ProtectedRoute';
import Form from '../pages/PM/YourProject/Form';
// import FeatureRequestFormWrapper from '../pages/PM/YourProject/FeatureRequestFormWrapper';
// import DocBlank from '../pages/PM/YourProject/DocBlank';
// import FeatureRequestForm from '../pages/PM/YourProject/FeatureRequestForm';
import ProjectDetail from '../pages/ProjectDetail/ProjectDetail';
import WorkItemDetail from '../pages/WorkItem/WorkItemDetail';
import EpicDetail from '../pages/WorkItem/EpicDetail';
import ChildWorkItem from '../pages/WorkItem/ChildWorkItem';
import MeetingCore from '../pages/PM/Meeting/MeetingCorePage/MeetingCore';
import CreateMeetingPage from '../pages/PM/Meeting/CreateMeetingPage/CreateMeetingPage';
import MeetingManagementPage from '../pages/PM/Meeting/MeetingManagementPage/MeetingManagementPage';
import ProjectDashboard from '../pages/PM/Dashboard/ProjectDashboard';
import ProjectIntroduction from '../pages/ProjectCreation/ProjectIntroduction/ProjectIntroduction';
import ProjectTaskList from '../pages/ProjectDetail/ProjectTaskList/ProjectTaskList';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage/ProjectDetailPage';
import MeetingFeedbackPage from '../pages/PM/Meeting/MeetingFeedback/MeetingFeedbackPage';
import ProjectCreation from '../pages/ProjectCreation/ProjectCreation';
import TaskSetup from '../pages/ProjectCreation/TaskSetup/TaskSetup';
import DocBlank from '../pages/PM/YourProject/DocBlank';
import ProjectOverviewPM from '../pages/ProjectCreation/ProjectOverview/ProjectOverviewPM';
import Doc from '../pages/PM/YourProject/Doc';
import DocWrapper from '../pages/PM/YourProject/DocWrapper';

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
      // { path: 'projects/form', element: <Form /> },

      // { path: 'projects/form/:formId', element: <Form /> },
      // { path: 'projects/form/:formId/:id', element: <FeatureRequestFormWrapper /> },

      // {
      //   path: 'gantt-chart',
      //   element: <Gantt />,
      // },
      // {
      //   path: 'project-dashboard',
      //   element: <ProjectDashboard />,
      // },
      // {
      //   path: 'projects',
      //   element: <ProjectDetail />,
      // },
      // {
      //   path: 'create-project/project-introduction',
      //   element: <ProjectIntroduction />,
      // },
      // {
      //   path: 'create-project/project-details-form',
      //   element: <ProjectDetailsForm />,
      // },
      // {
      //   path: 'create-project/invitees-form',
      //   element: <InviteesForm />,
      // },
      {
        path: 'meeting',
        element: <MeetingCore />,
      },

      {
        path: 'meeting-room',
        element: <MeetingRoom />,
      },

      {
        path: 'meeting-feedback',
        element: <MeetingFeedbackPage />,
      },
    ],
  },

  //  PM, Team Leader, Team Member đều có thể truy cập vào
  {
    path: '/project',
    element: (
      <ProtectedRoute allowedRoles={['PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER']}>
        <PMLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProjectDetailPage />,
      },

      {
        path: `/project?:projectKey`,
        element: <ProjectTaskList />,
      },
      {
        path: `introduction`,
        element: <ProjectIntroduction />,
      },
      {
        path: `createform`,
        element: <ProjectCreation />,
      },

      {
        path: `:projectKey/task-setup`,
        element: <TaskSetup />,
      },
      {
        path: `:projectKey/overviewpm`,
        element: <ProjectOverviewPM />,
      },
      {
        path: 'create-meeting-room',
        element: <CreateMeetingPage />,
      },
      {
        path: 'meeting-management',
        element: <MeetingManagementPage />,
      },

      {
        path: `introduction`,
        element: <ProjectIntroduction />,
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
        path: 'epic/:epicId',
        element: <EpicDetail />,
      },
      {
        path: 'projects/form/:formId',
        element: <Form />,
      },

      {
        path: 'projects/form/:type/:id',
        element: <DocWrapper />,
      },
    ],
  },

  {
    path: '/team-member',
    element: (
      <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
        <PMLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProjectDetailPage />,
      },
    ],
  },

  {
    path: '/team-leader',
    element: (
      <ProtectedRoute allowedRoles={['TEAM_LEADER']}>
        <PMLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProjectDetailPage />,
      },
    ],
  },
]);
