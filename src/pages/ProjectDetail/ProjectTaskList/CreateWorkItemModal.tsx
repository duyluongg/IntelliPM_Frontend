import React, { useState, useEffect } from 'react';
import { useCreateEpicMutation } from '../../../services/epicApi';
import { useCreateTaskMutation } from '../../../services/taskApi';
import { useAuth } from '../../../services/AuthContext';
import { useGetProjectMembersWithPositionsQuery } from '../../../services/projectMemberApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useGetEpicsByProjectIdQuery } from '../../../services/epicApi';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';

interface CreateWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  refetchWorkItems: () => void;
}

interface ProjectMember {
  accountId: number;
  fullName: string;
  picture: string | null;
  status: string;
}

interface DynamicCategory {
  id: number;
  name: string;
}

interface Epic {
  id: string;
  name: string;
}

const typeOptions = [
  { value: 'EPIC', label: 'Epic', icon: epicIcon },
  { value: 'STORY', label: 'Story', icon: storyIcon },
  { value: 'TASK', label: 'Task', icon: taskIcon },
  { value: 'BUG', label: 'Bug', icon: bugIcon },
];

const CreateWorkItemModal: React.FC<CreateWorkItemModalProps> = ({
  isOpen,
  onClose,
  projectId,
  refetchWorkItems,
}) => {
  const [type, setType] = useState<'EPIC' | 'STORY' | 'TASK' | 'BUG'>('EPIC');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [assignedBy, setAssignedBy] = useState<number | null>(null);
  const [epicId, setEpicId] = useState<string | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const { user } = useAuth();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');

  const { data: membersData, isLoading: isMembersLoading, error: membersError } =
    useGetProjectMembersWithPositionsQuery(projectId, {
      skip: !projectId || projectId === 0,
    });

  const { data: statusData, isLoading: isStatusLoading, error: statusError } =
    useGetCategoriesByGroupQuery(type === 'EPIC' ? 'epic_status' : 'task_status', {
      skip: !isOpen,
    });

  const { data: epicsData, isLoading: isEpicsLoading, error: epicsError } =
    useGetEpicsByProjectIdQuery(projectId, {
      skip: !projectId || projectId === 0 || type === 'EPIC',
    });

  const [createEpic, { isLoading: isCreatingEpic, error: createEpicError }] =
    useCreateEpicMutation();
  const [createTask, { isLoading: isCreatingTask, error: createTaskError }] =
    useCreateTaskMutation();

  const projectMembers: ProjectMember[] =
    membersData?.data
      ?.filter((member) => member.status.toUpperCase() === 'ACTIVE')
      ?.map((member) => ({
        accountId: member.accountId,
        fullName: member.fullName || 'Unknown',
        picture: member.picture || null,
        status: member.status,
      })) || [];

  const statusOptions: DynamicCategory[] = statusData?.data || [];
  const epicOptions: Epic[] = epicsData || [];

  useEffect(() => {
    if (statusOptions.length > 0 && !status) {
      setStatus(statusOptions.find((s) => s.name === 'TO_DO')?.name || statusOptions[0].name);
    }
  }, [statusOptions, status]);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setStatus(statusOptions.find((s) => s.name === 'TO_DO')?.name || '');
      setAssignedBy(null);
      setEpicId(null);
    }
  }, [isOpen, statusOptions, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be earlier than start date');
      return;
    }
    if (type === 'EPIC' && !assignedBy) {
      alert('Please select an assignee');
      return;
    }
    if (!status) {
      alert('Please select a status');
      return;
    }

    try {
      if (type === 'EPIC') {
        const payload = {
          projectId,
          name,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          reporterId: accountId,
          assignedBy,
          createdBy: accountId,
        };
        await createEpic(payload).unwrap();
        alert('Epic created successfully!');
      } else {
        const payload = {
          projectId,
          reporterId: accountId,
          epicId,
          sprintId: null,
          type,
          title: name,
          description,
          plannedStartDate: new Date(startDate).toISOString(),
          plannedEndDate: new Date(endDate).toISOString(),
          status,
          createdBy: accountId,
          dependencies: [],
        };
        await createTask(payload).unwrap();
        alert(`Task with type ${type} created successfully!`);
      }
      refetchWorkItems();
      onClose();
    } catch (err) {
      console.error('Failed to create work item', err);
      const error = type === 'EPIC' ? createEpicError : createTaskError;
      alert(`Failed to create ${type.toLowerCase()}: ${(error as any)?.data?.message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 transform transition-all duration-300 scale-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Create Work Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <div className="relative">
                <div
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                >
                  <img
                    src={typeOptions.find((option) => option.value === type)?.icon}
                    alt={type}
                    className="w-4 h-4 mr-2"
                  />
                  <span>{typeOptions.find((option) => option.value === type)?.label}</span>
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {typeOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center px-3 py-1.5 text-sm hover:bg-indigo-100 cursor-pointer"
                        onClick={() => {
                          setType(option.value as 'EPIC' | 'STORY' | 'TASK' | 'BUG');
                          setIsTypeDropdownOpen(false);
                        }}
                      >
                        <img src={option.icon} alt={option.label} className="w-4 h-4 mr-2" />
                        <span>{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {type === 'EPIC' ? 'Epic Name' : 'Title'}
              </label>
              <input
                type="text"
                placeholder={type === 'EPIC' ? 'Epic name' : 'Task title'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* {type !== 'EPIC' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Epic</label>
                {isEpicsLoading ? (
                  <p className="text-xs text-gray-500">Loading...</p>
                ) : epicsError ? (
                  <p className="text-xs text-red-500">Error</p>
                ) : (
                  <select
                    value={epicId || ''}
                    onChange={(e) => setEpicId(e.target.value || null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  >
                    <option value="">No Epic</option>
                    {epicOptions.map((epic) => (
                      <option key={epic.id} value={epic.id}>
                        {epic.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )} */}
            {type == 'EPIC' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                {isStatusLoading ? (
                  <p className="text-xs text-gray-500">Loading...</p>
                ) : statusError ? (
                  <p className="text-xs text-red-500">Error</p>
                ) : (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption.id} value={statusOption.name}>
                        {statusOption.name.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>


          {type == 'EPIC' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
              {isMembersLoading ? (
                <p className="text-xs text-gray-500">Loading...</p>
              ) : membersError ? (
                <p className="text-xs text-red-500">Error</p>
              ) : (
                <select
                  value={assignedBy || ''}
                  onChange={(e) => setAssignedBy(Number(e.target.value) || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                >
                  <option value="">Select Assignee</option>
                  {projectMembers.map((member) => (
                    <option key={member.accountId} value={member.accountId}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingEpic || isCreatingTask || isMembersLoading || isStatusLoading || (type !== 'EPIC' && isEpicsLoading)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isCreatingEpic || isCreatingTask ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkItemModal;