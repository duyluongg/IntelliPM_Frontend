import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type SystemConfiguration } from '../../../services/systemConfigurationApi';
import { useDeleteMutation } from '../../../services/systemConfigurationApi';

interface SystemConfigListProps {
  configurations: SystemConfiguration[];
  isLoading: boolean;
  error: any;
  onOpenDetail?: (config: SystemConfiguration) => void;
}

const SystemConfigList: React.FC<SystemConfigListProps> = ({ configurations, isLoading, error, onOpenDetail }) => {
  const navigate = useNavigate();
  const [deleteConfig] = useDeleteMutation();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Handle delete configuration
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteConfig(id).unwrap();
        alert('Configuration deleted successfully');
      } catch (err) {
        alert('Failed to delete configuration');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading configurations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load configurations.</div>;
  }

  if (!configurations.length) {
    return <div className="text-center text-gray-500">No configurations found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="overflow-x-auto mt-6"
    >
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Config Key</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Value</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Min Value</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Max Value</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estimate Value</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Note</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Effected From</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Effected To</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {configurations.map((config, index) => (
              <motion.tr
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeInOut' }}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => onOpenDetail?.(config)}
                  >
                    {config.configKey}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.valueConfig}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.minValue || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.maxValue || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.estimateValue || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={config.description}>
                  {config.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.note || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(config.effectedFrom)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{config.effectedTo ? formatDate(config.effectedTo) : '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/admin/configurations/${config.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default SystemConfigList;