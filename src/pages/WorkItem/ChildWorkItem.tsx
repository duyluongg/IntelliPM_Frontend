import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import './ChildWorkItem.css';
import Swal from 'sweetalert2';
import { useAuth, type Role } from '../../services/AuthContext';
import {
  useUpdateSubtaskStatusMutation,
  useUpdateSubtaskMutation,
  useGetSubtaskByIdQuery,
} from '../../services/subtaskApi';
import { useGetTaskByIdQuery } from '../../services/taskApi';
import {
  useGetWorkItemLabelsBySubtaskQuery,
  useDeleteWorkItemLabelMutation,
} from '../../services/workItemLabelApi';
import {
  useDeleteSubtaskFileMutation,
  useGetSubtaskFilesBySubtaskIdQuery,
  useUploadSubtaskFileMutation,
} from '../../services/subtaskFileApi';
import deleteIcon from '../../assets/delete.png';
import accountIcon from '../../assets/account.png';
import {
  useGetSubtaskCommentsBySubtaskIdQuery,
  useDeleteSubtaskCommentMutation,
  useUpdateSubtaskCommentMutation,
  useCreateSubtaskCommentMutation,
} from '../../services/subtaskCommentApi';
import { useGetActivityLogsBySubtaskIdQuery } from '../../services/activityLogApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import { WorkLogModal } from './WorkLogModal';
import TaskDependency from './TaskDependency';
import { useCreateLabelAndAssignMutation, useGetLabelsByProjectIdQuery } from '../../services/labelApi';
import { useGetCategoriesByGroupQuery } from '../../services/dynamicCategoryApi';
import { useGetSprintsByProjectIdQuery } from '../../services/sprintApi';
import DeleteConfirmModal from "../WorkItem/DeleteConfirmModal";
import { useGetProjectByIdQuery } from '../../services/projectApi';

interface SubtaskDetail {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedByName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  reporterId: number;
  sprintId: number;
  sprintName: string;
}

