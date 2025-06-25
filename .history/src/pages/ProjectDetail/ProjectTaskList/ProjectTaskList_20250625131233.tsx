import React from 'react';
import './ProjectTaskList.css';

interface TaskItem {
  id: string;
  type: 'epic' | 'task' | 'bug' | 'subtask';
  key: string;
  summary: string;
  status: 'TO DO' | 'IN PROGRESS' | 'DONE';
  comments: number;
  sprint?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  created: string;
  updated: string;
}

const mockTasks: TaskItem[] = [
  {
    id: '1',
    type: 'task',
    key: 'SAS-1',
    summary: 'ok',
    status: 'TO DO',
    comments: 0,
    created: 'Jun 23, 2025',
    updated: 'Jun 23, 2025',
  },
  {
    id: '2',
    type: 'epic',
    key: 'SAS-5',
    summary: 'Epic 2 Đặt hàng + Thanh toán',
    status: 'TO DO',
    comments: 0,
    created: 'May 27, 2025',
    updated: 'May 27, 2025',
  },
  {
    id: '3',
    type: 'subtask',
    key: 'SAS-8',
    summary: 'Tích hợp PayOS',
    status: 'TO DO',
    comments: 1,
    sprint: 'SAS Sprint 3',
    assignee: '',
    dueDate: 'May 28, 2025',
    labels: ['dat'],
    created: 'May 27, 2025',
    updated: 'Jun 21, 2025',
  },
];

const ProjectTaskList: React.FC = () => {
  return (
    <div className="task-table-container no-margin">
      <table className="task-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Key</th>
            <th>Summary</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Sprint</th>
            <th>Assignee</th>
            <th>Due date</th>
            <th>Labels</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task) => (
            <tr key={task.id}>
              <td>
                <span className={`icon icon-${task.type}`}></span>
              </td>
              <td>{task.key}</td>
              <td>{task.summary}</td>
              <td>
                <span className={`status status-${task.status.replace(/ /g, '-').toLowerCase()}`}>
                  {task.status}
                </span>
              </td>
              <td>{task.comments > 0 ? `${task.comments} comment` : 'Add comment'}</td>
              <td>{task.sprint || ''}</td>
              <td>{task.assignee || ''}</td>
              <td className={task.dueDate === 'May 28, 2025' ? 'due-warning' : ''}>
                {task.dueDate || ''}
              </td>
              <td>{task.labels?.join(', ') || ''}</td>
              <td>{task.created}</td>
              <td>{task.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTaskList;
