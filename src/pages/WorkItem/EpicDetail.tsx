import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetEpicByIdQuery, useUpdateEpicStatusMutation } from '../../services/epicApi';
import { useGetTasksByEpicIdQuery, useUpdateTaskStatusMutation } from '../../services/taskApi';
import { useGetWorkItemLabelsByEpicQuery } from '../../services/workItemLabelApi';

import epicIcon from '../../assets/icon/type_epic.svg';
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';

import './EpicDetail.css';

const EpicDetail: React.FC = () => {
  const { epicId } = useParams();
  const { data: epic, isLoading } = useGetEpicByIdQuery(epicId || '');
  const { data: tasks = [], refetch } = useGetTasksByEpicIdQuery(epicId || '');
  const [status, setStatus] = React.useState('');
  const [updateEpicStatus] = useUpdateEpicStatusMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  React.useEffect(() => {
    if (epic) setStatus(epic.status);
  }, [epic]);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      console.error('❌ Error updating task status:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEpicStatus({ id: epicId!, status: newStatus }).unwrap();
      setStatus(newStatus);
    } catch (err) {
      console.error('❌ Error updating epic status:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TASK': return taskIcon;
      case 'BUG': return bugIcon;
      case 'STORY': return storyIcon;
      default: return taskIcon;
    }
  };

  const { data: epicLabels = [] } = useGetWorkItemLabelsByEpicQuery(epicId ?? '', {
    skip: !epicId,
  });

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return 'None';
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  if (isLoading || !epic) return <div className="epic-page-container"><p>🔄 Đang tải Epic...</p></div>;

  return (
    <div className="epic-page-container">
      <div className="epic-item-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="issue-header">
            <span className="issue-type">
              <span className="issue-icon-wrapper">
                <img src={epicIcon} alt="Epic" />
              </span>
              <span className="issue-key">{epic.id}</span>
            </span>
            <input
              type="text"
              className="issue-summary"
              placeholder="Epic name"
              defaultValue={epic.name}
            />
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Main Section */}
          <div className="main-section">
            <div className="field-group">
              <label>Description</label>
              <textarea
                placeholder="Add a description..."
                defaultValue={epic.description}
              />
            </div>

            <div className="field-group">
              <label>Child Work Items</label>
              <div className="issue-epic-table">
                <div className="scrollable-epic-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Key</th>
                        <th>Summary</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length === 0 ? (
                        <tr><td colSpan={6}>No tasks in this epic.</td></tr>
                      ) : tasks.map((task) => (
                        <tr key={task.id}>
                          <td><img src={getTypeIcon(task.type)} alt={task.type} /></td>
                          <td>{task.id}</td>
                          <td>{task.title}</td>
                          <td>{task.priority}</td>
                          <td>{task.reporterId}</td>
                          <td>
                            <select
                              className={`custom-status-select status-${task.status.toLowerCase()}`}
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            >
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="field-group">
              <div className="activity-tabs">
                <button className="tab active">All</button>
                <button className="tab">Comments</button>
                <button className="tab">History</button>
              </div>
              <textarea className="activity-input" placeholder="Add a comment..." />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="details-panel">
            <div className="panel-header">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`custom-status-select status-${status.toLowerCase()}`}
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="details-content">
              <div className="detail-item"><label>Assignee</label><span>{epic.assignedById ?? 'None'}</span></div>
              <div className="detail-item">
                <label>Labels</label>
                <span>
                  {epicLabels.length === 0
                    ? 'None'
                    : epicLabels.map((label) => label.labelName).join(', ')}
                </span>
              </div>

              <div className="detail-item"><label>Start date</label><span>{formatDate(epic.startDate)}</span></div>
              <div className="detail-item"><label>Due date</label><span>{formatDate(epic.endDate)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpicDetail;
