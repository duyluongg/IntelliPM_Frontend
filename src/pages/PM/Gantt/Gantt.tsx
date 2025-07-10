import { useRef } from 'react';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import { useSearchParams } from 'react-router-dom';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import TaskPopupEditor from './TaskPopupEditor';
import './Gantt.css';
import { createRoot } from 'react-dom/client';
import { useUpdateTaskMutation } from '../../../services/taskApi';

const Gantt = () => {
  const ganttRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const customWindowRef = useRef<HTMLDivElement>(document.createElement('div'));
  const selectedTaskRef = useRef<any>(null);

  const [updateTask] = useUpdateTaskMutation();

  const handleSave = async (updatedTask: any) => {
    ganttRef.current?.updateTask(selectedTaskRef.current, updatedTask);
    ganttRef.current?.closeWindow();

    const rawTask = selectedTaskRef.current?.rawData;
    if (!rawTask?.id) return;

    const taskForUpdate = {
      id: rawTask.id,
      body: {
        reporterId: rawTask.reporterId,
        projectId: rawTask.projectId,
        epicId: rawTask.epicId,
        sprintId: rawTask.sprintId,
        type: rawTask.type,
        title: updatedTask.label,
        description: updatedTask.description,
        plannedStartDate: updatedTask.dateStart?.toISOString(),
        plannedEndDate: updatedTask.dateEnd?.toISOString(),
        status: rawTask.status,
      },
    };

    try {
      await updateTask(taskForUpdate).unwrap();
      console.log('✅ Task updated to DB');
      await refetch();
    } catch (error) {
      console.error('❌ Failed to update task in DB:', error);
    }
  };

  const handleCancel = () => {
    console.log('❌ Cancel button clicked');
    ganttRef.current?.closeWindow();
  };

  const handleDelete = () => {
    ganttRef.current?.removeTask(selectedTaskRef.current);
    ganttRef.current?.closeWindow();
  };

  const popupWindowCustomizationFunction = (target: any, type: any, taskObj: any) => {
    // if (type === 'task' || type === 'project') {
    if (['task', 'project', 'milestone'].includes(type)) {
      target.headerPosition = 'none';
      target.footerPosition = 'none';

      target.content.innerHTML = '';
      target.content.style.padding = '0px';
      target.style.padding = '0px';
      target.style.background = 'transparent';
      target.classList.add('no-smart-style');

      selectedTaskRef.current = taskObj;

      customWindowRef.current.innerHTML = '';
      const container = document.createElement('div');
      container.id = 'react-task-editor';
      customWindowRef.current.appendChild(container);

      target.content.appendChild(customWindowRef.current);

      setTimeout(() => {
        const mountPoint = document.getElementById('react-task-editor');
        if (mountPoint) {
          const root = createRoot(mountPoint);

          root.render(
            <TaskPopupEditor
              task={taskObj.rawData}
              type={type}
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
    refetch,
  } = useGetFullProjectDetailsByKeyQuery(projectKey);

  useGetFullProjectDetailsByKeyQuery(projectKey, {
    refetchOnFocus: true,
  });

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

  // const toLocalDate = (dateStr: string | null | undefined): Date | undefined => {
  //   if (!dateStr) return undefined;
  //   const d = new Date(dateStr);
  //   d.setUTCHours(12, 0, 0, 0);
  //   return d;
  // };

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

          const connections =
            t.dependencies?.map((dep: any) => {
              // Mapping type string → number (FS, SS, FF, SF)
              const mapTypeToNumber = (typeStr: string): number => {
                switch (typeStr) {
                  case 'FINISH_START':
                    return 1;
                  case 'START_START':
                    return 0;
                  case 'FINISH_FINISH':
                    return 2;
                  case 'START_FINISH':
                    return 3;
                  default:
                    return 4;
                }
              };

              return {
                target: `task-${dep.linkedTo}`,
                type: mapTypeToNumber(dep.type),
              };
            }) ?? [];

          return {
            label: t.title,
            dateStart: toLocalDate(t.plannedStartDate),
            duration: start && end ? getDuration(start, end) : undefined,
            progress: t.percentComplete ?? undefined,
            type: 'task',
            id: `task-${t.id}`,
            connections,
            rawData: t,
          };
        });

      const sprintMilestones = milestones
        .filter((m) => m.sprintId === sprint.id)
        .map((m) => {
          return {
            label: m.name,
            dateStart: toLocalDate(m.startDate) || undefined,
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
