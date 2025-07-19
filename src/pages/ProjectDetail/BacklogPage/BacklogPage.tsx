// D:\GitHub\IntelliPM\IntelliPM_Frontend\src\pages\ProjectDetail\BacklogPage\BacklogPage.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetEpicsWithTasksByProjectKeyQuery, type EpicWithStatsResponseDTO } from '../../../services/epicApi';

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
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

  const [members] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/30' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/30' },
  ]);

  // Tạo danh sách sprints và backlog (dựa trên epicData nếu cần)
  const sprints: Sprint[] = [];
  const backlogTasks: Task[] = [];

  // Xử lý loading và error
  if (isProjectLoading || isEpicLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (projectError || epicError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading data: {(projectError || epicError) as string}
      </div>
    );
  }

  const handleCreateEpic = () => {
    alert('Create Epic clicked!');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase()); // Chuyển query thành lowercase để tìm kiếm không phân biệt hoa thường
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
      />
    </div>
  );
};

export default BacklogPage;