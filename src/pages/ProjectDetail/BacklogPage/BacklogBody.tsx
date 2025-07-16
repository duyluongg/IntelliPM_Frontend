import React from 'react';
import EpicColumn from './EpicColumn';
import SprintColumn from './SprintColumn';

// Định nghĩa Task và Sprint phù hợp với SprintColumn
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

interface EpicResponseDTO {
  id: string;
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  reporterId: number | null;
  assignedBy: number | null;
  assignedByFullname: string | null;
  assignedByPicture: string | null;
  reporterFullname: string | null;
  reporterPicture: string | null;
  sprintId: number | null;
  sprintName: string | null;
  sprintGoal: string | null;
}

interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: Sprint[];
  epics: EpicResponseDTO[];
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics }) => {
  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 min-w-[640px]">
        {/* Epic Column */}
        <div className="w-full sm:w-1/3 md:w-1/4 min-w-[250px]">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>

        {/* Sprint Column */}
        <div className="w-full sm:w-2/3 md:w-3/4">
          <SprintColumn sprints={sprints} backlogTasks={sprints.length > 0 ? [] : sprints.flatMap(s => s.tasks)} />
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;