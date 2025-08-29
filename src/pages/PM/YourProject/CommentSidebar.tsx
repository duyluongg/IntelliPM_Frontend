import React, { useState } from 'react';
import { Check, MessageSquareOff, Pencil, Trash2, X } from 'lucide-react';
import type { DocumentComment } from '../../../types/DocumentCommentType';

// ✨ 1. CẬP NHẬT: Thêm thông tin người dùng vào comment
interface CommentItem {
  id: number | string;
  fromPos: number;
  toPos: number;
  content: string; // Đoạn text được highlight
  comment: string; // Nội dung comment
  // userId: number; // ID của người tạo comment
  authorName: string; // Tên người tạo comment
  authorAvatar?: string; // URL avatar người tạo comment
  authorId: number; // ID của người tạo comment
}

interface Props {
  comments: DocumentComment[]; 
  activeCommentId: string | null;
  currentUserId: number;
  onCommentClick: (comment: DocumentComment) => void;
  onUpdateComment: (comment: DocumentComment, newContent: string) => void;
  onDeleteComment: (id: number | string) => void;
}

export default function CommentSidebar({
  comments,
  onCommentClick,
  activeCommentId,
  onUpdateComment,
  onDeleteComment,
  currentUserId, // Nhận prop mới
}: Props) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (comment: CommentItem) => {
    setEditingCommentId(comment.id.toString());
    setEditText(comment.comment);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    if (!editingCommentId || !editText.trim()) return;
    const commentToUpdate = comments.find((c) => c.id.toString() === editingCommentId);
    if (commentToUpdate) {
      onUpdateComment(commentToUpdate, editText);
    }
    setEditingCommentId(null);
    setEditText('');
  };

  return (
    <div className='w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>Comments</h2>
      </div>

      {comments.length === 0 ? (
        <div className='flex-grow flex flex-col items-center justify-center text-center p-4'>
          <MessageSquareOff className='w-12 h-12 text-gray-400 mb-3' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            No comments yet. <br />
            Please select a text passage and add a comment.
          </p>
        </div>
      ) : (
        <div className='flex-grow p-4 overflow-y-auto space-y-4'>
          {comments.map((c) => (
            <div
              key={c.id}
              id={`comment-${c.id}`}
              className={`relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 transition-all duration-200 ${
                activeCommentId === c.id.toString()
                  ? 'ring-2 ring-yellow-400'
                  : 'border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className='flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700'>
                <img src={c.authorAvatar} alt={c.authorName} className='w-8 h-8 rounded-full' />
                <span className='font-semibold text-sm text-gray-800 dark:text-gray-200'>
                  {c.authorName}
                </span>
              </div>

              {/* Logic hiển thị: Đang sửa hoặc đang xem */}
              {editingCommentId === c.id.toString() ? (
                // Giao diện khi đang SỬA
                <div className='space-y-2'>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className='w-full p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
                    rows={3}
                    autoFocus
                  />
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={handleCancelEdit}
                      className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className='p-1 bg-blue-500 text-white hover:bg-blue-600 rounded'
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                // Giao diện khi đang XEM
                <div onClick={() => onCommentClick(c)} className='cursor-pointer space-y-2'>
                  <blockquote className='border-l-4 border-gray-200 dark:border-gray-600 pl-3'>
                    <p className='text-sm italic text-gray-500 dark:text-gray-400'>"{c.content}"</p>
                  </blockquote>
                  <p className='text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap'>
                    {c.comment}
                  </p>
                </div>
              )}

              {/* ✨ 4. LOGIC MỚI: Chỉ hiện nút Sửa/Xóa cho chủ nhân comment */}
              {currentUserId === c.authorId && editingCommentId !== c.id.toString() && (
                <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => handleStartEdit(c)}
                    className='p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full'
                    aria-label='Sửa bình luận'
                  >
                    <Pencil size={14} className='text-gray-600 dark:text-gray-300' />
                  </button>
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    className='p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full'
                    aria-label='Xóa bình luận'
                  >
                    <Trash2 size={14} className='text-red-500' />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
