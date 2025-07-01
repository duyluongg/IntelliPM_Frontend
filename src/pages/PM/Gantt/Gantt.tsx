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
          dateEnd: t.plannedEndDate,
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
          dateStart: m.startDate,
          dateEnd: m.startDate,
          status: m.status,
          type: 'milestone',
          id: `milestone-${m.id}`,
        }));

      return {
        label: sprint.name,
        dateStart: sprint.startDate,
        dateEnd: sprint.endDate,
        type: 'project',
        expanded: true,
        tasks: [...sprintTasks, ...sprintMilestones],
      };
    });

    const milestoneIdsInSprints = new Set(
      tasks.map((t) => t.milestoneId).filter((id) => id != null)
    );

    const standaloneMilestones = milestones
      .filter((m) => !milestoneIdsInSprints.has(m.id))
      .map((m) => ({
        label: m.name,
        dateStart: m.startDate,
        dateEnd: addOneDay(m.startDate),
        status: m.status,
        type: 'milestone',
        id: `milestone-${m.id}`,
      }));

    // Đưa từng milestone vào làm 1 mục riêng độc lập như 1 sprint
    // const standaloneGroups = standaloneMilestones.map((m) => ({
    //   label: m.label,
    //   dateStart: m.dateStart,
    //   dateEnd: m.dateEnd,
    //   type: 'project',
    //   expanded: true,
    //   tasks: [m],
    // }));

    return [...sprintGroups, ...standaloneMilestones];
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
