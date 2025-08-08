import React from 'react';
import { useGetMilestonesByProjectIdQuery, type MilestoneResponseDTO } from '../../../services/milestoneApi';
import MilestoneCard from './MilestoneCard';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

interface MilestoneListProps {
  projectId: number;
  sprints: SprintWithTaskListResponseDTO[];
  refetchMilestones: () => void;
  dateFilter: string;
  sprintFilter: string | null;
  keyFilter: string | null;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ projectId, sprints, refetchMilestones, dateFilter, sprintFilter, keyFilter }) => {
  const { data: milestones = [], isLoading } = useGetMilestonesByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const filterMilestones = (milestones: MilestoneResponseDTO[]): MilestoneResponseDTO[] => {
    return milestones.filter((milestone) => {
      const endDate = new Date(milestone.endDate);
      const sprintMatch = sprintFilter === 'All' || 
        (sprintFilter === null && milestone.sprintId === null) || 
        milestone.sprintId === (sprintFilter ? Number(sprintFilter) : null);
      const keyMatch = keyFilter === null || milestone.key === keyFilter;

      if (!keyMatch) return false;

      switch (dateFilter) {
        case 'Today':
          return sprintMatch && endDate.toDateString() === today.toDateString();
        case 'This Week':
          return sprintMatch && endDate >= startOfWeek && endDate <= endOfWeek;
        case 'Next Week':
          return sprintMatch && endDate >= startOfNextWeek && endDate <= endOfNextWeek;
        case 'This Month':
          return sprintMatch && endDate >= startOfMonth && endDate <= endOfMonth;
        case 'Next Month':
          return sprintMatch && endDate >= startOfNextMonth && endDate <= endOfNextMonth;
        case 'All':
        default:
          return sprintMatch;
      }
    });
  };

  const sortMilestones = (milestones: MilestoneResponseDTO[]): MilestoneResponseDTO[] => {
    return [...milestones].sort((a, b) => {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      return dateA - dateB;
    });
  };

  const filteredMilestones = sortMilestones(filterMilestones(milestones));

  if (isLoading) {
    return (
      <div className="text-gray-500 text-lg animate-pulse text-center mt-8">
        Loading milestones...
      </div>
    );
  }

  if (!filteredMilestones.length) {
    return (
      <div className="text-gray-500 text-lg text-center mt-8">
        No milestones found.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredMilestones.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          sprints={sprints}
          refetchMilestones={refetchMilestones}
        />
      ))}
    </div>
  );
};

export default MilestoneList;