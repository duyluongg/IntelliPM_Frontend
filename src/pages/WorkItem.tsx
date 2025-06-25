import React from 'react';
import './WorkItem.css';
import tickIcon from '/src/assets/check_box.png';
import bugIcon from '/src/assets/bug.png';
import flagIcon from '/src/assets/flag.png';

// Định nghĩa interface cho props
interface WorkItemProps {
  isOpen: boolean;
  onClose: () => void;
  childWorkItems: { key: string; summary: string; status: string }[];
  onChildItemClick: (item: any) => void;
  onChildPopupClose: () => void;
}

interface ChildWorkItem {
  key: string;
  summary: string;
  status: string;
}

const WorkItem: React.FC<WorkItemProps> = ({ isOpen, onClose, childWorkItems, onChildItemClick, onChildPopupClose }) => {
  const [status] = React.useState('In Progress');
  const [workType, setWorkType] = React.useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');

  // Xử lý chọn work type
  const handleWorkTypeChange = (type: string) => {
    setWorkType(type);
    setIsDropdownOpen(false);
  };

  // Ngăn chặn sự kiện lan ra
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Chọn icon dựa trên workType
  const getIconSrc = () => {
    switch (workType) {
      case 'Bug':
        return bugIcon;
      case 'Story':
        return flagIcon;
      case 'Task':
      default:
        return tickIcon;
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Điều hướng sang trang khác khi nhấp vào SAS-1
  const handleKeyClick = () => {
    window.location.href = '/work-item-detail';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsDropdownOpen(false)}>
      <div className="work-item-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="issue-header">
            <span className="issue-type" onClick={(e) => e.stopPropagation()}>
              <span className="issue-icon-wrapper" onClick={handleIconClick}>
                <img src={getIconSrc()} alt={`${workType} Icon`} />
              </span>
              <span className="issue-key" onClick={handleKeyClick}>
                SAS-1
              </span>

              {isDropdownOpen && (
                <div className="issue-type-dropdown" onClick={handleDropdownClick}>
                  <div className="dropdown-title">Change Work Type</div>
                  <div className="dropdown-item" onClick={() => handleWorkTypeChange('Task')}>
                    <input type="radio" checked={workType === 'Task'} readOnly />
                    <img src={tickIcon} alt="Task" className="dropdown-icon" />
                    Task
                  </div>
                  <div className="dropdown-item" onClick={() => handleWorkTypeChange('Bug')}>
                    <input type="radio" checked={workType === 'Bug'} readOnly />
                    <img src={bugIcon} alt="Bug" className="dropdown-icon" />
                    Bug
                  </div>
                  <div className="dropdown-item" onClick={() => handleWorkTypeChange('Story')}>
                    <input type="radio" checked={workType === 'Story'} readOnly />
                    <img src={flagIcon} alt="Story" className="dropdown-icon" />
                    Story
                  </div>
                </div>
              )}
            </span>

            <input
              type="text"
              className="issue-summary"
              placeholder="Enter summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>✖</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          <div className="main-section">
            <div className="field-group">
              <label>Description</label>
              <textarea
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Child work items</label>
              <div className="child-items">
                {childWorkItems.map((item, index) => (
                  <div key={index} className="child-item">
                    <span
                      className="item-key"
                      onClick={() => onChildItemClick(item)}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {item.key}
                    </span>
                    <input
                      type="text"
                      className="item-summary"
                      defaultValue={item.summary}
                    />
                    <select
                      className="item-status"
                      value={item.status}
                      onChange={(e) => console.log(e.target.value)}
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                ))}
                <button className="add-btn">+ Add</button>
              </div>
            </div>
            <div className="field-group">
              <div className="activity-tabs">
                <button className="tab active">All</button>
                <button className="tab">Comments</button>
                <button className="tab">History</button>
                <button className="tab">Work log</button>
              </div>
              <textarea
                className="activity-input"
                placeholder="Add a comment...\nCan I get more info..? Status update... Thanks..."
              />
              <p className="pro-tip">Pro tip: Press <strong>M</strong> to comment</p>
            </div>
          </div>

          {/* Details Panel */}
          <div className="details-panel">
            <div className="pinned-fields">
              <h4>Pinned fields</h4>
              <p>Click on the ✂ next to a field label to start pinning.</p>
            </div>
            <div className="details-content">
              <div className="detail-item">
                <label>Assignee</label>
                <span>Ngo Pham Thao Vy (K16_HC...)</span>
              </div>
              <div className="detail-item">
                <label>Labels</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Parent</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Due date</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Team</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Start date</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Sprint</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Story point estimate</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Fix versions</label>
                <span>None</span>
              </div>
              <div className="detail-item">
                <label>Development</label>
                <button className="dev-btn">Open with VS Code</button>
                <button className="dev-btn">Create branch</button>
                <button className="dev-btn">Create commit</button>
              </div>
              <div className="detail-item">
                <label>Reporter</label>
                <span>Dinh Quoc Tuan Dat (K17_H...)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItem;