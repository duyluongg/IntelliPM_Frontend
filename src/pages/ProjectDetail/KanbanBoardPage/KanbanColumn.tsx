import React, { forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';
import { type SprintResponseDTO } from '../../../services/sprintApi';
import { type TaskBacklogResponseDTO } from '../../../services/taskApi';
import { Link, useLocation } from 'react-router-dom';

const KanbanColumn = forwardRef<
  HTMLDivElement,
  {
    sprint: SprintResponseDTO | { id: number | null; name: string };
    tasks: TaskBacklogResponseDTO[];
    moveTask: (
      taskId: string,
      fromSprintId: number | null,
      toSprintId: number | null,
      toStatus: string
    ) => void;
    status: string;
    isActive: boolean;
  }
>(({ sprint, tasks, moveTask, status, isActive }, ref) => {
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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectKey = searchParams.get('projectKey') || 'NotFound';

  const isToDoColumn = status.toLowerCase() === 'to do';
  const isDoneColumn = status.toLowerCase() === 'done';
  const isEmpty = !tasks || tasks.length === 0;
  const isFromSprintId = sprint.id === 0;

  return (
    <div
      ref={dropRef}
      className={`w-64 shrink-0 p-2 rounded-lg border bg-gray-100 shadow-sm flex flex-col `}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            {status}
          </span>
          <span className='w-6 h-4 flex items-center justify-center text-xs text-gray-600 bg-gray-200 border rounded-md'>
            {tasks.length}
          </span>

          {isDoneColumn && (
            <svg fill='none' viewBox='0 0 16 16' className='w-3.5 h-3.5 text-green-700 ml-2'>
              <path
                fill='currentColor'
                fillRule='evenodd'
                d='m15.076 3.23-8.75 10.5a.75.75 0 0 1-1.159-.008l-4.25-5.25 1.166-.944 3.675 4.54 8.166-9.798z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
      </div>

      {isToDoColumn && isEmpty && isFromSprintId ? (
        <div className='flex flex-col items-center justify-center text-center flex-1 py-6 px-2 space-y-4'>
          <img
            src='https://res.cloudinary.com/didnsp4p0/image/upload/v1753332373/agile.52407441_vr4hl4.svg'
            alt='Agile Scrum'
            className='w-24 h-24 object-contain'
          />
          <div>
            <p className='text-sm font-semibold text-gray-800'>Get started in the backlog</p>
            <p className='text-sm text-gray-500'>Plan and start a sprint to see work here.</p>
          </div>
          <Link
            to={`/project?projectKey=${projectKey}#backlog`}
            className='px-3 py-1.5 text-sm border rounded hover:bg-gray-100 transition text-gray-700 border-gray-300'
          >
            Go to Backlog
          </Link>
        </div>
      ) : (
        <div className='space-y-2 flex-1 overflow-y-auto overflow-x-hidden'>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} sprintId={sprint.id || null} moveTask={moveTask} />
          ))}
        </div>
      )}
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;