import React, { useState } from 'react';
import { useGenerateTasksForSprintMutation, type AITaskForSprintDTO } from '../../../services/aiApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useCreateTasksMutation } from '../../../services/taskApi';
import aiIcon from '../../../assets/icon/ai.png';
import galaxyaiIcon from '../../../assets/galaxyai.gif';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';

interface GenerateTasksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: number;
  projectKey: string;
  projectId: number;
  onTaskUpdated: () => void;
}

interface User {
  id: number;
  username: string;
  fullName: string;
}

const GenerateTasksPopup: React.FC<GenerateTasksPopupProps> = ({
  isOpen,
  onClose,
  sprintId,
  projectKey,
  projectId,
  onTaskUpdated,
}) => {
  const [tasks, setTasks] = useState<AITaskForSprintDTO[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskPriority, setTaskPriority] = useState<string>('');
  const [taskPlannedHours, setTaskPlannedHours] = useState<number | ''>('');
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [evaluationPayload, setEvaluationPayload] = useState<string>('');

  const { data: priorityData, isLoading: isPriorityLoading, error: priorityError } = useGetCategoriesByGroupQuery('task_priority', { skip: !isOpen });
  const priorityOptions = priorityData?.data?.map((category) => category.name) || ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];

  const [generateTasks, { isLoading: isGenerateTasksLoading }] = useGenerateTasksForSprintMutation();
  const [createTasks] = useCreateTasksMutation();

  // Fetch user from localStorage
  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const accountId = user?.id || 0;

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateTasks({
        sprintId,
        body: { projectKey },
      }).unwrap();
      console.log('Generated tasks response:', response);
      setTasks(response.data);
      setSelectedTasks(response.data.map((task, index) => `task-${index}`));
    } catch (err: any) {
      console.error('Task generation error:', err);
      setError(err?.data?.message || 'Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskCheckboxChange = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleStartTaskEdit = (taskId: string, currentPriority: string, currentHours: number) => {
    setEditingTaskId(taskId);
    setTaskPriority(currentPriority);
    setTaskPlannedHours(currentHours);
  };

  const handleSaveTaskEdit = (taskId: string) => {
    if (taskPlannedHours === '' || taskPlannedHours < 0) {
      setError('Planned hours must be a non-negative number.');
      return;
    }
    if (!priorityOptions.includes(taskPriority)) {
      setError('Invalid priority selected.');
      return;
    }
    setTasks((prev) =>
      prev.map((task, index) =>
        `task-${index}` === taskId
          ? { ...task, priority: taskPriority, plannedHours: Number(taskPlannedHours) }
          : task
      )
    );
    setEditingTaskId(null);
    setTaskPriority('');
    setTaskPlannedHours('');
  };

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setTaskPriority('');
    setTaskPlannedHours('');
  };

  const handleSubmit = async () => {
    if (selectedTasks.length === 0) {
      setError('Please select at least one task.');
      return;
    }
    if (!accountId) {
      setError('User not logged in. Please log in to create tasks.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const selectedTasksData = tasks.filter((_, index) => selectedTasks.includes(`task-${index}`));
      const payload = {
        tasks: selectedTasksData.map((task) => ({
          projectId,
          title: task.title,
          type: task.type,
          description: task.description,
          priority: task.priority,
          plannedHours: task.plannedHours,
          sprintId,
          createdBy: accountId,
          reporterId: accountId,
          status: 'TO_DO',
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date().toISOString(),
          epicId: null,
          manualInput: false,
          generationAiInput: true,
          dependencies: [],
        })),
      };
      console.log('Submitting tasks:', payload);
      await createTasks(payload).unwrap();
      setEvaluationPayload(JSON.stringify(payload));
      setIsEvaluationPopupOpen(true);
      onTaskUpdated();
    } catch (err: any) {
      console.error('Create tasks error:', err);
      setError(err?.data?.message || 'Failed to create tasks');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[85vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-[#1c73fd] mb-6">Generate Tasks for Sprint</h2>
          {(error || priorityError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-6">
              {error || (priorityError && 'Failed to load priority options')}
            </div>
          )}
          {isGenerating || isGenerateTasksLoading ? (
            <div className="flex justify-center items-center py-10 bg-white/50 rounded-2xl shadow-md">
              <div className="flex flex-col items-center gap-4">
                <img src={galaxyaiIcon} alt="AI Processing" className="w-10 h-10 animate-pulse" />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradientLoading 1.8s ease-in-out infinite',
                  }}
                  className="text-lg font-semibold"
                >
                  Generating Tasks...
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={handleGenerateTasks}
                  className={`w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                    isGenerating || isSubmitting
                      ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
                  }`}
                  disabled={isGenerating || isSubmitting}
                >
                  <img src={aiIcon} alt="AI Icon" className="w-5 h-5 object-contain" />
                  {isGenerating ? 'Generating Tasks...' : 'Generate Tasks'}
                </button>
              </div>
              {tasks.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-5 max-h-[50vh] overflow-y-auto bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Tasks</h3>
                  {tasks.map((task, index) => (
                    <div
                      key={`task-${index}`}
                      className="mb-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(`task-${index}`)}
                          onChange={() => handleTaskCheckboxChange(`task-${index}`)}
                          className="h-5 w-5 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                        <span className="font-semibold text-gray-800">{task.title}</span>
                        <button
                          onClick={() => handleStartTaskEdit(`task-${index}`, task.priority, task.plannedHours)}
                          className="text-sm text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200"
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 ml-8 mt-2">{task.description}</p>
                      {editingTaskId === `task-${index}` && (
                        <div className="ml-8 mt-3 flex items-center gap-2">
                          <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg p-1.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]"
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
                            className="w-16 text-xs border border-gray-300 rounded-lg p-1.5 focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd]"
                          />
                          <button
                            onClick={() => handleSaveTaskEdit(`task-${index}`)}
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
                      )}
                      {!editingTaskId && (
                        <div className="ml-8 mt-2">
                          <span className="text-xs text-gray-500">
                            Priority: {task.priority}, Planned Hours: {task.plannedHours}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-300 ${
                    isSubmitting || tasks.length === 0
                      ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
                  }`}
                  disabled={isSubmitting || tasks.length === 0}
                >
                  {isSubmitting ? 'Creating Tasks...' : 'Create Selected Tasks'}
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
        aiFeature="TASK_FOR_SPRINT"
        onSubmitSuccess={handleEvaluationSubmitSuccess}
      />
    </>
  );
};

export default GenerateTasksPopup;
