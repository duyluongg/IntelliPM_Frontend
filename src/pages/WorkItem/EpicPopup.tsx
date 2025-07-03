import React from 'react';
import './EpicPopup.css';
import { useGetEpicByIdQuery } from '../../services/epicApi';
import subtaskIcon from '../../assets/icon/type_subtask.svg';
import epicIcon from '../../assets/icon/type_epic.svg'; // hoặc icon epic riêng
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';
import { useGetTasksByEpicIdQuery } from '../../services/taskApi';
interface EpicPopupProps {
    id: string;
    onClose: () => void;
}

const EpicPopup: React.FC<EpicPopupProps> = ({ id, onClose }) => {
    const { data: epic, isLoading, isError } = useGetEpicByIdQuery(id);
    const { data: tasks = [], isLoading: loadingTasks } = useGetTasksByEpicIdQuery(id);

    const formatDate = (iso: string | null | undefined) => {
        if (!iso) return 'None';
        return new Date(iso).toLocaleDateString('vi-VN');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'TASK':
                return taskIcon;
            case 'BUG':
                return bugIcon;
            case 'STORY':
                return storyIcon;
            default:
                return taskIcon;
        }
    };


    if (isLoading || !epic) {
        return (
            <div className="modal-overlay">
                <div className="work-item-modal">Đang tải Epic...</div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="work-item-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="issue-header">
                        <span className="issue-type">
                            <span className="issue-icon-wrapper">
                                <img src={epicIcon} alt="Epic" />
                            </span>
                            <span className="issue-key">{epic.id}</span>
                        </span>
                        <input
                            type="text"
                            className="issue-summary"
                            placeholder="Enter epic name"
                            defaultValue={epic.name}
                        />
                    </div>
                    <div className="header-actions">
                        <button className="close-btn" onClick={onClose}>✖</button>
                    </div>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {/* Left - Main Section */}
                    <div className="main-section">
                        <div className="field-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Add a description..."
                                defaultValue={epic.description}
                            />
                        </div>

                        <div className="field-group">
                            <label>Child Work Items</label>
                            <div className="issue-table">
                                <div className="scrollable-table-wrapper">
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
                                            {loadingTasks ? (
                                                <tr><td colSpan={6}>Loading tasks...</td></tr>
                                            ) : tasks.length === 0 ? (
                                                <tr><td colSpan={6}>No tasks found for this epic.</td></tr>
                                            ) : (
                                                tasks.map((task) => (
                                                    <tr key={task.id}>
                                                        <td><img
                                                            src={getTypeIcon(task.type)}
                                                            alt={task.type}
                                                            title={task.type.charAt(0) + task.type.slice(1).toLowerCase()} // Ví dụ: BUG → Bug
                                                        />
                                                        </td>
                                                        <td>{task.id}</td>
                                                        <td>{task.title}</td>
                                                        <td>{task.priority}</td>
                                                        <td>{task.reporterId}</td>
                                                        <td>
                                                            <select
                                                                className={`custom-status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                                                                disabled
                                                            >
                                                                <option>{task.status}</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="activity-tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Comments</button>
                            <button className="tab">History</button>
                        </div>
                        <div className="comment-list">
                            <textarea className="activity-input" placeholder="Add a comment...\nCan I get more info..? Status update... Thanks..." />
                            <p className="pro-tip">Pro tip: Press <strong>M</strong> to comment</p>
                        </div>
                    </div>

                    {/* Right - Sidebar */}
                    <div className="details-panel">
                        <div className="panel-header">
                            <select
                                defaultValue={epic.status}
                                className={`custom-status-select status-${epic.status.toLowerCase()}`}
                            >
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div className="details-content">
                            <div className="detail-item"><label>Assignee</label><span>{epic.assignedById ?? 'None'}</span></div>
                            <div className="detail-item"><label>Labels</label><span>None</span></div>
                            <div className="detail-item"><label>Start date</label><span>{formatDate(epic.startDate)}</span></div>
                            <div className="detail-item"><label>Due date</label><span>{formatDate(epic.endDate)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpicPopup;
