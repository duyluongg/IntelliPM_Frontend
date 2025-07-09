// import { useEffect, useRef, useState } from 'react';
// import { GanttChart } from 'smart-webcomponents-react/ganttchart';
// import 'smart-webcomponents-react/source/styles/smart.default.css';
// import { useSearchParams } from 'react-router-dom';
// import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
// import './Gantt.css';

// const Gantt = () => {
//   // const ganttRef = useRef(null);
//   const ganttChart = useRef(null);
//   const ganttRef = useRef<any>(null);
//   const [searchParams] = useSearchParams();
//   const projectKey = searchParams.get('projectKey') || 'NotFound';
//   // const [adjustToNonworkingTime, setAdjustToNonworkingTime] = useState(true);
//   // let preventDefaultContextMenu = false;
//   const customWindowRef = useRef<HTMLDivElement>(null);
//   const selectedTaskRef = useRef<any>(null);

//   const popupWindowCustomizationFunction = (target: any, type: string, taskObj: any) => {
//     if (type === 'task' || type === 'project') {
//       target.headerPosition = 'none';
//       target.footerPosition = 'none';

//       selectedTaskRef.current = taskObj;

//       const taskLabel = customWindowRef.current?.querySelector('#taskLabel') as HTMLLabelElement;
//       const inputLabel = customWindowRef.current?.querySelector('#taskInput') as HTMLInputElement;
//       const inputProgress = customWindowRef.current?.querySelector(
//         '#progressInput'
//       ) as HTMLInputElement;

//       if (taskLabel) taskLabel.textContent = `Edit: ${taskObj.label}`;
//       if (inputLabel) inputLabel.value = taskObj.label;
//       if (inputProgress) inputProgress.value = taskObj.progress?.toString() || '0';

//       // 🧠 Quan trọng: Gắn lại sự kiện bằng JS thuần
//       const saveBtn = customWindowRef.current?.querySelector('#saveBtn');
//       const cancelBtn = customWindowRef.current?.querySelector('#cancelBtn');
//       const deleteBtn = customWindowRef.current?.querySelector('#deleteBtn');

//       // Xóa event cũ trước khi gán mới (tránh double fire nếu reuse DOM)
//       saveBtn?.removeEventListener('click', handleSave);
//       cancelBtn?.removeEventListener('click', handleCancel);
//       deleteBtn?.removeEventListener('click', handleDelete);

//       saveBtn?.addEventListener('click', handleSave);
//       cancelBtn?.addEventListener('click', handleCancel);
//       deleteBtn?.addEventListener('click', handleDelete);

//       target.appendChild(customWindowRef.current!);
//     }
//   };

//   const handleSave = () => {
//     const label = (customWindowRef.current?.querySelector('#taskInput') as HTMLInputElement)?.value;
//     const progress = parseInt(
//       (customWindowRef.current?.querySelector('#progressInput') as HTMLInputElement)?.value || '0'
//     );

//     ganttRef.current?.updateTask(selectedTaskRef.current, { label, progress });
//     ganttRef.current?.closeWindow();
//   };

//   const handleCancel = () => {
//     console.log('❌ Cancel button clicked');
//     ganttRef.current?.closeWindow();
//   };

//   const handleDelete = () => {
//     ganttRef.current?.removeTask(selectedTaskRef.current);
//     ganttRef.current?.closeWindow();
//   };

//   const {
//     data: projectData,
//     isLoading,
//     isError,
//     error,
//   } = useGetFullProjectDetailsByKeyQuery(projectKey);

//   const tasks = projectData?.data?.tasks || [];
//   const milestones = projectData?.data?.milestones || [];
//   const sprints = projectData?.data?.sprints || [];

//   const view = 'week';
//   const treeSize = '40%';
//   const durationUnit = 'day';
//   const hideTimelineHeaderDetails = true;
//   const snapToNearest = true;
//   // const nonworkingDays = [0, 6]; // Chủ nhật & Thứ bảy
//   // const nonworkingHours = [[18, 6]]; // Từ 6PM đến 6AM

