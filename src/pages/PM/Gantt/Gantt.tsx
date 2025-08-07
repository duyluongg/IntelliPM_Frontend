import { useRef, useEffect, useState } from 'react';
import { GanttChart } from 'smart-webcomponents-react/ganttchart';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import {
  UNSAFE_createClientRoutesWithHMRRevalidationOptOut,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useGetFullProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { createRoot } from 'react-dom/client';
import WorkItem from './WorkItem';
import ChildWorkItemPopup from './ChildWorkItemPopup';
import { AuthProvider } from '../../../services/AuthContext';
import { Provider } from 'react-redux';
import { store } from '../../../app/store';
import { BrowserRouter } from 'react-router-dom';
import DeleteConnectionPopup from './DeleteConnectionPopup';
import { useDeleteTaskDependencyMutation } from '../../../services/taskDependencyApi';
import UpdateMilestonePopup from './UpdateMileStonePopup';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import SprintInfoPopup from './SprintInfoPopup';
import './Gantt.css';

interface UpdateMilestonePopupProps {
  milestoneId: number;
  sprints: SprintWithTaskListResponseDTO[];
  onClose: () => void;
  refetchMilestones: () => void;
}

const Gantt = () => {
  const ganttRef = useRef<any>(null);
  const { projectKey: paramKey } = useParams<{ projectKey?: string }>();
  const [searchParams] = useSearchParams();
  const searchKey = searchParams.get('projectKey');

  const projectKey = paramKey || searchKey || 'NotFound';
  const customWindowRef = useRef<HTMLDivElement>(document.createElement('div'));
  const selectedTaskRef = useRef<any>(null);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [showConnectionPopup, setShowConnectionPopup] = useState(false);

  const [deleteTaskDependency] = useDeleteTaskDependencyMutation();

  const handleDeleteConnection = async () => {
    if (!selectedConnection) return;

    try {
      await deleteTaskDependency({
        linkedFrom: selectedConnection.fromId,
        linkedTo: selectedConnection.toId,
      }).unwrap();
      alert('✅ Connection deleted successfully!');
      setShowConnectionPopup(false);
      setSelectedConnection(null);
      refetch();
    } catch (error) {
      console.error('❌ Failed to delete connection:', error);
      alert('❌ Failed to delete connection!');
    }
  };

  const popupWindowCustomizationFunction = (target: any, type: any, taskObj: any) => {
    console.log('[popupWindowCustomizationFunction]', { type, taskObj });
    const typeFromRaw = taskObj?.type?.toLowerCase?.();
    console.log(typeFromRaw);

    if (type === 'connection') {
      // taskObj is a string in format "sourceIndex-targetIndex-typeNum"
      if (typeof taskObj === 'string') {
        const [sourceIndex, targetIndex, typeNum] = taskObj.split('-').map((part: string) => part);
        const dependencyType = mapNumberToType(parseInt(typeNum));

        // Flatten dataSource to get tasks and milestones only
        const flatDataSource: any[] = [];
        const dataSource = buildDataSource();
        dataSource.forEach((item: any) => {
          if (item.type === 'project' && item.tasks) {
            flatDataSource.push(...item.tasks);
          } else {
            flatDataSource.push(item);
          }
        });

        console.log('flatDataSource:', flatDataSource);
        console.log('sourceIndex:', sourceIndex, 'targetIndex:', targetIndex);

        const sourceItem = flatDataSource[parseInt(sourceIndex)];
        const targetItem = flatDataSource[parseInt(targetIndex)];

        if (!sourceItem || !targetItem) {
          console.warn('Source or target item not found in flatDataSource:', {
            sourceIndex,
            targetIndex,
          });
          return false;
        }

        // Ensure item has an id and is not a project
        if (
          !sourceItem.id ||
          !targetItem.id ||
          sourceItem.type === 'project' ||
          targetItem.type === 'project'
        ) {
          console.warn('Invalid source or target item:', { sourceItem, targetItem });
          return false;
        }

        // Extract actual IDs (e.g., PROJA-2)
        const fromId = sourceItem.id.replace(/(task-|milestone-)/, '');
        const toId = targetItem.id.replace(/(task-|milestone-)/, '');

        console.log('Mapped IDs:', { fromId, toId, dependencyType });

        const dependency = allDependencies.find(
          (dep) => dep.linkedFrom === fromId && dep.linkedTo === toId && dep.type === dependencyType
        );

        if (dependency) {
          // Find labels for fromId and toId
          const fromTask =
            tasks.find((t) => t.id === fromId) ||
            tasks.flatMap((t) => t.subtasks).find((st) => st.id === fromId);
          const fromMilestone = milestones.find((m) => m.key === fromId);
          const toTask =
            tasks.find((t) => t.id === toId) ||
            tasks.flatMap((t) => t.subtasks).find((st) => st.id === toId);
          const toMilestone = milestones.find((m) => m.key === toId);

          const fromLabel = fromTask?.title || fromMilestone?.name || fromId;
          const toLabel = toTask?.title || toMilestone?.name || toId;

          setSelectedConnection({
            ...dependency,
            fromId,
            toId,
            type: dependencyType,
            fromLabel,
            toLabel,
          });
          setShowConnectionPopup(true);
        } else {
          console.warn('Dependency not found for:', { fromId, toId, type: dependencyType });
          console.log('allDependencies:', allDependencies);
        }
      } else {
        console.error('Unexpected taskObj format for connection:', taskObj);
      }
      return false;
    }

    if (taskObj?.class === 'task-parent' || taskObj?.class === 'task-sub') {
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

      console.log('pureSubtaskId:', pureSubtaskId);
      console.log('pureParentTaskId:', pureParentTaskId);

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
                      onClose={() => {
                        ganttRef.current?.closeWindow();
                        refetch();
                      }}
                    />
                  ) : (
                    <WorkItem
                      isOpen={true}
                      onClose={() => {
                        ganttRef.current?.closeWindow();
                        refetch();
                      }}
                      taskId={pureTaskId}
                    />
                  )}
                </AuthProvider>
              </Provider>
            </BrowserRouter>
          );
        }
      }, 0);
      return;
    }

    if (typeFromRaw === 'project') {
      console.log('Sprint data:', taskObj?.rawData);
      const sprintId = taskObj?.rawData?.id;
      const sprintName = taskObj?.rawData?.name;
      const sprintGoal = taskObj?.rawData?.goal;
      const startDate = taskObj?.rawData?.startDate;
      const endDate = taskObj?.rawData?.endDate;
      const sprintStatus = taskObj?.rawData?.status;

      if (!sprintId || !sprintName) {
        console.warn('Invalid sprint data:', taskObj?.rawData);
        return;
      }

      console.log('🟢 Sprint popup triggered. ID:', sprintId);

      const container = document.createElement('div');
      container.id = 'react-sprint-info';
      container.style.minHeight = '600px';
      container.style.background = 'none';
      container.style.padding = '1rem';
      container.style.width = '600px';

      target.style.width = '600px';
      target.content.style.overflow = 'visible';
      target.classList.add('no-smart-style');

      target.content.innerHTML = '';
      target.content.appendChild(container);

      setTimeout(() => {
        const mountPoint = document.getElementById('react-sprint-info');
        if (mountPoint) {
          const root = createRoot(mountPoint);
          root.render(
            <BrowserRouter>
              <Provider store={store}>
                <AuthProvider>
                  <SprintInfoPopup
                    sprintId={sprintId}
                    sprintName={sprintName}
                    sprintGoal={sprintGoal}
                    startDate={startDate}
                    endDate={endDate}
                    sprintStatus={sprintStatus}
                    onClose={() => {
                      ganttRef.current?.closeWindow();
                      refetch();
                    }}
                  />
                </AuthProvider>
              </Provider>
            </BrowserRouter>
          );
        }
      }, 0);
      return;
    }

    // if (['task', 'project'].includes(typeFromRaw)) {
    // if (typeFromRaw === 'task') {
    //   selectedTaskRef.current = taskObj;
    //   const isSubtask = taskObj.class === 'task-sub';
    //   const container = document.createElement('div');
    //   container.id = 'react-task-editor';
    //   container.style.minHeight = '600px';
    //   container.style.background = 'none';
    //   container.style.padding = '1rem';
    //   container.style.width = '1000px';

    //   target.style.width = '1000px';
    //   target.content.style.overflow = 'visible';
    //   target.classList.add('no-smart-style');

    //   target.content.innerHTML = '';
    //   target.content.appendChild(container);

    //   const pureTaskId = taskObj.rawData?.id?.replace(/^task-/, '') ?? null;
    //   const pureSubtaskId = taskObj.rawData?.id?.replace(/^task-/, '') ?? null;
    //   const pureParentTaskId = taskObj.rawData?.taskId?.replace(/^task-/, '') ?? null;

    //   console.log('pureSubtaskId: ', pureSubtaskId);
    //   console.log('pureParentTaskId: ', pureParentTaskId);

    //   setTimeout(() => {
    //     const mountPoint = document.getElementById('react-task-editor');
    //     if (mountPoint) {
    //       const root = createRoot(mountPoint);

    //       root.render(
    //         <BrowserRouter>
    //           <Provider store={store}>
    //             <AuthProvider>
    //               {isSubtask ? (
    //                 <ChildWorkItemPopup
    //                   subtaskId={pureSubtaskId}
    //                   taskId={pureParentTaskId}
    //                   onClose={() => {
    //                     ganttRef.current?.closeWindow();
    //                     refetch();
    //                   }}
    //                 />
    //               ) : (
    //                 <WorkItem
    //                   isOpen={true}
    //                   onClose={() => {
    //                     ganttRef.current?.closeWindow();
    //                     refetch();
    //                   }}
    //                   taskId={pureTaskId}
    //                 />
    //               )}
    //             </AuthProvider>
    //           </Provider>
    //         </BrowserRouter>
    //       );
    //     }
    //   }, 0);
    // }

    if (typeFromRaw === 'milestone') {
      console.log('Data milestone', taskObj?.rawData);
      const milestoneId = taskObj?.rawData.id;
      if (!milestoneId) return;
      console.log('🟢 Milestone popup triggered. ID:', milestoneId);

      const container = document.createElement('div');
      container.id = 'react-milestone-editor';
      container.style.minHeight = '600px';
      container.style.background = 'none';
      container.style.padding = '1rem';
      container.style.width = '1000px';

      target.style.width = '1000px';
      target.content.style.overflow = 'visible';
      target.classList.add('no-smart-style');

      target.content.innerHTML = '';
      target.content.appendChild(container);

      setTimeout(() => {
        const mountPoint = document.getElementById('react-milestone-editor');
        console.log('mountPoint found:', !!mountPoint);
        if (mountPoint) {
          const root = createRoot(mountPoint);
          root.render(
            <BrowserRouter>
              <Provider store={store}>
                <AuthProvider>
                  <UpdateMilestonePopup
                    milestoneId={Number(milestoneId)}
                    onClose={() => {
                      ganttRef.current?.closeWindow();
                      refetch();
                    }}
                  />
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
    { label: 'Task Name', value: 'label', size: '30%' },
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

  const mapNumberToType = (typeNum: number): string => {
    switch (typeNum) {
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

  // Tìm ngày bắt đầu sớm nhất và thêm khoảng cách
  const getEarliestStartDate = () => {
    const allDates = [
      ...sprints.map((sprint) => toLocalDate(sprint.startDate)),
      ...tasks.map((task) => toLocalDate(task.plannedStartDate)),
      ...tasks.flatMap((task) => task.subtasks.map((sub) => toLocalDate(sub.startDate))),
      ...milestones.map((milestone) => toLocalDate(milestone.startDate)),
    ].filter((date): date is Date => !!date);

    if (allDates.length === 0) {
      return new Date(); // Ngày mặc định nếu không có dữ liệu
    }

    const earliestDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    // Trừ 5 ngày để tạo khoảng cách
    earliestDate.setDate(earliestDate.getDate() - 5);
    return earliestDate;
  };

  const buildDataSource = () => {
    const sprintGroups = sprints.map((sprint) => {
      const sprintTasks = tasks
        .filter((t) => t.sprintId === sprint.id)
        .map((t) => {
          if (!t.id) return null;

          const start = normalizeDateToLocalISO(t.plannedStartDate);
          const end = normalizeDateToLocalISO(t.plannedEndDate);

          const connections = (dependencyMap[t.id] || []).map((dep: any) => {
            const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
            const targetType = isMilestone ? 'milestone' : 'task';
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
                const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
                const targetType = isMilestone ? 'milestone' : 'task';
                console.log('LinkedTo: ', dep.linkedTo);
                console.log('targetType: ', targetType);
                return {
                  target: `${targetType}-${dep.linkedTo}`,
                  type: mapTypeToNumber(dep.type),
                };
              });

              return {
                label: sub.title,
                dateStart: toLocalDate(sub.startDate),
                duration: subStart && subEnd ? getDuration(subStart, subEnd) : undefined,
                progress: sub.percentComplete ?? undefined,
                type: 'task',
                id: `task-${sub.id}`,
                connections: subConnections,
                rawData: sub,
                class: 'task-sub',
                expanded: true,
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
            expanded: true,
          };
        })
        .filter(Boolean);

      const sprintMilestones = milestones
        .filter((m) => m.sprintId === sprint.id)
        .map((m) => {
          const deps = dependencyMap[m.key] || [];

          const connections = deps.map((dep: any) => {
            const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
            const targetType = isMilestone ? 'milestone' : 'task';
            return {
              target: `${targetType}-${dep.linkedTo}`,
              type: mapTypeToNumber(dep.type),
            };
          });

          return {
            label: m.name,
            dateStart: toLocalDate(m.startDate) || undefined,
            type: 'milestone',
            id: `milestone-${m.key}`,
            connections,
            rawData: m,
            milestone: true,
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
        rawData: sprint,
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
          const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
          const targetType = isMilestone ? 'milestone' : 'task';
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
              const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
              const targetType = isMilestone ? 'milestone' : 'task';
              return {
                target: `${targetType}-${dep.linkedTo}`,
                type: mapTypeToNumber(dep.type),
              };
            });

            return {
              label: sub.title,
              dateStart: toLocalDate(sub.startDate),
              duration: subStart && subEnd ? getDuration(subStart, subEnd) : undefined,
              progress: sub.percentComplete ?? undefined,
              type: 'task',
              id: `task-${sub.id}`,
              connections: subConnections,
              rawData: sub,
              class: 'task-sub',
              expanded: true,
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
          expanded: true,
        };
      })
      .filter(Boolean);

    const standaloneMilestones = milestones
      .filter((m) => !m.sprintId)
      .map((m) => {
        const deps = dependencyMap[m.key] || [];

        const connections = deps.map((dep: any) => {
          const isMilestone = milestones.some((m) => m.key === dep.linkedTo);
          const targetType = isMilestone ? 'milestone' : 'task';
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
          rawData: m,
          milestone: true,
        };
      });

    return [...sprintGroups, ...unscheduledTasks, ...standaloneMilestones];
  };

  const dataSource = buildDataSource();
  console.log(projectData, 'Project Data');
  console.log(dataSource);
  const earliestStartDate = getEarliestStartDate();

  return (
    <div>
      {isLoading && <div>⏳ Loading...</div>}
      {isError && (
        <div className='text-red-500'>
          ❌ Error: {(error as any)?.data?.message || 'Cannot load data!'}
        </div>
      )}

      {/* {!isLoading && !isError && (
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
          dateStart={earliestStartDate}
        />
      )} */}
      {!isLoading && !isError && (
        <>
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
            dateStart={earliestStartDate}
          />
          {showConnectionPopup && selectedConnection && (
            <DeleteConnectionPopup
              isOpen={showConnectionPopup}
              onClose={() => setShowConnectionPopup(false)}
              onConfirm={handleDeleteConnection}
              fromId={selectedConnection.fromId}
              toId={selectedConnection.toId}
              type={selectedConnection.type}
              fromLabel={selectedConnection.fromLabel}
              toLabel={selectedConnection.toLabel}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Gantt;
