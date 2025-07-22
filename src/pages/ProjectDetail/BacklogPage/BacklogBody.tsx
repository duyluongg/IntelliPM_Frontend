import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetSprintsByProjectKeyWithTasksQuery } from '../../../services/sprintApi';
import EpicColumn from './EpicColumn';
import SprintColumn from './SprintColumn';
import { type EpicWithStatsResponseDTO } from '../../../services/epicApi';
import { type TaskBacklogResponseDTO, useGetTasksFromBacklogQuery } from '../../../services/taskApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

interface BacklogBodyProps {
  onCreateEpic: () => void;
  sprints: SprintWithTaskListResponseDTO[];
  epics: EpicWithStatsResponseDTO[];
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number;
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics, backlogTasks, projectId }) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { refetch: refetchSprints } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);
  const { refetch: refetchBacklog } = useGetTasksFromBacklogQuery(projectKey);

  const handleTaskUpdated = () => {
    refetchSprints();
    refetchBacklog();
  };

  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-4 min-w-[640px]">
        {/* Epic Column */}
        <div className="w-full sm:w-1/3 md:w-1/4 min-w-[250px]">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>

        {/* Sprint Column */}
        <div className="w-full sm:w-2/3 md:w-3/4">
          <SprintColumn
            sprints={sprints}
            backlogTasks={backlogTasks}
            projectId={projectId}
            projectKey={projectKey} 
            onTaskUpdated={handleTaskUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default BacklogBody;