import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Project } from '../../../services/accountApi';

interface ProjectActionsDropdownProps {
  project: Project;
}

const ProjectActionsDropdown: React.FC<ProjectActionsDropdownProps> = ({ project }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSettings = () => {
    navigate(`/project/${project.projectKey}/settings`);
    setIsOpen(false);
  };

  const handleDetails = () => {
    navigate(`/project/${project.projectKey}/details`);
    setIsOpen(false);
  };

  const handleSendEmailPM = () => {
    console.log(`Sending email for project ${project.projectKey} (PM)`);
    setIsOpen(false);
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
            {project.projectStatus === 'PLANNING' && (
              <button
                onClick={handleSendEmailPM}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                aria-label="Send email to PM"
              >
                Send Email PM
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectActionsDropdown;
