import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        setCurrentPage(1); // Reset to first page after deletion
      } catch (err) {
        alert('Failed to delete configuration');
      }
    }
  };

  const totalPages = Math.ceil(configurations.length / itemsPerPage);
  const paginatedConfigurations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return configurations.slice(startIndex, startIndex + itemsPerPage);
  }, [configurations, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007fd3]"></div>
        <span className="ml-3 text-gray-500">Loading configurations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
        Failed to load configurations.
      </div>
    );
  }

  if (!configurations.length) {
    return (
      <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
        No configurations found.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          key={currentPage} // Trigger animation on page change
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
                {paginatedConfigurations.map((config, index) => (
                  <motion.tr
                    key={config.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeInOut' }}
                    className="border-b hover:bg-gray-50 transition-colors duration-200 even:bg-gray-50/50"
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
                          className="text-[#007fd3] hover:text-[#006bb3]"
                          onClick={() => navigate(`/admin/configurations/${config.id}/edit`)}
                          aria-label={`Edit ${config.configKey}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(config.id)}
                          aria-label={`Delete ${config.configKey}`}
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

        {configurations.length > itemsPerPage && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({configurations.length} configurations)
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  p-2 rounded-full bg-[#007fd3] text-white hover:bg-[#006bb3] transition-colors
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
                `}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${currentPage === page ? 'bg-[#007fd3] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    transition-colors shadow-sm hover:shadow-md
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </motion.button>
              ))}
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  p-2 rounded-full bg-[#007fd3] text-white hover:bg-[#006bb3] transition-colors
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
                `}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SystemConfigList;