const ChildWorkItem: React.FC = () => {
  const { key: subtaskId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [subtaskDetail, setSubtaskDetail] = useState<SubtaskDetail | null>(null);
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
  const [uploadSubtaskFile] = useUploadSubtaskFileMutation();
  const [deleteSubtaskFile] = useDeleteSubtaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [updateSubtaskComment] = useUpdateSubtaskCommentMutation();
  const [deleteSubtaskComment] = useDeleteSubtaskCommentMutation();
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [commentContent, setCommentContent] = React.useState('');
  const [createSubtaskComment] = useCreateSubtaskCommentMutation();
  const [description, setDescription] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [assignedBy, setAssignedBy] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [reporterId, setReporterId] = React.useState('');
  const [sprintName, setSprintName] = React.useState('');
  const [sprinId, setSprintId] = React.useState('');
  const [newTitle, setNewTitle] = useState<string>();
  const [newDescription, setNewDescription] = useState<string>();
  const [newPriority, setNewPriority] = useState<string>();
  const [newStartDate, setNewStartDate] = useState<string>();
  const [newEndDate, setNewEndDate] = useState<string>();
  const [newSprintId, setNewSprintId] = useState<number>();
  const [newReporterId, setNewReporterId] = useState<number>();
  const [newAssignedBy, setNewAssignedBy] = useState<number>();
  const [isWorklogOpen, setIsWorklogOpen] = React.useState(false);
  const [isDependencyOpen, setIsDependencyOpen] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [selectedAssignee, setSelectedAssignee] = useState<number | undefined>(
    subtaskDetail?.assignedBy
  );
  const [selectedReporter, setSelectedReporter] = useState<number | undefined>(
    subtaskDetail?.reporterId
  );
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [deleteWorkItemLabel] = useDeleteWorkItemLabelMutation();
  const { data: taskDetail } = useGetTaskByIdQuery(subtaskDetail?.taskId ?? '', {
    skip: !subtaskDetail?.taskId,
  });
  const { data: subtaskStatus, isLoading: loadSubtaskStatus, isError: subtaskStatusError } = useGetCategoriesByGroupQuery('subtask_status');
  const { data: priorityOptions, isLoading: isPriorityLoading, isError: isPriorityError } = useGetCategoriesByGroupQuery('subtask_priority');
  const projectId = taskDetail?.projectId;
  const { data: projectMembers } = useGetProjectMembersQuery(projectId!, { skip: !projectId });
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<{ [key: number]: string }>({});

  React.useEffect(() => {
    if (subtaskDetail) {
      setDescription(subtaskDetail.description || '');
      setTitle(subtaskDetail.title || '');
      setAssignedBy(String(subtaskDetail.assignedBy) || '');
      setPriority(subtaskDetail.priority || '');
      setStartDate(subtaskDetail.startDate || '');
      setEndDate(subtaskDetail.endDate || '');
      setSprintName(subtaskDetail.sprintName || '');
      setSprintId(String(subtaskDetail.sprintId) || '');
      setReporterId(String(subtaskDetail.reporterId) || '');
    }
  }, [subtaskDetail]);

  const { data: attachments = [], refetch: refetchAttachments } =
    useGetSubtaskFilesBySubtaskIdQuery(subtaskDetail?.id ?? '', {
      skip: !subtaskDetail?.id,
    });

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetSubtaskCommentsBySubtaskIdQuery(subtaskDetail?.id ?? '', {
    skip: !subtaskDetail?.id,
  });

  const isUserAssignee = (subtaskAssigneeId?: number) => {
    const currentUserId = accountId.toString();
    return subtaskAssigneeId?.toString() === currentUserId;
  };

  const {
    data: fetchedSubtask,
    isLoading: isSubtaskLoading,
    refetch: refetchSubtask,
  } = useGetSubtaskByIdQuery(subtaskId ?? '', { skip: !subtaskId });

  useEffect(() => {
    if (subtaskId) {
      refetchSubtask();
    }
  }, [subtaskId, refetchSubtask]);

  useEffect(() => {
    if (fetchedSubtask) {
      setSubtaskDetail(fetchedSubtask);
    }
  }, [fetchedSubtask]);

  const {
    data: activityLogs = [],
    isLoading: isActivityLogsLoading,
    refetch: refetchActivityLogs,
  } = useGetActivityLogsBySubtaskIdQuery(subtaskDetail?.id!, {
    skip: !subtaskDetail?.id!,
  });

  const {
    data: workItemLabels = [],
    isLoading: isLabelLoading,
    refetch: refetchWorkItemLabels,
  } = useGetWorkItemLabelsBySubtaskQuery(subtaskDetail?.id!, { skip: !subtaskDetail?.id! });

  const {
    data: projectLabels = [],
    isLoading: isProjectLabelsLoading,
    refetch: refetchProjectLabels,
  } = useGetLabelsByProjectIdQuery(projectId!, {
    skip: !projectId,
  });

  const { data: projectData,
    isLoading: isProjectDataLoading,
    refetch: refetchProjectData, } = useGetProjectByIdQuery(projectId!, {
      skip: !projectId,
    });

  const { data: projectSprints = [], isLoading: isProjectSprintsLoading,
    refetch: refetchProjectSprints, isError: isProjectSprintsError } = useGetSprintsByProjectIdQuery(projectId!, {
      skip: !projectId,
    });

  const filteredLabels = projectLabels.filter((label) => {
    const notAlreadyAdded = !workItemLabels.some((l) => l.labelName === label.name);

    if (newLabelName.trim() === '') {
      return notAlreadyAdded;
    }

    return label.name.toLowerCase().includes(newLabelName.toLowerCase()) && notAlreadyAdded;
  });

  const [createLabelAndAssign, { isLoading: isCreating }] = useCreateLabelAndAssignMutation();

  const handleCreateLabelAndAssign = async (labelName?: string) => {
    const nameToAssign = labelName?.trim() || newLabelName.trim();

    if (!projectId || !subtaskDetail?.id || !nameToAssign) {
      alert('Missing projectId, taskId or label name!');
      return;
    }

    try {
      await createLabelAndAssign({
        projectId,
        name: nameToAssign,
        taskId: null,
        epicId: null,
        subtaskId: subtaskDetail?.id,
      }).unwrap();

      //alert('✅ Label assigned successfully!');
      setNewLabelName('');
      setIsEditingLabel(false);
      await Promise.all([refetchWorkItemLabels?.(), refetchProjectLabels?.()]);
    } catch (error) {
      console.error('❌ Failed to create and assign label:', error);
      //alert('❌ Failed to assign label');
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

  const toISO = (localDate: string) => {
    const date = new Date(localDate);
    return date.toISOString(); // "2025-07-21T00:00:00.000Z"
  };

  const handleUpdateSubtask = async () => {
    if (!subtaskDetail) return;

    if (
      newTitle === undefined &&
      newDescription === undefined &&
      newPriority === undefined &&
      newSprintId === undefined &&
      newStartDate === undefined &&
      newEndDate === undefined &&
      newReporterId === undefined &&
      newAssignedBy === undefined
    ) {
      return;
    }

    try {
      await updateSubtask({
        id: subtaskDetail.id,
        title: newTitle ?? subtaskDetail.title,
        description: newDescription ?? subtaskDetail.description,
        sprintId: newSprintId ?? subtaskDetail.sprintId,
        priority: newPriority ?? subtaskDetail.priority,
        startDate: newStartDate ? toISO(newStartDate) : subtaskDetail.startDate,
        endDate: newEndDate ? toISO(newEndDate) : subtaskDetail.endDate,
        reporterId: newReporterId ?? subtaskDetail.reporterId,
        assignedBy: newAssignedBy ?? subtaskDetail.assignedBy,
        createdBy: accountId,
      }).unwrap();

      //alert(' Subtask updated');
      console.log('Subtask updated');
      await refetchSubtask();
      await refetchActivityLogs();
    } catch (err) {
      console.error('Failed to update subtask', err);
      //alert('Update failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subtaskDetail) return;

    try {
      await uploadSubtaskFile({
        subtaskId: subtaskDetail.id,
        title: file.name,
        file,
        createdBy: accountId,
      }).unwrap();

      //alert(`Uploaded file "${file.name}" successfully!`);
      console.log('Uploaded file');
      refetchAttachments();
    } catch (error) {
      console.error('Upload failed:', error);
      //alert('Upload failed!');
    } finally {
      setIsAddDropdownOpen(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ id: number; createdBy: number } | null>(null);

  const openDeleteModal = (id: number, createdBy: number) => {
    setDeleteInfo({ id, createdBy });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!deleteInfo) return;
    try {
      await deleteSubtaskFile({ id: deleteInfo.id, createdBy: accountId }).unwrap();

      // alert("Delete file successfully!");
      console.log('Deleted file');
      await refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error(" Error delete file:", error);
      //alert(" Delete file failed");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteInfo(null);
    }
  };

  // const handleDeleteFile = async (id: number, createdBy: number) => {
  //   if (!window.confirm('Are you sure you want to delete this file?')) return;
  //   try {
  //     await deleteSubtaskFile({ id, createdBy: accountId }).unwrap();
  //     alert('✅ File deleted!');
  //     await refetchAttachments();
  //     await refetchActivityLogs();
  //   } catch (error) {
  //     console.error('Delete failed:', error);
  //     alert('Delete failed!');
  //   }
  // };

  const handleSave = async (id: number, originalContent: string) => {
    const newContent = editedContent[id];
    if (newContent && newContent !== originalContent) {
      try {
        await updateSubtaskComment({
          id,
          subtaskId: subtaskDetail?.id!,
          accountId,
          content: newContent,
          createdBy: accountId,
        }).unwrap();
        await Promise.all([refetchComments(), refetchActivityLogs()]);
        setEditCommentId(null);
      } catch (err) {
        console.error('❌ Failed to update comment', err);
      }
    } else {
      setEditCommentId(null);
    }
  };

  // Trong render comment
  {
    comments.map((comment) => (
      <div key={comment.id}>
        {editCommentId === comment.id ? (
          <>
            <textarea
              value={editedContent[comment.id] || comment.content}
              onChange={(e) => setEditedContent({ ...editedContent, [comment.id]: e.target.value })}
            />
            <button onClick={() => handleSave(comment.id, comment.content)}>Save</button>
            <button onClick={() => setEditCommentId(null)}>Cancel</button>
          </>
        ) : (
          <>
            <span>{comment.content}</span>
            <button onClick={() => setEditCommentId(comment.id)}>✏ Edit</button>
          </>
        )}
      </div>
    ))
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!subtaskDetail) return;

    try {
      await updateSubtaskStatus({
        id: subtaskDetail.id,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();

      setSubtaskDetail({ ...subtaskDetail, status: newStatus });
      console.log(`Updated subtask ${subtaskDetail.id} to ${newStatus}`);
      await refetchSubtask();
    } catch (err) {
      console.error('Failed to update subtask status', err);
    }
  };

  const { data: parentTask } = useGetTaskByIdQuery(subtaskDetail?.taskId || '', {
    skip: !subtaskDetail?.taskId,
  });

  if (!subtaskDetail) return <div style={{ padding: '24px' }}>Loading subtask data...</div>;

  return (
    <div className='child-work-item-page'>
      <div className='child-work-item-container'>
        <div className='child-header'>
          <div className='breadcrumb'>
            Projects / <span>{parentTask?.projectName || '...'}</span> /{' '}
            <span>{subtaskDetail.taskId}</span> /{' '}
            <span className='child-key'>{subtaskDetail.id}</span>
          </div>
        </div>

        <input
          className='subtask-input'
          placeholder="Enter subtask title"
          defaultValue={subtaskDetail?.title}
          onChange={(e) => {
            if (e.target.value.length <= 65) {
              setNewTitle(e.target.value);
            } else {
              alert('Max 65 characters!');
            }
          }}
          onBlur={handleUpdateSubtask}
          style={{
            width: '500px',
            fontWeight: 'bold',
          }}
        />

        <div className='child-content'>
          <div className='child-main'>
            <div className='child-header-row'>
              <div className='add-menu-wrapper'>
                <button
                  className='btn-add'
                  onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                >
                  + Add
                </button>
                {isAddDropdownOpen && (
                  <div className='add-dropdown'>
                    <div className='add-item' onClick={() => fileInputRef.current?.click()}>
                      📎 Attachment
                    </div>
                  </div>
                )}
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className='field-group'>
              <label>Description</label>
              <textarea
                className='subtask-description'
                placeholder='Enter subtask description'
                defaultValue={subtaskDetail?.description}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleUpdateSubtask}
              />
            </div>

            {attachments.length > 0 && (
              <div className="attachments-section">
                <label className="block font-semibold mb-2">
                  Attachments <span>({attachments.length})</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  {attachments.map((file) => (
                    <div
                      className="relative flex-shrink-0 w-36 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                      key={file.id}
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <a
                        href={file.urlFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-gray-800 no-underline"
                      >
                        <div className="h-24 flex items-center justify-center bg-gray-100 rounded-t-lg overflow-hidden">
                          {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={file.urlFile}
                              alt={file.title}
                              className="w-[100%] h-[100%] object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gray-200">
                              <span className="text-xs font-medium text-gray-600 px-2 text-center">
                                {file.title.slice(0, 15)}...
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-1">
                          <div
                            className="truncate text-sm font-medium"
                            title={file.title}
                          >
                            {file.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                          </div>
                        </div>
                      </a>

                      {hoveredFileId === file.id && (
                        <button
                          onClick={() => openDeleteModal(file.id, file.createdBy)}
                          className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-200"
                          title="Delete file"
                        >
                          <img
                            src={deleteIcon}
                            alt="Delete"
                            className="w-5 h-5"
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='activity-section'>
              <h4 style={{ marginBottom: '8px' }}>Activity</h4>

              {/* Tabs */}
              <div className='activity-tabs'>
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
                <div className='history-list'>
                  {isActivityLogsLoading ? (
                    <div>Loading...</div>
                  ) : activityLogs.length === 0 ? (
                    <div>No history available.</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className='history-item'>
                        <div className='history-header'>
                          <span className='history-user'>{log.createdByName}</span>
                          <span className='history-time'>
                            {new Date(log.createdAt).toLocaleTimeString()}{' '}
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='history-message'>{log.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'COMMENTS' ? (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="simple-comment">
                      <div className="avatar-circle">
                        <img src={comment.accountPicture || accountIcon} alt="avatar" />
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <strong>{comment.accountName || `User #${comment.accountId}`}</strong>
                          <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {editCommentId === comment.id ? (
                          <>
                            <textarea
                              value={editedContent[comment.id] || comment.content}
                              onChange={(e) =>
                                setEditedContent({ ...editedContent, [comment.id]: e.target.value })
                              }
                              className="border rounded p-2 w-full"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSave(comment.id, comment.content)}
                                className="px-1 py-0.5 bg-blue-500 text-xs text-white rounded hover:bg-blue-600 h-6"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditCommentId(null)}
                                className="px-1 py-0.5 bg-gray-300 text-xs text-gray-700 rounded hover:bg-gray-400 h-6"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="comment-text">{comment.content}</div>
                            {comment.accountId === accountId && (
                              <div className="comment-actions">
                                <button
                                  className="edit-btn"
                                  onClick={() => setEditCommentId(comment.id)}
                                >
                                  ✏ Edit
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={async () => {
                                    const confirmed = await Swal.fire({
                                      title: 'Delete Comment',
                                      text: 'Are you sure you want to delete this comment?',
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonText: 'Delete',
                                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                      customClass: {
                                        title: 'small-title',
                                        popup: 'small-popup',
                                        icon: 'small-icon',
                                        htmlContainer: 'small-html'
                                      }
                                    });
                                    if (confirmed.isConfirmed) {
                                      try {
                                        console.log('Deleting comment:', comment.id, 'for subtask:', subtaskDetail.id);
                                        await deleteSubtaskComment({
                                          id: comment.id,
                                          subtaskId: subtaskDetail.id!,
                                          createdBy: accountId,
                                        }).unwrap();
                                        await refetchActivityLogs();
                                      } catch (err) {
                                        console.error('❌ Failed to delete comment:', err);
                                        Swal.fire({
                                          icon: 'error',
                                          title: 'Delete Failed',
                                          text: 'Failed to delete comment.',
                                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                          customClass: {
                                            title: 'small-title',
                                            popup: 'small-popup',
                                            icon: 'small-icon',
                                            htmlContainer: 'small-html'
                                          }
                                        });
                                      }
                                    }
                                  }}
                                >
                                  🗑 Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Comment Input */}
                  <div className='simple-comment-input'>
                    <textarea
                      placeholder='Add a comment...'
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
                          await createSubtaskComment({
                            subtaskId: subtaskDetail.id,
                            accountId,
                            content: commentContent.trim(),
                            createdBy: accountId,
                          }).unwrap();
                          //alert('✅ Comment posted');
                          console.log('Comment posted')
                          setCommentContent('');
                          await refetchComments();
                          await refetchActivityLogs();
                        } catch (err: any) {
                          console.error('❌ Failed to post comment:', err);
                          //alert('❌ Failed to post comment: ' + JSON.stringify(err?.data || err));
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </>
              ) : (
                <div className='activity-placeholder'></div>
              )}
            </div>
          </div>

          <div className='details-panel'>
            <div className='panel-header'>
              {isUserAssignee(subtaskDetail.assignedBy) || canEdit ? (
                <select
                  value={subtaskDetail.status}
                  className={`status-dropdown-select status-${subtaskDetail.status
                    .toLowerCase()
                    .replace('_', '-')}`}
                  onChange={handleStatusChange}
                >
                  {loadSubtaskStatus ? (
                    <option>Loading...</option>
                  ) : subtaskStatusError ? (
                    <option>Error loading status</option>
                  ) : (
                    subtaskStatus?.data.map((status) => (
                      <option key={status.id} value={status.name}>
                        {status.label}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <span
                  className={`status-dropdown-select status-${subtaskDetail.status
                    .toLowerCase()
                    .replace('_', '-')}`}
                >
                  {subtaskDetail.status.replace('_', ' ')}
                </span>
              )}
              {fetchedSubtask?.warnings && fetchedSubtask.warnings.length > 0 && (
                <div className='warning-box'>
                  {fetchedSubtask.warnings.map((warning, idx) => (
                    <div key={idx} className='warning-text'>
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='details-content'>
              <h4>Details</h4>
              <div className='detail-item'>
                <label>Assignee</label>

                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <select
                    value={selectedAssignee ?? subtaskDetail?.assignedBy}
                    onChange={async (e) => {
                      const newAssignee = parseInt(e.target.value);
                      setSelectedAssignee(newAssignee);

                      try {
                        await updateSubtask({
                          id: subtaskDetail.id,
                          assignedBy: newAssignee,
                          title: subtaskDetail.title,
                          sprintId: subtaskDetail.sprintId ?? null,
                          description: subtaskDetail.description ?? '',
                          priority: subtaskDetail.priority,
                          startDate: subtaskDetail.startDate,
                          endDate: subtaskDetail.endDate,
                          reporterId: subtaskDetail.reporterId,
                          createdBy: accountId,
                        }).unwrap();

                        await refetchSubtask();
                        await refetchActivityLogs();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    style={{ minWidth: '150px' }}
                  >
                    <option value='0'>Unassigned</option>
                    {projectMembers?.map((m) => (
                      <option key={m.accountId} value={m.accountId}>
                        {m.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers?.find(m => m.accountId === (selectedAssignee ?? subtaskDetail?.assignedBy))?.accountName
                      || 'Unassigned'}
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

              <div className='detail-item'>
                <label>Parent</label>
                {subtaskDetail.taskId ? (
                  <Link
                    to={`/project/${projectKey}/work-item-detail?taskId=${subtaskDetail.taskId}`}
                    className="text no-underline hover:underline cursor-pointer"
                  >
                    Task [{subtaskDetail.taskId}]
                  </Link>
                ) : (
                  <span>Task [None]</span>
                )}
              </div>

              {/* <div className='detail-item'>
                <label>Parent</label>
                  <span>Task [{subtaskDetail.taskId ?? 'None'}]</span>
              </div> */}

              <div className='detail-item'>
                <label>Sprint</label>

                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <select
                    style={{ width: '150px' }}
                    value={newSprintId ?? subtaskDetail?.sprintId}
                    onChange={(e) => setNewSprintId(parseInt(e.target.value, 10))}
                    onBlur={handleUpdateSubtask}
                  >
                    {isProjectSprintsLoading ? (
                      <option>Loading...</option>
                    ) : isProjectSprintsError ? (
                      <option>Error loading Sprint</option>
                    ) : (
                      <>
                        <option value={0}>No Sprint</option>
                        {projectSprints?.map((sprint) => (
                          <option key={sprint.id} value={sprint.id}>
                            {sprint.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                ) : (
                  <span>
                    {isProjectSprintsLoading
                      ? 'Loading...'
                      : isProjectSprintsError
                        ? 'Error loading Sprint'
                        : projectSprints?.find(s => s.id === (newSprintId ?? subtaskDetail?.sprintId))?.name || 'No Sprint'
                    }
                  </span>
                )}
              </div>


              <div className='detail-item'>
                <label>Priority</label>

                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <select
                    style={{ width: '150px' }}
                    value={newPriority ?? subtaskDetail?.priority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    onBlur={handleUpdateSubtask}
                  >
                    {isPriorityLoading ? (
                      <option>Loading...</option>
                    ) : isPriorityError ? (
                      <option>Error loading priorities</option>
                    ) : (
                      priorityOptions?.data.map((priority) => (
                        <option key={priority.id} value={priority.name}>
                          {priority.label}
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <span>
                    {isPriorityLoading
                      ? 'Loading...'
                      : isPriorityError
                        ? 'Error loading priorities'
                        : priorityOptions?.data.find(p => p.name === (newPriority ?? subtaskDetail?.priority))?.label || 'NONE'
                    }
                  </span>
                )}
              </div>

              <div className='detail-item'>
                <label>Start Date</label>
                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <input
                    type='date'
                    value={newStartDate ?? subtaskDetail?.startDate?.slice(0, 10) ?? ''}
                    min={projectData?.data?.startDate?.slice(0, 10)}
                    max={newEndDate ? newEndDate.slice(0, 10) : projectData?.data?.endDate?.slice(0, 10)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (newEndDate && new Date(value) >= new Date(newEndDate)) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Start Date',
                          html: 'Start Date must be smaller than Due Date!',
                          width: '500px',
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html'
                          }
                        });
                        return;
                      }

                      if (projectData?.data.startDate && projectData?.data.endDate) {
                        const projectStart = new Date(projectData.data.startDate);
                        const projectEnd = new Date(projectData.data.endDate);
                        if (new Date(value) < projectStart || new Date(value) > projectEnd) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Invalid Start Date',
                            html: `Due Date must be between project <strong>${projectData.data.name}</strong> 
                                           is <b>${projectData.data.startDate.slice(0, 10)}</b> and 
                                           <b>${projectData.data.endDate.slice(0, 10)}</b>!`,
                            width: '500px',
                            confirmButtonColor: 'rgba(44, 104, 194, 1)',
                            customClass: {
                              title: 'small-title',
                              popup: 'small-popup',
                              icon: 'small-icon',
                              htmlContainer: 'small-html'
                            }
                          });
                          return;
                        }
                      }

                      setNewStartDate(value);
                    }}
                    onBlur={handleUpdateSubtask}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{subtaskDetail?.startDate?.slice(0, 10) || 'None'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Due Date</label>
                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <input
                    type='date'
                    value={newEndDate ?? subtaskDetail?.endDate?.slice(0, 10) ?? ''}
                    min={projectData?.data?.startDate?.slice(0, 10)}
                    max={newStartDate ? newStartDate.slice(0, 10) : projectData?.data?.endDate?.slice(0, 10)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (newStartDate && new Date(value) <= new Date(newStartDate)) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Due Date',
                          html: 'Due Date must be greater than Start Date!',
                          width: '500px', // nhỏ lại
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html'
                          }
                        });
                        return;
                      }

                      if (projectData?.data.startDate && projectData?.data.endDate) {
                        const projectStart = new Date(projectData.data.startDate);
                        const projectEnd = new Date(projectData.data.endDate);
                        if (new Date(value) < projectStart || new Date(value) > projectEnd) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Invalid Due Date',
                            html: `Due Date must be between project <strong>${projectData.data.name}</strong> 
                                           is <b>${projectData.data.startDate.slice(0, 10)}</b> and 
                                           <b>${projectData.data.endDate.slice(0, 10)}</b>!`,
                            width: '500px', // nhỏ lại
                            confirmButtonColor: 'rgba(44, 104, 194, 1)',
                            customClass: {
                              title: 'small-title',
                              popup: 'small-popup',
                              icon: 'small-icon',
                              htmlContainer: 'small-html'
                            }
                          });
                          return;
                        }
                      }

                      setNewEndDate(value);
                    }}
                    onBlur={handleUpdateSubtask}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{subtaskDetail?.endDate?.slice(0, 10) || 'None'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Reporter</label>

                {(isUserAssignee(subtaskDetail.assignedBy) || canEdit) ? (
                  <select
                    value={selectedReporter ?? subtaskDetail?.reporterId}
                    onChange={async (e) => {
                      const newReporter = parseInt(e.target.value);
                      setSelectedReporter(newReporter);

                      try {
                        await updateSubtask({
                          id: subtaskDetail.id,
                          assignedBy: subtaskDetail.assignedBy,
                          title: subtaskDetail.title,
                          sprintId: subtaskDetail.sprintId ?? null,
                          description: subtaskDetail.description ?? '',
                          priority: subtaskDetail.priority,
                          startDate: subtaskDetail.startDate,
                          endDate: subtaskDetail.endDate,
                          reporterId: newReporter,
                          createdBy: accountId,
                        }).unwrap();

                        await refetchSubtask();
                        await refetchActivityLogs();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    style={{ minWidth: '150px' }}
                  >
                    <option value='0'>Unassigned</option>
                    {projectMembers?.map((m) => (
                      <option key={m.accountId} value={m.accountId}>
                        {m.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers?.find(m => m.accountId === (selectedReporter ?? subtaskDetail?.reporterId))?.accountName
                      || 'Unassigned'}
                  </span>
                )}
              </div>

              <div className='detail-item'>
                <label>Time Tracking</label>
                <span
                  onClick={() => setIsWorklogOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Log Work
                </span>
              </div>

              <WorkLogModal
                open={isWorklogOpen}
                onClose={() => setIsWorklogOpen(false)}
                workItemId={subtaskDetail.id}
                type='subtask'
                onRefetchActivityLogs={refetchActivityLogs}
              />
              <div className='detail-item'>
                <label>Connections</label>
                <span
                  onClick={() => setIsDependencyOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Manage Dependencies
                </span>
              </div>
              <TaskDependency
                open={isDependencyOpen}
                onClose={() => setIsDependencyOpen(false)}
                workItemId={subtaskDetail.id}
                type='subtask'
              />
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteFile}
        title="Delete this attachment?"
        message="Once you delete, it's gone for good."
      />
    </div>
  );
};

export default ChildWorkItem;
