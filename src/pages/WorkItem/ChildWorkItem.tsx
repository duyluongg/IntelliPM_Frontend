import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChildWorkItem.css';
import { useUpdateSubtaskStatusMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery } from '../../services/taskApi';
import { useGetWorkItemLabelsBySubtaskQuery } from '../../services/workItemLabelApi';
import { useDeleteSubtaskFileMutation, useGetSubtaskFilesBySubtaskIdQuery, useUploadSubtaskFileMutation } from '../../services/subtaskFileApi';
import deleteIcon from '../../assets/delete.png';

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
}

const ChildWorkItem: React.FC = () => {
  const { key: subtaskId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [subtaskDetail, setSubtaskDetail] = useState<SubtaskDetail | null>(null);
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();
  const [uploadSubtaskFile] = useUploadSubtaskFileMutation();
  const [deleteSubtaskFile] = useDeleteSubtaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
  const { data: attachments = [], refetch: refetchAttachments } = useGetSubtaskFilesBySubtaskIdQuery(subtaskDetail?.id ?? '', {
    skip: !subtaskDetail?.id,
  });

  useEffect(() => {
    const fetchSubtask = async () => {
      try {
        const res = await fetch(`https://localhost:7128/api/subtask/${subtaskId}`);
        const json = await res.json();
        if (json.isSuccess && json.data) {
          setSubtaskDetail(json.data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (subtaskId) {
      fetchSubtask();
    }
  }, [subtaskId]);

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

  const { data: subtaskLabels = [] } = useGetWorkItemLabelsBySubtaskQuery(subtaskId ?? '', {
    skip: !subtaskId,
  });

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!subtaskDetail) return;

    try {
      await updateSubtaskStatus({ id: subtaskDetail.id, status: newStatus }).unwrap();
      setSubtaskDetail({ ...subtaskDetail, status: newStatus });
      console.log(`✅ Updated ${subtaskDetail.id} to ${newStatus}`);
    } catch (err) {
      console.error('❌ Error update subtask status:', err);
    }
  };

  const { data: parentTask } = useGetTaskByIdQuery(subtaskDetail?.taskId || '', {
    skip: !subtaskDetail?.taskId,
  });

  if (!subtaskDetail) return <div style={{ padding: '24px' }}>Đang tải dữ liệu subtask...</div>;

  return (
    <div className="child-work-item-page">
      <div className="child-work-item-container">
        <div className="child-header">
          <div className="breadcrumb">
            Projects / <span>{parentTask?.projectName || '...'}</span> / <span>{subtaskDetail.taskId}</span> / <span className="child-key">{subtaskDetail.id}</span>
          </div>
        </div>

        <div className="child-content">
          <div className="child-main">
            <div className="child-header-row">
              <h2 className="child-title">{subtaskDetail.title}</h2>
              <div className="add-menu-wrapper">
                <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>+ Add</button>
                {isAddDropdownOpen && (
                  <div className="add-dropdown">
                    <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                      📎 Attachment
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>
            </div>

            <div className="field-group">
              <label>Description</label>
              <textarea placeholder="Add a description..." defaultValue={subtaskDetail.description} />
            </div>

            {attachments.length > 0 && (
              <div className="attachments-section">
                <label>
                  Attachments <span>({attachments.length})</span>
                </label>
                <div className="attachments-grid">
                  {attachments.map((file) => (
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
                              <span className="doc-text">
                                {file.title.length > 15 ? file.title.slice(0, 15) + '...' : file.title}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="file-meta">
                          <div className="file-name" title={file.title}>
                            {file.title}
                          </div>
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

            <div className="activity-section">
              <h4>Activity</h4>
              <div className="activity-tabs">
                <button className="tab">Comments</button>
                <button className="tab">History</button>
              </div>
              <div className="comment-box">
                <textarea placeholder="Add a comment..." />
              </div>
            </div>
          </div>

          <div className="details-panel">
            <div className="panel-header">
              <select
                value={subtaskDetail.status}
                className={`status-dropdown-select status-${subtaskDetail.status.toLowerCase().replace('_', '-')}`}
                onChange={handleStatusChange}
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="details-content">
              <h4>Details</h4>
              <div className="detail-item"><label>Assignee</label><span>{subtaskDetail.assignedByName}</span></div>
              <div className="detail-item">
                <label>Labels</label>
                <span>
                  {subtaskLabels.length === 0
                    ? 'None'
                    : subtaskLabels.map((label) => label.labelName).join(', ')}
                </span>
              </div>
              <div className="detail-item"><label>Parent</label><span>{subtaskDetail.taskId}</span></div>
              <div className="detail-item"><label>Due date</label><span>{formatDate(subtaskDetail.endDate)}</span></div>
              <div className="detail-item"><label>Start date</label><span>{formatDate(subtaskDetail.startDate)}</span></div>
              <div className="detail-item"><label>Reporter</label><span>{subtaskDetail.reporterId}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWorkItem;
