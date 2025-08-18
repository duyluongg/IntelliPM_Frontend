import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetTaskPlanningMutation,
  type TaskState,
  type EpicPreviewDTO,
} from '../../../../services/aiApi';
import { useGetProjectDetailsByKeyQuery } from '../../../../services/projectApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../../services/projectMemberApi';
import {
  useCreateEpicsWithTasksMutation,
  type EpicWithTaskRequestDTO,
} from '../../../../services/epicApi';
import TaskList from './TaskList';
import TaskSetupHeader from './TaskSetupHeader';
import AiResponseEvaluationPopup from '../../../../components/AiResponse/AiResponseEvaluationPopup';
import CreateTaskPopup from '../CreateTaskPopup';
import EditTaskPopup from '../EditTaskPopup';
import EditEpicPopup from '../EditEpicPopup';
import EditDatePopup from '../EditDatePopup';

interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
  backendEpicId?: string;
}

interface Member {
  accountId: number;
  fullName: string;
  picture?: string;
}

interface ProjectFormData {
  id?: number;
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  startDate: string;
  endDate: string;
  requirements: Array<{
    id?: number;
    title: string;
    type: string;
    description: string;
    priority: string;
  }>;
  invitees: Array<{
    email: string;
    role: string;
    positions: string[];
    accountId?: number;
  }>;
  epics: Array<{
    epicId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    backendEpicId?: string;
    tasks?: Array<{
      id: string;
      taskId?: string;
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      suggestedRole: string;
      assignedMembers: Array<{
        accountId: number;
        fullName: string;
        picture: string;
      }>;
    }>;
  }>;
}

interface TaskSetupPMProps {
  projectId: number | undefined;
  projectKey: string;
  handleNext: (data?: Partial<ProjectFormData>) => Promise<void>;
}

