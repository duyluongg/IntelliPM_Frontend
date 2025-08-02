import React from 'react';
import { useGetMilestonesByProjectIdQuery } from '../../../services/milestoneApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import MilestoneCard from './MilestoneCard';

interface MilestoneListProps {
  projectId: number;
  sprints: SprintWithTaskListResponseDTO[];
}

const MilestoneList: React.FC<MilestoneListProps> = ({ projectId, sprints }) => {
  const { data: milestones = [], isLoading, error } = useGetMilestonesByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading milestones...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading milestones: {(error as any)?.data?.message || 'Unknown error'}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {milestones.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">No milestones available</div>
      ) : (
        milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            sprints={sprints}
          />
        ))
      )}
    </div>
  );
};

export default MilestoneList;
