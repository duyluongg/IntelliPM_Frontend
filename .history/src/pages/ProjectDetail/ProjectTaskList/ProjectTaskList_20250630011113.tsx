import React, { useState, useRef, useEffect } from 'react';
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
  comments: number;
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

// Component Status
const Status: React.FC<{ status: string }> = ({ status }) => {
  const formatStatusForDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to_do':
        return 'TO DO';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'done':
        return 'DONE';
      default:
        return status;
    }
  };

  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'to_do':
        return { backgroundColor: '#dddee1', color: '#6B778C' };
      case 'in_progress':
        return { backgroundColor: '#87b1e1', color: '#0747A6' };
      case 'done':
        return { backgroundColor: '#b2da73', color: '#006644' };
      default:
        return { backgroundColor: '#dddee1', color: '#6B778C' };
    }
  };

  return (
    <div className="status-container">
      <span className="status-line" style={getStatusStyle()}>{formatStatusForDisplay(status)}</span>
    </div>
  );
};

// Component DateWithIcon
const DateWithIcon = ({ date, status, isDueDate }: { date?: string | null; status: string; isDueDate?: boolean }) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Use current date and time (01:08 AM +07, June 30, 2025)
  const currentDate = new Date('2025-06-30T01:08:00+07:00');
  const dueDate = date ? new Date(date) : null;

  let icon = (
    <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-4 h-4">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.5 2.5v2H6v-2h4v2h1.5v-2H13a.5.5 0 0 1 .5.5v3h-11V3a.5.5 0 0 1 .5-.5zm-2 5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V7.5zm9-6.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1.5V0H6v1h4V0h1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
  let className = 'date-cell';

  if (isDueDate && dueDate) {
    const isOverdue = dueDate < currentDate;
    const isDueToday = dueDate.toDateString() === currentDate.toDateString();
    const isDone = status.toLowerCase() === 'done';

    if (isOverdue && !isDone) {
      // Overdue and not DONE: Red exclamation icon
      icon = (
        <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-4 h-4">
          <path fill="currentColor" fill-rule="evenodd" d="M5.7 1.384c.996-1.816 3.605-1.818 4.602-.003l5.35 9.73C16.612 12.86 15.346 15 13.35 15H2.667C.67 15-.594 12.862.365 11.113zm3.288.72a1.125 1.125 0 0 0-1.972 0l-5.336 9.73c-.41.75.132 1.666.987 1.666H13.35c.855 0 1.398-.917.986-1.667z" clip-rule="evenodd"></path>
          <path fill="currentColor" fill-rule="evenodd" d="M7.25 9V4h1.5v5z" clip-rule="evenodd"></path>
          <path fill="currentColor" d="M9 11.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0"></path>
        </svg>
      );
      className = 'date-cell due-warning';
    } else if (isDueToday && !isDone) {
      // Due today and not DONE: Orange clock icon with border
      icon = (
        <svg fill="none" viewBox="0 0 16 16" role="presentation" className="w-4 h-4 due-today-icon">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none" />
          <path fill="currentColor" d="M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0M8.75 3.25v4.389l2.219 1.775-.938 1.172-2.5-2-.281-.226V3.25zM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"></path>
        </svg>
      );
      className = 'date-cell due-today';
    }
    // Normal or Completed: Default calendar icon (handled by default case)
  }

  return (
    <div className={className}>
      {icon}
      <span>{formatDate(date)}</span>
    </div>
  );
};