const TaskSetupPM: React.FC<TaskSetupPMProps> = ({ projectId, projectKey, handleNext }) => {
  const navigate = useNavigate();
  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectDetailsByKeyQuery(projectKey, {
    skip: !projectKey,
  });

  const validateEpics = (epics: EpicState[]): string | null => {
    for (const epic of epics) {
      if (new Date(epic.endDate) < new Date(epic.startDate)) {
        return `Epic ${epic.title} (${
          epic.backendEpicId || epic.epicId
        }) has invalid dates: End Date must be on or after Start Date.`;
      }
      for (const task of epic.tasks) {
        if (new Date(task.endDate) < new Date(task.startDate)) {
          return `Task ${task.title} in epic ${
            epic.backendEpicId || epic.epicId
          } has invalid dates: End Date must be on or after Start Date.`;
        }
      }
    }
    return null;
  };

  const {
    data: rawMembersData,
    isLoading: isMembersLoading,
    error: membersError,
  } = useGetProjectMembersWithPositionsQuery(projectId || 0, {
    skip: !projectId,
  });

  const membersData = rawMembersData
    ? {
        data: rawMembersData.data?.map((member) => ({
          accountId: member.accountId,
          fullName: member.fullName,
          picture: member.picture ?? 'https://i.pravatar.cc/40',
          projectPositions: member.projectPositions || [],
        })),
      }
    : undefined;

  const [createEpics, { isLoading: isCreatingEpics, error: createEpicsError }] =
    useCreateEpicsWithTasksMutation();
  const [getTaskPlanning] = useGetTaskPlanningMutation();
  const [epics, setEpics] = useState<EpicState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ epicId: string; task: TaskState } | null>(null);
  const [editingDateTask, setEditingDateTask] = useState<{
    epicId: string;
    task: TaskState;
    field: 'startDate' | 'endDate';
  } | null>(null);
  const [editingEpic, setEditingEpic] = useState<EpicState | null>(null);
  const [dropdownTaskId, setDropdownTaskId] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [isNotifyPMConfirmOpen, setIsNotifyPMConfirmOpen] = useState(false);
  const [aiResponseJson, setAiResponseJson] = useState<string>('');
  const [newTask, setNewTask] = useState<{
    epicId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    suggestedRole: string;
    assignedMembers: { accountId: number; fullName: string; picture: string }[];
    newEpicTitle?: string;
    newEpicDescription?: string;
    newEpicStartDate?: string;
    newEpicEndDate?: string;
  }>({
    epicId: '',
    title: '',
    description: '',
    startDate: '2025-08-13',
    endDate: '2025-08-13',
    suggestedRole: 'Developer',
    assignedMembers: [],
    newEpicTitle: '',
    newEpicDescription: 'No description',
    newEpicStartDate: '2025-08-13',
    newEpicEndDate: '2025-08-20',
  });
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleAICreate = async () => {
    if (!projectKey) {
      setErrorMessage('Project Key is missing.');
      return;
    }
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const response = await getTaskPlanning({ projectId });
      console.log('AI API Response:', JSON.stringify(response, null, 2));
      if ('data' in response && response.data) {
        const apiEpics = response.data.data;
        const newEpics: EpicState[] = apiEpics.map((epic: any) => ({
          epicId: epic.data.epicId || crypto.randomUUID(),
          title: epic.data.title || 'Untitled Epic',
          description: epic.data.description || 'No description',
          startDate: new Date(epic.data.startDate || '2025-08-13').toISOString().split('T')[0],
          endDate: new Date(epic.data.endDate || '2025-08-20').toISOString().split('T')[0],
          tasks: epic.data.tasks.map((task: any) => {
            const apiTaskId = task.id || task.Id || task.taskId || crypto.randomUUID();
            return {
              id: apiTaskId,
              taskId: apiTaskId,
              title: task.title || 'Untitled Task',
              description: task.description || 'No description',
              startDate: new Date(task.startDate || '2025-08-13').toISOString().split('T')[0],
              endDate: new Date(task.endDate || '2025-08-13').toISOString().split('T')[0],
              suggestedRole: task.suggestedRole || 'Developer',
              assignedMembers: task.assignedMembers
                ? task.assignedMembers.map((member: any) => ({
                    accountId: member.accountId,
                    fullName: member.fullName || 'Unknown Member',
                    picture: member.picture ?? 'https://i.pravatar.cc/40',
                  }))
                : [],
            };
          }),
        }));
        setEpics((prev) => [...prev, ...newEpics]);
        setAiResponseJson(JSON.stringify(response.data));
      } else if ('error' in response) {
        console.error('API Error:', response.error);
        setErrorMessage('Failed to generate tasks. Please check the console for details.');
      }
    } catch (error) {
      console.error('AI Task Generation Error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI Response ID:', aiResponseId);
    handleNext({ epics });
  };

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
    setAiResponseJson('');
    handleNext({ epics });
  };

  const handleConfirmNotifyPM = () => {
    setIsNotifyPMConfirmOpen(false);
    console.log('Notify PM confirmed');
  };

  const handleOpenCreateTask = () => {
    setIsCreatingTask(true);
    setNewTask({
      epicId: epics.length > 0 ? epics[0].epicId : '',
      title: '',
      description: '',
      startDate: '2025-08-13',
      endDate: '2025-08-13',
      suggestedRole: 'Developer',
      assignedMembers: [],
      newEpicTitle: '',
      newEpicDescription: 'No description',
      newEpicStartDate: '2025-08-13',
      newEpicEndDate: '2025-08-20',
    });
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    if (
      newTask.startDate &&
      newTask.endDate &&
      new Date(newTask.endDate) < new Date(newTask.startDate)
    ) {
      alert('Task End Date must be on or after Start Date');
      return;
    }
    if (
      epics.length === 0 &&
      (!newTask.newEpicTitle || !newTask.newEpicStartDate || !newTask.newEpicEndDate)
    ) {
      alert('New epic requires title, start date, and end date');
      return;
    }
    if (
      newTask.newEpicEndDate &&
      newTask.newEpicStartDate &&
      new Date(newTask.newEpicEndDate) < new Date(newTask.newEpicStartDate)
    ) {
      alert('Epic End Date must be on or after Epic Start Date');
      return;
    }

    const task: TaskState = {
      id: crypto.randomUUID(),
      taskId: '',
      title: newTask.title,
      description: newTask.description || 'No description',
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      suggestedRole: newTask.suggestedRole,
      assignedMembers: newTask.assignedMembers,
    };

    if (epics.length === 0) {
      const newEpic: EpicState = {
        epicId: crypto.randomUUID(),
        title: newTask.newEpicTitle || 'New Epic',
        description: newTask.newEpicDescription || 'No description',
        startDate: newTask.newEpicStartDate || '2025-08-13',
        endDate: newTask.newEpicEndDate || '2025-08-20',
        tasks: [task],
      };
      setEpics([newEpic]);
    } else {
      setEpics((prev) =>
        prev.map((epic) =>
          epic.epicId === newTask.epicId ? { ...epic, tasks: [...epic.tasks, task] } : epic
        )
      );
    }
    setIsCreatingTask(false);
    setIsMemberDropdownOpen(false);
  };

  const handleAddNewTaskMember = (accountId: number) => {
    const selectedMember = membersData?.data?.find((member) => member.accountId === accountId);
    if (!selectedMember) return;
    if (newTask.assignedMembers.some((m) => m.accountId === selectedMember.accountId)) return;

    setNewTask({
      ...newTask,
      assignedMembers: [
        ...newTask.assignedMembers,
        {
          accountId: selectedMember.accountId,
          fullName: selectedMember.fullName,
          picture: selectedMember.picture,
        },
      ],
    });
    setIsMemberDropdownOpen(false);
  };

  const handleRemoveNewTaskMember = (accountId: number) => {
    setNewTask({
      ...newTask,
      assignedMembers: newTask.assignedMembers.filter((member) => member.accountId !== accountId),
    });
  };

  const handleSaveAndProceed = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    if (epics.length === 0) {
      setErrorMessage('No epics to save.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const error = validateEpics(epics);
      if (error) {
        setErrorMessage(error);
        return;
      }

      const requestPayload: EpicWithTaskRequestDTO[] = epics
        .filter((epic) => !epic.backendEpicId)
        .map((epic) => ({
          title: epic.title,
          description: epic.description,
          startDate: new Date(epic.startDate).toISOString(),
          endDate: new Date(epic.endDate).toISOString(),
          tasks: epic.tasks.map((task) => ({
            title: task.title,
            description: task.description,
            startDate: new Date(task.startDate).toISOString(),
            endDate: new Date(task.endDate).toISOString(),
            suggestedRole: task.suggestedRole,
            assignedMembers: task.assignedMembers,
          })),
        }));

      if (requestPayload.length > 0) {
        const response = await createEpics({ projectId, data: requestPayload }).unwrap();
        console.log('Epics created:', response);
        setEpics((prev) =>
          prev.map((epic) => {
            const backendEpicId = response.data.find(
              (id) => !prev.some((e) => e.backendEpicId === id)
            );
            return backendEpicId && !epic.backendEpicId ? { ...epic, backendEpicId } : epic;
          })
        );
        setSuccessMessage('Epics and tasks saved successfully!');
      } else {
        setSuccessMessage('No new epics to save.');
      }
      setIsEvaluationPopupOpen(true);
    } catch (error: any) {
      console.error('Error saving epics:', error);
      setErrorMessage(error.data?.message || 'Failed to save epics and tasks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditEpic = () => {
    if (!editingEpic) return;
    if (!editingEpic.title.trim()) {
      alert('Epic title is required');
      return;
    }
    if (
      editingEpic.startDate &&
      editingEpic.endDate &&
      new Date(editingEpic.endDate) < new Date(editingEpic.startDate)
    ) {
      alert('Epic End Date must be on or after Epic Start Date');
      return;
    }
    setEpics((prev) =>
      prev.map((epic) =>
        epic.epicId === editingEpic.epicId
          ? {
              ...epic,
              title: editingEpic.title,
              description: editingEpic.description || 'No description',
              startDate: editingEpic.startDate,
              endDate: editingEpic.endDate,
            }
          : epic
      )
    );
    setEditingEpic(null);
  };

  const handleEditTask = (epicId: string, taskId: string, updatedTask: Partial<TaskState>) => {
    if (
      updatedTask.endDate &&
      updatedTask.startDate &&
      new Date(updatedTask.endDate) < new Date(updatedTask.startDate)
    ) {
      alert('Task End Date must be on or after Start Date');
      return;
    }
    setEpics((prev) =>
      prev.map((epic) =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedTask } : task
              ),
            }
          : epic
      )
    );
    setEditingTask(null);
    setEditingDateTask(null);
  };

  const handleDeleteTask = (epicId: string, taskId: string) => {
    setEpics((prev) =>
      prev
        .map((epic) =>
          epic.epicId === epicId
            ? { ...epic, tasks: epic.tasks.filter((task) => task.id !== taskId) }
            : epic
        )
        .filter((epic) => epic.tasks.length > 0)
    );
    setDropdownTaskId(null);
  };

  const handleAddMember = (epicId: string, taskId: string, accountId: number) => {
    const selectedMember = membersData?.data?.find((member) => member.accountId === accountId);
    if (!selectedMember) return;

    setEpics((prev) =>
      prev.map((epic) =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      assignedMembers: task.assignedMembers.some(
                        (m) => m.accountId === selectedMember.accountId
                      )
                        ? task.assignedMembers
                        : [
                            ...task.assignedMembers,
                            {
                              accountId: selectedMember.accountId,
                              fullName: selectedMember.fullName,
                              picture: selectedMember.picture,
                            },
                          ],
                    }
                  : task
              ),
            }
          : epic
      )
    );
    setDropdownTaskId(null);
  };

  const handleRemoveMember = (epicId: string, taskId: string, accountId: number) => {
    setEpics((prev) =>
      prev.map((epic) =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      assignedMembers: task.assignedMembers.filter(
                        (member) => member.accountId !== accountId
                      ),
                    }
                  : task
              ),
            }
          : epic
      )
    );
    setDropdownTaskId(null);
  };

  const onEpicsGenerated = (newEpics: EpicPreviewDTO[]) => {
    const formattedEpics: EpicState[] = newEpics.map((epic) => ({
      epicId: crypto.randomUUID(),
      title: epic.title || 'Untitled Epic',
      description: epic.description || 'No description',
      startDate: epic.startDate || '2025-08-13',
      endDate: epic.endDate || '2025-08-20',
      tasks: [],
    }));
    setEpics((prev) => [...prev, ...formattedEpics]);
  };

  const existingEpicTitles = epics.map((epic) => epic.title);

  return (
    <div className='w-full max-w-7xl mx-auto p-6'>
      {errorMessage && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg'>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className='mb-4 p-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg'>
          {successMessage}
        </div>
      )}
      <TaskSetupHeader
        projectData={projectData ?? { data: { name: '' } }}
        projectKey={projectKey}
        isGenerating={isGenerating}
        handleAIMode={handleAICreate}
        handleOpenCreateTask={handleOpenCreateTask}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
      <TaskList
        epics={epics}
        membersData={membersData}
        isGenerating={isGenerating}
        editingEpic={editingEpic}
        setEditingEpic={setEditingEpic}
        handleEditEpic={handleEditEpic}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        editingDateTask={editingDateTask}
        setEditingDateTask={setEditingDateTask}
        handleEditTask={handleEditTask}
        handleDeleteTask={handleDeleteTask}
        dropdownTaskId={dropdownTaskId}
        setDropdownTaskId={setDropdownTaskId}
        handleAddMember={handleAddMember}
        handleRemoveMember={handleRemoveMember}
        isCreatingTask={isCreatingTask}
        newTask={newTask}
        setNewTask={setNewTask}
        isMemberDropdownOpen={isMemberDropdownOpen}
        setIsMemberDropdownOpen={setIsMemberDropdownOpen}
        handleCreateTask={handleCreateTask}
        handleAddNewTaskMember={handleAddNewTaskMember}
        handleRemoveNewTaskMember={handleRemoveNewTaskMember}
        memberDropdownRef={memberDropdownRef}
        isNotifyPMConfirmOpen={isNotifyPMConfirmOpen}
        setIsNotifyPMConfirmOpen={setIsNotifyPMConfirmOpen}
        handleConfirmNotifyPM={handleConfirmNotifyPM}
        isEvaluationPopupOpen={isEvaluationPopupOpen}
        handleCloseEvaluationPopup={handleCloseEvaluationPopup}
        aiResponseJson={aiResponseJson}
        projectId={projectId}
        handleEvaluationSubmitSuccess={handleEvaluationSubmitSuccess}
        projectKey={projectKey}
        existingEpicTitles={existingEpicTitles}
        onEpicsGenerated={onEpicsGenerated}
      />
      <div className='flex justify-end mt-6'>
        <button
          onClick={handleSaveAndProceed}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
            isSaving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-[#1a68e0] hover:to-[#3e7ed1]'
          }`}
          disabled={isSaving}
        >
          <span>{isSaving ? 'Saving...' : 'Next'}</span>
        </button>
      </div>
      {isEvaluationPopupOpen && projectId && (
        <AiResponseEvaluationPopup
          isOpen={isEvaluationPopupOpen}
          onClose={handleCloseEvaluationPopup}
          aiResponseJson={aiResponseJson}
          projectId={projectId}
          aiFeature='TASK_PLANNING'
          onSubmitSuccess={handleEvaluationSubmitSuccess}
        />
      )}
    </div>
  );
};

export default TaskSetupPM;
