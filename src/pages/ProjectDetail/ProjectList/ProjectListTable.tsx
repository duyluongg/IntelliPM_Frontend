import React, { useState } from 'react';
import { type User } from '../../../services/AuthContext';
import { useGetProjectsByAccountQuery } from '../../../services/accountApi';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectTableRow from './ProjectTableRow';
import ProjectListHeader from './ProjectListHeader';

const ProjectListTable: React.FC = () => {
  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const accessToken = user?.accessToken || '';
  const accountId = user?.id || 0;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
  } = useGetProjectsByAccountQuery(accessToken, {
    skip: !accessToken,
  });

  const projects = projectsResponse?.data || [];

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6" /> Loading projects...
        </div>
      </div>
    );
  }

  if (isError || !projectsResponse?.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-4">
            <AlertCircle className="w-6 h-6" /> Failed to load projects.
          </div>
          <p className="text-gray-600 text-sm">
            {error
              ? (error as any)?.data?.message || 'An error occurred'
              : 'Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl w-full mx-auto"
      >
        <ProjectListHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {filteredProjects.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <p className="text-gray-600 text-sm">
              {searchQuery ? 'No projects match your search.' : 'No projects found for this account.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
            <table className="min-w-full divide-y divide-gray-200" aria-label="Projects list">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200" aria-label="Table rows">
                <AnimatePresence>
                  {filteredProjects.map((project) => (
                    <ProjectTableRow
                      key={project.projectId}
                      project={project}
                      accountId={accountId}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectListTable;