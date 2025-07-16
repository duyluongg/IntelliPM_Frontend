import React from 'react';
import './EpicPopup.css';
import WorkItem from './WorkItem';
import { useNavigate } from 'react-router-dom';
import { useGetEpicByIdQuery, useUpdateEpicStatusMutation, useUpdateEpicMutation } from '../../services/epicApi';
import epicIcon from '../../assets/icon/type_epic.svg';
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';
import deleteIcon from '../../assets/delete.png';
import { useGetTasksByEpicIdQuery, useUpdateTaskStatusMutation, useCreateTaskMutation, useUpdateTaskTitleMutation } from '../../services/taskApi';
import { useGetWorkItemLabelsByEpicQuery } from '../../services/workItemLabelApi';
import { useGetEpicFilesByEpicIdQuery, useUploadEpicFileMutation, useDeleteEpicFileMutation } from '../../services/epicFileApi';
import { useLazyGetTaskAssignmentsByTaskIdQuery, useCreateTaskAssignmentQuickMutation, useDeleteTaskAssignmentMutation } from '../../services/taskAssignmentApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import type { TaskAssignmentDTO } from '../../services/taskAssignmentApi';
import { useGetSprintsByProjectIdQuery } from '../../services/sprintApi';
interface EpicPopupProps {
    id: string;
    onClose: () => void;
}

