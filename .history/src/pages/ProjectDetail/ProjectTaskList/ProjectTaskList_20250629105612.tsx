import React, { useState } from 'react';
import './ProjectTaskList.css';
import { FaSearch, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import WorkItem from '../../WorkItem/WorkItem'; // ✅ Đảm bảo đường dẫn đúng

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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenWorkItem = (key: string) => {
    setSelectedKey(key);
    setIsPopupOpen(true);
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
              <tr key={task.id}>
                <td><span className={`icon icon-${task.type}`}></span></td>
                <td>
                  <span
                    style={{ color: '#2563eb', cursor: 'pointer' }}
                    onClick={() => handleOpenWorkItem(task.key)}
                  >
                    {task.key}
                  </span>
                </td>
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

      {/* ✅ WorkItem Popup */}
      {isPopupOpen && selectedKey && (
        <WorkItem
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          childWorkItems={[
            {
              key: 'SAS-15',
              summary: 'child item',
              priority: 'Medium', 
              assignee: 'Unassigned', 
              status: 'To Do'
            },
          ]}
          onChildItemClick={(item) => console.log('Clicked child item', item)}
          onChildPopupClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectTaskList;
