import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import {
  useUpdateMilestoneSprintMutation,
  useUpdateMilestoneStatusMutation,
  type MilestoneResponseDTO,
} from '../../../services/milestoneApi';
import {
  useGetMilestoneCommentsByMilestoneIdQuery,
  useCreateMilestoneCommentMutation,
  useUpdateMilestoneCommentMutation,
  useDeleteMilestoneCommentMutation,
  type MilestoneCommentResponseDTO,
} from '../../../services/milestoneCommentApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';
import UpdateMilestonePopup from './UpdateMilestonePopup';

interface User {
  role: string;
}

const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: string | null, endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const daysUntilDue = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (status === 'DONE') return 'bg-green-50 border-green-200';
  if (daysUntilDue < 0) return 'bg-red-50 border-red-200';
  if (daysUntilDue <= 3) return 'bg-yellow-50 border-yellow-200';
  if (status === 'IN_PROGRESS') return 'bg-blue-50 border-blue-200';
  return 'bg-gray-50 border-gray-200';
};

const getProgressColor = (status: string | null, endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const daysUntilDue = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if ((status === 'PLANNING' || status === 'IN_PROGRESS') && daysUntilDue <= 3) {
    return 'bg-gradient-to-r from-red-500 to-red-400';
  }
  if (status === 'AWAITING_REVIEW') {
    return 'bg-gradient-to-r from-green-500 to-green-400';
  }
  return 'bg-gradient-to-r from-blue-500 to-blue-400';
};

const getProgress = (startDate: string | null, endDate: string | null): number => {
  if (!startDate || !endDate) return 0;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  if (elapsed < 0) return 0;
  if (elapsed > total) return 100;
  return (elapsed / total) * 100;
};

const getStatusBadge = (status: string | null) => {
  const normalizedStatus = status || 'PLANNING';
  switch (normalizedStatus) {
    case 'PLANNING':
      return { color: 'bg-gray-100 text-gray-800' };
    case 'IN_PROGRESS':
      return { color: 'bg-blue-100 text-blue-800' };
    case 'AWAITING_REVIEW':
      return { color: 'bg-green-100 text-green-800' };
    default:
      return { color: 'bg-gray-100 text-gray-800' };
  }
};

