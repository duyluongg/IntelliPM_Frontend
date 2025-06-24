import React, { useState } from 'react';
import './WorkItemDetail.css';
import tickIcon from '/src/assets/check_box.png';
import bugIcon from '/src/assets/bug.png';
import flagIcon from '/src/assets/flag.png';
import subtask from '/src/assets/subtask.png';
import { useNavigate } from 'react-router-dom';

interface WorkItemDetailProps { }

const WorkItemDetail: React.FC<WorkItemDetailProps> = () => {
  const [status] = useState('In Progress');
  const [workType, setWorkType] = useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const [childWorkItems, setChildWorkItems] = useState([
    { key: 'SAS-15', summary: 'hello', priority: 'Medium', assignee: 'Ngo Pham Thao Vy (K16_HCM)', status: 'DONE' },
    { key: 'SAS-17', summary: 'ok', priority: 'Medium', assignee: 'Unassigned', status: 'TO DO' }
  ]);


  const handleWorkTypeChange = (type: string) => {
    setWorkType(type);
    setIsDropdownOpen(false);
  };

  const handlePriorityChange = (index: number, value: string) => {
    const updated = [...childWorkItems];
    updated[index].priority = value;
    setChildWorkItems(updated);
  };

  const handleStatusChange = (index: number, value: string) => {
    const updated = [...childWorkItems];
    updated[index].status = value;
    setChildWorkItems(updated);
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
      case 'Task':
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
                SAS-1
              </span>
              {isDropdownOpen && (
                <div className="issue-type-dropdown" onClick={handleDropdownClick}>
                  <div className="dropdown-title">Change Work Type</div>
                  <div onClick={() => handleWorkTypeChange('Task')}>
                    <input type="radio" checked={workType === 'Task'} readOnly />
                    <img src={tickIcon} alt="Task" className="dropdown-icon" />
                    Task
                  </div>
                  <div onClick={() => handleWorkTypeChange('Bug')}>
                    <input type="radio" checked={workType === 'Bug'} readOnly />
                    <img src={bugIcon} alt="Bug" className="dropdown-icon" />
                    Bug
                  </div>
                  <div onClick={() => handleWorkTypeChange('Story')}>
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
            <button className="close-btn" onClick={() => navigate('/work-item')}>✖</button>
          </div>
        </div>
        <div className="detail-content">
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
              <div className="issue-table">
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
                    {childWorkItems.map((item, index) => (
                      <tr key={index}>
                        <td><img src={subtask} alt="Subtask" /></td>
                        <td>
                          <a onClick={() => navigate(`/child-work/${item.key}`)}>{item.key}</a>
                        </td>
                        <td>
                          <a onClick={() => navigate(`/child-work/${item.key}`)}>{item.summary}</a>
                        </td>
                        <td>
                          <select
                            value={item.priority}
                            onChange={(e) => handlePriorityChange(index, e.target.value)}
                            className="dropdown"
                          >
                            <option value="Hard">Hard</option>
                            <option value="Medium">Medium</option>
                            <option value="Easy">Easy</option>
                          </select>
                        </td>
                        <td><span className="assignee">{item.assignee}</span></td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(index, e.target.value)}
                            className={`dropdown status-dropdown ${item.status.toLowerCase()}`}
                          >
                            <option value="TO DO">TO DO</option>
                            <option value="IN PROGRESS">IN PROGRESS</option>
                            <option value="DONE">DONE</option>
                          </select>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
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