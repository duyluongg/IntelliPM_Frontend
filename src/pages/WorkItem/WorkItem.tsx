import React from 'react';
import './WorkItem.css';
import tickIcon from '../../assets/icon/type_task.svg';
import subtaskIcon from '../../assets/icon/type_subtask.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import flagIcon from '../../assets/icon/type_story.svg';
import accountIcon from '../../assets/account.png';
import deleteIcon from '../../assets/delete.png';
import ChildWorkItemPopup from './ChildWorkItemPopup';
import { useGetSubtasksByTaskIdQuery, useUpdateSubtaskStatusMutation, useCreateSubtaskMutation, useUpdateSubtaskMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery, useUpdateTaskStatusMutation, useUpdateTaskTypeMutation, useUpdateTaskTitleMutation, useUpdateTaskDescriptionMutation, useUpdatePlannedStartDateMutation, useUpdatePlannedEndDateMutation } from '../../services/taskApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCommentsByTaskIdQuery, useCreateTaskCommentMutation, useUpdateTaskCommentMutation, useDeleteTaskCommentMutation } from '../../services/taskCommentApi';
import { useGetTaskFilesByTaskIdQuery, useUploadTaskFileMutation, useDeleteTaskFileMutation } from '../../services/taskFileApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import { useGetWorkItemLabelsByTaskQuery } from '../../services/workItemLabelApi';
import { useGetTaskAssignmentsByTaskIdQuery } from '../../services/taskAssignmentApi';
import { useGenerateSubtasksByAIMutation } from '../../services/subtaskAiApi';
import type { AiSuggestedSubtask } from '../../services/subtaskAiApi'; // chỉnh lại path cho đúng

interface WorkItemProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null;
}