// Component Avatar
const Avatar = ({ person }: { person: Reporter | Assignee }) =>
  person.fullName !== 'Unknown' ? (
    <div className="reporter">
      {person.picture ? (
        <img
          src={person.picture}
          alt={`${person.fullName}'s avatar`}
          className="avatar"
          style={{ backgroundColor: person.avatarColor }}
        />
      ) : (
        <div className="avatar" style={{ backgroundColor: person.avatarColor }}>
          {person.initials}
        </div>
      )}
      <span className="reporter-name">{person.fullName}</span>
    </div>
  ) : null;

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
          <div className="avatar" style={{ backgroundColor: '#059669' }}>
            DH
          </div>
          <div className="avatar" style={{ backgroundColor: '#ef4444' }}>
            D
          </div>
          <div className="avatar" style={{ backgroundColor: '#2563eb' }}>
            NV
          </div>
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

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    type: 55,
    key: 100,
    summary: 250,
    status: 120,
    comments: 120,
    sprint: 100,
    assignee: 180,
    dueDate: 130,
    labels: 120,
    created: 130,
    updated: 130,
    reporter: 180,
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !currentColumn || !tableRef.current) return;
      const dx = e.clientX - startX;
      const newWidth = startWidth + dx;
      if (newWidth > 50) {
        setColumnWidths((prevWidths) => ({
          ...prevWidths,
          [currentColumn]: newWidth,
        }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentColumn(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth, currentColumn]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, columnKey: string) => {
    if (tableRef.current) {
      const th = e.currentTarget.parentElement;
      if (th) {
        setIsResizing(true);
        setCurrentColumn(columnKey);
        setStartX(e.clientX);
        setStartWidth(columnWidths[columnKey]);
      }
    }
  };

  const tasks: TaskItem[] =
    isLoading || error || !workItemsData?.data
      ? []
      : workItemsData.data.map((item) => ({
          id: item.key || '',
          type: item.type.toLowerCase() as 'epic' | 'task' | 'bug' | 'subtask' | 'story',
          key: item.key || '',
          taskId: item.taskId || null,
          summary: item.summary || '',
          status: item.status.replace(' ', '_').toLowerCase() || '',
          comments: item.commentCount || 0,
          sprint: item.sprintId || null,
          assignees: item.assignees.map((assignee) => ({
            fullName: assignee.fullname || 'Unknown',
            initials:
              assignee.fullname
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2) || '',
            avatarColor: '#f3eded',
            picture: assignee.picture || undefined,
          })),
          dueDate: item.dueDate || null,
          labels: item.labels || [],
          created: item.createdAt || '',
          updated: item.updatedAt || '',
          reporter: {
            fullName: item.reporterFullname || 'Unknown',
            initials:
              item.reporterFullname
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2) || '',
            avatarColor: '#f3eded',
            picture: item.reporterPicture || undefined,
          },
        }));

  return (
    <div className="task-page-wrapper">
      <HeaderBar />
      <div className="task-table-container">
        <table className="task-table" ref={tableRef}>
          <thead>
            <tr>
              <th className="w-16" style={{ width: `${columnWidths.type}px` }}>
                Type
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'type')}
                />
              </th>
              <th className="w-20" style={{ width: `${columnWidths.key}px` }}>
                Key
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'key')}
                />
              </th>
              <th style={{ width: `${columnWidths.summary}px` }}>
                Summary
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'summary')}
                />
              </th>
              <th className="w-24" style={{ width: `${columnWidths.status}px` }}>
                Status
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'status')}
                />
              </th>
              <th className="w-24" style={{ width: `${columnWidths.comments}px` }}>
                Comments
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'comments')}
                />
              </th>
              <th className="w-20" style={{ width: `${columnWidths.sprint}px` }}>
                Sprint
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'sprint')}
                />
              </th>
              <th className="w-32" style={{ width: `${columnWidths.assignee}px` }}>
                Assignee
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'assignee')}
                />
              </th>
              <th className="w-28" style={{ width: `${columnWidths.dueDate}px` }}>
                Due date
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'dueDate')}
                />
              </th>
              <th className="w-24" style={{ width: `${columnWidths.labels}px` }}>
                Labels
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'labels')}
                />
              </th>
              <th className="w-28" style={{ width: `${columnWidths.created}px` }}>
                Created
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'created')}
                />
              </th>
              <th className="w-28" style={{ width: `${columnWidths.updated}px` }}>
                Updated
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'updated')}
                />
              </th>
              <th className="w-32" style={{ width: `${columnWidths.reporter}px` }}>
                Reporter
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, 'reporter')}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={task.type === 'task' ? 'task-row' : ''}>
                <td className="w-16" style={{ width: `${columnWidths.type}px` }}>
                  {task.type === 'task' && <img src={taskIcon} alt="Task" className="type-icon" />}
                  {task.type === 'subtask' && <img src={subtaskIcon} alt="Subtask" className="type-icon" />}
                  {task.type === 'bug' && <img src={bugIcon} alt="Bug" className="type-icon" />}
                  {task.type === 'epic' && <img src={epicIcon} alt="Epic" className="type-icon" />}
                  {task.type === 'story' && <img src={storyIcon} alt="Story" className="type-icon" />}
                </td>
                <td className="w-20" style={{ width: `${columnWidths.key}px` }}>
                  {task.type === 'subtask' && task.taskId && task.taskId !== 'Unknown' ? (
                    <div className="subtask-key">
                      <span className="task-id-small">{task.taskId}</span>
                      <div className="key-bottom">
                        <svg
                          role="presentation"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="5.33333"
                            cy="5.33333"
                            r="1.33333"
                            stroke="#42526E"
                            stroke-width="1.33333"
                            fill="none"
                          />
                          <circle
                            cx="10.6667"
                            cy="10.6666"
                            r="1.33333"
                            stroke="#42526E"
                            stroke-width="1.33333"
                            fill="none"
                          />
                          <path
                            d="M5.33337 6.66669V9.33335C5.33337 10.0697 5.93033 10.6667 6.66671 10.6667H9.33337"
                            stroke="#42526E"
                            stroke-width="1.33333"
                            fill="none"
                          />
                        </svg>
                        <span className="subtask-id" onClick={() => setIsPopupOpen(true)}>
                          {task.key}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="task-key-wrapper">
                      <span className="task-id-small"></span>
                      <span className="task-key" onClick={() => setIsPopupOpen(true)}>
                        {task.key}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ width: `${columnWidths.summary}px` }}>{task.summary}</td>
                <td className="w-24" style={{ width: `${columnWidths.status}px` }}>
                  <Status status={task.status} />
                </td>
                <td className="w-24" style={{ width: `${columnWidths.comments}px` }}>
                  {task.comments > 0 ? (
                    <div className="comment-cell">
                      <svg
                        fill="none"
                        viewBox="0 0 16 16"
                        role="presentation"
                        className="w-4 h-4"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{task.comments} comment</span>
                    </div>
                  ) : (
                    <div className="comment-cell comment-cell-inactive">
                      <svg
                        fill="none"
                        viewBox="0 0 16 16"
                        role="presentation"
                        className="w-4 h-4"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M0 3.125A2.625 2.625 0 0 1 2.625.5h10.75A2.625 2.625 0 0 1 16 3.125v8.25A2.625 2.625 0 0 1 13.375 14H4.449l-3.327 1.901A.75.75 0 0 1 0 15.25zM2.625 2C2.004 2 1.5 2.504 1.5 3.125v10.833L4.05 12.5h9.325c.621 0 1.125-.504 1.125-1.125v-8.25C14.5 2.504 13.996 2 13.375 2zM12 6.5H4V5h8zm-3 3H4V8h5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Add comment</span>
                    </div>
                  )}
                </td>
                <td className="w-20" style={{ width: `${columnWidths.sprint}px` }}>
                  {task.sprint === null || task.sprint === undefined || task.sprint === 0
                    ? ''
                    : <span className="sprint-cell">Sprint {task.sprint}</span>}
                </td>
                <td className="w-32" style={{ width: `${columnWidths.assignee}px` }}>
                  {task.assignees.map((assignee, index) => (
                    <Avatar key={index} person={assignee} />
                  ))}
                </td>
                <td className="w-28" style={{ width: `${columnWidths.dueDate}px` }}>
                  {task.dueDate && task.dueDate !== 'Unknown' ? (
                    <DateWithIcon date={task.dueDate} status={task.status} isDueDate={true} />
                  ) : (
                    ''
                  )}
                </td>
                <td className="w-24" style={{ width: `${columnWidths.labels}px` }}>
                  {task.labels && task.labels.length > 0 && task.labels[0] !== 'Unknown'
                    ? task.labels.map((label, index) => (
                        <span key={index} className="label-tag">{label}</span>
                      ))
                    : ''}
                </td>
                <td className="w-28" style={{ width: `${columnWidths.created}px` }}>
                  {task.created !== 'Unknown' ? <DateWithIcon date={task.created} status={task.status} /> : ''}
                </td>
                <td className="w-28" style={{ width: `${columnWidths.updated}px` }}>
                  {task.updated !== 'Unknown' ? <DateWithIcon date={task.updated} status={task.status} /> : ''}
                </td>
                <td className="w-32" style={{ width: `${columnWidths.reporter}px` }}>
                  <Avatar person={task.reporter} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPopupOpen && (
        <WorkItem
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectTaskList;