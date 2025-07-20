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
    console.warn('API status is null or undefined, defaulting to To Do');
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
      console.warn(`Unknown API status: ${apiStatus}, defaulting to To Do`);
      return 'To Do';
  }
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

  const [members] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/30' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/30' },
  ]);

  console.log('Raw Sprint Data:', sprintData);
  console.log('Raw Backlog Data:', backlogData);

  const sprints: SprintWithTaskListResponseDTO[] = sprintData.map((sprint) => ({
    ...sprint,
    tasks: sprint.tasks.map((task) => ({
      ...task,
      status: mapApiStatusToUI(task.status),
    })),
  }));

  const backlogTasks: TaskBacklogResponseDTO[] = backlogData.map((task) => ({
    ...task,
    status: mapApiStatusToUI(task.status),
  }));

  if (isProjectLoading || isEpicLoading || isSprintLoading || isBacklogLoading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  if (projectError || epicError || sprintError || backlogError) {
    return (
      <div className="p-4 text-center text-red-500">
        Lỗi tải dữ liệu: {(projectError || epicError || sprintError || backlogError) as string}
      </div>
    );
  }

  const handleCreateEpic = () => {
    alert('Tạo Epic được click!');
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
    <div className="bg-gray-100 min-h-screen p-4">
      <BacklogHeader members={members} onSearch={handleSearch} />
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