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
  useGetTasksBySprintIdAndStatusQuery,
  useUpdateTaskStatusMutation,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useSearchParams } from 'react-router-dom';
import { mapApiStatusToUI } from './Utils';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { ErrorBoundary } from 'react-error-boundary';

// Error Boundary Fallback Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 text-red-600">
    <h1>Đã xảy ra lỗi</h1>
    <p>{error.message}</p>
  </div>
);

// Utility to format error messages
const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return 'Lỗi không xác định';
  if ('message' in error && error.message) return error.message;
  if ('status' in error) return `Lỗi ${error.status}: ${JSON.stringify(error.data)}`;
  return 'Đã xảy ra lỗi bất ngờ';
};

const KanbanBoardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  // Fetch active sprint
  const {
    data: activeSprint,
    isLoading: isSprintLoading,
    error: sprintError,
  } = useGetActiveSprintByProjectKeyQuery(projectKey);

  // Fetch task status categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    isFetching: isCategoriesFetching,
  } = useGetCategoriesByGroupQuery('task_status');

  // Refetch sprint tasks when needed
  const { refetch } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);

  // Mutation to update task status
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  // Get account ID from localStorage
  const accountId = parseInt(localStorage.getItem('accountId') || '0');

  // State to store tasks by status
  const [tasks, setTasks] = useState<Record<string, TaskBacklogResponseDTO[]>>({});

  // Default statuses if categories are unavailable
  const defaultStatuses = ['To Do', 'In Progress', 'Done'];

  // Compute statuses based on categories
  const statuses = useMemo(() => {
    if (isCategoriesLoading || isCategoriesFetching || !categoriesData?.data) {
      return defaultStatuses;
    }
    const validStatuses = categoriesData.data
      .filter((category) => typeof category?.label === 'string' && category.label.trim())
      .map((category) => category.label);
    return validStatuses.length > 0 ? validStatuses : defaultStatuses;
  }, [categoriesData, isCategoriesLoading, isCategoriesFetching]);

  // Get sprint ID, default to 0 if no active sprint
  const sprintId = activeSprint?.id ?? 0;

  // Fetch tasks for each status using a fixed number of hooks
  const taskQueries = statuses.map((status) =>
    useGetTasksBySprintIdAndStatusQuery(
      { sprintId, taskStatus: status.replace(' ', '_').toUpperCase() },
      {
        skip: sprintId === 0 || isCategoriesLoading || isCategoriesFetching,
        selectFromResult: ({ data, isLoading, isError }) => ({
          status,
          data: data ?? [],
          isLoading,
          isError,
        }),
      }
    )
  );

  // Transform queries into a record for easier access
  const taskQueriesRecord = useMemo(() => {
    const queries: Record<
      string,
      { data: TaskBacklogResponseDTO[]; isLoading: boolean; isError: boolean }
    > = {};
    taskQueries.forEach(({ status, data, isLoading, isError }) => {
      queries[status] = { data, isLoading, isError };
    });
    return queries;
  }, [taskQueries]);

  // Update tasks state when taskQueries or statuses change
  useEffect(() => {
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
      const isEqual = JSON.stringify(prev) === JSON.stringify(mappedTasks);
      return isEqual ? prev : mappedTasks;
    });
  }, [taskQueriesRecord, statuses, sprintId]);

  // Handle task movement between columns
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

      refetch();
    } catch (error) {
      console.error('Không thể cập nhật trạng thái task:', error);
    }
  };

  // Render loading state
  if (isSprintLoading || isCategoriesLoading) {
    return <div className="p-4 text-center text-gray-500">Đang tải...</div>;
  }

  // Render error states
  if (categoriesError) {
    return <div className="p-4 text-red-600">Lỗi tải trạng thái: {getErrorMessage(categoriesError)}</div>;
  }
  if (sprintError && sprintId !== 0) {
    return <div className="p-4 text-red-600">Lỗi: {getErrorMessage(sprintError)}</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen p-2">
        <KanbanHeader
          projectKey={projectKey}
          sprintName={activeSprint?.name || 'Không có Sprint hoạt động'}
          projectId={activeSprint?.projectId || 0}
          onSearch={(query) => console.log('Tìm kiếm:', query)}
        />
        <DndProvider backend={HTML5Backend}>
          <div className="flex space-x-4 overflow-x-auto">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                sprint={activeSprint || { id: 0, name: 'Không có Sprint', projectId: 0 }}
                tasks={tasks[status] || []}
                moveTask={moveTask}
                status={status}
                isActive={true}
              />
            ))}
          </div>
        </DndProvider>
      </div>
    </ErrorBoundary>
  );
};

export default KanbanBoardPage;