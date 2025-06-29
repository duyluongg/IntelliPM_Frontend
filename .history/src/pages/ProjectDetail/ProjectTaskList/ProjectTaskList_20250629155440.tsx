import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProjectDetailsByKeyQuery } from '../../../services/projectApi';
import { useGetWorkItemsByProjectIdQuery } from '../../../services/projectApi';
import './ProjectTaskList.css';
import { FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { MdGroup } from 'react-icons/md';
import WorkItem from '../../WorkItem/WorkItem';
import taskIcon from '../../../assets/icon/type_task.svg';
import subtaskIcon from '../../../assets/icon/type_subtask.svg';
import bugIcon from '../../../assets/icon/type_bug.svg';
import epicIcon from '../../../assets/icon/type_epic.svg';
import storyIcon from '../../../assets/icon/type_story.svg';

// Interface Reporter
interface Reporter {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

// Interface TaskItem
interface TaskItem {
  id: string;
  type: 'epic' | 'task' | 'bug' | 'subtask' | 'story';
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  comments: number; // Giữ nguyên number
  sprint?: number | null;
  assignees: Assignee[];
  dueDate?: string | null;
  labels?: string[];
  created: string;
  updated: string;
  reporter: Reporter;
}

// Interface Assignee
interface Assignee {
  fullName: string;
  initials: string;
  avatarColor: string;
  picture?: string | null;
}

// Component DateWithIcon
const DateWithIcon = ({ date }: { date: string }) => (
  <div className="date-cell">
    <svg role="presentation" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.33333" cy="5.33333" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
      <circle cx="10.6667" cy="10.6666" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
      <path d="M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337" stroke="#42526E" stroke-width="1.33333" fill="none"></path>
    </svg>
    <span>{date}</span>
  </div>
);

// Component Avatar
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

  const tasks: TaskItem[] = isLoading || error || !workItemsData?.data ? [] : workItemsData.data.map((item) => ({
    id: item.key,
    type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask' | 'story',
    key: item.key,
    taskId: item.taskId,
    summary: item.summary,
    status: item.status,
    comments: item.commentCount,
    sprint: item.sprintId,
    assignees: item.assignees.map((assignee) => ({
      fullName: assignee.fullname,
      initials: assignee.fullname.split(' ').map((n) => n[0]).join('').substring(0, 2),
      avatarColor: '#2563eb',
      picture: assignee.picture || undefined,
    })),
    dueDate: item.dueDate,
    labels: item.labels,
    created: item.createdAt,
    updated: item.updatedAt,
    reporter: {
      fullName: item.reporterFullname,
      initials: item.reporterFullname.split(' ').map((n) => n[0]).join('').substring(0, 2),
      avatarColor: '#2563eb',
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
                  {task.type === 'task' && <img src={taskIcon} alt="Task" className="type-icon" />}
                  {task.type === 'subtask' && <img src={subtaskIcon} alt="Subtask" className="type-icon" />}
                  {task.type === 'bug' && <img src={bugIcon} alt="Bug" className="type-icon" />}
                  {task.type === 'epic' && <img src={epicIcon} alt="Epic" className="type-icon" />}
                  {task.type === 'story' && <img src={storyIcon} alt="Story" className="type-icon" />}
                </td>
                <td>
                  <span style={{ color: '#0052CC', cursor: 'pointer' }} onClick={() => handleOpenWorkItem(task.key)}>
                    {task.key}
                  </span>
                </td>
                <td>
                  {task.type === 'subtask' && task.taskId && task.taskId !== 'Unknown' && (
                    <div className="subtask-id">
                      <span>{task.taskId}</span>
                      <br />
                      <span style={{ color: '#0052CC' }}>{task.key}</span>
                    </div>
                  )}
                </td>
                <td>{task.summary}</td>
                <td>
                  <span className={`status status-${task.status.replace(/ /g, '-').toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  {task.comments > 0 ? (
                    <div className="comment-cell">
                      <svg role="presentation" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5.33333" cy="5.33333" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
                        <circle cx="10.6667" cy="10.6666" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
                        <path d="M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337" stroke="#42526E" stroke-width="1.33333" fill="none"></path>
                      </svg>
                      <span>{task.comments} comment</span>
                    </div>
                  ) : (
                    <div className="comment-cell">
                      <svg role="presentation" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5.33333" cy="5.33333" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
                        <circle cx="10.6667" cy="10.6666" r="1.33333" stroke="#42526E" stroke-width="1.33333" fill="none"></circle>
                        <path d="M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337" stroke="#42526E" stroke-width="1.33333" fill="none"></path>
                      </svg>
                      <span>Add comment</span>
                    </div>
                  )}
                </td>
                <td>{task.sprint === null || task.sprint === undefined || task.sprint === 0 ? '' : `Sprint ${task.sprint}`}</td>
                <td>
                  {task.assignees.map((assignee, index) => (
                    <Avatar key={index} person={assignee} />
                  ))}
                </td>
                <td className={task.dueDate === 'May 28, 2025' ? 'due-warning' : ''}>
                  {task.dueDate && task.dueDate !== 'Unknown' ? <DateWithIcon date={task.dueDate} /> : ''}
                </td>
                <td>{task.labels && task.labels.length > 0 && task.labels[0] !== 'Unknown' ? task.labels.join(', ') : ''}</td>
                <td>{task.created !== 'Unknown' ? <DateWithIcon date={task.created} /> : ''}</td>
                <td>{task.updated !== 'Unknown' ? <DateWithIcon date={task.updated} /> : ''}</td>
                <td><Avatar person={task.reporter} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPopupOpen && selectedKey && (
        <WorkItem
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          childWorkItems={[{ key: 'SAS-15', summary: 'child item', priority: 'Medium', assignee: 'Unassigned', status: 'To Do' }]}
          onChildItemClick={(item) => console.log('Clicked child item', item)}
          onChildPopupClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectTaskList;