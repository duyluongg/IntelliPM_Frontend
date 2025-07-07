import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChildWorkItem.css';
import { useUpdateSubtaskStatusMutation } from '../../services/subtaskApi';
import { useGetTaskByIdQuery } from '../../services/taskApi';
import { useGetWorkItemLabelsBySubtaskQuery } from '../../services/workItemLabelApi';

interface SubtaskDetail {
  id: string;
  taskId: string;
  assignedBy: number;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`📁 File "${file.name}" đã được upload (mock).`);
    }
    setIsAddDropdownOpen(false);
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

            <div className="activity-section">
              <h4>Activity</h4>
              <div className="activity-tabs">
                <button className="tab active">All</button>
                <button className="tab">Comments</button>
                <button className="tab">History</button>
                <button className="tab">Work log</button>
              </div>
              <div className="comment-box">
                <textarea placeholder="Add a comment..." />
                <div className="quick-comments">
                  <button>Can I get more info...?</button>
                  <button>Status update...</button>
                  <button>Thanks...</button>
                </div>
                <p className="pro-tip">Pro tip: press <strong>M</strong> to comment</p>
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
              <div className="detail-item"><label>Assignee</label><span>User ID: {subtaskDetail.assignedBy}</span></div>
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
