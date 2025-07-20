import React from 'react';
import EpicColumn from './EpicColumn';
import SprintColumn from './SprintColumn';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi';
import { type TaskBacklogResponseDTO } from '../../../services/taskApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: SprintWithTaskListResponseDTO[];
  epics: EpicWithStatsResponseDTO[];
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number; // Thêm projectId
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics, backlogTasks, projectId }) => {
  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 min-w-[640px]">
        {/* Epic Column */}
        <div className="w-full sm:w-1/3 md:w-1/4 min-w-[250px]">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>

        {/* Sprint Column */}
        <div className="w-full sm:w-2/3 md:w-3/4">
          <SprintColumn sprints={sprints} backlogTasks={backlogTasks} projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;