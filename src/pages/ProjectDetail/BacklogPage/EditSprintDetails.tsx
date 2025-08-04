import React, { useState } from 'react';
import { type SprintWithTasksDTO } from '../../../services/sprintApi';

interface EditSprintDetailsProps {
  sprint: SprintWithTasksDTO;
  onSave: (sprintId: string, updatedDetails: { title: string; startDate: string; endDate: string }) => void;
  onClose: () => void;
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const EditSprintDetails: React.FC<EditSprintDetailsProps> = ({ sprint, onSave, onClose }) => {
  const [title, setTitle] = useState(sprint.title);
  const [startDate, setStartDate] = useState(formatDate(sprint.startDate));
  const [endDate, setEndDate] = useState(formatDate(sprint.endDate));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Sprint title cannot be empty.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date.');
      return;
    }
    onSave(sprint.sprintId, { title, startDate, endDate });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Sprint Details</h3>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSprintDetails;