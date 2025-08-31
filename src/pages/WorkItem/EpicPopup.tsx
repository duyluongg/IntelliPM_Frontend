import React from 'react';
import { useState, useRef } from 'react';
import './EpicPopup.css';
import Swal from 'sweetalert2';
import WorkItem from './WorkItem';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../services/AuthContext';
import {useGetEpicByIdQuery,useUpdateEpicStatusMutation,useUpdateEpicMutation,} from '../../services/epicApi';
import epicIcon from '../../assets/icon/type_epic.svg';
import taskIcon from '../../assets/icon/type_task.svg';
import bugIcon from '../../assets/icon/type_bug.svg';
import storyIcon from '../../assets/icon/type_story.svg';
import deleteIcon from '../../assets/delete.png';
import accountIcon from '../../assets/account.png';
import {useGetTasksByEpicIdQuery,useUpdateTaskStatusMutation,useCreateTaskMutation,useUpdateTaskTitleMutation,useUpdateTaskPriorityMutation,} from '../../services/taskApi';
import {useGetWorkItemLabelsByEpicQuery,useDeleteWorkItemLabelMutation,} from '../../services/workItemLabelApi';
import {useGetEpicFilesByEpicIdQuery,useUploadEpicFileMutation,useDeleteEpicFileMutation} from '../../services/epicFileApi';
import { type TaskAssignmentDTO, useLazyGetTaskAssignmentsByTaskIdQuery,useCreateTaskAssignmentQuickMutation,useDeleteTaskAssignmentMutation} from '../../services/taskAssignmentApi';
import { useGetProjectMembersQuery } from '../../services/projectMemberApi';
import { useGetSprintsByProjectIdQuery } from '../../services/sprintApi';
import {useGetCommentsByEpicIdQuery,useCreateEpicCommentMutation,useUpdateEpicCommentMutation,useDeleteEpicCommentMutation} from '../../services/epicCommentApi';
import {useGetActivityLogsByEpicIdQuery} from '../../services/activityLogApi';
import {useCreateLabelAndAssignMutation,useGetLabelsByProjectIdQuery} from '../../services/labelApi';
import { useGetCategoriesByGroupQuery } from '../../services/dynamicCategoryApi';
import { useGenerateTasksByEpicByAIMutation, type AiSuggestedTask } from '../../services/taskAiApi';
import DeleteConfirmModal from '../WorkItem/DeleteConfirmModal';
import { useGetProjectByIdQuery } from '../../services/projectApi';
import { Tooltip } from 'react-tooltip';
import aiIcon from '../../assets/icon/ai.png';
import AiResponseEvaluationPopup from '../../components/AiResponse/AiResponseEvaluationPopup';

interface EpicPopupProps {
  id: string;
  onClose: () => void;
}

