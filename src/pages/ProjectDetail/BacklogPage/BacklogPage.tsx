import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetEpicsWithTasksByProjectKeyQuery, type EpicWithStatsResponseDTO } from '../../../services/epicApi';
import { useGetSprintsByProjectKeyWithTasksQuery, type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import { useGetTasksFromBacklogQuery, type TaskBacklogResponseDTO } from '../../../services/taskApi';

const mapApiStatusToUI = (apiStatus: string | null | undefined): 'To Do' | 'In Progress' | 'Done' => {
  if (!apiStatus) {
    return 'To Do';
  }
  const normalizedStatus = apiStatus.toUpperCase();
  switch (normalizedStatus) {
    case 'TO_DO':
      return 'To Do';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
      return 'In Progress';
    case 'DONE':
      return 'Done';
    default:
      return 'To Do';
  }
};

const getErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error.data?.message) return error.data.message;
  if (error.status) return `Error ${error.status}: Failed to load data`;
  return 'Unknown error';
};

const BacklogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useGetProjectDetailsByKeyQuery(projectKey);
  const {
    data: epicData = [],
    isLoading: isEpicLoading,
    error: epicError,
  } = useGetEpicsWithTasksByProjectKeyQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const {
    data: sprintData = [],
    isLoading: isSprintLoading,
    error: sprintError,
  } = useGetSprintsByProjectKeyWithTasksQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const {
    data: backlogData = [],
    isLoading: isBacklogLoading,
    error: backlogError,
  } = useGetTasksFromBacklogQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });

  const sprints: SprintWithTaskListResponseDTO[] = (Array.isArray(sprintData) ? sprintData : []).map((sprint) => ({
    ...sprint,
    tasks: Array.isArray(sprint.tasks) ? sprint.tasks.map((task) => ({
      ...task,
      status: mapApiStatusToUI(task.status),
    })) : [],
  }));

  const backlogTasks: TaskBacklogResponseDTO[] = (Array.isArray(backlogData) ? backlogData : []).map((task) => ({
    ...task,
    status: mapApiStatusToUI(task.status),
  }));

  if (isProjectLoading || isEpicLoading || isSprintLoading || isBacklogLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (projectError || epicError || sprintError || backlogError) {
    const errorMessage = getErrorMessage(projectError || epicError || sprintError || backlogError);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading data: {errorMessage}
      </div>
    );
  }

  const handleCreateEpic = () => {
    alert('Create Epic clicked!');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredEpics = searchQuery
    ? epicData.filter((epic: EpicWithStatsResponseDTO) =>
        epic.name.toLowerCase().includes(searchQuery)
      )
    : epicData;

  return (
    <div className="min-h-screen p-0.1">
      <BacklogHeader onSearch={handleSearch} projectId={projectData?.data?.id || 0} />
      <DndProvider backend={HTML5Backend}>
        <BacklogBody
          onCreateEpic={handleCreateEpic}
          sprints={sprints}
          epics={filteredEpics}
          backlogTasks={backlogTasks}
          projectId={projectData?.data?.id || 0}
        />
      </DndProvider>
    </div>
  );
};

export default BacklogPage;