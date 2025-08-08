import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import PMLayout from '../layout/PMLayout';
import AdminLayout from '../layout/AdminLayout';
import Homepage from '../pages/Homepage';

import MeetingRoom from '../pages/PM/MeetingRoom/MeetingRoom';
// import Gantt from '../pages/PM/Gantt/Gantt';
import ProtectedRoute from '../components/ProtectedRoute';
import Form from '../pages/PM/YourProject/Form';
// import FeatureRequestFormWrapper from '../pages/PM/YourProject/FeatureRequestFormWrapper';
// import DocBlank from '../pages/PM/YourProject/DocBlank';
// import FeatureRequestForm from '../pages/PM/YourProject/FeatureRequestForm';
// import ProjectDetail from '../pages/ProjectDetail/ProjectDetail';
import WorkItemDetail from '../pages/WorkItem/WorkItemDetail';
import EpicDetail from '../pages/WorkItem/EpicDetail';
import ChildWorkItem from '../pages/WorkItem/ChildWorkItem';
import MeetingCore from '../pages/PM/Meeting/MeetingCorePage/MeetingCore';
import CreateMeetingPage from '../pages/PM/Meeting/CreateMeetingPage/CreateMeetingPage';
import MeetingManagementPage from '../pages/PM/Meeting/MeetingManagementPage/MeetingManagementPage';
// import ProjectDashboard from '../pages/PM/Dashboard/ProjectDashboard';
import ProjectIntroduction from '../pages/ProjectCreation/ProjectIntroduction/ProjectIntroduction';
import ProjectTaskList from '../pages/ProjectDetail/ProjectTaskList/ProjectTaskList';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage/ProjectDetailPage';
import MeetingFeedbackPage from '../pages/PM/Meeting/MeetingFeedback/MeetingFeedbackPage';
import ProjectCreation from '../pages/ProjectCreation/ProjectCreation';
import TaskSetup from '../pages/ProjectCreation/TaskSetup/TaskSetup';
// import DocBlank from '../pages/PM/YourProject/DocBlank';
import ProjectOverviewPM from '../pages/ProjectCreation/ProjectOverview/ProjectOverviewPM';
import ProjectSummary from '../pages/ProjectDetail/ProjectSummary/ProjectSummary';
// import Doc from '../pages/PM/YourProject/Doc';
import DocWrapper from '../pages/PM/YourProject/DocWrapper';
import AllRequestForm from '../pages/TeamLeader/AllRequestForm';
import MeetingRescheduleRequest from '../pages/PM/MeetingRoom/MeetingRescheduleRequest';
import MeetingRescheduleRequestSend from '../pages/PM/Meeting/MeetingRescheduleRequestSend/MeetingRescheduleRequestSend';
import Gantt from '../pages/PM/Gantt/Gantt';
import RecentForm from '../pages/PM/YourProject/RecentForm';
import LayoutSwitch from '../layout/LayoutSwitch';
// import BacklogPage from '../pages/ProjectDetail/BacklogPage/BacklogPage';
import InviteAccept from '../pages/ProjectCreation/InviteAccept/InviteAccept';
import ProjectList from '../pages/ProjectDetail/ProjectList/ProjectList';
import Risk from '../pages/PM/Risk/Risk';
import RiskDetailPage from '../pages/PM/Risk/RiskDetailPage';
import MeetingRequestRejectPage from '../pages/PM/Meeting/MeetingRequestReject/MeetingRequestRejectPage';
import CreateDocumentRequestMeeting from '../pages/PM/Meeting/MeetingRequestReject/CreateDocumentRequestMeeting';
import AdminHomePage from '../pages/Admin/AdminHomePage';
import MembersPage from '../pages/Admin/MembersPage/MembersPage';
import CustomerHome from '../pages/Guest/CustomerHome';
import FeatureGuidePage from '../pages/Guest/FeatureGuidePage/FeatureGuidePage';
import Login from '../components/Login';
import GuestIntroPage from '../pages/Guest/IntroPage';
import ProjectMember from '../pages/ProjectDetail/ProjectMember/ProjectMember';
import Report from '../pages/Admin/ReportPage/Report';
import Analytics from '../pages/Admin/AnalyticsPage/Analytics';
import Document from '../pages/PM/YourProject/Document';
import ProjectListTable from '../pages/ProjectDetail/ProjectList/ProjectListTable';
import UpdateProjectPage from '../pages/ProjectDetail/UpdateProject/UpdateProjectPage';


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/Guest',
    element: <CustomerHome />,
  },
  {
    path: '/feature',
    element: <FeatureGuidePage />,
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
        path: 'meeting',
        element: <MeetingCore />,
      },

      {
        path: 'meeting-reschedule-request-send',
        element: <MeetingRescheduleRequestSend />,
      },

      {
        path: 'meeting-reschedule-request',
        element: <MeetingRescheduleRequest />,
      },

      {
        path: 'meeting-room',
        element: <MeetingRoom />,
      },

      {
        path: 'meeting-feedback',
        element: <MeetingFeedbackPage />,
      },
      {
        path: 'intro',
        element: <GuestIntroPage />,
      },
    ],
  },

  {
    // path: '/project/projects/form/:type/:id',
    path: '/project/projects/form/document/:documentId',
    element: (
      <ProtectedRoute allowedRoles={['CLIENT', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'TEAM_LEADER']}>
        <LayoutSwitch />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Document />,
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
        path: 'meeting-management/view-reject',
        element: <MeetingRequestRejectPage />,
      },

      {
        path: 'meeting-management/send-request',
        element: <CreateDocumentRequestMeeting />,
      },

      {
        path: `/project?:projectKey`,
        element: <ProjectTaskList />,
      },
      {
        path: `/project?:projectKey/backlog`,
        element: <ProjectTaskList />,
      },
      {
        path: `/project?:projectKey`,
        element: <ProjectTaskList />,
      },
      {
        path: '/project/:projectKey/risk',
        element: <Risk />,
      },
      {
        path: '/project/:projectKey/risk/:riskKey',
        element: <RiskDetailPage />,
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
        path: `list`,
        element: <ProjectList />,
      },
      {
        path: `manage`,
        element: <ProjectListTable />,
      },
      {
        path: `:projectKey/details`,
        element: <UpdateProjectPage />,
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
        path: 'invitation',
        element: <InviteAccept />,
      },
      {
        path: `:projectKey/summary`,
        element: <ProjectSummary />,
      },
      {
        path: `:projectKey/team-members`,
        element: <ProjectMember />,
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
        path: ':projectKey/work-item-detail',
        element: <WorkItemDetail />,
      },
      {
        path: ':projectKey/child-work/:key',
        element: <ChildWorkItem />,
      },
      {
        path: 'child-work',
        element: <ChildWorkItem />,
      },
      {
        path: 'epic',
        element: <EpicDetail />,
      },
      {
        path: 'epic/:epicId',
        element: <EpicDetail />,
      },
      {
        path: 'projects/form/:formId',
        element: <Form />,
      },

      // {
      //   path: 'projects/form/:type/:id',
      //   element: <DocWrapper />,
      // },
      {
        path: 'projects/form/recent_form',
        element: <RecentForm />,
      },
    ],
  },

  {
    path: '/gantt-view/:projectKey',
    element: <Gantt />,
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminHomePage />,
      },
      {
        path: 'members',
        element: <MembersPage />,
      },
      {
        path: 'reports',
        element: <Report />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
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

      { path: 'all-request-form', element: <AllRequestForm /> },
    ],
  },
]);
