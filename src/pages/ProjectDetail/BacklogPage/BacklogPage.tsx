import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetEpicsWithTasksByProjectKeyQuery, type EpicWithStatsResponseDTO } from '../../../services/epicApi';
import { useGetSprintsByProjectKeyWithTasksQuery } from '../../../services/sprintApi';
import { useGetTasksFromBacklogQuery } from '../../../services/taskApi';

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: { name: string; picture?: string | null }[]; // Cập nhật assignee
  type?: 'task' | 'story' | 'bug';
  epicName?: string | null;
}

const BacklogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch project details to verify projectKey
  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useGetProjectDetailsByKeyQuery(projectKey);

  // Fetch epics with tasks by projectKey
  const {
    data: epicData = [],
    isLoading: isEpicLoading,
    error: epicError,
  } = useGetEpicsWithTasksByProjectKeyQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });

  // Fetch sprints with tasks by projectKey
  const {
    data: sprintData = [],
    isLoading: isSprintLoading,
    error: sprintError,
  } = useGetSprintsByProjectKeyWithTasksQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });

  // Fetch backlog tasks by projectKey
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

  // Ánh xạ dữ liệu sprints
  const sprints: Sprint[] = sprintData.map((sprint) => ({
    id: sprint.id.toString(),
    name: sprint.name,
    tasks: sprint.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status === 'TO_DO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done',
      type: task.type?.toLowerCase() as 'task' | 'story' | 'bug' | undefined,
      epicName: task.epicName || null,
      assignee: task.taskAssignments.map((a) => ({
        name: a.accountFullname || 'Unknown',
        picture: a.accountPicture || null,
      })) || [],
    })),
  }));

  // Ánh xạ dữ liệu backlogTasks
  const backlogTasks: Task[] = backlogData.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status === 'TO_DO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done',
    type: task.type?.toLowerCase() as 'task' | 'story' | 'bug' | undefined,
    epicName: task.epicName || null,
    assignee: task.taskAssignments.map((a) => ({
      name: a.accountFullname || 'Unknown',
      picture: a.accountPicture || null,
    })) || [],
  }));

  // Xử lý loading và error
  if (isProjectLoading || isEpicLoading || isSprintLoading || isBacklogLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (projectError || epicError || sprintError || backlogError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading data: {(projectError || epicError || sprintError || backlogError) as string}
      </div>
    );
  }

  const handleCreateEpic = () => {
    alert('Create Epic clicked!');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  // Lọc epics theo searchQuery (nếu có)
  const filteredEpics = searchQuery
    ? epicData.filter((epic: EpicWithStatsResponseDTO) =>
        epic.name.toLowerCase().includes(searchQuery)
      )
    : epicData;

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <BacklogHeader members={members} onSearch={handleSearch} />
      <BacklogBody
        onCreateEpic={handleCreateEpic}
        sprints={sprints}
        epics={filteredEpics}
        backlogTasks={backlogTasks}
      />
    </div>
  );
};

export default BacklogPage;