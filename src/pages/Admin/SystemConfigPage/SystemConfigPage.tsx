import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown } from 'lucide-react';
import { useGetAllQuery, useCreateMutation, useUpdateMutation } from '../../../services/systemConfigurationApi';
import SystemConfigList from './SystemConfigList';
import CreateConfigModal from './CreateConfigModal';
import DetailUpdateModal from './DetailUpdateModal';
import { type SystemConfiguration, type SystemConfigurationRequest } from '../../../services/systemConfigurationApi';

const SystemConfigPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllQuery();
  const [searchKey, setSearchKey] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfiguration | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Get all config keys for dropdown, including "All" option
  const configKeys = useMemo(() => {
    if (!data?.data) return ['All'];
    const configs = Array.isArray(data.data) ? data.data : [data.data];
    return ['All', ...configs.map((config) => config.configKey).sort()];
  }, [data]);

  // Handle config key selection from dropdown
  const handleConfigKeySelect = (key: string) => {
    setSearchKey(key === 'All' ? '' : key);
    setIsDropdownOpen(false);
  };

  // Handle opening detail modal
  const handleOpenDetail = (config: SystemConfiguration) => {
    setSelectedConfig(config);
    setIsDetailModalOpen(true);
  };

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
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Configuration</span>
        </button>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search by Config Key..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-300 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{searchKey || 'All'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {configKeys.map((key) => (
                <div
                  key={key}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleConfigKeySelect(key)}
                >
                  {key}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SystemConfigList
        configurations={filteredConfigs}
        isLoading={isLoading}
        error={error}
        onOpenDetail={handleOpenDetail}
      />

      <CreateConfigModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <DetailUpdateModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        config={selectedConfig}
      />
    </motion.div>
  );
};

export default SystemConfigPage;