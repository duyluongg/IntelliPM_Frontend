import React from 'react';
import { useState, useRef } from 'react';
import './EpicDetail.css';
import { useParams } from 'react-router-dom';
import { useAuth, type Role } from '../../services/AuthContext';
import { useGetTasksByEpicIdQuery, useUpdateTaskStatusMutation, useCreateTaskMutation, useUpdateTaskTitleMutation } from '../../services/taskApi';
import { useGetWorkItemLabelsByEpicQuery, useDeleteWorkItemLabelMutation } from '../../services/workItemLabelApi';
import { useGetEpicFilesByEpicIdQuery, useUploadEpicFileMutation, useDeleteEpicFileMutation } from '../../services/epicFileApi';
import { useLazyGetTaskAssignmentsByTaskIdQuery, useCreateTaskAssignmentQuickMutation, useDeleteTaskAssignmentMutation } from '../../services/taskAssignmentApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import type { TaskAssignmentDTO } from '../../services/taskAssignmentApi';
import WorkItem from './WorkItem';
import { useNavigate } from 'react-router-dom';
import { useGetEpicByIdQuery, useUpdateEpicStatusMutation, useUpdateEpicMutation } from '../../services/epicApi';
import { useGetCommentsByEpicIdQuery, useCreateEpicCommentMutation, useUpdateEpicCommentMutation, useDeleteEpicCommentMutation } from '../../services/epicCommentApi';
import { useGetSprintsByProjectIdQuery } from '../../services/sprintApi';
import epicIcon from '../../assets/icon/type_epic.svg';
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';
import deleteIcon from '../../assets/delete.png';
import accountIcon from '../../assets/account.png';
import { useGetActivityLogsByProjectIdQuery } from '../../services/activityLogApi';
import { useCreateLabelAndAssignMutation, useGetLabelsByProjectIdQuery } from '../../services/labelApi';

