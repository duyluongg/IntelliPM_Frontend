import React, { useState } from 'react';
import {
  useCreateSprintsWithTasksMutation,
  type SprintWithTasksDTO,
} from '../../../services/sprintApi';
import { useSprintPlanningMutation } from '../../../services/aiApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import EditSprintDetails from './EditSprintDetails';

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

  const { data: priorityData, isLoading: isPriorityLoading, error: priorityError } = useGetCategoriesByGroupQuery('task_priority');
  const priorityOptions = priorityData?.data?.map((category) => category.name) || ['LOW', 'MEDIUM', 'HIGH'];

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
      const response = await sprintPlanning({
        projectId,
        body: { numberOfSprints, weeksPerSprint },
      }).unwrap();
      setSprints(response.data);
      const newSelectedSprints = response.data.map((sprint) => sprint.sprintId);
      const newSelectedTasks = response.data.reduce((acc, sprint) => {
        acc[sprint.sprintId] = sprint.tasks.map((task) => task.taskId);
        return acc;
      }, {} as { [sprintId: string]: string[] });
      setSelectedSprints(newSelectedSprints);
      setSelectedTasks(newSelectedTasks);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to generate sprint plan');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleSprintCheckboxChange = (sprintId: string) => {
    setSelectedSprints((prev) =>
      prev.includes(sprintId)
        ? prev.filter((id) => id !== sprintId)
        : [...prev, sprintId]
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
      return {
        ...prev,
        [sprintId]: sprintTasks.includes(taskId)
          ? sprintTasks.filter((id) => id !== taskId)
          : [...sprintTasks, taskId],
      };
    });
  };

  const handleEditSprint = (sprintId: string) => {
    setEditingSprintId(sprintId);
  };

  const handleSaveSprintDetails = (sprintId: string, updatedDetails: { title: string; startDate: string; endDate: string }) => {
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.sprintId === sprintId
          ? { ...sprint, title: updatedDetails.title, startDate: updatedDetails.startDate, endDate: updatedDetails.endDate }
          : sprint
      )
    );
    setEditingSprintId(null);
  };

  const handleStartTaskEdit = (sprintId: string, taskId: string, currentPriority: string, currentHours: number) => {
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
          tasks: sprint.tasks.filter((task) =>
            selectedTasks[sprint.sprintId]?.includes(task.taskId)
          ),
        }));
      await createSprintsWithTasks({ projectKey, body: payload }).unwrap();
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create sprints and tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Plan Tasks for Sprints</h2>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {priorityError && <div className="text-red-500 text-sm mb-4">Failed to load priority options</div>}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Sprints
              </label>
              <input
                type="number"
                value={numberOfSprints}
                onChange={(e) => setNumberOfSprints(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isPlanning || isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weeks per Sprint
              </label>
              <input
                type="number"
                value={weeksPerSprint}
                onChange={(e) => setWeeksPerSprint(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isPlanning || isSubmitting}
              />
            </div>
          </div>
          <button
            onClick={handleGeneratePlan}
            className={`w-full py-2 text-sm font-medium text-white rounded-md transition ${
              isPlanning
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isPlanning || isSubmitting}
          >
            {isPlanning ? 'Generating Plan...' : 'Generate Sprint Plan'}
          </button>
        </div>
        {sprints.length > 0 && (
          <div className="mt-4 max-h-[50vh] overflow-y-auto border border-gray-200 rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Generated Sprints</h3>
            {sprints.map((sprint) => (
              <div key={sprint.sprintId} className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSprints.includes(sprint.sprintId)}
                    onChange={() => handleSprintCheckboxChange(sprint.sprintId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <span className="font-semibold">{sprint.title}</span>
                  <span className="text-sm text-gray-600">
                    ({formatDate(sprint.startDate)} - {formatDate(sprint.endDate)})
                  </span>
                  <button
                    onClick={() => handleEditSprint(sprint.sprintId)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    disabled={isSubmitting}
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600 ml-6 mt-1">{sprint.description}</p>
                <div className="ml-6 mt-2 space-y-2">
                  {sprint.tasks.map((task) => (
                    <div key={task.taskId} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTasks[sprint.sprintId]?.includes(task.taskId)}
                        onChange={() => handleTaskCheckboxChange(sprint.sprintId, task.taskId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isSubmitting || !selectedSprints.includes(sprint.sprintId)}
                      />
                      <span className="text-sm">{task.title}</span>
                      {editingTask?.sprintId === sprint.sprintId && editingTask?.taskId === task.taskId ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                            className="text-xs border border-gray-300 rounded p-1"
                            disabled={isPriorityLoading}
                          >
                            {priorityOptions.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={taskPlannedHours}
                            onChange={(e) => setTaskPlannedHours(e.target.value === '' ? '' : parseInt(e.target.value))}
                            min="0"
                            className="w-16 text-xs border border-gray-300 rounded p-1"
                          />
                          <button
                            onClick={() => handleSaveTaskEdit(sprint.sprintId, task.taskId)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelTaskEdit}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            ({task.priority}, {task.plannedHours} hours)
                          </span>
                          <button
                            onClick={() => handleStartTaskEdit(sprint.sprintId, task.taskId, task.priority, task.plannedHours)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                            disabled={isSubmitting || !selectedSprints.includes(sprint.sprintId)}
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
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition ${
              isSubmitting || sprints.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isSubmitting || sprints.length === 0}
          >
            {isSubmitting ? 'Creating Sprints...' : 'Create Selected Sprints'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanTasksPopup;