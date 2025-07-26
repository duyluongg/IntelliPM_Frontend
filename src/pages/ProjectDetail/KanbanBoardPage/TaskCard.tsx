import React, { forwardRef } from 'react';
import { useDrag } from 'react-dnd';
import { type TaskBacklogResponseDTO } from '../../../services/taskApi';
import { mapApiStatusToUI } from './Utils';
import taskIcon from '../../../assets/icon/type_task.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import storyIcon from '../../../assets/icon/type_story.svg';
import { User2 } from 'lucide-react';

interface TaskCardProps {
  task: TaskBacklogResponseDTO;
  sprintId: number | null;
  moveTask: (
    taskId: string,
    fromSprintId: number | null,
    toSprintId: number | null,
    toStatus: string
  ) => void;
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task, sprintId }, ref) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: {
      id: task.id,
      fromSprintId: sprintId,
      fromStatus: mapApiStatusToUI(task.status),
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const dragRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    drag(node);

    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else if ('current' in ref) {
        (ref as React.RefObject<HTMLDivElement>).current = node;
      }
    }
  };

  const getIconSrc = (type: string | null | undefined): string | undefined => {
    switch (type) {
      case 'TASK':
        return taskIcon;
      case 'BUG':
        return bugIcon;
      case 'STORY':
        return storyIcon;
      default:
        return undefined;
    }
  };

  return (
    <div
      ref={dragRef}
      className={`bg-white rounded-md border shadow p-3 mb-2 cursor-move transition-opacity ${
        isDragging ? 'opacity-40' : ''
      }`}
      onClick={() => alert(`Edit task ${task.id}`)}
    >
      <div className='text-sm font-medium text-gray-900 mb-2'>{task.title || 'No title'}</div>

      {/* Label - Epic name */}
      {task.epicName && (
        <div className='inline-block text-xs font-bold uppercase text-purple-800 bg-purple-100 px-2 py-1 rounded mb-2 truncate max-w-full'>
          {task.epicName}
        </div>
      )}

      <div className='flex items-center justify-between mt-2'>
        <div className='flex items-center gap-1 text-xs text-gray-600'>
          <input type='checkbox' checked readOnly className='text-blue-600 w-4 h-4' />
          <span>{`TB-${task.id}`}</span>
        </div>

        <div className='flex items-center gap-1'>
          {task.taskAssignments && task.taskAssignments.length > 0 ? (
            task.taskAssignments.map((assignment) => (
              <div key={assignment.id} className='relative group'>
                {assignment.accountPicture ? (
                  <img
                    src={assignment.accountPicture}
                    alt={assignment.accountFullname || 'Assignee'}
                    className='w-6 h-6 rounded-full object-cover'
                  />
                ) : (
                  <User2 size={18} className='text-gray-400' />
                )}
                {assignment.accountFullname && (
                  <div className='absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    {assignment.accountFullname}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center'>
              <User2 size={18} className='text-gray-400' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
