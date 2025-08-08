import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, Calendar, Plus } from 'lucide-react';
import { useGetTaskPlanningMutation, type TaskState } from '../../../services/aiApi';
import {
  useGetProjectDetailsByKeyQuery,
  useSendEmailToPMMutation,
} from '../../../services/projectApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useCreateEpicsWithTasksMutation, type EpicWithTaskRequestDTO } from '../../../services/epicApi';
import galaxyaiIcon from '../../../assets/galaxyai.gif';
import aiIcon from '../../../assets/icon/ai.png';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
import EpicDisplay from './EpicDisplay';
import CreateTaskPopup from './CreateTaskPopup';
import EditTaskPopup from './EditTaskPopup';
import EditEpicPopup from './EditEpicPopup';
import EditDatePopup from './EditDatePopup';
import NotifyPMConfirmPopup from './NotifyPMConfirmPopup';

interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
  backendEpicId?: string;
}

const TaskSetup: React.FC = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams<{ projectKey: string }>();
  const {
    data: projectData,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectDetailsByKeyQuery(projectKey || '', {
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

  const projectId = projectData?.data?.id;
  const {
    data: membersData,
    isLoading: isMembersLoading,
    error: membersError,
  } = useGetProjectMembersWithPositionsQuery(projectId || 0, {
    skip: !projectId,
  });
  const [createEpics, { isLoading: isCreatingEpics, error: createEpicsError }] =
    useCreateEpicsWithTasksMutation();
  const [sendEmailToPM, { isLoading: isSendingEmail, error: sendEmailError }] =
    useSendEmailToPMMutation();
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
  const [isNotifyPMConfirmOpen, setIsNotifyPMConfirmOpen] = useState(false);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    suggestedRole: 'Developer',
    assignedMembers: [],
    newEpicTitle: '',
    newEpicDescription: 'No description',
    newEpicStartDate: new Date().toISOString().split('T')[0],
    newEpicEndDate: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .split('T')[0],
  });
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleAICreate = async () => {
    if (!projectKey) {
      setErrorMessage('Project Key is missing.');
      return;
    }
    if (!projectData?.data?.id) {
      setErrorMessage('Project ID is not available.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const response = await getTaskPlanning({ projectId: projectData.data.id });
      console.log('AI API Response:', JSON.stringify(response, null, 2));
      if ('data' in response && response.data) {
        const apiEpics = response.data.data;
        const newEpics: EpicState[] = apiEpics.map((epic: any) => {
          console.log('Epic Data:', JSON.stringify(epic.data, null, 2));
          return {
            epicId: epic.data.epicId || crypto.randomUUID(),
            title: epic.data.title || 'Untitled Epic',
            description: epic.data.description || 'No description',
            startDate: new Date(epic.data.startDate).toISOString().split('T')[0],
            endDate: new Date(epic.data.endDate).toISOString().split('T')[0],
            tasks: epic.data.tasks.map((task: any) => {
              console.log('Task Data:', JSON.stringify(task, null, 2));
              const apiTaskId = task.id || task.Id || task.taskId || crypto.randomUUID();
              if (!task.id && !task.Id && !task.taskId) {
                console.warn(`Task "${task.title}" has no valid ID field (id/Id/taskId). Using UUID: ${apiTaskId}`);
              }
              return {
                id: apiTaskId,
                taskId: apiTaskId,
                title: task.title || 'Untitled Task',
                description: task.description || 'No description',
                startDate: new Date(task.startDate).toISOString().split('T')[0],
                endDate: new Date(task.endDate).toISOString().split('T')[0],
                suggestedRole: task.suggestedRole || 'Developer',
                assignedMembers: task.assignedMembers
                  ? task.assignedMembers.map((member: any) => ({
                      accountId: member.accountId,
                      fullName: member.fullName || 'Unknown Member',
                      picture: member.picture || 'https://i.pravatar.cc/40',
                    }))
                  : [],
              };
            }),
          };
        });
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
    navigate('/project/list');
  };

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
    setAiResponseJson('');
    navigate('/project/list');
  };

  const handleOpenCreateTask = () => {
    setIsCreatingTask(true);
    setNewTask({
      epicId: epics.length > 0 ? epics[0].epicId : '',
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      suggestedRole: 'Developer',
      assignedMembers: [],
      newEpicTitle: '',
      newEpicDescription: 'No description',
      newEpicStartDate: new Date().toISOString().split('T')[0],
      newEpicEndDate: new Date(new Date().setDate(new Date().getDate() + 7))
        .toISOString()
        .split('T')[0],
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
        startDate: newTask.newEpicStartDate || new Date().toISOString().split('T')[0],
        endDate:
          newTask.newEpicEndDate ||
          new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
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
          picture: selectedMember.picture || 'https://i.pravatar.cc/40',
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

  const handleSaveAndProceed = async (sendEmail: boolean = false) => {
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

    const error = validateEpics(epics);
    if (error) {
      setErrorMessage(error);
      return;
    }

    if (sendEmail) {
      setIsNotifyPMConfirmOpen(true);
    } else {
      setIsSaving(true);
      try {
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
          if (aiResponseJson) {
            setIsEvaluationPopupOpen(true);
          } else {
            navigate('/project/list');
          }
        } else {
          setSuccessMessage('No new epics to save.');
          navigate('/project/list');
        }
      } catch (error: any) {
        console.error('Error saving epics:', error);
        setErrorMessage(error.data?.message || 'Failed to save epics and tasks. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleConfirmNotifyPM = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      setIsNotifyPMConfirmOpen(false);
      return;
    }

    setIsSaving(true);
    setIsNotifyPMConfirmOpen(false);

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

      let createdEpicIds: string[] = [];
      if (requestPayload.length > 0) {
        const response = await createEpics({ projectId, data: requestPayload }).unwrap();
        console.log('Epics created:', response);
        createdEpicIds = response.data;
        setEpics((prev) =>
          prev.map((epic) => {
            const backendEpicId = response.data.find(
              (id) => !prev.some((e) => e.backendEpicId === id)
            );
            return backendEpicId && !epic.backendEpicId ? { ...epic, backendEpicId } : epic;
          })
        );
      }

      const emailResponse = await sendEmailToPM(projectId).unwrap();
      console.log('Email Response:', emailResponse);
      if (emailResponse.isSuccess) {
        setSuccessMessage(
          `Epics and tasks saved successfully, and email sent to Project Manager! Created Epic IDs: ${createdEpicIds.join(
            ', '
          )}`
        );
        if (aiResponseJson) {
          setIsEvaluationPopupOpen(true);
        } else {
          navigate('/project/list');
        }
      } else {
        setErrorMessage(emailResponse.message || 'Failed to send email to Project Manager.');
      }
    } catch (error: any) {
      console.error('Error saving epics or sending email:', error);
      setErrorMessage(
        error.data?.message || 'Failed to save epics or send email to Project Manager.'
      );
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
                              picture: selectedMember.picture || 'https://i.pravatar.cc/40',
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
  };

  const handleAIMode = () => {
    setIsGenerating(true);
    handleAICreate();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setIsMemberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isSaving || isCreatingEpics || isSendingEmail) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-50'>
        <style>
          {`
          @keyframes gradientText {
            0% { background-position: 200% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
        </style>

        <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg'>
          <span
            style={{
              background: 'linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              animation: 'gradientText 2s linear infinite',
            }}
            className='text-xl font-bold tracking-wide'
          >
            Saving your tasks...
          </span>

          <div className='flex gap-1.5'>
            <div
              className='w-3 h-3 bg-[#1c73fd] rounded-full animate-pulse'
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className='w-3 h-3 bg-[#4a90e2] rounded-full animate-pulse'
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className='w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse'
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (projectError || !projectData?.isSuccess || membersError) {
    return (
      <div className='text-center p-8 text-red-500 bg-red-50 rounded-2xl'>
        Error:{' '}
        {projectError
          ? 'Failed to fetch project details.'
          : membersError
          ? 'Failed to fetch project members.'
          : projectData?.message}
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6 bg-gray-50 rounded-3xl shadow-xl'>
      <style>
        {`
          @keyframes scale-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-scale-pulse {
            animation: scale-pulse 1.5s ease-in-out infinite;
          }
          @keyframes gradientLoading {
            0% { background-position: 200% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <h1 className='text-4xl font-extrabold text-[#1c73fd] mb-3 tracking-tight'>
        AI-Powered Task Setup
      </h1>
      <p className='text-gray-600 mb-8 text-lg font-medium leading-relaxed'>
        Streamline your project planning for{' '}
        <span className='font-semibold'>{projectData?.data?.name}</span> ({projectKey}) with
        AI-generated tasks and epics.
      </p>

      <div className='mb-8 flex gap-4'>
        <div className='flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md'>
          <button
            onClick={handleAIMode}
            className={`w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
            }`}
            disabled={isGenerating}
          >
            <div className='flex items-center gap-2'>
              <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
              <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
            </div>
          </button>
        </div>
        <div className='flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md'>
          <button
            onClick={handleOpenCreateTask}
            className='w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] hover:shadow-lg'
          >
            <Plus className='w-5 h-5' /> Create Task
          </button>
        </div>
      </div>
      {errorMessage && <p className='text-red-500 mb-4 font-medium'>{errorMessage}</p>}
      {successMessage && <p className='text-green-500 mb-4 font-medium'>{successMessage}</p>}

      <EpicDisplay
        epics={epics}
        isGenerating={isGenerating}
        membersData={membersData}
        dropdownTaskId={dropdownTaskId}
        setDropdownTaskId={setDropdownTaskId}
        handleOpenEditEpic={setEditingEpic}
        handleOpenEditPopup={setEditingTask}
        handleOpenDatePopup={setEditingDateTask}
        handleAddMember={handleAddMember}
        handleRemoveMember={handleRemoveMember}
        handleDeleteTask={handleDeleteTask}
      />

      {editingEpic && (
        <EditEpicPopup
          editingEpic={editingEpic}
          setEditingEpic={setEditingEpic}
          handleEditEpic={handleEditEpic}
        />
      )}

      {editingTask && (
        <EditTaskPopup
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          membersData={membersData}
          isMemberDropdownOpen={isMemberDropdownOpen}
          setIsMemberDropdownOpen={setIsMemberDropdownOpen}
          handleEditTask={handleEditTask}
          memberDropdownRef={memberDropdownRef}
        />
      )}

      {editingDateTask && (
        <EditDatePopup
          editingDateTask={editingDateTask}
          setEditingDateTask={setEditingDateTask}
          handleEditTask={handleEditTask}
        />
      )}

      {isCreatingTask && (
        <CreateTaskPopup
          epics={epics}
          newTask={newTask}
          setNewTask={setNewTask}
          membersData={membersData}
          isMemberDropdownOpen={isMemberDropdownOpen}
          setIsMemberDropdownOpen={setIsMemberDropdownOpen}
          handleCreateTask={handleCreateTask}
          handleAddNewTaskMember={handleAddNewTaskMember}
          handleRemoveNewTaskMember={handleRemoveNewTaskMember}
          memberDropdownRef={memberDropdownRef}
        />
      )}

      {isNotifyPMConfirmOpen && (
        <NotifyPMConfirmPopup
          handleConfirmNotifyPM={handleConfirmNotifyPM}
          setIsNotifyPMConfirmOpen={setIsNotifyPMConfirmOpen}
        />
      )}

      {isEvaluationPopupOpen && projectId && (
        <AiResponseEvaluationPopup
          isOpen={isEvaluationPopupOpen}
          onClose={handleCloseEvaluationPopup}
          aiResponseJson={aiResponseJson}
          projectId={projectId}
          aiFeature="TASK_PLANNING"
          onSubmitSuccess={handleEvaluationSubmitSuccess}
        />
      )}

      <div className='flex justify-end gap-4'>
        <button
          onClick={() => handleSaveAndProceed(false)}
          disabled={isCreatingEpics || isSendingEmail || isSaving}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            isCreatingEpics || isSendingEmail || isSaving
              ? 'bg-gray-500 opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#6b7280] to-[#4b5563] hover:from-[#4b5563] hover:to-[#374151] shadow-md hover:shadow-lg'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save & View Overview'}
        </button>
        <button
          onClick={() => handleSaveAndProceed(true)}
          disabled={isCreatingEpics || isSendingEmail || isSaving}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            isCreatingEpics || isSendingEmail || isSaving
              ? 'bg-gray-500 opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] shadow-md hover:shadow-lg'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save & Notify PM'}
        </button>
      </div>
    </div>
  );
};

export default TaskSetup;