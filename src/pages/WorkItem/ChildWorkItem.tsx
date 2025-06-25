import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChildWorkItem.css';

const mockChildItems = [
  {
    key: 'SAS-15',
    summary: 'hello',
    status: 'DONE',
    assignee: 'Ngo Pham Thao Vy (K16_HCM)',
    parent: 'SAS-1 Đạt thúi',
  },
  {
    key: 'SAS-17',
    summary: 'ok',
    status: 'TO DO',
    assignee: 'Unassigned',
    parent: 'SAS-1',
  },
];

const ChildWorkItem: React.FC = () => {
  const { key } = useParams();
  const navigate = useNavigate();

  const item = mockChildItems.find((i) => i.key === key);

  if (!item) {
    return (
      <div style={{ padding: '24px' }}>
        <h2>Không tìm thấy Work Item</h2>
        <button onClick={() => navigate('/work-item')}>Quay lại danh sách</button>
      </div>
    );
  }

  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`📁 File "${file.name}" đã được upload (mock).`);
      // TODO: Xử lý upload thật sau
    }
    setIsAddDropdownOpen(false);
  };


  return (
    <div className="child-work-item-container">
      <div className="child-header">
        <div className="breadcrumb">
          Projects / SEP_Agile_Scrum / <span>{item.parent}</span> / <span className="child-key">{item.key}</span>
          <div className="child-header-row">
            <h2 className="child-title">hello</h2>
            <div className="add-menu-wrapper">
              <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>+ Add</button>
              {isAddDropdownOpen && (
                <div className="add-dropdown">
                  <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                    📎 Attachment
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
          </div>
        </div>
      </div>

      <div className="child-content">
        <div className="child-main">
          <div className="field-group">
            <label>Description</label>
            <textarea placeholder="Add a description..." />
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

        <div className="child-sidebar">
          <div className="status-section">
            <select defaultValue={item.status} className={`status-dropdown ${item.status.toLowerCase()}`}>
              <option value="TO DO">To Do</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <button className="btn-improve">⚡ Improve Subtask</button>
          </div>

          <div className="details-panel">
            <h4>Details</h4>
            <div className="detail-item"><label>Assignee</label><span>{item.assignee}</span></div>
            <div className="detail-item"><label>Labels</label><span>None</span></div>
            <div className="detail-item"><label>Parent</label><span>{item.parent}</span></div>
            <div className="detail-item"><label>Due date</label><span>None</span></div>
            <div className="detail-item"><label>Start date</label><span>None</span></div>
            <div className="detail-item"><label>Fix versions</label><span>None</span></div>
            <div className="detail-item"><label>Story point estimate</label><span>None</span></div>
            <div className="detail-item">
              <label>Development</label>
              <button className="dev-btn">Open with VS Code</button>
              <button className="dev-btn">Create branch</button>
              <button className="dev-btn">Create commit</button>
            </div>
            <div className="detail-item"><label>Reporter</label><span>Ngo Pham Thao Vy (K16_HCM)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWorkItem;
