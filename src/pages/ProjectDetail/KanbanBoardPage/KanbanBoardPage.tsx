import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanHeader from './KanbanHeader';
import KanbanColumn from './KanbanColumn';
import { useGetSprintsByProjectKeyWithTasksQuery, type SprintWithTaskListResponseDTO, type TaskBacklogResponseDTO } from '../../../services/sprintApi';
import { useSearchParams } from 'react-router-dom';
import { mapApiStatusToUI } from './Utils';

interface BacklogSprint {
  id: null;
  name: string;
  tasks: TaskBacklogResponseDTO[];
}

const KanbanBoardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: sprintsData = [], refetch } = useGetSprintsByProjectKeyWithTasksQuery(projectKey);
  const [tasks, setTasks] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const mappedTasks = sprintsData.reduce((acc, sprint) => {
      const sprintTasks = sprint.tasks.map(task => ({
        ...task,
        status: mapApiStatusToUI(task.status),
        sprintId: sprint.id || null,
      }));
      acc[sprint.id ? sprint.id.toString() : 'backlog'] = sprintTasks;
      return acc;
    }, {} as { [key: string]: any[] });
    if (!mappedTasks['backlog']) mappedTasks['backlog'] = [];
    setTasks(mappedTasks);
  }, [sprintsData]);

  const moveTask = (taskId: string, fromSprintId: number | null, toSprintId: number | null, toStatus: string) => {
    setTasks(prev => {
      const fromKey = fromSprintId ? fromSprintId.toString() : 'backlog';
      const toKey = toSprintId ? toSprintId.toString() : 'backlog';
      const newTasks = { ...prev };
      const task = newTasks[fromKey].find(t => t.id === taskId);
      if (task) {
        task.status = toStatus;
        task.sprintId = toSprintId;
        newTasks[toKey] = newTasks[toKey] || [];
        newTasks[toKey].push(task);
        newTasks[fromKey] = newTasks[fromKey].filter(t => t.id !== taskId);
      }
      return newTasks;
    });
    refetch();
  };

  return (
    <div className="min-h-screen p-4">
      <KanbanHeader projectKey={projectKey} />
      <DndProvider backend={HTML5Backend}>
        <div className="flex space-x-4 overflow-x-auto">
          {sprintsData.map((sprint) => (
            <KanbanColumn
              key={sprint.id || 'backlog'}
              sprint={sprint}
              tasks={tasks[sprint.id ? sprint.id.toString() : 'backlog'] || []}
              moveTask={moveTask}
            />
          ))}
          <KanbanColumn
            key="backlog"
            sprint={{ id: null, name: 'Backlog', tasks: [] }}
            tasks={tasks['backlog'] || []}
            moveTask={moveTask}
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default KanbanBoardPage;