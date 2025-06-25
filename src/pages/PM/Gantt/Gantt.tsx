// import 'smart-webcomponents-react/source/styles/smart.default.css';
// import { GanttChart } from 'smart-webcomponents-react/ganttchart';

// const Gantt = () => {
//   const treeSize = '30%';
//   const durationUnit = 'day';

//   const taskColumns = [
//     {
//       label: 'Tasks',
//       value: 'label',
//       size: '20%',
//     },
//     {
//       label: 'Planned Start Date',
//       value: 'plannedStartDate',
//       size: '12%',
//       formatFunction: (date) => new Date(date).toLocaleDateString(),
//     },
//     {
//       label: 'Planned Finish Date',
//       value: 'plannedFinishDate',
//       size: '12%',
//       formatFunction: (date) => new Date(date).toLocaleDateString(),
//     },
//     {
//       label: 'Assigned',
//       value: 'assigned',
//       size: '10%',
//     },
//     {
//       label: 'Percent Complete',
//       value: 'percentComplete',
//       size: '10%',
//       formatFunction: (val) => `${val}%`,
//     },
//     {
//       label: 'Priority',
//       value: 'priority',
//       size: '8%',
//     },
//     {
//       label: 'Actual Hours',
//       value: 'actualHours',
//       size: '8%',
//     },
//     {
//       label: 'Planned Cost',
//       value: 'plannedCost',
//       size: '10%',
//     },
//     {
//       label: 'Planned Resource Cost',
//       value: 'plannedResourceCost',
//       size: '12%',
//     },
//     {
//       label: 'Actual Cost',
//       value: 'actualCost',
//       size: '10%',
//     },
//     {
//       label: 'Actual Resource Cost',
//       value: 'actualResourceCost',
//       size: '12%',
//     },
//     {
//       label: 'Remaining Hours',
//       value: 'remainingHours',
//       size: '10%',
//     },
//     {
//       label: 'Status',
//       value: 'status',
//       size: '8%',
//     },
//     {
//       label: 'Duration (days)',
//       value: 'duration',
//       formatFunction: (val) => `${parseInt(val)}d`,
//     },
//   ];

//   const dataSource = [
//     {
//       label: 'PRD & User-Stories',
//       dateStart: '2021-01-10',
//       dateEnd: '2021-03-10',
//       plannedStartDate: '2021-01-08',
//       plannedFinishDate: '2021-03-12',
//       assigned: 'Alice',
//       percentComplete: 80,
//       priority: 'High',
//       actualHours: 150,
//       plannedCost: 5000,
//       plannedResourceCost: 3000,
//       actualCost: 5200,
//       actualResourceCost: 3200,
//       remainingHours: 20,
//       status: 'In Progress',
//       type: 'task',
//     },
//     {
//       label: 'Persona & Journey',
//       dateStart: '2021-03-01',
//       dateEnd: '2021-04-30',
//       plannedStartDate: '2021-01-08',
//       plannedFinishDate: '2021-03-12',
//       assigned: 'Alice',
//       percentComplete: 80,
//       priority: 'High',
//       actualHours: 150,
//       plannedCost: 5000,
//       plannedResourceCost: 3000,
//       actualCost: 5200,
//       actualResourceCost: 3200,
//       remainingHours: 20,
//       status: 'In Progress',
//       type: 'task',
//     },
//     // },
//     // {
//     //   label: 'Architecture',
//     //   dateStart: '2021-04-11',
//     //   dateEnd: '2021-05-16',
//     //   class: 'product-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Prototyping',
//     //   dateStart: '2021-05-17',
//     //   dateEnd: '2021-07-01',
//     //   class: 'dev-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Design',
//     //   dateStart: '2021-07-02',
//     //   dateEnd: '2021-08-01',
//     //   class: 'design-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Development',
//     //   dateStart: '2021-08-01',
//     //   dateEnd: '2021-09-10',
//     //   class: 'dev-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Testing & QA',
//     //   dateStart: '2021-09-11',
//     //   dateEnd: '2021-10-10',
//     //   class: 'qa-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'UAT Test',
//     //   dateStart: '2021-10-12',
//     //   dateEnd: '2021-11-11',
//     //   class: 'product-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Handover & Documentation',
//     //   dateStart: '2021-10-17',
//     //   dateEnd: '2021-11-31',
//     //   class: 'marketing-team',
//     //   type: 'task',
//     // },
//     // {
//     //   label: 'Release',
//     //   dateStart: '2021-11-01',
//     //   dateEnd: '2021-12-31',
//     //   class: 'release-team',
//     //   type: 'task',
//     // },
//   ];

