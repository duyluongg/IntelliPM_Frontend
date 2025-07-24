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
      <div className="flex flex-col sm:flex-row gap-0 min-w-[250px]">
        <div className="w-[250px] shrink-0">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>
        <div className="flex-1 pl-2">
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