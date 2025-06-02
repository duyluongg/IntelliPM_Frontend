// src/components/Layout/RootLayout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';

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
      <main className='bg-slate-100 min-h-screen'>
        <Outlet />
        {/* Đây là nơi các component trang (như HomePage) sẽ được hiển thị */}
      </main>
      {/* FOOTER */}
    </>
  );
};

export default RootLayout;
