import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BacklogHeader from './BacklogHeader';
import BacklogBody from './BacklogBody';
import { useGetProjectDetailsByKeyQuery, useGetWorkItemsByProjectIdQuery } from '../../../services/projectApi';
import { useGetEpicsByProjectIdQuery } from '../../../services/epicApi';

const BacklogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch project details to get projectId
  const { data: projectData } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectData?.data?.id || 0;

  // Fetch epics by projectId
  const { data: epicData = [], isLoading: isEpicLoading, error: epicError } = useGetEpicsByProjectIdQuery(projectId, {
    skip: !projectId, // Skip query if projectId is not available
  });

  // Fetch work items (for potential future use)
  const { data: workItemsData } = useGetWorkItemsByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const [members] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/30' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/30' },
  ]);

  const sprints = [
    { id: '1', name: 'Sprint 1', tasks: [{ id: 't1', title: 'Task 1', status: 'To Do' }, { id: 't2', title: 'Task 2', status: 'In Progress' }] },
    { id: '2', name: 'Sprint 2', tasks: [{ id: 't3', title: 'Task 3', status: 'Done' }] },
  ];

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
