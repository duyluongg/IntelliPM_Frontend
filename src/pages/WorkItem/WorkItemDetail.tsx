import React, { useState } from 'react';
import './WorkItemDetail.css';
import tickIcon from '/src/assets/check_box.png';
import bugIcon from '/src/assets/bug.png';
import flagIcon from '/src/assets/flag.png';
import subtask from '/src/assets/subtask.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetSubtasksByTaskIdQuery } from '../../services/subtaskApi';

interface WorkItemDetailProps {}

const WorkItemDetail: React.FC<WorkItemDetailProps> = () => {
  const [status] = useState('In Progress');
  const [workType, setWorkType] = useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  // ✅ Lấy taskId từ URL
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId') || '';

  // ✅ Gọi API subtasks
  const { data: subtaskData = [], isLoading } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const handleWorkTypeChange = (type: string) => {
    setWorkType(type);
    setIsDropdownOpen(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getIconSrc = () => {
    switch (workType) {
      case 'Bug':
        return bugIcon;
      case 'Story':
        return flagIcon;
      default:
        return tickIcon;
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleKeyClick = () => {
    navigate('/work-item');
  };

  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`📁 File "${file.name}" đã được upload giả lập.`);
    }
    setIsAddDropdownOpen(false);
  };

  const handleAddSubtask = () => {
    alert('🗂 Tính năng thêm subtask đang được phát triển...');
    setIsAddDropdownOpen(false);
  };

  return (
    <div className="work-item-detail-page">
      <div className="work-item-detail-container">
        <div className="detail-header">
          <div className="issue-header">
            <span className="issue-type">
              <span className="issue-icon-wrapper" onClick={handleIconClick}>
                <img src={getIconSrc()} alt={`${workType} Icon`} />
              </span>
              <span className="issue-key" onClick={handleKeyClick}>
                {taskId}
              </span>
              {isDropdownOpen && (
                <div className="issue-type-dropdown" onClick={handleDropdownClick}>
                  <div className="dropdown-title">Change Work Type</div>
                  {['Task', 'Bug', 'Story'].map((type) => (
                    <div key={type} onClick={() => handleWorkTypeChange(type)}>
                      <input type="radio" checked={workType === type} readOnly />
                      <img
                        src={type === 'Task' ? tickIcon : type === 'Bug' ? bugIcon : flagIcon}
                        alt={type}
                        className="dropdown-icon"
                      />
                      {type}
                    </div>
                  ))}
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
            <button className="close-btn" onClick={() => navigate('/work-item')}>✖</button>
          </div>
        </div>

        <div className="detail-content">
          <div className="main-section">
            <div className="add-menu-wrapper">
              <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>+ Add</button>
              {isAddDropdownOpen && (
                <div className="add-dropdown">
                  <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                    📎 Attachment
                  </div>
                  <div className="add-item" onClick={handleAddSubtask}>
                    🗂 Subtask
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
              <div className="issue-table">
                {isLoading ? (
                  <p>Loading subtasks...</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Key</th>
                        <th>Summary</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subtaskData.map((item: any, index: number) => (
                        <tr key={index}>
                          <td><img src={subtask} alt="Subtask" /></td>
                          <td><a onClick={() => navigate(`/child-work/${item.id}`)}>{item.id}</a></td>
                          <td><a onClick={() => navigate(`/child-work/${item.id}`)}>{item.title}</a></td>
                          <td>{item.priority}</td>
                          <td>{item.assignedBy?.toString() ?? 'Unassigned'}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="field-group">
              <div className="activity-tabs">
                <button className="tab active">All</button>
                <button className="tab">Comments</button>
                <button className="tab">History</button>
                <button className="tab">Work log</button>
              </div>
              <textarea className="activity-input" placeholder="Add a comment...\nCan I get more info..? Status update... Thanks..." />
              <p className="pro-tip">Pro tip: Press <strong>M</strong> to comment</p>
            </div>
          </div>

          <div className="details-panel">
            <div className="pinned-fields">
              <h4>Pinned fields</h4>
              <p>Click on the ✂ next to a field label to start pinning.</p>
            </div>
            <div className="details-content">
              <div className="detail-item"><label>Assignee</label><span>Ngo Pham Thao Vy (K16_HC...)</span></div>
              <div className="detail-item"><label>Labels</label><span>None</span></div>
              <div className="detail-item"><label>Parent</label><span>None</span></div>
              <div className="detail-item"><label>Due date</label><span>None</span></div>
              <div className="detail-item"><label>Team</label><span>None</span></div>
              <div className="detail-item"><label>Start date</label><span>None</span></div>
              <div className="detail-item"><label>Sprint</label><span>None</span></div>
              <div className="detail-item"><label>Story point estimate</label><span>None</span></div>
              <div className="detail-item"><label>Fix versions</label><span>None</span></div>
              <div className="detail-item"><label>Development</label>
                <button className="dev-btn">Open with VS Code</button>
                <button className="dev-btn">Create branch</button>
                <button className="dev-btn">Create commit</button>
              </div>
              <div className="detail-item"><label>Reporter</label><span>Dinh Quoc Tuan Dat (K17_H...)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItemDetail;