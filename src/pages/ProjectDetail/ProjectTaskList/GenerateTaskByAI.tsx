import React, { useState, useEffect } from 'react';
import { useGenerateAITasksMutation, useCreateTasksMutation } from '../../../services/taskApi';
import { toast } from 'react-toastify';
import type { AITaskResponseDTO, CreateTaskRequest } from '../../../services/taskApi';
import { useAuth } from '../../../services/AuthContext';
import aiIcon from '../../../assets/icon/ai.png';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';

interface GenerateTaskByAIProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  refetchWorkItems: () => void;
}

const GenerateTaskByAI: React.FC<GenerateTaskByAIProps> = ({
  isOpen,
  onClose,
  projectId,
  refetchWorkItems,
}) => {
  const { user } = useAuth();
  const [aiTasks, setAITasks] = useState<AITaskResponseDTO[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [generateAITasks, { isLoading }] = useGenerateAITasksMutation();
  const [createTasks, { isLoading: isSavingTasks }] = useCreateTasksMutation();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const canCreate = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [aiResponseJson, setAiResponseJson] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchAITasks();
    }
  }, [isOpen, projectId]);

  const fetchAITasks = async () => {
    try {
      const response = await generateAITasks(projectId).unwrap();
      setAiResponseJson(JSON.stringify(response));
      if (response.isSuccess && response.data) {
        setAITasks(response.data);
      } else {
        toast.error('Failed to generate tasks: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Error generating tasks: ' + (error as any)?.data?.message || 'Unknown error');
    }
  };

  const handleTaskSelect = (title: string) => {
    setSelectedTasks((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleSaveTasks = async () => {
    const tasksToSave: CreateTaskRequest[] = aiTasks
      .filter((task) => selectedTasks.includes(task.title))
      .map((task) => ({
        reporterId: accountId,
        projectId: task.projectId,
        epicId: task.epicId || null,
        sprintId: task.sprintId || null,
        type: task.type.toUpperCase() as 'TASK' | 'STORY' | 'BUG' | 'SUBTASK' | 'EPIC',
        title: task.title,
        description: task.description,
        priority: task.priority || 'MEDIUM',
        plannedHours: task.plannedHours || 0,
        plannedStartDate: task.plannedStartDate || new Date().toISOString(),
        plannedEndDate: task.plannedEndDate || new Date().toISOString(),
        status: task.status.replace(' ', '_').toUpperCase() as 'TO_DO' | 'IN_PROGRESS' | 'DONE',
        createdBy: accountId,
        dependencies: task.dependencies ? JSON.parse(task.dependencies) : [],
        manualInput: task.manualInput,
        generationAiInput: task.generationAiInput,
      }));

    try {
      await createTasks({ tasks: tasksToSave }).unwrap();
      setIsEvaluationPopupOpen(true);
      toast.success('Selected tasks saved successfully!');
      refetchWorkItems();
    } catch (error) {
      toast.error('Error saving tasks: ' + (error as any)?.data?.message || 'Unknown error');
    }
  };

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
    setAiResponseJson('');
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI Response ID:', aiResponseId);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'>
        <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center gap-3'>
          <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
          <h2 className='text-2xl font-bold text-white'>AI-Suggested Tasks</h2>
        </div>
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <svg
                className='animate-spin w-10 h-10 text-purple-600'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                />
              </svg>
              <p className='mt-4 text-gray-600 text-lg'>AI is generating your tasks...</p>
            </div>
          ) : aiTasks.length === 0 ? (
            <div className='text-center py-8 text-gray-500 text-lg'>
              No AI-suggested tasks available. Try again later!
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full border-separate border-spacing-0'>
                <thead className='sticky top-0 bg-gray-50 shadow-sm'>
                  <tr>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700 w-16'>
                      Select
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700 w-24'>Type</th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700'>Title</th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700'>
                      Description
                    </th>
                    <th className='p-4 text-left text-sm font-semibold text-gray-700 w-24'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aiTasks.map((task, index) => (
                    <tr
                      key={task.title}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-purple-50 transition-colors duration-200`}
                    >
                      <td className='p-4 border-b border-gray-200'>
                        <input
                          type='checkbox'
                          checked={selectedTasks.includes(task.title)}
                          onChange={() => handleTaskSelect(task.title)}
                          className='h-5 w-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer'
                        />
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {task.type}
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {task.title}
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {task.description}
                      </td>
                      <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                        {task.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'
          >
            Cancel
          </button>
          {canCreate ? (
            <button
              onClick={handleSaveTasks}
              disabled={selectedTasks.length === 0 || isSavingTasks}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 ${selectedTasks.length === 0 || isSavingTasks
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'
                }`}
            >
              {isSavingTasks ? 'Saving...' : 'Save Selected Tasks'}
            </button>
          ) : (
            <div className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'>
              Only Team Leader, Project Manager can create tasks.
            </div>
          )}
        </div>
      </div>
      {isEvaluationPopupOpen && (
        <AiResponseEvaluationPopup
          isOpen={isEvaluationPopupOpen}
          onClose={() => {
            setIsEvaluationPopupOpen(false);
            onClose(); 
          }}
          aiResponseJson={aiResponseJson}
          projectId={Number(projectId)}
          aiFeature='TASK_FROM_PROJECT_CREATION'
          onSubmitSuccess={handleEvaluationSubmitSuccess}
        />
      )}
    </div>
  );
};

export default GenerateTaskByAI;
