import React, { forwardRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

const KanbanColumn = forwardRef<HTMLDivElement, {
  sprint: SprintWithTaskListResponseDTO | { id: null; name: string; tasks: [] };
  tasks: any[];
  moveTask: (taskId: string, fromSprintId: number | null, toSprintId: number | null, toStatus: string) => void;
}>(({ sprint, tasks, moveTask }, ref) => {
  const statuses = ['To Do', 'In Progress', 'Done'];

  const [, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; fromSprintId: number | null; fromStatus: string }) => {
      moveTask(item.id, item.fromSprintId, sprint.id || null, statuses[0]);
    },
  }));

  // Kết hợp ref từ useDrop và ref từ forwardRef
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
    <div ref={dropRef} className="w-80 shrink-0 p-2 bg-gray-50 rounded">
      <h2 className="text-lg font-semibold mb-2">{sprint.name || 'Backlog'}</h2>
      {statuses.map((status) => (
        <div key={status} className="mb-4">
          <h3 className="text-sm font-medium text-gray-600">{status}</h3>
          <div className="space-y-2">
            {tasks.filter(task => task.status === status).map((task) => (
              <TaskCard key={task.id} task={task} sprintId={sprint.id || null} moveTask={moveTask} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;