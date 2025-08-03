import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../../components/Admin/Header';
import AdminSidebar from '../../components/Admin/Sidebar';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <AdminHeader onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex h-screen debug-layout"> {/* Added debug-layout class */}
        <motion.div
          initial={{ width: isSidebarCollapsed ? 64 : 176 }}
          animate={{ width: isSidebarCollapsed ? 64 : 176 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden md:block bg-white border-r shadow-lg"
        >
          <AdminSidebar isCollapsed={isSidebarCollapsed} />
        </motion.div>
        <main className="flex-1 mt-16 p-6 bg-gray-100 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;