const EpicPopup: React.FC<EpicPopupProps> = ({ id, onClose }) => {
    const { data: epic, isLoading, isError } = useGetEpicByIdQuery(id);
    const { data: tasks = [], isLoading: loadingTasks, refetch } = useGetTasksByEpicIdQuery(id);
    const [status, setStatus] = React.useState("");
    const [projectId, setProjectId] = React.useState("");
    const [epicId, setEpicId] = React.useState("");
    const [updateEpicStatus] = useUpdateEpicStatusMutation();
    const [updateTaskStatus] = useUpdateTaskStatusMutation();
    const navigate = useNavigate();
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
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
    const [description, setDescription] = React.useState('');
    const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
    const { data: attachments = [], refetch: refetchAttachments } = useGetEpicFilesByEpicIdQuery(id);
    const [uploadEpicFile] = useUploadEpicFileMutation();
    const [deleteEpicFile] = useDeleteEpicFileMutation();
    const accountId = parseInt(localStorage.getItem("accountId") || "0");
    const [createTask] = useCreateTaskMutation();
    const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
    const [editableTitles, setEditableTitles] = React.useState<Record<string, string>>({});
    const [updateTaskTitle] = useUpdateTaskTitleMutation();
    const [selectedAssignees, setSelectedAssignees] = React.useState<Record<string, number[]>>({});
    const [createTaskAssignment] = useCreateTaskAssignmentQuickMutation();
    const [deleteTaskAssignment] = useDeleteTaskAssignmentMutation();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((item) => item.status === 'DONE').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const [taskAssignmentMap, setTaskAssignmentMap] = React.useState<Record<string, TaskAssignmentDTO[]>>({});
    const [getTaskAssignments] = useLazyGetTaskAssignmentsByTaskIdQuery();
    const [updateEpic] = useUpdateEpicMutation();
    const [newName, setNewName] = React.useState<string | undefined>();
    const [newDescription, setNewDescription] = React.useState<string | undefined>();
    const [newStartDate, setNewStartDate] = React.useState<string | undefined>();
    const [newEndDate, setNewEndDate] = React.useState<string | undefined>();
    //const [newSprintId, setNewSprintId] = React.useState<number | null>(null);
    const [selectedAssignee, setSelectedAssignee] = React.useState<number | null>(null);
    const [newAssignedBy, setNewAssignedBy] = React.useState<number | null>(null);
    const [selectedReporter, setSelectedReporter] = React.useState<number | null>(null);
    const [newReporterId, setNewReporterId] = React.useState<number | null>(null);

    const { data: sprints = [] } = useGetSprintsByProjectIdQuery(epic?.projectId!, {
        skip: !epic?.projectId,
    });

    React.useEffect(() => {
        if (epic && newAssignedBy !== null && newAssignedBy !== epic.assignedBy) {
            handleUpdateEpic();
        }
    }, [newAssignedBy]);

    React.useEffect(() => {
        if (epic && newReporterId !== null && newReporterId !== epic.reporterId) {
            handleUpdateEpic();
        }
    }, [newReporterId]);


    React.useEffect(() => {
        const fetchAllTaskAssignments = async () => {
            const result: Record<string, TaskAssignmentDTO[]> = {};

            for (const t of tasks) {
                try {
                    const data = await getTaskAssignments(t.id).unwrap();
                    result[t.id] = data;
                } catch (err) {
                    console.error(`❌ Failed to fetch assignees for ${t.id}:`, err);
                }
            }

            setTaskAssignmentMap(result);
        };

        if (tasks.length > 0) fetchAllTaskAssignments();
    }, [tasks]);

    const { data: projectMembers = [] } = useGetProjectMembersQuery(epic?.projectId!, {
        skip: !epic?.projectId,
    });

    const handleDeleteFile = async (fileId: number) => {
        try {
            await deleteEpicFile(fileId).unwrap();
            alert('✅ Delete file successfully!');
            await refetchAttachments();
        } catch (error) {
            console.error('❌ Failed to delete file:', error);
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
        if (epic && epic.assignedBy !== undefined) {
            setEpicId(epic.id);
            setStatus(epic.status);
            setDescription(epic.description);
            setProjectId(String(epic.projectId));
            setSelectedAssignee(epic.assignedBy);
            setNewAssignedBy(epic.assignedBy);
            if (epic?.reporterId) {
                setSelectedReporter(epic.reporterId);
                setNewReporterId(epic.reporterId);
            }

            if (epic?.assignedBy) {
                setSelectedAssignee(epic.assignedBy);
                setNewAssignedBy(epic.assignedBy);
            }
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

    const handleUpdateEpic = async () => {
        if (!epic) return;

        try {
            await updateEpic({
                id: epic.id,
                data: {
                    projectId: epic.projectId,
                    name: newName ?? epic.name,
                    description: newDescription ?? epic.description,
                    assignedBy: newAssignedBy ?? epic.assignedBy,
                    reporterId: newReporterId ?? epic.reporterId,
                    startDate: newStartDate ?? epic.startDate,
                    endDate: newEndDate ?? epic.endDate,
                    status: epic.status,
                },
            }).unwrap();

            alert("✅ Epic updated");
            console.error("✅ Epic updated");
        } catch (err) {
            console.error("❌ Failed to update epic", err);
            alert("❌ Update failed");
        }
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
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleUpdateEpic}
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
                                            await uploadEpicFile({ epicId: id, title: file.name, file }).unwrap();
                                            alert(`✅ Uploaded: ${file.name}`);
                                            await refetchAttachments();
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
                                value={newDescription ?? epic?.description ?? ''}
                                onChange={(e) => setNewDescription(e.target.value)}
                                onBlur={handleUpdateEpic}
                            />
                        </div>

                        {attachments.length > 0 && (
                            <div className="attachments-section">
                                <label>Attachments <span>({attachments.length})</span></label>
                                <div className="attachments-grid">
                                    {attachments.map(file => (
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
                                                            <span className="doc-text">{file.title.slice(0, 15)}...</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="file-meta">
                                                    <div className="file-name" title={file.title}>{file.title}</div>
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

                        <div className="field-group">
                            <label>Child Work Items</label>

                            <div style={{ marginBottom: '8px' }}>
                                <div style={{
                                    height: '8px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${progressPercent}%`,
                                        backgroundColor: '#4caf50',
                                        height: '100%',
                                        transition: 'width 0.3s ease',
                                    }} />
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '13px', color: '#555' }}>
                                    {progressPercent}% Done
                                </div>
                            </div>
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
                                                        <td>
                                                            <a onClick={() => setSelectedTaskId(task.id)} style={{ cursor: 'pointer' }}>
                                                                {task.id}
                                                            </a>
                                                        </td>

                                                        <td onClick={() => setEditingTaskId(task.id)} style={{
                                                            cursor: 'pointer',
                                                            whiteSpace: 'normal',        // Cho phép xuống dòng
                                                            wordBreak: 'break-word',     // Tự động ngắt nếu từ quá dài
                                                            maxWidth: '300px',           // (Tùy chọn) Giới hạn chiều ngang
                                                        }}>
                                                            {editingTaskId === task.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editableTitles[task.id] ?? task.title}
                                                                    onChange={(e) =>
                                                                        setEditableTitles((prev) => ({ ...prev, [task.id]: e.target.value }))
                                                                    }
                                                                    onBlur={async () => {
                                                                        const newTitle = editableTitles[task.id]?.trim();
                                                                        if (newTitle && newTitle !== task.title) {
                                                                            try {
                                                                                await updateTaskTitle({ id: task.id, title: newTitle }).unwrap();
                                                                                await refetch();
                                                                            } catch (err) {
                                                                                console.error('❌ Failed to update title:', err);
                                                                            }
                                                                        }
                                                                        setEditingTaskId(null);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            (e.target as HTMLInputElement).blur();
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '4px 6px',
                                                                        border: '1px solid #ccc',
                                                                        borderRadius: 4,
                                                                    }}
                                                                />
                                                            ) : (
                                                                task.title
                                                            )}
                                                        </td>


                                                        <td>
                                                            <select
                                                                value={task.priority}
                                                                onChange={async (e) => {
                                                                    const newPriority = e.target.value;
                                                                    // try {
                                                                    //     await updateTaskStatus({
                                                                    //         id: task.id,
                                                                    //         priority: newPriority,
                                                                    //     }).unwrap();
                                                                    //     await refetch(); // refresh task list
                                                                    // } catch (err) {
                                                                    //     console.error('❌ Error updating priority:', err);
                                                                    // }
                                                                }}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: 'white',
                                                                }}
                                                            >
                                                                <option value="HIGHEST">Highest</option>
                                                                <option value="HIGH">High</option>
                                                                <option value="MEDIUM">Medium</option>
                                                                <option value="LOW">Low</option>
                                                                <option value="LOWEST">Lowest</option>
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <div className="multi-select-dropdown">
                                                                {/* Hiển thị danh sách đã chọn */}
                                                                <div className="selected-list">
                                                                    {(taskAssignmentMap[task.id] ?? []).map((assignment) => (
                                                                        <span className="selected-tag" key={assignment.accountId}>
                                                                            {assignment.accountFullname ?? 'Unknown'}
                                                                            <button
                                                                                className="remove-tag"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        await deleteTaskAssignment({
                                                                                            taskId: task.id,
                                                                                            assignmentId: assignment.id,
                                                                                        }).unwrap();

                                                                                        setTaskAssignmentMap((prev) => ({
                                                                                            ...prev,
                                                                                            [task.id]: prev[task.id].filter((a) => a.accountId !== assignment.accountId),
                                                                                        }));
                                                                                    } catch (err) {
                                                                                        console.error('❌ Failed to delete assignee:', err);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                ✖
                                                                            </button>
                                                                        </span>
                                                                    ))}

                                                                </div>                                              {/* Dropdown chọn thêm */}
                                                                <div className="dropdown-select-wrapper">
                                                                    <select
                                                                        onChange={async (e) => {
                                                                            const selectedId = parseInt(e.target.value);
                                                                            if (!selectedAssignees[task.id]?.includes(selectedId)) {
                                                                                try {
                                                                                    await createTaskAssignment({ taskId: task.id, accountId: selectedId }).unwrap();

                                                                                    // Gọi lại API để lấy thông tin đầy đủ bao gồm fullname
                                                                                    const data = await getTaskAssignments(task.id).unwrap();

                                                                                    setTaskAssignmentMap((prev) => ({
                                                                                        ...prev,
                                                                                        [task.id]: data, // cập nhật lại danh sách mới
                                                                                    }));

                                                                                    setSelectedAssignees((prev) => ({
                                                                                        ...prev,
                                                                                        [task.id]: [...(prev[task.id] ?? []), selectedId],
                                                                                    }));

                                                                                } catch (err) {
                                                                                    console.error('❌ Failed to create assignee:', err);
                                                                                    alert('❌ Error adding assignee');
                                                                                }
                                                                            }
                                                                        }}
                                                                        value=""
                                                                    >
                                                                        <option value="" disabled hidden>+ Add assignee</option>
                                                                        {projectMembers
                                                                            .filter((m) => !(taskAssignmentMap[task.id] ?? []).some((a) => a.accountId === m.accountId))
                                                                            .map((member) => (
                                                                                <option key={member.accountId} value={member.accountId}>
                                                                                    {member.accountName}
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <select
                                                                className={`custom-epic-status-select status-${task.status.toLowerCase().replace('_', '-')}`}
                                                                value={task.status}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        await updateTaskStatus({
                                                                            id: task.id,
                                                                            status: e.target.value,
                                                                        }).unwrap();
                                                                        await refetch();
                                                                    } catch (err) {
                                                                        console.error('❌ Error updating status:', err);
                                                                    }
                                                                }}
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


                                    </table>
                                </div>
                            </div>
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
                                                        bottom: '110%',
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
                                                width: '50%',
                                                padding: '6px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                marginRight: '8px',
                                            }}
                                        />
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const now = new Date().toISOString();

                                                    await createTask({
                                                        reporterId: accountId,
                                                        projectId: parseInt(projectId),
                                                        epicId: epic.id,
                                                        title: newTaskTitle.trim(),
                                                        type: newTaskType,
                                                    }).unwrap();

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
                        </div>

                        <div className="activity-tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Comments</button>
                            <button className="tab">History</button>
                        </div>
                        <div className="comment-list">
                            <textarea className="activity-input" />

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
                            <div className="detail-item">
                                <label>Assignee</label>
                                <select
                                    value={selectedAssignee ?? ''}
                                    onChange={(e) => {
                                        const assigneeId = Number(e.target.value);
                                        setSelectedAssignee(assigneeId);
                                        setNewAssignedBy(assigneeId);
                                    }}

                                    style={{
                                        padding: '2px 0px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: 'white',
                                        width: '150px',
                                    }}
                                >
                                    <option value="" disabled>-- Select assignee --</option>
                                    {projectMembers.map((member) => (
                                        <option key={member.accountId} value={member.accountId}>
                                            {member.accountName}
                                        </option>
                                    ))}
                                </select>
                            </div>



                            <div className="detail-item">
                                <label>Labels</label>
                                <span>
                                    {epicLabels.length === 0
                                        ? 'None'
                                        : epicLabels.map((label) => label.labelName).join(', ')}
                                </span>
                            </div>

                            <div className="detail-item"><label>Sprint</label><span>{epic?.sprintName ?? 'None'} : {epic?.sprintGoal ?? 'None'}</span></div>
                            <div className="detail-item">
                                <label>Start date</label>
                                <input
                                    type="date"
                                    value={newStartDate?.slice(0, 10) ?? epic?.startDate?.slice(0, 10) ?? ''}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        const fullDate = `${selectedDate}T00:00:00.000Z`;
                                        setNewStartDate(fullDate);
                                    }}
                                    onBlur={handleUpdateEpic}
                                    style={{ width: '150px' }}
                                />
                            </div>

                            <div className="detail-item">
                                <label>Due date</label>
                                <input
                                    type="date"
                                    value={newEndDate?.slice(0, 10) ?? epic?.endDate?.slice(0, 10) ?? ''}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        const fullDate = `${selectedDate}T00:00:00.000Z`;
                                        setNewEndDate(fullDate);
                                    }}
                                    onBlur={handleUpdateEpic}
                                    style={{ width: '150px' }}
                                />
                            </div>

                            <div className="detail-item">
                                <label>Reporter</label>
                                <select
                                    value={selectedReporter ?? ''}
                                    onChange={(e) => {
                                        const reporterId = Number(e.target.value);
                                        setSelectedReporter(reporterId);
                                        setNewReporterId(reporterId);
                                    }}
                                    style={{ padding: '2px 0px', width: '150px' }}
                                >
                                    <option value="" disabled>-- Select reporter --</option>
                                    {projectMembers.map((member) => (
                                        <option key={member.accountId} value={member.accountId}>
                                            {member.accountName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {selectedTaskId && (
                <WorkItem
                    isOpen={true}
                    taskId={selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

export default EpicPopup;
