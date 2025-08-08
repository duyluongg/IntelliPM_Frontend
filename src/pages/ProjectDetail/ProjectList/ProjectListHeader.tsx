import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '../../../services/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ProjectListHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

  const CustomSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      fill="none"
      viewBox="0 0 16 16"
      role="presentation"
      {...props}
      style={{ color: 'var(--ds-icon, #44546F)' }}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M1 7a6 6 0 1 1 10.74 3.68l3.29 3.29-1.06 1.06-3.29-3.29A6 6 0 0 1 1 7"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center justify-between mb-6 mt-6 px-4"
    >
      <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
        {/* Nút mũi tên quay về */}
        <div className="flex items-center mb-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-750">Manage Project</h1>

        <div className="flex items-center border border-gray-300 rounded-md w-[280px] px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 bg-white mt-4">
          <CustomSearchIcon className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or key"
            className="ml-2 flex-1 bg-white border-none outline-none appearance-none text-sm text-gray-700 placeholder-gray-400"
            style={{ all: 'unset', width: '100%' }}
            aria-label="Search projects"
          />
        </div>
      </div>

      {(user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER') && (
        <button
          onClick={() => navigate('/project/introduction')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm transition-all duration-300"
          aria-label="Save Project"
        >
          Save Project
        </button>
      )}
    </motion.div>
  );
};

export default ProjectListHeader;