//   //   return (
//   //     <div>
//   //       <GanttChart
//   //         dataSource={dataSource}
//   //         taskColumns={taskColumns}
//   //         treeSize={treeSize}
//   //         durationUnit={durationUnit}
//   //         id='gantt'
//   //       ></GanttChart>
//   //     </div>
//   //   );
//   return (
//   <div style={{ width: '100%'}}>
//     <div style={{ minWidth: '1800px' }}>
//       <GanttChart
//         dataSource={dataSource}
//         taskColumns={taskColumns}
//         treeSize="90%" // tăng kích thước bảng bên trái
//         durationUnit="day"
//         id="gantt"
//       />
//     </div>
//   </div>
// );

// };

// export default Gantt;

// import { useRef, useState } from 'react';
// import { GanttChart } from 'smart-webcomponents-react/ganttchart';
// import 'smart-webcomponents-react/source/styles/smart.default.css';

// const Gantt = () => {
//   const ganttRef = useRef(null);
//   const [tasks, setTasks] = useState([
//     {
//       label: 'PRD & User-Stories',
//       dateStart: '2025-06-01',
//       dateEnd: '2025-06-05',
//       class: 'product-team',
//       type: 'task'
//     },
//     {
//       label: 'Architecture',
//       dateStart: '2025-06-06',
//       dateEnd: '2025-06-10',
//       class: 'dev-team',
//       type: 'task'
//     }
//   ]);

//   const taskColumns = [
//     { label: 'Tasks', value: 'label', size: '30%' },
//     { label: 'Planned Start', value: 'dateStart', size: '15%' },
//     { label: 'Planned End', value: 'dateEnd', size: '15%' },
//     { label: 'Assigned', value: 'assigned', size: '10%' },
//     { label: 'Status', value: 'status', size: '10%' },
//     { label: '% Complete', value: 'progress', size: '10%' }
//   ];

//   const handleAddTask = () => {
//     const newTask = {
//       label: `New Task #${tasks.length + 1}`,
//       dateStart: '2025-06-11',
//       dateEnd: '2025-06-15',
//       class: 'new-task',
//       type: 'task',
//       assigned: 'Nguyen Van A',
//       status: 'In Progress',
//       progress: 0
//     };

//     // Cập nhật state
//     const updatedTasks = [...tasks, newTask];
//     setTasks(updatedTasks);

//     // Thêm vào biểu đồ Gantt (nếu đã mount)
//     if (ganttRef.current) {
//       ganttRef.current.addTask(newTask);
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleAddTask} style={{ margin: '10px', padding: '8px 16px' }}>
//         ➕ Thêm Task
//       </button>

//       <GanttChart
//         ref={ganttRef}
//         id="gantt"
//         dataSource={tasks}
//         taskColumns={taskColumns}
//         treeSize="40%"
//         durationUnit="day"
//       />
//     </div>
//   );
// };

// export default Gantt;

// import { useState, useRef } from 'react';
// import { GanttChart } from 'smart-webcomponents-react/ganttchart';
// import 'smart-webcomponents-react/source/styles/smart.default.css';
// import { useGetTasksByProjectIdQuery } from '../../../services/taskApi';
// import { useGetMilestonesByProjectIdQuery } from '../../../services/milestoneApi';
// import { useGetSprintsByProjectIdQuery } from '../../../services/sprintApi';

// const Gantt = () => {
//   const ganttRef = useRef(null);
//   const treeSize = '40%';
//   const durationUnit = 'day';
//   const nonworkingDays = [0, 6]; // Chủ Nhật & Thứ Bảy
//   const nonworkingHours = [[18, 6]]; // Nghỉ từ 6PM đến 6AM
//   const [adjustToNonworkingTime, setAdjustToNonworkingTime] = useState(true);
//   const projectId = 1;

//   // const { data: tasks = [], isLoading, isError, error } = useGetTasksByProjectIdQuery(1);

//   const { data: tasks = [], isLoading, isError, error } = useGetTasksByProjectIdQuery(projectId);
//   const { data: milestones = [], isLoading: loadingMilestones } =
//     useGetMilestonesByProjectIdQuery(projectId);
//   const { data: sprints = [] } = useGetSprintsByProjectIdQuery(projectId);

//   const taskColumns = [
//     { label: 'Tasks', value: 'label', size: '30%' },
//     { label: 'Planned Start', value: 'dateStart', size: '15%' },
//     { label: 'Planned End', value: 'dateEnd', size: '15%' },
//     { label: 'Assigned', value: 'assigned', size: '10%' },
//     { label: 'Status', value: 'status', size: '10%' },
//     { label: '% Complete', value: 'progress', size: '10%' },
//   ];

//   const buildDataSource = () => {
//     const sprintGroups = sprints.map((sprint) => {
//       const sprintTasks = tasks
//         .filter((t) => t.sprintId === sprint.id)
//         .map((t) => ({
//           label: t.title,
//           dateStart: t.plannedStartDate,
//           dateEnd: t.plannedEndDate,
//           assigned: 1,
//           status: t.status,
//           progress: t.percentComplete,
//           type: 'task',
//           id: `task-${t.id}`,
//         }));

