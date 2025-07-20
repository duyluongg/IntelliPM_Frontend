import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChildWorkItemPopup.css';
import { useUpdateSubtaskStatusMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery } from '../../services/taskApi';
import { useGetWorkItemLabelsBySubtaskQuery } from '../../services/workItemLabelApi';
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
import { WorkLogModal } from './WorkLogModal';

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
  reporterName: string;
}

interface ChildWorkItemPopupProps {
  item: {
    key: string;
    summary: string;
    assignee: string;
    parent: string;
    status: string;
  };
  taskId: string;
  onClose: () => void;
}

const ChildWorkItemPopup: React.FC<ChildWorkItemPopupProps> = ({ item, onClose }) => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [subtaskDetail, setSubtaskDetail] = useState<SubtaskDetail | null>(null);
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [uploadSubtaskFile] = useUploadSubtaskFileMutation();
  const [deleteSubtaskFile] = useDeleteSubtaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [updateSubtaskComment] = useUpdateSubtaskCommentMutation();
  const [deleteSubtaskComment] = useDeleteSubtaskCommentMutation();
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [commentContent, setCommentContent] = React.useState('');
  const [createSubtaskComment] = useCreateSubtaskCommentMutation();
  const [isWorklogOpen, setIsWorklogOpen] = useState(false);

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

  useEffect(() => {
    const fetchSubtask = async () => {
      try {
        const res = await fetch(`https://localhost:7128/api/subtask/${item.key}`);
        const json = await res.json();
        if (json.isSuccess && json.data) {
          setSubtaskDetail(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch subtask', err);
      }
    };

    fetchSubtask();
  }, [item.key]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subtaskDetail) return;

    try {
      await uploadSubtaskFile({
        subtaskId: subtaskDetail.id,
        title: file.name,
        file,
      }).unwrap();

      alert(`✅ Uploaded file "${file.name}" successfully!`);
      refetchAttachments();
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('❌ Upload failed!');
    } finally {
      setIsAddDropdownOpen(false);
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteSubtaskFile(id).unwrap();
      alert('✅ File deleted!');
      refetchAttachments();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('❌ Delete failed!');
    }
  };

  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return 'None';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!subtaskDetail) return;

    try {
      await updateSubtaskStatus({ id: subtaskDetail.id, status: newStatus }).unwrap();
      setSubtaskDetail({ ...subtaskDetail, status: newStatus }); // cập nhật UI ngay
      console.log(`✅ Updated subtask ${subtaskDetail.id} to ${newStatus}`);
    } catch (err) {
      console.error('❌ Failed to update subtask status', err);
    }
  };

  const { data: parentTask } = useGetTaskByIdQuery(subtaskDetail?.taskId || '', {
    skip: !subtaskDetail?.taskId,
  });

  const { data: subtaskLabels = [] } = useGetWorkItemLabelsBySubtaskQuery(item.key, {
    skip: !item.key,
  });

  if (!subtaskDetail)
    return (
      <div className='modal-overlay'>
        <div className='child-work-item-popup-container'>Loading...</div>
      </div>
    );

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='child-work-item-popup-container' onClick={(e) => e.stopPropagation()}>
        <div className='child-popup-header'>
          <div className='breadcrumb'>
            Projects / <span>{parentTask?.projectName || '...'}</span> /{' '}
            <span>{subtaskDetail.taskId}</span> /{' '}
            <span
              className='child-popup-key'
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate(`/project/child-work/${subtaskDetail.id}`)}
            >
              {subtaskDetail.id}
            </span>
          </div>
          <button className='btn-close' onClick={onClose}>
            ✖
          </button>
        </div>

        <div className='child-popup-content'>
          <div className='child-popup-main'>
            <div className='child-popup-header-row'>
              <h2 className='child-popup-title'>{subtaskDetail.title}</h2>
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
                defaultValue={subtaskDetail.description}
                placeholder='Add a description...'
              />
            </div>
            {attachments.length > 0 && (
              <div className='attachments-section'>
                <label>
                  Attachments <span>({attachments.length})</span>
                </label>
                <div className='attachments-grid'>
                  {attachments.map((file) => (
                    <div
                      className='attachment-card'
                      key={file.id}
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <a
                        href={file.urlFile}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className='thumbnail'>
                          {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={file.urlFile} alt={file.title} />
                          ) : (
                            <div className='doc-thumbnail'>
                              <span className='doc-text'>
                                {file.title.length > 15
                                  ? file.title.slice(0, 15) + '...'
                                  : file.title}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className='file-meta'>
                          <div className='file-name' title={file.title}>
                            {file.title}
                          </div>
                          <div className='file-date'>
                            {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                          </div>
                        </div>
                      </a>

                      {hoveredFileId === file.id && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className='delete-file-btn'
                          title='Delete file'
                        >
                          <img
                            src={deleteIcon}
                            alt='Delete'
                            style={{ width: '25px', height: '25px' }}
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
              {activeTab === 'COMMENTS' ? (
                <>
                  <div className='comment-list'>
                    {isCommentsLoading ? (
                      <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
                    ) : (
                      comments
                        .slice()
                        .reverse()
                        .map((comment) => (
                          <div key={comment.id} className="simple-comment">
                            <div className="avatar-circle">
                              <img src={comment.accountPicture || accountIcon} alt="avatar" />
                            </div>
                            <div className='comment-content'>
                              <div className='comment-header'>
                                <strong>
                                  {comment.accountName || `User #${comment.accountId}`}
                                </strong>{' '}
                                <span className='comment-time'>
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div className='comment-text'>{comment.content}</div>
                              {comment.accountId === accountId && (
                                <div className='comment-actions'>
                                  <button
                                    className='edit-btn'
                                    onClick={async () => {
                                      const newContent = prompt(
                                        '✏ Edit your comment:',
                                        comment.content
                                      );
                                      if (newContent && newContent !== comment.content) {
                                        try {
                                          await updateSubtaskComment({
                                            id: comment.id,
                                            subtaskId: subtaskDetail.id,
                                            accountId,
                                            content: newContent,
                                          }).unwrap();
                                          alert('✅ Comment updated');
                                          await refetchComments();
                                        } catch (err) {
                                          console.error('❌ Failed to update comment', err);
                                          alert('❌ Update failed');
                                        }
                                      }
                                    }}
                                  >
                                    ✏ Edit
                                  </button>
                                  <button
                                    className='delete-btn'
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          '🗑️ Are you sure you want to delete this comment?'
                                        )
                                      ) {
                                        try {
                                          await deleteSubtaskComment(comment.id).unwrap();
                                          alert('🗑️ Deleted successfully');
                                          await refetchComments();
                                        } catch (err) {
                                          console.error('❌ Failed to delete comment', err);
                                          alert('❌ Delete failed');
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
                          }).unwrap();
                          alert('✅ Comment posted');
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
                <div className='activity-placeholder'>Chưa có nhật ký hoạt động.</div>
              )}
            </div>
          </div>

          <div className='details-panel'>
            <div className='panel-header'>
              <select
                value={subtaskDetail.status}
                className={`status-dropdown-select status-${subtaskDetail.status
                  .toLowerCase()
                  .replace('_', '-')}`}
                onChange={handleStatusChange}
              >
                <option value='TO_DO'>To Do</option>
                <option value='IN_PROGRESS'>In Progress</option>
                <option value='DONE'>Done</option>
              </select>
            </div>

            <div className='details-content'>
              <h4>Details</h4>
              <div className='detail-item'>
                <label>Assignee</label>
                <span>{subtaskDetail.assignedByName}</span>
              </div>
              <div className='detail-item'>
                <label>Labels</label>
                <span>
                  {subtaskLabels.length === 0
                    ? 'None'
                    : subtaskLabels.map((label) => label.labelName).join(', ')}
                </span>
              </div>
              <div className='detail-item'>
                <label>Parent</label>
                <span>{subtaskDetail.taskId}</span>
              </div>
              <div className='detail-item'>
                <label>Due date</label>
                <span>{formatDate(subtaskDetail.endDate)}</span>
              </div>
              <div className='detail-item'>
                <label>Start date</label>
                <span>{formatDate(subtaskDetail.startDate)}</span>
              </div>
              <div className='detail-item'>
                <label>Reporter</label>
                <span>{subtaskDetail.assignedByName}</span>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWorkItemPopup;
