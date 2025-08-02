import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Calendar, Trash2, Edit } from 'lucide-react';
import { useUpdateMilestoneSprintMutation, type MilestoneResponseDTO } from '../../../services/milestoneApi';
import {
  useGetMilestoneCommentsByMilestoneIdQuery,
  useCreateMilestoneCommentMutation,
  useUpdateMilestoneCommentMutation,
  useDeleteMilestoneCommentMutation,
  type MilestoneCommentResponseDTO,
} from '../../../services/milestoneCommentApi';
import { type SprintWithTaskListResponseDTO } from '../../../services/sprintApi';

const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: string, endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const daysUntilDue = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (status === 'DONE') return 'bg-green-100 border-green-500';
  if (daysUntilDue < 0) return 'bg-red-100 border-red-500';
  if (daysUntilDue <= 3) return 'bg-yellow-100 border-yellow-500';
  if (status === 'IN_PROGRESS') return 'bg-blue-100 border-blue-500';
  return 'bg-gray-100 border-gray-500';
};

interface MilestoneCardProps {
  milestone: MilestoneResponseDTO;
  sprints: SprintWithTaskListResponseDTO[];
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, sprints }) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [updateMilestoneSprint] = useUpdateMilestoneSprintMutation();
  const [createMilestoneComment] = useCreateMilestoneCommentMutation();
  const [updateMilestoneComment] = useUpdateMilestoneCommentMutation();
  const [deleteMilestoneComment] = useDeleteMilestoneCommentMutation();
  const { data: comments = [], isLoading: isCommentLoading } = useGetMilestoneCommentsByMilestoneIdQuery(milestone.id, {
    skip: !milestone.id,
  });

  const handleSprintChange = async (sprintId: number) => {
    try {
      await updateMilestoneSprint({ key: milestone.key!, sprintId }).unwrap();
    } catch (error) {
      console.error('Failed to update sprint:', error);
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

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${getStatusColor(milestone.status, milestone.endDate)}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{milestone.name}</h3>
          <p className="text-sm text-gray-600">{milestone.description}</p>
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase">{milestone.key}</span>
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Start: {formatDate(milestone.startDate)}
        </p>
        <p className="text-sm text-gray-600 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          End: {formatDate(milestone.endDate)}
        </p>
        <p className="text-sm text-gray-600">Status: {milestone.status}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sprint:</span>
          <select
            value={milestone.sprintId || ''}
            onChange={(e) => handleSprintChange(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="">No Sprint</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={() => setIsCommentOpen(!isCommentOpen)}
          className="flex items-center text-sm text-gray-700 hover:text-blue-600"
        >
          {isCommentOpen ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          Comments ({comments.length})
        </button>
        {isCommentOpen && (
          <div className="mt-2">
            {isCommentLoading ? (
              <div className="text-sm text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-gray-500">No comments yet</div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-2 bg-white rounded border flex justify-between items-start">
                    {editingCommentId === comment.id ? (
                      <div className="w-full">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-sm text-gray-700 px-3 py-1 rounded border hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                          <p className="text-xs text-gray-500">By {comment.accountName} on {formatDate(comment.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add comment..."
                className="w-full p-2 border rounded text-sm"
              />
              <button
                onClick={handleAddComment}
                className="mt-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Submit Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;
