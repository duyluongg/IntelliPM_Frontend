import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  useGetProjectsByAccountQuery,
  type Project,
} from '../../../services/accountApi';
import Form from '../../PM/YourProject/Form';
import ProjectTaskList from '../ProjectTaskList/ProjectTaskList';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';
import Gantt from '../../PM/Gantt/Gantt';
import ProjectDashboard from '../../PM/Dashboard/ProjectDashboard';
import Risk from '../../PM/Risk/Risk';
import Backlog from '../BacklogPage/BacklogPage';
import KanbanBoardPage from '../KanbanBoardPage/KanbanBoardPage';
import MilestonePage from '../MilestonePage/MilestonePage';
import TaskSubtaskSheet from '../../PM/ProjectSheet/TaskSubtaskSheet';
import DocumentReport from '../../PM/YourProject/DocumentReport';

const ProjectDetailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');

  const activeTab = useMemo(
    () => location.hash.replace('#', '') || 'list',
    [location.hash]
  );

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLeaderOrManager =
    user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER';

  // Get accessToken from localStorage
  const accessToken = localStorage.getItem('accessToken') || '';

  // Fetch projects for the account
  const { data: projectsResponse, isLoading, error } =
    useGetProjectsByAccountQuery(accessToken, {
      skip: !accessToken,
    });

  // State
  const [accessError, setAccessError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    if (isLoading || !projectsResponse) return;

    if (!projectKey) {
      setAccessError('Project key not found.');
      return;
    }

    const project = projectsResponse.data.find(
      (p: Project) => p.projectKey === projectKey
    );

    if (!project) {
      setAccessError('You do not have permission to access this project.');
      return;
    }

    if (project.projectStatus === 'PLANNING' && !isLeaderOrManager) {
      setAccessError(
        'Only Team Leaders or Project Managers can access projects in PLANNING status.'
      );
      return;
    }

    setCurrentProject(project);
    setAccessError(null);
  }, [projectsResponse, projectKey, isLeaderOrManager, isLoading]);

  // Loading state
  if (isLoading) return <div>Loading...</div>;

  // API error
  if (error) {
    let errorMessage = 'Please try again.';
    if ('message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else if ('status' in error && typeof error.status === 'number') {
      errorMessage = `Error status: ${error.status}`;
    }
    return <div>Error loading data: {errorMessage}</div>;
  }

  // Access error
  if (accessError) {
    return <div className="text-red-500 p-4">{accessError}</div>;
  }

  // Nếu user trong project đang ở trạng thái INVITED
 if (currentProject?.status === 'INVITED') {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11zm0 0v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Invitation Pending
        </h2>
        <p className="text-gray-600 mb-6">
          You have been invited to join this project but haven't accepted yet.
        </p>
        <Link
          to="/project/list"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition"
        >
          Go to Project List
        </Link>
      </div>
    </div>
  );
}


  return (
    <div>
      <ProjectDetailHeader />
      <div className="p-4">
        {activeTab === 'list' && <ProjectTaskList />}
        {activeTab === 'backlog' && <Backlog />}
        {activeTab === 'board' && <KanbanBoardPage />}
        {activeTab === 'timeline' && <MilestonePage />}
        {activeTab === 'documents' && <Form />}
        {activeTab === 'gantt-chart' && <Gantt />}
        {activeTab === 'dashboard' && <ProjectDashboard />}
        {activeTab === 'risk' && <Risk />}
        {activeTab === 'sheet' && <TaskSubtaskSheet />}
        {activeTab === 'document-report' && <DocumentReport />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
