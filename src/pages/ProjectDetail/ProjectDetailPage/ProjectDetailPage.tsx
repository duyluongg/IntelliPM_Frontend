import { useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import Form from '../../PM/YourProject/Form';
import ProjectTaskList from '../ProjectTaskList/ProjectTaskList';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';

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
    <div className='ml-56'>
      <ProjectDetailHeader />
      <div className='p-4'>
        {activeTab === 'forms' && <Form />}
        {activeTab === 'list' && <ProjectTaskList />}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
