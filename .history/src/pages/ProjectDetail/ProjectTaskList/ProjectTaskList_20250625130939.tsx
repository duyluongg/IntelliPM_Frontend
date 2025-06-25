import React from 'react';

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
    <div className="mx-6 p-4 bg-white border border-gray-200 rounded-md overflow-x-auto font-['Segoe_UI']">
      <table className="min-w-[1000px] w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm font-semibold">
            <th className="text-left px-4 py-2 border-b">Type</th>
            <th className="text-left px-4 py-2 border-b">Key</th>
            <th className="text-left px-4 py-2 border-b">Summary</th>
            <th className="text-left px-4 py-2 border-b">Status</th>
            <th className="text-left px-4 py-2 border-b">Comments</th>
            <th className="text-left px-4 py-2 border-b">Sprint</th>
            <th className="text-left px-4 py-2 border-b">Assignee</th>
            <th className="text-left px-4 py-2 border-b">Due date</th>
            <th className="text-left px-4 py-2 border-b">Labels</th>
            <th className="text-left px-4 py-2 border-b">Created</th>
            <th className="text-left px-4 py-2 border-b">Updated</th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task) => (
            <tr key={task.id} className="text-sm text-gray-700 whitespace-nowrap">
              <td className="px-4 py-2 border-b">
                <span
                  className={`inline-block w-4 h-4 rounded-sm ${
                    task.type === 'epic'
                      ? 'bg-purple-500'
                      : task.type === 'task'
                      ? 'bg-blue-500'
                      : task.type === 'bug'
                      ? 'bg-red-500'
                      : task.type === 'subtask'
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              </td>
              <td className="px-4 py-2 border-b">{task.key}</td>
              <td className="px-4 py-2 border-b">{task.summary}</td>
              <td className="px-4 py-2 border-b">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                    task.status === 'TO DO'
                      ? 'bg-gray-100 text-gray-700'
                      : task.status === 'IN PROGRESS'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-4 py-2 border-b">
                {task.comments > 0 ? `${task.comments} comment` : 'Add comment'}
              </td>
              <td className="px-4 py-2 border-b">{task.sprint || ''}</td>
              <td className="px-4 py-2 border-b">{task.assignee || ''}</td>
              <td
                className={`px-4 py-2 border-b ${
                  task.dueDate === 'May 28, 2025' ? 'text-red-600 font-bold' : ''
                }`}
              >
                {task.dueDate || ''}
              </td>
              <td className="px-4 py-2 border-b">{task.labels?.join(', ') || ''}</td>
              <td className="px-4 py-2 border-b">{task.created}</td>
              <td className="px-4 py-2 border-b">{task.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTaskList;
