import React from 'react';
import './EpicPopup.css';
import { useNavigate } from 'react-router-dom';
import { useGetEpicByIdQuery, useUpdateEpicStatusMutation } from '../../services/epicApi';
import epicIcon from '../../assets/icon/type_epic.svg';
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';
import { useGetTasksByEpicIdQuery, useUpdateTaskStatusMutation } from '../../services/taskApi';
import { useGetWorkItemLabelsByEpicQuery } from '../../services/workItemLabelApi';

interface EpicPopupProps {
    id: string;
    onClose: () => void;
}

const EpicPopup: React.FC<EpicPopupProps> = ({ id, onClose }) => {
    const { data: epic, isLoading, isError } = useGetEpicByIdQuery(id);
    const { data: tasks = [], isLoading: loadingTasks, refetch } = useGetTasksByEpicIdQuery(id);
    const [status, setStatus] = React.useState("");
    const [updateEpicStatus] = useUpdateEpicStatusMutation();
    const [updateTaskStatus] = useUpdateTaskStatusMutation();
    const navigate = useNavigate();
    const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showTaskInput, setShowTaskInput] = React.useState(false);
    const [newTaskTitle, setNewTaskTitle] = React.useState('');
    const taskInputRef = React.useRef<HTMLTableRowElement>(null);
    const [newTaskType, setNewTaskType] = React.useState<'TASK' | 'BUG' | 'STORY'>('TASK');
    const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
    const taskTypes = [
        { label: 'Task', value: 'TASK', icon: taskIcon },
        { label: 'Bug', value: 'BUG', icon: bugIcon },
        { label: 'Story', value: 'STORY', icon: storyIcon },
    ];


    const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
            await refetch();
        } catch (error) {
            console.error('❌ Error update task status', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateEpicStatus({ id, status: newStatus }).unwrap();
            setStatus(newStatus);
        } catch (error) {
            console.error('❌ Error update epic status', error);
        }
    };

    React.useEffect(() => {
        if (epic) {
            setStatus(epic.status);
        }
    }, [epic]);

    const { data: epicLabels = [] } = useGetWorkItemLabelsByEpicQuery(id, {
        skip: !id,
    });

    const handleResize = (e: React.MouseEvent<HTMLDivElement>, colIndex: number) => {
        const startX = e.clientX;
        const th = document.querySelectorAll('.issue-table th')[colIndex] as HTMLElement;
        const startWidth = th.offsetWidth;

        const onMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (e.clientX - startX);
            th.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

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
                            <span
                                className="issue-key"
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => navigate(`/project/epic/${epic.id}`)}
                            >
                                {epic.id}
                            </span>
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
                        <div className="add-menu-wrapper" style={{ marginBottom: '8px' }}>
                            <button className="btn-add" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>
                                + Add
                            </button>

                            {isAddDropdownOpen && (
                                <div className="add-dropdown">
                                    <div className="add-item" onClick={() => fileInputRef.current?.click()}>
                                        📁 Attachment
                                    </div>
                                    <div className="add-item" onClick={() => {
                                        //navigate(`/project/task/create?epicId=${epic.id}`);
                                        setShowTaskInput(true);
                                        setIsAddDropdownOpen(false);

                                        setTimeout(() => {
                                            taskInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }, 100);
                                    }}>
                                        📝 Task
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            // Gọi API upload file cho Epic tại đây
                                            //await uploadEpicFile({ epicId: epic.id, file });
                                            alert(`✅ Uploaded: ${file.name}`);
                                            await refetch(); // Nếu cần cập nhật attachment
                                        } catch (err) {
                                            console.error('❌ Upload failed:', err);
                                            alert('❌ Upload failed.');
                                        }
                                    }
                                    setIsAddDropdownOpen(false);
                                }}
                            />
                        </div>

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
                                                <th>
                                                    Type
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 0)} />
                                                </th>
                                                <th>
                                                    Key
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 1)} />
                                                </th>
                                                <th>
                                                    Summary
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 2)} />
                                                </th>
                                                <th>
                                                    Priority
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 3)} />
                                                </th>
                                                <th>
                                                    Assignee
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 4)} />
                                                </th>
                                                <th>
                                                    Status
                                                    <div className="resizer" onMouseDown={(e) => handleResize(e, 5)} />
                                                </th>
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
                                                            title={task.type.charAt(0) + task.type.slice(1).toLowerCase()}
                                                        />
                                                        </td>
                                                        <td>{task.id}</td>
                                                        <td>{task.title}</td>
                                                        <td>{task.priority}</td>
                                                        <td>{task.reporterId}</td>
                                                        <td>
                                                            <select
                                                                className={`custom-epic-status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                                                                value={task.status}
                                                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                                            >
                                                                <option value="TO_DO">To Do</option>
                                                                <option value="IN_PROGRESS">In Progress</option>
                                                                <option value="DONE">Done</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>

                                        {showTaskInput && (
                                            <tr ref={taskInputRef}>
                                                <td>
                                                    <div className="task-type-selector" style={{ position: 'relative' }}>
                                                        <button
                                                            className="task-type-button"
                                                            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '4px 8px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                background: 'white',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    newTaskType === 'BUG'
                                                                        ? bugIcon
                                                                        : newTaskType === 'STORY'
                                                                            ? storyIcon
                                                                            : taskIcon
                                                                }
                                                                alt={newTaskType}
                                                                style={{ width: 16, marginRight: 6 }}
                                                            />
                                                            {newTaskType.charAt(0) + newTaskType.slice(1).toLowerCase()}
                                                        
                                                        </button>

                                                        {showTypeDropdown && (
                                                            <div
                                                                className="dropdown-menu"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '110%',
                                                                    left: 0,
                                                                    backgroundColor: '#fff',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: 4,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                                    zIndex: 1000,
                                                                    width: 120,
                                                                }}
                                                            >
                                                                {taskTypes.map((type) => (
                                                                    <div
                                                                        key={type.value}
                                                                        className="dropdown-item"
                                                                        onClick={() => {
                                                                            setNewTaskType(type.value as 'TASK' | 'BUG' | 'STORY');
                                                                            setShowTypeDropdown(false);
                                                                        }}
                                                                        style={{
                                                                            padding: '6px 10px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            cursor: 'pointer',
                                                                            gap: 6,
                                                                        }}
                                                                    >
                                                                        <img src={type.icon} alt={type.label} style={{ width: 16 }} />
                                                                        {type.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td colSpan={5}>
                                                    <input
                                                        type="text"
                                                        placeholder="What needs to be done?"
                                                        value={newTaskTitle}
                                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                                        style={{
                                                            width: '45%',
                                                            padding: '6px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            marginRight: '8px',
                                                        }}
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                // await createTask({ epicId: epic.id, title: newTaskTitle, type: newTaskType }).unwrap();
                                                                console.log('✅ Task created');
                                                                setNewTaskTitle('');
                                                                setShowTaskInput(false);
                                                                await refetch();
                                                            } catch (err) {
                                                                console.error('❌ Failed to create task:', err);
                                                                alert('❌ Failed to create task');
                                                            }
                                                        }}
                                                        disabled={!newTaskTitle.trim()}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#0052cc',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: newTaskTitle.trim() ? 'pointer' : 'not-allowed',
                                                        }}
                                                    >
                                                        Create
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowTaskInput(false);
                                                            setNewTaskTitle('');
                                                        }}
                                                        style={{
                                                            marginLeft: '8px',
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ccc',
                                                            color: 'black',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        )}



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
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`custom-epic-status-select status-${status.toLowerCase().replace('_', '-')}`}
                            >
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        <div className="details-content">
                            <div className="detail-item"><label>Assignee</label><span>{epic.assignedById ?? 'None'}</span></div>
                            <div className="detail-item">
                                <label>Labels</label>
                                <span>
                                    {epicLabels.length === 0
                                        ? 'None'
                                        : epicLabels.map((label) => label.labelName).join(', ')}
                                </span>
                            </div>

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
