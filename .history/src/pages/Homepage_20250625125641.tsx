import React from 'react';
import { Outlet } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div className="homepage-container">
      {/* Nếu có header hay sidebar riêng thì giữ ở đây */}
      <Outlet /> {/* ProjectDetail sẽ render tại đây, và chiếm toàn bộ chiều ngang */}
    </div>
  );
};

export default Homepage;
