import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanHeader from './KanbanHeader';
import KanbanColumn from './KanbanColumn';
import {
  useGetSprintsByProjectKeyWithTasksQuery,
  useGetActiveSprintByProjectKeyQuery,
} from '../../../services/sprintApi';
import {
  useGetTasksBySprintIdQuery,
  useUpdateTaskStatusMutation,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useSearchParams } from 'react-router-dom';
import { mapApiStatusToUI } from './Utils';
import { ErrorBoundary } from 'react-error-boundary';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';


// Error Boundary Fallback Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 text-red-600">
    <h1>An error occurred</h1>
    <p>{error.message}</p>
  </div>
);

// Utility to format error messages
const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return 'Unknown error';
  if ('message' in error && error.message) return error.message;
  if ('status' in error) return `Error ${error.status}: ${JSON.stringify(error.data)}`;
  return 'An unexpected error occurred';
};

const KanbanBoardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const {
    data: activeSprint,
    isLoading: isSprintLoading,
    error: sprintError,
    refetch: refetchSprint,
  } = useGetActiveSprintByProjectKeyQuery(projectKey);

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    isFetching: isCategoriesFetching,
  } = useGetCategoriesByGroupQuery('task_status');

  const { refetch: refetchSprints } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');

  const [tasks, setTasks] = useState<Record<string, TaskBacklogResponseDTO[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const defaultStatuses = ['To Do', 'In Progress', 'Done'];

  const statuses = useMemo(() => {
    if (isCategoriesLoading || isCategoriesFetching || !categoriesData?.data) {
      return defaultStatuses;
    }
    const validStatuses = categoriesData.data
      .filter((category) => typeof category?.label === 'string' && category.label.trim())
      .map((category) => category.label);
    return validStatuses.length > 0 ? validStatuses : defaultStatuses;
  }, [
    isCategoriesLoading,
    isCategoriesFetching,
    JSON.stringify(categoriesData?.data?.map((cat) => cat.label) ?? []),
  ]);

  const sprintId = activeSprint?.id ?? 0;

  const { data: allTasks = [], isLoading: isTasksLoading, isError: isTasksError, refetch: refetchTasks } =
    useGetTasksBySprintIdQuery(sprintId, {
      skip: sprintId === 0 || isCategoriesLoading || isCategoriesFetching,
    });

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesEpic = selectedEpicId ? task.epicId === selectedEpicId : true;
      const matchesSearch = searchQuery
        ? task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesEpic && matchesSearch;
    });
  }, [allTasks, selectedEpicId, searchQuery]);

  const taskQueriesRecord = useMemo(() => {
    const queries: Record<
      string,
      { data: TaskBacklogResponseDTO[]; isLoading: boolean; isError: boolean }
    > = {};
    statuses.forEach((status) => {
      const statusKey = status.replace(' ', '_').toUpperCase();
      queries[status] = {
        data: filteredTasks.filter((task) => task.status === statusKey),
        isLoading: isTasksLoading,
        isError: isTasksError,
      };
    });
    return queries;
  }, [filteredTasks, statuses, isTasksLoading, isTasksError]);

  useEffect(() => {
    console.log('KanbanBoardPage state:', { activeSprint, filteredTasks, sprintId, sprintError, selectedEpicId, searchQuery });
    const mappedTasks: Record<string, TaskBacklogResponseDTO[]> = {};

    statuses.forEach((status) => {
      const query = taskQueriesRecord[status] || { data: [] };
      mappedTasks[status] = query.data.map((task) => ({
        ...task,
        status: mapApiStatusToUI(task.status ?? 'To Do'),
        sprintId,
        reporterName: task.reporterName ?? null,
      }));
    });

    setTasks((prev) => {
      const hasChanged = Object.keys(mappedTasks).some(
        (status) =>
          !prev[status] ||
          prev[status].length !== mappedTasks[status].length ||
          prev[status].some((task, i) => task.id !== mappedTasks[status][i].id)
      );
      return hasChanged ? mappedTasks : prev;
    });
  }, [taskQueriesRecord, statuses, sprintId]);

  const moveTask = async (
    taskId: string,
    fromSprintId: number | null,
    toSprintId: number | null,
    toStatus: string
  ) => {
    try {
      await updateTaskStatus({
        id: taskId,
        status: toStatus.replace(' ', '_').toUpperCase(),
        createdBy: accountId,
      }).unwrap();

      setTasks((prev) => {
        const fromKey = Object.keys(prev).find((key) => prev[key].some((t) => t.id === taskId));
        if (!fromKey) return prev;

        const taskToMove = prev[fromKey].find((t) => t.id === taskId);
        if (!taskToMove) return prev;

        const updated = { ...prev };
        updated[fromKey] = updated[fromKey].filter((t) => t.id !== taskId);
        updated[toStatus] = [
          ...(updated[toStatus] || []),
          { ...taskToMove, status: toStatus, sprintId: toSprintId },
        ];
        return updated;
      });

      refetchTasks();
      refetchSprints();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEpicSelect = (epicId: string | null) => {
    setSelectedEpicId(epicId);
  };

  if (isSprintLoading || isCategoriesLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  if (categoriesError) {
    return <div className="p-4 text-red-600">Error loading statuses: {getErrorMessage(categoriesError)}</div>;
  }

  const isNoActiveSprint = !activeSprint || (sprintError && 'status' in sprintError && sprintError.status === 404);

  // Log the error for debugging
  if (sprintError) {
    console.log('Sprint error:', sprintError);
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen p-2">
        <KanbanHeader
          projectKey={projectKey}
          sprintName={activeSprint?.name || 'No active sprint'}
          projectId={activeSprint?.projectId || 0}
          onSearch={handleSearch}
          onEpicSelect={handleEpicSelect}
        />
        <DndProvider backend={HTML5Backend}>
          <div className="flex space-x-4 overflow-x-auto">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                sprint={isNoActiveSprint ? { id: 0, name: 'No Sprint', projectId: 0 } : activeSprint!}
                tasks={isNoActiveSprint ? [] : tasks[status] || []}
                moveTask={moveTask}
                status={status}
                isActive={!isNoActiveSprint}
              />
            ))}
          </div>
        </DndProvider>
        {isNoActiveSprint && (
          <div className="p-4 text-center text-gray-500">
            No active sprint found for project {projectKey}.{' '}
            <button
              onClick={refetchSprint}
              className="text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default KanbanBoardPage;