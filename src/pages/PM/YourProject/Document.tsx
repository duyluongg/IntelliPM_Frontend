import '../../../components/PM/RichTextEditor/styles.scss';
import './editor.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

import debounce from 'lodash.debounce';

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
import { skipToken } from '@reduxjs/toolkit/query';
import DocumentRealtimeBridge from './DocumentRealtimeBridge';
import toast from 'react-hot-toast';
import { useGetPermissionTypeByDocumentQuery } from '../../../services/Document/documentPermissionAPI';
import type { DocumentVisibility } from '../../../types/DocumentType';
import Swal from 'sweetalert2';
import { useGetProfileByAccountIdQuery } from '../../../services/accountApi';
import { useGetByConfigKeyQuery } from '../../../services/systemConfigurationApi';

interface CommentItem {
  id: number | string;
  documentId: number; // ✅ BẮT BUỘC
  fromPos: number; // ✅ BẮT BUỘC
  toPos: number; // ✅ BẮT BUỘC
  content: string; // ✅ BẮT BUỘC
  comment: string;
}

interface MentionItem {
  id: number;
  label: string;
  name: string;
}

function collectCommentIds(doc: any): Set<string> {
  const ids = new Set<string>();
  doc.descendants((node: any) => {
    if (!node.marks) return;
    node.marks.forEach((m: any) => {
      if (m.type?.name === 'commentMark' && m.attrs?.commentId) {
        ids.add(String(m.attrs.commentId));
      }
    });
  });
  return ids;
}

