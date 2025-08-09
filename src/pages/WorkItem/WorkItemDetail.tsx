import React, { useState, useEffect, useRef } from 'react';
import './WorkItemDetail.css';
import { useAuth, type Role } from '../../services/AuthContext';
import tickIcon from '../../assets/icon/type_task.svg';
import subtaskIcon from '../../assets/icon/type_subtask.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import flagIcon from '../../assets/icon/type_story.svg';
import accountIcon from '../../assets/account.png';
import deleteIcon from '../../assets/delete.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useGetSubtasksByTaskIdQuery,
  useUpdateSubtaskStatusMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
} from '../../services/subtaskApi';
import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskTypeMutation,
  useUpdateTaskTitleMutation,
  useUpdateTaskDescriptionMutation,
  useUpdatePlannedStartDateMutation,
  useUpdatePlannedEndDateMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskReporterMutation,
  useUpdateTaskSprintMutation
} from '../../services/taskApi';
import {
  useGetTaskFilesByTaskIdQuery,
  useUploadTaskFileMutation,
  useDeleteTaskFileMutation,
} from '../../services/taskFileApi';
import {
  useGetCommentsByTaskIdQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
} from '../../services/taskCommentApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import { useGetWorkItemLabelsByTaskQuery } from '../../services/workItemLabelApi';
import { useGetTaskAssignmentsByTaskIdQuery } from '../../services/taskAssignmentApi';
import type { AiSuggestedSubtask } from '../../services/subtaskAiApi'; // chỉnh lại path cho đúng
import { useGenerateSubtasksByAIMutation } from '../../services/subtaskAiApi';
import type { TaskAssignmentDTO } from '../../services/taskAssignmentApi';
import {
  useLazyGetTaskAssignmentsByTaskIdQuery,
  useCreateTaskAssignmentQuickMutation,
  useDeleteTaskAssignmentMutation,
} from '../../services/taskAssignmentApi';
import { useGetActivityLogsByTaskIdQuery } from '../../services/activityLogApi';
import { WorkLogModal } from './WorkLogModal';
import TaskDependency from './TaskDependency';
import { useParams } from 'react-router-dom';
import {
  useCreateLabelAndAssignMutation,
  useGetLabelsByProjectIdQuery,
} from '../../services/labelApi';
import { useDeleteWorkItemLabelMutation } from '../../services/workItemLabelApi';
import { useGetCategoriesByGroupQuery } from '../../services/dynamicCategoryApi';
import { useGetSprintsByProjectIdQuery } from '../../services/sprintApi';
import DeleteConfirmModal from "../WorkItem/DeleteConfirmModal";

const WorkItemDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId') || '';
  const { projectKey: paramProjectKey } = useParams();
  const queryProjectKey = searchParams.get('projectKey');
  const projectKey = paramProjectKey || queryProjectKey || 'NotFound';
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateTaskType] = useUpdateTaskTypeMutation();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [workType, setWorkType] = useState('Task');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [selectedChild, setSelectedChild] = React.useState<any>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [createSubtask] = useCreateSubtaskMutation();
  const [title, setTitle] = React.useState('');
  const [uploadTaskFile] = useUploadTaskFileMutation();
  const subtaskInputRef = React.useRef<HTMLTableRowElement>(null);
  const [deleteTaskFile] = useDeleteTaskFileMutation();
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
  const [createTaskComment] = useCreateTaskCommentMutation();
  const [commentContent, setCommentContent] = React.useState('');
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [updateTaskComment] = useUpdateTaskCommentMutation();
  const [deleteTaskComment] = useDeleteTaskCommentMutation();
  const [reporterName, setReporterName] = React.useState('');
  const [plannedStartDate, setPlannedStartDate] = React.useState('');
  const [plannedEndDate, setPlannedEndDate] = React.useState('');
  const [projectName, setProjectName] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [sprintId, setSprintId] = useState<number | null>(null);
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [editableSummaries, setEditableSummaries] = React.useState<{ [key: string]: string }>({});
  const [editingSummaryId, setEditingSummaryId] = React.useState<string | null>(null);
  const [selectedAssignees, setSelectedAssignees] = React.useState<{ [key: string]: string }>({});
  const [updatePlannedStartDate] = useUpdatePlannedStartDateMutation();
  const [updatePlannedEndDate] = useUpdatePlannedEndDateMutation();
  const [updateTaskSprint] = useUpdateTaskSprintMutation();
  const [updateTaskTitle] = useUpdateTaskTitleMutation();
  const [updateTaskDescription] = useUpdateTaskDescriptionMutation();
  const [showSuggestionList, setShowSuggestionList] = React.useState(false);
  const [isWorklogOpen, setIsWorklogOpen] = useState(false);
  const [isDependencyOpen, setIsDependencyOpen] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = React.useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = React.useState<AiSuggestedSubtask[]>([]);
  const [generateSubtasksByAI, { isLoading: loadingSuggest }] = useGenerateSubtasksByAIMutation();
  const [taskAssignmentMap, setTaskAssignmentMap] = React.useState<
    Record<string, TaskAssignmentDTO[]>
  >({});
  const [createTaskAssignment] = useCreateTaskAssignmentQuickMutation();
  const [deleteTaskAssignment] = useDeleteTaskAssignmentMutation();
  const [getTaskAssignments] = useLazyGetTaskAssignmentsByTaskIdQuery();
  const [updateTaskPriority] = useUpdateTaskPriorityMutation();
  const [selectedReporter, setSelectedReporter] = useState<number | null>(null);
  const [updateTaskReporter] = useUpdateTaskReporterMutation();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [deleteWorkItemLabel] = useDeleteWorkItemLabelMutation();
  const { data: taskStatus, isLoading: loadTaskStatus, isError: taskStatusError } = useGetCategoriesByGroupQuery('task_status');
  const { data: subtaskStatus, isLoading: loadSubtaskStatus, isError: subtaskStatusError } = useGetCategoriesByGroupQuery('subtask_status');
  const taskStatusLabel = taskStatus?.data.find((s) => s.name === status)?.label || status.replace('_', ' ');
  const { data: taskTypes, isLoading: isLoadingTaskType, isError: isTaskTypeError } = useGetCategoriesByGroupQuery('task_type');
  const { data: priorityOptions, isLoading: isPriorityLoading, isError: isPriorityError } = useGetCategoriesByGroupQuery('subtask_priority');
  const { data: priorityTaskOptions, isLoading: isPriorityTaskLoading, isError: isPriorityTaskError } = useGetCategoriesByGroupQuery('task_priority');
  const currentType = taskTypes?.data.find((t) => t.name === workType);
  const currentIcon = currentType?.iconLink || '';

  const { data: assignees = [], isLoading: isAssigneeLoading } =
    useGetTaskAssignmentsByTaskIdQuery(taskId);

  const {
    data: attachments = [],
    isLoading: isAttachmentsLoading,
    refetch: refetchAttachments,
  } = useGetTaskFilesByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetCommentsByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const toISO = (localDate: string) => {
    const date = new Date(localDate);
    return date.toISOString(); // 2025-07-09T08:47:00.000Z
  };

  const handlePlannedStartDateTaskChange = async () => {
    if (plannedStartDate === taskData?.plannedStartDate?.slice(0, 16)) return;
    try {
      await updatePlannedStartDate({
        id: taskId,
        plannedStartDate: toISO(plannedStartDate),
        createdBy: accountId,
      }).unwrap();
      await refetchActivityLogs();
      console.log('✅ Start date updated');
    } catch (err) {
      console.error('❌ Failed to update start date', err);
    }
  };

  const handlePlannedEndDateTaskChange = async () => {
    if (plannedEndDate === taskData?.plannedEndDate?.slice(0, 16)) return;
    try {
      await updatePlannedEndDate({
        id: taskId,
        plannedEndDate: toISO(plannedEndDate),
        createdBy: accountId,
      }).unwrap();
      await refetchActivityLogs();
      console.log('✅ End date updated');
    } catch (err) {
      console.error('❌ Failed to update end date', err);
    }
  };

  const handleTitleTaskChange = async () => {
    try {
      await updateTaskTitle({ id: taskId, title, createdBy: accountId }).unwrap();
      alert('✅ Update title task successfully!');
      await refetchActivityLogs();
      console.log('Update title task successfully');
    } catch (err) {
      alert('✅ Error update task title!');
      console.error('Error update task title:', err);
    }
  };

  const handleDescriptionTaskChange = async () => {
    if (description === taskData?.description) return;

    try {
      await updateTaskDescription({ id: taskId, description, createdBy: accountId }).unwrap();
      await refetchActivityLogs();
      console.log('Update description task successfully!');
    } catch (err) {
      console.error('Error update task description:', err);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ id: number; createdBy: number } | null>(null);

  const openDeleteModal = (id: number, createdBy: number) => {
    setDeleteInfo({ id, createdBy });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!deleteInfo) return;
    try {
      await deleteTaskFile({ id: deleteInfo.id, createdBy: accountId }).unwrap();
      // // có thể thay alert = toast đẹp hơn
      // alert("✅ Delete file successfully!");
      await refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error("❌ Error delete file:", error);
      alert("❌ Delete file failed");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteInfo(null);
    }
  };

  const handleDeleteFile = async (id: number, createdBy: number) => {
    if (!window.confirm('Are you sure delete file?')) return;
    try {
      await deleteTaskFile({ id, createdBy: accountId }).unwrap();
      alert('✅ Delete file successfully!');
      await refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error('❌ Error delete file:', error);
      alert('❌ Delete file failed');
    }
  };

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

  const { data: taskData, refetch: refetchTask } = useGetTaskByIdQuery(taskId, {
    skip: !taskId,
  });

  useEffect(() => {
    if (taskId) {
      refetchTask();
    }
  }, [taskId, refetchTask]);

  const { data: projectMembers = [] } = useGetProjectMembersQuery(taskData?.projectId!, {
    skip: !taskData?.projectId,
  });

  React.useEffect(() => {
    if (assignees && taskId) {
      setTaskAssignmentMap((prev) => ({ ...prev, [taskId]: assignees }));
    }
  }, [assignees, taskId]);

  const {
    data: activityLogs = [],
    isLoading: isActivityLogsLoading,
    refetch: refetchActivityLogs,
  } = useGetActivityLogsByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const {
    data: subtaskData = [],
    isLoading,
    refetch: refetchSubtask,
  } = useGetSubtasksByTaskIdQuery(taskId, {
    skip: !taskId,
  });

  const totalSubtasks = subtaskData.length;
  const completedSubtasks = subtaskData.filter((item) => item.status === 'DONE').length;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubtaskStatus] = useUpdateSubtaskStatusMutation();

  useEffect(() => {
    if (taskData) {
      setStatus(taskData.status);
      setDescription(taskData.description ?? '');
      setWorkType(taskData.type);
      setTitle(taskData.title);
      setReporterName(taskData.reporterName ?? '');
      setPlannedEndDate(taskData.plannedEndDate);
      setPlannedStartDate(taskData.plannedStartDate);
      setProjectName(taskData.projectName ?? '');
      setSprintId(taskData.sprintId ?? null);
      setProjectId(String(taskData.projectId));
      setSelectedReporter(taskData.reporterId ?? null);
    }
  }, [taskData]);

  const childWorkItems = subtaskData.map((item) => ({
    key: item.id,
    summary: item.title,
    priority: item.priority,
    assignee: item.assignedByName ?? 'Unassigned',
    assigneeId: item.assignedBy ?? '0',
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate,
    reporterId: item.reporterId,
    reporterName: item.reporterName,
    description: item.description,
    sprintId: item.sprintId ?? null
  }));

  const handleTaskStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus, createdBy: accountId }).unwrap();
      await refetchTask();
    } catch (err) {
      console.error('Update task status failed', err);
    }
  };

  const handleSubtaskStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubtaskStatus({
        id,
        status: newStatus,
        createdBy: accountId,
      }).unwrap();

      refetchSubtask();
    } catch (err) {
      console.error('Failed to update subtask status', err);
    }
  };

  const handleWorkTypeChange = async (type: string) => {
    try {
      setWorkType(type);
      setIsDropdownOpen(false);
      await updateTaskType({ id: taskId, type: type.toUpperCase(), createdBy: accountId }).unwrap();
      await refetchTask();
    } catch (err) {
      console.error('❌ Error update work type:', err);
    }
  };

  const handleSprintTaskChange = async (newSprintId: number | null) => {
    console.log('Calling handleSprintTaskChange with sprintId:', newSprintId);
    if (newSprintId === taskData?.sprintId) return;

    try {
      await updateTaskSprint({
        id: taskId,
        sprintId: newSprintId,
        createdBy: accountId
      }).unwrap();
      setSprintId(newSprintId);
      await Promise.all([refetchActivityLogs(), refetchTask()]);
      console.log('Update sprint task successfully!');
      alert('✅ Sprint updated successfully');
    } catch (err: any) {
      console.error('Error update sprint:', err);
      alert(`❌ Failed to update sprint: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const { data: workItemLabels = [], isLoading: isLabelLoading, refetch: refetchWorkItemLabels, } = useGetWorkItemLabelsByTaskQuery(taskId, {
    skip: !taskId,
  });

  const { data: projectLabels = [], isLoading: isProjectLabelsLoading, refetch: refetchProjectLabels, } = useGetLabelsByProjectIdQuery(taskData?.projectId!, {
    skip: !taskData?.projectId,
  });

  const { data: projectSprints = [], isLoading: isProjectSprintsLoading,
    refetch: refetchProjectSprints, isError: isProjectSprintsError } = useGetSprintsByProjectIdQuery(taskData?.projectId!, {
      skip: !taskData?.projectId,
    });

  const filteredLabels = projectLabels.filter((label) => {
    const notAlreadyAdded = !workItemLabels.some((l) => l.labelName === label.name);

    if (newLabelName.trim() === '') {
      return notAlreadyAdded;
    }

    return label.name.toLowerCase().includes(newLabelName.toLowerCase()) && notAlreadyAdded;
  });

  const [createLabelAndAssign, { isLoading: isCreating }] = useCreateLabelAndAssignMutation();

  const handleCreateLabelAndAssign = async (labelName?: string) => {
    const nameToAssign = labelName?.trim() || newLabelName.trim();

    if (!taskData?.projectId || !taskId || !nameToAssign) {
      alert('Missing projectId, taskId or label name!');
      return;
    }

    try {
      await createLabelAndAssign({
        projectId: taskData.projectId,
        name: nameToAssign,
        taskId,
        epicId: null,
        subtaskId: null,
      }).unwrap();

      alert('✅ Label assigned successfully!');
      setNewLabelName('');
      setIsEditingLabel(false);
      await Promise.all([refetchWorkItemLabels?.(), refetchProjectLabels?.()]);
    } catch (error) {
      console.error('❌ Failed to create and assign label:', error);
      alert('❌ Failed to assign label');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setIsEditingLabel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteWorkItemLabel = async (id: number) => {
    try {
      await deleteWorkItemLabel(id).unwrap();
      console.log('Delete successfully');
      await refetchWorkItemLabels();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isUserAssignee = (taskId: string, subtaskAssigneeId?: number) => {
    const currentUserId = accountId.toString();

    // For task: Check if the user is in the task's assignees list
    if (!subtaskAssigneeId) {
      const taskAssignees = taskAssignmentMap[taskId] || [];
      return taskAssignees.some((assignee) => assignee.accountId.toString() === currentUserId);
    }

    // For subtask: Check if the user matches the subtask's assignee
    return subtaskAssigneeId.toString() === currentUserId;
  };

  const getIconSrc = () => {
    switch (workType) {
      case 'BUG':
        return bugIcon;
      case 'STORY':
        return flagIcon;
      default:
        return tickIcon;
    }
  };

  // const handleAddSubtask = () => {
  //   setShowSubtaskInput(true);
  //   setIsAddDropdownOpen(false);
  // };

  // const handleKeyClick = () => {
  //   navigate(`/work-item-detail?taskId=${taskId}`);
  // };

  return (
    <div className='work-item-detail-page'>
      <div className='work-item-detail-container'>
        <div className='modal-header'>
          <div className='issue-header'>
            <span className='issue-type'>
              <span className='issue-icon-wrapper' onClick={handleIconClick}>
                <img src={currentIcon} alt={`${workType} Icon`} />
              </span>
              <span className='issue-key'>{taskId}</span>
              {isDropdownOpen && (
                <div className='issue-type-dropdown' onClick={handleDropdownClick}>
                  <div className='dropdown-title'>Change Work Type</div>
                  {taskTypes?.data.map((type) => (
                    <div
                      key={type.id}
                      className={`dropdown-item ${workType === type.name ? 'selected' : ''}`}
                      onClick={() => handleWorkTypeChange(type.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={type.iconLink || ''}
                        alt={type.label}
                        style={{
                          width: '18px',
                        }}
                      />
                      <span style={{ flex: 1 }}>{type.label}</span>
                      {workType === type.name && <span style={{ fontSize: '16px' }}>✔</span>}
                    </div>
                  ))}

                </div>
              )}
            </span>
            <input
              type='text'
              className='issue-summary'
              placeholder='Enter summary'
              defaultValue={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleTaskChange}
              style={{ width: '500px' }}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className='detail-content'>
          <div className='main-section'>
            <div className='add-menu-wrapper'>
              <button className='btn-add' onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>
                + Add
              </button>
              {isAddDropdownOpen && (
                <div className='add-dropdown'>
                  <div className='add-item' onClick={() => fileInputRef.current?.click()}>
                    📁 Attachment
                  </div>
                  <div
                    className='add-item'
                    onClick={() => {
                      setShowSubtaskInput(true);
                      setIsAddDropdownOpen(false);

                      setTimeout(() => {
                        subtaskInputRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }, 100);
                    }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <img
                      src={subtaskIcon}
                      alt='Subtask'
                      style={{ width: '16px', marginRight: '6px' }}
                    />
                    Subtask
                  </div>
                </div>
              )}
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await uploadTaskFile({
                        taskId,
                        title: file.name,
                        file: file,
                        createdBy: accountId,
                      }).unwrap();
                      alert(`✅ Uploaded: ${file.name}`);
                      await refetchAttachments();
                      await refetchActivityLogs();
                    } catch (err) {
                      console.error('❌ Upload failed:', err);
                      alert('❌ Upload failed.');
                    }
                  }
                  setIsAddDropdownOpen(false);
                }}
              />
            </div>

            <div className='field-group'>
              <label>Description</label>
              <textarea
                placeholder='Add a description...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleDescriptionTaskChange()}
                disabled={!canEdit}
              />

              {attachments.length > 0 && (
                <div className="attachments-section">
                  <label className="block font-semibold mb-2">
                    Attachments <span>({attachments.length})</span>
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    {attachments.map((file) => (
                      <div
                        className="relative flex-shrink-0 w-36 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
                        key={file.id}
                        onMouseEnter={() => setHoveredFileId(file.id)}
                        onMouseLeave={() => setHoveredFileId(null)}
                      >
                        <a
                          href={file.urlFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-gray-800 no-underline"
                        >
                          <div className="h-24 flex items-center justify-center bg-gray-100 rounded-t-lg overflow-hidden">
                            {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img
                                src={file.urlFile}
                                alt={file.title}
                                className="w-[100%] h-[100%] object-cover rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                <span className="text-xs font-medium text-gray-600 px-2 text-center">
                                  {file.title.slice(0, 15)}...
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-1">
                            <div
                              className="truncate text-sm font-medium"
                              title={file.title}
                            >
                              {file.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                            </div>
                          </div>
                        </a>

                        {hoveredFileId === file.id && (
                          <button
                            onClick={() => openDeleteModal(file.id, file.createdBy)}
                            className="absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-200"
                            title="Delete file"
                          >
                            <img
                              src={deleteIcon}
                              alt="Delete"
                              className="w-5 h-5"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='field-group'>
              <label>Subtasks</label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '16px',
                  margin: '12px 0',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                  >
                    <span style={{ marginRight: '6px', color: '#d63384' }}>🧠</span>
                    Create suggested work items
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const result = await generateSubtasksByAI(taskId).unwrap();
                        setAiSuggestions(result);
                        setShowSuggestionList(true);
                        setSelectedSuggestions([]);
                      } catch (err) {
                        alert('❌ Failed to get suggestions');
                        console.error(err);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f4f5f7',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {loadingSuggest ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          role='img'
                          style={{ fontSize: '16px', animation: 'pulse 1s infinite' }}
                        >
                          🧠
                        </span>
                        <div className='dot-loader'>
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </div>
                      </div>
                    ) : (
                      'Suggest'
                    )}
                  </button>
                </div>

                {/* Suggestions */}
                {showSuggestionList && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1000,
                    }}
                    onClick={() => setShowSuggestionList(false)}
                  >
                    <div
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        width: '480px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '15px',
                            fontWeight: '500',
                          }}
                        >
                          <span style={{ marginRight: '8px', color: '#d63384' }}>🧠</span>
                          AI Suggested Subtasks
                        </div>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                          }}
                          title='Close'
                        >
                          ✖
                        </button>
                      </div>

                      {/* Suggestion List */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          padding: '4px 8px',
                          marginBottom: '16px',
                        }}
                      >
                        {aiSuggestions.map((item, idx) => (
                          <label
                            key={idx}
                            style={{
                              display: 'flex ',
                              alignItems: 'flex-start',
                              gap: '2px',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type='checkbox'
                              checked={selectedSuggestions.includes(item.title)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedSuggestions((prev) =>
                                  checked
                                    ? [...prev, item.title]
                                    : prev.filter((t) => t !== item.title)
                                );
                              }}
                              style={{ display: 'flex !important', marginTop: '3px', flex: 1 }}
                            />
                            <span style={{ flex: 6 }}>{item.title}</span>
                          </label>
                        ))}
                      </div>

                      {/* Create Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={async () => {
                            for (const title of selectedSuggestions) {
                              try {
                                await createSubtask({
                                  taskId,
                                  title,
                                  createdBy: accountId,
                                }).unwrap();
                              } catch (err) {
                                console.error(`❌ Failed to create: ${title}`, err);
                              }
                            }
                            alert('✅ Created selected subtasks');
                            setShowSuggestionList(false);
                            setSelectedSuggestions([]);
                            await refetchSubtask();
                          }}
                          disabled={selectedSuggestions.length === 0}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: selectedSuggestions.length > 0 ? '#0052cc' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 500,
                            cursor: selectedSuggestions.length > 0 ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Create Selected
                        </button>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#eee',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: '#4caf50',
                      height: '100%',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#555' }}>
                  {progressPercent}% Done
                </div>
              </div>

              <div className='issue-table'>
                {isLoading ? (
                  <p>Loading subtasks...</p>
                ) : (
                  <div className='scrollable-work-table-wrapper'>
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Type
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 0)} />
                          </th>
                          <th>
                            Key
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 1)} />
                          </th>
                          <th>
                            Summary
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 2)} />
                          </th>
                          <th>
                            Priority
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 3)} />
                          </th>
                          <th>
                            Assignee
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 4)} />
                          </th>
                          <th>
                            Status
                            <div className='resizer' onMouseDown={(e) => handleResize(e, 5)} />
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {childWorkItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <img src={subtaskIcon} alt='Subtask' />
                            </td>
                            <td>
                              <span
                                className='hover-underline'
                                onClick={() =>
                                  navigate(`/project/${projectKey}/child-work/${item.key}`)
                                }
                                style={{ cursor: 'pointer' }}
                              >
                                {item.key}
                              </span>
                            </td>

                            <td
                              onClick={() => setEditingSummaryId(item.key)}
                              style={{
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                maxWidth: '300px',
                              }}
                            >
                              {editingSummaryId === item.key ? (
                                <input
                                  type='text'
                                  value={editableSummaries[item.key] ?? item.summary}
                                  onChange={(e) =>
                                    setEditableSummaries((prev) => ({
                                      ...prev,
                                      [item.key]: e.target.value,
                                    }))
                                  }
                                  onBlur={async () => {
                                    const newTitle = editableSummaries[item.key]?.trim();
                                    if (newTitle && newTitle !== item.summary) {
                                      try {
                                        await updateSubtask({
                                          id: item.key,
                                          assignedBy: parseInt(
                                            selectedAssignees[item.key] ?? item.assigneeId
                                          ),
                                          title: newTitle,
                                          description: item?.description ?? '',
                                          sprintId: item.sprintId ?? null,
                                          priority: item.priority,
                                          startDate: item.startDate,
                                          endDate: item.endDate,
                                          reporterId: item.reporterId,
                                          createdBy: accountId,
                                        }).unwrap();
                                        alert('✅ Updated summary');
                                        console.log('✅ Updated summary');
                                        await refetchSubtask();
                                        await refetchActivityLogs();
                                      } catch (err) {
                                        console.error('❌ Failed to update summary:', err);
                                        alert('❌ Failed to update summary');
                                      }
                                    }
                                    setEditingSummaryId(null);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                item.summary
                              )}
                            </td>

                            <td>
                              <select
                                value={item.priority}
                                onChange={async (e) => {
                                  const newPriority = e.target.value;
                                  try {
                                    await updateSubtask({
                                      id: item.key,
                                      assignedBy: parseInt(selectedAssignees[item.key] ?? item.assigneeId),
                                      title: editableSummaries[item.key] ?? item.summary,
                                      description: item?.description ?? '',
                                      sprintId: item.sprintId ?? null,
                                      priority: newPriority,
                                      startDate: item.startDate,
                                      endDate: item.endDate,
                                      reporterId: item.reporterId,
                                      createdBy: accountId,
                                    }).unwrap();
                                    console.log('✅ Updated priority');
                                    await refetchSubtask();
                                    await refetchActivityLogs();
                                  } catch (err) {
                                    console.error('❌ Failed to update priority:', err);
                                    alert('❌ Failed to update priority');
                                  }
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #ccc',
                                  backgroundColor: 'white',
                                }}
                              >
                                {isPriorityLoading ? (
                                  <option>Loading...</option>
                                ) : isPriorityError ? (
                                  <option>Error loading priorities</option>
                                ) : (
                                  priorityOptions?.data.map((priority) => (
                                    <option key={priority.id} value={priority.name}>
                                      {priority.label}
                                    </option>
                                  ))
                                )}
                              </select>
                            </td>

                            <td>
                              <div className='dropdown-wrapper'>
                                <select
                                  value={selectedAssignees[item.key] || item.assigneeId}
                                  onChange={async (e) => {
                                    const newAssigneeId = parseInt(e.target.value);
                                    setSelectedAssignees((prev) => ({
                                      ...prev,
                                      [item.key]: newAssigneeId.toString(),
                                    }));

                                    try {
                                      await updateSubtask({
                                        id: item.key,
                                        assignedBy: newAssigneeId,
                                        priority: item.priority,
                                        title: item.summary,
                                        description: item?.description ?? '',
                                        sprintId: item.sprintId ?? null,
                                        startDate: item.startDate,
                                        endDate: item.endDate,
                                        reporterId: item.reporterId,
                                        createdBy: accountId,
                                      }).unwrap();
                                      alert('✅ Updated subtask assignee');
                                      console.log('✅ Updated subtask assignee');
                                      await refetchSubtask();
                                    } catch (err) {
                                      console.error('❌ Failed to update subtask:', err);
                                      alert('❌ Failed to update subtask');
                                    }
                                  }}
                                  style={{
                                    width: '170px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                  }}
                                >
                                  <option value='0'>Unassigned</option>
                                  {projectMembers.map((member) => (
                                    <option key={member.accountId} value={member.accountId}>
                                      {member.accountName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>

                            <td>
                              {isUserAssignee(taskId, item.assigneeId) || canEdit ? (
                                <select
                                  value={item.status}
                                  onChange={(e) =>
                                    handleSubtaskStatusChange(item.key, e.target.value)
                                  }
                                  className={`custom-status-select status-${item.status
                                    .toLowerCase()
                                    .replace('_', '-')}`}
                                >
                                  {loadSubtaskStatus ? (
                                    <option>Loading...</option>
                                  ) : subtaskStatusError ? (
                                    <option>Error loading status</option>
                                  ) : (
                                    subtaskStatus?.data.map((status) => (
                                      <option key={status.id} value={status.name}>
                                        {status.label}
                                      </option>
                                    ))
                                  )}
                                </select>
                              ) : (
                                <span className={`custom-status-select status-${item.status.toLowerCase().replace('_', '-')}`}>
                                  {subtaskStatus?.data.find((status) => status.name === item.status)?.label ||
                                    item.status.replace('_', ' ')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {showSubtaskInput && (
                          <tr ref={subtaskInputRef}>
                            <td>
                              <img src={subtaskIcon} alt='Subtask' />
                            </td>
                            <td colSpan={5}>
                              <input
                                type='text'
                                placeholder='Enter subtask title...'
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
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
                                    try {
                                      await createSubtask({
                                        taskId,
                                        title: newSubtaskTitle,
                                        createdBy: accountId,
                                      }).unwrap();
                                      console.log('✅ Create successfully');
                                    } catch (err) {
                                      console.error('❌ Error to call createSubtask:', err);
                                    }

                                    setNewSubtaskTitle('');
                                    setShowSubtaskInput(false);
                                    await refetchSubtask();
                                  } catch (err) {
                                    console.error('Error create subtask:', err);
                                  }
                                }}
                                disabled={!newSubtaskTitle.trim()}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#0052cc',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: newSubtaskTitle.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >
                                Create
                              </button>
                              <button
                                onClick={() => {
                                  setShowSubtaskInput(false);
                                  setNewSubtaskTitle('');
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
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className='activity-section'>
              <h4 style={{ marginBottom: '8px' }}>Activity</h4>

              {/* Tabs */}
              <div className='activity-tabs'>
                <button
                  className={`activity-tab-btn ${activeTab === 'COMMENTS' ? 'active' : ''}`}
                  onClick={() => setActiveTab('COMMENTS')}
                >
                  Comments
                </button>
                <button
                  className={`activity-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
                  onClick={() => setActiveTab('HISTORY')}
                >
                  History
                </button>
              </div>

              {activeTab === 'HISTORY' && (
                <div className='history-list'>
                  {isActivityLogsLoading ? (
                    <div>Loading...</div>
                  ) : activityLogs.length === 0 ? (
                    <div>No history available.</div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className='history-item'>
                        <div className='history-header'>
                          <span className='history-user'>{log.createdByName}</span>
                          <span className='history-time'>
                            {new Date(log.createdAt).toLocaleTimeString()}{' '}
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='history-message'>{log.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'COMMENTS' ? (
                <>
                  <div className='comment-list'>
                    {isCommentsLoading ? (
                      <p>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No comments yet.</p>
                    ) : (
                      comments
                        .slice()
                        .reverse()
                        .map((comment: any) => (
                          <div key={comment.id} className='simple-comment'>
                            <div className='avatar-circle'>
                              <img src={comment.accountPicture || accountIcon} alt='avatar' />
                            </div>
                            <div className='comment-content'>
                              <div className='comment-header'>
                                <strong>
                                  {comment.accountName || `User #${comment.accountId}`}
                                </strong>{' '}
                                <span className='comment-time'>
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div className='comment-text'>{comment.content}</div>
                              {comment.accountId === accountId && (
                                <div className='comment-actions'>
                                  <button
                                    className='edit-btn'
                                    onClick={async () => {
                                      const newContent = prompt(
                                        '✏ Edit your comment:',
                                        comment.content
                                      );
                                      if (newContent && newContent !== comment.content) {
                                        try {
                                          await updateTaskComment({
                                            id: comment.id,
                                            taskId,
                                            accountId,
                                            content: newContent,
                                            createdBy: accountId,
                                          }).unwrap();
                                          alert('✅ Comment updated');
                                          await refetchComments();
                                          await refetchActivityLogs();
                                        } catch (err) {
                                          console.error('❌ Failed to update comment', err);
                                          alert('❌ Update failed');
                                        }
                                      }
                                    }}
                                  >
                                    ✏ Edit
                                  </button>
                                  <button
                                    className='delete-btn'
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          '🗑️ Are you sure you want to delete this comment?'
                                        )
                                      ) {
                                        try {
                                          await deleteTaskComment({
                                            id: comment.id,
                                            createdBy: accountId,
                                          }).unwrap();
                                          alert('🗑️ Deleted successfully');
                                          await refetchComments();
                                          await refetchActivityLogs();
                                        } catch (err) {
                                          console.error('❌ Failed to delete comment', err);
                                          alert('❌ Delete failed');
                                        }
                                      }
                                    }}
                                  >
                                    🗑 Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className='simple-comment-input'>
                    <textarea
                      placeholder='Add a comment...'
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    <button
                      disabled={!commentContent.trim()}
                      onClick={async () => {
                        try {
                          if (!accountId || isNaN(accountId)) {
                            alert('❌ User not identified. Please log in again.');
                            return;
                          }
                          await createTaskComment({
                            taskId,
                            accountId,
                            content: commentContent.trim(),
                            createdBy: accountId,
                          }).unwrap();

                          setCommentContent('');
                          alert('✅ Comment posted ');
                          await refetchComments();
                          await refetchActivityLogs();
                        } catch (err: any) {
                          console.error('❌ Failed to post comment:', err);
                          alert('❌ Failed to post comment: ' + JSON.stringify(err?.data || err));
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
                </>
              ) : (
                <div className='activity-placeholder'></div>
              )}
            </div>
          </div>

          <div className='details-panel'>
            <div className='details-content'>
              <div className='panel-header'>
                {isUserAssignee(taskId) || canEdit ? (
                  <select
                    value={status}
                    onChange={(e) => handleTaskStatusChange(e.target.value)}
                    className={`custom-status-select status-${status.toLowerCase().replace('_', '-')}`}
                  >
                    {loadTaskStatus ? (
                      <option>Loading...</option>
                    ) : taskStatusError ? (
                      <option>Error loading status</option>
                    ) : (
                      taskStatus?.data.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <span className={`custom-status-select status-${status.toLowerCase().replace('_', '-')}`}>
                    {taskStatusLabel}
                  </span>
                )}
                {taskData?.warnings && taskData.warnings.length > 0 && (
                  <div className='warning-box'>
                    {taskData.warnings.map((warning, idx) => (
                      <div key={idx} className='warning-text'>
                        ⚠️ {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='detail-item'>
                <label>Assignee</label>
                {canEdit ? (
                  <div className='multi-select-dropdown'>
                    {/* Hiển thị danh sách đã chọn */}
                    <div
                      className='selected-list'
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      {(taskAssignmentMap[taskId] ?? []).map((assignment) => (
                        <span className='selected-tag' key={assignment.accountId}>
                          {assignment.accountFullname ?? 'Unknown'}
                          <button
                            className='remove-tag'
                            onClick={async () => {
                              try {
                                await deleteTaskAssignment({
                                  taskId: taskId,
                                  assignmentId: assignment.id,
                                }).unwrap();

                                setTaskAssignmentMap((prev) => ({
                                  ...prev,
                                  [taskId]: prev[taskId].filter(
                                    (a) => a.accountId !== assignment.accountId
                                  ),
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
                    </div>

                    {/* Dropdown chọn thêm */}
                    <div className='dropdown-select-wrapper'>
                      <select
                        style={{ width: '150px' }}
                        value={selectedAssigneeId}
                        onChange={async (e) => {
                          const selectedId = parseInt(e.target.value);
                          if (!selectedId) return;

                          try {
                            await createTaskAssignment({ taskId, accountId: selectedId }).unwrap();
                            const data = await getTaskAssignments(taskId).unwrap();
                            setTaskAssignmentMap((prev) => ({ ...prev, [taskId]: data }));
                            setSelectedAssigneeId('');
                          } catch (err) {
                            console.error('Error assigning task', err);
                          }
                        }}
                      >
                        <option value='' disabled>
                          + Add assignee
                        </option>

                        {projectMembers
                          ?.filter(
                            (m) =>
                              !(taskAssignmentMap[taskId] ?? []).some(
                                (a) => a.accountId === m.accountId
                              )
                          )
                          .map((member) => (
                            <option key={member.accountId} value={member.accountId}>
                              {member.accountName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <span>
                    {isAssigneeLoading
                      ? 'Loading...'
                      : assignees.length === 0
                        ? 'None'
                        : assignees.map((assignee) => (
                          <span key={assignee.id} style={{ display: 'block' }}>
                            {assignee.accountFullname}
                          </span>
                        ))}
                  </span>
                )}
              </div>

              {isEditingLabel ? (
                <div ref={labelRef} className='flex flex-col gap-2 w-full relative'>
                  <div className='flex flex-col gap-2 w-full relative'>
                    <label className='font-semibold'>Labels</label>

                    {/* Tag list + input */}
                    <div
                      className='border rounded px-2 py-1 flex flex-wrap items-center gap-2 min-h-[42px] focus-within:ring-2 ring-blue-400'
                      onClick={() => setDropdownOpen(true)}
                    >
                      {workItemLabels.map((label) => (
                        <span
                          key={label.id}
                          className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1'
                        >
                          {label.labelName}
                          <button
                            onClick={() => handleDeleteWorkItemLabel(label.id)}
                            className='text-red-500 hover:text-red-700 font-bold text-sm'
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        value={newLabelName}
                        onChange={(e) => {
                          setNewLabelName(e.target.value);
                          setDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateLabelAndAssign();
                        }}
                        placeholder='Type to search or add'
                        className='flex-1 min-w-[100px] border-none outline-none py-1'
                        autoFocus
                      />
                    </div>

                    {/* Dropdown suggestion */}
                    {dropdownOpen && filteredLabels.length > 0 && (
                      <ul className='absolute top-full mt-1 w-full bg-white border rounded shadow z-10 max-h-48 overflow-auto'>
                        <li className='px-3 py-1 font-semibold text-gray-600 border-b'>
                          All labels
                        </li>
                        {filteredLabels.map((label) => (
                          <li
                            key={label.id}
                            onClick={() => handleCreateLabelAndAssign(label.name)}
                            className='px-3 py-1 hover:bg-blue-100 cursor-pointer'
                          >
                            {label.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className='detail-item' onClick={() => setIsEditingLabel(true)}>
                  <label className='font-semibold'>Labels</label>
                  <span>
                    {isLabelLoading
                      ? 'Loading...'
                      : workItemLabels.length === 0
                        ? 'None'
                        : workItemLabels.map((label) => label.labelName).join(', ')}
                  </span>
                </div>
              )}

              <div className='detail-item'>
                <label>Parent</label>
                <span>{subtaskData[0]?.taskId ?? 'None'}</span>
              </div>

              <div className='detail-item'>
                <label>Sprint</label>
                {isProjectSprintsLoading ? (
                  <span>Loading sprints...</span>
                ) : isProjectSprintsError ? (
                  <span>Error loading sprints</span>
                ) : projectSprints.length === 0 ? (
                  <span>No sprints available</span>
                ) : (
                  <select
                    style={{ width: '150px' }}
                    value={sprintId ?? 'none'}
                    onChange={(e) => {
                      const val = e.target.value === 'none' ? null : Number(e.target.value);
                      setSprintId(val);
                      if (val !== null) {
                        handleSprintTaskChange(val);
                      }
                    }}
                  >
                    <option value="none">No Sprint</option>
                    {projectSprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className='detail-item'>
                <label>Priority</label>
                {canEdit ? (
                  <select
                    value={taskData?.priority}
                    onChange={async (e) => {
                      const newPriority = e.target.value;
                      try {
                        await updateTaskPriority({
                          id: taskId,
                          priority: newPriority,
                          createdBy: accountId,
                        }).unwrap();
                        await refetchTask();
                        await refetchActivityLogs();
                      } catch (err) {
                        console.error('❌ Error updating priority:', err);
                      }
                    }}
                    style={{
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      width: '150px',
                    }}
                  >
                    {priorityTaskOptions?.data?.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                ) : (
                  <span>{taskData?.priority ?? 'NONE'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Start date</label>
                {canEdit ? (
                  <input
                    type='date'
                    value={plannedStartDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;
                      setPlannedStartDate(fullDate);
                    }}
                    onBlur={() => handlePlannedStartDateTaskChange()}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{plannedStartDate?.slice(0, 10) ?? 'N/A'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Due date</label>
                {canEdit ? (
                  <input
                    type='date'
                    value={plannedEndDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;
                      setPlannedEndDate(fullDate);
                    }}
                    onBlur={() => handlePlannedEndDateTaskChange()}
                    style={{ width: '150px' }}
                  />
                ) : (
                  <span>{plannedEndDate?.slice(0, 10) ?? 'N/A'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Reporter</label>
                {canEdit ? (
                  <select
                    value={selectedReporter ?? 0}
                    onChange={async (e) => {
                      const newReporter = parseInt(e.target.value);
                      setSelectedReporter(newReporter);

                      try {
                        await updateTaskReporter({
                          id: taskId,
                          reporterId: newReporter,
                          createdBy: accountId,
                        }).unwrap();
                        alert('✅ Update successfully');
                        await refetchTask();
                        await refetchActivityLogs();
                      } catch (err) {
                        alert('❌ Update failed');
                        console.error(err);
                      }
                    }}
                    style={{ width: '150px' }}
                  >
                    <option value={0}>Unassigned</option>
                    {projectMembers?.map((member) => (
                      <option key={member.accountId} value={member.accountId}>
                        {member.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{taskData?.reporterName ?? 'None'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Time Tracking</label>
                <span
                  onClick={() => setIsWorklogOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Log Work
                </span>
              </div>
              <WorkLogModal
                open={isWorklogOpen}
                onClose={() => setIsWorklogOpen(false)}
                workItemId={taskId}
                type='task'
              />

              <div className='detail-item'>
                <label>Connections</label>
                <span
                  onClick={() => setIsDependencyOpen(true)}
                  className='text-blue-600 hover:underline cursor-pointer'
                >
                  Manage Dependencies
                </span>
              </div>
              <TaskDependency
                open={isDependencyOpen}
                onClose={() => setIsDependencyOpen(false)}
                workItemId={taskId}
                type='task'
              />
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteFile}
        title="Delete this attachment?"
        message="Once you delete, it's gone for good."
      />
    </div>
  );
};

export default WorkItemDetail;
