import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

import debounce from 'lodash.debounce';
import './editor.scss';

import MenuBar from './MenuBar';
import {
  useGetDocumentByIdQuery,
  useUpdateDocumentMutation,
} from '../../../services/Document/documentAPI';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock3, User2 } from 'lucide-react';
import dayjs from 'dayjs';
import NewStartWithAI from '../../../components/PM/AI/NewStartWithAI';
import Chatbot from '../../../components/PM/AI/Chatbot';
import { MentionExtension } from './MentionExtension';
import type { RootState } from '../../../app/store';
import { useSelector } from 'react-redux';
import { useGetProjectMembersNoStatusQuery } from '../../../services/projectMemberApi';
import { useAuth } from '../../../services/AuthContext';
import { SlashCommand } from './SlashCommand';
import { useGetProjectByIdQuery } from '../../../services/projectApi';
import { GanttNode } from './GanttNode';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsByDocumentIdQuery,
  useUpdateCommentMutation,
} from '../../../services/Document/documentCommentAPI';
import { CommentMark } from './CommentMark';
import CommentSidebar from './CommentSidebar';
import SideMenu from './SideMenu';

interface CommentItem {
  id: number | string;
  documentId: number; // ✅ BẮT BUỘC
  from: number; // ✅ BẮT BUỘC
  to: number; // ✅ BẮT BUỘC
  content: string; // ✅ BẮT BUỘC
  comment: string;
}

