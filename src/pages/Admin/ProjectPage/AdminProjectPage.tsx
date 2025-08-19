
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGetAllProjectsQuery, type ProjectDetails } from '../../../services/projectApi';
import StatusFilter from './StatusFilter';
import AdminProjectList from './AdminProjectList';

const AdminProjectsPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllProjectsQuery();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!data?.data) return [];
    return selectedStatus
      ? data.data.filter((project) => project.status.toUpperCase() === selectedStatus.toUpperCase())
      : data.data;
  }, [data, selectedStatus]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-white min-h-screen"
    >
      <StatusFilter selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />
      <AdminProjectList projects={filteredProjects} isLoading={isLoading} error={error} />
    </motion.div>
  );
};

export default AdminProjectsPage;
