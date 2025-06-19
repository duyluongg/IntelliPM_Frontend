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
        <main className='ml-56 mt-16 p-4 overflow-auto bg-slate-100 min-h-screen'>
          <Outlet />
        </main>
      </main>
    </>
  );
};

export default RootLayout;