const EpicPopup: React.FC<EpicPopupProps> = ({ id, onClose }) => {
  const { data: epic, isLoading, isError, refetch: refetchEpic } = useGetEpicByIdQuery(id);
  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useGetTasksByEpicIdQuery(id);
  const { user } = useAuth();
  const canEdit = user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER';
  const [status, setStatus] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [epicId, setEpicId] = React.useState('');
  const [updateEpicStatus] = useUpdateEpicStatusMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTaskPriority] = useUpdateTaskPriorityMutation();
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showTaskInput, setShowTaskInput] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const taskInputRef = React.useRef<HTMLTableRowElement>(null);
  const [newTaskType, setNewTaskType] = React.useState<'TASK' | 'BUG' | 'STORY'>('TASK');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [hoveredFileId, setHoveredFileId] = React.useState<number | null>(null);
  const { data: attachments = [], refetch: refetchAttachments } = useGetEpicFilesByEpicIdQuery(id);
  const [uploadEpicFile] = useUploadEpicFileMutation();
  const [deleteEpicFile] = useDeleteEpicFileMutation();
  const accountId = parseInt(localStorage.getItem('accountId') || '0');
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
  const [taskAssignmentMap, setTaskAssignmentMap] = React.useState<
    Record<string, TaskAssignmentDTO[]>
  >({});
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
  const [commentContent, setCommentContent] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'COMMENTS' | 'HISTORY'>('COMMENTS');
  const [updateEpicComment] = useUpdateEpicCommentMutation();
  const [deleteEpicComment] = useDeleteEpicCommentMutation();
  const [createEpicComment] = useCreateEpicCommentMutation();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const [deleteWorkItemLabel] = useDeleteWorkItemLabelMutation();
  const [generateTasksByEpicByAI, { isLoading: loadingSuggest }] =
    useGenerateTasksByEpicByAIMutation();
  const [aiSuggestions, setAiSuggestions] = React.useState<AiSuggestedTask[]>([]);
  const [showSuggestionList, setShowSuggestionList] = React.useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<AiSuggestedTask[]>([]);
  const [isEvaluationPopupOpen, setIsEvaluationPopupOpen] = useState(false);
  const [aiResponseJson, setAiResponseJson] = useState<string>('');
  const [fileError, setFileError] = useState('');
  const {
    data: taskTypeOptions,
    isLoading: isTaskTypeLoading,
    isError: isTaskTypeError,
  } = useGetCategoriesByGroupQuery('task_type');
  const {
    data: taskPriorityOptions,
    isLoading: isTaskPriorityLoading,
    isError: isTaskPriorityError,
  } = useGetCategoriesByGroupQuery('task_priority');
  const {
    data: taskStatusOptions,
    isLoading: isTaskStatusLoading,
    isError: isTaskStatusError,
  } = useGetCategoriesByGroupQuery('task_status');
  const {
    data: epicStatusOptions,
    isLoading: isEpicStatusLoading,
    isError: isEpicStatusError,
  } = useGetCategoriesByGroupQuery('epic_status');
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<{ [key: number]: string }>({});

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetCommentsByEpicIdQuery(id!, {
    skip: !id,
  });
  const { data: sprints = [] } = useGetSprintsByProjectIdQuery(epic?.projectId!, {
    skip: !epic?.projectId,
  });

  const {
    data: projectData,
    isLoading: isProjectDataLoading,
    refetch: refetchProjectData,
  } = useGetProjectByIdQuery(epic?.projectId!, {
    skip: !epic?.projectId,
  });

  const {
    data: activityLogs = [],
    isLoading: isActivityLogsLoading,
    refetch: refetchActivityLogs,
  } = useGetActivityLogsByEpicIdQuery(epic?.id!, {
    skip: !epic?.id,
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
          console.error(`Failed to fetch assignees for ${t.id}:`, err);
        }
      }
      setTaskAssignmentMap(result);
    };

    if (tasks.length > 0) fetchAllTaskAssignments();
  }, [tasks]);

  const { data: projectMembers = [] } = useGetProjectMembersQuery(epic?.projectId!, {
    skip: !epic?.projectId,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ fileId: number; createdBy: number } | null>(null);

  const openDeleteModal = (fileId: number, createdBy: number) => {
    setDeleteInfo({ fileId, createdBy: accountId });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!deleteInfo) return;
    try {
      await deleteEpicFile({ id: deleteInfo.fileId, createdBy: accountId }).unwrap();
      await refetchAttachments();
      await refetchActivityLogs();
    } catch (error) {
      console.error('Error delete file:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteInfo(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEpicStatus({ id, status: newStatus, createdBy: accountId }).unwrap();
      await refetchActivityLogs();
      await refetchTasks();
      setStatus(newStatus);
    } catch (error) {
      console.error('Error update epic status', error);
    }
  };

  const canEditStatus = (assigneeIds: number[] | number | null) => {
    const currentUserId = accountId.toString();
    const isAssignee = Array.isArray(assigneeIds)
      ? assigneeIds.map((id) => id.toString()).includes(currentUserId)
      : assigneeIds?.toString() === currentUserId;
    return isAssignee || canEdit;
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

  if (newStartDate || newEndDate) {
    const effectiveStartDate = newStartDate ?? epic.startDate;
    const effectiveEndDate = newEndDate ?? epic.endDate;

    if (effectiveStartDate && effectiveEndDate && new Date(effectiveStartDate) >= new Date(effectiveEndDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Dates',
        html: 'Epic Start Date must be before Due Date!',
        width: 350,
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      if (newStartDate) setNewStartDate(epic.startDate);
      if (newEndDate) setNewEndDate(epic.endDate);
      return;
    }

    // compare date project
    if (projectData?.data?.startDate && effectiveStartDate && new Date(effectiveStartDate) < new Date(projectData.data.startDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Start Date',
        html: 'Epic Start Date cannot be before Project Start Date!',
        width: 350,
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      setNewStartDate(epic.startDate);
      return;
    }

    if (projectData?.data?.endDate && effectiveEndDate && new Date(effectiveEndDate) > new Date(projectData.data.endDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Due Date',
        html: 'Epic Due Date cannot be after Project End Date!',
        width: 350,
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      setNewEndDate(epic.endDate);
      return;
    }

    // compare task date
    const dateValidation = await validateTaskDates(effectiveStartDate, effectiveEndDate);
    if (!dateValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Epic Dates',
        text: dateValidation.message,
        width: 350,
        confirmButtonColor: 'rgba(44, 104, 194, 1)',
        customClass: {
          title: 'small-title',
          popup: 'small-popup',
          icon: 'small-icon',
          htmlContainer: 'small-html',
        },
      });
      if (newStartDate) setNewStartDate(epic.startDate);
      if (newEndDate) setNewEndDate(epic.endDate);
      return;
    }
  }

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
        createdBy: accountId,
      },
    }).unwrap();

    console.log('Epic updated');
    await Promise.all([refetchActivityLogs(), refetchTasks(), refetchEpic()]);
  } catch (err) {
    console.error('Failed to update epic', err);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'Failed to update epic.',
      width: 350,
      confirmButtonColor: 'rgba(44, 104, 194, 1)',
      customClass: {
        title: 'small-title',
        popup: 'small-popup',
        icon: 'small-icon',
        htmlContainer: 'small-html',
      },
    });
    if (newStartDate) setNewStartDate(epic.startDate);
    if (newEndDate) setNewEndDate(epic.endDate);
  }
};

  const validateTaskDates = async (newStartDate: string, newEndDate: string) => {
    if (!tasks || tasks.length === 0) return { isValid: true };

    const epicStart = new Date(newStartDate);
    const epicEnd = new Date(newEndDate);

    for (const task of tasks) {
      const taskStart = task.plannedStartDate ? new Date(task.plannedStartDate) : null;
      const taskEnd = task.plannedEndDate ? new Date(task.plannedEndDate) : null;

      if (taskStart) {
        if (taskStart < epicStart) {
          return {
            isValid: false,
            invalidTaskId: task.id,
            message: `Task with ID ${task.id} has start date (${task.plannedStartDate.slice(0, 10)}) before epic start date (${newStartDate.slice(0, 10)})!`,
          };
        }
        if (taskStart > epicEnd) {
          return {
            isValid: false,
            invalidTaskId: task.id,
            message: `Task with ID ${task.id} has start date (${task.plannedStartDate.slice(0, 10)}) after epic end date (${newEndDate.slice(0, 10)})!`,
          };
        }
      }

      if (taskEnd) {
        if (taskEnd < epicStart) {
          return {
            isValid: false,
            invalidTaskId: task.id,
            message: `Task with ID ${task.id} has end date (${task.plannedEndDate.slice(0, 10)}) before epic start date (${newStartDate.slice(0, 10)})!`,
          };
        }
        if (taskEnd > epicEnd) {
          return {
            isValid: false,
            invalidTaskId: task.id,
            message: `Task with ID ${task.id} has end date (${task.plannedEndDate.slice(0, 10)}) after epic end date (${newEndDate.slice(0, 10)})!`,
          };
        }
      }
    }
    return { isValid: true };
  };

  const {
    data: workItemLabels = [],
    isLoading: isLabelLoading,
    refetch: refetchWorkItemLabels,
  } = useGetWorkItemLabelsByEpicQuery(id, { skip: !id });

  const {
    data: projectLabels = [],
    isLoading: isProjectLabelsLoading,
    refetch: refetchProjectLabels,
  } = useGetLabelsByProjectIdQuery(epic?.projectId!, {
    skip: !epic?.projectId,
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

    if (!epic?.projectId || !epicId || !nameToAssign) {
      alert('Missing projectId, taskId or label name!');
      return;
    }

    try {
      await createLabelAndAssign({
        projectId: epic.projectId,
        name: nameToAssign,
        taskId: null,
        epicId,
        subtaskId: null,
      }).unwrap();

      setNewLabelName('');
      setIsEditingLabel(false);
      await Promise.all([refetchWorkItemLabels?.(), refetchProjectLabels?.()]);
    } catch (error) {
      console.error('Failed to create and assign label:', error);
    }
  };

  const handleSave = async (id: number, originalContent: string) => {
    const newContent = editedContent[id];
    if (newContent && newContent !== originalContent) {
      try {
        await updateEpicComment({
          id,
          epicId,
          accountId,
          content: newContent,
          createdBy: accountId,
        }).unwrap();
        await Promise.all([refetchComments(), refetchActivityLogs()]);
        setEditCommentId(null);
      } catch (err) {
        console.error('Failed to update comment', err);
      }
    } else {
      setEditCommentId(null);
    }
  };

  {
    comments.map((comment) => (
      <div key={comment.id}>
        {editCommentId === comment.id ? (
          <>
            <textarea
              value={editedContent[comment.id] || comment.content}
              onChange={(e) => setEditedContent({ ...editedContent, [comment.id]: e.target.value })}
            />
            <button onClick={() => handleSave(comment.id, comment.content)}>Save</button>
            <button onClick={() => setEditCommentId(null)}>Cancel</button>
          </>
        ) : (
          <>
            <span>{comment.content}</span>
            <button onClick={() => setEditCommentId(comment.id)}>✏ Edit</button>
          </>
        )}
      </div>
    ));
  }

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
      console.error(':', error);
    }
  };

  const getTypeIcon = (taskTypeName: string) => {
    return taskTypeOptions?.data?.find((opt) => opt.name === taskTypeName)?.iconLink || '';
  };

  if (isLoading || !epic) {
    return (
      <div className='modal-overlay'>
        <div className='work-item-modal'>Loading Epic...</div>
      </div>
    );
  }

  const handleCloseEvaluationPopup = () => {
    setIsEvaluationPopupOpen(false);
    setAiResponseJson('');
  };

  const handleEvaluationSubmitSuccess = (aiResponseId: number) => {
    console.log('AI Response ID:', aiResponseId);
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='work-item-modal' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='modal-header'>
          <div className='issue-header'>
            <span className='issue-type'>
              <span className='issue-icon-wrapper'>
                <img src={epicIcon} alt='Epic' />
              </span>
              <span
                className='issue-key'
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/project/epic/${epic.id}`)}
              >
                {epic.id}
              </span>
            </span>
            <input
              type='text'
              className='issue-summary'
              placeholder='Enter epic name'
              defaultValue={epic.name}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setNewName(e.target.value);
                } else {
                  alert('Max 100 characters!');
                }
              }}
              onBlur={handleUpdateEpic}
              disabled={!canEdit}
              style={{ width: 600 }}
            />
            <div className='modal-container'>
              <button className='close-btn' onClick={onClose}>
                ✖
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='modal-content'>
          {/* Left - Main Section */}
          <div className='main-section'>
            <div className='add-menu-wrapper' style={{ marginBottom: '8px' }}>
              <button className='btn-add' onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}>
                + Add
              </button>

              {isAddDropdownOpen && (
                <div className='add-dropdown'>
                  <div className='add-item' onClick={() => fileInputRef.current?.click()}>
                    📁 Attachment
                  </div>

                  {(user?.role === 'PROJECT_MANAGER' || user?.role === 'TEAM_LEADER') && (
                    <div
                      className='add-item'
                      onClick={() => {
                        setShowTaskInput(true);
                        setIsAddDropdownOpen(false);
                        setTimeout(() => {
                          taskInputRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }, 100);
                      }}
                    >
                      📝 Task
                    </div>
                  )}
                </div>
              )}

              <input
                type='file'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setFileError('File size exceeds 10MB limit');
                      setIsAddDropdownOpen(false);
                      return;
                    }
                    try {
                      setIsAddDropdownOpen(false);
                      await uploadEpicFile({
                        epicId: id,
                        title: file.name,
                        file,
                        createdBy: accountId,
                      }).unwrap();
                      await refetchAttachments();
                      await refetchActivityLogs();
                    } catch (err) {
                      console.error('Upload failed:', err);
                    }
                  }
                }}
              />
              {fileError && (
                <span style={{ color: 'red', display: 'block', marginTop: '5px' }}>
                  {fileError}
                </span>
              )}
            </div>

            <div className='field-group'>
              <label>Description</label>
              <textarea
                value={newDescription ?? epic?.description ?? ''}
                placeholder='Enter epic description'
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleUpdateEpic}
                disabled={!canEdit}
              />
            </div>

            {attachments.length > 0 && (
              <div className='attachments-section'>
                <label className='block font-semibold mb-2'>
                  Attachments <span>({attachments.length})</span>
                </label>

                <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100'>
                  {attachments.map((file) => (
                    <div
                      className='relative flex-shrink-0 w-36 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200'
                      key={file.id}
                      onMouseEnter={() => setHoveredFileId(file.id)}
                      onMouseLeave={() => setHoveredFileId(null)}
                    >
                      <a
                        href={file.urlFile}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block text-gray-800 no-underline'
                      >
                        <div className='h-24 flex items-center justify-center bg-gray-100 rounded-t-lg overflow-hidden'>
                          {file.urlFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={file.urlFile}
                              alt={file.title}
                              className='w-[100%] h-[100%] object-cover rounded-lg'
                            />
                          ) : (
                            <div className='flex items-center justify-center h-full w-full bg-gray-200'>
                              <span className='text-xs font-medium text-gray-600 px-2 text-center'>
                                {file.title.slice(0, 15)}...
                              </span>
                            </div>
                          )}
                        </div>
                        <div className='p-1'>
                          <div className='truncate text-sm font-medium' title={file.title}>
                            {file.title}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(file.createdAt).toLocaleString('vi-VN', { hour12: false })}
                          </div>
                        </div>
                      </a>

                      {hoveredFileId === file.id && (
                        <button
                          onClick={() => openDeleteModal(file.id, file.createdBy)}
                          className='absolute top-1 right-1 bg-white rounded-full shadow p-1 hover:bg-gray-200'
                          title='Delete file'
                        >
                          <img src={deleteIcon} alt='Delete' className='w-5 h-5' />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='field-group'>
              <label>Child Work Items</label>

              <div className='bg-white rounded-lg shadow-md p-4 mb-4'>
                {/* Header */}
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2 text-base font-semibold text-gray-700'>
                    <svg
                      className='w-5 h-5 text-blue-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    <span>Create suggested work items</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const result = await generateTasksByEpicByAI(epicId).unwrap();
                        setAiResponseJson(JSON.stringify(result));
                        setAiSuggestions(result);
                        setShowSuggestionList(true);
                        setSelectedSuggestions([]);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 px-3 py-2 rounded-lg text-sm text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105'
                    data-tooltip-id='suggest-ai-tooltip'
                    data-tooltip-content='Generate tasks using AI'
                  >
                    {loadingSuggest ? (
                      <div className='flex items-center gap-2'>
                        <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
                        <span>Suggesting...</span>
                      </div>
                    ) : (
                      <>
                        <img src={aiIcon} alt='AI Icon' className='w-5 h-5 object-contain' />
                        <span>Suggest</span>
                      </>
                    )}
                    <Tooltip id='suggest-ai-tooltip' />
                  </button>
                </div>

                {/* Suggestions */}
                {showSuggestionList && (
                  <div
                    className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in'
                    onClick={() => setShowSuggestionList(false)}
                  >
                    <div
                      className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all duration-300 animate-slide-up'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className='bg-gradient-to-r from-purple-600 to-blue-500 p-6 flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                          <img src={aiIcon} alt='AI Icon' className='w-8 h-8 object-contain' />
                          <h2 className='text-2xl font-bold text-white'>AI-Suggested Tasks</h2>
                        </div>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          className='text-white text-xl font-semibold hover:text-gray-200 transition-colors duration-200'
                          title='Close'
                        >
                          ✕
                        </button>
                      </div>
                      <div className='p-6 overflow-y-auto max-h-[60vh]'>
                        {aiSuggestions.length === 0 ? (
                          <div className='text-center py-8 text-gray-500 text-lg'>
                            No AI-suggested tasks available. Try again later!
                          </div>
                        ) : (
                          <div className='overflow-x-auto'>
                            <table className='w-full border-separate border-spacing-0'>
                              <thead className='sticky top-0 bg-gray-50 shadow-sm'>
                                <tr>
                                  <th className='p-4 text-left text-sm font-semibold text-gray-700 w-16'>
                                    Select
                                  </th>
                                  <th className='p-4 text-left text-sm font-semibold text-gray-700 w-24'>
                                    Type
                                  </th>
                                  <th className='p-4 text-left text-sm font-semibold text-gray-700'>
                                    Title
                                  </th>
                                  <th className='p-4 text-left text-sm font-semibold text-gray-700'>
                                    Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {aiSuggestions.map((item, index) => (
                                  <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                      } hover:bg-purple-50 transition-colors duration-200`}
                                  >
                                    <td className='p-4 border-b border-gray-200'>
                                      <input
                                        type='checkbox'
                                        checked={selectedSuggestions.includes(item)}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setSelectedSuggestions((prev) =>
                                            checked
                                              ? [...prev, item]
                                              : prev.filter((s) => s.title !== item.title)
                                          );
                                        }}
                                        className='h-5 w-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer'
                                      />
                                    </td>
                                    <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                                      {item.type}
                                    </td>
                                    <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                                      {item.title}
                                    </td>
                                    <td className='p-4 border-b border-gray-200 text-sm text-gray-800'>
                                      {item.description}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      <div className='p-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-200'>
                        <button
                          onClick={() => setShowSuggestionList(false)}
                          className='px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105'
                        >
                          Cancel
                        </button>
                        {canEdit ? (
                          <button
                            onClick={async () => {
                              setLoadingCreate(true);
                              try {
                                for (const suggestion of selectedSuggestions) {
                                  await createTask({
                                    reporterId: accountId,
                                    projectId: parseInt(projectId),
                                    epicId: epic.id,
                                    title: suggestion.title,
                                    description: suggestion.description,
                                    type: suggestion.type,
                                    createdBy: accountId,
                                  }).unwrap();
                                }
                                setShowSuggestionList(false);
                                setSelectedSuggestions([]);
                                await refetchTasks();
                                await refetchActivityLogs();
                                setIsEvaluationPopupOpen(true);
                              } catch (err) {
                                console.error('Failed to create tasks', err);
                              } finally {
                                setLoadingCreate(false);
                              }
                            }}
                            disabled={selectedSuggestions.length === 0 || loadingCreate}
                            className={`px-6 py-2 rounded-lg text-white font-semibold shadow-md transition-all duration-200 transform hover:scale-105 ${selectedSuggestions.length === 0 || loadingCreate
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 hover:shadow-lg'
                              }`}
                          >
                            {loadingCreate ? (
                              <div className='flex items-center gap-2'>
                                <svg
                                  className='animate-spin w-5 h-5 text-white'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                >
                                  <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                  />
                                  <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                                  />
                                </svg>
                                <span>Creating...</span>
                              </div>
                            ) : (
                              'Create Selected'
                            )}
                          </button>
                        ) : (
                          <div className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-all duration-200 transform hover:scale-105'>
                            Only Team Leader, Project Manager can create tasks.
                          </div>
                        )}
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
                <div className='scrollable-table-wrapper'>
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
                      {loadingTasks ? (
                        <tr>
                          <td colSpan={6}>Loading tasks...</td>
                        </tr>
                      ) : tasks.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No tasks found for this epic.</td>
                        </tr>
                      ) : (
                        tasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <img
                                src={getTypeIcon(task.type)}
                                alt={task.type}
                                title={
                                  taskTypeOptions?.data?.find((opt) => opt.name === task.type)
                                    ?.label ??
                                  task.type.charAt(0).toUpperCase() +
                                  task.type.slice(1).toLowerCase()
                                }
                                className='w-5 h-5'
                              />
                            </td>

                            <td>
                              <a
                                onClick={() => setSelectedTaskId(task.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                {task.id}
                              </a>
                            </td>

                            <td
                              onClick={() => canEdit && setEditingTaskId(task.id)}
                              style={{
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                maxWidth: '300px',
                              }}
                            >
                              {editingTaskId === task.id ? (
                                canEdit ? (
                                  <input
                                    type='text'
                                    value={editableTitles[task.id] ?? task.title}
                                    onChange={(e) =>
                                      setEditableTitles((prev) => ({
                                        ...prev,
                                        [task.id]: e.target.value,
                                      }))
                                    }
                                    onBlur={async () => {
                                      const newTitle = editableTitles[task.id]?.trim();
                                      if (newTitle && newTitle !== task.title) {
                                        try {
                                          await updateTaskTitle({
                                            id: task.id,
                                            title: newTitle,
                                            createdBy: accountId,
                                          }).unwrap();
                                          await refetchTasks();
                                          await refetchActivityLogs();
                                        } catch (err) {
                                          console.error('Failed to update title:', err);
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
                                )
                              ) : (
                                task.title
                              )}
                            </td>

                            <td>
                              {canEdit ? (
                                <select
                                  value={task.priority}
                                  onChange={async (e) => {
                                    const newPriority = e.target.value;
                                    try {
                                      await updateTaskPriority({
                                        id: task.id,
                                        priority: newPriority,
                                        createdBy: accountId,
                                      }).unwrap();
                                      await refetchTasks();
                                      await refetchActivityLogs();
                                    } catch (err) {
                                      console.error('Error updating priority:', err);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                  }}
                                >
                                  {taskPriorityOptions?.data?.map((opt) => (
                                    <option key={opt.name} value={opt.name}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <>
                                  {taskPriorityOptions?.data?.find(
                                    (opt) => opt.name === task.priority
                                  )?.label ||
                                    task.priority ||
                                    'NONE'}
                                </>
                              )}
                            </td>

                            <td>
                              {canEdit ? (
                                <div className='multi-select-dropdown'>
                                  <div
                                    className='selected-list'
                                    style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                                  >
                                    {(taskAssignmentMap[task.id] ?? []).map((assignment) => (
                                      <span className='selected-tag' key={assignment.accountId}>
                                        {assignment.accountFullname ?? 'Unknown'}
                                        <button
                                          className='remove-tag'
                                          onClick={async () => {
                                            try {
                                              await deleteTaskAssignment({
                                                taskId: task.id,
                                                assignmentId: assignment.id,
                                              }).unwrap();

                                              setTaskAssignmentMap((prev) => ({
                                                ...prev,
                                                [task.id]: prev[task.id].filter(
                                                  (a) => a.accountId !== assignment.accountId
                                                ),
                                              }));
                                            } catch (err) {
                                              console.error('Failed to delete assignee:', err);
                                            }
                                          }}
                                        >
                                          ✖
                                        </button>
                                      </span>
                                    ))}
                                  </div>

                                  <div className='dropdown-select-wrapper'>
                                    <select
                                      onChange={async (e) => {
                                        const selectedId = parseInt(e.target.value);
                                        if (!selectedAssignees[task.id]?.includes(selectedId)) {
                                          try {
                                            await createTaskAssignment({
                                              taskId: task.id,
                                              accountId: selectedId,
                                            }).unwrap();

                                            const data = await getTaskAssignments(task.id).unwrap();

                                            setTaskAssignmentMap((prev) => ({
                                              ...prev,
                                              [task.id]: data,
                                            }));

                                            setSelectedAssignees((prev) => ({
                                              ...prev,
                                              [task.id]: [...(prev[task.id] ?? []), selectedId],
                                            }));
                                          } catch (err) {
                                            console.error('Failed to create assignee:', err);
                                          }
                                        }
                                      }}
                                      value=''
                                    >
                                      <option value='' disabled hidden>
                                        + Add assignee
                                      </option>
                                      {projectMembers
                                        .filter(
                                          (m) =>
                                            !(taskAssignmentMap[task.id] ?? []).some(
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
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  {(taskAssignmentMap[task.id] ?? []).map((assignment) => (
                                    <span
                                      key={assignment.accountId}
                                      style={{ marginBottom: '4px' }}
                                    >
                                      {assignment.accountFullname ?? 'Unknown'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            <td>
                              {canEditStatus(
                                (taskAssignmentMap[task.id] ?? []).map((a) => a.accountId)
                              ) ? (
                                <select
                                  className={`custom-epic-status-select status-${task.status
                                    .toLowerCase()
                                    .replace('_', '-')}`}
                                  value={task.status}
                                  onChange={async (e) => {
                                    try {
                                      await updateTaskStatus({
                                        id: task.id,
                                        status: e.target.value,
                                        createdBy: accountId,
                                      }).unwrap();
                                      await refetchTasks();
                                      await refetchActivityLogs();
                                      await refetchEpic();
                                    } catch (err) {
                                      console.error('Error updating status:', err);
                                    }
                                  }}
                                >
                                  {taskStatusOptions?.data?.map((opt) => (
                                    <option key={opt.name} value={opt.name}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span
                                  className={`custom-epic-status-select status-${task.status
                                    .toLowerCase()
                                    .replace('_', '-')} flex items-center gap-2`}
                                >
                                  {taskStatusOptions?.data?.find((opt) => opt.name === task.status)
                                    ?.label ?? task.status.replace('_', ' ')}
                                </span>
                              )}
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
                    <div className='task-type-selector' style={{ position: 'relative' }}>
                      <button
                        className='task-type-button'
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
                            taskTypeOptions?.data?.find((t) => t.name === newTaskType)?.iconLink ??
                            taskIcon
                          }
                          alt={newTaskType}
                          style={{ width: 16, marginRight: 6 }}
                        />
                        {taskTypeOptions?.data?.find((t) => t.name === newTaskType)?.label ??
                          newTaskType.charAt(0) + newTaskType.slice(1).toLowerCase()}
                      </button>

                      {showTypeDropdown && (
                        <div
                          className='dropdown-menu'
                          style={{
                            position: 'absolute',
                            bottom: '110%',
                            left: 0,
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            width: 140,
                          }}
                        >
                          {taskTypeOptions?.data?.map((type) => (
                            <div
                              key={type.name}
                              className='dropdown-item'
                              onClick={() => {
                                setNewTaskType(type.name as 'TASK' | 'BUG' | 'STORY');
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
                              <img
                                src={type.iconLink ?? ''}
                                alt={type.label}
                                style={{ width: 16 }}
                              />
                              {type.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  <td colSpan={5}>
                    <input
                      type='text'
                      placeholder='What needs to be done?'
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
                          await createTask({
                            reporterId: accountId,
                            projectId: parseInt(projectId),
                            epicId: epic.id,
                            title: newTaskTitle.trim(),
                            type: newTaskType,
                            createdBy: accountId,
                          }).unwrap();

                          console.log('Task created');
                          setNewTaskTitle('');
                          setShowTaskInput(false);
                          await refetchTasks();
                          await refetchActivityLogs();
                        } catch (err) {
                          console.error('Failed to create task:', err);
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

            <div className='activity-section'>
              <h4 style={{ marginBottom: '8px' }}>Activity</h4>

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

              {/* Tab Content */}
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
                  {comments.map((comment) => (
                    <div key={comment.id} className='simple-comment'>
                      <div className='avatar-circle'>
                        <img src={comment.accountPicture || accountIcon} alt='avatar' />
                      </div>
                      <div className='comment-content'>
                        <div className='comment-header'>
                          <strong>{comment.accountName || `User #${comment.accountId}`}</strong>
                          <span className='comment-time'>
                            {new Date(comment.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {editCommentId === comment.id ? (
                          <>
                            <textarea
                              value={editedContent[comment.id] || comment.content}
                              onChange={(e) =>
                                setEditedContent({ ...editedContent, [comment.id]: e.target.value })
                              }
                              className='border rounded p-2 w-full'
                              autoFocus
                            />
                            <div className='flex gap-2 mt-2'>
                              <button
                                onClick={() => handleSave(comment.id, comment.content)}
                                className='px-1 py-0.5 bg-blue-500 text-xs text-white rounded hover:bg-blue-600 h-6'
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditCommentId(null)}
                                className='px-1 py-0.5 bg-gray-300 text-xs text-gray-700 rounded hover:bg-gray-400 h-6'
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className='comment-text'>{comment.content}</div>
                            {comment.accountId === accountId && (
                              <div className='comment-actions'>
                                <button
                                  className='edit-btn'
                                  onClick={() => setEditCommentId(comment.id)}
                                >
                                  ✏ Edit
                                </button>
                                <button
                                  className='delete-btn'
                                  onClick={async () => {
                                    const confirmed = await Swal.fire({
                                      title: 'Delete Comment',
                                      text: 'Are you sure you want to delete this comment?',
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonText: 'Delete',
                                      confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                      customClass: {
                                        title: 'small-title',
                                        popup: 'small-popup',
                                        icon: 'small-icon',
                                        htmlContainer: 'small-html',
                                      },
                                    });
                                    if (confirmed.isConfirmed) {
                                      try {
                                        console.log(
                                          'Deleting comment:',
                                          comment.id,
                                          'for epic:',
                                          epicId
                                        );
                                        await deleteEpicComment({
                                          id: comment.id,
                                          epicId,
                                          createdBy: accountId,
                                        }).unwrap();
                                        await refetchActivityLogs();
                                      } catch (err) {
                                        console.error('Failed to delete comment:', err);
                                        Swal.fire({
                                          icon: 'error',
                                          title: 'Delete Failed',
                                          text: 'Failed to delete comment.',
                                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                                          customClass: {
                                            title: 'small-title',
                                            popup: 'small-popup',
                                            icon: 'small-icon',
                                            htmlContainer: 'small-html',
                                          },
                                        });
                                      }
                                    }
                                  }}
                                >
                                  🗑 Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

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
                            alert('User not identified. Please log in again.');
                            return;
                          }
                          createEpicComment({
                            epicId,
                            accountId,
                            content: commentContent.trim(),
                            createdBy: accountId,
                          }).unwrap();
                          setCommentContent('');
                          await refetchComments();
                          await refetchActivityLogs();
                        } catch (err: any) {
                          console.error('Failed to post comment:', err);
                          alert('Failed to post comment: ' + JSON.stringify(err?.data || err));
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

          {/* Right - Sidebar */}
          <div className='details-panel'>
            <div className='panel-header'>
              {canEditStatus(epic.assignedBy) ? (
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`custom-epic-status-select status-${status
                    .toLowerCase()
                    .replace('_', '-')}`}
                >
                  {epicStatusOptions?.data?.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`custom-epic-status-select status-${status
                    .toLowerCase()
                    .replace('_', '-')}`}
                >
                  {epicStatusOptions?.data?.find((item) => item.name === status)?.label ??
                    status.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className='details-content'>
              <div className='detail-item'>
                <label>Assignee</label>
                {canEdit ? (
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
                    <option value='' disabled>
                      -- Select assignee --
                    </option>
                    {projectMembers.map((member) => (
                      <option key={member.accountId} value={member.accountId}>
                        {member.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers.find((m) => m.accountId === selectedAssignee)?.accountName ??
                      'None'}
                  </span>
                )}
              </div>

              {isEditingLabel ? (
                <div ref={labelRef} className='flex flex-col gap-2 w-full relative'>
                  <div className='flex flex-col gap-2 w-full relative'>
                    <label className='font-semibold'>Labels</label>

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

              {/* <div className="detail-item"><label>Sprint</label><span>{epic?.sprintName ?? 'None'} : {epic?.sprintGoal ?? 'None'}</span></div> */}
              <div className='detail-item'>
                <label>Start date</label>
                {canEdit ? (
                  <input
                    type='date'
                    min={projectData?.data.startDate?.slice(0, 10)}
                    max={
                      newEndDate ? newEndDate.slice(0, 10) : projectData?.data.endDate?.slice(0, 10)
                    }
                    value={newStartDate?.slice(0, 10) ?? epic?.startDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      refetchTasks();
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;

                      const currentEndDate = newEndDate ?? epic?.endDate;
                      if (currentEndDate && new Date(fullDate) >= new Date(currentEndDate)) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Start Date',
                          html: 'Start Date must be smaller than Due Date!',
                          width: 350,
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        return;
                      }

                      setNewStartDate(fullDate);
                    }}
                    onBlur={handleUpdateEpic}
                    style={{ width: '150px', height: '32px' }}
                  />
                ) : (
                  <span>{epic?.startDate?.slice(0, 10) ?? 'None'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Due date</label>
                {canEdit ? (
                  <input
                    type='date'
                    min={
                      newStartDate
                        ? newStartDate.slice(0, 10)
                        : projectData?.data.startDate?.slice(0, 10)
                    }
                    max={projectData?.data.endDate?.slice(0, 10)}
                    value={newEndDate?.slice(0, 10) ?? epic?.endDate?.slice(0, 10) ?? ''}
                    onChange={(e) => {
                      refetchTasks();
                      const selectedDate = e.target.value;
                      const fullDate = `${selectedDate}T00:00:00.000Z`;

                      const currentStartDate = newStartDate ?? epic?.startDate;
                      if (currentStartDate && new Date(fullDate) <= new Date(currentStartDate)) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Invalid Due Date',
                          html: 'Due Date must be greater than Start Date!',
                          width: 350,
                          confirmButtonColor: 'rgba(44, 104, 194, 1)',
                          customClass: {
                            title: 'small-title',
                            popup: 'small-popup',
                            icon: 'small-icon',
                            htmlContainer: 'small-html',
                          },
                        });
                        return;
                      }

                      setNewEndDate(fullDate);
                    }}
                    onBlur={handleUpdateEpic}
                    style={{ width: '150px', height: '32px' }}
                  />
                ) : (
                  <span>{epic?.endDate?.slice(0, 10) ?? 'None'}</span>
                )}
              </div>

              <div className='detail-item'>
                <label>Reporter</label>
                {canEdit ? (
                  <select
                    value={selectedReporter ?? ''}
                    onChange={(e) => {
                      const reporterId = Number(e.target.value);
                      setSelectedReporter(reporterId);
                      setNewReporterId(reporterId);
                    }}
                    style={{ padding: '2px 0px', width: '150px' }}
                  >
                    <option value='' disabled>
                      -- Select reporter --
                    </option>
                    {projectMembers.map((member) => (
                      <option key={member.accountId} value={member.accountId}>
                        {member.accountName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    {projectMembers.find((m) => m.accountId === selectedReporter)?.accountName ??
                      'None'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {selectedTaskId && (
          <WorkItem isOpen={true} taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        )}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteFile}
          title='Delete this attachment?'
          message="Once you delete, it's gone for good."
        />
        {isEvaluationPopupOpen && (
          <AiResponseEvaluationPopup
            isOpen={isEvaluationPopupOpen}
            onClose={handleCloseEvaluationPopup}
            aiResponseJson={aiResponseJson}
            projectId={Number(projectId)}
            aiFeature='TASK_FROM_EPIC_CREATION'
            onSubmitSuccess={handleEvaluationSubmitSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default EpicPopup;
