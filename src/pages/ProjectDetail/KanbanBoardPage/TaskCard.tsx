import React, { forwardRef, useState } from 'react';
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
    item: { id: task.id, fromSprintId: sprintId, fromStatus: mapApiStatusToUI(task.status) },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  const dragRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    drag(node);
    if (ref) {
      if (typeof ref === 'function') ref(node);
      else if ('current' in ref) (ref as React.RefObject<HTMLDivElement>).current = node;
    }
  };

  const getIconSrc = (type: string | null | undefined): string => {
    const defaultIcon = taskIcon; // Fallback to taskIcon if no match
    switch (type) {
      case 'TASK':
        return taskIcon;
      case 'BUG':
        return bugIcon;
      case 'STORY':
        return storyIcon;
      case 'FEATURE': // Added new type as an example
        return storyIcon; // Reuse storyIcon for features
      default:
        return defaultIcon;
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
      {task.epicName && (
        <div className='inline-block text-xs font-bold uppercase text-purple-800 bg-purple-100 px-2 py-1 rounded mb-2 truncate max-w-full'>
          {task.epicName}
        </div>
      )}
      <div className='flex items-center justify-between mt-2'>
        <div className='flex items-center gap-1 text-xs text-gray-600'>
          {getIconSrc(task.type) && (
            <img src={getIconSrc(task.type)} alt={`${task.type} icon`} className='w-5 h-5 ml-1' />
          )}
          <span
            className={mapApiStatusToUI(task.status) === 'Done' ? 'line-through' : ''}
          >{`${task.id}`}</span>
        </div>
        <div className='flex items-center gap-1'>
          {task.taskAssignments && task.taskAssignments.length > 0 ? (
            task.taskAssignments.map((assignment) => {
              const [showTooltip, setShowTooltip] = useState(false);
              const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

              const handleMouseEnter = (e: React.MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  top: rect.bottom + window.scrollY,
                  left: rect.left + rect.width / 2,
                });
                setShowTooltip(true);
              };

              const handleMouseLeave = () => setShowTooltip(false);

              return (
                <div
                  key={assignment.id}
                  className='relative group'
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {assignment.accountPicture ? (
                    <img
                      src={assignment.accountPicture}
                      alt={assignment.accountFullname || 'Assignee'}
                      className='w-6 h-6 rounded-full object-cover'
                    />
                  ) : (
                    <User2 size={18} className='text-gray-400' />
                  )}
                  {showTooltip && assignment.accountFullname && (
                    <div
                      className='absolute bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap'
                      style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        position: 'fixed',
                      }}
                    >
                      {assignment.accountFullname}
                    </div>
                  )}
                </div>
              );
            })
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
