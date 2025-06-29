import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetWorkItemsByProjectIdQuery } from '../../../services/projectApi';
import './ProjectTaskList.css';
import { FaSearch, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import WorkItem from '../../WorkItem/WorkItem'; // ✅ Đảm bảo đường dẫn đúng

// Interface Reporter
interface Reporter {
  fullName: string;
  initials: string;
  avatarColor: string;
}

// Interface TaskItem (đồng bộ với WorkItem từ API)
interface TaskItem {
  id: string; // Sử dụng key làm id tạm thời
  type: 'epic' | 'task' | 'bug' | 'subtask';
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  comments: number;
  sprint?: number | null; // Thay đổi kiểu để khớp với sprintId
  assignee?: string; // Lấy từ assignees[0]?.fullname nếu có
  dueDate?: string | null;
  labels?: string[];
  created: string;
  updated: string;
  reporter: Reporter; // Cần ánh xạ từ reporterFullname và reporterPicture
}

// Component DateWithIcon
const DateWithIcon = ({ date }: { date: string }) => (
  <div className="date-cell">
    <FaCalendarAlt className="calendar-icon" />
    <span>{date}</span>
  </div>
);

// Component Avatar
const Avatar = ({ reporter }: { reporter: Reporter }) => (
  <div className="reporter">
    <div className="avatar" style={{ backgroundColor: reporter.avatarColor }}>
      {reporter.initials}
    </div>
    <span className="reporter-name">{reporter.fullName}</span>
  </div>
);

// Component HeaderBar
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

// Component ProjectTaskList
const ProjectTaskList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey') || 'NotFound';
  const { data: projectDetails } = useGetProjectDetailsByKeyQuery(projectKey);
  const projectId = projectDetails?.data?.id;
  const { data: workItemsData, isLoading, error } = useGetWorkItemsByProjectIdQuery(projectId || 0);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenWorkItem = (key: string) => {
    setSelectedKey(key);
    setIsPopupOpen(true);
  };

  // Ánh xạ WorkItem[] thành TaskItem[]
  const tasks: TaskItem[] = isLoading || error || !workItemsData?.data ? [] : workItemsData.data.map((item) => ({
    id: item.key, // Sử dụng key làm id tạm thời
    type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask',
    key: item.key,
    taskId: item.taskId,
    summary: item.summary,
    status: item.status,
    comments: item.commentCount, // Ánh xạ commentCount sang comments
    sprint: item.sprintId, // Ánh xạ sprintId sang sprint
    assignee: item.assignees.length > 0 ? item.assignees[0].fullname : undefined,
    dueDate: item.dueDate,
    labels: item.labels,
    created: item.createdAt,
    updated: item.updatedAt,
    reporter: {
      fullName: item.reporterFullname,
      initials: item.reporterFullname
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2), // Tạo initials từ reporterFullname
      avatarColor: '#2563eb', // Mặc định, có thể điều chỉnh logic dựa trên reporterPicture
    },
  }));

  return (
    <div className="task-page-wrapper">
      <HeaderBar />
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Key</th>
              <th>Task ID</th> 
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
            {tasks.map((task) => (
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
                <td>{task.type === 'subtask' ? task.taskId || 'N/A' : ''}</td> {/* Hiển thị taskId nếu là subtask */}
                <td>{task.summary}</td>
                <td>
                  <span className={`status status-${task.status.replace(/ /g, '-').toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.comments > 0 ? `${task.comments} comment` : 'Add comment'}</td>
                <td>{task.sprint ? `Sprint ${task.sprint}` : ''}</td>
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
              status: 'To Do',
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