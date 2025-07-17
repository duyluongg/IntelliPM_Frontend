import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetEpicsByProjectIdQuery } from '../../../services/epicApi';
import { useGetTasksByProjectIdQuery , type TaskResponseDTO} from '../../../services/taskApi';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
}

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

const BacklogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch project details to get projectId
  const { data: projectData } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectData?.data?.id || 0;

  // Fetch epics by projectId
  const { data: epicData = [], isLoading: isEpicLoading, error: epicError } = useGetEpicsByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  // Fetch tasks by projectId
  const { data: taskData = [], isLoading: isTaskLoading, error: taskError } = useGetTasksByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const [members] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/30' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/30' },
  ]);

  // Tạo danh sách sprints và backlog từ taskData
  const sprints: Sprint[] = [];
  const backlogTasks: Task[] = [];

  taskData.forEach((task: TaskResponseDTO) => {
    const taskStatus = task.status as 'To Do' | 'In Progress' | 'Done'; // Ép kiểu status
    if (task.sprintId !== null && task.sprintId !== undefined) { // Kiểm tra sprintId không null/undefined
      const sprintIdStr = task.sprintId.toString();
      let sprint = sprints.find(s => s.id === sprintIdStr);
      if (!sprint) {
        sprint = { id: sprintIdStr, name: task.sprintName || `Sprint ${task.sprintId}`, tasks: [] };
        sprints.push(sprint);
      }
      sprint.tasks.push({
        id: task.id,
        title: task.title,
        status: taskStatus,
        assignee: task.assigneeId ? task.reporterName || 'Unknown' : undefined,
      });
    } else {
      backlogTasks.push({
        id: task.id,
        title: task.title,
        status: taskStatus,
        assignee: task.assigneeId ? task.reporterName || 'Unknown' : undefined,
      });
    }
  });

  const handleCreateEpic = () => {
    alert('Create Epic clicked!');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <BacklogHeader members={members} onSearch={handleSearch} />
      <BacklogBody onCreateEpic={handleCreateEpic} sprints={sprints} epics={epicData} />
    </div>
  );
};

export default BacklogPage;