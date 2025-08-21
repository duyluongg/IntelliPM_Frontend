import { useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import Form from '../../PM/YourProject/Form';
import ProjectTaskList from '../ProjectTaskList/ProjectTaskList';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';
import Gantt from '../../PM/Gantt/Gantt';
import ProjectDashboard from '../../PM/Dashboard/ProjectDashboard';
import Risk from '../../PM/Risk/Risk';
// import Doc from '../../PM/YourProject/Doc';
import Backlog from '../BacklogPage/BacklogPage';
import KanbanBoardPage from '../KanbanBoardPage/KanbanBoardPage';
import MilestonePage from '../MilestonePage/MilestonePage';
import TaskSubtaskSheet from '../../PM/ProjectSheet/TaskSubtaskSheet';

const ProjectDetailPage = () => {
  const location = useLocation();
  const activeTab = useMemo(() => {
    return location.hash.replace('#', '') || 'list';
  }, [location.hash]);

  useEffect(() => {
    const hash = location.hash;
    console.log('📌 Current hash:', hash);
  }, [location.hash]);

  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');
  console.log(projectKey, 'projectKey');

  return (
    <div>
      <ProjectDetailHeader />
      <div className='p-4'>
        {activeTab === 'list' && <ProjectTaskList />}
        {activeTab === 'backlog' && <Backlog />}
        {activeTab === 'board' && <KanbanBoardPage />}
        {activeTab === 'timeline' && <MilestonePage />}
        {activeTab === 'documents' && <Form />}
        {activeTab === 'gantt-chart' && <Gantt />}
        {activeTab === 'dashboard' && <ProjectDashboard />}
        {activeTab === 'risk' && <Risk />}
        {activeTab === 'sheet' && <TaskSubtaskSheet />}
        {/* {activeTab === 'tests' && <Doc/>} */}

        {/* Add more tabs as needed */}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
