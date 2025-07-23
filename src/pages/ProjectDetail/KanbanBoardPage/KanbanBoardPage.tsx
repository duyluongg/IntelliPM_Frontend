import React, { useState, useEffect, useMemo, Component } from 'react';
import type { ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanHeader from './KanbanHeader';
import KanbanColumn from './KanbanColumn';
import {
  useGetSprintsByProjectKeyWithTasksQuery,
  useGetActiveSprintByProjectKeyQuery,
  type SprintResponseDTO,
} from '../../../services/sprintApi';
import {
  useGetTasksBySprintIdAndStatusQuery,
  useUpdateTaskStatusMutation,
  useGetTasksFromBacklogQuery,
  type TaskBacklogResponseDTO,
} from '../../../services/taskApi';
import { useGetCategoriesByGroupQuery } from '../../../services/dynamicCategoryApi';
import { useSearchParams } from 'react-router-dom';
import { mapApiStatusToUI } from './Utils';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h1>Something went wrong</h1>
          <p>{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return 'Unknown error';
  if ('message' in error && error.message) {
    return error.message;
  }
  if ('status' in error) {
    return `Error ${error.status}: ${JSON.stringify(error.data)}`;
  }
  return 'An unexpected error occurred';
};

const KanbanBoardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const { data: activeSprint, isLoading: isSprintLoading, error: sprintError } = useGetActiveSprintByProjectKeyQuery(projectKey);
  const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError } = useGetCategoriesByGroupQuery('task_status');
  const { data: backlogTasks = [], isLoading: isBacklogLoading, error: backlogError } = useGetTasksFromBacklogQuery(projectKey);
  const { refetch } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const [tasks, setTasks] = useState<{ [key: string]: TaskBacklogResponseDTO[] }>({});

  const statuses = useMemo(
    () => categoriesData?.data.map((category) => category.label) || ['To Do', 'In Progress', 'Done'],
    [categoriesData]
  );

  const sprintId = activeSprint?.id;

  // Call hooks at the top level
  const taskQueriesArray = statuses.map((status) =>
    useGetTasksBySprintIdAndStatusQuery(
      { sprintId: sprintId!, taskStatus: status.replace(' ', '_').toUpperCase() },
      { skip: !sprintId }
    )
  );

  // Map queries to statuses
  const taskQueries = useMemo(() => {
    return statuses.reduce((acc, status, index) => {
      acc[status] = taskQueriesArray[index];
      return acc;
    }, {} as Record<string, ReturnType<typeof useGetTasksBySprintIdAndStatusQuery>>);
  }, [statuses, taskQueriesArray]);

  useEffect(() => {
    const mappedTasks: Record<string, TaskBacklogResponseDTO[]> = {};

    statuses.forEach((status) => {
      const query = taskQueries[status];
      if (query?.data && !query.isLoading && !query.isError) {
        mappedTasks[status] = query.data.map((task: TaskBacklogResponseDTO) => ({
          ...task,
          status: mapApiStatusToUI(task.status ?? 'To Do'),
          sprintId: sprintId ?? null,
          reporterName: task.reporterName ?? null,
        }));
      } else {
        mappedTasks[status] = [];
      }
    });

    mappedTasks['backlog'] = backlogTasks.map((task: TaskBacklogResponseDTO) => ({
      ...task,
      status: mapApiStatusToUI(task.status ?? 'To Do'),
      sprintId: null,
      reporterName: task.reporterName ?? null,
    }));

    setTasks(mappedTasks);
  }, [taskQueries, statuses, backlogTasks, sprintId]);

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
        createdBy: 1, // Replace with real user ID if needed
      }).unwrap();

      setTasks((prev) => {
        const fromKey = Object.keys(prev).find((key) => prev[key].some((t) => t.id === taskId));
        const toKey = toStatus;

        if (!fromKey) return prev;

        const taskToMove = prev[fromKey].find((t) => t.id === taskId);
        if (!taskToMove) return prev;

        const updated = { ...prev };
        updated[fromKey] = updated[fromKey].filter((t) => t.id !== taskId);
        updated[toKey] = [...(updated[toKey] || []), { ...taskToMove, status: toKey, sprintId: toSprintId }];
        return updated;
      });

      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (isSprintLoading || isCategoriesLoading || isBacklogLoading) return <div>Loading...</div>;
  if (sprintError) return <div>Error: {getErrorMessage(sprintError)}</div>;
  if (categoriesError) return <div>Error loading statuses: {getErrorMessage(categoriesError)}</div>;
  if (backlogError) return <div>Error loading backlog: {getErrorMessage(backlogError)}</div>;
  if (!activeSprint) return <div>No active sprint found for project {projectKey}</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-4">
        <KanbanHeader
          projectKey={projectKey}
          sprintName={activeSprint.name}
          projectId={activeSprint.projectId}
          onSearch={(query) => console.log('Search query:', query)}
        />
        <DndProvider backend={HTML5Backend}>
          <div className="flex space-x-4 overflow-x-auto">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                sprint={activeSprint}
                tasks={tasks[status] || []}
                moveTask={moveTask}
                status={status}
                isActive={true}
              />
            ))}
            <KanbanColumn
              key="backlog"
              sprint={{ id: null, name: 'Backlog', tasks: [] }}
              tasks={tasks['backlog'] || []}
              moveTask={moveTask}
              status="Backlog"
              isActive={false}
            />
          </div>
        </DndProvider>
      </div>
    </ErrorBoundary>
  );
};

export default KanbanBoardPage;