//       const sprintMilestones = milestones
//         .filter((m) => tasks.some((t) => t.sprintId === sprint.id && t.milestoneId === m.id))
//         .map((m) => ({
//           label: m.name,
//           dateEnd: m.startDate,
//           status: m.status,
//           type: 'milestone',
//           id: `milestone-${m.id}`,
//         }));

//       return {
//         label: sprint.name,
//         dateStart: sprint.startDate,
//         dateEnd: sprint.endDate,
//         type: 'project',
//         expanded: true,
//         tasks: [...sprintTasks, ...sprintMilestones],
//       };
//     });

//     return sprintGroups;
//   };

//   const dataSource = buildDataSource();

//   return (
//     <div className='p-4'>
//       {isLoading && <div>⏳ Đang tải dữ liệu task...</div>}
//       {isError && (
//         <div className='text-red-500'>
//           ❌ Lỗi: {(error as any)?.data?.message || 'Không thể tải dữ liệu'}
//         </div>
//       )}

//       {!isLoading && !isError && (
//         <GanttChart
//           ref={ganttRef}
//           id='gantt'
//           // dataSource={formattedTasks}
//           dataSource={dataSource}
//           taskColumns={taskColumns}
//           treeSize={treeSize}
//           durationUnit={durationUnit}
//           autoScrollStep={5}
//           adjustToNonworkingTime={adjustToNonworkingTime}
//           nonworkingDays={nonworkingDays}
//           nonworkingHours={nonworkingHours}
//         />
//       )}
//     </div>
//   );
// };

// export default Gantt;


import { useState, useRef } from 'react';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import { useGetTasksByProjectIdQuery } from '../../../services/taskApi';
import { useGetMilestonesByProjectIdQuery } from '../../../services/milestoneApi';
import { useGetSprintsByProjectIdQuery } from '../../../services/sprintApi';

const Gantt = () => {
  const ganttRef = useRef(null);
  const treeSize = '40%';
  const durationUnit = 'day';
  const nonworkingDays = [0, 6]; // Chủ Nhật & Thứ Bảy
  const nonworkingHours = [[18, 6]]; // Nghỉ từ 6PM đến 6AM
  const [adjustToNonworkingTime, setAdjustToNonworkingTime] = useState(true);
  const projectId = 1;

  const { data: tasks = [], isLoading, isError, error } = useGetTasksByProjectIdQuery(projectId);
  const { data: milestones = [], isLoading: loadingMilestones } =
    useGetMilestonesByProjectIdQuery(projectId);
  const { data: sprints = [] } = useGetSprintsByProjectIdQuery(projectId);

  const taskColumns = [
    { label: 'Tasks', value: 'label', size: '30%' },
    { label: 'Planned Start', value: 'dateStart', size: '15%' },
    { label: 'Planned End', value: 'dateEnd', size: '15%' },
    { label: 'Assigned', value: 'assigned', size: '10%' },
    { label: 'Status', value: 'status', size: '10%' },
    { label: '% Complete', value: 'progress', size: '10%' },
  ];

  // Cộng thêm 1 ngày để đảm bảo Gantt hiển thị đầy đủ ngày kết thúc
  const addOneDay = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  };

  const buildDataSource = () => {
    const sprintGroups = sprints.map((sprint) => {
      const sprintTasks = tasks
        .filter((t) => t.sprintId === sprint.id)
        .map((t) => ({
          label: t.title,
          dateStart: t.plannedStartDate,
          dateEnd: addOneDay(t.plannedEndDate),
          assigned: 1,
          status: t.status,
          progress: t.percentComplete,
          type: 'task',
          id: `task-${t.id}`,
        }));

      const sprintMilestones = milestones
        .filter((m) => tasks.some((t) => t.sprintId === sprint.id && t.milestoneId === m.id))
        .map((m) => ({
          label: m.name,
          dateEnd: addOneDay(m.startDate),
          status: m.status,
          type: 'milestone',
          id: `milestone-${m.id}`,
        }));

      return {
        label: sprint.name,
        dateStart: sprint.startDate,
        dateEnd: addOneDay(sprint.endDate),
        type: 'project',
        expanded: true,
        tasks: [...sprintTasks, ...sprintMilestones],
      };
    });

    return sprintGroups;
  };

  const dataSource = buildDataSource();

  return (
    <div className='p-4'>
      {isLoading && <div>⏳ Đang tải dữ liệu task...</div>}
      {isError && (
        <div className='text-red-500'>
          ❌ Lỗi: {(error as any)?.data?.message || 'Không thể tải dữ liệu'}
        </div>
      )}

      {!isLoading && !isError && (
        <GanttChart
          ref={ganttRef}
          id='gantt'
          dataSource={dataSource}
          taskColumns={taskColumns}
          treeSize={treeSize}
          durationUnit={durationUnit}
          autoScrollStep={5}
          adjustToNonworkingTime={adjustToNonworkingTime}
          nonworkingDays={nonworkingDays}
          nonworkingHours={nonworkingHours}
        />
      )}
    </div>
  );
};

export default Gantt;

