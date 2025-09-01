import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Project } from '../../../services/accountApi';
import { useUpdateProjectStatusMutation } from '../../../services/projectApi';
import { type User } from '../../../services/AuthContext';

interface ProjectActionsDropdownProps {
  project: Project;
}

const ProjectActionsDropdown: React.FC<ProjectActionsDropdownProps> = ({ project }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [updateProjectStatus, { isLoading: isUpdatingStatus }] = useUpdateProjectStatusMutation();

  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const isLeaderOrManager = user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER';
  const isLeader = user?.role === 'TEAM_LEADER';
  const isManager = user?.role === 'PROJECT_MANAGER';

  const handleSettings = () => {
    navigate(`/project/${project.projectKey}/settings`);
    setIsOpen(false);
  };

  const handleDetails = () => {
    navigate(`/project/${project.projectKey}/summary`);
    setIsOpen(false);
  };

  const handleSendEmailPM = () => {
    console.log(`Sending email for project ${project.projectKey} (PM)`);
    setIsOpen(false);
  };

  const handleComplete = () => {
    navigate(`/project/${project.projectKey}/complete`);
    setIsOpen(false);
  };

  const handleChangeStatus = async () => {
    if (!isManager || project.projectStatus !== 'PLANNING') return;
    try {
      console.log('Updating project status:', { id: project.projectId, status: 'IN_PROGRESS' }); 
      await updateProjectStatus({ id: project.projectId, status: 'IN_PROGRESS' }).unwrap();
      alert('Project status updated to IN PROGRESS');
      setIsOpen(false);
    } catch (err: any) {
      console.error('Update project status error:', err);
      alert(`Failed to update project status: ${err?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
        aria-label="Project actions"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 border border-gray-100"
          >
            <button
              onClick={handleSettings}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              aria-label="Project settings"
            >
              Project Settings
            </button>
            <button
              onClick={handleDetails}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              aria-label="Project details"
            >
              Project Details
            </button>
            {project.projectStatus === 'PLANNING' && isLeader && (
              <button
                onClick={handleSendEmailPM}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                aria-label="Send email to PM"
              >
                Send Email PM
              </button>
            )}
            {project.projectStatus === 'PLANNING' && isManager && (
              <button
                onClick={handleChangeStatus}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                aria-label="Change project status"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing Status...
                  </>
                ) : (
                  'Start Project'
                )}
              </button>
            )}
            {project.projectStatus === 'IN_PROGRESS' && isLeaderOrManager && (
              <button
                onClick={handleComplete}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                aria-label="Complete project"
              >
                Complete Project
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectActionsDropdown;