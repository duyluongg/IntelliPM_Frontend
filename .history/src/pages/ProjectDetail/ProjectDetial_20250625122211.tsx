import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProjectDetailHeader from '../ProjectDetailHeader/ProjectDetailHeader';
// import ListPage from './ListPage'; // Tạo file này sau
// import BacklogPage from './BacklogPage'; // Tạo file này sau
// import BoardPage from './BoardPage'; // Tạo file này sau
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  return (
    <div className="project-detail-container">
      <ProjectDetailHeader />
      <div className="content-area">
        <Routes>
          <Route path="/projects/SAS/list" element={<ListPage />} />
          <Route path="/projects/SAS/backlog" element={<BacklogPage />} />
          <Route path="/projects/SAS/board" element={<BoardPage />} />
          {/* Thêm các route khác nếu cần */}
          <Route path="/projects/SAS/*" element={<ListPage />} /> Default page
        </Routes>
      </div>
    </div>
  );
};

export default ProjectDetail;