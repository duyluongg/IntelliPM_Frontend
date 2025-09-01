import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGetAllProjectsQuery, type ProjectDetails } from '../../../services/projectApi';
import { useGetActivityLogsByProjectIdQuery, type ActivityLogResponseDTO } from '../../../services/activityLogApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  logCounts: { [key: string]: number };
}

const ActivityFilter: React.FC<ActivityFilterProps> = ({ selectedType, onTypeChange, logCounts }) => {
  const activityTypes = [
    { id: 0, name: null, label: 'All Types' },
    { id: 1, name: 'TASK', label: 'Task' },
    { id: 2, name: 'SUBTASK', label: 'Subtask' },
    { id: 3, name: 'EPIC', label: 'Epic' },
    { id: 4, name: 'RISK', label: 'Risk' },
  ];

  const colorPalette = [
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', ring: 'ring-teal-200' },
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', ring: 'ring-blue-200' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', ring: 'ring-purple-200' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-200' },
    { bg: 'bg-red-500', hover: 'hover:bg-red-600', ring: 'ring-red-200' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mb-6"
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Activity Type Filters</h2>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {activityTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTypeChange(type.name)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium text-white
                ${selectedType === type.name ? `${colorPalette[index % colorPalette.length].bg} ${colorPalette[index % colorPalette.length].ring} ring-2 ring-offset-2` : `${colorPalette[index % colorPalette.length].bg} ${colorPalette[index % colorPalette.length].hover}`}
                shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2
              `}
              aria-label={`Filter by ${type.label}`}
            >
              <span>{type.label}</span>
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {logCounts[type.name || 'null'] || 0}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const AdminActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const { data: projectsData, isLoading: isProjectsLoading } = useGetAllProjectsQuery();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: activityLogs, isLoading, error } = useGetActivityLogsByProjectIdQuery(
    selectedProjectId || 0,
    { skip: !selectedProjectId }
  );

  const logCounts = useMemo(() => {
    const counts: { [key: string]: number } = { null: activityLogs?.length || 0 };
    activityLogs?.forEach((log) => {
      if (log.taskId) counts['TASK'] = (counts['TASK'] || 0) + 1;
      if (log.subtask) counts['SUBTASK'] = (counts['SUBTASK'] || 0) + 1;
      if (log.epicId) counts['EPIC'] = (counts['EPIC'] || 0) + 1;
      if (log.riskKey) counts['RISK'] = (counts['RISK'] || 0) + 1;
    });
    return counts;
  }, [activityLogs]);

  const filteredLogs = useMemo(() => {
    if (!activityLogs) return [];
    if (!selectedType) return activityLogs;
    return activityLogs.filter((log) => {
      if (selectedType === 'TASK' && log.taskId) return true;
      if (selectedType === 'SUBTASK' && log.subtask) return true;
      if (selectedType === 'EPIC' && log.epicId) return true;
      if (selectedType === 'RISK' && log.riskKey) return true;
      return false;
    });
  }, [activityLogs, selectedType]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isProjectsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007fd3]"></div>
        <span className="ml-3 text-gray-500">Loading projects...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
          <button
            className="text-[#007fd3] hover:text-[#006bb3] transition-colors font-medium"
            onClick={() => navigate('/admin/projects')}
            aria-label="Back to projects"
          >
            Back to Projects
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800 mb-2 block">Select Project</label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                setSelectedProjectId(Number(e.target.value) || null);
                setCurrentPage(1); // Reset to first page when project changes
              }}
              className="w-full max-w-md p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#99c7f1] focus:border-[#007fd3] transition-all"
              aria-label="Select a project"
            >
              <option value="">Select a project</option>
              {projectsData?.data?.map((project: ProjectDetails) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.projectKey})
                </option>
              ))}
            </select>
          </div>
          {(selectedProjectId || selectedType) && (
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedType(null);
                setCurrentPage(1); // Reset to first page when filters are cleared
              }}
              className="mt-6 sm:mt-0 px-4 py-2 bg-[#007fd3] text-white rounded-lg hover:bg-[#006bb3] transition-colors font-medium"
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        <ActivityFilter selectedType={selectedType} onTypeChange={(type) => {
          setSelectedType(type);
          setCurrentPage(1); // Reset to first page when type changes
        }} logCounts={logCounts} />

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007fd3]"></div>
            <span className="ml-3 text-gray-500">Loading activity logs...</span>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
            Failed to load activity logs.
          </div>
        )}
        {!isLoading && !error && !selectedProjectId && (
          <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
            Please select a project to view activity logs.
          </div>
        )}
        {!isLoading && !error && selectedProjectId && filteredLogs.length === 0 && (
          <div className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
            No activity logs found.
          </div>
        )}

        {selectedProjectId && filteredLogs.length > 0 && (
          <>
            <motion.div
              key={currentPage} // Ensure animation triggers on page change
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-x-auto mt-6"
            >
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Created By</th>
                    <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Activity Type</th>
                    <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Key</th>
                    <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Message</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeInOut' }}
                        className="border-b hover:bg-gray-50 transition-colors duration-200 even:bg-gray-50/50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{log.createdByName}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {log.taskId ? 'Task' : log.subtask ? 'Subtask' : log.epicId ? 'Epic' : log.riskKey ? 'Risk' : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {log.taskId || log.subtask || log.epicId || log.riskKey || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({filteredLogs.length} logs)
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
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AdminActivityLog;