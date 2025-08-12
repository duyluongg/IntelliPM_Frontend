import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetEpicsWithTasksByProjectKeyQuery, type EpicWithStatsResponseDTO, useCreateEpicWithTasksMutation } from '../../../services/epicApi';
import { useGetSprintsByProjectKeyWithTasksQuery, type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import { useGetTasksFromBacklogQuery, type TaskBacklogResponseDTO } from '../../../services/taskApi';

const mapApiStatusToUI = (apiStatus: string | null | undefined): 'To Do' | 'In Progress' | 'Done' => {
  if (!apiStatus) {
    return 'To Do';
  }
  const normalizedStatus = apiStatus.toUpperCase();
  switch (normalizedStatus) {
    case 'TO_DO':
      return 'To Do';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
      return 'In Progress';
    case 'DONE':
      return 'Done';
    default:
      return 'To Do';
  }
};

// Utility function to convert date string to UTC ISO 8601 format
const toUTCISODate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString(); // Converts to UTC, e.g., "2025-08-12T00:00:00Z"
};

const BacklogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [epicForm, setEpicForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [dateErrors, setDateErrors] = useState({
    startDate: '',
    endDate: '',
  });

  const { data: projectData, isLoading: isProjectLoading } = useGetProjectDetailsByKeyQuery(projectKey);
  const {
    data: epicData = [],
    isLoading: isEpicLoading,
    error: epicError,
    refetch: refetchEpics,
  } = useGetEpicsWithTasksByProjectKeyQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const {
    data: sprintData = [],
    isLoading: isSprintLoading,
  } = useGetSprintsByProjectKeyWithTasksQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const {
    data: backlogData = [],
    isLoading: isBacklogLoading,
    error: backlogError,
  } = useGetTasksFromBacklogQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const [createEpic, { isLoading: isCreatingEpic, isError: isCreateEpicError, error: createEpicError }] = useCreateEpicWithTasksMutation();

  const accountId = parseInt(localStorage.getItem('accountId') || '0');

  const sprints: SprintWithTaskListResponseDTO[] = (Array.isArray(sprintData) ? sprintData : []).map((sprint) => ({
    ...sprint,
    tasks: Array.isArray(sprint.tasks) ? sprint.tasks.map((task) => ({
      ...task,
      status: mapApiStatusToUI(task.status),
    })) : [],
  }));

  const backlogTasks: TaskBacklogResponseDTO[] = (Array.isArray(backlogData) ? backlogData : []).map((task) => ({
    ...task,
    status: mapApiStatusToUI(task.status),
  }));

  // Date validation
  const validateDates = () => {
    const today = new Date('2025-08-12'); // Current date: August 12, 2025
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const startDate = epicForm.startDate ? new Date(epicForm.startDate) : null;
    const endDate = epicForm.endDate ? new Date(epicForm.endDate) : null;

    let startDateError = '';
    let endDateError = '';

    if (startDate) {
      if (startDate < today) {
        startDateError = 'Start date cannot be in the past';
      }
    }
    if (startDate && endDate && endDate < startDate) {
      endDateError = 'End date cannot be before start date';
    }

    setDateErrors({ startDate: startDateError, endDate: endDateError });
    return !startDateError && !endDateError;
  };

  const handleCreateEpic = async () => {
    if (!projectData?.data?.id || !validateDates()) return;

    try {
      await createEpic({
        projectId: projectData.data.id,
        data: {
          title: epicForm.name,
          description: epicForm.description,
          startDate: toUTCISODate(epicForm.startDate),
          endDate: toUTCISODate(epicForm.endDate),
          tasks: [], // Empty tasks for now

        },
      }).unwrap();
      refetchEpics();
      setIsCreateEpicOpen(false);
      setEpicForm({ name: '', description: '', startDate: '', endDate: '' });
      setDateErrors({ startDate: '', endDate: '' });
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredEpics = searchQuery
    ? epicData.filter((epic: EpicWithStatsResponseDTO) =>
        epic.name.toLowerCase().includes(searchQuery)
      )
    : epicData;

  if (isProjectLoading || isEpicLoading || isSprintLoading || isBacklogLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (epicError || backlogError) {
    return (
      <div className="p-4 text-center text-red-500">
        Lỗi tải dữ liệu: {epicError ? 'Không tải được epics' : 'Không tải được backlog tasks'}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-0.1">
      <BacklogHeader onSearch={handleSearch} projectId={projectData?.data?.id || 0} />
      <DndProvider backend={HTML5Backend}>
        <BacklogBody
          onCreateEpic={() => setIsCreateEpicOpen(true)}
          sprints={sprints}
          epics={filteredEpics}
          backlogTasks={backlogTasks}
          projectId={projectData?.data?.id || 0}
        />
      </DndProvider>

      {/* Create Epic Popup */}
      <AnimatePresence>
        {isCreateEpicOpen && (
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
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">Create New Epic</h3>
                </div>
                <button
                  onClick={() => setIsCreateEpicOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close create epic popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Epic Name</label>
                  <input
                    type="text"
                    value={epicForm.name}
                    onChange={(e) => setEpicForm({ ...epicForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Enter epic name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={epicForm.description}
                    onChange={(e) => setEpicForm({ ...epicForm, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Enter epic description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={epicForm.startDate}
                    onChange={(e) => {
                      setEpicForm({ ...epicForm, startDate: e.target.value });
                      validateDates();
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                  {dateErrors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{dateErrors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={epicForm.endDate}
                    onChange={(e) => {
                      setEpicForm({ ...epicForm, endDate: e.target.value });
                      validateDates();
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                  {dateErrors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{dateErrors.endDate}</p>
                  )}
                </div>
              </div>
              {isCreateEpicError && (
                <p className="text-red-500 text-sm mt-2">
                  {(createEpicError as any)?.data?.message || 'Failed to create epic. Please try again.'}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsCreateEpicOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm transition-all duration-300"
                  aria-label="Cancel epic creation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEpic}
                  disabled={isCreatingEpic || !epicForm.name || !epicForm.description || !!dateErrors.startDate || !!dateErrors.endDate}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                    isCreatingEpic || !epicForm.name || !epicForm.description || !!dateErrors.startDate || !!dateErrors.endDate ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Create epic"
                >
                  {isCreatingEpic ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4" /> Creating...
                    </span>
                  ) : (
                    'Create Epic'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BacklogPage;