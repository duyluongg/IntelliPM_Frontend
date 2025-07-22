import React, { useEffect, useState } from 'react';
import { useGetSprintsByProjectIdQuery, useMoveTasksMutation, useUpdateSprintStatusMutation, useGetSprintByIdQuery } from '../../../services/sprintApi';

interface CompleteSprintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: number;
  onTaskUpdated: () => void;
  projectKey: string;
  projectId: number;
  workItem: number;
}

const CompleteSprintPopup: React.FC<CompleteSprintPopupProps> = ({
  isOpen,
  onClose,
  sprintId,
  onTaskUpdated,
  projectKey,
  projectId,
  workItem,
}) => {
  const isValidProjectId = !isNaN(projectId) && projectId > 0;

  const { data: sprints = [], isLoading: isSprintsLoading, error: sprintsError } = useGetSprintsByProjectIdQuery(
    projectId,
    {
      skip: !isOpen || !isValidProjectId,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: currentSprint, isLoading: isSprintLoading, error: sprintError } = useGetSprintByIdQuery(
    sprintId,
    {
      skip: !isOpen,
      refetchOnMountOrArgChange: true,
    }
  );

  const [moveTasks] = useMoveTasksMutation();
  const [selectedTarget, setSelectedTarget] = useState<string | number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Filter out the current sprint and COMPLETED sprints
  const availableSprints = sprints.filter(
    (sprint) => sprint.id !== sprintId && sprint.status !== 'COMPLETED'
  );

  // Set the first available sprint as the default selection
  useEffect(() => {
    if (availableSprints.length > 0 && selectedTarget === null) {
      setSelectedTarget(availableSprints[0].id);
    } else if (availableSprints.length === 0 && selectedTarget === null) {
      setSelectedTarget('new_sprint');
    }
  }, [availableSprints, selectedTarget]);

  // Debugging logs
  useEffect(() => {
    console.log('CompleteSprintPopup props:', { isOpen, projectKey, projectId, isValidProjectId });
    console.log('Sprints query state:', { sprints, isSprintsLoading, sprintsError });
    console.log('Current sprint state:', { currentSprint, isSprintLoading, sprintError });
    console.log('Available sprints:', availableSprints);
    console.log('Selected target:', selectedTarget);
  }, [isOpen, projectKey, projectId, isValidProjectId, sprints, isSprintsLoading, sprintsError, currentSprint, isSprintLoading, sprintError, availableSprints, selectedTarget]);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle confirmation and API calls
  const handleConfirmMove = async () => {
    if (!selectedTarget) {
      alert('Please select a target sprint or option.');
      return;
    }

    if (currentSprint?.status === 'COMPLETED') {
      alert('This sprint is already completed.');
      setIsConfirming(false);
      return;
    }

    setIsConfirming(true);
    const targetName =
      selectedTarget === 'new_sprint'
        ? 'a new sprint'
        : selectedTarget === 'backlog'
        ? 'the backlog'
        : `sprint ${availableSprints.find((s) => s.id === selectedTarget)?.name || selectedTarget}`;
    const confirmMessage = `Are you sure you want to complete sprint ${sprintId} and move its ${workItem} work item(s) to ${targetName}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      setIsConfirming(false);
      return;
    }

    try {
      let type: string;
      let sprintNewId: number;

      if (selectedTarget === 'new_sprint') {
        type = 'NEW_SPRINT';
        sprintNewId = 0;
      } else if (selectedTarget === 'backlog') {
        type = 'BACKLOG';
        sprintNewId = 0;
      } else {
        type = 'CHANGE';
        sprintNewId = selectedTarget as number;
      }

      console.log('Moving tasks with:', { sprintOldId: sprintId, sprintNewId, type });

      // Move tasks first
      await moveTasks({
        sprintOldId: sprintId,
        sprintNewId,
        type,
      }).unwrap();

      onTaskUpdated();
      onClose();
    } catch (err: any) {
      const errorMessage = err?.data?.message || err.message || 'Unknown error';
      const validationErrors = err?.data?.errors ? JSON.stringify(err.data.errors, null, 2) : 'No validation details';
      alert(`Failed to complete sprint: ${errorMessage}\nValidation Errors: ${validationErrors}`);
      console.error('Error completing sprint:', {
        status: err.status,
        data: err.data,
        message: errorMessage,
        validationErrors,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Complete Sprint</h2>
        <p className="text-sm text-gray-600 mb-4">
          This action will mark sprint {sprintId} as completed. There are {workItem} work item(s) in this sprint.
        </p>
        {sprintsError && (
          <p className="text-sm text-red-600 mb-4">
            Failed to load sprints: {(sprintsError as any)?.data?.message || 'Unknown error'}
          </p>
        )}
        {sprintError && (
          <p className="text-sm text-red-600 mb-4">
            Failed to load sprint details: {(sprintError as any)?.data?.message || 'Unknown error'}
          </p>
        )}
        {currentSprint?.status === 'COMPLETED' && (
          <p className="text-sm text-red-600 mb-4">
            This sprint is already completed.
          </p>
        )}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Move work items to:</label>
          <select
            value={selectedTarget ?? ''}
            onChange={(e) =>
              setSelectedTarget(
                e.target.value === 'new_sprint' || e.target.value === 'backlog'
                  ? e.target.value
                  : parseInt(e.target.value)
              )
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isConfirming || isSprintsLoading || !isValidProjectId || currentSprint?.status === 'COMPLETED'}
          >
            <option value="" disabled>
              {isSprintsLoading
                ? 'Loading sprints...'
                : !isValidProjectId
                ? 'Invalid project ID'
                : currentSprint?.status === 'COMPLETED'
                ? 'Sprint already completed'
                : availableSprints.length === 0
                ? 'No active or future sprints available'
                : 'Select an option'}
            </option>
            {availableSprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
            <option value="new_sprint">New Sprint</option>
            <option value="backlog">Backlog</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmMove}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isConfirming || !selectedTarget || isSprintsLoading || !isValidProjectId || currentSprint?.status === 'COMPLETED'}
          >
            {isConfirming ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteSprintPopup;