import React from 'react';
import { Outlet } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div className="homepage-container">
     
      <Outlet /> 
    </div>
  );
};

export default Homepage;