//   const taskColumns = [
//     { label: 'Tasks', value: 'label', size: '30%' },
//     {
//       label: 'Planned Start',
//       value: 'dateStart',
//       formatFunction: (date: string | Date) => {
//         const d = new Date(date);
//         return d.toLocaleDateString('en-GB');
//       },
//     },
//     { label: 'Duration', value: 'duration' },
//     { label: '% complete', value: 'progress' },
//   ];

//   const timelineHeaderFormatFunction = (
//     date: Date,
//     type: string,
//     isHeaderDetails: boolean,
//     value: string
//   ) => {
//     const ganttChart = ganttRef.current as any;
//     if (type === 'day') {
//       return date.toLocaleDateString(ganttChart?.locale || 'en', {
//         day: 'numeric',
//         month: 'short',
//       });
//     }
//     return value;
//   };

//   const normalizeDateToLocalISO = (dateStr: string | null | undefined) => {
//     if (!dateStr) return undefined;
//     const date = new Date(dateStr);
//     date.setHours(0, 0, 0, 0); // Clear giờ
//     return date.toISOString().split('T')[0]; // "yyyy-mm-dd"
//   };

//   const toLocalDate = (dateStr: string | null | undefined): Date | undefined => {
//     if (!dateStr) return undefined;
//     const d = new Date(dateStr);
//     return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Giờ 00:00 local
//   };

//   const getDuration = (startStr: string, endStr: string) => {
//     const start = new Date(startStr);
//     const end = new Date(endStr);
//     start.setHours(0, 0, 0, 0);
//     end.setHours(0, 0, 0, 0);
//     const diffTime = end.getTime() - start.getTime();
//     return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để tính cả ngày cuối
//   };

//   const calcAverageProgress = (items: any[]): number => {
//     const taskProgress = items
//       .filter((i) => i.type === 'task' && typeof i.progress === 'number')
//       .map((i) => i.progress);

//     if (taskProgress.length === 0) return 0;

//     const total = taskProgress.reduce((a, b) => a + b, 0);
//     const average = total / taskProgress.length;

//     return Number(average.toFixed(1));
//   };

//   const buildDataSource = () => {
//     const sprintGroups = sprints.map((sprint) => {
//       const sprintTasks = tasks
//         .filter((t) => t.sprintId === sprint.id)
//         .map((t) => {
//           const start = normalizeDateToLocalISO(t.plannedStartDate);
//           const end = normalizeDateToLocalISO(t.plannedEndDate);
//           return {
//             label: t.title,
//             dateStart: toLocalDate(t.plannedStartDate),
//             duration: start && end ? getDuration(start, end) : undefined,
//             progress: t.percentComplete ?? undefined,
//             type: 'task',
//             id: `task-${t.id}`,
//           };
//         });

//       const sprintMilestones = milestones
//         .filter((m) => m.sprintId === sprint.id)
//         .map((m) => {
//           const start = normalizeDateToLocalISO(m.startDate);
//           const end = normalizeDateToLocalISO(m.endDate);
//           return {
//             label: m.name,
//             dateStart: toLocalDate(m.startDate) || undefined,
//             // dateEnd: m.endDate || undefined,
//             duration: start && end ? getDuration(start, end) : undefined,
//             type: 'milestone',
//             id: `milestone-${m.id}`,
//           };
//         });

//       const sprintTasksAndMilestones = [...sprintTasks, ...sprintMilestones];

//       const start = normalizeDateToLocalISO(sprint.startDate);
//       const end = normalizeDateToLocalISO(sprint.endDate);
//       return {
//         label: sprint.name,
//         dateStart: toLocalDate(sprint.startDate),
//         // dateEnd: sprint.endDate,
//         duration: start && end ? getDuration(start, end) : undefined,
//         progress: calcAverageProgress(sprintTasksAndMilestones) ?? 0,
//         type: 'project',
//         expanded: true,
//         tasks: [...sprintTasks, ...sprintMilestones],
//       };
//     });

