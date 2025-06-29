import React from 'react';
import './WorkItem.css';
import tickIcon from '/src/assets/check_box.png';
import bugIcon from '/src/assets/bug.png';
import flagIcon from '/src/assets/flag.png';
import subtaskIcon from '/src/assets/subtask.png';
import ChildWorkItemPopup from './ChildWorkItemPopup';
import { useGetSubtasksByTaskIdQuery, useUpdateSubtaskStatusMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery, useUpdateTaskStatusMutation } from '../../services/taskApi';
import { useNavigate } from 'react-router-dom';

interface WorkItemProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ isOpen, onClose }) => {
  const taskId = 'FLOWER1-1';

  const [status, setStatus] = React.useState('');
  const [workType, setWorkType] = React.useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [selectedChild, setSelectedChild] = React.useState<any>(null);

  const {
    data: subtaskData = [],
    isLoading,
    refetch, // ✅ Thêm dòng này
  } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !isOpen,
  });

  const { data: taskData, isLoading: isTaskLoading, refetch: refetchTask } = useGetTaskByIdQuery(taskId, {
    skip: !isOpen,
  });

  React.useEffect(() => {
    if (taskData) {
      setStatus(taskData.status); 
      setDescription(taskData.description ?? '');
    }
  }, [taskData]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();

  const childWorkItems = subtaskData.map((item) => ({
    key: item.id,
    summary: item.title,
    priority: item.priority,
    assignee: item.assignedBy?.toString() ?? 'Unassigned',
    status: item.status,
  }));

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubtaskStatus({ id, status: newStatus }).unwrap();
      console.log(`Updated ${id} to ${newStatus}`);
      refetch(); 
    } catch (err) {
      console.error('Failed to update subtask status', err);
    }
  };

  const handleTaskStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      console.log(`Updated task ${taskId} to ${newStatus}`);
      setStatus(newStatus); 
      await refetchTask();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleWorkTypeChange = (type: string) => {
    setWorkType(type);
    setIsDropdownOpen(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getIconSrc = () => {
    switch (workType) {
      case 'Bug': return bugIcon;
      case 'Story': return flagIcon;
      default: return tickIcon;
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigate = useNavigate();

  const handleKeyClick = () => {
    navigate(`/work-item-detail?taskId=${taskId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsDropdownOpen(false)}>
      <div className="work-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="issue-header">
            <span className="issue-type">
              <span className="issue-icon-wrapper" onClick={handleIconClick}>
                <img src={getIconSrc()} alt={`${workType} Icon`} />
              </span>
              <span className="issue-key" onClick={handleKeyClick}>{taskId}</span>
              {isDropdownOpen && (
                <div className="issue-type-dropdown" onClick={handleDropdownClick}>
                  <div className="dropdown-title">Change Work Type</div>
                  {['Task', 'Bug', 'Story'].map((type) => (
                    <div key={type} className="dropdown-item" onClick={() => handleWorkTypeChange(type)}>
                      <input type="radio" checked={workType === type} readOnly />
                      <img
                        src={type === 'Task' ? tickIcon : type === 'Bug' ? bugIcon : flagIcon}
                        alt={type}
                        className="dropdown-icon"
                      />
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </span>
            <input
              type="text"
              className="issue-summary"
              placeholder="Enter summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>✖</button>
          </div>
        </div>

        <div className="modal-content">
          <div className="main-section">
            <div className="field-group">
              <label>Description</label>
              <textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Child work items</label>
              <div className="issue-table">
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
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
                      {childWorkItems.map((item, index) => (
                        <tr key={index}>
                          <td><img src={subtaskIcon} alt="Subtask" /></td>
                          <td><a onClick={() => setSelectedChild(item)}>{item.key}</a></td>
                          <td><a onClick={() => setSelectedChild(item)}>{item.summary}</a></td>
                          <td>{item.priority}</td>
                          <td className="assignee">{item.assignee}</td>
                          <td>
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.key, e.target.value)} // ✅
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
                )}
              </div>
            </div>
            <div className="field-group">
              <div className="activity-tabs">
                <button className="tab active">All</button>
                <button className="tab">Comments</button>
                <button className="tab">History</button>
                <button className="tab">Work log</button>
              </div>
              <textarea className="activity-input" placeholder="Add a comment...\nCan I get more info..? Status update... Thanks..." />
              <p className="pro-tip">Pro tip: Press <strong>M</strong> to comment</p>
            </div>
          </div>

          <div className="details-panel">
            <div className="panel-header">
              <select
                value={status}
                onChange={(e) => handleTaskStatusChange(e.target.value)}
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="details-content">
              <div className="detail-item"><label>Assignee</label><span>Ngo Pham Thao Vy (K16_...)</span></div>
              <div className="detail-item"><label>Labels</label><span>None</span></div>
              <div className="detail-item"><label>Parent</label><span>None</span></div>
              <div className="detail-item"><label>Due date</label><span>None</span></div>
              <div className="detail-item"><label>Start date</label><span>None</span></div>
              <div className="detail-item"><label>Sprint</label><span>None</span></div>
              <div className="detail-item"><label>Fix versions</label><span>None</span></div>
              <div className="detail-item"><label>Reporter</label><span>Dinh Quoc Tuan Dat (K17_H...)</span></div>
            </div>
          </div>
        </div>
      </div>

      {selectedChild && (
        <ChildWorkItemPopup
          item={selectedChild}
          onClose={() => setSelectedChild(null)}
        />
      )}
    </div>
  );
};

export default WorkItem;
