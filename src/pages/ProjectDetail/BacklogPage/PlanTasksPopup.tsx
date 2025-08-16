import React, { useState } from 'react';
import {
  useCreateSprintsWithTasksMutation,
  type SprintWithTasksDTO,
} from '../../../services/sprintApi';
import { useSprintPlanningMutation } from '../../../services/aiApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import EditSprintDetails from './EditSprintDetails';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
import aiIcon from '../../../assets/icon/ai.png';
import galaxyaiIcon from '../../../assets/galaxyai.gif';

interface PlanTasksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectKey: string;
  onTaskUpdated: () => void;
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Invalid Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const day = date.getUTCDate();
  const monthAbbr = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${monthAbbr}`;
};

const PlanTasksPopup: React.FC<PlanTasksPopupProps> = ({
  isOpen,
  onClose,
  projectId,
  projectKey,
  onTaskUpdated,
}) => {
  const [numberOfSprints, setNumberOfSprints] = useState<number>(1);
  const [weeksPerSprint, setWeeksPerSprint] = useState<number>(1);
  const [sprints, setSprints] = useState<SprintWithTasksDTO[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<{ [sprintId: string]: string[] }>({});
  const [isPlanning, setIsPlanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ sprintId: string; taskId: string } | null>(null);
  const [taskPriority, setTaskPriority] = useState<string>('');
  const [taskPlannedHours, setTaskPlannedHours] = useState<number | ''>('');
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [evaluationPayload, setEvaluationPayload] = useState<string>('');

  const {
    data: priorityData,
    isLoading: isPriorityLoading,
    error: priorityError,
  } = useGetCategoriesByGroupQuery('task_priority', { skip: !isOpen });
  const priorityOptions = priorityData?.data?.map((category) => category.name) || [
    'LOW',
    'MEDIUM',
    'HIGH',
  ];

  const [sprintPlanning, { isLoading: isSprintPlanningLoading }] = useSprintPlanningMutation();
  const [createSprintsWithTasks] = useCreateSprintsWithTasksMutation();

  const handleGeneratePlan = async () => {
    if (numberOfSprints < 1 || weeksPerSprint < 1) {
      setError('Number of sprints and weeks per sprint must be at least 1.');
      return;
    }
    setIsPlanning(true);
    setError(null);
    try {
      console.log('Generating sprint plan with:', { projectId, numberOfSprints, weeksPerSprint });
      const response = await sprintPlanning({
        projectId,
        body: { numberOfSprints, weeksPerSprint },
      }).unwrap();
      console.log('Sprint planning response:', response);
      setSprints(response.data);
      const newSelectedSprints = response.data.map((sprint) => sprint.sprintId);
      const newSelectedTasks = response.data.reduce((acc, sprint) => {
        acc[sprint.sprintId] = sprint.tasks.map((task) => task.taskId);
        return acc;
      }, {} as { [sprintId: string]: string[] });
      setSelectedSprints(newSelectedSprints);
      setSelectedTasks(newSelectedTasks);
    } catch (err: any) {
      console.error('Sprint planning error:', err);
      setError(err?.data?.message || 'Failed to generate sprint plan');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleSprintCheckboxChange = (sprintId: string) => {
    setSelectedSprints((prev) =>
      prev.includes(sprintId) ? prev.filter((id) => id !== sprintId) : [...prev, sprintId]
    );
    setSelectedTasks((prev) => {
      const newTasks = { ...prev };
      if (prev[sprintId]) {
        delete newTasks[sprintId];
      } else {
        const sprint = sprints.find((s) => s.sprintId === sprintId);
        newTasks[sprintId] = sprint ? sprint.tasks.map((task) => task.taskId) : [];
      }
      return newTasks;
    });
  };

  const handleTaskCheckboxChange = (sprintId: string, taskId: string) => {
    setSelectedTasks((prev) => {
      const sprintTasks = prev[sprintId] || [];
      const updatedTasks = sprintTasks.includes(taskId)
        ? sprintTasks.filter((id) => id !== taskId)
        : [...sprintTasks, taskId];
      return { ...prev, [sprintId]: updatedTasks };
    });
  };

  const handleEditSprint = (sprintId: string) => {
    setEditingSprintId(sprintId);
  };

  const handleSaveSprintDetails = (
    sprintId: string,
    updatedDetails: { title: string; startDate: string; endDate: string }
  ) => {
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.sprintId === sprintId
          ? {
              ...sprint,
              title: updatedDetails.title,
              startDate: updatedDetails.startDate,
              endDate: updatedDetails.endDate,
            }
          : sprint
      )
    );
    setEditingSprintId(null);
  };

  const handleStartTaskEdit = (
    sprintId: string,
    taskId: string,
    currentPriority: string,
    currentHours: number
  ) => {
    setEditingTask({ sprintId, taskId });
    setTaskPriority(currentPriority);
    setTaskPlannedHours(currentHours);
  };

  const handleSaveTaskEdit = (sprintId: string, taskId: string) => {
    if (taskPlannedHours === '' || taskPlannedHours < 0) {
      setError('Planned hours must be a non-negative number.');
      return;
    }
    if (!priorityOptions.includes(taskPriority)) {
      setError('Invalid priority selected.');
      return;
    }
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.sprintId === sprintId
          ? {
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.taskId === taskId
                  ? { ...task, priority: taskPriority, plannedHours: Number(taskPlannedHours) }
                  : task
              ),
            }
          : sprint
      )
    );
    setEditingTask(null);
    setTaskPriority('');
    setTaskPlannedHours('');
  };

  const handleCancelTaskEdit = () => {
    setEditingTask(null);
    setTaskPriority('');
    setTaskPlannedHours('');
  };

  const handleSubmit = async () => {
    if (selectedSprints.length === 0) {
      setError('Please select at least one sprint.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = sprints
        .filter((sprint) => selectedSprints.includes(sprint.sprintId))
        .map((sprint) => ({
          ...sprint,
          tasks: sprint.tasks.filter(
            (task) => selectedTasks[sprint.sprintId]?.includes(task.taskId) || false
          ),
        }));
      console.log('Submitting payload:', payload);
      const response = await createSprintsWithTasks({ projectKey, body: payload }).unwrap();
      console.log('Sprints created successfully:', response);
      setEvaluationPayload(JSON.stringify(payload));
      setIsEvaluationPopupOpen(true);
      onTaskUpdated();
    } catch (err: any) {
      console.error('Create sprints error:', err);
      setError(err?.data?.message || 'Failed to create sprints and tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluationPopupClose = () => {
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    onClose();
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI response evaluation submitted with ID:', aiResponseId);
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60'>
        <style>
          {`
            @keyframes gradientLoading {
              0% { background-position: 200% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}
        </style>
        <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[85vh] overflow-y-auto'>
          <h2 className='text-2xl font-bold text-[#1c73fd] mb-6'>Plan Tasks for Sprints</h2>
          {(error || priorityError) && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-6'>
              {error || (priorityError && 'Failed to load priority options')}
            </div>
          )}
          {isPlanning || isSprintPlanningLoading ? (
            <div className='flex justify-center items-center py-10 bg-white/50 rounded-2xl shadow-md'>
              <div className='flex flex-col items-center gap-4'>
                <img src={galaxyaiIcon} alt='AI Processing' className='w-10 h-10 animate-pulse' />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradientLoading 1.8s ease-in-out infinite',
                  }}
                  className='text-lg font-semibold'
                >
                  Generating Sprint Plan...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Number of Sprints
                  </label>
                  <input
                    type='number'
                    value={numberOfSprints}
                    onChange={(e) => setNumberOfSprints(parseInt(e.target.value) || 1)}
                    min='1'
                    className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                    disabled={isPlanning || isSubmitting}
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Weeks per Sprint
                  </label>
                  <input
                    type='number'
                    value={weeksPerSprint}
                    onChange={(e) => setWeeksPerSprint(parseInt(e.target.value) || 1)}
                    min='1'
                    className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                    disabled={isPlanning || isSubmitting}
                  />
                </div>
              </div>
              <div className='mb-6'>
                <button
                  onClick={handleGeneratePlan}
                  className={`w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                    isPlanning || isSubmitting
                      ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 hover:shadow-lg hover:scale-[1.02]'
                  }`}
                  disabled={isPlanning || isSubmitting}
                >
                  <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
                  {isPlanning ? 'Generating Plan...' : 'Generate Sprint Plan'}
                </button>
              </div>
              {sprints.length > 0 && (
                <div className='border border-gray-200 rounded-xl p-5 max-h-[50vh] overflow-y-auto bg-gray-50'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>Generated Sprints</h3>
                  {sprints.map((sprint) => (
                    <div
                      key={sprint.sprintId}
                      className='mb-6 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                    >
                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={selectedSprints.includes(sprint.sprintId)}
                          onChange={() => handleSprintCheckboxChange(sprint.sprintId)}
                          className='h-5 w-5 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded'
                          disabled={isSubmitting}
                        />
                        <span className='font-semibold text-gray-800'>{sprint.title}</span>
                        <span className='text-sm text-gray-500'>
                          ({formatDate(sprint.startDate)} - {formatDate(sprint.endDate)})
                        </span>
                        <button
                          onClick={() => handleEditSprint(sprint.sprintId)}
                          className='text-sm text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200'
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                      </div>
                      <p className='text-sm text-gray-600 ml-8 mt-2'>{sprint.description}</p>
                      <div className='ml-8 mt-3 space-y-3'>
                        {sprint.tasks.map((task) => (
                          <div key={task.taskId} className='flex items-center gap-3'>
                            <input
                              type='checkbox'
                              checked={
                                selectedTasks[sprint.sprintId]?.includes(task.taskId) || false
                              }
                              onChange={() =>
                                handleTaskCheckboxChange(sprint.sprintId, task.taskId)
                              }
                              className='h-4 w-4 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded'
                              disabled={isSubmitting || !selectedSprints.includes(sprint.sprintId)}
                            />
                            <span className='text-sm text-gray-800'>{task.title}</span>
                            {editingTask?.sprintId === sprint.sprintId &&
                            editingTask?.taskId === task.taskId ? (
                              <div className='flex items-center gap-2'>
                                <select
                                  value={taskPriority}
                                  onChange={(e) => setTaskPriority(e.target.value)}
                                  className='text-xs border border-gray-300 rounded-lg p-1.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]'
                                  disabled={isPriorityLoading}
                                >
                                  {priorityOptions.map((priority) => (
                                    <option key={priority} value={priority}>
                                      {priority}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type='number'
                                  value={taskPlannedHours}
                                  onChange={(e) =>
                                    setTaskPlannedHours(
                                      e.target.value === '' ? '' : parseInt(e.target.value)
                                    )
                                  }
                                  min='0'
                                  className='w-16 text-xs border border-gray-300 rounded-lg p-1.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]'
                                />
                                <button
                                  onClick={() => handleSaveTaskEdit(sprint.sprintId, task.taskId)}
                                  className='text-xs text-green-600 hover:text-green-700'
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelTaskEdit}
                                  className='text-xs text-red-600 hover:text-red-700'
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-gray-500'>
                                  ({task.priority}, {task.plannedHours} hours)
                                </span>
                                <button
                                  onClick={() =>
                                    handleStartTaskEdit(
                                      sprint.sprintId,
                                      task.taskId,
                                      task.priority,
                                      task.plannedHours
                                    )
                                  }
                                  className='text-xs text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200'
                                  disabled={
                                    isSubmitting || !selectedSprints.includes(sprint.sprintId)
                                  }
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {editingSprintId === sprint.sprintId && (
                        <EditSprintDetails
                          sprint={sprint}
                          onSave={handleSaveSprintDetails}
                          onClose={() => setEditingSprintId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className='flex justify-end gap-4 mt-8'>
                <button
                  onClick={onClose}
                  className='px-6 py-2.5 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200'
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-300 ${
                    isSubmitting || sprints.length === 0
                      ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
                  }`}
                  disabled={isSubmitting || sprints.length === 0}
                >
                  {isSubmitting ? 'Creating Sprints...' : 'Create Selected Sprints'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <AiResponseEvaluationPopup
        isOpen={isEvaluationPopupOpen}
        onClose={handleEvaluationPopupClose}
        aiResponseJson={evaluationPayload}
        projectId={projectId}
        aiFeature='SPRINT_CREATION'
        onSubmitSuccess={handleEvaluationSubmitSuccess}
      />
    </>
  );
};

export default PlanTasksPopup;