interface MilestoneCardProps {
  milestone: MilestoneResponseDTO;
  sprints: SprintWithTaskListResponseDTO[];
  refetchMilestones: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, sprints, refetchMilestones }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [updateMilestoneSprint, { isLoading: isSprintUpdating }] = useUpdateMilestoneSprintMutation();
  const [updateMilestoneStatus, { isLoading: isStatusUpdating }] = useUpdateMilestoneStatusMutation();
  const [createMilestoneComment] = useCreateMilestoneCommentMutation();
  const [updateMilestoneComment] = useUpdateMilestoneCommentMutation();
  const [deleteMilestoneComment] = useDeleteMilestoneCommentMutation();
  const { data: comments = [], isLoading: isCommentLoading } = useGetMilestoneCommentsByMilestoneIdQuery(milestone.id, {
    skip: !milestone.id,
  });

  const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

  const handleSprintChange = async (sprintId: number) => {
    try {
      await updateMilestoneSprint({ key: milestone.key!, sprintId }).unwrap();
      refetchMilestones();
    } catch (error) {
      console.error('Failed to update sprint:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMilestoneStatus({ id: milestone.id, status: newStatus }).unwrap();
      refetchMilestones();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    try {
      await createMilestoneComment({
        milestoneId: milestone.id,
        accountId: parseInt(localStorage.getItem('accountId') || '0'),
        content: commentContent,
      }).unwrap();
      setCommentContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = (comment: MilestoneCommentResponseDTO) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await updateMilestoneComment({
        id: commentId,
        payload: {
          milestoneId: milestone.id,
          accountId: parseInt(localStorage.getItem('accountId') || '0'),
          content: editContent,
        },
      }).unwrap();
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteMilestoneComment(commentId).unwrap();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleSendToClient = async () => {
    try {
      console.log('Send to client:', milestone.id);
      refetchMilestones();
    } catch (error) {
      console.error('Failed to send to client:', error);
    }
  };

  const progress = getProgress(milestone.startDate, milestone.endDate);
  const statusBadge = getStatusBadge(milestone.status);

  const renderStatusButtons = () => {
    const currentStatus = milestone.status || 'PLANNING';
    switch (currentStatus) {
      case 'PLANNING':
        return (
          <button
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={isStatusUpdating}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
          >
            {isStatusUpdating ? 'Updating...' : 'Start Milestone'}
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleStatusChange('AWAITING_REVIEW')}
            disabled={isStatusUpdating}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-teal-700 hover:to-teal-600 transition-all duration-200 disabled:opacity-50"
          >
            {isStatusUpdating ? 'Updating...' : 'Complete Milestone'}
          </button>
        );
      case 'AWAITING_REVIEW':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${getStatusColor(milestone.status, milestone.endDate)}`}>
      <div className="flex justify-between items-start min-h-[72px]">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{milestone.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{milestone.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase self-start">
            {milestone.key}
          </span>
          {(user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER') && (
            <button
              onClick={() => setIsUpdatePopupOpen(true)}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="relative min-h-[56px]">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span className="text-ellipsis overflow-hidden">{formatDate(milestone.startDate)}</span>
            <span className="text-ellipsis overflow-hidden">{formatDate(milestone.endDate)}</span>
          </div>
          <div className="relative h-6 text-xs flex rounded-md bg-gray-200">
            <div
              style={{ width: `${progress}%` }}
              className={`shadow-none flex flex-col whitespace-nowrap text-white justify-center ${getProgressColor(milestone.status, milestone.endDate)} rounded-md`}
            ></div>
          </div>
          <div className="text-center text-xs text-gray-600 mt-1">{Math.round(progress)}%</div>
        </div>
        <div className="flex items-center gap-2 min-h-[32px]">
          <span className="text-sm font-medium text-gray-600 w-20">Status:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
            {(milestone.status || 'PLANNING').replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 min-h-[32px]">
          <span className="text-sm font-medium text-gray-600 w-20">Sprint:</span>
          <select
            value={milestone.sprintId || ''}
            onChange={(e) => handleSprintChange(Number(e.target.value))}
            disabled={isSprintUpdating}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 flex-1"
          >
            <option value="">No Sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-h-[40px]">
          {user?.role === 'TEAM_LEADER' || user?.role === 'PROJECT_MANAGER' ? (
            <>
              {milestone.status === 'AWAITING_REVIEW' && (
                <button
                  onClick={handleSendToClient}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200"
                >
                  Send to Client
                </button>
              )}
              {renderStatusButtons()}
            </>
          ) : null}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={() => setIsCommentOpen(!isCommentOpen)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          {isCommentOpen ? <ChevronUp className="w-5 h-5 mr-1" /> : <ChevronDown className="w-5 h-5 mr-1" />}
          Comments ({comments.length})
        </button>
        {isCommentOpen && (
          <div className="mt-4 space-y-4">
            {isCommentLoading ? (
              <div className="text-sm text-gray-500 animate-pulse">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">No comments yet</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-start">
                    {editingCommentId === comment.id ? (
                      <div className="w-full">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-sm text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {comment.accountName} on {formatDate(comment.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
              >
                Submit Comment
              </button>
            </div>
          </div>
        )}
      </div>
      {isUpdatePopupOpen && (
        <UpdateMilestonePopup
          milestoneId={milestone.id}
          sprints={sprints}
          onClose={() => setIsUpdatePopupOpen(false)}
          refetchMilestones={refetchMilestones}
        />
      )}
    </div>
  );
};

export default MilestoneCard;
