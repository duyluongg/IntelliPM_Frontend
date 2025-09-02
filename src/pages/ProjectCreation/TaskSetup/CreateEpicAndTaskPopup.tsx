import React, { type RefObject } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { type TaskState, type EpicState } from '../../../services/aiApi';

interface Member {
  accountId: number;
  fullName: string;
  picture: string;
  projectPositions: { position: string }[];
}

interface NewTask {
  epicId: string;
  title: string;
  type: 'TASK' | 'STORY';
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

interface CreateEpicAndTaskPopupProps {
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

const CreateEpicAndTaskPopup: React.FC<CreateEpicAndTaskPopupProps> = ({
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
  if (!isOpen) return null;

  const today = new Date();
  const defaultEndDate = new Date(today.setDate(today.getDate() + 30))
    .toISOString()
    .split('T')[0];
  const defaultStartDate = new Date().toISOString().split('T')[0];

  const resetNewTask = () => {
    setNewTask({
      epicId: epics.length > 0 ? epics[0].epicId : '',
      title: '',
      type: 'TASK',
      description: '',
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      suggestedRole: 'Developer',
      assignedMembers: [],
      newEpicTitle: '',
      newEpicDescription: 'No description',
      newEpicStartDate: defaultStartDate,
      newEpicEndDate: defaultEndDate,
    });
  };

  const creationMode = epics.length > 0 ? newTask.epicId === 'new-epic' ? 'new-epic' : 'task' : 'new-epic';

  // Find the selected epic to constrain task dates
  const selectedEpic = epics.find((epic) => epic.epicId === newTask.epicId);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-xl font-bold text-[#1c73fd]'>
            {creationMode === 'new-epic' && !newTask.title ? 'Create Epic' : 'Create Task'}
          </h3>
          <button
            onClick={() => {
              setIsMemberDropdownOpen(false);
              resetNewTask();
              onClose();
            }}
            className='p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='space-y-4'>
          {epics.length > 0 && (
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                Select Epic
              </label>
              <select
                value={newTask.epicId}
                onChange={(e) => {
                  const selectedEpicId = e.target.value;
                  const epic = epics.find((epic) => epic.epicId === selectedEpicId);
                  setNewTask({
                    ...newTask,
                    epicId: selectedEpicId,
                    startDate: epic ? epic.startDate : defaultStartDate,
                    endDate: epic ? epic.endDate : defaultEndDate,
                  });
                }}
                className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
              >
                <option value=''>Select an Epic</option>
                {epics.map((epic) => (
                  <option key={epic.epicId} value={epic.epicId}>
                    {epic.title} ({epic.backendEpicId || epic.epicId})
                  </option>
                ))}
                <option value='new-epic'>Create New Epic</option>
              </select>
            </div>
          )}
          {creationMode === 'new-epic' && (
            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Epic Title
                </label>
                <input
                  type='text'
                  value={newTask.newEpicTitle}
                  onChange={(e) => setNewTask({ ...newTask, newEpicTitle: e.target.value })}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Epic Description
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
                  Epic Start Date
                </label>
                <input
                  type='date'
                  value={newTask.newEpicStartDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setNewTask({
                      ...newTask,
                      newEpicStartDate: newStartDate,
                      startDate: newStartDate, // Update task start date to match epic
                      endDate: new Date(new Date(newStartDate).setDate(new Date(newStartDate).getDate() + 30))
                        .toISOString()
                        .split('T')[0], // Ensure task end date is updated
                    });
                  }}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Epic End Date
                </label>
                <input
                  type='date'
                  value={newTask.newEpicEndDate}
                  onChange={(e) => setNewTask({ ...newTask, newEpicEndDate: e.target.value })}
                  min={newTask.newEpicStartDate}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
              </div>
            </div>
          )}
          {(creationMode === 'task' || (creationMode === 'new-epic' && newTask.title)) && (
            <>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Task Type
                </label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'TASK' | 'STORY' })}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                >
                  <option value='TASK'>Task</option>
                  <option value='STORY'>Story</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Task Title
                </label>
                <input
                  type='text'
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
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
                  Task Start Date
                </label>
                <input
                  type='date'
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                  min={creationMode === 'task' ? selectedEpic?.startDate : newTask.newEpicStartDate}
                  max={creationMode === 'task' ? selectedEpic?.endDate : newTask.newEpicEndDate}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>
                  Task End Date
                </label>
                <input
                  type='date'
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                  min={newTask.startDate}
                  max={creationMode === 'task' ? selectedEpic?.endDate : newTask.newEpicEndDate}
                  className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
                />
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
            </>
          )}
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={() => {
              setIsMemberDropdownOpen(false);
              resetNewTask();
              onClose();
            }}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200'
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTask}
            className='px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200'
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEpicAndTaskPopup;