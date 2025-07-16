import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import Form from '../../PM/YourProject/Form';
import ProjectTaskList from '../ProjectTaskList/ProjectTaskList';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';
import Gantt from '../../PM/Gantt/Gantt';
import ProjectDashboard from '../../PM/Dashboard/ProjectDashboard';
import Risk from '../../PM/Risk/Risk';
import Doc from '../../PM/YourProject/Doc';
import Backlog from '../BacklogPage/BacklogPage';

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
        {activeTab === 'forms' && <Form />}
        {activeTab === 'list' && <ProjectTaskList />}
        {activeTab === 'gantt-chart' && <Gantt />}
        {activeTab === 'dashboard' && <ProjectDashboard />}
        {activeTab === 'risk' && <Risk />}
        {activeTab === 'tests' && <Doc/>}
        {activeTab === 'risk' && <Risk />}
        {activeTab === 'tests' && <Doc />}
        {activeTab === 'backlog' && <Backlog />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
