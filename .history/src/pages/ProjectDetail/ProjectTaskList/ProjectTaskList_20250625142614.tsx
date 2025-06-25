import React, { useState } from 'react';
import './ProjectTaskList.css';
import { FaSearch, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import ProjectDetailHeader from './ProjectDetailHeader'; // Giả sử file này đã được import

interface Reporter {
  fullName: string;
  initials: string;
  avatarColor: string;
}

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
  reporter: Reporter;
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
    reporter: {
      fullName: 'Ngo Pham Thao Vy',
      initials: 'NV',
      avatarColor: '#2563eb',
    },
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
    reporter: {
      fullName: 'Dinh Quoc Tuan Dat',
      initials: 'DH',
      avatarColor: '#059669',
    },
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
    reporter: {
      fullName: 'Dinh Quoc Tuan Dat',
      initials: 'DH',
      avatarColor: '#059669',
    },
  },
];

const DateWithIcon = ({ date }: { date: string }) => (
  <div className="date-cell">
    <FaCalendarAlt className="calendar-icon" />
    <span>{date}</span>
  </div>
);

const Avatar = ({ reporter }: { reporter: Reporter }) => (
  <div className="reporter">
    <div className="avatar" style={{ backgroundColor: reporter.avatarColor }}>
      {reporter.initials}
    </div>
    <span className="reporter-name">{reporter.fullName}</span>
  </div>
);

const HeaderBar: React.FC = () => {
  return (
    <div className="task-header-bar">
      <div className="left-section">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input type="text" className="search-input" placeholder="Search list" />
        </div>
        <div className="avatar-group">
          <div className="avatar" style={{ backgroundColor: '#059669' }}>DH</div>
          <div className="avatar" style={{ backgroundColor: '#ef4444' }}>D</div>
          <div className="avatar" style={{ backgroundColor: '#2563eb' }}>NV</div>
        </div>
        <button className="filter-btn">
          <FaFilter style={{ marginRight: '4px' }} />
          Filter <span className="filter-count">1</span>
        </button>
      </div>
      <div className="right-section">
        <div className="group-dropdown">
          <MdGroup />
          <span>Group</span>
        </div>
        <button className="menu-btn">
          <FaEllipsisV />
        </button>
      </div>
    </div>
  );
};

const ProjectTaskList: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
  };

  const closeDetail = () => {
    setSelectedTask(null);
  };

  return (
    <div className="task-page-wrapper">
      <HeaderBar />
      <div className="task-table-container">
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
              <th>Reporter</th>
            </tr>
          </thead>
          <tbody>
            {mockTasks.map((task) => (
              <tr key={task.id} onClick={() => handleTaskClick(task)} style={{ cursor: 'pointer' }}>
                <td><span className={`icon icon-${task.type}`}></span></td>
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
                  {task.dueDate ? <DateWithIcon date={task.dueDate} /> : ''}
                </td>
                <td>{task.labels?.join(', ') || ''}</td>
                <td><DateWithIcon date={task.created} /></td>
                <td><DateWithIcon date={task.updated} /></td>
                <td><Avatar reporter={task.reporter} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetail}>
              ×
            </button>
            <ProjectDetailHeader />
            <div className="task-detail">
              <h2>{selectedTask.key}: {selectedTask.summary}</h2>
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Reporter:</strong> {selectedTask.reporter.fullName}</p>
              <p><strong>Created:</strong> {selectedTask.created}</p>
              <p><strong>Updated:</strong> {selectedTask.updated}</p>
              {selectedTask.dueDate && <p><strong>Due Date:</strong> {selectedTask.dueDate}</p>}
              {selectedTask.sprint && <p><strong>Sprint:</strong> {selectedTask.sprint}</p>}
              {selectedTask.assignee && <p><strong>Assignee:</strong> {selectedTask.assignee}</p>}
              {selectedTask.labels && selectedTask.labels.length > 0 && (
                <p><strong>Labels:</strong> {selectedTask.labels.join(', ')}</p>
              )}
              <p><strong>Comments:</strong> {selectedTask.comments > 0 ? `${selectedTask.comments} comment` : 'No comments'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTaskList;