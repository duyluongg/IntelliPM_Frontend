import { useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import Form from '../../PM/YourProject/Form';
import ProjectTaskList from '../ProjectTaskList/ProjectTaskList';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';
import Gantt from '../../PM/Gantt/Gantt';
import ProjectDashboard from '../../PM/Dashboard/ProjectDashboard';
import Risk from '../../PM/Risk/Risk';

const ProjectDetailPage = () => {
  const location = useLocation();
  const activeTab = useMemo(() => {
    return location.hash.replace('#', '') || 'list';
  }, [location.hash]);

  useEffect(() => {
    const hash = location.hash;
    console.log('📌 Current hash:', hash);
  }, [location.hash]);

  return (
    <div>
      <ProjectDetailHeader />
      <div className='p-4'>
        {activeTab === 'forms' && <Form />}
        {activeTab === 'list' && <ProjectTaskList />}
        {activeTab === 'gantt-chart' && <Gantt />}
        {activeTab === 'dashboard' && <ProjectDashboard />}
        {activeTab === 'risk' && <Risk />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
