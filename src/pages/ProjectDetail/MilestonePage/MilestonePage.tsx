import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetSprintsByProjectKeyWithTasksQuery } from '../../../services/sprintApi';
import MilestoneHeader from './MilestoneHeader';
import MilestoneList from './MilestoneList';
import CreateMilestonePopup from './CreateMilestonePopup';

const MilestonePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const { data: projectData, isLoading: isProjectLoading } = useGetProjectDetailsByKeyQuery(projectKey);
  const { data: sprintData = [], isLoading: isSprintLoading } = useGetSprintsByProjectKeyWithTasksQuery(projectKey, {
    skip: !projectKey || projectKey === 'NotFound',
  });

  const toggleCreatePopup = () => {
    setIsCreatePopupOpen(!isCreatePopupOpen);
  };

  if (isProjectLoading || isSprintLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <MilestoneHeader
        projectKey={projectKey}
        projectId={projectData?.data?.id || 0}
        onCreateMilestone={toggleCreatePopup}
      />
      <MilestoneList
        projectId={projectData?.data?.id || 0}
        sprints={sprintData}
      />
      <CreateMilestonePopup
        isOpen={isCreatePopupOpen}
        onClose={toggleCreatePopup}
        projectId={projectData?.data?.id || 0}
      />
    </div>
  );
};

export default MilestonePage;
