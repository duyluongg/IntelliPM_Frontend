import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetWorkItemsByProjectIdQuery } from '../../../services/projectApi';
import './ProjectTaskList.css';
import { FaSearch, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import WorkItem from '../../WorkItem/WorkItem';
import taskIcon from '../../../assets/icon/type_task.svg'; // Thay đổi từ icons sang icon
import subtaskIcon from '../../../assets/icon/type_subtask.svg'; // Thay đổi từ icons sang icon
import bugIcon from '../../../assets/icon/type_bug.svg'; // Thay đổi từ icons sang icon
import epicIcon from '../../../assets/icon/type_epic.svg'; // Thay đổi từ icons sang icon
import storyIcon from '../../../assets/icon/type_story.svg'; // Thay đổi từ icons sang icon
// Interface Reporter
interface Reporter {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null; // Thêm trường picture để hỗ trợ avatar
}

// Interface TaskItem (đồng bộ với WorkItem từ API)
interface TaskItem {
  id: string; // Sử dụng key làm id tạm thời
  type: 'epic' | 'task' | 'bug' | 'subtask'| 'story'; // Thêm 'story' nếu cần
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  comments: number;
  sprint?: number | null; // Thay đổi kiểu để khớp với sprintId
  assignees: Assignee[]; // Thay đổi thành mảng Assignee để hỗ trợ danh sách
  dueDate?: string | null;
  labels?: string[];
  created: string;
  updated: string;
  reporter: Reporter; // Cần ánh xạ từ reporterFullname và reporterPicture
}

// Interface Assignee (tương tự Reporter)
interface Assignee {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null; // Thêm trường picture để hỗ trợ avatar
}

// Component DateWithIcon
const DateWithIcon = ({ date }: { date: string }) => (
  <div className="date-cell">
    <FaCalendarAlt className="calendar-icon" />
    <span>{date}</span>
  </div>
);

// Component Avatar (sử dụng cho cả reporter và assignee)
const Avatar = ({ person }: { person: Reporter | Assignee }) => (
  <div className="reporter">
    {person.picture ? (
      <img src={person.picture} alt={`${person.fullName}'s avatar`} className="avatar" style={{ backgroundColor: person.avatarColor }} />
    ) : (
      <div className="avatar" style={{ backgroundColor: person.avatarColor }}>
        {person.initials}
      </div>
    )}
    <span className="reporter-name">{person.fullName}</span>
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
    type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask' | 'story', // Chuyển đổi type về dạng chữ thường
    key: item.key,
    taskId: item.taskId,
    summary: item.summary,
    status: item.status,
    comments: item.commentCount,
    sprint: item.sprintId,
    assignees: item.assignees.map((assignee) => ({
      fullName: assignee.fullname,
      initials: assignee.fullname
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2),
      avatarColor: '#2563eb', // Mặc định, có thể điều chỉnh dựa trên picture
      picture: assignee.picture || undefined,
    })),
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
        .substring(0, 2),
      avatarColor: '#2563eb', // Mặc định
      picture: item.reporterPicture || undefined,
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
                <td>
                  {task.type === 'task' && <img src={taskIcon} alt="Task" className="icon" />}
                  {task.type === 'subtask' && <img src={subtaskIcon} alt="Subtask" className="icon" />}
                  {task.type === 'bug' && <img src={bugIcon} alt="Bug" className="icon" />}
                  {task.type === 'epic' && <img src={epicIcon} alt="Epic" className="icon" />}
                  {task.type === 'story' && <img src={storyIcon} alt="Story" className="icon" />}
                </td>
                <td>
                  <span
                    style={{ color: '#2563eb', cursor: 'pointer' }}
                    onClick={() => handleOpenWorkItem(task.key)}
                  >
                    {task.key}
                  </span>
                </td>
                <td>{task.type === 'subtask' ? task.taskId || 'N/A' : ''}</td>
                <td>{task.summary}</td>
                <td>
                  <span className={`status status-${task.status.replace(/ /g, '-').toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>{task.comments > 0 ? `${task.comments} comment` : 'Add comment'}</td>
                <td>{task.sprint ? `Sprint ${task.sprint}` : ''}</td>
                <td>
                  {task.assignees.map((assignee, index) => (
                    <Avatar key={index} person={assignee} />
                  ))}
                </td>
                <td className={task.dueDate === 'May 28, 2025' ? 'due-warning' : ''}>
                  {task.dueDate ? <DateWithIcon date={task.dueDate} /> : ''}
                </td>
                <td>{task.labels?.join(', ') || ''}</td>
                <td><DateWithIcon date={task.created} /></td>
                <td><DateWithIcon date={task.updated} /></td>
                <td><Avatar person={task.reporter} /></td>
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