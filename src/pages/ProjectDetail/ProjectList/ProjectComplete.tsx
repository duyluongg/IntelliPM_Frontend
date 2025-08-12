import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, ChevronDown, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSprintsByProjectIdDescendingQuery, type SprintResponseDTO } from '../../../services/sprintApi';
import { useGetProjectDetailsByKeyQuery, useUpdateProjectStatusMutation } from '../../../services/projectApi';
import { type EpicWithStatsResponseDTO, useGetEpicsWithTasksByProjectKeyQuery } from '../../../services/epicApi';

// Utility function to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

// Utility function for status badges
const getStatusBadge = (status: string | null) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold shadow-sm';
  switch (status) {
    case 'ACTIVE':
    case 'COMPLETED':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'IN_PROGRESS':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'PLANNING':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'CANCELLED':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// Utility function to calculate epic progress
const calculateProgress = (
  totalTasks: number,
  toDo: number,
  inProgress: number,
  done: number
): { done: number; inProgress: number; toDo: number } => {
  if (totalTasks === 0) return { done: 0, inProgress: 0, toDo: 100 };
  return {
    done: Math.round((done / totalTasks) * 100),
    inProgress: Math.round((inProgress / totalTasks) * 100),
    toDo: Math.round((toDo / totalTasks) * 100),
  };
};

const ProjectComplete: React.FC = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams<{ projectKey: string }>();
  const [updateProject, { isLoading: isUpdating, isError: isUpdateError, error: updateError }] = useUpdateProjectStatusMutation();
  const [expandedEpicId, setExpandedEpicId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Fetch project details to get project ID
  const {
    data: projectResponse,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useGetProjectDetailsByKeyQuery(projectKey || '', {
    skip: !projectKey,
  });

  // Fetch sprints
  const {
    data: sprints = [],
    isLoading: isSprintsLoading,
    isError: isSprintsError,
    error: sprintsError,
  } = useGetSprintsByProjectIdDescendingQuery(projectResponse?.data?.id || 0, {
    skip: !projectResponse?.data?.id,
  });

  // Fetch epics with task stats
  const {
    data: epics = [],
    isLoading: isEpicsLoading,
    isError: isEpicsError,
    error: epicsError,
  } = useGetEpicsWithTasksByProjectKeyQuery(projectKey || '', {
    skip: !projectKey,
  });

  const projectId = projectResponse?.data?.id;

  // Map epics to include progress and formatted dates
  const mappedEpics = epics.map((epic: EpicWithStatsResponseDTO) => {
    const progress = calculateProgress(
      epic.totalTasks,
      epic.totalToDoTasks,
      epic.totalInProgressTasks,
      epic.totalDoneTasks
    );
    return {
      id: epic.id,
      name: epic.name,
      owner: epic.reporterFullname || epic.assignedByFullname || 'Unknown',
      color: epic.sprintId ? '#6b7280' : '#c97cf4',
      progress,
      startDate: formatDate(epic.startDate || epic.createdAt),
      dueDate: formatDate(epic.endDate || epic.updatedAt),
    };
  });

  const handleConfirmComplete = async () => {
    if (!projectKey || !projectId) return;

    // Check if all sprints are COMPLETED
    const hasNonCompletedSprints = sprints.some((sprint: SprintResponseDTO) => sprint.status !== 'COMPLETED');
    if (hasNonCompletedSprints) {
      setShowWarning(true);
      return;
    }

    try {
      await updateProject({
        id: projectId,
        status: 'COMPLETED',
      }).unwrap();
      navigate(`/project/${projectKey}/summary`);
    } catch (error) {
      console.error('Failed to complete project:', error);
    }
  };

  const closeWarning = () => {
    setShowWarning(false);
  };

  if (isProjectLoading || isSprintsLoading || isEpicsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6" /> Loading...
        </div>
      </div>
    );
  }

  if (isProjectError || isSprintsError || isEpicsError) {
    const errorMessage = isProjectError
      ? (projectError as any)?.data?.message || 'Failed to load project details.'
      : isSprintsError
      ? (sprintsError as any)?.data?.message || 'Failed to load sprints.'
      : (epicsError as any)?.data?.message || 'Failed to load epics.';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-4">
            <AlertCircle className="w-6 h-6" /> {errorMessage}
          </div>
          <p className="text-gray-600 text-sm">Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300 text-sm"
            aria-label="Retry loading data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      {/* Warning Popup */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Cannot Complete Project</h3>
                </div>
                <button
                  onClick={closeWarning}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close warning"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                All sprints must be marked as COMPLETED before the project can be completed. Please review and update sprint statuses.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeWarning}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm transition-all duration-300"
                  aria-label="Close warning"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate(`/project/${projectKey}/sprints`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300"
                  aria-label="Go to sprints"
                >
                  Go to Sprints
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl w-full mx-auto"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Complete Project: {projectResponse?.data?.name || projectKey}
        </h1>
        <p className="text-gray-600 mb-4">Review all sprints and epics before completing the project.</p>

        {/* Epics Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Epics</h2>
        {epics.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center mb-8">
            <p className="text-gray-600 text-sm">No epics found for this project.</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="space-y-3">
              {mappedEpics.map((epic) => {
                const isExpanded = expandedEpicId === epic.id;
                return (
                  <motion.div
                    key={epic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded p-3 space-y-2 bg-white hover:bg-gray-50 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2 text-sm cursor-pointer"
                        onClick={() => setExpandedEpicId(isExpanded ? null : epic.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-700" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-700" />
                        )}
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: epic.color || '#c97cf4' }}
                        />
                        <span className="capitalize font-medium truncate max-w-[200px]">
                          {epic.name}
                        </span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="bg-green-500"
                        style={{ width: `${epic.progress.done}%` }}
                        title={`Done: ${epic.progress.done}%`}
                      />
                      <div
                        className="bg-blue-500"
                        style={{ width: `${epic.progress.inProgress}%` }}
                        title={`In Progress: ${epic.progress.inProgress}%`}
                      />
                      <div
                        className="bg-gray-300"
                        style={{ width: `${epic.progress.toDo}%` }}
                        title={`To Do: ${epic.progress.toDo}%`}
                      />
                    </div>
                    {isExpanded && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-semibold">Start date</span>
                          <br />
                          {epic.startDate}
                        </div>
                        <div>
                          <span className="font-semibold">Due date</span>
                          <br />
                          {epic.dueDate}
                        </div>
                        <div>
                          <span className="font-semibold">Owner</span>
                          <br />
                          {epic.owner}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sprints Section (only shown if sprints exist) */}
        {sprints.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sprints</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
              <table className="min-w-full divide-y divide-gray-200" aria-label="Sprints list">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sprint Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {sprints.map((sprint: SprintResponseDTO) => (
                      <motion.tr
                        key={sprint.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{sprint.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sprint.startDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sprint.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(sprint.status)}>{(sprint.status || 'UNKNOWN').replace('_', ' ')}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl text-sm transition-all duration-300"
            aria-label="Cancel project completion"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmComplete}
            disabled={isUpdating || !projectId}
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm transition-all duration-300 ${
              isUpdating || !projectId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Confirm project completion"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Completing...
              </span>
            ) : (
              'Confirm Complete'
            )}
          </button>
        </div>
        {isUpdateError && (
          <p className="text-red-500 mt-4">
            {(updateError as any)?.data?.message || 'Failed to complete project. Please try again.'}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectComplete;