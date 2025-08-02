import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetSprintsByProjectKeyWithTasksQuery } from '../../../services/sprintApi';
import { useGetMilestonesByProjectIdQuery } from '../../../services/milestoneApi';
import MilestoneHeader from './MilestoneHeader';
import MilestoneList from './MilestoneList';
import CreateMilestonePopup from './CreateMilestonePopup';

const MilestonePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('All');
  const [sprintFilter, setSprintFilter] = useState<string | null>('All');
  const [keyFilter, setKeyFilter] = useState<string | null>(null);

  const { data: projectData, isLoading: isProjectLoading } = useGetProjectDetailsByKeyQuery(projectKey);
  const { data: sprintData = [], isLoading: isSprintLoading } = useGetSprintsByProjectKeyWithTasksQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });
  const { data: milestoneData = [], refetch: refetchMilestones } = useGetMilestonesByProjectIdQuery(projectData?.data?.id || 0, {
    skip: !projectData?.data?.id,
  });

  const toggleCreatePopup = () => {
    setIsCreatePopupOpen(!isCreatePopupOpen);
  };

  const handleMilestoneCreated = () => {
    refetchMilestones();
    toggleCreatePopup();
  };

  const handleSortChange = (newDateFilter: string, newSprintFilter: string | null) => {
    setDateFilter(newDateFilter);
    setSprintFilter(newSprintFilter);
    setKeyFilter(null); // Reset keyFilter khi thay đổi dateFilter hoặc sprintFilter
  };

  const handleKeyFilter = (key: string | null) => {
    setKeyFilter(key);
  };

  if (isProjectLoading || isSprintLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-gray-500 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
      <div className="max-w-7xl mx-auto">
        <MilestoneHeader
          projectKey={projectKey}
          projectId={projectData?.data?.id || 0}
          sprints={sprintData}
          milestones={milestoneData}
          keyFilter={keyFilter}
          onCreateMilestone={toggleCreatePopup}
          onSortChange={handleSortChange}
          onKeyFilter={handleKeyFilter}
        />
        <MilestoneList
          projectId={projectData?.data?.id || 0}
          sprints={sprintData}
          refetchMilestones={refetchMilestones}
          dateFilter={dateFilter}
          sprintFilter={sprintFilter}
          keyFilter={keyFilter}
        />
        <CreateMilestonePopup
          isOpen={isCreatePopupOpen}
          onClose={toggleCreatePopup}
          onMilestoneCreated={handleMilestoneCreated}
          projectId={projectData?.data?.id || 0}
        />
      </div>
    </div>
  );
};

export default MilestonePage;