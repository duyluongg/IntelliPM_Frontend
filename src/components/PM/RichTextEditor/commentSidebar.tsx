import React from 'react';
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '../../../services/Document/documentCommentAPI';

type Comment = {
  id: number;
  content: string;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
};

type Props = {
  comments: Comment[];
  editor?: any; // Thêm editor nếu cần để tương tác với RichTextEditor
  refetch: () => void;
};

const CommentSidebar: React.FC<Props> = ({ comments, refetch, editor }) => {
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  

  const handleEdit = async (comment: Comment) => {
    const newContent = prompt('Chỉnh sửa bình luận:', comment.content);
    if (!newContent || newContent === comment.content) return;

    try {
      await updateComment({ id: comment.id, content: newContent }).unwrap();
      await refetch();
    } catch (err) {
      alert('Không thể cập nhật bình luận.');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await deleteComment(commentId).unwrap();
      await refetch();
      if (editor) {
        editor.chain().focus().unsetComment(commentId.toString()).run();
      }
    } catch (err) {
      alert('Xóa bình luận thất bại.');
    }
  };

  return (
    <div className='w-80 px-4 py-4 space-y-4 overflow-auto'>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className='bg-[#eef2fb] p-3 rounded-lg shadow-sm'
          data-comment-id={comment.id}
        >
          <div className='flex items-center gap-2 mb-1'>
            <img
              //   src={
              //     comment.author.avatarUrl ||
              //     `https://i.pravatar.cc/32?u=${comment.id}`
              //   }
              alt='avatar'
              className='w-6 h-6 rounded-full'
            />
            <div>
              <p className='text-sm font-semibold'>
                {/* {comment.author.fullName || 'Người dùng'} */}
                tony luong
              </p>
              <p className='text-xs text-gray-400'>{formatTime(comment.createdAt)}</p>
            </div>
          </div>

          <p className='text-sm text-gray-700 whitespace-pre-wrap'>{comment.content}</p>

          <div className='flex gap-2 mt-1 text-xs text-blue-600'>
            <button onClick={() => handleEdit(comment)}>Sửa</button>
            <button onClick={() => handleDelete(comment.id)}>Xoá</button>
          </div>
        </div>
      ))}
    </div>
  );
};

function formatTime(isoTime: string) {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default CommentSidebar;
