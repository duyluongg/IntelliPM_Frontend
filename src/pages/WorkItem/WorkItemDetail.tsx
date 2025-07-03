import React, { useState, useEffect, useRef } from 'react';
import './WorkItemDetail.css';
import tickIcon from '../../assets/icon/type_task.svg';
import subtaskIcon from '../../assets/icon/type_subtask.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import flagIcon from '../../assets/icon/type_story.svg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useGetSubtasksByTaskIdQuery,
  useUpdateSubtaskStatusMutation,
  useCreateSubtaskMutation
} from '../../services/subtaskApi';
import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
} from '../../services/taskApi';

const WorkItemDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId') || '';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [workType, setWorkType] = useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [selectedChild, setSelectedChild] = React.useState<any>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [createSubtask] = useCreateSubtaskMutation();

  const { data: taskData, refetch: refetchTask } = useGetTaskByIdQuery(taskId, {
    skip: !taskId,
  });
  const {
    data: subtaskData = [],
    isLoading,
    refetch: refetchSubtask,
  } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !taskId,
  });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();

  useEffect(() => {
    if (taskData) {
      setStatus(taskData.status);
      setDescription(taskData.description ?? '');
    }
  }, [taskData]);

  const handleTaskStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      await refetchTask();
    } catch (err) {
      console.error('Update task status failed', err);
    }
  };

  const handleSubtaskStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubtaskStatus({ id, status: newStatus }).unwrap();
      await refetchSubtask();
    } catch (err) {
      console.error('Update subtask status failed', err);
    }
  };

  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return 'None';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleWorkTypeChange = (type: string) => {
    setWorkType(type);
    setIsDropdownOpen(false);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getIconSrc = () => {
    switch (workType) {
      case 'Bug':
        return bugIcon;
      case 'Story':
        return flagIcon;
      default:
        return tickIcon;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`📁 File "${file.name}" đã được upload giả lập.`);
    }
    setIsAddDropdownOpen(false);
  };

  const handleAddSubtask = () => {
    setShowSubtaskInput(true);
    setIsAddDropdownOpen(false);
  };


  return (
    <div className="work-item-detail-page">
      <div className="work-item-detail-container">
        <div className="detail-header">
          <div className="issue-header">
            <span className="issue-type">
              <span className="issue-icon-wrapper" onClick={handleIconClick}>
                <img src={getIconSrc()} alt={`${workType} Icon`} />
              </span>
              <span className="issue-key" onClick={() => navigate('/work-item')}>
                {taskId}
              </span>
              {isDropdownOpen && (
                <div className="issue-type-dropdown">
                  <div className="dropdown-title">Change Work Type</div>
                  {['Task', 'Bug', 'Story'].map((type) => (
                    <div key={type} onClick={() => handleWorkTypeChange(type)}>
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
            <button className="close-btn" onClick={() => navigate('/work-item')}>
              ✖
            </button>
          </div>
        </div>

        <div className="detail-content">
          <div className="main-section">
            <div className="add-menu-wrapper">
              <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>
                + Add
              </button>
              {isAddDropdownOpen && (
                <div className="add-dropdown">
                  <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                    📁 Attachment
                  </div>
                  <div className="add-item"
                    onClick={() => {
                      setShowSubtaskInput(true);
                      setIsAddDropdownOpen(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <img src={subtaskIcon} alt="Subtask" style={{ width: '16px', marginRight: '6px' }} />
                    Subtask
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

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
                  <p>Loading subtasks...</p>
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
                      {subtaskData.map((item: any, index: number) => (
                        <tr key={index}>
                          <td><img src={subtaskIcon} alt="Subtask" /></td>
                          <td><a onClick={() => navigate(`/child-work/${item.id}`)}>{item.id}</a></td>
                          <td><a onClick={() => navigate(`/child-work/${item.id}`)}>{item.title}</a></td>
                          <td>{item.priority}</td>
                          <td>{item.assignedByName ?? 'Unassigned'}</td>
                          <td>
                            <select value={item.status} onChange={(e) => handleSubtaskStatusChange(item.id, e.target.value)}>
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {showSubtaskInput && (
                        <tr>
                          <td><img src={subtaskIcon} alt="Subtask" /></td>
                          <td colSpan={5}>
                            <input
                              type="text"
                              placeholder="Enter subtask title..."
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              style={{
                                width: '70%',
                                padding: '6px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginRight: '8px',
                              }}
                            />
                            <button
                              onClick={async () => {
                                try {
                                  await createSubtask({ taskId, title: newSubtaskTitle }).unwrap();
                                  setNewSubtaskTitle('');
                                  setShowSubtaskInput(false);
                                  await refetchSubtask(); // cập nhật lại danh sách
                                } catch (err) {
                                  console.error('Lỗi tạo subtask:', err);
                                }
                              }}
                              disabled={!newSubtaskTitle.trim()}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#0052cc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: newSubtaskTitle.trim() ? 'pointer' : 'not-allowed',
                              }}
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setShowSubtaskInput(false);
                                setNewSubtaskTitle('');
                              }}
                              style={{
                                marginLeft: '8px',
                                padding: '6px 12px',
                                backgroundColor: '#ccc',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                              }}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      )}

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
              <p className="pro-tip">
                Pro tip: Press <strong>M</strong> to comment
              </p>
            </div>
          </div>

          <div className="details-panel">
            <div className="details-content">
              <div className="detail-item">
                <label>Status</label>
                <select value={status} onChange={(e) => handleTaskStatusChange(e.target.value)}>
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="detail-item"><label>Assignee</label><span>{selectedChild?.assignee ?? subtaskData[0]?.assignedBy ?? 'None'}</span></div>
              <div className="detail-item"><label>Labels</label><span>None</span></div>
              <div className="detail-item"><label>Parent</label><span>{subtaskData[0]?.taskId ?? 'None'}</span></div>
              <div className="detail-item"><label>Due date</label><span>{formatDate(subtaskData[0]?.endDate)}</span></div>
              <div className="detail-item"><label>Start date</label><span>{formatDate(subtaskData[0]?.startDate)}</span></div>
              <div className="detail-item"><label>Reporter</label><span>{subtaskData[0]?.reporterId ?? 'None'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItemDetail;