//     const standaloneMilestones = milestones
//       .filter((m) => !m.sprintId)
//       .map((m) => ({
//         label: m.name,
//         dateStart: toLocalDate(m.startDate),
//         type: 'milestone',
//         id: `milestone-${m.id}`,
//       }));

//     return [...sprintGroups, ...standaloneMilestones];
//   };

//   const dataSource = buildDataSource();

//   return (
//     <div>
//       {isLoading && <div>⏳ Loading...</div>}
//       {isError && (
//         <div className='text-red-500'>
//           ❌ Error: {(error as any)?.data?.message || 'Cannot load data!'}
//         </div>
//       )}

//       {!isLoading && !isError && (
//         <GanttChart
//           ref={ganttRef}
//           id='gantt'
//           view={view}
//           treeSize={treeSize}
//           dataSource={dataSource}
//           taskColumns={taskColumns}
//           durationUnit={durationUnit}
//           snapToNearest={snapToNearest}
//           hideTimelineHeaderDetails={hideTimelineHeaderDetails}
//           timelineHeaderFormatFunction={timelineHeaderFormatFunction}
//           // adjustToNonworkingTime={adjustToNonworkingTime}
//           // nonworkingDays={nonworkingDays}
//           // nonworkingHours={nonworkingHours}
//           popupWindowCustomizationFunction={popupWindowCustomizationFunction}
//         />
//       )}

//       <div style={{ display: 'none' }}>
//         <div ref={customWindowRef} className='custom-window'>
//           <label id='taskLabel' className='font-bold block mb-2'></label>
//           <input
//             id='taskInput'
//             type='text'
//             placeholder='Task name'
//             className='border p-1 mb-2 w-full'
//           />
//           <input
//             id='progressInput'
//             type='number'
//             placeholder='% complete'
//             className='border p-1 mb-2 w-full'
//           />

//           <div className='flex gap-2'>
//             <button id='saveBtn' className='bg-blue-500 text-white px-3 py-1 rounded'>
//               Save
//             </button>
//             <button id='cancelBtn' className='bg-gray-300 px-3 py-1 rounded'>
//               Cancel
//             </button>
//             <button id='deleteBtn' className='bg-red-500 text-white px-3 py-1 rounded'>
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Gantt;

import { useRef } from 'react';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import { useSearchParams } from 'react-router-dom';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import TaskPopupEditor from './TaskPopupEditor';
import './Gantt.css';
import { createRoot } from 'react-dom/client';

