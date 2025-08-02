import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type ProjectDetails, useGetProjectByIdQuery } from '../../../services/projectApi';
import { type Project, useGetProjectsByAccountQuery } from '../../../services/accountApi';
import {
  useGetProjectMemberByAccountQuery,
  useUpdateProjectMemberStatusMutation,
} from '../../../services/projectMemberApi';
import { type User } from '../../../services/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
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

const truncateDescription = (description: string, maxLength: number = 100) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

const truncateName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

interface ProjectCardProps {
  project: Project;
  onClick: (projectKey: string) => void;
  accountId: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, accountId }) => {
  const {
    data: projectDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetProjectByIdQuery(project.projectId);
  const {
    data: memberData,
    isLoading: isMemberLoading,
    isError: isMemberError,
  } = useGetProjectMemberByAccountQuery({
    projectId: project.projectId,
    accountId,
  });
  const [updateProjectMemberStatus, { isLoading: isUpdating, isError: isUpdateError }] =
    useUpdateProjectMemberStatusMutation();
const progress = projectDetails?.isSuccess
    ? calculateProgress(projectDetails.data.startDate, projectDetails.data.endDate)
    : 0;

  // Accessing projectDetails variables
  const projectName = projectDetails?.isSuccess ? projectDetails.data.name : project.projectName;
  const startDate = projectDetails?.isSuccess ? formatDate(projectDetails.data.startDate) : 'N/A';
  const endDate = projectDetails?.isSuccess ? formatDate(projectDetails.data.endDate) : 'N/A';
  const description = projectDetails?.isSuccess
    ? truncateDescription(projectDetails.data.description)
    : 'No description';
  const budget = projectDetails?.isSuccess ? projectDetails.data.budget.toLocaleString() : 'N/A';
  const memberStatus = memberData?.isSuccess ? memberData.data?.status : project.status;
  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

  const handleAcceptInvite = async () => {
    if (!memberData?.data?.id) {
      console.error('No member ID available');
      return;
    }
    try {
      await updateProjectMemberStatus({
        projectId: project.projectId,
        memberId: memberData.data.id,
        status: 'ACTIVE',
      }).unwrap();
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className='bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col min-h-[400px]'
    >
      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-4'>
          {project.iconUrl && (
            <img
              src={project.iconUrl}
              alt={project.projectName}
              className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
            />
          )}
          <div>
            <h2 className='text-lg font-semibold text-gray-800'>{truncateName(projectName)}</h2>
            <p className='text-gray-500 text-xs'>Key: {project.projectKey}</p>
          </div>
        </div>
        <p className='text-sm text-gray-600'>
          <span className='font-medium'>Project Status:</span>{' '}
          <span className={getStatusBadge(project.projectStatus)}>
            {project.projectStatus.replace('_', ' ')}
          </span>
        </p>
        <p className='text-sm text-gray-600'>
          <span className='font-medium'>Member Status:</span>{' '}
          {isMemberLoading ? (
            <span className='text-gray-500'>Loading...</span>
          ) : isMemberError ? (
            <span className='text-red-500'>Error</span>
          ) : (
            <span className={getStatusBadge(memberStatus || 'UNKNOWN')}>
              {(memberStatus || 'UNKNOWN').replace('_', ' ')}
            </span>
          )}
        </p>
        <p className='text-sm text-gray-600'>
          {isMemberLoading ? (
<span className='text-gray-500'>Loading...</span>
          ) : isMemberError ? (
            <span className='text-red-500'>Error</span>
          ) : memberStatus === 'INVITED' ? (
            <>
              <span className='font-medium'>Invited:</span> {formatDate(project.invitedAt)}
            </>
          ) : (
            <>
              <span className='font-medium'>Joined:</span> {formatDate(project.joinedAt)}
            </>
          )}
        </p>

        <p className='text-sm text-gray-600'>
          <span className='font-medium'>Description:</span> {description}
        </p>
        <div className='mt-4'>
          {isDetailsLoading ? (
            <div className='text-sm text-gray-500'>Loading timeline...</div>
          ) : isDetailsError ? (
            <div className='text-sm text-red-500'>Error loading timeline</div>
          ) : (
            <div className='space-y-1'>
              <div className='flex justify-between text-xs text-gray-500 mb-1'>
                <span>{startDate}</span>
                <span>{endDate}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                <motion.div
                  className='bg-blue-600 h-2.5 rounded-full'
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className='text-xs text-gray-500 text-center'>{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </div>
      <div className='mt-4 flex items-center justify-between'>
        {/* Left: Accept Invite nếu có */}
        <div className='flex gap-2'>
          {memberStatus === 'INVITED' && (
            <button
              onClick={handleAcceptInvite}
              disabled={isUpdating || !memberData?.data?.id}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                isUpdating || !memberData?.data?.id
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUpdating ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='animate-spin w-4 h-4' /> Accepting...
                </span>
              ) : (
                'Accept Invite'
              )}
            </button>
          )}
          {isUpdateError && <p className='text-sm text-red-500 mt-2'>Failed to accept invite</p>}
        </div>

        {/* Right: Detail button */}
        <button
          onClick={() => onClick(project.projectKey)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300'
        >
          Detail
        </button>
      </div>
    </motion.div>
  );
};

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const accessToken = user?.accessToken || '';
  const accountId = user?.id || 0;
  const formatName = (username: string) => {
    return username
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
  } = useGetProjectsByAccountQuery(accessToken, {
    skip: !accessToken,
  });

  const projects: Project[] = projectsResponse?.data || [];

  const handleProjectClick = (projectKey: string) => {
    navigate(`/project/${projectKey}/summary`);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='animate-spin w-6 h-6' /> Loading projects...
        </div>
      </div>
    );
  }

  if (isError || !projectsResponse?.isSuccess) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100'>
        <div className='bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center'>
          <div className='flex items-center justify-center gap-2 text-red-600 font-semibold mb-4'>
            <AlertCircle className='w-6 h-6' /> Failed to load projects.
          </div>
          <p className='text-gray-600 text-sm'>
            {error
              ? (error as any)?.data?.message || 'An error occurred'
              : 'Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 text-sm'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-4xl w-full'
      >
        <div className='flex justify-between items-center mb-6 relative mt-6'>
          <div className='w-[140px]'></div>

          <h1
            className='absolute left-1/2 -translate-x-1/2 text-3xl font-extrabold text-transparent bg-clip-text 
             bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-sm'
          >
            {user?.username ? `${user.username}'s Projects` : 'Your Projects'}
          </h1>

          {user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER' ? (
            <button
              onClick={() => navigate('/project/introduction')}
className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 w-[140px] text-right'
            >
              + Create Project
            </button>
          ) : (
            <div className='w-[140px]'></div>
          )}
        </div>

        <div className='m-12'></div>
        {projects.length === 0 ? (
          <div className='bg-white p-8 rounded-2xl shadow-xl text-center'>
            <p className='text-gray-600 text-sm'>No projects found for this account.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            <AnimatePresence>
              {projects.map((project) => (
                <ProjectCard
                  key={project.projectId}
                  project={project}
                  onClick={handleProjectClick}
                  accountId={accountId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectList;