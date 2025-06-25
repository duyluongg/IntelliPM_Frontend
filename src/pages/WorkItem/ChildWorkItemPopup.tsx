import React, { useRef, useState } from 'react';
import './ChildWorkItemPopup.css';

interface ChildWorkItemPopupProps {
  item: {
    key: string;
    summary: string;
    assignee: string;
    parent: string;
    status: string;
  };
  onClose: () => void;
}

const ChildWorkItemPopup: React.FC<ChildWorkItemPopupProps> = ({ item, onClose }) => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`📁 File "${file.name}" đã được upload (mock).`);
    }
    setIsAddDropdownOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="child-work-item-container" onClick={(e) => e.stopPropagation()}>
        <div className="child-header">
          <div className="breadcrumb">
            Projects / SEP_Agile_Scrum / <span>{item.parent}</span> / <span className="child-key">{item.key}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        <div className="child-content">
          {/* Left column */}
          <div className="child-main">
            <div className="child-header-row">
              <h2 className="child-title">{item.summary}</h2>
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

          {/* Right column */}
          <div className="child-sidebar">
            <div className="status-section">
              <select defaultValue={item.status} className={`status-dropdown ${item.status.toLowerCase().replace(' ', '\\ ')}`}>
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
    </div>
  );
};

export default ChildWorkItemPopup;
