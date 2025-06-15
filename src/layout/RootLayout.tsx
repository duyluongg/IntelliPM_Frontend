// src/components/Layout/RootLayout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const RootLayout: React.FC = () => {
  
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className='flex bg-slate-100 min-h-screen'>
        <Sidebar />
        <div className='flex-1 p-4 overflow-auto mt-10'>
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default RootLayout;
