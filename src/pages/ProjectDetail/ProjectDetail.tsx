import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProjectDetailHeader from './ProjectDetailHeader/ProjectDetailHeader';
import ListPage from './ProjectTaskList/ProjectTaskList';

import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  return (
    <div className="project-detail-container">
      <ProjectDetailHeader />
      <div className="content-area">
        <Routes>
          <Route path="list" element={<ListPage />} />
    
          <Route path="*" element={<ListPage />} /> {/* default tab */}
        </Routes>
      </div>
    </div>
  );
};

export default ProjectDetail;
