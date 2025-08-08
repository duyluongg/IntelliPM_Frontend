import React from 'react';
import { X } from 'lucide-react';
import { type TaskState } from '../../../services/aiApi';

interface EditDatePopupProps {
  editingDateTask: { epicId: string; task: TaskState; field: 'startDate' | 'endDate' };
  setEditingDateTask: (task: { epicId: string; task: TaskState; field: 'startDate' | 'endDate' } | null) => void;
  handleEditTask: (epicId: string, taskId: string, updatedTask: Partial<TaskState>) => void;
}

const EditDatePopup: React.FC<EditDatePopupProps> = ({
  editingDateTask,
  setEditingDateTask,
  handleEditTask,
}) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-5'>
          <h3 className='text-xl font-bold text-[#1c73fd]'>
            Edit {editingDateTask.field === 'startDate' ? 'Start Date' : 'End Date'}
          </h3>
          <button
            onClick={() => setEditingDateTask(null)}
            className='p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>
              {editingDateTask.field === 'startDate' ? 'Start Date' : 'End Date'}
            </label>
            <input
              type='date'
              defaultValue={editingDateTask.task[editingDateTask.field]}
              onChange={(e) =>
                setEditingDateTask({
                  ...editingDateTask,
                  task: { ...editingDateTask.task, [editingDateTask.field]: e.target.value },
                })
              }
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200'
            />
          </div>
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={() => setEditingDateTask(null)}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200'
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleEditTask(editingDateTask.epicId, editingDateTask.task.id, {
                [editingDateTask.field]: editingDateTask.task[editingDateTask.field],
              })
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

export default EditDatePopup;