const WorkItem: React.FC<WorkItemProps> = ({ isOpen, onClose, taskId: propTaskId }) => {
  const [searchParams] = useSearchParams();
  const taskId = propTaskId ?? searchParams.get('taskId') ?? '';
  const [plannedStartDate, setPlannedStartDate] = React.useState('');
  const [plannedEndDate, setPlannedEndDate] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [workType, setWorkType] = React.useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [epicId, setEpicId] = React.useState('');
  const [sprintId, setSprintId] = React.useState('');
  const [selectedChild, setSelectedChild] = React.useState<any>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [updateTaskType] = useUpdateTaskTypeMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [showSubtaskInput, setShowSubtaskInput] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [uploadTaskFile] = useUploadTaskFileMutation();
  const subtaskInputRef = React.useRef<HTMLTableRowElement>(null);
  const [deleteTaskFile] = useDeleteTaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
  const [createTaskComment] = useCreateTaskCommentMutation();
  const [commentContent, setCommentContent] = React.useState('');
  const accountId = parseInt(localStorage.getItem("accountId") || "0");
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [updateTaskComment] = useUpdateTaskCommentMutation();
  const [deleteTaskComment] = useDeleteTaskCommentMutation();
  const [projectName, setProjectName] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [reporterName, setReporterName] = React.useState('');
  const [selectedAssignees, setSelectedAssignees] = React.useState<{ [key: string]: string }>({});
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [editableSummaries, setEditableSummaries] = React.useState<{ [key: string]: string }>({});
  const [editingSummaryId, setEditingSummaryId] = React.useState<string | null>(null);
  const [updateTaskTitle] = useUpdateTaskTitleMutation();
  const [updateTaskDescription] = useUpdateTaskDescriptionMutation();
  const [updatePlannedStartDate] = useUpdatePlannedStartDateMutation();
  const [updatePlannedEndDate] = useUpdatePlannedEndDateMutation();
  const [showSuggestionList, setShowSuggestionList] = React.useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = React.useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = React.useState<AiSuggestedSubtask[]>([]);
  const [generateSubtasksByAI, { isLoading: loadingSuggest }] = useGenerateSubtasksByAIMutation();

  const { data: assignees = [], isLoading: isAssigneeLoading } = useGetTaskAssignmentsByTaskIdQuery(taskId);

  const { data: attachments = [], isLoading: isAttachmentsLoading, refetch: refetchAttachments } = useGetTaskFilesByTaskIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteTaskFile(id).unwrap();
      alert('✅ Delete file successfully!');
      await refetchAttachments();
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

  const toISO = (localDate: string) => {
    const date = new Date(localDate);
    return date.toISOString(); // 2025-07-09T08:47:00.000Z
  };

  const handlePlannedStartDateTaskChange = async () => {
    if (plannedStartDate === taskData?.plannedStartDate?.slice(0, 16)) return;
    try {
      await updatePlannedStartDate({
        id: taskId,
        plannedStartDate: toISO(plannedStartDate),
      }).unwrap();
      console.log('✅ Start date updated');
    } catch (err) {
      console.error('❌ Failed to update start date', err);
    }
  };

  const handlePlannedEndDateTaskChange = async () => {
    if (plannedEndDate === taskData?.plannedEndDate?.slice(0, 16)) return;
    try {
      await updatePlannedEndDate({
        id: taskId,
        plannedEndDate: toISO(plannedEndDate),
      }).unwrap();
      console.log('✅ End date updated');
    } catch (err) {
      console.error('❌ Failed to update end date', err);
    }
  };

  const handleTitleTaskChange = async () => {
    try {
      await updateTaskTitle({ id: taskId, title }).unwrap();
      alert('✅ Update title task successfully!');
      console.log('Update title task successfully');
    } catch (err) {
      alert('✅ Error update task title!');
      console.error('Error update task title:', err);
    }
  };

  const handleDescriptionTaskChange = async () => {
    if (description === taskData?.description) return;

    try {
      await updateTaskDescription({ id: taskId, description }).unwrap();
      console.log('Update description task successfully!');
    } catch (err) {
      console.error('Error update task description:', err);
    }
  };

  const {
    data: subtaskData = [],
    isLoading,
    refetch,
  } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  const totalSubtasks = subtaskData.length;
  const completedSubtasks = subtaskData.filter((item) => item.status === 'DONE').length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const { data: taskData, isLoading: isTaskLoading, refetch: refetchTask } = useGetTaskByIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  const { data: projectMembers = [] } = useGetProjectMembersQuery(taskData?.projectId!, {
    skip: !taskData?.projectId,
  });

  const { data: workItemLabels = [], isLoading: isLabelLoading } = useGetWorkItemLabelsByTaskQuery(taskId, {
    skip: !taskId,
  });

  const { data: comments = [], isLoading: isCommentsLoading, refetch: refetchComments } = useGetCommentsByTaskIdQuery(taskId, {
    skip: !isOpen || !taskId,
  });

  React.useEffect(() => {
    if (taskData) {
      setStatus(taskData.status);
      setDescription(taskData.description ?? '');
      setTitle(taskData.title ?? '');
      setWorkType(taskData.type ?? 'Task');
      setPlannedStartDate(taskData.plannedStartDate);
      setPlannedEndDate(taskData.plannedEndDate);
      setProjectName(taskData.projectName ?? '');
      setReporterName(taskData.reporterName ?? '');
      setProjectId(String(taskData.projectId));
      setEpicId(String(taskData.epicId));
      setSprintId(String(taskData.sprintId));
    }
  }, [taskData]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();

  const childWorkItems = subtaskData.map((item) => ({
    key: item.id,
    summary: item.title,
    priority: item.priority,
    assignee: item.assignedByName ?? 'Unassigned',
    assigneeId: item.assignedBy ?? '0',
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
      await refetchTask();
    } catch (err) {
      console.error('❌ Error update work type:', err);
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
    navigate(`/project/work-item-detail?taskId=${taskId}`);
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
              onBlur={handleTitleTaskChange}
              style={{ width: '500px' }}
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
                      await refetchAttachments();
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
                onBlur={() => handleDescriptionTaskChange()}
              />

              {attachments.length > 0 && (
                <div className="attachments-section">
                  <label>Attachments <span>({attachments.length})</span></label>
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

                        {hoveredFileId === file.id && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="delete-file-btn"
                            title="Delete file"
                          >
                            <img src={deleteIcon} alt="Delete" style={{ width: '25px', height: '25px' }} />
                          </button>
                        )}
                      </div>
                    ))}

                  </div>
                </div>
              )}

            </div>
            <div className="field-group">
              <label>Subtasks</label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '16px',
                  margin: '12px 0',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: '500' }}>
                    <span style={{ marginRight: '6px', color: '#d63384' }}>🧠</span>
                    Create suggested work items
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const result = await generateSubtasksByAI(taskId).unwrap();
                        setAiSuggestions(result);
                        setShowSuggestionList(true);
                        setSelectedSuggestions([]);
                      } catch (err) {
                        alert('❌ Failed to get suggestions');
                        console.error(err);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f4f5f7',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {loadingSuggest ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span role="img" style={{ fontSize: '16px', animation: 'pulse 1s infinite' }}>🧠</span>
                        <div className="dot-loader">
                          <span>.</span><span>.</span><span>.</span>
                        </div>
                      </div>
                    ) : (
                      'Suggest'
                    )}

                  </button>
                </div>

                {/* Suggestions */}
                {showSuggestionList && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1000,
                    }}
                    onClick={() => setShowSuggestionList(false)}
                  >
                    <div
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        width: '480px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', fontWeight: '500' }}>
                          <span style={{ marginRight: '8px', color: '#d63384' }}>🧠</span>
                          AI Suggested Subtasks
                        </div>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                          }}
                          title="Close"
                        >
                          ✖
                        </button>
                      </div>

                      {/* Suggestion List */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          padding: '4px 8px',
                          marginBottom: '16px',
                        }}
                      >
                        {aiSuggestions.map((item, idx) => (
                          <label
                            key={idx}
                            style={{
                              display: 'flex !important',
                              alignItems: 'flex-start',
                              gap: '8px',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSuggestions.includes(item.title)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedSuggestions((prev) =>
                                  checked ? [...prev, item.title] : prev.filter((t) => t !== item.title)
                                );
                              }}
                              style={{ display: 'flex !important', marginTop: '3px' }}
                            />
                            <span>{item.title}</span>
                          </label>
                        ))}
                      </div>

                      {/* Create Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={async () => {
                            for (const title of selectedSuggestions) {
                              try {
                                await createSubtask({ taskId, title }).unwrap();
                              } catch (err) {
                                console.error(`❌ Failed to create: ${title}`, err);
                              }
                            }
                            alert('✅ Created selected subtasks');
                            setShowSuggestionList(false);
                            setSelectedSuggestions([]);
                            await refetch();
                          }}
                          disabled={selectedSuggestions.length === 0}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: selectedSuggestions.length > 0 ? '#0052cc' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 500,
                            cursor: selectedSuggestions.length > 0 ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Create Selected
                        </button>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#eee',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    backgroundColor: '#4caf50',
                    height: '100%',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#555' }}>
                  {progressPercent}% Done
                </div>
              </div>

              <div className="issue-table">
                {isLoading ? (
                  <p>Loading...</p>
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
                            <td><a onClick={() => setSelectedChild(item)} style={{ cursor: 'pointer' }}>{item.key}</a></td>
                            <td onClick={() => setEditingSummaryId(item.key)} style={{ cursor: 'pointer' }}>
                              {editingSummaryId === item.key ? (
                                <input
                                  type="text"
                                  value={editableSummaries[item.key] ?? item.summary}
                                  onChange={(e) =>
                                    setEditableSummaries((prev) => ({ ...prev, [item.key]: e.target.value }))
                                  }
                                  onBlur={async () => {
                                    const newTitle = editableSummaries[item.key]?.trim();
                                    if (newTitle && newTitle !== item.summary) {
                                      try {
                                        await updateSubtask({
                                          id: item.key,
                                          assignedBy: parseInt(selectedAssignees[item.key] ?? item.assigneeId),
                                          title: newTitle,
                                          description: taskData?.description ?? '',
                                          priority: item.priority,
                                        }).unwrap();
                                        alert('✅ Updated summary');
                                        console.log('✅ Updated summary');
                                        await refetch();
                                      } catch (err) {
                                        console.error('❌ Failed to update summary:', err);
                                        alert('❌ Failed to update summary');
                                      }
                                    }
                                    setEditingSummaryId(null);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      (e.target as HTMLInputElement).blur(); 
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                item.summary
                              )}
                            </td>

                            <td>
                              <select
                                value={item.priority}
                                onChange={async (e) => {
                                  const newPriority = e.target.value;
                                  try {
                                    await updateSubtask({
                                      id: item.key,
                                      assignedBy: parseInt(selectedAssignees[item.key] ?? item.assigneeId),
                                      title: editableSummaries[item.key] ?? item.summary,
                                      description: taskData?.description ?? '',
                                      priority: newPriority,
                                    }).unwrap();
                                    console.log('✅ Updated priority');
                                    await refetch();
                                  } catch (err) {
                                    console.error('❌ Failed to update priority:', err);
                                    alert('❌ Failed to update priority');
                                  }
                                }}
                                style={{ padding: '4px 8px' }}
                              >
                                <option value="HIGHEST">Highest</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                                <option value="LOWEST">Lowest</option>
                              </select>
                            </td>

                            <td>
                              <div className="dropdown-wrapper">
                                <select
                                  value={selectedAssignees[item.key] || item.assigneeId}
                                  onChange={async (e) => {
                                    const newAssigneeId = parseInt(e.target.value);
                                    setSelectedAssignees((prev) => ({ ...prev, [item.key]: newAssigneeId.toString() }));

                                    try {
                                      await updateSubtask({
                                        id: item.key,
                                        assignedBy: newAssigneeId,
                                        priority: item.priority,
                                        title: item.summary,
                                        description: taskData?.description ?? '', // giữ nguyên
                                      }).unwrap();
                                      alert('✅ Updated subtask assignee');
                                      console.log('✅ Updated subtask assignee');
                                      await refetch();
                                    } catch (err) {
                                      console.error('❌ Failed to update subtask:', err);
                                      alert('❌ Failed to update subtask');
                                    }
                                  }}
                                  style={{ padding: '4px 8px' }}
                      
                                >
                                  <option value="0">Unassigned</option>
                                  {projectMembers.map((member) => (
                                    <option key={member.accountId} value={member.accountId}>
                                      {member.accountName}
                                    </option>
                                  ))}

                                </select>
                              </div>
                            </td>

                            <td>
                              <select
                                value={item.status}
                                onChange={(e) => handleStatusChange(item.key, e.target.value)}
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
                                    await refetch();
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
            <div className="activity-section">
              <h4 style={{ marginBottom: '8px' }}>Activity</h4>

              {/* Tabs */}
              <div className="activity-tabs">
                <button
                  className={`activity-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('COMMENTS')}
                >
                  Comments
                </button>
                <button
                  className={`activity-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
                  onClick={() => setActiveTab('HISTORY')}
                >
                  History
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'COMMENTS' ? (
                <>
                  <div className="comment-list">
                    {isCommentsLoading ? (
                      <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
                    ) : (
                      comments
                        .slice()
                        .reverse()
                        .map((comment: any) => (
                          <div key={comment.id} className="simple-comment">
                            <div className="avatar-circle">
                              <img src={accountIcon} alt="avatar" className="avatar-img" />
                            </div>
                            <div className="comment-content">
                              <div className="comment-header">
                                <strong>{comment.accountName || `User #${comment.accountId}`}</strong>{' '}
                                <span className="comment-time">
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div className="comment-text">{comment.content}</div>
                              {comment.accountId === accountId && (
                                <div className="comment-actions">
                                  <button
                                    className="edit-btn"
                                    onClick={async () => {
                                      const newContent = prompt("✏ Edit your comment:", comment.content);
                                      if (newContent && newContent !== comment.content) {
                                        try {
                                          await updateTaskComment({
                                            id: comment.id,
                                            taskId,
                                            accountId,
                                            content: newContent,
                                          }).unwrap();
                                          alert("✅ Comment updated");
                                          await refetchComments();
                                        } catch (err) {
                                          console.error("❌ Failed to update comment", err);
                                          alert("❌ Update failed");
                                        }
                                      }
                                    }}
                                  >
                                    ✏ Edit
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={async () => {
                                      if (window.confirm("🗑️ Are you sure you want to delete this comment?")) {
                                        try {
                                          await deleteTaskComment(comment.id).unwrap();
                                          alert("🗑️ Deleted successfully");
                                          await refetchComments();
                                        } catch (err) {
                                          console.error("❌ Failed to delete comment", err);
                                          alert("❌ Delete failed");
                                        }
                                      }
                                    }}
                                  >
                                    🗑 Delete
                                  </button>
                                </div>
                              )}

                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="simple-comment-input">
                    <textarea
                      placeholder="Add a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button
                      disabled={!commentContent.trim()}
                      onClick={async () => {
                        try {
                          if (!accountId || isNaN(accountId)) {
                            alert('❌ User not identified. Please log in again.');
                            return;
                          }
                          createTaskComment({
                            taskId,
                            accountId,
                            content: commentContent.trim(),
                          }).unwrap();
                          alert("✅ Comment posted");
                          setCommentContent('');
                          await refetchComments();
                        } catch (err: any) {
                          console.error('❌ Failed to post comment:', err);
                          alert('❌ Failed to post comment: ' + JSON.stringify(err?.data || err));
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </>
              ) : (
                <div className="activity-placeholder">
                  Chưa có nhật ký hoạt động.
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="details-panel">
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
            <div className="details-content">
              <h4>Details</h4>
              <div className="detail-item">
                <label>Assignee</label>
                <span>
                  {isAssigneeLoading
                    ? 'Loading...'
                    : assignees.length === 0
                      ? 'None'
                      : assignees.map((assignee) => assignee.accountFullname).join(', ')}
                </span>
              </div>
              <div className="detail-item">
                <label>Labels</label>
                <span>
                  {isLabelLoading
                    ? 'Loading...'
                    : workItemLabels.length === 0
                      ? 'None'
                      : workItemLabels.map((label) => label.labelName).join(', ')}
                </span>
              </div>
              <div className="detail-item"><label>Parent</label><span>{taskData?.epicId ?? 'None'}</span></div>
              <div className="detail-item"><label>Sprint</label><span>{taskData?.sprintId ?? 'None'}</span></div>
              <div className="detail-item">
                <label>Start date</label>
                <input
                  type="date"
                  value={plannedStartDate?.slice(0, 10) ?? ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const fullDate = `${selectedDate}T00:00:00.000Z`;
                    setPlannedStartDate(fullDate);
                  }}
                  onBlur={() => handlePlannedStartDateTaskChange()}
                  style={{ width: '150px' }}
                />
              </div>

              <div className="detail-item">
                <label>Due date</label>
                <input
                  type="date"
                  value={plannedEndDate?.slice(0, 10) ?? ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const fullDate = `${selectedDate}T00:00:00.000Z`;
                    setPlannedEndDate(fullDate);
                  }}
                  onBlur={() => handlePlannedEndDateTaskChange()}
                  style={{ width: '150px' }}
                />
              </div>
              <div className="detail-item"><label>Reporter</label><span>{taskData?.reporterName ?? 'None'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {selectedChild && (
        <ChildWorkItemPopup
          item={selectedChild}
          onClose={() => setSelectedChild(null)}
          taskId={taskId}
        />
      )}
    </div>
  );
};

export default WorkItem;