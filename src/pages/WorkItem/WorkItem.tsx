import React from 'react';
import './WorkItem.css';
import tickIcon from '../../assets/icon/type_task.svg';
import subtaskIcon from '../../assets/icon/type_subtask.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import flagIcon from '../../assets/icon/type_story.svg';
import ChildWorkItemPopup from './ChildWorkItemPopup';
import { useGetSubtasksByTaskIdQuery, useUpdateSubtaskStatusMutation, useCreateSubtaskMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery, useUpdateTaskStatusMutation, useUpdateTaskTypeMutation } from '../../services/taskApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCommentsByTaskIdQuery } from '../../services/taskCommentApi';

interface WorkItemProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null; // Add taskId as an optional prop
}

const WorkItem: React.FC<WorkItemProps> = ({ isOpen, onClose, taskId: propTaskId }) => {
  const [searchParams] = useSearchParams();
  // Prefer the propTaskId if provided, fallback to searchParams
  const taskId = propTaskId ?? searchParams.get('taskId') ?? '';

  const [status, setStatus] = React.useState('');
  const [workType, setWorkType] = React.useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [selectedChild, setSelectedChild] = React.useState<any>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [updateTaskType] = useUpdateTaskTypeMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [showSubtaskInput, setShowSubtaskInput] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');


  const { data: comments = [], isLoading: isCommentsLoading } = useGetCommentsByTaskIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      await createSubtask({ taskId, title: newSubtaskTitle }).unwrap();
      setNewSubtaskTitle('');
      setShowSubtaskInput(false); // ẩn form sau khi tạo
      await refetch(); // cập nhật lại danh sách
    } catch (error) {
      console.error('Lỗi tạo subtask:', error);
    }
  };

  const {
    data: subtaskData = [],
    isLoading,
    refetch,
  } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  const { data: taskData, isLoading: isTaskLoading, refetch: refetchTask } = useGetTaskByIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  React.useEffect(() => {
    if (taskData) {
      setStatus(taskData.status);
      setDescription(taskData.description ?? '');
      setTitle(taskData.title ?? '');
      setWorkType(taskData.type ?? 'Task');
    }
  }, [taskData]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();

  const childWorkItems = subtaskData.map((item) => ({
    key: item.id,
    summary: item.title,
    priority: item.priority,
    assignee: item.assignedByName ?? 'Unassigned',
    status: item.status,
  }));

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubtaskStatus({ id, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update subtask status', err);
    }
  };

  const handleTaskStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      setStatus(newStatus);
      await refetchTask();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return 'None';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleWorkTypeChange = async (type: string) => {
    try {
      setWorkType(type);
      setIsDropdownOpen(false);
      await updateTaskType({ id: taskId, type: type.toUpperCase() }).unwrap();
      await refetchTask(); // Cập nhật lại dữ liệu task sau khi đổi type
    } catch (err) {
      console.error('❌ Lỗi cập nhật work type:', err);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation();

  const getIconSrc = () => {
    switch (workType) {
      case 'BUG': return bugIcon;
      case 'STORY': return flagIcon;
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
  if (!taskId) return <div className="modal-overlay"><p style={{ padding: 24 }}>❌ Không tìm thấy taskId trong URL.</p></div>;

  return (
    <div className="modal-overlay" onClick={() => setIsDropdownOpen(false)}>
      <div className="work-item-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
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
                    <div
                      key={type}
                      className={`dropdown-item ${workType === type ? 'selected' : ''}`}
                      onClick={() => handleWorkTypeChange(type)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer' }}
                    >
                      <img
                        src={type === 'Task' ? tickIcon : type === 'Bug' ? bugIcon : flagIcon}
                        alt={type}
                        style={{
                          width: '18px',
                          filter: type === 'Bug' ? 'hue-rotate(-1deg) saturate(3)' : 'none',
                        }}
                      />
                      <span style={{ flex: 1 }}>{type}</span>
                      {workType === type && (
                        <span style={{ fontSize: '16px' }}>✔</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </span>
            <input
              type="text"
              className="issue-summary"
              placeholder="Enter summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>✖</button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`📁 File "${file.name}" đã được upload giả lập.`);
                  }
                  setIsAddDropdownOpen(false);
                }}
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
                              onChange={(e) => handleStatusChange(item.key, e.target.value)}
                            >
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
                                  try {
                                    await createSubtask({ taskId, title: newSubtaskTitle }).unwrap();
                                    console.log("✅ Tạo thành công");
                                  } catch (err) {
                                    console.error("❌ Lỗi khi gọi createSubtask:", err);
                                  }

                                  setNewSubtaskTitle('');
                                  setShowSubtaskInput(false);
                                  await refetch(); // lấy lại danh sách subtask mới nhất
                                } catch (err) {
                                  console.error('Lỗi khi tạo subtask:', err);
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
              <div className="comment-list" style={{ marginBottom: '12px' }}>
                {isCommentsLoading ? (
                  <p>Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        User #{comment.accountId}{' '}
                        <span style={{ fontWeight: 'normal', color: '#888', fontSize: '12px' }}>
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', marginTop: '4px' }}>{comment.content}</div>
                    </div>
                  ))
                )}
              </div>
              <textarea className="activity-input" placeholder="Add a comment...\nCan I get more info..? Status update... Thanks..." />
              <p className="pro-tip">Pro tip: Press <strong>M</strong> to comment</p>
            </div>
          </div>

          {/* Details Panel */}
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