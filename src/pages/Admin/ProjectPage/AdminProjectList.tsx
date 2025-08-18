import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // Add this import
import { type ProjectDetails } from '../../../services/projectApi';

interface ProjectListProps {
  projects: ProjectDetails[];
  isLoading: boolean;
  error: any;
}

const AdminProjectList: React.FC<ProjectListProps> = ({ projects, isLoading, error }) => {
  const navigate = useNavigate(); // Hook for navigation

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  // Format status or type for display
  const formatText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load projects.</div>;
  }

  if (!projects.length) {
    return <div className="text-center text-gray-500">No projects found.</div>;
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
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Icon</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Project Key</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Budget</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Type</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Start Date</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">End Date</th>
            <th scope="col" className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeInOut' }}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-4">
                  <img
                    src={project.iconUrl || 'https://via.placeholder.com/40'}
                    alt={`${project.name}'s icon`}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/40';
                    }}
                  />
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => navigate(`/admin/projects/${project.id}/dashboard`)} // Updated path
                  >
                    {project.name}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{project.projectKey}</td>
                <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={project.description}>
                  {project.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">${project.budget.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatText(project.projectType)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(project.startDate)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(project.endDate)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatText(project.status)}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default AdminProjectList;