export const Document: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isReadOnly = mode === 'view';
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const navigate = useNavigate();
  const { documentId } = useParams();
  const {
    data: documentData,
    isLoading,
    isError,
    refetch: refetchDocument,
  } = useGetDocumentByIdQuery(documentId);
  const {
    content: initialContent,
    visibility,
    createdAt,
    updatedAt,
    createdBy,
    title,
  } = documentData || {};
  const { user } = useAuth();
  console.log(user);

  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  const { data, isSuccess } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId,
  });
  const projectKey = data?.data?.projectKey;

  const projectKeyRef = useRef<string | undefined>();
  useEffect(() => {
    projectKeyRef.current = projectKey;
  }, [projectKey]);

  console.log('Document data:', projectId);
  const { data: projectMembers } = useGetProjectMembersNoStatusQuery(projectId!, {
    skip: !projectId,
  });
  const filterAccount = projectMembers?.filter((m) => m.id !== user?.id);
  const mentionItemsRef = useRef<MentionItem[]>([]);

  useEffect(() => {
    if (filterAccount?.length) {
      mentionItemsRef.current = filterAccount.map((m) => ({
        id: m.accountId,
        label: m.accountName,
        name: m.accountName,
      }));
    }
  }, [filterAccount]);

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [currentTitle, setCurrentTitle] = useState(title);
  const [updateDocument] = useUpdateDocumentMutation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [createComment] = useCreateCommentMutation();
  const { data: commentList = [], refetch: refetchComments } = useGetCommentsByDocumentIdQuery(
    documentId!,
    {
      skip: !documentId,
    }
  );
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const handleToggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  const debouncedSave = useCallback(
    debounce((html: string) => {
      if (documentId) {
        updateDocument({ id: documentId, data: { content: html, visibility } });
      }
    }, 500),
    [documentId, visibility]
  );

  const handleTitleSave = async () => {
    if (currentTitle.trim() && currentTitle !== title) {
      try {
        await updateDocument({
          id: documentId,
          data: { title: currentTitle, visibility },
        });
      } catch (err) {
        console.error('Failed to update title', err);
      }
    }
    setIsEditingTitle(false);
  };

  const editor = useEditor({
    editable: !isReadOnly,
    extensions: [
      StarterKit,
      CommentMark,
      GanttNode,
      SlashCommand.configure({
        items: () => [
          {
            title: 'Gantt',
            command: ({ editor }) => {
              const currentProjectKey = projectKeyRef.current;
              if (!currentProjectKey) {
                alert('Project key is not available yet. Please try again in a moment.');
                return;
              }
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'gantt',
                  attrs: { projectKey: currentProjectKey },
                })
                .run();
            },
          },
          {
            title: 'Danh sách',
            command: ({ editor }) => {
              editor.commands.toggleBulletList();
            },
          },
          // Add more items here
        ],
      }),
      MentionExtension(mentionItemsRef),
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'tiptap prose dark:prose-invert prose-sm sm:prose-base max-w-none p-4 focus:outline-none min-h-[50px]',
      },

      // ✨ BỔ SUNG QUAN TRỌNG: Thêm lại logic xử lý click cho comment
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const commentElement = target.closest('.comment-highlight');

        if (commentElement) {
          const commentId = commentElement.getAttribute('data-comment-id');
          if (commentId) {
            // Cập nhật state và cuộn sidebar đến comment tương ứng
            setActiveCommentId(commentId);
            const sidebarComment = document.getElementById(`comment-${commentId}`);
            sidebarComment?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            return true; // Đã xử lý click, ngăn hành vi mặc định
          }
        }
        return false; // Để Tiptap xử lý tiếp
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(html);
    },
  });
  const hasContent = editor && editor.getHTML().trim() !== '<p></p>';

  const handleGoToComment = (from: number, to: number, commentId: string) => {
    setActiveCommentId(commentId); // Cập nhật state active

    // Phần còn lại giữ nguyên
    if (!editor) return;
    editor.chain().focus().setTextSelection({ from, to }).run();
    const proseMirrorView = document.querySelector('.ProseMirror');
    if (!proseMirrorView) return;
    proseMirrorView.querySelectorAll('.comment-highlight.is-active').forEach((el) => {
      el.classList.remove('is-active');
    });
    const activeHighlight = proseMirrorView.querySelector(
      `.comment-highlight[data-comment-id="${commentId}"]`
    );
    if (activeHighlight) {
      activeHighlight.classList.add('is-active');
      activeHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ✨ THAY ĐỔI: Cập nhật lại hàm được truyền vào sidebar
  const handleSidebarCommentClick = (comment: CommentItem) => {
    handleGoToComment(comment.from, comment.to, comment.id.toString());
  };

  useEffect(() => {
    const proseMirrorView = document.querySelector('.ProseMirror');
    if (!proseMirrorView) return;

    proseMirrorView.querySelectorAll('.comment-highlight.is-active').forEach((el) => {
      el.classList.remove('is-active');
    });

    if (activeCommentId) {
      const activeHighlight = proseMirrorView.querySelector(
        `.comment-highlight[data-comment-id="${activeCommentId}"]`
      );
      activeHighlight?.classList.add('is-active');
    }
  }, [activeCommentId]); // Chạy mỗi khi activeCommentId thay đổi

  useEffect(() => {
    if (documentData) {
      setCurrentTitle(documentData.title);
      editor?.commands.setContent(documentData.content || '');
    }
    refetchDocument();
  }, [documentData, editor]);

  if (!documentId) {
    return (
      <div className='p-6 text-center text-red-500'>
        ❌ Thiếu thông tin tài liệu. Quay lại trang trước.
        <br />
        <button
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded'
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const handleAddComment = async () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;

    if (from === to) {
      alert('Vui lòng chọn đoạn văn bản để comment!');
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to);
    const commentContent = prompt(`Viết comment cho đoạn: "${selectedText}"`);

    if (!commentContent?.trim()) return;

    try {
      const res = await createComment({
        documentId: Number(documentId),
        fromPos: from,
        toPos: to,
        content: selectedText,
        comment: commentContent,
      }).unwrap(); // 👉 Bắt lỗi nếu có

      const commentId = res?.id ?? 'tạm-thời';

      // Gắn mark để highlight đoạn comment
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setMark('commentMark', { commentId })
        .run();
      await refetchComments();
      alert('✅ Comment đã được tạo!');
    } catch (error) {
      console.error('❌ Tạo comment thất bại:', error);
      alert('Tạo comment thất bại');
    }
  };

  // Document.tsx

  const handleDeleteComment = async (commentId: number | string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
      const commentToDelete = commentList.find((c) => c.id.toString() === commentId.toString());

      if (!commentToDelete) {
        console.error('Không tìm thấy comment để xóa trong danh sách.');
        return;
      }

      if (editor) {
        editor
          .chain()
          .focus()
          // ✨ SỬA LẠI TẠI ĐÂY
          .setTextSelection({ from: commentToDelete.fromPos, to: commentToDelete.toPos })
          .unsetMark('commentMark')
          .run();
      }

      if (activeCommentId === commentId.toString()) {
        setActiveCommentId(null);
      }

      try {
        await deleteComment(commentId).unwrap();
        refetchComments();
      } catch (error) {
        console.error('Xóa bình luận thất bại:', error);
        alert('Đã xảy ra lỗi khi xóa bình luận.');
      }
    }
  };

  // ✨ 4. TẠO HÀM XỬ LÝ CẬP NHẬT
  const handleUpdateComment = async (
    commentToUpdate: CommentItem, // Nhận vào toàn bộ object comment gốc
    newCommentText: string // và nội dung bình luận mới
  ) => {
    // Kiểm tra để đảm bảo có documentId
    if (!documentId) {
      alert('Không tìm thấy ID của tài liệu.');
      return;
    }

    // 1. Xây dựng payload đầy đủ mà API yêu cầu
    const payload = {
      id: Number(commentToUpdate.id),
      documentId: Number(documentId),
      fromPos: commentToUpdate.from,
      toPos: commentToUpdate.to,
      content: commentToUpdate.content, // Lấy content gốc từ object comment
      comment: newCommentText, // Dùng nội dung mới từ textarea
    };

    // 2. Gọi mutation với payload hoàn chỉnh
    try {
      console.log('Đang gửi payload để cập nhật:', payload);
      await updateComment(payload).unwrap();
      refetchComments(); // Cập nhật lại danh sách bình luận trên UI
    } catch (error) {
      console.error('Cập nhật bình luận thất bại:', error);
      alert('Đã xảy ra lỗi khi cập nhật bình luận.');
    }
  };

  return (
    <div className=''>
      {editor && !isReadOnly && (
        <MenuBar
          editor={editor}
          onToggleChatbot={handleToggleChatbot}
          onAddComment={handleAddComment}
        />
      )}

      <div className='flex'>
        <div className='max-w-4xl mx-auto px-4 py-6 '>
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              {isEditingTitle ? (
                <input
                  type='text'
                  autoFocus
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTitleSave();
                    }
                  }}
                  className='text-4xl font-extrabold tracking-tight bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500'
                />
              ) : (
                <h1
                  className='text-4xl font-extrabold tracking-tight cursor-pointer'
                  onClick={() => setIsEditingTitle(true)}
                  title='Click to edit title'
                >
                  {currentTitle}
                </h1>
              )}
            </div>
            <div className='mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2'>
              <div className='flex items-center gap-1'>
                <User2 className='w-4 h-4' />
                <span>
                  Creator <strong>{createdBy}</strong>
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock3 className='w-4 h-4' />
                <span>
                  Created <strong>{dayjs(createdAt).format('MMM DD, YYYY, HH:mm')}</strong>
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock3 className='w-4 h-4' />
                <span>
                  Last updated <strong>{dayjs(updatedAt).format('MMM DD, YYYY, HH:mm')}</strong>
                </span>
              </div>
            </div>
          </div>

          <EditorContent editor={editor} />
          {!hasContent && (
            <SideMenu
              onSelectTemplate={(html) => {
                if (editor && !isReadOnly) {
                  editor.commands.setContent(html);

                  debouncedSave(html);
                }
              }}
              onInsertTable={() => {
                editor?.commands.insertTable({
                  rows: 3,
                  cols: 3,
                  withHeaderRow: true,
                });
              }}
            />
          )}

          {!isReadOnly && !hasContent && (
            <NewStartWithAI
              documentId={Number(documentId)}
              editor={editor}
              onAfterInsertAI={(html) => debouncedSave(html)}
            />
          )}

          {isChatbotOpen && editor && <Chatbot onClose={handleToggleChatbot} editor={editor} />}
        </div>
        {commentList.length > 0 && !isReadOnly && (
          <CommentSidebar
            comments={commentList}
            activeCommentId={activeCommentId}
            onCommentClick={handleSidebarCommentClick}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </div>
  );
};

export default Document;
