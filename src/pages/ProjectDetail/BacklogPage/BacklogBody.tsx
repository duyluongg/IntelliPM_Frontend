import React from 'react';
import EpicColumn from './EpicColumn';
import SprintColumn from './SprintColumn';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: { name: string; picture?: string | null }[];
  type?: 'task' | 'story' | 'bug';
  epicName?: string | null;
}

interface Sprint {
  id: string;
  name: string;
  tasks: Task[];
}

interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: Sprint[];
  epics: EpicWithStatsResponseDTO[];
  backlogTasks: Task[];
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics, backlogTasks }) => {
  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 min-w-[640px]">
        {/* Epic Column */}
        <div className="w-full sm:w-1/3 md:w-1/4 min-w-[250px]">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>

        {/* Sprint Column */}
        <div className="w-full sm:w-2/3 md:w-3/4">
          <SprintColumn sprints={sprints} backlogTasks={backlogTasks} />
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;