export const Document: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pendingDeleteTimersRef = useRef<Map<string, number>>(new Map());
  const COMMENT_DELETE_DELAY_MS = 3000; // 3s (bạn chỉnh 2000–5000 tuỳ ý)

  const { data: commentLengthConfig } = useGetByConfigKeyQuery('comment_length');
  const minLen = Number(commentLengthConfig?.data?.minValue ?? 5);
  const maxLen = Number(commentLengthConfig?.data?.maxValue ?? 2000);

  function scheduleDelete(commentId: string) {
    if (pendingDeleteTimersRef.current.has(commentId)) return;
    const timer = window.setTimeout(async () => {
      pendingDeleteTimersRef.current.delete(commentId);
      try {
        await deleteComment({ id: Number(commentId), documentId: Number(documentId) }).unwrap();
        // tuỳ chọn: toast.success('Comment deleted');
      } catch (e) {
        console.error('Delayed delete failed', e);
        // tuỳ chọn: toast.error('Delete failed');
      }
    }, COMMENT_DELETE_DELAY_MS);
    pendingDeleteTimersRef.current.set(commentId, timer);
  }

  const CommentWatcher = Extension.create({
    name: 'commentWatcher',
    addProseMirrorPlugins() {
      return [
        new Plugin({
          appendTransaction: (_trs, oldState, newState) => {
            if (oldState.doc.eq(newState.doc)) return null;

            const oldIds = collectCommentIds(oldState.doc);
            const newIds = collectCommentIds(newState.doc);

            oldIds.forEach((id) => {
              if (!newIds.has(id)) scheduleDelete(id);
            });

            newIds.forEach((id) => {
              if (!oldIds.has(id)) cancelScheduledDelete(id);
            });

            return null; // luôn phải return Transaction | null | undefined
          },
        }),
      ];
    },
  });

  function cancelScheduledDelete(commentId: string) {
    const t = pendingDeleteTimersRef.current.get(commentId);
    if (t) {
      clearTimeout(t);
      pendingDeleteTimersRef.current.delete(commentId);
    }
  }

  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const navigate = useNavigate();
  const { documentId } = useParams();

  const numericDocId = documentId ? Number(documentId) : undefined;
  const { data: permResp, refetch: refetchPermission } = useGetPermissionTypeByDocumentQuery(
    numericDocId!,
    { skip: !numericDocId }
  );
  // thêm ref:
  const isHydratedRef = useRef(false);

  const { data: documentData, refetch: refetchDocument } = useGetDocumentByIdQuery(numericDocId!, {
    skip: !numericDocId,
    refetchOnMountOrArgChange: true,
  });

  const {
    content: initialContent,
    visibility,
    createdAt,
    updatedAt,
    createdBy,
    title,
  } = documentData || {};

  const {
    data: dataProfile,
    isLoading,
    isError,
  } = useGetProfileByAccountIdQuery(createdBy!, {
    skip: !createdBy,
  });

  const { user } = useAuth();
  const rawRole = (user?.role ?? '').toString().trim();
  const isClient = rawRole.toUpperCase() === 'CLIENT';
  const isOwner = !!user && !!createdBy && user.id === createdBy;

  const permissionType = permResp?.permissionType ?? 'VIEW';

  // const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  const projectIdRaw = useSelector((state: RootState) => state.project.currentProjectId);
  const projectId = projectIdRaw != null ? Number(projectIdRaw) : undefined;
  const { data, isSuccess } = useGetProjectByIdQuery(projectId as number, {
    skip: !projectId,
  });
  const isInProject =
    documentData?.projectId !== undefined &&
    projectId !== undefined &&
    documentData.projectId === projectId;

  const canEdit = !isClient && (isOwner || isInProject || permissionType === 'EDIT');

  console.log(isInProject, 'isInProject');
  console.log(canEdit, 'canEdit');

  const projectKey = data?.data?.projectKey;

  const projectKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    projectKeyRef.current = projectKey;
  }, [projectKey]);

  console.log(user);

  const { data: projectMembers } = useGetProjectMembersNoStatusQuery(projectId as number, {
    skip: !projectId,
  });
  console.log('Project members:', projectMembers);

  const filterAccount = projectMembers?.filter((m) => m.accountId !== user?.id);
  console.log('Filtered accounts:', filterAccount);

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

  const [currentTitle, setCurrentTitle] = useState<string>(title ?? '');
  const [updateDocument] = useUpdateDocumentMutation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [createComment] = useCreateCommentMutation();
  const { data: commentList = [], refetch: refetchComments } = useGetCommentsByDocumentIdQuery(
    Number(documentId),
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
        updateDocument({
          id: Number(documentId),
          data: { content: html, visibility, title: currentTitle },
        });
      }
    }, 500),
    [documentId, visibility, currentTitle]
  );

  const debouncedSaveRef = useRef(
    debounce((html: string, docVisibility?: DocumentVisibility) => {
      if (documentId) {
        updateDocument({
          id: Number(documentId),
          data: { content: html, visibility: docVisibility },
        });
      }
    }, 500)
  );

  const handleTitleSave = async () => {
    // Nếu không có quyền chỉnh sửa, chỉ cần thoát khỏi chế độ chỉnh sửa
    if (!canEdit) {
      setIsEditingTitle(false);
      return;
    }

    const trimmedTitle = currentTitle.trim();

    // Kiểm tra xem tiêu đề có bị bỏ trống không
    if (trimmedTitle === '') {
      toast.error('Tiêu đề không được để trống.');
      setCurrentTitle(title ?? ''); // Hoàn nguyên về tiêu đề ban đầu
      setIsEditingTitle(false);
      return; // Dừng hàm tại đây
    }

    // Chỉ gọi API nếu tiêu đề thực sự thay đổi
    if (trimmedTitle !== title) {
      try {
        await updateDocument({
          id: Number(documentId),
          data: { title: trimmedTitle, visibility }, // Lưu tiêu đề đã được trim
        }).unwrap(); // Sử dụng unwrap để bắt lỗi từ RTK Query
        toast.success('Cập nhật tiêu đề thành công!');
      } catch (err) {
        console.error('Cập nhật tiêu đề thất bại', err);
        toast.error('Không thể cập nhật tiêu đề.');
        setCurrentTitle(title ?? ''); // Hoàn nguyên tiêu đề nếu có lỗi
      }
    }

    // Thoát khỏi chế độ chỉnh sửa sau khi lưu hoặc không có gì thay đổi
    setIsEditingTitle(false);
  };

  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit,
      CommentMark,
      GanttNode,
      CommentWatcher,
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
    // onUpdate: ({ editor }) => {
    //   if (!canEdit || !isHydratedRef.current) return;
    //   const html = editor.getHTML();
    //   debouncedSaveRef.current(html, visibility);
    // },

    onUpdate: ({ editor }) => {
      if (!canEdit || !isHydratedRef.current) return;

      const raw = editor.getHTML().trim();
      const normalized = raw === '<p></p>' ? '' : raw; // 👈 chuẩn hóa rỗng

      debouncedSaveRef.current(normalized, visibility);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

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
    handleGoToComment(comment.fromPos, comment.toPos, comment.id.toString());
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
    // Chỉ thực thi khi cả editor và documentData đã sẵn sàng
    if (!editor || !documentData) {
      return;
    }

    const currentContent = editor.getHTML();
    const newContent = documentData.content || '';

    // Chỉ cập nhật nếu nội dung thật sự khác nhau
    if (currentContent !== newContent) {
      setCurrentTitle(documentData.title);

      // Cập nhật nội dung mà KHÔNG kích hoạt onUpdate
      editor.commands.setContent(newContent, false);
    }
    isHydratedRef.current = true;
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
      // Translated to English
      toast.error('Please select text to comment on!');
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to);

    const { value: commentContent } = await Swal.fire({
      // Translated to English
      title: 'Add your comment',
      html: `For the selected text: "<b>${selectedText}</b>"`,
      input: 'textarea',
      inputPlaceholder: 'Type your comment here...',
      showCancelButton: true,
      confirmButtonText: 'Comment',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'swal-confirm-button',
        cancelButton: 'swal-cancel-button',
      },
      // Translated to English
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'You need to write something!';
        }
        if (value.trim().length < minLen) {
          return `Comment must be at least ${minLen} characters.`;
        }
        if (value.trim().length > maxLen) {
          return `Comment cannot exceed ${maxLen} characters.`;
        }
        return null;
      },
    });
    // If the user entered text and clicked "Comment"
    if (commentContent) {
      try {
        const res = await createComment({
          documentId: Number(documentId),
          fromPos: from,
          toPos: to,
          content: selectedText,
          comment: commentContent,
        }).unwrap();

        const commentId = res?.id ?? 'temporary-id';

        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setMark('commentMark', { commentId })
          .run();

        await refetchComments();
        // Translated to English
        toast.success('Comment created successfully!');
      } catch (error) {
        // Translated to English
        console.error('❌ Failed to create comment:', error);
        toast.error('Failed to create comment.');
      }
    }
  };
  // Document.tsx

  const handleUpdateComment = async (commentToUpdate: CommentItem, newCommentText: string) => {
    if (!documentId) return;

    try {
      const safeMin = Number.isFinite(minLen) ? minLen : 5;
      const safeMax = Number.isFinite(maxLen) ? maxLen : 2000;

      const trimmed = (newCommentText ?? '').trim();

      if (trimmed === (commentToUpdate.comment ?? '').trim()) {
        toast('No changes to update.');
        return;
      }

      if (trimmed.length < safeMin || trimmed.length > safeMax) {
        toast.error(`Comment length must be between ${safeMin} and ${safeMax} characters.`);
        return;
      }

      await updateComment({
        id: Number(commentToUpdate.id),
        body: {
          comment: trimmed,
          // Nếu cần cập nhật lại vùng highlight + text đã chọn:
          // fromPos: commentToUpdate.fromPos,
          // toPos: commentToUpdate.toPos,
          // content: commentToUpdate.content,
        },
      }).unwrap();

      await refetchComments();
      toast.success('Comment updated.');
    } catch (error) {
      console.error('Cập nhật bình luận thất bại:', error);
      toast.error('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    // Sử dụng Swal.fire để xác nhận
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'swal-confirm-button', // Sử dụng class đã có
        cancelButton: 'swal-cancel-button', // Sử dụng class đã có
      },
    });

    // Nếu người dùng không xác nhận, thì dừng hàm
    if (!result.isConfirmed) {
      return;
    }

    // Phần logic còn lại giữ nguyên
    const commentToDelete = commentList.find((c) => c.id.toString() === commentId.toString());
    if (!commentToDelete) {
      console.error('Không tìm thấy comment để xóa trong danh sách.');
      toast.error('Could not find comment to delete.'); // Thay thế alert bằng toast
      return;
    }

    // Gỡ highlight trong editor nếu cần
    if (editor) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: commentToDelete.fromPos, to: commentToDelete.toPos })
        .unsetMark('commentMark')
        .run();
    }

    try {
      await deleteComment({
        id: Number(commentId),
        documentId: Number(documentId),
      }).unwrap();

      toast.success(' Comment deleted successfully!'); // Thêm thông báo thành công
      if (activeCommentId === commentId.toString()) setActiveCommentId(null);
    } catch (error) {
      console.error('Xóa bình luận thất bại:', error);
      toast.error('Failed to delete comment.'); // Thay thế alert bằng toast
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div className=''>
      {typeof numericDocId === 'number' && (
        <DocumentRealtimeBridge
          documentId={numericDocId}
          onPermissionChanged={() => {
            toast.success('Document permissions have been updated!');
            refetchPermission();
          }}
          onDocumentUpdated={() => {
            // toast('Tài liệu vừa được cập nhật bởi người khác.', { icon: '🔄' });
            debouncedSaveRef.current.cancel();
            refetchDocument();
          }}
        />
      )}

      {editor && isHydratedRef.current && (
        <MenuBar
          editor={editor}
          onToggleChatbot={handleToggleChatbot}
          onAddComment={handleAddComment}
          exportTargetRef={contentRef}
          createdBy={createdBy}
        />
      )}

      <div className='flex'>
        <div className=' mx-auto max-w-4xl'>
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
                  onClick={() => canEdit && setIsEditingTitle(true)}
                  title='Click to edit title'
                >
                  {currentTitle}
                </h1>
              )}
            </div>
            <div className='mt-2 flex flex-wrap items-center text-sm text-gray-600 gap-x-4 gap-y-2'>
              <div className='flex items-center gap-1'>
                <User2 className='w-4 h-4' />
                {dataProfile?.data && (
                  <span>
                    Creator <strong>{dataProfile.data.fullName}</strong>
                  </span>
                )}
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

          <div ref={contentRef}>
            <EditorContent editor={editor} />
          </div>
          {isHydratedRef.current && canEdit && !hasContent && (
            <SideMenu
              onSelectTemplate={(html) => {
                if (editor && canEdit && isHydratedRef.current) {
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

          {isHydratedRef.current && canEdit && !hasContent && (
            <NewStartWithAI
              documentId={Number(documentId)}
              editor={editor}
              onAfterInsertAI={(html) => debouncedSave(html)}
            />
          )}

          {isChatbotOpen && editor && <Chatbot onClose={handleToggleChatbot} editor={editor} />}
        </div>
        {commentList.length > 0 && (
          <CommentSidebar
            comments={commentList}
            activeCommentId={activeCommentId}
            onCommentClick={handleSidebarCommentClick}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={user?.id ?? 0}
          />
        )}
      </div>
    </div>
  );
};

export default Document;
