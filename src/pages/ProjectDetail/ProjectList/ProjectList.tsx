import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsByAccountQuery } from '../../../services/accountApi';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  projectId: number;
  projectName: string;
  projectKey: string;
  iconUrl: string | null;
  projectStatus: string;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken') || '';
  const accountId = parseInt(localStorage.getItem('accountId') || '0');

  const { data: projectsResponse, isLoading, isError, error } = useGetProjectsByAccountQuery(accessToken, { skip: !accessToken });

  const projects: Project[] = projectsResponse?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold shadow-sm';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'INVITED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleProjectClick = (projectKey: string) => {
    navigate(`/project/${projectKey}/summary`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6" /> Loading projects...
        </div>
      </div>
    );
  }

  if (isError || !projectsResponse?.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-4">
            <AlertCircle className="w-6 h-6" /> Failed to load projects.
          </div>
          <p className="text-gray-600 text-sm">
            {error ? (error as any)?.data?.message || 'An error occurred' : 'Please try again later.'}
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Projects</h1>
        {projects.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <p className="text-gray-600 text-sm">No projects found for this account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.projectId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200"
                  onClick={() => handleProjectClick(project.projectKey)}
                >
                  <div className="flex items-center gap-4">
                    {project.iconUrl && (
                      <img
                        src={project.iconUrl}
                        alt={project.projectName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{project.projectName}</h2>
                      <p className="text-gray-500 text-xs">Key: {project.projectKey}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Project Status:</span>{' '}
                      <span className={getStatusBadge(project.projectStatus)}>
                        {project.projectStatus.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Member Status:</span>{' '}
                      <span className={getStatusBadge(project.status)}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Invited:</span> {formatDate(project.invitedAt)}
                    </p>
                    {project.joinedAt && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Joined:</span> {formatDate(project.joinedAt)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectList;
