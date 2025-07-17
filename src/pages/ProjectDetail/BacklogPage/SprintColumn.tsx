import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
}

interface Sprint {
  id: string;
  name: string;
  duration?: string;
  tasks: Task[];
}

interface SprintColumnProps {
  sprints: Sprint[];
  backlogTasks: Task[];
}

const SprintColumn: React.FC<SprintColumnProps> = ({ sprints, backlogTasks }) => {
  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <input type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
        <span className="text-sm font-medium text-gray-900">{task.id}</span>
        <span className="text-sm text-gray-700 truncate max-w-xs">{task.title}</span>
      </div>
      <div className="flex items-center gap-3">
        {/* Assignee */}
        {task.assignee ? (
          <div className="w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">
            👤
          </div>
        )}
        {/* Status Dropdown */}
        <select
          className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={task.status}
        >
          <option value="To Do">TO DO</option>
          <option value="In Progress">IN PROGRESS</option>
          <option value="Done">DONE</option>
        </select>
      </div>
    </div>
  );

  const renderSprint = (sprint: Sprint) => (
    <div
      key={sprint.id}
      className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {sprint.name} <span className="text-xs text-gray-500">{sprint.duration || ''}</span>
          </h4>
          <p className="text-xs text-gray-500">{sprint.tasks.length} work items</p>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Complete sprint
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {sprint.tasks.map(renderTask)}
        {/* Ô tạo task mới */}
        <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
          <input type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
          <ChevronDown className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="What needs to be done?"
            className="flex-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {sprints.map(renderSprint)}

      {/* Backlog */}
      {backlogTasks.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Backlog</h4>
              <p className="text-xs text-gray-500">{backlogTasks.length} work item{backlogTasks.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Create sprint
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {backlogTasks.map(renderTask)}
            <button className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
              + Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintColumn;