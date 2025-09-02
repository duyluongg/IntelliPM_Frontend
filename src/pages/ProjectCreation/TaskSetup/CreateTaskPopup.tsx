import React, { type RefObject, useEffect, useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { type TaskState } from '../../../services/aiApi';
import { useGetProjectDetailsByIdQuery } from '../../../services/projectApi'; // Adjust path to projectApi

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
  picture: string;
  projectPositions: { position: string }[];
}

interface NewTask {
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
}

interface CreateTaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  epics: EpicState[];
  newTask: NewTask;
  setNewTask: (newTask: NewTask) => void;
  membersData: { data?: Member[] } | undefined;
  isMemberDropdownOpen: boolean;
  setIsMemberDropdownOpen: (open: boolean) => void;
  handleCreateTask: () => void;
  handleAddNewTaskMember: (accountId: number) => void;
  handleRemoveNewTaskMember: (accountId: number) => void;
  memberDropdownRef: RefObject<HTMLDivElement | null>;
  projectId: number;
  projectKey: string;
}

const CreateTaskPopup: React.FC<CreateTaskPopupProps> = ({
  isOpen,
  onClose,
  epics,
  newTask,
  setNewTask,
  membersData,
  isMemberDropdownOpen,
  setIsMemberDropdownOpen,
  handleCreateTask,
  handleAddNewTaskMember,
  handleRemoveNewTaskMember,
  memberDropdownRef,
  projectId,
  projectKey,
}) => {
  const [errors, setErrors] = useState<{
    title?: string;
    startDate?: string;
    endDate?: string;
    newEpicTitle?: string;
    newEpicStartDate?: string;
    newEpicEndDate?: string;
  }>({});

  // Fetch project details to get project start and end dates
  const { data: projectDetails, isLoading: isProjectLoading } = useGetProjectDetailsByIdQuery(projectId);

  // Reset form and errors when popup is opened or closed
  useEffect(() => {
    if (isOpen) {
      resetNewTask();
      setErrors({});
    }
  }, [isOpen]);

  const resetNewTask = () => {
    setNewTask({
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
  };

  // Validate task title (not empty, max 100 characters, unique - assuming checked via API)
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return 'Task title is required';
    if (title.length > 100) return 'Task title must not exceed 100 characters';
    // Add API call to check uniqueness if required
    return undefined;
  };

  // Validate dates
  const validateDates = (
    startDate: string,
    endDate: string,
    epicStartDate: string,
    epicEndDate: string,
    projectStartDate?: string,
    projectEndDate?: string
  ): { startDate?: string; endDate?: string } => {
    const errors: { startDate?: string; endDate?: string } = {};

    const taskStart = new Date(startDate);
    const taskEnd = new Date(endDate);
    const epicStart = new Date(epicStartDate);
    const epicEnd = new Date(epicEndDate);
    const projectStart = projectStartDate ? new Date(projectStartDate) : null;
    const projectEnd = projectEndDate ? new Date(projectEndDate) : null;

    // Check if task end date is not earlier than start date
    if (taskEnd < taskStart) {
      errors.endDate = 'End date cannot be earlier than start date';
    }

    // Check if task dates are within epic dates
    if (taskStart < epicStart) {
      errors.startDate = 'Task start date must be on or after epic start date';
    }
    if (taskEnd > epicEnd) {
      errors.endDate = 'Task end date must be on or before epic end date';
    }

    // Check if epic dates are within project dates
    if (projectStart && epicStart < projectStart) {
      errors.startDate = 'Epic start date must be on or after project start date';
    }
    if (projectEnd && epicEnd > projectEnd) {
      errors.endDate = 'Epic end date must be on or before project end date';
    }

    return errors;
  };

  // Validate new epic fields if no epic is selected
  const validateNewEpic = (
    title: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined
  ): { newEpicTitle?: string; newEpicStartDate?: string; newEpicEndDate?: string } => {
    const errors: { newEpicTitle?: string; newEpicStartDate?: string; newEpicEndDate?: string } = {};

    if (!newTask.epicId) {
      if (!title?.trim()) {
        errors.newEpicTitle = 'Epic title is required';
      }
      if (title && title.length > 100) {
        errors.newEpicTitle = 'Epic title must not exceed 100 characters';
      }
      if (!startDate) {
        errors.newEpicStartDate = 'Epic start date is required';
      }
      if (!endDate) {
        errors.newEpicEndDate = 'Epic end date is required';
      }
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        errors.newEpicEndDate = 'Epic end date cannot be earlier than epic start date';
      }
    }

    return errors;
  };

  // Handle form submission with validation
  const handleSubmit = () => {
    const titleError = validateTitle(newTask.title);
    let dateErrors: { startDate?: string; endDate?: string } = {};
    let newEpicErrors: { newEpicTitle?: string; newEpicStartDate?: string; newEpicEndDate?: string } = {};

    if (newTask.epicId) {
      const selectedEpic = epics.find((epic) => epic.epicId === newTask.epicId);
      if (selectedEpic) {
        dateErrors = validateDates(
          newTask.startDate,
          newTask.endDate,
          selectedEpic.startDate,
          selectedEpic.endDate,
          projectDetails?.data.startDate,
          projectDetails?.data.endDate
        );
      }
    } else {
      newEpicErrors = validateNewEpic(
        newTask.newEpicTitle,
        newTask.newEpicStartDate,
        newTask.newEpicEndDate
      );
      if (newTask.newEpicStartDate && newTask.newEpicEndDate) {
        dateErrors = validateDates(
          newTask.startDate,
          newTask.endDate,
          newTask.newEpicStartDate,
          newTask.newEpicEndDate,
          projectDetails?.data.startDate,
          projectDetails?.data.endDate
        );
      }
    }

    const allErrors = {
      ...(titleError ? { title: titleError } : {}),
      ...dateErrors,
      ...newEpicErrors,
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setErrors({});
    handleCreateTask();
  };

  if (!isOpen || isProjectLoading) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-xl font-bold text-[#1c73fd]'>Create Task</h3>
          <button
            onClick={() => {
              setIsMemberDropdownOpen(false);
              resetNewTask();
              setErrors({});
              onClose();
            }}
            className='p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='space-y-4'>
          {epics.length > 0 ? (
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                Select Epic
              </label>
              <select
                value={newTask.epicId}
                onChange={(e) => setNewTask({ ...newTask, epicId: e.target.value })}
                className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
              >
                <option value=''>Select an Epic</option>
                {epics.map((epic) => (
                  <option key={epic.epicId} value={epic.epicId}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  New Epic Title
                </label>
                <input
                  type='text'
                  value={newTask.newEpicTitle}
                  onChange={(e) => setNewTask({ ...newTask, newEpicTitle: e.target.value })}
                  className={`w-full p-2.5 border ${
                    errors.newEpicTitle ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
                />
                {errors.newEpicTitle && (
                  <p className='text-red-500 text-sm mt-1'>{errors.newEpicTitle}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  New Epic Description
                </label>
                <textarea
                  value={newTask.newEpicDescription}
                  onChange={(e) =>
                    setNewTask({ ...newTask, newEpicDescription: e.target.value })
                  }
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                  rows={3}
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  New Epic Start Date
                </label>
                <input
                  type='date'
                  value={newTask.newEpicStartDate}
                  onChange={(e) => setNewTask({ ...newTask, newEpicStartDate: e.target.value })}
                  className={`w-full p-2.5 border ${
                    errors.newEpicStartDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
                />
                {errors.newEpicStartDate && (
                  <p className='text-red-500 text-sm mt-1'>{errors.newEpicStartDate}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  New Epic End Date
                </label>
                <input
                  type='date'
                  value={newTask.newEpicEndDate}
                  onChange={(e) => setNewTask({ ...newTask, newEpicEndDate: e.target.value })}
                  className={`w-full p-2.5 border ${
                    errors.newEpicEndDate ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
                />
                {errors.newEpicEndDate && (
                  <p className='text-red-500 text-sm mt-1'>{errors.newEpicEndDate}</p>
                )}
              </div>
            </div>
          )}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>Task Title</label>
            <input
              type='text'
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={`w-full p-2.5 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
            />
            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title}</p>}
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Task Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
              rows={3}
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Suggested Role
            </label>
            <select
              value={newTask.suggestedRole}
              onChange={(e) => setNewTask({ ...newTask, suggestedRole: e.target.value })}
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
            >
              <option value='Designer'>Designer</option>
              <option value='Developer'>Developer</option>
              <option value='Tester'>Tester</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Start Date
            </label>
            <input
              type='date'
              value={newTask.startDate}
              onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
              className={`w-full p-2.5 border ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
            />
            {errors.startDate && <p className='text-red-500 text-sm mt-1'>{errors.startDate}</p>}
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>End Date</label>
            <input
              type='date'
              value={newTask.endDate}
              onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              className={`w-full p-2.5 border ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200`}
            />
            {errors.endDate && <p className='text-red-500 text-sm mt-1'>{errors.endDate}</p>}
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Assigned Members
            </label>
            <div className='relative'>
              <div className='flex items-center gap-2 mb-2'>
                <button
                  onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                  className='text-[#1c73fd] hover:text-[#155ac7] transition-colors duration-200'
                >
                  <Plus className='w-5 h-5' />
                </button>
              </div>
              {isMemberDropdownOpen && (
                <div
                  ref={memberDropdownRef}
                  className='absolute z-10 top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto transition-all duration-200'
                >
                  <div className='px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50'>
                    Select Members
                  </div>
                  {membersData?.data?.map((member: Member) => {
                    const isAssigned = newTask.assignedMembers.some(
                      (m) => m.accountId === member.accountId
                    );
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
                          className='w-6 h-6 rounded-full object-cover'
                          onError={(e) => {
                            e.currentTarget.src = 'https://i.pravatar.cc/40';
                          }}
                        />
                        <span className='truncate'>
                          {member.fullName} (
                          {member.projectPositions[0]?.position || 'No Position'})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className='flex flex-wrap gap-3 mt-2'>
              {newTask.assignedMembers.length === 0 ? (
                <p className='text-sm text-gray-500 italic'>No members assigned</p>
              ) : (
                newTask.assignedMembers.map((member) => (
                  <div
                    key={member.accountId}
                    className='flex items-center gap-2 relative group'
                  >
                    <button
                      onClick={() => handleRemoveNewTaskMember(member.accountId)}
                      className='absolute -top-1 -left-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                    >
                      <Minus className='w-4 h-4' />
                    </button>
                    <img
                      src={member.picture}
                      alt={member.fullName}
                      className='w-7 h-7 rounded-full object-cover'
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.pravatar.cc/40';
                      }}
                    />
                    <span className='text-sm text-gray-600 truncate'>{member.fullName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={() => {
              setIsMemberDropdownOpen(false);
              resetNewTask();
              setErrors({});
              onClose();
            }}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className='px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200'
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPopup;