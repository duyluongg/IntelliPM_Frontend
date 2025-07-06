import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChildWorkItemPopup.css';
import { useUpdateSubtaskStatusMutation } from '../../services/subtaskApi';

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


  if (!subtaskDetail)
    return (
      <div className="modal-overlay">
        <div className="child-work-item-popup-container">Loading...</div>
      </div>
    );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="child-work-item-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="child-popup-header">
          <div className="breadcrumb">
            Projects / OnlineFlowerShop / <span>{subtaskDetail.taskId}</span> /{' '}
            <span
              className="child-popup-key"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate(`/project/child-work/${subtaskDetail.id}`)}
            >
              {subtaskDetail.id}
            </span>
          </div>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        <div className="child-popup-content">
          <div className="child-popup-main">
            <div className="child-popup-header-row">
              <h2 className="child-popup-title">{subtaskDetail.title}</h2>
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
              <textarea defaultValue={subtaskDetail.description} placeholder="Add a description..." />
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
              <div className="detail-item"><label>Labels</label><span>None</span></div>
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

export default ChildWorkItemPopup;
