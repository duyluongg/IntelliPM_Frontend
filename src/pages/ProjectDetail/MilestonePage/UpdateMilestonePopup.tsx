import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  useGetMilestoneByIdQuery,
  useUpdateMilestoneMutation,
  type MilestoneResponseDTO,
} from '../../../services/milestoneApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

interface UpdateMilestonePopupProps {
  milestoneId: number;
  sprints: SprintWithTaskListResponseDTO[];
  onClose: () => void;
  refetchMilestones: () => void;
}

const UpdateMilestonePopup: React.FC<UpdateMilestonePopupProps> = ({
  milestoneId,
  sprints,
  onClose,
  refetchMilestones,
}) => {
  const { data: milestone, isLoading: isFetching } = useGetMilestoneByIdQuery(milestoneId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sprintId, setSprintId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateMilestone, { isLoading }] = useUpdateMilestoneMutation();

  useEffect(() => {
    if (milestone) {
      setName(milestone.name);
      setDescription(milestone.description);
      setStartDate(milestone.startDate.split('T')[0]);
      setEndDate(milestone.endDate.split('T')[0]);
      setSprintId(milestone.sprintId);
    }
  }, [milestone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !startDate || !endDate) {
      setError('All fields are required');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      await updateMilestone({
        id: milestoneId,
        payload: {
          projectId: milestone?.projectId || 1,
          sprintId,
          name: name.trim(),
          description: description.trim(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
      }).unwrap();
      refetchMilestones();
      onClose();
    } catch (err: any) {
      setError(err.data?.message || 'Failed to update milestone');
      console.error('Update milestone error:', err);
    }
  };

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-5 w-full max-w-sm">
          <p className="text-sm text-gray-500 animate-pulse">Loading milestone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Update Milestone</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Milestone name"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Milestone description"
                rows={4}
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sprint</label>
              <select
                value={sprintId || ''}
                onChange={(e) => setSprintId(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">No Sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMilestonePopup;