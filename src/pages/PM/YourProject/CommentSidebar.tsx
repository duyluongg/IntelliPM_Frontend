// src/components/PM/Document/CommentSidebar.tsx

import React, { useState } from 'react';
import { Check, MessageSquareOff, Pencil, Trash2, X } from 'lucide-react'; // Import icon cho trạng thái trống

interface CommentItem {
  id: number | string;
  from: number;
  to: number;
  content: string; // Đoạn text được highlight
  comment: string; // Nội dung comment
  // Có thể thêm: userAvatar, userName, createdAt...
}

interface Props {
  comments: CommentItem[];
  activeCommentId: string | null;
  onCommentClick: (comment: CommentItem) => void;
  onUpdateComment: (comment: CommentItem, newContent: string) => void;
  onDeleteComment: (id: number | string) => void;
}

export default function CommentSidebar({
  comments,
  onCommentClick,
  activeCommentId,
  onUpdateComment,
  onDeleteComment,
}: Props) {
  //   const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

//   const handleClick = (comment: CommentItem) => {
//     onCommentClick(comment);
//   };

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

    // ✨ THAY ĐỔI: Tìm lại object comment đầy đủ để gửi đi
    const commentToUpdate = comments.find((c) => c.id.toString() === editingCommentId);

    if (commentToUpdate) {
      onUpdateComment(commentToUpdate, editText);
    }

    setEditingCommentId(null);
    setEditText('');
  };

  return (
    // Thêm flex-shrink-0 để sidebar không bị co lại
    <div className='w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>📋 Bình luận</h2>
      </div>

      {comments.length === 0 ? (
        <div className='flex-grow flex flex-col items-center justify-center text-center p-4'>
          <MessageSquareOff className='w-12 h-12 text-gray-400 mb-3' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Chưa có bình luận nào. <br />
            Hãy chọn một đoạn văn bản và thêm bình luận nhé.
          </p>
        </div>
      ) : (
        <div className='flex-grow p-4 overflow-y-auto space-y-4'>
          {comments.map((c) => (
            <div
              key={c.id}
              id={`comment-${c.id}`}
              // Thêm `relative group` để các nút con có thể hiện ra khi hover
              className={`relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 transition-all ...
                ${activeCommentId === c.id.toString() ? 'ring-2 ring-yellow-400' : 'border ...'}`}
            >
              {/* ✨ 4. LOGIC HIỂN THỊ: Đang sửa hoặc đang xem */}
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
                // Giao diện khi đang XEM (bình thường)
                <div onClick={() => onCommentClick(c)} className='cursor-pointer'>
                  <blockquote className='border-l-2 ...'>
                    <p className='text-sm ...'>"{c.content}"</p>
                  </blockquote>
                  <p className='text-sm text-gray-800 dark:text-gray-200'>{c.comment}</p>
                </div>
              )}

              {/* ✨ 5. NÚT EDIT/DELETE (chỉ hiện khi hover và không ở chế độ sửa) */}
              {editingCommentId !== c.id.toString() && (
                <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => handleStartEdit(c)}
                    className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
                  >
                    <Pencil size={16} className='text-gray-500' />
                  </button>
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
                  >
                    <Trash2 size={16} className='text-red-500' />
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
