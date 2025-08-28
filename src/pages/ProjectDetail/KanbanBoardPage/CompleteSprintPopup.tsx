
import React, { useEffect, useState } from 'react';
import {
  useGetSprintsByProjectIdQuery,
  useMoveTasksMutation,
  useUpdateSprintStatusMutation,
  useGetSprintByIdQuery,
} from '../../../services/sprintApi';
import ConfirmationPopup from './ConfirmationPopup';

interface CompleteSprintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: number;
  sprintName: string;
  projectKey: string;
  projectId: number;
  workItem: number;
  workItemCompleted: number;
  workItemOpen: number;
  onTaskUpdated?: () => void; 
}

const CompleteSprintPopup: React.FC<CompleteSprintPopupProps> = ({
  isOpen,
  onClose,
  sprintId,
  sprintName,
  projectKey,
  projectId,
  workItem,
  workItemCompleted,
  workItemOpen,
}) => {
  const isValidProjectId = !isNaN(projectId) && projectId > 0;

  const {
    data: sprints = [],
    isLoading: isSprintsLoading,
    error: sprintsError,
  } = useGetSprintsByProjectIdQuery(projectId, {
    skip: !isOpen || !isValidProjectId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: currentSprint,
    isLoading: isSprintLoading,
    error: sprintError,
  } = useGetSprintByIdQuery(sprintId, {
    skip: !isOpen,
    refetchOnMountOrArgChange: true,
  });

  const [moveTasks] = useMoveTasksMutation();
  const [updateSprintStatus] = useUpdateSprintStatusMutation();
  const [selectedTarget, setSelectedTarget] = useState<string | number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSprints = sprints.filter(
    (sprint) => sprint.id !== sprintId && sprint.status !== 'COMPLETED'
  );

  useEffect(() => {
    if (availableSprints.length > 0 && selectedTarget === null) {
      setSelectedTarget(availableSprints[0].id);
    } else if (availableSprints.length === 0 && selectedTarget === null) {
      setSelectedTarget('new_sprint');
    }
  }, [availableSprints, selectedTarget]);

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

  const handleConfirmMove = async () => {
    if (!selectedTarget) {
      setErrorMessage('Please select a target sprint or option.');
      return;
    }

    if (currentSprint?.status === 'COMPLETED') {
      setErrorMessage('This sprint is already completed.');
      setIsConfirming(false);
      return;
    }

    setIsConfirming(true);
    setErrorMessage(null);
    setIsConfirmationOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsConfirmationOpen(false);
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

      await moveTasks({
        sprintOldId: sprintId,
        sprintNewId,
        type,
      }).unwrap();

      await updateSprintStatus({
        id: sprintId,
        status: 'COMPLETED',
      }).unwrap();

      console.log('Sprint completed successfully, tags invalidated');
      onClose(); // Close the popup, rely on tag invalidation for refresh
    } catch (err: any) {
      const errorMsg = err?.data?.message || 'Failed to complete sprint';
      setErrorMessage(errorMsg);
      console.error('Error completing sprint:', {
        status: err.status,
        data: err.data,
        message: errorMsg,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelConfirmation = () => {
    setIsConfirmationOpen(false);
    setIsConfirming(false);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-lg w-[400px]'>
        <div className='bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 pb-10 rounded-t-lg relative'>
          {(sprintsError || sprintError || errorMessage) && (
            <p className='text-sm mt-2 text-red-200'>
              {errorMessage ||
                (sprintsError as any)?.data?.message ||
                (sprintError as any)?.data?.message ||
                'Unknown error'}
            </p>
          )}
          {currentSprint?.status === 'COMPLETED' && (
            <p className='text-sm mt-2 text-red-200'>This sprint is already completed.</p>
          )}
        </div>

        <div className='relative'>
          <div
            className='absolute top-[-50px] left-1/2 transform -translate-x-1/2 p-2'
            style={{ zIndex: 10 }}
          >
            <img
              src='https://res.cloudinary.com/didnsp4p0/image/upload/v1753250008/ChatGPT_Image_12_50_58_23_thg_7__2025-removebg-preview_t3c6sw.png'
              alt='Sprint Completion Illustration'
              className='w-24 h-24 object-cover rounded-full'
            />
          </div>
        </div>
        <div className='p-6 pt-16'>
          <h3 className='text-md font-semibold text-gray-800'>Complete {sprintName}</h3>

          <p className='text-sm text-gray-600 mt-2'>
            This sprint contains <strong>{workItemCompleted} completed work items</strong> and{' '}
            <strong>{workItemOpen} open work items</strong>.
          </p>

          <ul className='list-disc pl-5 mt-1 text-sm text-gray-600'>
            <li>
              Completed work items include everything in the last column on the board,{' '}
              <span className='text-blue-600 font-medium'>Done</span>.
            </li>
            <li>
              Open work items include everything from any other column on the board. Move these to a
              new sprint or the backlog.
            </li>
          </ul>

          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Move open work items to:
            </label>
            <select
              value={selectedTarget ?? ''}
              onChange={(e) =>
                setSelectedTarget(
                  e.target.value === 'new_sprint' || e.target.value === 'backlog'
                    ? e.target.value
                    : parseInt(e.target.value)
                )
              }
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent'
              disabled={
                isConfirming ||
                isSprintsLoading ||
                !isValidProjectId ||
                currentSprint?.status === 'COMPLETED'
              }
            >
              <option value='' disabled>
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
              <option value='new_sprint'>New Sprint</option>
              <option value='backlog'>Backlog</option>
            </select>
          </div>
          <div className='flex justify-end space-x-4 mt-6'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200'
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmMove}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed'
              disabled={
                isConfirming ||
                !selectedTarget ||
                isSprintsLoading ||
                !isValidProjectId ||
                currentSprint?.status === 'COMPLETED'
              }
            >
              {isConfirming ? 'Processing...' : 'Complete sprint'}
            </button>
          </div>
        </div>
      </div>
      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirmation}
        message={
          <>
            Are you sure you want to <strong>complete sprint {sprintId}</strong> and{' '}
            <strong>move its {workItem} work item(s)</strong> to{' '}
            <strong>
              {selectedTarget === 'new_sprint'
                ? 'a new sprint'
                : selectedTarget === 'backlog'
                ? 'the backlog'
                : `sprint ${availableSprints.find((s) => s.id === selectedTarget)?.name || selectedTarget}`}
            </strong>? This action cannot be undone.
          </>
        }
      />
    </div>
  );
};

export default CompleteSprintPopup;
