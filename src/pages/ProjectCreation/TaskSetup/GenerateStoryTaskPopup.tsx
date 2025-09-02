import React, { useState, useEffect, useRef } from 'react';
import { useGenerateStoryTaskMutation, type StoryTaskResponse, type EpicState } from '../../../services/aiApi';
import aiIcon from '../../../assets/icon/ai.png';
import galaxyaiIcon from '../../../assets/galaxyai.gif';
import AiResponseEvaluationPopup from '../../../components/AiResponse/AiResponseEvaluationPopup';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

// Extend the StoryTaskResponse data type to include type, storyTitle, and epicId
interface ExtendedStoryTaskResponse {
  type: 'TASK' | 'STORY';
  aiGenerated: boolean;
  epicId: string;
  data: {
    itemId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    suggestedRole: string;
    assignedMembers: Member[];
    storyTitle?: string;
  };
}

interface Member {
  accountId: number;
  fullName: string;
  picture: string;
}

interface GenerateStoryTaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectKey: string;
  epicTitle: string;
  epicStartDate: string;
  epicEndDate: string;
  existingTitles: string[];
  onStoryTasksGenerated: (storyTasks: ExtendedStoryTaskResponse[]) => void;
  epics: EpicState[];
  membersData?: { data?: Member[] };
}

