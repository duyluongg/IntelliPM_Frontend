import { useRef } from 'react';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import TaskPopupEditor from './TaskPopupEditor';
import './Gantt.css';
import { createRoot } from 'react-dom/client';
import { useUpdateTaskMutation } from '../../../services/taskApi';
import WorkItem from './WorkItem';
import ChildWorkItemPopup from './ChildWorkItemPopup';
import { AuthProvider } from '../../../services/AuthContext';
import { Provider } from 'react-redux';
import { store } from '../../../app/store';
import { BrowserRouter } from 'react-router-dom';

const Gantt = () => {
  const ganttRef = useRef<any>(null);
  const { projectKey: paramKey } = useParams<{ projectKey?: string }>();
  const [searchParams] = useSearchParams();
  const searchKey = searchParams.get('projectKey');

  const projectKey = paramKey || searchKey || 'NotFound';
  const customWindowRef = useRef<HTMLDivElement>(document.createElement('div'));
  const selectedTaskRef = useRef<any>(null);

  const [updateTask] = useUpdateTaskMutation();

  const handleSave = async (updatedTask: any) => {
    ganttRef.current?.updateTask(selectedTaskRef.current, updatedTask);
    ganttRef.current?.closeWindow();

    const rawTask = selectedTaskRef.current?.rawData;
    if (!rawTask?.id) return;

    const dependencies = updatedTask.connections?.map((conn: any) => {
      const linkedToId = conn.target.replace('task-', '');
      return {
        taskId: rawTask.id,
        linkedFrom: rawTask.id,
        linkedTo: linkedToId,
        type: mapConnectionTypeToString(conn.type),
      };
    });

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
        dependencies,
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

  const mapConnectionTypeToString = (type: number): string => {
    switch (type) {
      case 0:
        return 'START_START';
      case 1:
        return 'FINISH_START';
      case 2:
        return 'FINISH_FINISH';
      case 3:
        return 'START_FINISH';
      default:
        return 'UNKNOWN';
    }
  };

  // const popupWindowCustomizationFunction = (target: any, type: any, taskObj: any) => {
  //   // if (type === 'task' || type === 'project') {
  //   if (['task', 'project', 'milestone'].includes(type)) {
  //     target.headerPosition = 'none';
  //     target.footerPosition = 'none';

  //     target.content.innerHTML = '';
  //     target.content.style.padding = '0px';
  //     target.style.padding = '0px';
  //     target.style.background = 'transparent';
  //     target.classList.add('no-smart-style');

  //     selectedTaskRef.current = taskObj;

  //     customWindowRef.current.innerHTML = '';
  //     const container = document.createElement('div');
  //     container.id = 'react-task-editor';
  //     customWindowRef.current.appendChild(container);

  //     target.content.appendChild(customWindowRef.current);

  //     setTimeout(() => {
  //       const mountPoint = document.getElementById('react-task-editor');
  //       if (mountPoint) {
  //         const root = createRoot(mountPoint);

  //         root.render(
  //           <TaskPopupEditor
  //             task={taskObj.rawData}
  //             type={type}
  //             onSave={handleSave}
  //             onCancel={handleCancel}
  //             onDelete={handleDelete}
  //           />
  //         );
  //       }
  //     }, 0);
  //   }
  // };

  const popupWindowCustomizationFunction = (target: any, type: any, taskObj: any) => {
    if (['task', 'project', 'milestone'].includes(type)) {
      selectedTaskRef.current = taskObj;

      const isSubtask = taskObj.class === 'task-sub';

      const container = document.createElement('div');
      container.id = 'react-task-editor';
      container.style.minHeight = '600px';
      container.style.background = 'none';
      container.style.padding = '1rem';
      container.style.width = '1000px';

      target.style.width = '1000px';
      target.content.style.overflow = 'visible';
      target.classList.add('no-smart-style');

      target.content.innerHTML = '';
      target.content.appendChild(container);

      const pureTaskId = taskObj.rawData?.id?.replace(/^task-/, '') ?? null;
      const pureSubtaskId = taskObj.rawData?.id?.replace(/^task-/, '') ?? null;
      const pureParentTaskId = taskObj.rawData?.taskId?.replace(/^task-/, '') ?? null;

      console.log('pureSubtaskId: ', pureSubtaskId);
      console.log('pureParentTaskId: ', pureParentTaskId);

      setTimeout(() => {
        const mountPoint = document.getElementById('react-task-editor');
        if (mountPoint) {
          const root = createRoot(mountPoint);

          root.render(
            <BrowserRouter>
              <Provider store={store}>
                <AuthProvider>
                  {isSubtask ? (
                    <ChildWorkItemPopup
                      subtaskId={pureSubtaskId}
                      taskId={pureParentTaskId}
                      onClose={() => ganttRef.current?.closeWindow()}
                    />
                  ) : (
                    <WorkItem
                      isOpen={true}
                      onClose={() => ganttRef.current?.closeWindow()}
                      taskId={pureTaskId}
                    />
                  )}
                </AuthProvider>
              </Provider>
            </BrowserRouter>
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

  const allDependencies = [
    ...(projectData?.data?.tasks.flatMap((task) => task.dependencies) || []),
    ...(projectData?.data?.milestones.flatMap((m) => m.dependencies) || []),
    ...(projectData?.data?.tasks.flatMap((task) =>
      task.subtasks.flatMap((st) => st.dependencies)
    ) || []),
  ];

  const dependencyMap = allDependencies.reduce((acc: any, dep: any) => {
    const key = dep.linkedFrom;
    if (!acc[key]) acc[key] = [];
    acc[key].push(dep);
    return acc;
  }, {});

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

  const timelineHeaderFormatFunction = (date: Date, type: string, value: string) => {
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

  const buildDataSource = () => {
    const sprintGroups = sprints.map((sprint) => {
      const sprintTasks = tasks
        .filter((t) => t.sprintId === sprint.id)
        // .map((t) => {
        //   const deps = dependencyMap[t.id] || [];
        //   const start = normalizeDateToLocalISO(t.plannedStartDate);
        //   const end = normalizeDateToLocalISO(t.plannedEndDate);

        //   const connections =
        //     t.dependencies?.map((dep: any) => {
        //       const targetType = dep.linkedTo.startsWith('m') ? 'milestone' : 'task';
        //       return {
        //         target: `task-${dep.linkedTo}`,
        //         type: mapTypeToNumber(dep.type),
        //       };
        //     }) ?? [];

        //   // Convert subtasks
        //   const subtasks = (t.subtasks || []).map((sub: any) => {
        //     const subStart = normalizeDateToLocalISO(sub.plannedStartDate);
        //     const subEnd = normalizeDateToLocalISO(sub.plannedEndDate);
        //     const subDeps = dependencyMap[sub.id] || [];

        //     const connections = subDeps.map((dep: any) => {
        //       const targetType = dep.linkedTo.startsWith('m') ? 'milestone' : 'task';
        //       return {
        //         target: `${targetType}-${dep.linkedTo}`,
        //         type: mapTypeToNumber(dep.type),
        //       };
        //     });

        //     return {
        //       label: sub.title,
        //       dateStart: toLocalDate(sub.plannedStartDate),
        //       duration: subStart && subEnd ? getDuration(subStart, subEnd) : undefined,
        //       progress: sub.percentComplete ?? undefined,
        //       type: 'task',
        //       id: `task-${sub.id}`,
        //       connections,
        //       rawData: sub,
        //       class: 'task-sub',
        //     };
        //   });

        //   return {
        //     label: t.title,
        //     dateStart: toLocalDate(t.plannedStartDate),
        //     duration: start && end ? getDuration(start, end) : undefined,
        //     progress: t.percentComplete ?? undefined,
        //     type: 'task',
        //     id: `task-${t.id}`,
        //     connections,
        //     tasks: subtasks.length > 0 ? subtasks : undefined,
        //     rawData: t,
        //     class: 'task-parent',
        //   };
        // });

        .map((t) => {
          if (!t.id) return null; // tránh null index key lỗi

          const start = normalizeDateToLocalISO(t.plannedStartDate);
          const end = normalizeDateToLocalISO(t.plannedEndDate);

          const connections = (dependencyMap[t.id] || []).map((dep: any) => {
            const targetType = dep.linkedTo?.startsWith('m') ? 'milestone' : 'task';
            return {
              target: `${targetType}-${dep.linkedTo}`,
              type: mapTypeToNumber(dep.type),
            };
          });

          const subtasks = (t.subtasks || [])
            .map((sub: any) => {
              if (!sub.id) return null;
              const subStart = normalizeDateToLocalISO(sub.plannedStartDate);
              const subEnd = normalizeDateToLocalISO(sub.plannedEndDate);

              const subConnections = (dependencyMap[sub.id] || []).map((dep: any) => {
                const targetType = dep.linkedTo?.startsWith('m') ? 'milestone' : 'task';
                return {
                  target: `${targetType}-${dep.linkedTo}`,
                  type: mapTypeToNumber(dep.type),
                };
              });

              return {
                label: sub.title,
                dateStart: toLocalDate(sub.plannedStartDate),
                duration: subStart && subEnd ? getDuration(subStart, subEnd) : undefined,
                progress: sub.percentComplete ?? undefined,
                type: 'task',
                id: `task-${sub.id}`,
                connections: subConnections,
                rawData: sub,
                class: 'task-sub',
              };
            })
            .filter(Boolean); // lọc bỏ null

          return {
            label: t.title,
            dateStart: toLocalDate(t.plannedStartDate),
            duration: start && end ? getDuration(start, end) : undefined,
            progress: t.percentComplete ?? undefined,
            type: 'task',
            id: `task-${t.id}`,
            connections,
            tasks: subtasks.length > 0 ? subtasks : undefined,
            rawData: t,
            class: 'task-parent',
          };
        })
        .filter(Boolean); // lọc bỏ task null

      const sprintMilestones = milestones
        .filter((m) => m.sprintId === sprint.id)
        .map((m) => {
          const deps = dependencyMap[m.key] || [];

          const connections = deps.map((dep: any) => ({
            target: `milestone-${dep.linkedTo}`,
            type: mapTypeToNumber(dep.type),
          }));

          return {
            label: m.name,
            dateStart: toLocalDate(m.startDate) || undefined,
            type: 'milestone',
            id: `milestone-${m.key}`,
            connections,
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

    // Các task không thuộc sprint nào
    const unscheduledTasks = tasks
      .filter((t) => !t.sprintId)
      .map((t) => {
        if (!t.id) return null;

        const start = normalizeDateToLocalISO(t.plannedStartDate);
        const end = normalizeDateToLocalISO(t.plannedEndDate);

        const connections = (dependencyMap[t.id] || []).map((dep: any) => {
          const targetType = dep.linkedTo?.startsWith('m') ? 'milestone' : 'task';
          return {
            target: `${targetType}-${dep.linkedTo}`,
            type: mapTypeToNumber(dep.type),
          };
        });

        const subtasks = (t.subtasks || [])
          .map((sub: any) => {
            if (!sub.id) return null;

            const subStart = normalizeDateToLocalISO(sub.startDate);
            const subEnd = normalizeDateToLocalISO(sub.endDate);

            const subConnections = (dependencyMap[sub.id] || []).map((dep: any) => {
              const targetType = dep.linkedTo?.startsWith('m') ? 'milestone' : 'task';
              return {
                target: `${targetType}-${dep.linkedTo}`,
                type: mapTypeToNumber(dep.type),
              };
            });

            return {
              label: sub.title,
              dateStart: toLocalDate(sub.plannedStartDate),
              duration: subStart && subEnd ? getDuration(subStart, subEnd) : undefined,
              progress: sub.percentComplete ?? undefined,
              type: 'task',
              id: `task-${sub.id}`,
              connections: subConnections,
              rawData: sub,
              class: 'task-sub',
            };
          })
          .filter(Boolean);

        return {
          label: t.title,
          dateStart: toLocalDate(t.plannedStartDate),
          duration: start && end ? getDuration(start, end) : undefined,
          progress: t.percentComplete ?? undefined,
          type: 'task',
          id: `task-${t.id}`,
          connections,
          tasks: subtasks.length > 0 ? subtasks : undefined,
          rawData: t,
          class: 'task-parent',
        };
      })
      .filter(Boolean);

    // const standaloneMilestones = milestones
    //   .filter((m) => !m.sprintId)
    //   .map((m) => ({
    //     label: m.name,
    //     dateStart: toLocalDate(m.startDate),
    //     type: 'milestone',
    //     id: `milestone-${m.key}`,
    //   }));
    const standaloneMilestones = milestones
      .filter((m) => !m.sprintId)
      .map((m) => {
        const deps = dependencyMap[m.key] || [];

        const connections = deps.map((dep: any) => {
          const targetType = dep.linkedTo?.startsWith('m') ? 'milestone' : 'task';
          return {
            target: `${targetType}-${dep.linkedTo}`,
            type: mapTypeToNumber(dep.type),
          };
        });

        return {
          label: m.name,
          dateStart: toLocalDate(m.startDate),
          type: 'milestone',
          id: `milestone-${m.key}`,
          connections, 
        };
      });

    // return [...sprintGroups, ...standaloneMilestones];
    return [...sprintGroups, ...unscheduledTasks, ...standaloneMilestones];
  };

  const dataSource = buildDataSource();
  console.log(projectData, 'Project Data');
  console.log(dataSource);

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
