import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetProjectDetailsByKeyQuery,
  useGetProjectDetailsByIdQuery,
} from '../../../services/projectApi';
import {
  type ProjectDetails,
  type ProjectDetailsById,
  type ProjectMember,
  type ProjectRequirement,
} from '../../../services/projectApi';
import { Mail, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectSummary: React.FC = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams<{ projectKey: string }>();
  const {
    data: projectResponse,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectDetailsByKeyQuery(projectKey || '', { skip: !projectKey });
  const {
    data: detailsResponse,
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useGetProjectDetailsByIdQuery(projectResponse?.data?.id || 0, {
    skip: !projectResponse?.data?.id,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const project: ProjectDetails | undefined = projectResponse?.data;
  const projectDetails: ProjectDetailsById | undefined = detailsResponse?.data;

  if (isProjectLoading || isDetailsLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 shadow-md'></div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className='text-center py-10 text-red-600 bg-red-50 rounded-lg mx-auto max-w-md'>
        <svg
          className='w-8 h-8 mx-auto mb-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          ></path>
        </svg>
        <p className='font-semibold text-sm'>
          {projectError
            ? `Error: ${(projectError as any)?.data?.message || 'Unknown error'}`
            : 'Project not found.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-xs'
        >
          Retry
        </button>
      </div>
    );
  }

  if (detailsError || !projectDetails) {
    return (
      <div className='text-center py-10 text-red-600 bg-red-50 rounded-lg mx-auto max-w-md'>
        <svg
          className='w-8 h-8 mx-auto mb-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          ></path>
        </svg>
        <p className='font-semibold text-sm'>
          {detailsError
            ? `Error: ${(detailsError as any)?.data?.message || 'Unknown error'}`
            : 'Detailed project data not found.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-xs'
        >
          Retry
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-4 py-1 rounded-full text-xs font-semibold shadow-sm transition-all';
    switch (status) {
      case 'IN_PROGRESS':
        return `${baseClasses} bg-gradient-to-r from-blue-400 to-blue-600 text-white`;
      case 'PLANNING':
        return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-600 text-white`;
      case 'COMPLETED':
        return `${baseClasses} bg-gradient-to-r from-green-400 to-green-600 text-white`;
      case 'CANCELLED':
        return `${baseClasses} bg-gradient-to-r from-red-400 to-red-600 text-white`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-400 to-gray-600 text-white`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold shadow-sm group relative';
    switch (priority) {
      case 'HIGHEST':
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-700 text-white`;
      case 'HIGH':
        return `${baseClasses} bg-gradient-to-r from-orange-500 to-orange-700 text-white`;
      case 'MEDIUM':
        return `${baseClasses} bg-gradient-to-r from-yellow-500 to-yellow-700 text-white`;
      case 'LOW':
        return `${baseClasses} bg-gradient-to-r from-green-500 to-green-700 text-white`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-500 to-gray-700 text-white`;
    }
  };

  const getMemberStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'INVITED':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'INACTIVE':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailClick = (email: string) => {
    console.log('Email clicked:', email); // Debugging
    if (isValidEmail(email)) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
      const newWindow = window.open(gmailUrl, '_blank');
      if (!newWindow) {
        setErrorMessage(
          'Failed to open Gmail. Please allow pop-ups or check your browser settings.'
        );
        setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
      }
    } else {
      console.error('Invalid email:', email);
      setErrorMessage('Invalid email address.');
      setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
    }
  };

  const handleMouseEnter = (email: string) => {
    console.log('Hovering email:', email); // Debugging tooltip hover
  };

  return (
    <div className='container mx-auto px-4 py-12 max-w-7xl bg-gray-50 min-h-screen'>
      {/* Error Message */}
      {errorMessage && (
        <div className='fixed top-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-md text-sm animate-fade-in'>
          {errorMessage}
        </div>
      )}

      {/* Header Section */}
      <div className='bg-gradient-to-r from-white to-gray-100 shadow-xl rounded-2xl p-8 mb-8 border-l-4 border-blue-500 animate-fade-in'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-4'>
            {project.iconUrl && (
              <img
                src={project.iconUrl}
                alt={project.name}
                className='w-12 h-12 rounded-full object-cover border-2 border-blue-200'
              />
            )}
            <div>
              <h1
                onClick={() => navigate(`/project?projectKey=${project.projectKey}#backlog`)}
                className='text-3xl font-extrabold text-gray-900 tracking-tight cursor-pointer hover:text-blue-600 transition'
              >
                {project.name}
              </h1>
              <p className='text-gray-500 text-xs mt-1 font-medium'>
                Project Key: {project.projectKey}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className={getStatusBadge(project.status)}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700'>
          <div className='space-y-2'>
            <p className='flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                ></path>
              </svg>
              <span className='font-semibold text-sm'>Start Date:</span>{' '}
              <span className='text-xs'>{formatDate(project.startDate)}</span>
            </p>
            <p className='flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                ></path>
              </svg>
              <span className='font-semibold text-sm'>End Date:</span>{' '}
              <span className='text-xs'>{formatDate(project.endDate)}</span>
            </p>
          </div>
          <div className='space-y-2'>
            <p className='flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              <span className='font-semibold text-sm'>Created:</span>{' '}
              <span className='text-xs'>{formatDate(project.createdAt)}</span>
            </p>
            <p className='flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              <span className='font-semibold text-sm'>Last Updated:</span>{' '}
              <span className='text-xs'>{formatDate(project.updatedAt)}</span>
            </p>
          </div>
        </div>
        <div className='mt-6 flex flex-col sm:flex-row gap-4 text-gray-700'>
          <p className='flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-blue-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <span className='font-semibold text-sm'>Budget:</span>{' '}
            <span className='text-xs'>{project.budget.toLocaleString()} VND</span>
          </p>
          <p className='flex items-center gap-2'>
            <svg
              className='w-5 h-5 text-blue-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              ></path>
            </svg>
            <span className='font-semibold text-sm'>Type:</span>{' '}
            <span className='text-xs'>{project.projectType.replace('_', ' ')}</span>
          </p>
        </div>
      </div>

      {/* Description Section */}
      <div className='bg-white shadow-xl rounded-2xl p-8 mb-8 border-l-4 border-indigo-500 animate-fade-in'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-transparent bg-clip-text'>
          Description
        </h2>
        <p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>
          {project.description}
        </p>
      </div>

      {/* Requirements Section */}
      <div className='bg-white shadow-xl rounded-2xl p-8 mb-8 border-l-4 border-purple-500 animate-fade-in'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text'>
          Requirements
        </h2>
        {projectDetails.requirements.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-separate border-spacing-y-2'>
              <thead>
                <tr className='bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg'>
                  <th className='p-4 font-semibold text-sm'>Title</th>
                  <th className='p-4 font-semibold text-sm'>Type</th>
                  <th className='p-4 font-semibold text-sm'>Priority</th>
                  <th className='p-4 font-semibold text-sm'>Created</th>
                  <th className='p-4 font-semibold text-sm'>Updated</th>
                </tr>
              </thead>
              <tbody>
                {projectDetails.requirements.map((req: ProjectRequirement, index) => (
                  <tr
                    key={req.id}
                    className={`border-b transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 hover:shadow-sm rounded-lg`}
                  >
                    <td className='p-4 text-sm'>{req.title}</td>
                    <td className='p-4 text-sm'>{req.type.replace('_', ' ')}</td>
                    <td className='p-4'>
                      <span className={getPriorityBadge(req.priority)}>
                        {req.priority}
                        <span className='absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2'>
                          Priority: {req.priority}
                        </span>
                      </span>
                    </td>
                    <td className='p-4 text-sm'>{formatDate(req.createdAt)}</td>
                    <td className='p-4 text-sm'>{formatDate(req.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-gray-500 italic text-sm'>No requirements available.</p>
        )}
      </div>

      {/* Team Members Section */}
      <div className='bg-white shadow-xl rounded-2xl p-8 border-l-4 border-green-500 animate-fade-in'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text'>
          Team Members
        </h2>
        {/* <button
          // onClick={() => navigate('/member-tasks')}
          className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors'
          title='View tasks by member'
        >
          <Users className='w-5 h-5' />
          <span className='hidden sm:inline'>View Tasks</span>
        </button> */}
        {projectDetails.projectMembers.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {projectDetails.projectMembers.map((member: ProjectMember) => (
              <div
                key={member.id}
                className='flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 border border-gray-200'
              >
                {/* Avatar */}
                <img
                  src={member.picture || 'https://via.placeholder.com/40'}
                  alt={member.fullName}
                  className='w-14 h-14 rounded-full mr-4 object-cover border-2 border-gray-200'
                />

                {/* Member Details */}
                <div>
                  {/* Name and username */}
                  <p className='text-gray-800 font-semibold text-base'>{member.fullName}</p>
                  <p className='text-gray-700 text-xs'>@{member.username}</p>

                  {/* Email with clickable Mail icon */}
                  <p className='flex items-center gap-2 text-gray-600 text-xs mt-1'>
                    {member.email && isValidEmail(member.email) ? (
                      <button
                        onClick={() => handleEmailClick(member.email!)}
                        onMouseEnter={() => handleMouseEnter(member.email!)}
                        className='relative flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group z-10'
                        role='button'
                        aria-label={`Email ${member.fullName}`}
                      >
                        <Mail className='w-4 h-4 text-blue-500' />
                        {member.email}
                        <span className='absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-fit'>
                          Send email
                        </span>
                      </button>
                    ) : (
                      <span className='text-gray-400 italic'>No email provided</span>
                    )}
                  </p>

                  {/* Project roles */}
                  <p className='text-gray-600 text-xs mt-1'>
                    {member.projectPositions
                      .map((pos) => pos.position.replace('_', ' '))
                      .join(', ')}
                  </p>

                  {/* Status */}
                  <p className={`${getMemberStatusBadge(member.status)} mt-1`}>
                    Status: {member.status.replace('_', ' ')}
                  </p>

                  {/* Invited or Joined date */}
                  {member.status === 'INVITED'
                    ? member.invitedAt && (
                        <p className='text-gray-500 text-xs mt-1'>
                          Invited: {formatDate(member.invitedAt)}
                        </p>
                      )
                    : member.joinedAt && (
                        <p className='text-gray-500 text-xs mt-1'>
                          Joined: {formatDate(member.joinedAt)}
                        </p>
                      )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 italic text-sm'>
            No team members available{detailsError ? ': Error loading members' : ''}.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectSummary;