const GenerateStoryTaskPopup: React.FC<GenerateStoryTaskPopupProps> = ({
  isOpen,
  onClose,
  projectId,
  projectKey,
  epicTitle,
  epicStartDate,
  epicEndDate,
  existingTitles,
  onStoryTasksGenerated,
  epics,
  membersData,
}) => {
  const today = new Date();
  const defaultEndDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
  const defaultStartDate = new Date().toISOString().split('T')[0];

  const [createType, setCreateType] = useState<'TASK' | 'STORY'>('TASK');
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [selectedEpic, setSelectedEpic] = useState<EpicState | null>(null);
  const [selectedStoryTitle, setSelectedStoryTitle] = useState<string>('');
  const [storyTasks, setStoryTasks] = useState<ExtendedStoryTaskResponse[]>([]);
  const [selectedStoryTasks, setSelectedStoryTasks] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemStartDate, setItemStartDate] = useState<string>(defaultStartDate);
  const [itemEndDate, setItemEndDate] = useState<string>(defaultEndDate);
  const [itemSuggestedRole, setItemSuggestedRole] = useState<string>('Developer');
  const [itemAssignedMembers, setItemAssignedMembers] = useState<Member[]>([]);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [evaluationPayload, setEvaluationPayload] = useState<string>('');
  const [newTask, setNewTask] = useState({
    epicId: '',
    title: '',
    description: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    suggestedRole: 'Developer',
    assignedMembers: [] as Member[],
    storyTitle: '',
  });
  const [isEpicTasksVisible, setIsEpicTasksVisible] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);

  const [generateStoryTask, { isLoading: isGenerateStoryTaskLoading }] = useGenerateStoryTaskMutation();

  useEffect(() => {
    if (isOpen && epics.length > 0 && !selectedEpic) {
      const initialEpic = epics.find((e) => e.title === epicTitle) || epics[0];
      setSelectedEpic(initialEpic);
      setNewTask({
        ...newTask,
        epicId: initialEpic.epicId,
        startDate: initialEpic.startDate,
        endDate: initialEpic.endDate,
      });
      const firstStory = initialEpic.tasks.find((task) => task.type === 'STORY');
      if (firstStory) {
        setSelectedStoryTitle(firstStory.title);
        setNewTask((prev) => ({ ...prev, storyTitle: firstStory.title }));
      }
    }
  }, [isOpen, epics, epicTitle, newTask]);

  const currentEpicTitle = selectedEpic ? selectedEpic.title : epicTitle;
  const currentStartDate = selectedEpic ? selectedEpic.startDate : epicStartDate;
  const currentEndDate = selectedEpic ? selectedEpic.endDate : epicEndDate;
  const currentExistingTitles = selectedEpic ? selectedEpic.tasks.map((t) => t.title) : existingTitles;

  const handleEpicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const epicId = e.target.value;
    const epic = epics.find((e) => e.epicId === epicId);
    setSelectedEpic(epic || null);
    setNewTask({
      ...newTask,
      epicId,
      storyTitle: '',
      startDate: epic ? epic.startDate : defaultStartDate,
      endDate: epic ? epic.endDate : defaultEndDate,
    });
    setSelectedStoryTitle('');
    setStoryTasks([]);
    setSelectedStoryTasks([]);
    setError(null);
    setIsEpicTasksVisible(false);
    if (epic) {
      const firstStory = epic.tasks.find((task) => task.type === 'STORY');
      if (firstStory) {
        setSelectedStoryTitle(firstStory.title);
        setNewTask((prev) => ({ ...prev, storyTitle: firstStory.title }));
      }
    }
  };

  const handleStoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storyTitle = e.target.value;
    setSelectedStoryTitle(storyTitle);
    setNewTask({ ...newTask, storyTitle });
  };

  const handleGenerateStoryTasks = async () => {
    if (!selectedEpic) {
      setError('Please select an epic.');
      return;
    }
    if (createType === 'TASK' && !selectedStoryTitle) {
      setError('Please select a story for the task.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const body: any = {
        type: createType,
        epicTitle: selectedEpic.title,
        epicStartDate: selectedEpic.startDate,
        epicEndDate: selectedEpic.endDate,
        existingTitles: selectedEpic.tasks.map((task) => task.title),
      };
      if (createType === 'TASK') {
        body.storyTitle = selectedStoryTitle;
      }
      const response = await generateStoryTask({
        projectId,
        body,
      }).unwrap();

      console.log('Generated response:', response);

      if (!response.isSuccess) {
        throw new Error(response.message || `Failed to generate ${createType.toLowerCase()}s`);
      }

      const extendedTasks: ExtendedStoryTaskResponse[] = response.data.map((item: StoryTaskResponse) => ({
        ...item,
        type: createType,
        aiGenerated: true,
        epicId: selectedEpic.epicId,
        data: {
          ...item.data,
          startDate: selectedEpic.startDate,
          endDate: selectedEpic.endDate,
          storyTitle: createType === 'TASK' ? selectedStoryTitle : undefined,
        },
      }));
      setStoryTasks(extendedTasks);
      setSelectedStoryTasks(extendedTasks.map((_, index) => `item-${index}`));
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err?.data?.message || err.message || `Failed to generate ${createType.toLowerCase()}s`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleItemCheckboxChange = (itemId: string) => {
    setSelectedStoryTasks((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleStartItemEdit = (
    itemId: string,
    currentTitle: string,
    currentDescription: string,
    currentStartDate: string,
    currentEndDate: string,
    currentSuggestedRole: string,
    currentAssignedMembers: Member[],
    currentStoryTitle?: string
  ) => {
    setEditingItemId(itemId);
    setItemTitle(currentTitle);
    setItemDescription(currentDescription);
    setItemStartDate(currentStartDate ? new Date(currentStartDate).toISOString().split('T')[0] : selectedEpic?.startDate || defaultStartDate);
    setItemEndDate(currentEndDate ? new Date(currentEndDate).toISOString().split('T')[0] : selectedEpic?.endDate || defaultEndDate);
    setItemSuggestedRole(currentSuggestedRole);
    setItemAssignedMembers(currentAssignedMembers);
    if (currentStoryTitle) {
      setSelectedStoryTitle(currentStoryTitle);
    }
  };

  const handleSaveItemEdit = (itemId: string) => {
    if (!itemTitle.trim()) {
      setError(`${createType} title is required.`);
      return;
    }
    if (itemStartDate && itemEndDate && new Date(itemEndDate) < new Date(itemStartDate)) {
      setError('End date must be on or after start date.');
      return;
    }
    if (
      selectedEpic &&
      ((itemStartDate && new Date(itemStartDate) < new Date(selectedEpic.startDate)) ||
        (itemEndDate && new Date(itemEndDate) > new Date(selectedEpic.endDate)))
    ) {
      setError(`${createType} dates must be within the epic's date range.`);
      return;
    }
    if (createType === 'TASK' && !selectedStoryTitle) {
      setError('Please select a story for the task.');
      return;
    }

    const updatedTasks = storyTasks.map((item, index) =>
      `item-${index}` === itemId
        ? {
            ...item,
            data: {
              ...item.data,
              title: itemTitle.trim(),
              description: itemDescription.trim() || item.data.description,
              startDate: itemStartDate || selectedEpic?.startDate || defaultStartDate,
              endDate: itemEndDate || selectedEpic?.endDate || defaultEndDate,
              suggestedRole: itemSuggestedRole,
              assignedMembers: itemAssignedMembers,
              storyTitle: createType === 'TASK' ? selectedStoryTitle : undefined,
            },
            epicId: selectedEpic!.epicId,
          }
        : item
    );
    setStoryTasks(updatedTasks);
    setEditingItemId(null);
    setItemTitle('');
    setItemDescription('');
    setItemStartDate('');
    setItemEndDate('');
    setItemSuggestedRole('Developer');
    setItemAssignedMembers([]);
    setError(null);
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setItemTitle('');
    setItemDescription('');
    setItemStartDate('');
    setItemEndDate('');
    setItemSuggestedRole('Developer');
    setItemAssignedMembers([]);
    setError(null);
  };

  const handleAddMember = (member: Member) => {
    if (itemAssignedMembers.some((m) => m.accountId === member.accountId)) {
      return;
    }
    if (itemAssignedMembers.length >= 3) {
      setError(`Cannot assign more than 3 members to a ${createType.toLowerCase()}.`);
      return;
    }
    setItemAssignedMembers([...itemAssignedMembers, member]);
    setIsMemberDropdownOpen(false);
  };

  const handleAddTaskMember = (member: Member) => {
    if (newTask.assignedMembers.some((m) => m.accountId === member.accountId)) {
      return;
    }
    if (newTask.assignedMembers.length >= 3) {
      setError('Cannot assign more than 3 members to a task.');
      return;
    }
    setNewTask({ ...newTask, assignedMembers: [...newTask.assignedMembers, member] });
    setIsMemberDropdownOpen(false);
  };

  const handleRemoveMember = (accountId: number) => {
    setItemAssignedMembers(itemAssignedMembers.filter((m) => m.accountId !== accountId));
  };

  const handleRemoveTaskMember = (accountId: number) => {
    setNewTask({
      ...newTask,
      assignedMembers: newTask.assignedMembers.filter((m) => m.accountId !== accountId),
    });
  };

  const handleCreateItem = () => {
    if (!newTask.title.trim()) {
      setError(`${createType} title is required.`);
      return;
    }
    if (newTask.startDate && newTask.endDate && new Date(newTask.endDate) < new Date(newTask.startDate)) {
      setError('End date must be on or after start date.');
      return;
    }
    if (
      selectedEpic &&
      ((newTask.startDate && new Date(newTask.startDate) < new Date(selectedEpic.startDate)) ||
        (newTask.endDate && new Date(newTask.endDate) > new Date(selectedEpic.endDate)))
    ) {
      setError(`${createType} dates must be within the epic's date range.`);
      return;
    }
    if (createType === 'TASK' && !newTask.storyTitle) {
      setError('Please select a story for the task.');
      return;
    }

    const item: ExtendedStoryTaskResponse = {
      type: createType,
      aiGenerated: false,
      epicId: selectedEpic!.epicId,
      data: {
        itemId: `${createType.toLowerCase()}-${Date.now()}`,
        title: newTask.title.trim(),
        description: newTask.description.trim() || 'No description',
        startDate: newTask.startDate || selectedEpic!.startDate,
        endDate: newTask.endDate || selectedEpic!.endDate,
        suggestedRole: newTask.suggestedRole,
        assignedMembers: newTask.assignedMembers,
        storyTitle: createType === 'TASK' ? newTask.storyTitle : undefined,
      },
    };

    // Add the new task to TaskList
    onStoryTasksGenerated([item]);

    // Set evaluation payload and show popup for manual creation
    setEvaluationPayload(JSON.stringify({ storyTasks: [item] }));
    setIsEvaluationPopupOpen(true);

    // Reset form
    setNewTask({
      epicId: selectedEpic?.epicId || '',
      title: '',
      description: '',
      startDate: selectedEpic?.startDate || defaultStartDate,
      endDate: selectedEpic?.endDate || defaultEndDate,
      suggestedRole: 'Developer',
      assignedMembers: [],
      storyTitle: createType === 'TASK' ? selectedStoryTitle : '',
    });
  };

  const handleSubmit = async () => {
    if (selectedStoryTasks.length === 0) {
      setError(`Please select at least one ${createType.toLowerCase()}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedStoryTasksData = storyTasks.filter((_, index) => selectedStoryTasks.includes(`item-${index}`));

      // Validate all selected items
      for (const item of selectedStoryTasksData) {
        if (!item.data.title.trim()) {
          throw new Error(`All ${createType.toLowerCase()}s must have a title.`);
        }
        if (item.data.startDate && item.data.endDate && new Date(item.data.endDate) < new Date(item.data.startDate)) {
          throw new Error(`${createType} "${item.data.title}" has invalid dates: End date must be on or after start date.`);
        }
        if (
          selectedEpic &&
          ((item.data.startDate && new Date(item.data.startDate) < new Date(selectedEpic.startDate)) ||
            (item.data.endDate && new Date(item.data.endDate) > new Date(selectedEpic.endDate)))
        ) {
          throw new Error(`${createType} "${item.data.title}" has dates outside the epic's date range.`);
        }
        if (item.type === 'TASK' && !item.data.storyTitle) {
          throw new Error(`Task "${item.data.title}" must have a story selected.`);
        }
      }

      const tasksWithEpicId = selectedStoryTasksData.map((task) => ({
        ...task,
        epicId: selectedEpic!.epicId,
      }));

      // Add the selected tasks to TaskList
      onStoryTasksGenerated(tasksWithEpicId);

      // Set evaluation payload and show popup
      setEvaluationPayload(JSON.stringify({ storyTasks: tasksWithEpicId }));
      setIsEvaluationPopupOpen(true);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || `Failed to process ${createType.toLowerCase()}s`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluationPopupClose = () => {
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    setStoryTasks([]); // Clear storyTasks to reset the generated tasks section
    setSelectedStoryTasks([]); // Clear selected tasks
    setIsEpicTasksVisible(true); // Show the updated task list
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI response evaluation submitted with ID:', aiResponseId);
    setIsEvaluationPopupOpen(false);
    setEvaluationPayload('');
    setStoryTasks([]); // Clear storyTasks to reset the generated tasks section
    setSelectedStoryTasks([]); // Clear selected tasks
    setIsEpicTasksVisible(true); // Show the updated task list
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[85vh] overflow-y-auto'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold text-[#1c73fd] flex items-center gap-3'>
              {!manualMode && <img src={aiIcon} alt='AI Icon' className='w-8 h-8' />}
              {manualMode ? `Create ${createType}` : `Generate ${createType}s`} for Epic: {currentEpicTitle}
            </h2>
            <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
              <X className='w-6 h-6' />
            </button>
          </div>

          <div className='mb-6'>
            <button
              onClick={() => setIsDetailsVisible(!isDetailsVisible)}
              className='flex items-center gap-2 text-[#1c73fd] hover:text-[#155ac7] text-sm font-medium mb-2'
            >
              {isDetailsVisible ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
              {isDetailsVisible ? 'Hide' : 'Show'} Project Details
            </button>
            {isDetailsVisible && (
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-xl'>
                <p className='text-blue-800 text-sm'>
                  <strong>Project:</strong> {projectKey} • <strong>Epic:</strong> {currentEpicTitle} • <strong>Existing {createType}s:</strong> {currentExistingTitles.length}
                </p>
                <p className='text-blue-800 text-sm'>
                  <strong>Duration:</strong> {formatDate(currentStartDate)} - {formatDate(currentEndDate)}
                </p>
                {currentExistingTitles.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-blue-700 text-xs mb-1'>Current {createType.toLowerCase()}s:</p>
                    <div className='flex flex-wrap gap-2'>
                      {currentExistingTitles.slice(0, 5).map((title, index) => (
                        <span key={index} className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                          {title}
                        </span>
                      ))}
                      {currentExistingTitles.length > 5 && (
                        <span className='text-xs text-blue-600'>+{currentExistingTitles.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6'>
              <div className='flex items-start gap-2'>
                <svg className='w-5 h-5 text-red-500 mt-0.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className='mb-6'>
            <div className='flex gap-4 mb-4'>
              <button
                onClick={() => { setCreateType('TASK'); setManualMode(false); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  createType === 'TASK' && !manualMode
                    ? 'bg-[#1c73fd] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Create Task
              </button>
              <button
                onClick={() => { setCreateType('STORY'); setManualMode(false); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  createType === 'STORY' && !manualMode
                    ? 'bg-[#1c73fd] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Create Story
              </button>
              <button
                onClick={() => setManualMode(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  manualMode
                    ? 'bg-[#1c73fd] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Create Manual
              </button>
            </div>

            {epics.length > 0 ? (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Select Epic</label>
                <select
                  value={newTask.epicId}
                  onChange={handleEpicChange}
                  className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                >
                  {epics.map((epic) => (
                    <option key={epic.epicId} value={epic.epicId}>
                      {epic.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className='text-sm text-gray-500 mb-4'>No epics available. Please create an epic first.</p>
            )}

            {createType === 'TASK' && selectedEpic && (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Select Story *</label>
                <select
                  value={selectedStoryTitle}
                  onChange={handleStoryChange}
                  className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                >
                  <option value=''>Select a story</option>
                  {selectedEpic.tasks
                    .filter((task) => task.type === 'STORY')
                    .map((story) => (
                      <option key={story.id} value={story.title}>
                        {story.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {selectedEpic && (
              <div className='mb-6'>
                <button
                  onClick={() => setIsEpicTasksVisible(!isEpicTasksVisible)}
                  className='flex items-center gap-2 text-[#1c73fd] hover:text-[#155ac7] text-sm font-medium mb-2'
                >
                  {isEpicTasksVisible ? (
                    <ChevronUp className='w-5 h-5' />
                  ) : (
                    <ChevronDown className='w-5 h-5' />
                  )}
                  {isEpicTasksVisible ? 'Hide' : 'Show'} Tasks for {selectedEpic.title}
                </button>
                {isEpicTasksVisible && (
                  <div className='border border-gray-200 rounded-xl p-4 bg-gray-50'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                      Tasks ({selectedEpic.tasks.filter((task) => task.type === 'TASK').length})
                    </h3>
                    {selectedEpic.tasks.filter((task) => task.type === 'TASK').length > 0 ? (
                      <div className='space-y-3'>
                        {selectedEpic.tasks.filter((task) => task.type === 'TASK').map((task) => (
                          <div
                            key={task.id}
                            className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'
                          >
                            <h4 className='font-semibold text-gray-800'>{task.title}</h4>
                            <p className='text-gray-600 text-sm mb-2'>{task.description}</p>
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                              <div>Story: {task.title || 'N/A'}</div>
                              <div>Start: {formatDate(task.startDate)}</div>
                              <div>End: {formatDate(task.endDate)}</div>
                              <div>Role: {task.suggestedRole}</div>
                            </div>
                            {task.assignedMembers.length > 0 && (
                              <div className='mt-2'>
                                <p className='text-sm text-gray-700 font-medium'>Assigned Members:</p>
                                <div className='flex flex-wrap gap-2 mt-1'>
                                  {task.assignedMembers.map((member) => (
                                    <div
                                      key={member.accountId}
                                      className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm'
                                    >
                                      <img src={member.picture} alt={member.fullName} className='w-5 h-5 rounded-full' />
                                      <span>{member.fullName}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-gray-500'>No tasks available for this epic.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {epics.length > 0 && !manualMode && (
              <div className='mb-6'>
                <button
                  onClick={handleGenerateStoryTasks}
                  className={`w-full py-4 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                    isGenerating || isSubmitting || !selectedEpic || (createType === 'TASK' && !selectedStoryTitle)
                      ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02] shadow-lg'
                  }`}
                  disabled={isGenerating || isSubmitting || !selectedEpic || (createType === 'TASK' && !selectedStoryTitle)}
                >
                  <img src={aiIcon} alt='AI Icon' className='w-6 h-6 object-contain' />
                  <span className='text-lg'>{isGenerating ? `Generating ${createType}s...` : `Generate ${createType} Suggestions`}</span>
                </button>
              </div>
            )}

            {(isGenerating || isGenerateStoryTaskLoading) && (
              <div className='flex justify-center items-center py-12 bg-white rounded-2xl shadow-md'>
                <div className='flex flex-col items-center gap-4'>
                  <img src={galaxyaiIcon} alt='AI Processing' className='w-12 h-12 animate-pulse' />
                  <span
                    style={{
                      background: 'linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'gradientLoading 1.8s ease-in-out infinite',
                    }}
                    className='text-xl font-semibold'
                  >
                    Generating {createType.toLowerCase()} Ideas...
                  </span>
                  <p className='text-gray-600 text-sm text-center max-w-md'>
                    AI is analyzing your epic requirements and creating meaningful {createType.toLowerCase()}s for better organization.
                  </p>
                </div>
              </div>
            )}

            {storyTasks.length > 0 && (
              <div className='border border-gray-200 rounded-xl p-6 max-h-[50vh] overflow-y-auto bg-gray-50'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Generated {createType}s ({storyTasks.length})
                  </h3>
                  <div className='text-sm text-gray-600'>
                    {selectedStoryTasks.length} of {storyTasks.length} selected
                  </div>
                </div>

                <div className='space-y-4'>
                  {storyTasks.map((item, index) => (
                    <div
                      key={`item-${index}`}
                      className='bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100'
                    >
                      <div className='flex items-start gap-4'>
                        <input
                          type='checkbox'
                          checked={selectedStoryTasks.includes(`item-${index}`)}
                          onChange={() => handleItemCheckboxChange(`item-${index}`)}
                          className='h-5 w-5 text-[#1c73fd] focus:ring-[#1c73fd] border-gray-300 rounded mt-1'
                          disabled={isSubmitting}
                        />
                        <div className='flex-1'>
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-semibold text-gray-800 text-lg'>{item.data.title}</h4>
                            <div className='flex items-center gap-2'>
                              {item.aiGenerated && (
                                <span className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium'>
                                  AI Generated
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleStartItemEdit(
                                    `item-${index}`,
                                    item.data.title,
                                    item.data.description,
                                    item.data.startDate,
                                    item.data.endDate,
                                    item.data.suggestedRole,
                                    item.data.assignedMembers,
                                    item.data.storyTitle
                                  )
                                }
                                className='text-sm text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200 font-medium'
                                disabled={isSubmitting}
                              >
                                Edit Details
                              </button>
                            </div>
                          </div>

                          <p className='text-gray-600 mb-3 leading-relaxed'>{item.data.description}</p>

                          <div className='flex items-center gap-4 text-sm text-gray-500'>
                            {item.type === 'TASK' && (
                              <div className='flex items-center gap-1'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                                  />
                                </svg>
                                <span>Story: {item.data.storyTitle || 'N/A'}</span>
                              </div>
                            )}
                            <div className='flex items-center gap-1'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                />
                              </svg>
                              <span>Start: {formatDate(item.data.startDate)}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                />
                              </svg>
                              <span>End: {formatDate(item.data.endDate)}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                />
                              </svg>
                              <span>Role: {item.data.suggestedRole}</span>
                            </div>
                          </div>

                          {item.data.assignedMembers.length > 0 && (
                            <div className='mt-3'>
                              <p className='text-sm text-gray-700 font-medium'>Assigned Members:</p>
                              <div className='flex flex-wrap gap-2 mt-1'>
                                {item.data.assignedMembers.map((member) => (
                                  <div
                                    key={member.accountId}
                                    className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm'
                                  >
                                    <img src={member.picture} alt={member.fullName} className='w-5 h-5 rounded-full' />
                                    <span>{member.fullName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {editingItemId === `item-${index}` && (
                            <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {item.type === 'TASK' && (
                                  <div className='md:col-span-2'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Story *</label>
                                    <select
                                      value={selectedStoryTitle}
                                      onChange={handleStoryChange}
                                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                                    >
                                      <option value=''>Select a story</option>
                                      {selectedEpic?.tasks
                                        .filter((task) => task.type === 'STORY')
                                        .map((story) => (
                                          <option key={story.id} value={story.title}>
                                            {story.title}
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                )}
                                <div className='md:col-span-2'>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>{createType} Title *</label>
                                  <input
                                    type='text'
                                    value={itemTitle}
                                    onChange={(e) => setItemTitle(e.target.value)}
                                    className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                                    placeholder={`Enter ${createType.toLowerCase()} title`}
                                  />
                                </div>
                                <div className='md:col-span-2'>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                                  <textarea
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    rows={3}
                                    className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] resize-none'
                                    placeholder={`Enter ${createType.toLowerCase()} description`}
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Start Date</label>
                                  <input
                                    type='date'
                                    value={itemStartDate}
                                    onChange={(e) => setItemStartDate(e.target.value)}
                                    min={selectedEpic?.startDate}
                                    max={selectedEpic?.endDate}
                                    className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>End Date</label>
                                  <input
                                    type='date'
                                    value={itemEndDate}
                                    onChange={(e) => setItemEndDate(e.target.value)}
                                    min={itemStartDate || selectedEpic?.startDate}
                                    max={selectedEpic?.endDate}
                                    className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                                  />
                                </div>
                                <div className='md:col-span-2'>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Suggested Role</label>
                                  <select
                                    value={itemSuggestedRole}
                                    onChange={(e) => setItemSuggestedRole(e.target.value)}
                                    className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                                  >
                                    <option value='Developer'>Developer</option>
                                    <option value='Designer'>Designer</option>
                                    <option value='Tester'>Tester</option>
                                    <option value='Manager'>Manager</option>
                                  </select>
                                </div>
                                <div className='md:col-span-2 relative'>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>Assign Members</label>
                                  <div className='flex flex-wrap gap-2 mb-2'>
                                    {itemAssignedMembers.map((member) => (
                                      <div
                                        key={member.accountId}
                                        className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm'
                                      >
                                        <img src={member.picture} alt={member.fullName} className='w-5 h-5 rounded-full' />
                                        <span>{member.fullName}</span>
                                        <button
                                          onClick={() => handleRemoveMember(member.accountId)}
                                          className='text-red-600 hover:text-red-800'
                                        >
                                          <X className='w-4 h-4' />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      ref={dropdownButtonRef}
                                      onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                                      className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium'
                                    >
                                      <Plus className='w-4 h-4' />
                                      Add Member
                                    </button>
                                  </div>
                                  {isMemberDropdownOpen && (
                                    <div
                                      className='absolute z-50 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2'
                                      style={{
                                        top: dropdownButtonRef.current
                                          ? dropdownButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                                          : 0,
                                        left: dropdownButtonRef.current
                                          ? dropdownButtonRef.current.getBoundingClientRect().left + window.scrollX
                                          : 0,
                                      }}
                                    >
                                      {membersData?.data && membersData.data.length > 0 ? (
                                        membersData.data.map((member) => (
                                          <div
                                            key={member.accountId}
                                            onClick={() => handleAddMember(member)}
                                            className='flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded'
                                          >
                                            <img src={member.picture} alt={member.fullName} className='w-6 h-6 rounded-full' />
                                            <span className='text-sm'>{member.fullName}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className='px-2 py-1.5 text-sm text-gray-500'>No members available</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className='flex justify-end gap-2 mt-4'>
                                <button
                                  onClick={handleCancelItemEdit}
                                  className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveItemEdit(`item-${index}`)}
                                  className='px-4 py-2 text-sm bg-[#1c73fd] text-white rounded-lg hover:bg-[#155ac7] transition-colors'
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {manualMode && (
              <div className='border border-gray-200 rounded-xl p-6 bg-gray-50'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Create New {createType}</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {createType === 'TASK' && selectedEpic && (
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Story *</label>
                      <select
                        value={newTask.storyTitle}
                        onChange={(e) => handleStoryChange(e)}
                        className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                      >
                        <option value=''>Select a story</option>
                        {selectedEpic.tasks
                          .filter((task) => task.type === 'STORY')
                          .map((story) => (
                            <option key={story.id} value={story.title}>
                              {story.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{createType} Title *</label>
                    <input
                      type='text'
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                      placeholder={`Enter ${createType.toLowerCase()} title`}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd] resize-none'
                      placeholder={`Enter ${createType.toLowerCase()} description`}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Start Date</label>
                    <input
                      type='date'
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                      min={selectedEpic?.startDate}
                      max={selectedEpic?.endDate}
                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>End Date</label>
                    <input
                      type='date'
                      value={newTask.endDate}
                      onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                      min={newTask.startDate || selectedEpic?.startDate}
                      max={selectedEpic?.endDate}
                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Suggested Role</label>
                    <select
                      value={newTask.suggestedRole}
                      onChange={(e) => setNewTask({ ...newTask, suggestedRole: e.target.value })}
                      className='w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#1c73fd]'
                    >
                      <option value='Developer'>Developer</option>
                      <option value='Designer'>Designer</option>
                      <option value='Tester'>Tester</option>
                      <option value='Manager'>Manager</option>
                    </select>
                  </div>
                  <div className='md:col-span-2 relative'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Assign Members</label>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {newTask.assignedMembers.map((member) => (
                        <div
                          key={member.accountId}
                          className='flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm'
                        >
                          <img src={member.picture} alt={member.fullName} className='w-5 h-5 rounded-full' />
                          <span>{member.fullName}</span>
                          <button
                            onClick={() => handleRemoveTaskMember(member.accountId)}
                            className='text-red-600 hover:text-red-800'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                      ))}
                      <button
                        ref={dropdownButtonRef}
                        onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                        className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium'
                      >
                        <Plus className='w-4 h-4' />
                        Add Member
                      </button>
                    </div>
                    {isMemberDropdownOpen && (
                      <div
                        className='absolute z-50 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2'
                        style={{
                          top: dropdownButtonRef.current
                            ? dropdownButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 4
                            : 0,
                          left: dropdownButtonRef.current
                            ? dropdownButtonRef.current.getBoundingClientRect().left + window.scrollX
                            : 0,
                        }}
                      >
                        {membersData?.data && membersData.data.length > 0 ? (
                          membersData.data.map((member) => (
                            <div
                              key={member.accountId}
                              onClick={() => handleAddTaskMember(member)}
                              className='flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded'
                            >
                              <img src={member.picture} alt={member.fullName} className='w-6 h-6 rounded-full' />
                              <span className='text-sm'>{member.fullName}</span>
                            </div>
                          ))
                        ) : (
                          <div className='px-2 py-1.5 text-sm text-gray-500'>No members available</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex justify-end gap-2 mt-4'>
                  <button
                    onClick={() => setManualMode(false)}
                    className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateItem}
                    className='px-4 py-2 text-sm bg-[#1c73fd] text-white rounded-lg hover:bg-[#155ac7] transition-colors'
                  >
                    Create {createType}
                  </button>
                </div>
              </div>
            )}
          </div>

          {storyTasks.length > 0 && (
            <div className='flex justify-end gap-2'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isSubmitting || selectedStoryTasks.length === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#1c73fd] text-white hover:bg-[#155ac7]'
                }`}
                disabled={isSubmitting || selectedStoryTasks.length === 0}
              >
                {isSubmitting ? `Submitting ${createType}s...` : `Save ${createType}s`}
              </button>
            </div>
          )}
        </div>
      </div>

      {isEvaluationPopupOpen && (
        <AiResponseEvaluationPopup
          isOpen={isEvaluationPopupOpen}
          onClose={handleEvaluationPopupClose}
          aiResponseJson={evaluationPayload}
          projectId={projectId}
          aiFeature='TASK_PLANNING'
          onSubmitSuccess={handleEvaluationSubmitSuccess}
        />
      )}
    </>
  );
};

export default GenerateStoryTaskPopup;