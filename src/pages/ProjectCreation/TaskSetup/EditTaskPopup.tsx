import React, { type RefObject } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { type TaskState } from '../../../services/aiApi';

interface EditTaskPopupProps {
  editingTask: { epicId: string; task: TaskState };
  setEditingTask: (task: { epicId: string; task: TaskState } | null) => void;
  membersData: any;
  isMemberDropdownOpen: boolean;
  setIsMemberDropdownOpen: (open: boolean) => void;
  handleEditTask: (epicId: string, taskId: string, updatedTask: Partial<TaskState>) => void;
  memberDropdownRef: RefObject<HTMLDivElement | null>;
}

const EditTaskPopup: React.FC<EditTaskPopupProps> = ({
  editingTask,
  setEditingTask,
  membersData,
  isMemberDropdownOpen,
  setIsMemberDropdownOpen,
  handleEditTask,
  memberDropdownRef,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-xl font-bold text-[#1c73fd]'>Edit Task</h3>
          <button
            onClick={() => setEditingTask(null)}
            className='p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='space-y-5'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>Title</label>
            <input
              type='text'
              defaultValue={editingTask.task.title}
              onChange={(e) =>
                setEditingTask({
                  ...editingTask,
                  task: { ...editingTask.task, title: e.target.value },
                })
              }
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              defaultValue={editingTask.task.description}
              onChange={(e) =>
                setEditingTask({
                  ...editingTask,
                  task: { ...editingTask.task, description: e.target.value },
                })
              }
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
              rows={4}
            />
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              Suggested Role
            </label>
            <select
              defaultValue={editingTask.task.suggestedRole}
              onChange={(e) =>
                setEditingTask({
                  ...editingTask,
                  task: { ...editingTask.task, suggestedRole: e.target.value },
                })
              }
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
            >
              <option value='Designer'>Designer</option>
              <option value='Developer'>Developer</option>
              <option value='Tester'>Tester</option>
            </select>
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
                  {membersData?.data?.map((member: any) => {
                    const isAssigned = editingTask.task.assignedMembers.some(
                      (m: any) => m.accountId === member.accountId
                    );
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
              {editingTask.task.assignedMembers.length === 0 ? (
                <p className='text-sm text-gray-500 italic'>No members assigned</p>
              ) : (
                editingTask.task.assignedMembers.map((member) => (
                  <div
                    key={member.accountId}
                    className='flex items-center gap-2 relative group'
                  >
                    <button
                      onClick={() => {
                        setEditingTask({
                          ...editingTask,
                          task: {
                            ...editingTask.task,
                            assignedMembers: editingTask.task.assignedMembers.filter(
                              (m) => m.accountId !== member.accountId
                            ),
                          },
                        });
                      }}
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
            onClick={() => setEditingTask(null)}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200'
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleEditTask(editingTask.epicId, editingTask.task.id, editingTask.task)
            }
            className='px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPopup;