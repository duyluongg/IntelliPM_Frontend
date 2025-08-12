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
  epics: EpicWithStatsResponseDTO[] | undefined; // Allow undefined from parent
  backlogTasks: TaskBacklogResponseDTO[];
  projectId: number;
}

const BacklogBody: React.FC<BacklogBodyProps> = ({ onCreateEpic, sprints, epics = [], backlogTasks, projectId }) => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { refetch: refetchSprints, isLoading: sprintsLoading } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);
  const { refetch: refetchBacklog, isLoading: backlogLoading } = useGetTasksFromBacklogQuery(projectKey);

  const handleTaskUpdated = () => {
    refetchSprints();
    refetchBacklog();
  };

  if (sprintsLoading || backlogLoading) {
    return <div className="p-4 text-gray-600">Loading sprints and tasks...</div>;
  }

  return (
    <div className="bg-white min-h-screen p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-0 min-w-[250px]">
        <div className="w-[250px] shrink-0">
          <EpicColumn epics={epics} onCreateEpic={onCreateEpic} />
        </div>
        <div className="flex-1 pl-2">
          <SprintColumn
            sprints={sprints}
            epics={epics} // epics is now guaranteed to be an array
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