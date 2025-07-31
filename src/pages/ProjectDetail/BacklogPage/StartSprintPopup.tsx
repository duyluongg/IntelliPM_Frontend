import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useGetSprintByIdQuery, useUpdateSprintDetailsMutation, useCheckSprintDatesMutation, useCheckWithinProjectMutation } from '../../../services/sprintApi';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import dayjs from 'dayjs';

interface StartSprintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: number;
  onTaskUpdated: () => void;
  projectKey: string;
  workItem: number;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

const StartSprintPopup: React.FC<StartSprintPopupProps> = ({
  isOpen,
  onClose,
  sprintId,
  onTaskUpdated,
  projectKey,
  workItem,
}) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const {
    data: sprint,
    isLoading: isSprintLoading,
    isError: isSprintError,
  } = useGetSprintByIdQuery(sprintId, {
    skip: !isOpen || !sprintId,
  });
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useGetProjectDetailsByKeyQuery(projectKey, {
    skip: !isOpen || !projectKey,
  });

  const [updateSprintDetails] = useUpdateSprintDetailsMutation();
  const [checkSprintDates] = useCheckSprintDatesMutation();
  const [checkWithinProject] = useCheckWithinProjectMutation();

  const [sprintName, setSprintName] = useState('');
  const [duration, setDuration] = useState('1 week');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('08:00');
  const [goal, setGoal] = useState('');
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [hasChangedStart, setHasChangedStart] = useState(false);
  const [hasChangedEnd, setHasChangedEnd] = useState(false);
  const [validWeeks, setValidWeeks] = useState<number[]>([1, 2, 3, 4]);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && sprint && !isInitialized.current) {
      const start = sprint.startDate ? dayjs(sprint.startDate) : dayjs();
      const existingEnd = sprint.endDate ? dayjs(sprint.endDate) : null;

      setSprintName(sprint.name || '');
      setStartDate(start.format('YYYY-MM-DD'));
      setStartTime(start.format('HH:mm'));

      if (existingEnd && existingEnd.isValid()) {
        const diffWeeks = Math.round(existingEnd.diff(start, 'day') / 7);
        setDuration(
          diffWeeks >= 1 && diffWeeks <= 4 && validWeeks.includes(diffWeeks)
            ? `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`
            : 'custom'
        );
        setEndDate(existingEnd.format('YYYY-MM-DD'));
        setEndTime(existingEnd.format('HH:mm'));
      } else {
        const newEnd = start.add(7, 'day');
        setDuration(validWeeks.includes(1) ? '1 week' : 'custom');
        setEndDate(newEnd.format('YYYY-MM-DD'));
        setEndTime(newEnd.format('HH:mm'));
      }
      setGoal(sprint.goal || '');
      isInitialized.current = true;
    }

    if (!isOpen) {
      isInitialized.current = false;
      setSprintName('');
      setStartDate('');
      setStartTime('08:00');
      setEndDate('');
      setEndTime('08:00');
      setGoal('');
      setDuration('1 week');
      setStartDateError(null);
      setEndDateError(null);
      setGeneralError(null);
      setHasChangedStart(false);
      setHasChangedEnd(false);
      setValidWeeks([1, 2, 3, 4]);
    }
  }, [isOpen, sprint]);

  useEffect(() => {
    if (duration !== 'custom' && startDate && startTime) {
      const weeks = parseInt(duration.split(' ')[0]) || 1;
      if (validWeeks.includes(weeks)) {
        const newEnd = dayjs(`${startDate}T${startTime}`).add(weeks, 'week');
        setEndDate(newEnd.format('YYYY-MM-DD'));
        setEndTime(newEnd.format('HH:mm'));
      } else {
        setDuration('custom');
      }
    }
  }, [duration, startDate, startTime, validWeeks]);

  useEffect(() => {
    if (!hasChangedStart || !startDate || !startTime || !projectKey || !project) return;

    const checkStartDate = async () => {
      try {
        setGeneralError(null);
        const checkDate = dayjs(`${startDate}T${startTime}`).toISOString();
        const result = await checkSprintDates({ projectKey, checkDate }).unwrap();
        if (!result.data.isValid) {
          setStartDateError(result.message);
          setValidWeeks([]);
          setDuration('custom');
          return;
        } else {
          setStartDateError(null);
        }

        const start = dayjs(`${startDate}T${startTime}`);
        const projectStart = dayjs(project.data.startDate);
        const projectEnd = dayjs(project.data.endDate);
        if (!projectStart.isValid() || !projectEnd.isValid()) {
          setStartDateError('Invalid project dates');
          setValidWeeks([]);
          setDuration('custom');
          return;
        }

        if (start.isBefore(projectStart) || start.isAfter(projectEnd)) {
          setStartDateError('Start date is not within project duration');
          setValidWeeks([]);
          setDuration('custom');
          return;
        }

        const newValidWeeks: number[] = [];
        for (let weeks = 1; weeks <= 4; weeks++) {
          const sprintEnd = start.add(weeks, 'week');
          if (sprintEnd.isBefore(projectEnd) || sprintEnd.isSame(projectEnd)) {
            newValidWeeks.push(weeks);
          }
        }

        setValidWeeks(newValidWeeks);
        if (newValidWeeks.length === 0) {
          setGeneralError('Sprint duration cannot exceed project end date. Please use custom duration.');
          setDuration('custom');
        } else if (!newValidWeeks.includes(parseInt(duration.split(' ')[0]) || 1)) {
          setDuration(newValidWeeks.includes(1) ? '1 week' : 'custom');
        }
      } catch (err: any) {
        setStartDateError(err?.data?.message || 'Failed to check start date');
        setValidWeeks([]);
        setDuration('custom');
      }
    };

    checkStartDate();
  }, [startDate, startTime, hasChangedStart, projectKey, project, checkSprintDates]);

  useEffect(() => {
    if (!hasChangedEnd || !endDate || !endTime || duration !== 'custom' || !projectKey) return;

    const checkEndDate = async () => {
      try {
        setGeneralError(null);
        const checkDate = dayjs(`${endDate}T${endTime}`).toISOString();
        const result = await checkWithinProject({ projectKey, checkDate }).unwrap();
        if (!result.isWithin) {
          setEndDateError('End date is not within project duration');
        } else {
          setEndDateError(null);
        }
      } catch (err: any) {
        setEndDateError(err?.data?.message || 'Failed to check end date');
      }
    };

    checkEndDate();
  }, [endDate, endTime, hasChangedEnd, duration, projectKey, checkWithinProject]);

  const handleConfirm = async () => {
    try {
      setGeneralError(null);
      if (!projectKey) {
        setGeneralError('Project key is missing');
        alert('Project key is missing');
        return;
      }

      if (!project || !project.data) {
        setGeneralError('Project details not available');
        alert('Project details not available');
        return;
      }

      if (!project.data.id) {
        setGeneralError('Project ID is missing');
        alert('Project ID is missing');
        return;
      }

      if (!startDate || !startTime) {
        setStartDateError('Please select a valid start date and time.');
        alert('Please select a valid start date and time.');
        return;
      }

      const checkDate = dayjs(`${startDate}T${startTime}`).toISOString();
      const result = await checkSprintDates({ projectKey, checkDate }).unwrap();
      if (!result.data.isValid) {
        setStartDateError(result.message);
        alert(`Invalid start date: ${result.message}`);
        return;
      }

      const start = dayjs(`${startDate}T${startTime}`);
      const projectStart = dayjs(project.data.startDate);
      const projectEnd = dayjs(project.data.endDate);
      if (!projectStart.isValid() || !projectEnd.isValid()) {
        setStartDateError('Invalid project dates');
        alert('Invalid project dates');
        return;
      }
      if (start.isBefore(projectStart) || start.isAfter(projectEnd)) {
        setStartDateError('Start date is not within project duration');
        alert('Start date is not within project duration');
        return;
      }

      if (duration === 'custom' && (!endDate || !endTime)) {
        setEndDateError('Please select a valid end date and time.');
        alert('Please select a valid end date and time.');
        return;
      }

      if (duration === 'custom') {
        const checkDate = dayjs(`${endDate}T${endTime}`).toISOString();
        const result = await checkWithinProject({ projectKey, checkDate }).unwrap();
        if (!result.isWithin) {
          setEndDateError('End date is not within project duration');
          alert('End date is not within project duration');
          return;
        }
      }

      const startDateTime = dayjs(`${startDate}T${startTime}`).toISOString();
      const endDateTime = duration === 'custom'
        ? dayjs(`${endDate}T${endTime}`).toISOString()
        : dayjs(`${startDate}T${startTime}`).add(parseInt(duration.split(' ')[0]) || 1, 'week').toISOString();

      await updateSprintDetails({
        id: sprintId.toString(),
        projectId: project.data.id,
        name: sprintName || 'Unnamed Sprint',
        goal: goal || null,
        startDate: startDateTime,
        endDate: endDateTime,
        plannedStartDate: startDateTime,
        plannedEndDate: endDateTime,
        status: 'ACTIVE',
      }).unwrap();

      onTaskUpdated();
      onClose();
      navigate(`/project?projectKey=${projectKey}#board`);
    } catch (err: any) {
      setGeneralError(err?.data?.message || 'Failed to update sprint');
      alert(`Failed to update sprint: ${err?.data?.message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  if (isSprintLoading || isProjectLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4">Loading...</div>
      </div>
    );
  }

  if (isSprintError || isProjectError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 text-red-500">Error loading sprint or project details</div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
          {generalError && (
            <div className="text-red-500 text-sm mb-4">{generalError}</div>
          )}
          <h2 className="text-xl font-semibold mb-4">Start another sprint</h2>
          <p className="text-sm text-gray-600 mb-4">
            <strong>{workItem}</strong> work item{workItem !== 1 ? 's' : ''} will be included in this sprint.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sprint name<span className="text-red-500">*</span>
              </label>
              <input
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration<span className="text-red-500">*</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-1/3 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {validWeeks.includes(1) && <option value="1 week">1 week</option>}
                {validWeeks.includes(2) && <option value="2 weeks">2 weeks</option>}
                {validWeeks.includes(3) && <option value="3 weeks">3 weeks</option>}
                {validWeeks.includes(4) && <option value="4 weeks">4 weeks</option>}
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center rounded-md w-full">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setHasChangedStart(true);
                    }}
                    className={`flex-1 p-2 bg-transparent text-sm outline-none w-full focus:ring-2 focus:ring-blue-500 ${startDateError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setHasChangedStart(true);
                    }}
                    className={`flex-1 p-2 bg-transparent text-sm outline-none w-full focus:ring-2 focus:ring-blue-500 ${startDateError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {(startDate || startTime) && (
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600 text-sm"
                      onClick={() => {
                        setStartDate('');
                        setStartTime('');
                        setHasChangedStart(false);
                        setStartDateError(null);
                        setValidWeeks([1, 2, 3, 4]);
                      }}
                      type="button"
                      aria-label="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
                {startDate && startTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Planned start date:{' '}
                    <strong>{dayjs(`${startDate}T${startTime}`).format('MMM DD, YYYY, h:mm A')}</strong>
                  </p>
                )}
                {startDateError && (
                  <p className="text-xs text-red-500 mt-1">{startDateError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center rounded-md w-full">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      if (duration === 'custom') {
                        setEndDate(e.target.value);
                        setHasChangedEnd(true);
                      }
                    }}
                    disabled={duration !== 'custom'}
                    className={`flex-1 p-2 bg-transparent text-sm outline-none w-full focus:ring-2 focus:ring-blue-500 ${endDateError ? 'border-red-500' : 'border-gray-300'} ${duration !== 'custom' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      if (duration === 'custom') {
                        setEndTime(e.target.value);
                        setHasChangedEnd(true);
                      }
                    }}
                    disabled={duration !== 'custom'}
                    className={`flex-1 p-2 bg-transparent text-sm outline-none w-full focus:ring-2 focus:ring-blue-500 ${endDateError ? 'border-red-500' : 'border-gray-300'} ${duration !== 'custom' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {(endDate || endTime) && duration === 'custom' && (
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600 text-sm"
                      onClick={() => {
                        setEndDate('');
                        setEndTime('');
                        setHasChangedEnd(false);
                        setEndDateError(null);
                      }}
                      type="button"
                      aria-label="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>
                {endDate && endTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Planned end date:{' '}
                    <strong>{dayjs(`${endDate}T${endTime}`).format('MMM DD, YYYY, h:mm A')}</strong>
                  </p>
                )}
                {endDateError && (
                  <p className="text-xs text-red-500 mt-1">{endDateError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sprint goal</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add a goal for this sprint (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default StartSprintPopup;