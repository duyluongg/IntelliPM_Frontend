import React, { useEffect, useRef } from 'react';
import { useGetTaskByIdQuery } from '../../../services/taskApi';

type TaskGanttType = {
  id?: string;
  label: string;
  description?: string;
  dateStart?: Date;
  dateEnd?: Date;
  duration?: number;
  progress?: number;
  connections?: any[];
};

type TaskType = {
  id: string | null;
  reporterId: number;
  projectId: number;
  epicId: string;
  sprintId: number;
  type: string | null;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  // duration: string | null;
  percentComplete: number | null;
  plannedHours: number | null;
  actualHours: number | null;
  remainingHours: number | null;
  plannedCost: number | null;
  plannedResourceCost: number | null;
  actualCost: number | null;
  actualResourceCost: number | null;
  priority: string;
  status: string;
  evaluate: string | null;
  createdAt: string;
  updatedAt: string;
  dependencies: TaskDependency[];
};

interface TaskDependency {
  id: number;
  taskId: string;
  linkedFrom: string;
  linkedTo: string;
  type: string;
}

type Props = {
  task: TaskType;
  type: 'task' | 'project' | 'milestone';
  onSave: (updatedTask: Partial<TaskType>) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const TaskPopupEditor = ({ task, type, onSave, onCancel, onDelete }: Props) => {
  const labelRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const predecessorsRef = useRef<HTMLInputElement>(null);
  const successorsRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('📦 Task passed from Gantt:', task);
    if (task) {
      if (labelRef.current) labelRef.current.value = task.title || '';
      if (descRef.current) descRef.current.value = task.description || '';
      if (startRef.current) startRef.current.value = task.plannedStartDate?.split('T')[0] || '';
      if (endRef.current) endRef.current.value = task.plannedEndDate?.split('T')[0] || '';
      // if (durationRef.current) durationRef.current.value = task.duration?.toString() || '';
      if (progressRef.current) progressRef.current.value = task.percentComplete?.toString() || '0';

      const predecessors =
        task.dependencies
          ?.filter((d) => d.linkedTo === task.id)
          .map((d) => d.linkedFrom)
          .join(',') || '';
      const successors =
        task.dependencies
          ?.filter((d) => d.linkedFrom === task.id)
          .map((d) => d.linkedTo)
          .join(',') || '';

      if (predecessorsRef.current) predecessorsRef.current.value = predecessors;
      if (successorsRef.current) successorsRef.current.value = successors;
    }
  }, [task]);

  // const toLocalDate = (dateStr: string | null | undefined): Date | undefined => {
  //   if (!dateStr) return undefined;
  //   const d = new Date(dateStr);
  //   return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // };

  const parseDateToUTC = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const handleSave = () => {
    const updatedTask: TaskGanttType = {
      id: task.id ? `task-${task.id}` : undefined,
      label: labelRef.current?.value || '',
      description: descRef.current?.value || '',
      // dateStart: startRef.current?.value ? toLocalDate(startRef.current.value) : undefined,
      // dateEnd: endRef.current?.value ? new Date(endRef.current.value) : undefined,
      dateStart: startRef.current?.value ? parseDateToUTC(startRef.current.value) : undefined,
      dateEnd: endRef.current?.value ? parseDateToUTC(endRef.current.value) : undefined,
      // duration: durationRef.current?.value || null,
      progress: parseInt(progressRef.current?.value || '0'),
      connections:
        task.dependencies?.map((dep) => ({
          target: `task-${dep.linkedTo}`,
          type: 1,
        })) || [],
    };

    onSave(updatedTask);
  };

  return (
    <div ref={popupRef} className='flex items-center justify-center'>
      <div className='w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border rounded shadow px-2 py-2'>
        <div className='bg-blue-600 text-white px-4 py-2 rounded-t font-semibold'>Edit Task</div>

        <div className='p-4 space-y-3'>
          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Name</label>
            <input ref={labelRef} className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Description</label>
            <textarea ref={descRef} rows={3} className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Type</label>
            <select className='border p-2 rounded'>
              <option value='task'>Task</option>
              <option value='milestone'>Milestone</option>
            </select>
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Start date</label>
            <input ref={startRef} type='date' className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>End date</label>
            <input ref={endRef} type='date' className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Duration</label>
            <input ref={durationRef} type='number' className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Progress</label>
            <input ref={progressRef} type='range' min='0' max='100' className='w-full' />
            <div className='text-right text-xs text-gray-500'>
              {progressRef.current?.value || 0}%
            </div>
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Predecessors</label>
            <input ref={predecessorsRef} className='border p-2 rounded' />
          </div>

          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Successors</label>
            <input ref={successorsRef} className='border p-2 rounded' />
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <button
              onClick={handleSave}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            >
              Save
            </button>
            <button onClick={onCancel} className='bg-gray-300 px-4 py-2 rounded hover:bg-gray-400'>
              Cancel
            </button>
            <button
              onClick={onDelete}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// const TaskPopupEditor = ({ task, type, onSave, onCancel, onDelete }: Props) => {
//   if (!task) return null;

//   switch (type) {
//     case 'project':
//       return (
//         <SprintEditor
//           task={task}
//           onSave={onSave}
//           onCancel={onCancel}
//           onDelete={onDelete}
//         />
//       );
//     default:
//       return null;
//   }
// };


export default TaskPopupEditor;