const EpicDetail: React.FC = () => {
  const { epicId: epicIdFromUrl } = useParams();
  const { data: epic, isLoading } = useGetEpicByIdQuery(epicIdFromUrl || '');
  const { data: tasks = [], isLoading: loadingTasks, refetch } = useGetTasksByEpicIdQuery(epicIdFromUrl ?? '');
  const { user } = useAuth();
  const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
  const [status, setStatus] = React.useState('');
  const [projectId, setProjectId] = React.useState("");
  const [epicStateId, setEpicStateId] = React.useState<string>(''); // thay vì string | undefined
  const [updateEpicStatus] = useUpdateEpicStatusMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showTaskInput, setShowTaskInput] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const taskInputRef = React.useRef<HTMLTableRowElement>(null);
  const [newTaskType, setNewTaskType] = React.useState<'TASK' | 'BUG' | 'STORY'>('TASK');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const taskTypes = [
    { label: 'Task', value: 'TASK', icon: taskIcon },
    { label: 'Bug', value: 'BUG', icon: bugIcon },
    { label: 'Story', value: 'STORY', icon: storyIcon },
  ];
  const [description, setDescription] = React.useState('');
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
  const { data: attachments = [], refetch: refetchAttachments } = useGetEpicFilesByEpicIdQuery(epicIdFromUrl ?? '');
  const [uploadEpicFile] = useUploadEpicFileMutation();
  const [deleteEpicFile] = useDeleteEpicFileMutation();
  const accountId = parseInt(localStorage.getItem("accountId") || "0");
  const [createTask] = useCreateTaskMutation();
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editableTitles, setEditableTitles] = React.useState<Record<string, string>>({});
  const [updateTaskTitle] = useUpdateTaskTitleMutation();
  const [selectedAssignees, setSelectedAssignees] = React.useState<Record<string, number[]>>({});
  const [createTaskAssignment] = useCreateTaskAssignmentQuickMutation();
  const [deleteTaskAssignment] = useDeleteTaskAssignmentMutation();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((item) => item.status === 'DONE').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const [taskAssignmentMap, setTaskAssignmentMap] = React.useState<Record<string, TaskAssignmentDTO[]>>({});
  const [getTaskAssignments] = useLazyGetTaskAssignmentsByTaskIdQuery();
  const [updateEpic] = useUpdateEpicMutation();
  const [newName, setNewName] = React.useState<string | undefined>();
  const [newDescription, setNewDescription] = React.useState<string | undefined>();
  const [newStartDate, setNewStartDate] = React.useState<string | undefined>();
  const [newEndDate, setNewEndDate] = React.useState<string | undefined>();
  //const [newSprintId, setNewSprintId] = React.useState<number | null>(null);
  const [selectedAssignee, setSelectedAssignee] = React.useState<number | null>(null);
  const [newAssignedBy, setNewAssignedBy] = React.useState<number | null>(null);
  const [selectedReporter, setSelectedReporter] = React.useState<number | null>(null);
  const [newReporterId, setNewReporterId] = React.useState<number | null>(null);
  const [commentContent, setCommentContent] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [updateEpicComment] = useUpdateEpicCommentMutation();
  const [deleteEpicComment] = useDeleteEpicCommentMutation();
  const [createEpicComment] = useCreateEpicCommentMutation();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [deleteWorkItemLabel] = useDeleteWorkItemLabelMutation();

  const { data: comments = [], isLoading: isCommentsLoading, refetch: refetchComments } = useGetCommentsByEpicIdQuery(epicIdFromUrl!, {
    skip: !epicIdFromUrl,
  });

  React.useEffect(() => {
    if (epic && newAssignedBy !== null && newAssignedBy !== epic.assignedBy) {
      handleUpdateEpic();
    }
  }, [newAssignedBy]);

  React.useEffect(() => {
    if (epic && newReporterId !== null && newReporterId !== epic.reporterId) {
      handleUpdateEpic();
    }
  }, [newReporterId]);


  React.useEffect(() => {
    const fetchAllTaskAssignments = async () => {
      const result: Record<string, TaskAssignmentDTO[]> = {};

      for (const t of tasks) {
        try {
          const data = await getTaskAssignments(t.id).unwrap();
          result[t.id] = data;
        } catch (err) {
          console.error(`❌ Failed to fetch assignees for ${t.id}:`, err);
        }
      }

      setTaskAssignmentMap(result);
    };

    if (tasks.length > 0) fetchAllTaskAssignments();
  }, [tasks]);

  const { data: projectMembers = [] } = useGetProjectMembersQuery(epic?.projectId!, {
    skip: !epic?.projectId,
  });

  const { data: activityLogs = [], isLoading: isActivityLogsLoading, refetch: refetchActivityLogs } = useGetActivityLogsByProjectIdQuery(epic?.projectId!, {
    skip: !epic?.projectId,
  });

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteEpicFile(fileId).unwrap();
      alert('✅ Delete file successfully!');
      await refetchAttachments();
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
    }
  };

  React.useEffect(() => {
    if (epic && epic.assignedBy !== undefined) {
      setEpicStateId(epic.id);
      setStatus(epic.status);
      setDescription(epic.description);
      setProjectId(String(epic.projectId));
      setSelectedAssignee(epic.assignedBy);
      setNewAssignedBy(epic.assignedBy);
      if (epic?.reporterId) {
        setSelectedReporter(epic.reporterId);
        setNewReporterId(epic.reporterId);
      }

      if (epic?.assignedBy) {
        setSelectedAssignee(epic.assignedBy);
        setNewAssignedBy(epic.assignedBy);
      }
    }
  }, [epic]);

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

  const handleUpdateEpic = async () => {
    if (!epic) return;

    try {
      await updateEpic({
        id: epic.id,
        data: {
          projectId: epic.projectId,
          name: newName ?? epic.name,
          description: newDescription ?? epic.description,
          assignedBy: newAssignedBy ?? epic.assignedBy,
          reporterId: newReporterId ?? epic.reporterId,
          startDate: newStartDate ?? epic.startDate,
          endDate: newEndDate ?? epic.endDate,
          status: epic.status,
        },
      }).unwrap();

      alert("✅ Epic updated");
      console.error("✅ Epic updated");
    } catch (err) {
      console.error("❌ Failed to update epic", err);
      alert("❌ Update failed");
    }
  };

  React.useEffect(() => {
    if (epic) setStatus(epic.status);
  }, [epic]);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus, createdBy: accountId }).unwrap();
      refetch();
    } catch (err) {
      console.error('❌ Error updating task status:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEpicStatus({ id: epicIdFromUrl!, status: newStatus }).unwrap();
      setStatus(newStatus);
    } catch (err) {
      console.error('❌ Error updating epic status:', err);
    }
  };

  const canEditStatus = (assigneeIds: number[] | number | null) => {
    const currentUserId = accountId.toString();
    const isAssignee = Array.isArray(assigneeIds)
      ? assigneeIds.map(id => id.toString()).includes(currentUserId)
      : assigneeIds?.toString() === currentUserId;
    return isAssignee || canEdit;
  };

  const { data: workItemLabels = [], isLoading: isLabelLoading, refetch: refetchWorkItemLabels } = useGetWorkItemLabelsByEpicQuery(
    epicIdFromUrl!, { skip: !epicIdFromUrl, }
  );

  const { data: projectLabels = [], isLoading: isProjectLabelsLoading,
    refetch: refetchProjectLabels, } = useGetLabelsByProjectIdQuery(epic?.projectId!, {
      skip: !epic?.projectId,
    });

  const filteredLabels = projectLabels.filter((label) => {
    const notAlreadyAdded = !workItemLabels.some((l) => l.labelName === label.name);

    if (newLabelName.trim() === '') {
      return notAlreadyAdded;
    }

    return (
      label.name.toLowerCase().includes(newLabelName.toLowerCase()) &&
      notAlreadyAdded
    );
  });

  const [createLabelAndAssign, { isLoading: isCreating }] = useCreateLabelAndAssignMutation();

  const handleCreateLabelAndAssign = async (labelName?: string) => {
    const nameToAssign = labelName?.trim() || newLabelName.trim();

    if (!epic?.projectId || !epicIdFromUrl || !nameToAssign) {
      alert('Missing projectId, taskId or label name!');
      return;
    }

    try {
      await createLabelAndAssign({
        projectId: epic.projectId,
        name: nameToAssign,
        taskId: null,
        epicId: epicIdFromUrl,
        subtaskId: null,
      }).unwrap();

      alert('✅ Label assigned successfully!');
      setNewLabelName('');
      setIsEditingLabel(false);
      await Promise.all([
        refetchWorkItemLabels?.(),
        refetchProjectLabels?.(),
      ]);
    } catch (error) {
      console.error('❌ Failed to create and assign label:', error);
      alert('❌ Failed to assign label');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsEditingLabel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteWorkItemLabel = async (id: number) => {
    try {
      await deleteWorkItemLabel(id).unwrap();
      console.log('Delete successfully');
      await refetchWorkItemLabels();
    } catch (error) {
      console.error(':', error);
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

  const { data: epicLabels = [] } = useGetWorkItemLabelsByEpicQuery(epicIdFromUrl ?? '', {
    skip: !epicIdFromUrl,
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
              <span
                className="issue-key"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/project/epic/${epic.id}`)}
              >
                {epic.id}
              </span>
            </span>
            <input
              type="text"
              className="issue-summary"
              placeholder="Enter epic name"
              defaultValue={epic.name}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleUpdateEpic}
              disabled={!canEdit}
              style={{ width: 500 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Main Section */}
          <div className="main-section">
            <div className="add-menu-wrapper" style={{ marginBottom: '8px' }}>
              <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>
                + Add
              </button>
              {isAddDropdownOpen && (
                <div className="add-dropdown">
                  <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                    📁 Attachment
                  </div>
                  {(user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER') && (
                    <div className="add-item" onClick={() => {
                      setShowTaskInput(true);
                      setIsAddDropdownOpen(false);
                      setTimeout(() => {
                        taskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}>
                      📝 Task
                    </div>
                  )}
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
                      await uploadEpicFile({
                        epicId: epicIdFromUrl!,
                        title: file.name,
                        file,
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
                value={newDescription ?? epic?.description ?? ''}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleUpdateEpic}
                disabled={!canEdit}
              />
            </div>

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

            <div className="field-group">
              <label>Child Work Items</label>
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
                <div className="issue-epic-table">
                  <div className="scrollable-epic-table-wrapper">
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
                        {loadingTasks ? (
                          <tr><td colSpan={6}>Loading tasks...</td></tr>
                        ) : tasks.length === 0 ? (
                          <tr><td colSpan={6}>No tasks found for this epic.</td></tr>
                        ) : (
                          tasks.map((task) => (
                            <tr key={task.id}>
                              <td><img
                                src={getTypeIcon(task.type)}
                                alt={task.type}
                                title={task.type.charAt(0) + task.type.slice(1).toLowerCase()}
                              />
                              </td>

                              <td>
                                <span
                                  className="hover-underline"
                                  onClick={() => navigate(`/project/work-item-detail?taskId=${task.id}`)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {task.id}
                                </span>
                              </td>

                              <td onClick={() => setEditingTaskId(task.id)} style={{
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                maxWidth: '300px',
                              }}>
                                {editingTaskId === task.id ? (
                                  canEdit ? (
                                    <input
                                      type="text"
                                      value={editableTitles[task.id] ?? task.title}
                                      onChange={(e) =>
                                        setEditableTitles((prev) => ({ ...prev, [task.id]: e.target.value }))
                                      }
                                      onBlur={async () => {
                                        const newTitle = editableTitles[task.id]?.trim();
                                        if (newTitle && newTitle !== task.title) {
                                          try {
                                            await updateTaskTitle({ id: task.id, title: newTitle, createdBy: accountId }).unwrap();
                                            await refetch();
                                            await refetchActivityLogs();
                                          } catch (err) {
                                            console.error('❌ Failed to update title:', err);
                                          }
                                        }
                                        setEditingTaskId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          (e.target as HTMLInputElement).blur();
                                        }
                                      }}
                                      autoFocus
                                      style={{
                                        width: '100%',
                                        padding: '4px 6px',
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                      }}
                                    />
                                  ) : task.title
                                ) : task.title}
                              </td>

                              <td>
                                {canEdit ? (
                                  <select
                                    value={task.priority}
                                    onChange={async (e) => {
                                      const newPriority = e.target.value;
                                      // try {
                                      //     await updateTaskStatus({
                                      //         id: task.id,
                                      //         priority: newPriority,
                                      //     }).unwrap();
                                      //     await refetch(); // refresh task list
                                      // } catch (err) {
                                      //     console.error('❌ Error updating priority:', err);
                                      // }
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid #ccc',
                                      backgroundColor: 'white',
                                    }}
                                  >
                                    <option value="HIGHEST">Highest</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                    <option value="LOWEST">Lowest</option>
                                  </select>
                                ) : (
                                  <span>{task.priority ?? 'NONE'}</span>
                                )}
                              </td>

                              <td>
                                {canEdit ? (
                                  <div className="multi-select-dropdown">
                                    {/* Hiển thị danh sách đã chọn */}
                                    <div className="selected-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {(taskAssignmentMap[task.id] ?? []).map((assignment) => (
                                        <span className="selected-tag" key={assignment.accountId}>
                                          {assignment.accountFullname ?? 'Unknown'}
                                          <button
                                            className="remove-tag"
                                            onClick={async () => {
                                              try {
                                                await deleteTaskAssignment({
                                                  taskId: task.id,
                                                  assignmentId: assignment.id,
                                                }).unwrap();

                                                setTaskAssignmentMap((prev) => ({
                                                  ...prev,
                                                  [task.id]: prev[task.id].filter((a) => a.accountId !== assignment.accountId),
                                                }));
                                              } catch (err) {
                                                console.error('❌ Failed to delete assignee:', err);
                                              }
                                            }}
                                          >
                                            ✖
                                          </button>
                                        </span>
                                      ))}
                                    </div>

                                    {/* Dropdown chọn thêm */}
                                    <div className="dropdown-select-wrapper">
                                      <select
                                        onChange={async (e) => {
                                          const selectedId = parseInt(e.target.value);
                                          if (!selectedAssignees[task.id]?.includes(selectedId)) {
                                            try {
                                              await createTaskAssignment({
                                                taskId: task.id,
                                                accountId: selectedId,
                                              }).unwrap();

                                              const data = await getTaskAssignments(task.id).unwrap();

                                              setTaskAssignmentMap((prev) => ({
                                                ...prev,
                                                [task.id]: data,
                                              }));

                                              setSelectedAssignees((prev) => ({
                                                ...prev,
                                                [task.id]: [...(prev[task.id] ?? []), selectedId],
                                              }));
                                            } catch (err) {
                                              console.error('❌ Failed to create assignee:', err);
                                              alert('❌ Error adding assignee');
                                            }
                                          }
                                        }}
                                        value=""
                                      >
                                        <option value="" disabled hidden>
                                          + Add assignee
                                        </option>
                                        {projectMembers
                                          .filter(
                                            (m) =>
                                              !(taskAssignmentMap[task.id] ?? []).some(
                                                (a) => a.accountId === m.accountId
                                              )
                                          )
                                          .map((member) => (
                                            <option key={member.accountId} value={member.accountId}>
                                              {member.accountName}
                                            </option>
                                          ))}
                                      </select>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {(taskAssignmentMap[task.id] ?? []).map((assignment) => (
                                      <span key={assignment.accountId} style={{ marginBottom: '4px' }}>
                                        {assignment.accountFullname ?? 'Unknown'}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td>
                                {canEditStatus((taskAssignmentMap[task.id] ?? []).map(a => a.accountId)) ? (
                                  <select
                                    className={`custom-epic-status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                                    value={task.status}
                                    onChange={async (e) => {
                                      try {
                                        await updateTaskStatus({
                                          id: task.id,
                                          status: e.target.value,
                                          createdBy: accountId,
                                        }).unwrap();
                                        await refetch();
                                        await refetchActivityLogs();
                                      } catch (err) {
                                        console.error('❌ Error updating status:', err);
                                      }
                                    }}
                                  >
                                    <option value="TO_DO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`custom-epic-status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                                  >
                                    {task.status.replace('_', ' ')}
                                  </span>
                                )}
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {showTaskInput && (
                <tr ref={taskInputRef}>
                  <td>
                    <div className="task-type-selector" style={{ position: 'relative' }}>
                      <button
                        className="task-type-button"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          background: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={
                            newTaskType === 'BUG'
                              ? bugIcon
                              : newTaskType === 'STORY'
                                ? storyIcon
                                : taskIcon
                          }
                          alt={newTaskType}
                          style={{ width: 16, marginRight: 6 }}
                        />
                        {newTaskType.charAt(0) + newTaskType.slice(1).toLowerCase()}

                      </button>

                      {showTypeDropdown && (
                        <div
                          className="dropdown-menu"
                          style={{
                            position: 'absolute',
                            bottom: '110%',
                            left: 0,
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            width: 120,
                          }}
                        >
                          {taskTypes.map((type) => (
                            <div
                              key={type.value}
                              className="dropdown-item"
                              onClick={() => {
                                setNewTaskType(type.value as 'TASK' | 'BUG' | 'STORY');
                                setShowTypeDropdown(false);
                              }}
                              style={{
                                padding: '6px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                gap: 6,
                              }}
                            >
                              <img src={type.icon} alt={type.label} style={{ width: 16 }} />
                              {type.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  <td colSpan={5}>
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      style={{
                        width: '50%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginRight: '8px',
                      }}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const now = new Date().toISOString();

                          await createTask({
                            reporterId: accountId,
                            projectId: parseInt(projectId),
                            epicId: epic.id,
                            title: newTaskTitle.trim(),
                            type: newTaskType,
                            createdBy: accountId,
                          }).unwrap();

                          console.log('✅ Task created');
                          setNewTaskTitle('');
                          setShowTaskInput(false);
                          await refetch();
                          await refetchActivityLogs();
                        } catch (err) {
                          console.error('❌ Failed to create task:', err);
                          alert('❌ Failed to create task');
                        }
                      }}

                      disabled={!newTaskTitle.trim()}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0052cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: newTaskTitle.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowTaskInput(false);
                        setNewTaskTitle('');
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
              {activeTab === 'HISTORY' && (
                <div className="history-list">
                  {isActivityLogsLoading ? (
                    <div>Loading...</div>
                  ) : activityLogs.length === 0 ? (
                    <div>No history available.</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="history-item">
                        <div className="history-header">
                          <span className="history-user">{log.createdByName}</span>
                          <span className="history-time">
                            {new Date(log.createdAt).toLocaleTimeString()} {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="history-message">{log.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

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
                              <img src={comment.accountPicture || accountIcon} alt="avatar" />
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
                                          await updateEpicComment({
                                            id: comment.id,
                                            epicId: epicIdFromUrl!,
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
                                          await deleteEpicComment(comment.id).unwrap();
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
                          createEpicComment({
                            epicId: epicIdFromUrl!,
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
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="details-panel">
            <div className="panel-header">
              {canEditStatus(epic.assignedBy) ? (
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`custom-epic-status-select status-${status.toLowerCase().replace('_', '-')}`}
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              ) : (
                <span
                  className={`custom-epic-status-select status-${status.toLowerCase().replace('_', '-')}`}
                >
                  {status.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="details-content">
              <div className="detail-item">
                <label>Assignee</label>
                {canEdit ? (
                  <select
                    value={selectedAssignee ?? ''}
                    onChange={(e) => {
                      const assigneeId = Number(e.target.value);
                      setSelectedAssignee(assigneeId);
                      setNewAssignedBy(assigneeId);
                    }}
                    style={{ padding: '2px 0px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', width: '150px' }}
                  >
                    <option value="" disabled>-- Select assignee --</option>
                    {projectMembers.map((member) => (
                      <option key={member.accountId} value={member.accountId}>
                        {member.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers.find((m) => m.accountId === selectedAssignee)?.accountName ?? 'None'}
                  </span>
                )}
              </div>

              {isEditingLabel ? (
                <div ref={labelRef} className="flex flex-col gap-2 w-full relative">
                  <div className="flex flex-col gap-2 w-full relative">
                    <label className="font-semibold">Labels</label>

                    {/* Tag list + input */}
                    <div
                      className="border rounded px-2 py-1 flex flex-wrap items-center gap-2 min-h-[42px] focus-within:ring-2 ring-blue-400"
                      onClick={() => setDropdownOpen(true)}
                    >
                      {workItemLabels.map((label) => (
                        <span
                          key={label.id}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {label.labelName}
                          <button
                            onClick={() => handleDeleteWorkItemLabel(label.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        value={newLabelName}
                        onChange={(e) => {
                          setNewLabelName(e.target.value);
                          setDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateLabelAndAssign();
                        }}
                        placeholder="Type to search or add"
                        className="flex-1 min-w-[100px] border-none outline-none py-1"
                        autoFocus
                      />
                    </div>

                    {/* Dropdown suggestion */}
                    {dropdownOpen && filteredLabels.length > 0 && (
                      <ul className="absolute top-full mt-1 w-full bg-white border rounded shadow z-10 max-h-48 overflow-auto">
                        <li className="px-3 py-1 font-semibold text-gray-600 border-b">All labels</li>
                        {filteredLabels.map((label) => (
                          <li
                            key={label.id}
                            onClick={() => handleCreateLabelAndAssign(label.name)}
                            className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                          >
                            {label.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-item" onClick={() => setIsEditingLabel(true)}>
                  <label className="font-semibold">Labels</label>
                  <span>
                    {isLabelLoading
                      ? 'Loading...'
                      : workItemLabels.length === 0
                        ? 'None'
                        : workItemLabels.map((label) => label.labelName).join(', ')}
                  </span>
                </div>
              )}

              <div className="detail-item"><label>Sprint</label><span>{epic?.sprintName ?? 'None'} : {epic?.sprintGoal ?? 'None'}</span></div>
              <div className="detail-item">
                <label>Start date</label>
                {canEdit ? (
                  <input
                    type="date"
                    value={newStartDate?.slice(0, 10) ?? epic?.startDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;
                      setNewStartDate(fullDate);
                    }}
                    onBlur={handleUpdateEpic}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{epic?.startDate?.slice(0, 10) ?? 'None'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Due date</label>
                {canEdit ? (
                  <input
                    type="date"
                    value={newEndDate?.slice(0, 10) ?? epic?.endDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;
                      setNewEndDate(fullDate);
                    }}
                    onBlur={handleUpdateEpic}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{epic?.endDate?.slice(0, 10) ?? 'None'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>Reporter</label>
                {canEdit ? (
                  <select
                    value={selectedReporter ?? ''}
                    onChange={(e) => {
                      const reporterId = Number(e.target.value);
                      setSelectedReporter(reporterId);
                      setNewReporterId(reporterId);
                    }}
                    style={{ padding: '2px 0px', width: '150px' }}
                  >
                    <option value="" disabled>-- Select reporter --</option>
                    {projectMembers.map((member) => (
                      <option key={member.accountId} value={member.accountId}>
                        {member.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers.find((m) => m.accountId === selectedReporter)?.accountName ?? 'None'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedTaskId && (
        <WorkItem
          isOpen={true}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};

export default EpicDetail;
