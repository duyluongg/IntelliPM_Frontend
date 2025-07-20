import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Brain, X, Plus, Minus, Calendar } from 'lucide-react';
import { useGetTaskPlanningMutation, type TaskState } from '../../../services/aiApi';
import { useGetProjectDetailsByKeyQuery, useSendEmailToPMMutation } from '../../../services/projectApi';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useCreateEpicWithTasksMutation } from '../../../services/epicApi';
import { type EpicWithTaskRequestDTO } from '../../../services/epicApi';
import galaxyaiIcon from '../../../assets/galaxyai.gif';

interface EpicState {
  epicId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskState[];
}

const TaskSetup: React.FC = () => {
  const navigate = useNavigate();
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useGetProjectDetailsByKeyQuery(projectKey || '', {
    skip: !projectKey,
  });
  const projectId = projectData?.data?.id;
  const { data: membersData, isLoading: isMembersLoading, error: membersError } = useGetProjectMembersWithPositionsQuery(projectId || 0, {
    skip: !projectId,
  });
  const [createEpic, { isLoading: isCreatingEpic, error: createEpicError }] = useCreateEpicWithTasksMutation();
  const [sendEmailToPM, { isLoading: isSendingEmail, error: sendEmailError }] = useSendEmailToPMMutation();
  const [epics, setEpics] = useState<EpicState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [getTaskPlanning] = useGetTaskPlanningMutation();
  const [editingTask, setEditingTask] = useState<{ epicId: string; task: TaskState } | null>(null);
  const [editingDateTask, setEditingDateTask] = useState<{ epicId: string; task: TaskState; field: 'startDate' | 'endDate' } | null>(null);
  const [editingEpic, setEditingEpic] = useState<EpicState | null>(null);
  const [dropdownTaskId, setDropdownTaskId] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isNotifyPMConfirmOpen, setIsNotifyPMConfirmOpen] = useState(false);
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
    newEpicEndDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
  });
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

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
      console.log('AI API Response:', response);
      if ('data' in response && response.data) {
        const apiEpics = response.data.data;
        const newEpics: EpicState[] = apiEpics.map((epic: any) => ({
          epicId: epic.data.epicId,
          title: epic.data.title,
          description: epic.data.description || 'No description',
          startDate: new Date(epic.data.startDate).toISOString().split('T')[0],
          endDate: new Date(epic.data.endDate).toISOString().split('T')[0],
          tasks: epic.data.tasks.map((task: any) => ({
            id: crypto.randomUUID(),
            taskId: task.taskId,
            title: task.title,
            description: task.description || 'No description',
            startDate: new Date(task.startDate).toISOString().split('T')[0],
            endDate: new Date(task.endDate).toISOString().split('T')[0],
            suggestedRole: task.suggestedRole,
            assignedMembers: task.assignedMembers.map((member: any) => ({
              accountId: member.accountId,
              fullName: member.fullName,
              picture: member.picture,
            })),
          })),
        }));
        const delayedEpics: EpicState[] = [];
        for (const epic of newEpics) {
          await new Promise(resolve => setTimeout(resolve, 40));
          delayedEpics.push(epic);
        }
        setEpics(prev => [...prev, ...delayedEpics]);
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
      newEpicEndDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    });
  };

  const handleCloseCreateTask = () => {
    setIsCreatingTask(false);
    setIsMemberDropdownOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    if (newTask.startDate && newTask.endDate && new Date(newTask.endDate) < new Date(newTask.startDate)) {
      alert('Task End Date must be on or after Start Date');
      return;
    }
    if (epics.length === 0 && (!newTask.newEpicTitle || !newTask.newEpicStartDate || !newTask.newEpicEndDate)) {
      alert('New epic requires title, start date, and end date');
      return;
    }
    if (newTask.newEpicEndDate && newTask.newEpicStartDate && new Date(newTask.newEpicEndDate) < new Date(newTask.newEpicStartDate)) {
      alert('Epic End Date must be on or after Epic Start Date');
      return;
    }

    const task: TaskState = {
      id: crypto.randomUUID(),
      taskId: `TASK-${Math.random().toString(36).substr(2, 9)}`,
      title: newTask.title,
      description: newTask.description || 'No description',
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      suggestedRole: newTask.suggestedRole,
      assignedMembers: newTask.assignedMembers,
    };

    if (epics.length === 0) {
      const newEpic: EpicState = {
        epicId: `EPIC-${Math.random().toString(36).substr(2, 9)}`,
        title: newTask.newEpicTitle || 'New Epic',
        description: newTask.newEpicDescription || 'No description',
        startDate: newTask.newEpicStartDate || new Date().toISOString().split('T')[0],
        endDate: newTask.newEpicEndDate || new Date().toISOString().split('T')[0],
        tasks: [task],
      };
      setEpics([newEpic]);
    } else {
      setEpics(prev =>
        prev.map(epic =>
          epic.epicId === newTask.epicId
            ? { ...epic, tasks: [...epic.tasks, task] }
            : epic
        )
      );
    }
    handleCloseCreateTask();
  };

  const handleAddNewTaskMember = (accountId: number) => {
    const selectedMember = membersData?.data?.find(member => member.accountId === accountId);
    if (!selectedMember) return;
    if (newTask.assignedMembers.some(m => m.accountId === selectedMember.accountId)) return;

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
      assignedMembers: newTask.assignedMembers.filter(member => member.accountId !== accountId),
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

    if (sendEmail) {
      setIsNotifyPMConfirmOpen(true);
    } else {
      try {
        for (const epic of epics) {
          if (new Date(epic.endDate) < new Date(epic.startDate)) {
            setErrorMessage(`Epic ${epic.title} (${epic.epicId}) has invalid dates: End Date must be on or after Start Date.`);
            return;
          }
          for (const task of epic.tasks) {
            if (new Date(task.endDate) < new Date(task.startDate)) {
              setErrorMessage(`Task ${task.title} (${task.taskId}) in epic ${epic.epicId} has invalid dates: End Date must be on or after Start Date.`);
              return;
            }
          }

          const requestPayload: EpicWithTaskRequestDTO = {
            epicId: epic.epicId,
            title: epic.title,
            description: epic.description,
            startDate: new Date(epic.startDate).toISOString(),
            endDate: new Date(epic.endDate).toISOString(),
            tasks: epic.tasks.map(task => ({
              id: task.id,
              taskId: task.taskId,
              title: task.title,
              description: task.description,
              startDate: new Date(task.startDate).toISOString(),
              endDate: new Date(task.endDate).toISOString(),
              suggestedRole: task.suggestedRole,
              assignedMembers: task.assignedMembers,
            })),
          };

          const response = await createEpic({ projectId, data: requestPayload }).unwrap();
          console.log(`Epic ${epic.epicId} created:`, response);
        }
        setSuccessMessage('Epics and tasks saved successfully!');
        setTimeout(() => navigate(''), 1000);
      } catch (error: any) {
        console.error('Error saving epics:', error);
        setErrorMessage(error.data?.message || 'Failed to save epics and tasks. Please try again.');
      }
    }
  };

  const handleConfirmNotifyPM = async () => {
    if (!projectId) {
      setErrorMessage('Project ID is not available.');
      setIsNotifyPMConfirmOpen(false);
      return;
    }

    try {
      for (const epic of epics) {
        if (new Date(epic.endDate) < new Date(epic.startDate)) {
          setErrorMessage(`Epic ${epic.title} (${epic.epicId}) has invalid dates: End Date must be on or after Start Date.`);
          setIsNotifyPMConfirmOpen(false);
          return;
        }
        for (const task of epic.tasks) {
          if (new Date(task.endDate) < new Date(task.startDate)) {
            setErrorMessage(`Task ${task.title} (${task.taskId}) in epic ${epic.epicId} has invalid dates: End Date must be on or after Start Date.`);
            setIsNotifyPMConfirmOpen(false);
            return;
          }
        }

        const requestPayload: EpicWithTaskRequestDTO = {
          epicId: epic.epicId,
          title: epic.title,
          description: epic.description,
          startDate: new Date(epic.startDate).toISOString(),
          endDate: new Date(epic.endDate).toISOString(),
          tasks: epic.tasks.map(task => ({
            id: task.id,
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            startDate: new Date(task.startDate).toISOString(),
            endDate: new Date(task.endDate).toISOString(),
            suggestedRole: task.suggestedRole,
            assignedMembers: task.assignedMembers,
          })),
        };

        const response = await createEpic({ projectId, data: requestPayload }).unwrap();
        console.log(`Epic ${epic.epicId} created:`, response);
      }

      const emailResponse = await sendEmailToPM(projectId).unwrap();
      if (emailResponse.isSuccess) {
        setSuccessMessage('Epics and tasks saved successfully, and email sent to Project Manager!');
      } else {
        setErrorMessage(emailResponse.message || 'Failed to send email to Project Manager.');
      }
    } catch (error: any) {
      console.error('Error saving epics or sending email:', error);
      setErrorMessage(error.data?.message || 'Failed to save epics or send email to Project Manager.');
    } finally {
      setIsNotifyPMConfirmOpen(false);
      setTimeout(() => navigate('/project-overview'), 1000);
    }
  };

  const handleCloseNotifyPMConfirm = () => {
    setIsNotifyPMConfirmOpen(false);
  };

  const handleOpenEditPopup = (epicId: string, task: TaskState) => {
    setEditingTask({ epicId, task });
    setDropdownTaskId(null);
  };

  const handleCloseEditPopup = () => {
    setEditingTask(null);
  };

  const handleOpenDatePopup = (epicId: string, task: TaskState, field: 'startDate' | 'endDate') => {
    setEditingDateTask({ epicId, task, field });
    setDropdownTaskId(null);
  };

  const handleCloseDatePopup = () => {
    setEditingDateTask(null);
  };

  const handleOpenEditEpic = (epic: EpicState) => {
    setEditingEpic(epic);
  };

  const handleCloseEditEpic = () => {
    setEditingEpic(null);
  };

  const handleEditEpic = () => {
    if (!editingEpic) return;
    if (!editingEpic.title.trim()) {
      alert('Epic title is required');
      return;
    }
    if (editingEpic.startDate && editingEpic.endDate && new Date(editingEpic.endDate) < new Date(editingEpic.startDate)) {
      alert('Epic End Date must be on or after Epic Start Date');
      return;
    }
    setEpics(prev =>
      prev.map(epic =>
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
    handleCloseEditEpic();
  };

  const handleEditTask = (epicId: string, taskId: string, updatedTask: Partial<TaskState>) => {
    if (updatedTask.endDate && updatedTask.startDate && new Date(updatedTask.endDate) < new Date(updatedTask.startDate)) {
      alert('Task End Date must be on or after Start Date');
      return;
    }
    setEpics(prev =>
      prev.map(epic =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId ? { ...task, ...updatedTask } : task
              ),
            }
          : epic
      )
    );
    if (editingTask) handleCloseEditPopup();
    if (editingDateTask) handleCloseDatePopup();
  };

  const handleDeleteTask = (epicId: string, taskId: string) => {
    setEpics(prev =>
      prev
        .map(epic =>
          epic.epicId === epicId
            ? { ...epic, tasks: epic.tasks.filter(task => task.id !== taskId) }
            : epic
        )
        .filter(epic => epic.tasks.length > 0)
    );
    setDropdownTaskId(null);
  };

  const handleAddMember = (epicId: string, taskId: string, accountId: number) => {
    const selectedMember = membersData?.data?.find(member => member.accountId === accountId);
    if (!selectedMember) return;

    setEpics(prev =>
      prev.map(epic =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      assignedMembers: task.assignedMembers.some(m => m.accountId === selectedMember.accountId)
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
    setEpics(prev =>
      prev.map(epic =>
        epic.epicId === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      assignedMembers: task.assignedMembers.filter(member => member.accountId !== accountId),
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

  if (isProjectLoading || isMembersLoading || isCreatingEpic || isSendingEmail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#1c73fd]"></div>
      </div>
    );
  }

  if (projectError || !projectData?.isSuccess || membersError) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-2xl">
        Error: {projectError
          ? 'Failed to fetch project details.'
          : membersError
          ? 'Failed to fetch project members.'
          : projectData?.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-3xl shadow-xl">
      <style>
        {`
          @keyframes scale-pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          .animate-scale-pulse {
            animation: scale-pulse 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <h1 className="text-4xl font-extrabold text-[#1c73fd] mb-3 tracking-tight">AI-Powered Task Setup</h1>
      <p className="text-gray-600 mb-8 text-lg font-medium leading-relaxed">
        Streamline your project planning for <span className="font-semibold">{projectData?.data?.name}</span> ({projectKey}) with AI-generated tasks and epics.
      </p>

      <div className="mb-8 flex gap-4">
        <div className="flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md">
          <button
            onClick={handleAIMode}
            className={`w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform ${
              isGenerating
                ? 'bg-gray-500 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:scale-105 hover:shadow-lg'
            }`}
            disabled={isGenerating}
          >
            <Brain className="w-5 h-5" /> {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <div className="flex-1 p-1 rounded-2xl bg-gradient-to-r from-[#ff6b6b] via-[#4a90e2] to-[#1c73fd] shadow-md">
          <button
            onClick={handleOpenCreateTask}
            className="w-full px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:scale-105 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" /> Create Task
          </button>
        </div>
      </div>
      {errorMessage && <p className="text-red-500 mb-4 font-medium">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mb-4 font-medium">{successMessage}</p>}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">Epics & Tasks</h2>
        {epics.length === 0 ? (
          isGenerating ? (
            <div className="flex justify-center items-center py-8 bg-white/50 rounded-2xl shadow-md">
              <div className="flex flex-col items-center gap-4">
                <Brain className="w-8 h-8 text-[#1c73fd] animate-scale-pulse" />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#1c73fd] to-[#4a90e2]">
                    Processing with AI
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-[#1c73fd] rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-[#1c73fd] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-[#1c73fd] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No epics or tasks generated yet. Click "Generate with AI" or "Create Task" to start.</p>
          )
        ) : (
          epics.map(epic => (
            <div key={epic.epicId} className="mb-8">
              <div className="bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] p-5 rounded-2xl text-white shadow-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{epic.title} <span className="text-sm font-normal">({epic.epicId})</span></h3>
                  <p className="text-sm mt-2 font-light">{epic.description}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(epic.startDate).toLocaleDateString('en-GB')}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(epic.endDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEditEpic(epic)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                {epic.tasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white border border-gray-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <h4 className="font-semibold text-lg text-[#1c73fd] mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Task ID:</span> {task.taskId}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Description:</span> {task.description}
                    </p>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Start Date: </span>
                      <span
                        onClick={() => handleOpenDatePopup(epic.epicId, task, 'startDate')}
                        className="inline-flex items-center gap-1 cursor-pointer text-[#1c73fd] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors duration-200"
                      >
                        <Calendar className="w-4 h-4" /> {new Date(task.startDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">End Date: </span>
                      <span
                        onClick={() => handleOpenDatePopup(epic.epicId, task, 'endDate')}
                        className="inline-flex items-center gap-1 cursor-pointer text-[#1c73fd] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors duration-200"
                      >
                        <Calendar className="w-4 h-4" /> {new Date(task.endDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Suggested Role:</span> {task.suggestedRole}
                    </p>
                    <div className="relative">
                      <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                        <span className="font-medium">Assigned Members:</span>
                        <button
                          onClick={() => setDropdownTaskId(dropdownTaskId === task.id ? null : task.id)}
                          className="text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {dropdownTaskId === task.id && (
                        <div className="absolute z-10 top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto transition-all duration-200">
                          <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
                            Select Members
                          </div>
                          {membersData?.data?.map(member => {
                            const isAssigned = task.assignedMembers.some(m => m.accountId === member.accountId);
                            return (
                              <div
                                key={member.accountId}
                                className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                                  isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                onClick={() => !isAssigned && handleAddMember(epic.epicId, task.id, member.accountId)}
                              >
                                <img
                                  src={member.picture || 'https://i.pravatar.cc/40'}
                                  alt={member.fullName}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                                />
                                <span className="truncate">{member.fullName} ({member.projectPositions[0]?.position || 'No Position'})</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {task.assignedMembers.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No members assigned</p>
                      ) : (
                        task.assignedMembers.map(member => (
                          <div key={member.accountId} className="flex items-center gap-2 relative group">
                            <button
                              onClick={() => handleRemoveMember(epic.epicId, task.id, member.accountId)}
                              className="absolute -top-1 -left-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <img
                              src={member.picture}
                              alt={member.fullName}
                              className="w-7 h-7 rounded-full object-cover"
                              onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                            />
                            <span className="text-sm text-gray-600 truncate">{member.fullName}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditPopup(epic.epicId, task)}
                        className="p-2 text-[#1c73fd] hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(epic.epicId, task.id)}
                        className="p-2 text-[#1c73fd] hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {editingEpic && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Edit Epic</h3>
              <button
                onClick={handleCloseEditEpic}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Epic Title</label>
                <input
                  type="text"
                  value={editingEpic.title}
                  onChange={(e) => setEditingEpic({ ...editingEpic, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Epic Description</label>
                <textarea
                  value={editingEpic.description}
                  onChange={(e) => setEditingEpic({ ...editingEpic, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editingEpic.startDate}
                  onChange={(e) => setEditingEpic({ ...editingEpic, startDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={editingEpic.endDate}
                  onChange={(e) => setEditingEpic({ ...editingEpic, endDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseEditEpic}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditEpic}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Edit Task</h3>
              <button
                onClick={handleCloseEditPopup}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={editingTask.task.title}
                  onChange={(e) => setEditingTask({ ...editingTask, task: { ...editingTask.task, title: e.target.value } })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={editingTask.task.description}
                  onChange={(e) => setEditingTask({ ...editingTask, task: { ...editingTask.task, description: e.target.value } })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Suggested Role</label>
                <select
                  defaultValue={editingTask.task.suggestedRole}
                  onChange={(e) => setEditingTask({ ...editingTask, task: { ...editingTask.task, suggestedRole: e.target.value } })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                >
                  <option value="Designer">Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="Tester">Tester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Members</label>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                      className="text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {isMemberDropdownOpen && (
                    <div ref={memberDropdownRef} className="absolute z-10 top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto transition-all duration-200">
                      <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
                        Select Members
                      </div>
                      {membersData?.data?.map(member => {
                        const isAssigned = editingTask.task.assignedMembers.some(m => m.accountId === member.accountId);
                        return (
                          <div
                            key={member.accountId}
                            className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                              isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            onClick={() => {
                              if (!isAssigned) {
                                setEditingTask({
                                  ...editingTask,
                                  task: {
                                    ...editingTask.task,
                                    assignedMembers: [
                                      ...editingTask.task.assignedMembers,
                                      {
                                        accountId: member.accountId,
                                        fullName: member.fullName,
                                        picture: member.picture || 'https://i.pravatar.cc/40',
                                      },
                                    ],
                                  },
                                });
                                setIsMemberDropdownOpen(false);
                              }
                            }}
                          >
                            <img
                              src={member.picture || 'https://i.pravatar.cc/40'}
                              alt={member.fullName}
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                            />
                            <span className="truncate">{member.fullName} ({member.projectPositions[0]?.position || 'No Position'})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {editingTask.task.assignedMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No members assigned</p>
                  ) : (
                    editingTask.task.assignedMembers.map(member => (
                      <div key={member.accountId} className="flex items-center gap-2 relative group">
                        <button
                          onClick={() => {
                            setEditingTask({
                              ...editingTask,
                              task: {
                                ...editingTask.task,
                                assignedMembers: editingTask.task.assignedMembers.filter(m => m.accountId !== member.accountId),
                              },
                            });
                          }}
                          className="absolute -top-1 -left-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <img
                          src={member.picture}
                          alt={member.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                        />
                        <span className="text-sm text-gray-600 truncate">{member.fullName}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseEditPopup}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditTask(editingTask.epicId, editingTask.task.id, editingTask.task)}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingDateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">
                Edit {editingDateTask.field === 'startDate' ? 'Start Date' : 'End Date'}
              </h3>
              <button
                onClick={handleCloseDatePopup}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {editingDateTask.field === 'startDate' ? 'Start Date' : 'End Date'}
                </label>
                <input
                  type="date"
                  defaultValue={editingDateTask.task[editingDateTask.field]}
                  onChange={(e) =>
                    setEditingDateTask({
                      ...editingDateTask,
                      task: { ...editingDateTask.task, [editingDateTask.field]: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDatePopup}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleEditTask(editingDateTask.epicId, editingDateTask.task.id, {
                    [editingDateTask.field]: editingDateTask.task[editingDateTask.field],
                  })
                }
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreatingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Create Task</h3>
              <button
                onClick={handleCloseCreateTask}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {epics.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Epic</label>
                  <select
                    value={newTask.epicId}
                    onChange={(e) => setNewTask({ ...newTask, epicId: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                  >
                    <option value="">Select an Epic</option>
                    {epics.map(epic => (
                      <option key={epic.epicId} value={epic.epicId}>
                        {epic.title} ({epic.epicId})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Epic Title</label>
                    <input
                      type="text"
                      value={newTask.newEpicTitle}
                      onChange={(e) => setNewTask({ ...newTask, newEpicTitle: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Epic Description</label>
                    <textarea
                      value={newTask.newEpicDescription}
                      onChange={(e) => setNewTask({ ...newTask, newEpicDescription: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Epic Start Date</label>
                    <input
                      type="date"
                      value={newTask.newEpicStartDate}
                      onChange={(e) => setNewTask({ ...newTask, newEpicStartDate: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Epic End Date</label>
                    <input
                      type="date"
                      value={newTask.newEpicEndDate}
                      onChange={(e) => setNewTask({ ...newTask, newEpicEndDate: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Task Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Suggested Role</label>
                <select
                  value={newTask.suggestedRole}
                  onChange={(e) => setNewTask({ ...newTask, suggestedRole: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                >
                  <option value="Designer">Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="Tester">Tester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned Members</label>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                      className="text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {isMemberDropdownOpen && (
                    <div ref={memberDropdownRef} className="absolute z-10 top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto transition-all duration-200">
                      <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
                        Select Members
                      </div>
                      {membersData?.data?.map(member => {
                        const isAssigned = newTask.assignedMembers.some(m => m.accountId === member.accountId);
                        return (
                          <div
                            key={member.accountId}
                            className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                              isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            onClick={() => !isAssigned && handleAddNewTaskMember(member.accountId)}
                          >
                            <img
                              src={member.picture || 'https://i.pravatar.cc/40'}
                              alt={member.fullName}
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                            />
                            <span className="truncate">{member.fullName} ({member.projectPositions[0]?.position || 'No Position'})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {newTask.assignedMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No members assigned</p>
                  ) : (
                    newTask.assignedMembers.map(member => (
                      <div key={member.accountId} className="flex items-center gap-2 relative group">
                        <button
                          onClick={() => handleRemoveNewTaskMember(member.accountId)}
                          className="absolute -top-1 -left-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <img
                          src={member.picture}
                          alt={member.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://i.pravatar.cc/40'; }}
                        />
                        <span className="text-sm text-gray-600 truncate">{member.fullName}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseCreateTask}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotifyPMConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1c73fd]">Confirm Notification</h3>
              <button
                onClick={handleCloseNotifyPMConfirm}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save and notify the Project Manager via email?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseNotifyPMConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNotifyPM}
                className="px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          onClick={() => handleSaveAndProceed(false)}
          disabled={isCreatingEpic || isSendingEmail}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            isCreatingEpic || isSendingEmail
              ? 'bg-gray-500 opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#6b7280] to-[#4b5563] hover:from-[#4b5563] hover:to-[#374151] shadow-md hover:shadow-lg'
          }`}
        >
          {isCreatingEpic ? 'Saving...' : 'Save & View Overview'}
        </button>
        <button
          onClick={() => handleSaveAndProceed(true)}
          disabled={isCreatingEpic || isSendingEmail}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            isCreatingEpic || isSendingEmail
              ? 'bg-gray-500 opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] hover:from-[#155ac7] hover:to-[#3e7ed1] shadow-md hover:shadow-lg'
          }`}
        >
          {isSendingEmail ? 'Sending...' : 'Save & Notify PM'}
        </button>
      </div>
    </div>
  );
};

export default TaskSetup;