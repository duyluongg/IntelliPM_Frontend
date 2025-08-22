import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useGetAllQuery } from '../../../services/systemConfigurationApi';
import SystemConfigList from './SystemConfigList';

const SystemConfigPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllQuery();
  const [searchKey, setSearchKey] = useState<string>('');
  const navigate = useNavigate();

  // Filter configurations based on searchKey
  const filteredConfigs = useMemo(() => {
    if (!data?.data) return [];
    const configs = Array.isArray(data.data) ? data.data : [data.data];
    return searchKey
      ? configs.filter((config) =>
          config.configKey.toLowerCase().includes(searchKey.toLowerCase())
        )
      : configs;
  }, [data, searchKey]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-white min-h-screen"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">System Configurations</h1>
        <button
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/admin/configurations/create')}
        >
          <Plus className="w-4 h-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Config Key..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <SystemConfigList
        configurations={filteredConfigs}
        isLoading={isLoading}
        error={error}
      />
    </motion.div>
  );
};

export default SystemConfigPage;