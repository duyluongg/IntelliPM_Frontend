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
  useUpdateTaskTypeMutation,
} from '../../services/taskApi';
import { useGetTaskFilesByTaskIdQuery, useUploadTaskFileMutation, useDeleteTaskFileMutation } from '../../services/taskFileApi';

const WorkItemDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId') || '';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateTaskType] = useUpdateTaskTypeMutation();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [workType, setWorkType] = useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [selectedChild, setSelectedChild] = React.useState<any>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [createSubtask] = useCreateSubtaskMutation();
  const [title, setTitle] = React.useState('');
  const [uploadTaskFile] = useUploadTaskFileMutation();
  const subtaskInputRef = React.useRef<HTMLTableRowElement>(null);
  const [deleteTaskFile] = useDeleteTaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);

  const { data: attachments = [], isLoading: isAttachmentsLoading } = useGetTaskFilesByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá file này?')) return;
    try {
      await deleteTaskFile(id).unwrap();
      alert('✅ Delete file successfully!');
      await refetchSubtask();
    } catch (error) {
      console.error('❌ Error delete file:', error);
      alert('❌ Delete file failed');
    }
  };

  const handleResize = (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
    const startX = e.clientX;
    const th = document.querySelectorAll('.issue-table th')[colIndex] as HTMLElement;
    const startWidth = th.offsetWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      th.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

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
      setWorkType(taskData.type);
    }
  }, [taskData]);

  const childWorkItems = subtaskData.map((item) => ({
    key: item.id,
    summary: item.title,
    priority: item.priority,
    assignee: item.assignedByName ?? 'Unassigned',
    status: item.status,
  }));

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

  const handleWorkTypeChange = async (type: string) => {
    try {
      setWorkType(type);
      setIsDropdownOpen(false);
      await updateTaskType({ id: taskId, type: type.toUpperCase() }).unwrap();
      await refetchTask();
    } catch (err) {
      console.error('❌ Error update work type:', err);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation();


  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getIconSrc = () => {
    switch (workType) {
      case 'BUG': return bugIcon;
      case 'STORY': return flagIcon;
      default: return tickIcon;
    }
  };

  // const handleAddSubtask = () => {
  //   setShowSubtaskInput(true);
  //   setIsAddDropdownOpen(false);
  // };

  const handleKeyClick = () => {
    navigate(`/work-item-detail?taskId=${taskId}`);
  };

  return (
    <div className="work-item-detail-page">
      <div className="work-item-detail-container">
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

                      setTimeout(() => {
                        subtaskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
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
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await uploadTaskFile({
                        taskId,
                        title: file.name,
                        file: file,
                      }).unwrap();
                      alert(`✅ Uploaded: ${file.name}`);
                      await refetchSubtask();
                    } catch (err) {
                      console.error('❌ Upload failed:', err);
                      alert('❌ Upload failed.');
                    }
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
              <div className="attachments-section">
                <label>Attachments {attachments.length > 0 && <span>({attachments.length})</span>}</label>
                <div className="attachments-grid">
                  {attachments.map(file => (
                    <div
                      className="attachment-card"
                      key={file.id}
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <a
                        href={file.urlFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="thumbnail">
                          {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={file.urlFile} alt={file.title} />
                          ) : (
                            <div className="doc-thumbnail">
                              <span className="doc-text">{file.title.slice(0, 15)}...</span>
                            </div>
                          )}
                        </div>
                        <div className="file-meta">
                          <div className="file-name" title={file.title}>{file.title}</div>
                          <div className="file-date">
                            {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                          </div>
                        </div>
                      </a>

                      {/* Nút xóa file */}
                      {hoveredFileId === file.id && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="delete-file-btn"
                          title="Xoá file"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="field-group">
              <label>Subtasks</label>
              <div className="issue-table">
                {isLoading ? (
                  <p>Loading subtasks...</p>
                ) : (
                  <div className="scrollable-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Type
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 0)} />
                          </th>
                          <th>
                            Key
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 1)} />
                          </th>
                          <th>
                            Summary
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 2)} />
                          </th>
                          <th>
                            Priority
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 3)} />
                          </th>
                          <th>
                            Assignee
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 4)} />
                          </th>
                          <th>
                            Status
                            <div className="resizer" onMouseDown={(e) => handleResize(e, 5)} />
                          </th>
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
                                onChange={(e) => handleSubtaskStatusChange(item.key, e.target.value)}
                                className={`custom-status-select status-${item.status.toLowerCase().replace('_', '-')}`}
                              >
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                              </select>
                            </td>

                          </tr>
                        ))}
                        {showSubtaskInput && (
                          <tr ref={subtaskInputRef}>
                            <td><img src={subtaskIcon} alt="Subtask" /></td>
                            <td colSpan={5}>
                              <input
                                type="text"
                                placeholder="Enter subtask title..."
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                style={{
                                  width: '45%',
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
                                      console.log("✅ Create successfully");
                                    } catch (err) {
                                      console.error("❌ Error to call createSubtask:", err);
                                    }

                                    setNewSubtaskTitle('');
                                    setShowSubtaskInput(false);
                                    await refetchSubtask();
                                  } catch (err) {
                                    console.error('Error create subtask:', err);
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
                  </div>
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
              <div className="panel-header">
                <select
                  value={status}
                  onChange={(e) => handleTaskStatusChange(e.target.value)}
                  className={`custom-status-select status-${status.toLowerCase().replace('_', '-')}`}
                >
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
