import React, { useEffect, useRef } from 'react';

type TaskType = {
  label: string;
  description?: string;
  dateStart?: Date;
  dateEnd?: Date;
  duration?: number;
  progress?: number;
  connections?: any[];
};

type Props = {
  task: TaskType;
  onSave: (updatedTask: Partial<TaskType>) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const TaskPopupEditor = ({ task, onSave, onCancel, onDelete }: Props) => {
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
    if (task) {
      if (labelRef.current) labelRef.current.value = task.label || '';
      if (descRef.current) descRef.current.value = task.description || '';
      if (startRef.current)
        startRef.current.value = task.dateStart?.toISOString().split('T')[0] || '';
      if (endRef.current) endRef.current.value = task.dateEnd?.toISOString().split('T')[0] || '';
      if (durationRef.current) durationRef.current.value = task.duration?.toString() || '';
      if (progressRef.current) progressRef.current.value = task.progress?.toString() || '0';
      if (predecessorsRef.current)
        predecessorsRef.current.value =
          task.connections
            ?.filter((c: any) => c.type === 'from')
            .map((c: any) => c.target)
            .join(',') || '';
      if (successorsRef.current)
        successorsRef.current.value =
          task.connections
            ?.filter((c: any) => c.type === 'to')
            .map((c: any) => c.target)
            .join(',') || '';
    }
  }, [task]);

  const handleSave = () => {
    const updatedTask: Partial<TaskType> = {
      label: labelRef.current?.value || '',
      description: descRef.current?.value || '',
      dateStart: startRef.current?.value ? new Date(startRef.current.value) : undefined,
      dateEnd: endRef.current?.value ? new Date(endRef.current.value) : undefined,
      duration: parseInt(durationRef.current?.value || '0'),
      progress: parseInt(progressRef.current?.value || '0'),
      connections: [],
    };

    onSave(updatedTask);
  };

  return (
    <div
      ref={popupRef}
      className='flex items-center justify-center'
    >
      <div className='w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border rounded shadow px-2 py-2'>
        <div className='bg-blue-600 text-white px-4 py-2 rounded-t font-semibold'>Edit Task</div>

        <div className='p-4 space-y-3'>
          <div className='flex flex-col'>
            <label className='text-sm font-semibold mb-1'>Name</label>
            <input ref={labelRef} className='border p-2 rounded' />
          </div>

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
              {progressRef.current?.value || task.progress || 0}%
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

export default TaskPopupEditor;
