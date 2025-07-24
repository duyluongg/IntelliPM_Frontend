import React, { forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { type SprintResponseDTO } from '../../../services/sprintApi';
import { type TaskBacklogResponseDTO } from '../../../services/taskApi';

const KanbanColumn = forwardRef<HTMLDivElement, {
  sprint: SprintResponseDTO | { id: null; name: string; tasks: TaskBacklogResponseDTO[] };
  tasks: TaskBacklogResponseDTO[];
  moveTask: (taskId: string, fromSprintId: number | null, toSprintId: number | null, toStatus: string) => void;
  status: string;
  isActive: boolean;
}>(({ sprint, tasks, moveTask, status, isActive }, ref) => {
  const [, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; fromSprintId: number | null; fromStatus: string }) => {
      moveTask(item.id, item.fromSprintId, sprint.id || null, status);
    },
  }));

  const dropRef = (node: HTMLDivElement) => {
    drop(node);
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else if ('current' in ref) {
        (ref as React.RefObject<HTMLDivElement>).current = node;
      }
    }
  };

  return (
    <div
      ref={dropRef}
      className={`w-64 shrink-0 p-2 rounded ${isActive ? 'bg-gray-100' : 'bg-gray-50'}`}
    >
      <h2 className="text-lg font-semibold mb-2">
        {status} ({tasks.length})
      </h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            sprintId={sprint.id || null}
            moveTask={moveTask}
          />
        ))}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;