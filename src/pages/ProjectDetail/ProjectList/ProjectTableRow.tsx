import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Project } from '../../../services/accountApi';
import { useGetProjectByIdQuery } from '../../../services/projectApi';
import { useGetProjectMembersQuery, useGetProjectMembersNoStatusQuery, type ProjectMemberResponse, type ProjectMemberWithPositionsResponse } from '../../../services/projectMemberApi';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import ProjectActionsDropdown from './ProjectActionsDropdown';
import { motion } from 'framer-motion';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const truncateName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

interface ProjectTableRowProps {
  project: Project;
  accountId: number;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({ project, accountId }) => {
  const navigate = useNavigate();
  const {
    data: projectDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetProjectByIdQuery(project.projectId);

  const {
    data: activeMembers = [],
    isLoading: isActiveMembersLoading,
    isError: isActiveMembersError,
  } = useGetProjectMembersQuery(project.projectId, { skip: !project.projectId });

  const {
    data: allMembers = [],
    isLoading: isAllMembersLoading,
    isError: isAllMembersError,
  } = useGetProjectMembersNoStatusQuery(project.projectId, { skip: !project.projectId });

  const progress = projectDetails?.isSuccess
    ? calculateProgress(projectDetails.data.startDate, projectDetails.data.endDate)
    : 0;

  const projectName = projectDetails?.isSuccess ? projectDetails.data.name : project.projectName;
  const startDate = projectDetails?.isSuccess ? formatDate(projectDetails.data.startDate) : 'N/A';
  const endDate = projectDetails?.isSuccess ? formatDate(projectDetails.data.endDate) : 'N/A';

  const activeCount = isActiveMembersError ? 0 : activeMembers.length;
  const totalCount = isAllMembersError ? 0 : allMembers.length;

  const handleProjectNameClick = () => {
    navigate(`/project?projectKey=${project.projectKey}#backlog`);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="hover:bg-gray-50"
      role="row"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleProjectNameClick}
          className="flex items-center gap-3 text-left"
          aria-label={`View project ${projectName}`}
        >
          {project.iconUrl && (
            <img
              src={project.iconUrl}
              alt={projectName}
              className="w-7 h-7 rounded-sm object-cover "
              onError={(e) => (e.currentTarget.src = '/placeholder.png')} // Fallback image
            />
          )}
          <span className="text-sm font-medium text-gray-800 hover:text-blue-600">
            {truncateName(projectName)}
          </span>
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectKey}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={project.projectStatus} />
      </td>
      <td className="px-6 py-4 min-w-[200px]">
        {isDetailsLoading ? (
          <span className="text-sm text-gray-500">Loading...</span>
        ) : isDetailsError ? (
          <span className="text-sm text-red-500">Error</span>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>{startDate}</span>
              <span className="text-right">{endDate}</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {isActiveMembersLoading || isAllMembersLoading ? (
          <span>Loading...</span>
        ) : (isActiveMembersError || isAllMembersError) ? (
          <span>N/A</span>
        ) : (
          <span>{`${activeCount}/${totalCount}`}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ProjectActionsDropdown project={project} />
      </td>
    </motion.tr>
  );
};

const calculateProgress = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (now >= end) return 100;
  if (now <= start) return 0;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
};

export default ProjectTableRow;