const Gantt = () => {
  const ganttRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const customWindowRef = useRef<HTMLDivElement>(document.createElement('div'));
  const selectedTaskRef = useRef<any>(null);

  const handleSave = (updatedTask: any) => {
    ganttRef.current?.updateTask(selectedTaskRef.current, updatedTask);
    ganttRef.current?.closeWindow();
  };

  const handleCancel = () => {
    console.log('❌ Cancel button clicked');
    ganttRef.current?.closeWindow();
  };

  const handleDelete = () => {
    ganttRef.current?.removeTask(selectedTaskRef.current);
    ganttRef.current?.closeWindow();
  };

  const popupWindowCustomizationFunction = (target: any, type: string, taskObj: any) => {
    if (type === 'task' || type === 'project') {
      target.headerPosition = 'none';
      target.footerPosition = 'none';
      selectedTaskRef.current = taskObj;

      customWindowRef.current.innerHTML = '';
      customWindowRef.current.appendChild(
        (() => {
          const container = document.createElement('div');
          container.id = 'react-task-editor';
          return container;
        })()
      );

      target.appendChild(customWindowRef.current);

      setTimeout(() => {
        const mountPoint = document.getElementById('react-task-editor');
        if (mountPoint) {
          const root = createRoot(mountPoint);
          root.render(
            <TaskPopupEditor
              task={taskObj}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          );
        }
      }, 0);
    }
  };

  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useGetFullProjectDetailsByKeyQuery(projectKey);

  const tasks = projectData?.data?.tasks || [];
  const milestones = projectData?.data?.milestones || [];
  const sprints = projectData?.data?.sprints || [];

  const view = 'week';
  const treeSize = '40%';
  const durationUnit = 'day';
  const hideTimelineHeaderDetails = true;
  const snapToNearest = true;

  const taskColumns = [
    { label: 'Tasks', value: 'label', size: '30%' },
    {
      label: 'Planned Start',
      value: 'dateStart',
      formatFunction: (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB');
      },
    },
    { label: 'Duration', value: 'duration' },
    { label: '% complete', value: 'progress' },
  ];

  const timelineHeaderFormatFunction = (
    date: Date,
    type: string,
    isHeaderDetails: boolean,
    value: string
  ) => {
    const ganttChart = ganttRef.current as any;
    if (type === 'day') {
      return date.toLocaleDateString(ganttChart?.locale || 'en', {
        day: 'numeric',
        month: 'short',
      });
    }
    return value;
  };

  const normalizeDateToLocalISO = (dateStr: string | null | undefined) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  };

  const toLocalDate = (dateStr: string | null | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calcAverageProgress = (items: any[]): number => {
    const taskProgress = items
      .filter((i) => i.type === 'task' && typeof i.progress === 'number')
      .map((i) => i.progress);
    if (taskProgress.length === 0) return 0;
    const total = taskProgress.reduce((a, b) => a + b, 0);
    return Number((total / taskProgress.length).toFixed(1));
  };

  const buildDataSource = () => {
    const sprintGroups = sprints.map((sprint) => {
      const sprintTasks = tasks
        .filter((t) => t.sprintId === sprint.id)
        .map((t) => {
          const start = normalizeDateToLocalISO(t.plannedStartDate);
          const end = normalizeDateToLocalISO(t.plannedEndDate);
          return {
            label: t.title,
            dateStart: toLocalDate(t.plannedStartDate),
            duration: start && end ? getDuration(start, end) : undefined,
            progress: t.percentComplete ?? undefined,
            type: 'task',
            id: `task-${t.id}`,
          };
        });

      const sprintMilestones = milestones
        .filter((m) => m.sprintId === sprint.id)
        .map((m) => {
          const start = normalizeDateToLocalISO(m.startDate);
          const end = normalizeDateToLocalISO(m.endDate);
          return {
            label: m.name,
            dateStart: toLocalDate(m.startDate) || undefined,
            duration: start && end ? getDuration(start, end) : undefined,
            type: 'milestone',
            id: `milestone-${m.id}`,
          };
        });

      const sprintTasksAndMilestones = [...sprintTasks, ...sprintMilestones];

      const start = normalizeDateToLocalISO(sprint.startDate);
      const end = normalizeDateToLocalISO(sprint.endDate);
      return {
        label: sprint.name,
        dateStart: toLocalDate(sprint.startDate),
        duration: start && end ? getDuration(start, end) : undefined,
        progress: calcAverageProgress(sprintTasksAndMilestones) ?? 0,
        type: 'project',
        expanded: true,
        tasks: sprintTasksAndMilestones,
      };
    });

    const standaloneMilestones = milestones
      .filter((m) => !m.sprintId)
      .map((m) => ({
        label: m.name,
        dateStart: toLocalDate(m.startDate),
        type: 'milestone',
        id: `milestone-${m.id}`,
      }));

    return [...sprintGroups, ...standaloneMilestones];
  };

  const dataSource = buildDataSource();

  return (
    <div>
      {isLoading && <div>⏳ Loading...</div>}
      {isError && (
        <div className='text-red-500'>
          ❌ Error: {(error as any)?.data?.message || 'Cannot load data!'}
        </div>
      )}

      {!isLoading && !isError && (
        <GanttChart
          ref={ganttRef}
          id='gantt'
          view={view}
          treeSize={treeSize}
          dataSource={dataSource}
          taskColumns={taskColumns}
          durationUnit={durationUnit}
          snapToNearest={snapToNearest}
          hideTimelineHeaderDetails={hideTimelineHeaderDetails}
          timelineHeaderFormatFunction={timelineHeaderFormatFunction}
          popupWindowCustomizationFunction={popupWindowCustomizationFunction}
        />
      )}
    </div>
  );
};

export default Gantt;

