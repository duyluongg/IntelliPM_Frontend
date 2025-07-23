import React, { forwardRef } from 'react';
import { useDrag } from 'react-dnd';

const TaskCard = forwardRef<HTMLDivElement, {
  task: any;
  sprintId: number | null;
  moveTask: (taskId: string, fromSprintId: number | null, toSprintId: number | null, toStatus: string) => void;
}>(({ task, sprintId, moveTask }, ref) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, fromSprintId: sprintId || null, fromStatus: task.status },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  // Kết hợp ref từ useDrag và ref từ forwardRef
  const dragRef = (node: HTMLDivElement) => {
    drag(node);
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
      ref={dragRef}
      className={`p-2 bg-white border rounded shadow-sm mb-2 cursor-move ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => alert(`Edit task ${task.id}`)}
    >
      <h4 className="text-sm font-medium">{task.title || 'No title'}</h4>
      <p className="text-xs text-gray-500">ID: {task.id}</p>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;