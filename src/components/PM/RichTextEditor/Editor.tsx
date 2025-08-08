import './styles.scss';

import { Color } from '@tiptap/extension-color';

import TextStyle from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef, useState } from 'react';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CalendarPlus, Edit3, FileText, History, LucideLock, LucideSun, Sparkles, X } from 'lucide-react';
import WriteWithAIModal from '../ModalAI/WriteWithAIModal';
import { PiProjectorScreenChartFill } from 'react-icons/pi';

import { SlashCommandExtension } from './SlashCommandExtension';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuth } from '../../../services/AuthContext';
import { useGetProjectMembersNoStatusQuery } from '../../../services/projectMemberApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { createMentionExtension } from './MentionExtension';
import ModalEditor from './ModalEditor';
import { IframeExtension } from './IframeExtension';
import { useGenerateFromTasksMutation } from '../../../services/Document/documentAPI';
import { useDocumentId } from '../../context/DocumentContext';

import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useExportDocumentMutation } from '../../../services/Document/documentExportApi';
import ShareModal from './ShareModal';
import { CommentMark } from './CommentMark';
import {
  useCreateCommentMutation,
  useGetCommentsByDocumentIdQuery,
} from '../../../services/Document/documentCommentAPI';
import CommentSidebar from './commentSidebar';
import { useVisibleCommentIds } from '../../hook/useVisibleCommentIds';

type MenuBarProps = {
  editor: ReturnType<typeof useEditor>;
  onChange: (value: string) => void;
  value: string;
};

const MenuBar = ({ editor, onChange }: MenuBarProps) => {
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [generateFromTasks, { isLoading: isGenerating }] = useGenerateFromTasksMutation();
  const documentId = useDocumentId();
  const [exportDocument] = useExportDocumentMutation();
  const { data: comments = [], refetch } = useGetCommentsByDocumentIdQuery(documentId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!editor) return null;

  const headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

  const handleGenerateFromTasks = async () => {
    if (!editor || !documentId) return;

    try {
      const response = await generateFromTasks(documentId).unwrap();

      editor.commands.setContent(response);
      onChange(response);
    } catch (err) {
      console.error('Lỗi khi gọi API generate-from-tasks:', err);
    }
  };

  const exportToPDFAndUpload = async (
    elementId: string,
    documentId: number,
    exportDocument: ReturnType<typeof useExportDocumentMutation>[0]
  ) => {
    const input = document.getElementById(elementId);
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pageHeightPx = (canvasWidth / pdfWidth) * pdfHeight;
    const totalPages = Math.ceil(canvasHeight / pageHeightPx);

    for (let page = 0; page < totalPages; page++) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeightPx;

      const pageContext = pageCanvas.getContext('2d')!;
      pageContext.fillStyle = '#ffffff';
      pageContext.fillRect(0, 0, canvasWidth, pageHeightPx);

      pageContext.drawImage(
        canvas,
        0,
        page * pageHeightPx,
        canvasWidth,
        pageHeightPx,
        0,
        0,
        canvasWidth,
        pageHeightPx
      );

      const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');

    const pdfFile = new File([pdfBlob], `document-${documentId}.pdf`, {
      type: 'application/pdf',
    });

    try {
      const result = await exportDocument({ documentId, file: pdfFile });
      if ('data' in result && result.data?.fileUrl) {
        console.log('✅ Upload success:', result.data.fileUrl);
      } else {
        console.warn('⚠️ Unexpected response:', result);
        alert('Lỗi khi upload file PDF');
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Lỗi khi upload file PDF');
    }
  };

  // Đặt hàm này bên trong component MenuBar của bạn
  const exportTablesToExcel = (htmlContent: string, filename = 'document.xlsx') => {
    // In ra toàn bộ HTML để kiểm tra
    console.log('--- Raw HTML Content ---', htmlContent);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const tables = tempDiv.querySelectorAll('table');
    // BƯỚC QUAN TRỌNG: Kiểm tra xem đã tìm thấy bao nhiêu bảng
    console.log(`Found ${tables.length} table(s) to process.`);

    if (tables.length === 0) {
      alert('Không tìm thấy bảng nào trong tài liệu để xuất ra Excel.');
      return;
    }

    const workbook = XLSX.utils.book_new();
    let successfulExports = 0;

    tables.forEach((table, index) => {
      console.log(`Processing table #${index + 1}`);
      // In ra HTML của từng bảng để kiểm tra cấu trúc
      console.log(table.outerHTML);

      try {
        // Chuyển đổi HTML của bảng thành một worksheet
        const worksheet = XLSX.utils.table_to_sheet(table);

        // (Tùy chọn) Tự động điều chỉnh độ rộng cột
        const colWidths = Array.from(table.querySelectorAll('tr:first-child > *')).map(
          (cell: Element) => {
            return { wch: (cell.textContent?.length ?? 10) + 5 };
          }
        );
        worksheet['!cols'] = colWidths;

        // Thêm worksheet vào workbook với một tên duy nhất
        XLSX.utils.book_append_sheet(workbook, worksheet, `Bảng ${index + 1}`);

        successfulExports++;
      } catch (error) {
        // Nếu có lỗi, log ra và tiếp tục xử lý các bảng tiếp theo
        console.error(`❌ Error processing table #${index + 1}:`, error);
        console.error('Problematic table HTML:', table.outerHTML);
      }
    });

    // Chỉ tạo file nếu có ít nhất một bảng được xuất thành công
    if (successfulExports > 0) {
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      saveAs(blob, filename);

      if (successfulExports < tables.length) {
        alert(
          `Đã xuất thành công ${successfulExports}/${tables.length} bảng. Một số bảng bị lỗi, vui lòng kiểm tra console (F12).`
        );
      }
    } else {
      alert(
        'Không thể xuất bảng nào ra Excel do lỗi định dạng. Vui lòng kiểm tra console (F12) để biết chi tiết.'
      );
    }
  };

  //   const exportTextToExcel = (html: string) => {
  //   const plainText = html.replace(/<[^>]+>/g, '').trim(); // loại bỏ thẻ HTML

  //   const worksheet = XLSX.utils.aoa_to_sheet([[plainText]]);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Document');

  //   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //   saveAs(data, 'document.xlsx');
  // };

  const [createComment] = useCreateCommentMutation();

  const handleAddComment = async () => {
    const selection = editor.state.selection;
    if (selection.empty) {
      alert('Chọn đoạn văn bản để comment.');
      return;
    }

    const from = selection.from;
    const to = selection.to;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    const userComment = prompt(`Bình luận cho đoạn: "${selectedText}"`);
    if (!userComment) return;

    try {
      console.log('📤 Sending comment:', { documentId, userComment });

      const data = await createComment({
        documentId,
        content: userComment,
      }).unwrap();

      console.log('✅ Comment created:', data);

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .addComment({ commentId: data.id.toString() })
        .run();

      // 🧹 Xoá storedMarks (tránh bị gán comment mark vào chữ mới)
      editor.view.dispatch(editor.state.tr.setStoredMarks([]));

      await refetch();
    } catch (error: any) {
      console.error('❌ Error creating comment:', error);
      alert(
        'Không thể thêm bình luận: ' +
          (error?.data?.message || error?.message || 'Lỗi không xác định')
      );
    }
  };

  return (
    // <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-4'>
    //   <div className='flex flex-wrap gap-2'>
    //     <div className='flex border border-gray-200 rounded-md overflow-hidden'>
    //       <button
    //         onClick={() => editor.chain().focus().toggleBold().run()}
    //         disabled={!editor.can().chain().focus().toggleBold().run()}
    //         className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
    //           editor.isActive('bold')
    //             ? 'bg-blue-50 text-blue-600 border-blue-200'
    //             : 'text-gray-700 hover:text-gray-900'
    //         }`}
    //         title='Bold'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4.5a3.5 3.5 0 001.35-6.716A3.5 3.5 0 009.5 3H5zm2.5 6H6V6h1.5a1.5 1.5 0 110 3zm1 4H6v-3h2.5a1.5 1.5 0 110 3z' />
    //         </svg>
    //       </button>
    //       <button
    //         onClick={() => editor.chain().focus().toggleItalic().run()}
    //         disabled={!editor.can().chain().focus().toggleItalic().run()}
    //         className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
    //           editor.isActive('italic')
    //             ? 'bg-blue-50 text-blue-600 border-blue-200'
    //             : 'text-gray-700 hover:text-gray-900'
    //         }`}
    //         title='Italic'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M8.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 010-1h.5V4h-.5a.5.5 0 010-1h1zm2.5 0h3a.5.5 0 010 1h-1v8h1a.5.5 0 010 1h-3a.5.5 0 010-1h1V4h-1a.5.5 0 010-1z' />
    //         </svg>
    //       </button>
    //       <button
    //         onClick={() => editor.chain().focus().toggleStrike().run()}
    //         disabled={!editor.can().chain().focus().toggleStrike().run()}
    //         className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
    //           editor.isActive('strike')
    //             ? 'bg-blue-50 text-blue-600 border-blue-200'
    //             : 'text-gray-700 hover:text-gray-900'
    //         }`}
    //         title='Strikethrough'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M6 11h8v2H6v-2zm2-4h4v2H8V7zm-2 8h8v2H6v-2z' />
    //         </svg>
    //       </button>
    //       {/* <button
    //         onClick={() => editor.chain().focus().toggleCode().run()}
    //         disabled={!editor.can().chain().focus().toggleCode().run()}
    //         className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
    //           editor.isActive('code')
    //             ? 'bg-blue-50 text-blue-600 border-blue-200'
    //             : 'text-gray-700 hover:text-gray-900'
    //         }`}
    //         title='Code'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M13.962 8.795l1.414 1.414L12.548 13l2.828 2.828-1.414 1.414L10.134 13l3.828-3.828zm-7.924 0L2.21 12.621l3.828 3.828 1.414-1.414L4.624 13l2.828-2.828-1.414-1.414z' />
    //         </svg>
    //       </button> */}
    //     </div>

    //     <div className='flex border border-gray-200 rounded-md overflow-hidden'>
    //       <button
    //         onClick={() => editor.chain().focus().unsetAllMarks().run()}
    //         className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors'
    //         title='Clear marks'
    //       >
    //         Clear
    //       </button>
    //       <button
    //         onClick={() => editor.chain().focus().clearNodes().run()}
    //         className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors'
    //         title='Clear nodes'
    //       >
    //         Reset
    //       </button>
    //     </div>

    //     <div className='flex border border-gray-200 rounded-md overflow-hidden'>
    //       <button
    //         onClick={() => editor.chain().focus().undo().run()}
    //         disabled={!editor.can().chain().focus().undo().run()}
    //         className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    //         title='Undo'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l5.293 5.293a1 1 0 01-1.414 1.414l-6-6z' />
    //         </svg>
    //       </button>
    //       <button
    //         onClick={() => editor.chain().focus().redo().run()}
    //         disabled={!editor.can().chain().focus().redo().run()}
    //         className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    //         title='Redo'
    //       >
    //         <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
    //           <path d='M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-5.293-5.293a1 1 0 011.414-1.414l6 6z' />
    //         </svg>
    //       </button>
    //     </div>

    //     <div className='relative'>
    //       {/* Nút chính */}
    //       <button
    //         onClick={() => setShowAIOptions((prev) => !prev)}
    //         className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
    //           editor.isActive('textStyle', { color: '#958DF1' })
    //             ? 'bg-purple-50 text-purple-600 border-purple-200'
    //             : 'text-gray-700 hover:text-gray-900'
    //         }`}
    //         title='AI Assistant'
    //       >
    //         <div className='flex items-center gap-2'>
    //           <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg'>
    //             <Sparkles className='w-5 h-5 text-white' />
    //           </div>
    //           <span>AI Assistant</span>
    //         </div>
    //       </button>

    //       {/* Menu Option */}
    //       {showAIOptions && (
    //         <div className='absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden'>
    //           <div className='p-2'>
    //             <div className='flex items-center justify-between mb-2'>
    //               <h3 className='text-sm font-medium text-gray-800'>AI Assistant</h3>
    //               <button
    //                 onClick={() => setShowAIOptions(false)}
    //                 className='p-1 hover:bg-gray-100 rounded transition-colors'
    //               >
    //                 <X className='w-3 h-3 text-gray-500' />
    //               </button>
    //             </div>

    //             <div className='space-y-1'>
    //               <button
    //                 onClick={() => {
    //                   setShowAIOptions(false);
    //                   setShowWriteModal(true);
    //                 }}
    //                 className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
    //               >
    //                 <Edit3 className='w-4 h-4 text-blue-500' />
    //                 <span>Write with AI</span>
    //               </button>

    //               <button
    //                 onClick={() => {
    //                   setShowAIOptions(false);
    //                   setShowSummarizeModal(true);
    //                 }}
    //                 className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
    //               >
    //                 <FileText className='w-4 h-4 text-green-500' />
    //                 <span>Summarize</span>
    //               </button>

    //               <button
    //                 onClick={() => {
    //                   setShowAIOptions(false);
    //                   handleGenerateFromTasks();
    //                 }}
    //                 className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
    //               >
    //                 <FileText className='w-4 h-4 text-green-500' />
    //                 <span>Task Summary</span>
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       )}

    //       {/* Modal viết AI */}
    //       {showWriteModal && (
    //         <div className='absolute top-full mt-2 right-0 z-50'>
    //           <WriteWithAIModal
    //             editor={editor}
    //             onClose={() => setShowWriteModal(false)}
    //             form='write_with_ai'
    //           />
    //         </div>
    //       )}

    //       {showSummarizeModal && (
    //         <div className='absolute top-full mt-2 right-0 z-50'>
    //           <WriteWithAIModal
    //             editor={editor}
    //             onClose={() => setShowSummarizeModal(false)}
    //             form='summarize'
    //           />
    //         </div>
    //       )}
    //     </div>

    //     <div className='flex  rounded-md overflow-hidden gap-3'>
    //       <button
    //         onClick={() => exportToPDFAndUpload('pdf-content', documentId, exportDocument)}
    //         className='px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors'
    //       >
    //         Export PDF
    //       </button>

    //       <button
    //         onClick={() => exportTablesToExcel(editor.getHTML(), 'tables-export.xlsx')}
    //         className='px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors'
    //         title='Export Excel'
    //       >
    //         Export Excel
    //       </button>

    //       <div className='flex  rounded-md overflow-hidden gap-3'>
    //         <button
    //           onClick={openModal}
    //           className='px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors'
    //         >
    //           Share
    //         </button>

    //         <ShareModal isOpen={isModalOpen} onClose={closeModal} />

    //         <button
    //           onClick={handleAddComment}
    //           className='px-3 py-2 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 transition-colors'
    //         >
    //           Add Comment
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-3 mb-4'>
      {/* Thay đổi: Dùng justify-between để tách biệt các nhóm công cụ */}
      <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
        {/* NHÓM CÔNG CỤ BÊN TRÁI */}
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
          {/* Nhóm Bold, Italic, Strike */}
          {/* Thay đổi: Dùng divide-x để tạo đường kẻ ngăn cách, code gọn hơn */}
          <div className='flex border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden divide-x divide-gray-200 dark:divide-gray-600'>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive('bold')
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title='Bold (Ctrl+B)'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4.5a3.5 3.5 0 001.35-6.716A3.5 3.5 0 009.5 3H5zm2.5 6H6V6h1.5a1.5 1.5 0 110 3zm1 4H6v-3h2.5a1.5 1.5 0 110 3z' />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive('italic')
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title='Italic (Ctrl+I)'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M8.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 010-1h.5V4h-.5a.5.5 0 010-1h1zm2.5 0h3a.5.5 0 010 1h-1v8h1a.5.5 0 010 1h-3a.5.5 0 010-1h1V4h-1a.5.5 0 010-1z' />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                editor.isActive('strike')
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title='Strikethrough'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M6 11h8v2H6v-2zm2-4h4v2H8V7zm-2 8h8v2H6v-2z' />
              </svg>
            </button>
          </div>

          {/* Nhóm Undo, Redo */}
          <div className='flex border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden divide-x divide-gray-200 dark:divide-gray-600'>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className='px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Undo (Ctrl+Z)'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l5.293 5.293a1 1 0 01-1.414 1.414l-6-6z' />
              </svg>
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className='px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Redo (Ctrl+Y)'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-5.293-5.293a1 1 0 011.414-1.414l6 6z' />
              </svg>
            </button>
          </div>

          {/* Nhóm AI Assistant */}
          <div className='relative'>
            <button
              onClick={() => setShowAIOptions((prev) => !prev)}
              className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
              title='AI Assistant'
            >
              <Sparkles className='w-4 h-4 text-purple-500' />
              <span>AI Tools</span>
            </button>

            {showAIOptions && (
              // Thay đổi: Thêm shadow-xl, dark mode, tinh chỉnh lại menu
              <div className='absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 min-w-[220px] overflow-hidden'>
                <div className='p-2'>
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-200 px-2'>
                      AI Assistant
                    </h3>
                    <button
                      onClick={() => setShowAIOptions(false)}
                      className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                    >
                      <X className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                    </button>
                  </div>
                  <div className='space-y-1'>
                    <button
                      onClick={() => {
                        setShowAIOptions(false);
                        setShowWriteModal(true);
                      }}
                      className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors'
                    >
                      <Edit3 className='w-4 h-4 text-blue-500' />
                      <span>Write with AI</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAIOptions(false);
                        setShowSummarizeModal(true);
                      }}
                      className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors'
                    >
                      <FileText className='w-4 h-4 text-green-500' />
                      <span>Summarize</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAIOptions(false);
                        handleGenerateFromTasks();
                      }}
                      className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors'
                    >
                      <PiProjectorScreenChartFill className='w-4 h-4 text-pink-500' />
                      <span>Project Summary</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modals nên được render bên ngoài cấu trúc này hoặc dùng Portal để tránh lỗi z-index */}
            {showWriteModal && (
              <div className='absolute top-full mt-2 right-0 z-50'>
                <WriteWithAIModal
                  editor={editor}
                  onClose={() => setShowWriteModal(false)}
                  form='write_with_ai'
                />
              </div>
            )}
            {showSummarizeModal && (
              <div className='absolute top-full mt-2 right-0 z-50'>
                <WriteWithAIModal
                  editor={editor}
                  onClose={() => setShowSummarizeModal(false)}
                  form='summarize'
                />
              </div>
            )}
          </div>
        </div>

        {/* NHÓM HÀNH ĐỘNG BÊN PHẢI */}
        <div className='flex items-center gap-2'>
          {/* Thay đổi: Sử dụng kiểu nút phụ (secondary) cho các hành động ít quan trọng hơn */}
          <button
            onClick={() => exportTablesToExcel(editor.getHTML(), 'tables-export.xlsx')}
            className='px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
            title='Export Excel'
          >
            Export Excel
          </button>
          <button
            onClick={() => exportToPDFAndUpload('pdf-content', documentId, exportDocument)}
            className='px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
          >
            Export PDF
          </button>

          {/* Thay đổi: Dùng màu chính (primary) cho hành động quan trọng nhất */}
          <button
            onClick={openModal}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            Share
          </button>
          <ShareModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
      </div>
    </div>
  );
};

const templates = {
  'to-do-list': `
  <h1 style="color: #6C6C6C;">Name your to do list</h1>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #F7C841;">&#128193;</span> 
      <span style="color: #000000;">Today</span>
    </span>
  </h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Add a task for today and turn it into an item on your board</p>
    </li>
  </ul>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #FF9800;">&#10024;</span> 
      <span style="color: #000000;">Priorities for the week</span>
    </span>
  </h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>Add a task, use '@' to mention someone</p>
    </li>
  </ul>

  <h2 class="task-category-header">
    <span class="highlight-bg">
      <span style="color: #9C27B0;">&#128220;</span> 
      <span style="color: #000000;">Upcoming tasks</span>
    </span>
  </h2>
  
  <h3 class="task-project-header">Name of project 1</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>List</p>
    </li>
  </ul>

  <h3 class="task-project-header">Name of project 2</h3>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false">
      <p>or type '/board' to insert a board here</p>
    </li>
  </ul>
`,
  'project-plan': `
    <h1>Kế Hoạch Dự Án: [Điền Tên Dự Án]</h1>
    <p><strong>Ngày bắt đầu:</strong> [Ngày]</p>
    <p><strong>Ngày kết thúc dự kiến:</strong> [Ngày]</p>
    <p><strong>Người phụ trách chính:</strong> [Tên]</p>

    <h2>1. Mục Tiêu Dự Án</h2>
    <p>Mô tả rõ ràng các mục tiêu chính mà dự án này muốn đạt được. Đảm bảo các mục tiêu là SMART (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
    <ul>
      <li>Mục tiêu 1:</li>
      <li>Mục tiêu 2:</li>
      <li>Mục tiêu 3:</li>
    </ul>

    <h2>2. Phạm Vi Dự Án</h2>
    <p>Xác định ranh giới và giới hạn của dự án. Liệt kê những gì sẽ được bao gồm và những gì sẽ không được bao gồm.</p>
    <ul>
      <li><strong>Bao gồm:</strong></li>
      <li><strong>Không bao gồm:</strong></li>
    </ul>

    <h2>3. Lịch Trình & Giai Đoạn</h2>
    <table>
      <thead>
        <tr>
          <th>Giai đoạn</th>
          <th>Mô tả</th>
          <th>Ngày bắt đầu</th>
          <th>Ngày kết thúc dự kiến</th>
          <th>Người chịu trách nhiệm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Khởi tạo</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Lập kế hoạch</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Thực hiện</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Kiểm tra & Đánh giá</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Kết thúc</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <h2>4. Nguồn Lực</h2>
    <p>Liệt kê các nguồn lực cần thiết cho dự án (nhân lực, tài chính, công cụ, vật liệu).</p>
    <ul>
      <li>Nhân lực:</li>
      <li>Ngân sách:</li>
      <li>Công cụ:</li>
    </ul>

    <h2>5. Rủi Ro & Giảm Thiểu</h2>
    <p>Xác định các rủi ro tiềm ẩn và kế hoạch giảm thiểu cho từng rủi ro.</p>
    <ul>
      <li>Rủi ro 1: [Mô tả] - Giải pháp: [Kế hoạch giảm thiểu]</li>
      <li>Rủi ro 2: [Mô tả] - Giải pháp: [Kế hoạch giảm thiểu]</li>
    </ul>

    <h2>6. Các Bên Liên Quan</h2>
    <p>Liệt kê các bên liên quan chính và vai trò của họ trong dự án.</p>
    <ul>
      <li>[Tên / Chức vụ]: [Vai trò]</li>
    </ul>
  `,
  'feature-specs': `
  <h1>📄 Feature Specification: [Tên Tính Năng]</h1>
  <p><strong>Project:</strong> [Tên Dự Án]</p>
  <p><strong>Owner:</strong> [Tên người phụ trách]</p>
  <p><strong>Date:</strong> [Ngày]</p>

  <h2>1. 📝 Mô tả tổng quan</h2>
  <p>Mô tả ngắn gọn về tính năng, bối cảnh sử dụng, và lý do xây dựng.</p>

  <h2>2. 🎯 Mục tiêu</h2>
  <ul>
    <li>Giải quyết vấn đề gì?</li>
    <li>Giá trị mang lại cho người dùng?</li>
    <li>Chỉ số thành công (KPIs)</li>
  </ul>

  <h2>3. 🧩 Phạm vi tính năng</h2>
  <ul>
    <li>Chức năng chính</li>
    <li>Chức năng phụ</li>
    <li>Không bao gồm gì</li>
  </ul>

  <h2>4. 👤 Đối tượng sử dụng</h2>
  <p>Ai là người sẽ dùng tính năng này (vai trò, nhóm người dùng...)?</p>

  <h2>5. 🔄 Luồng người dùng (User Flow)</h2>
  <ol>
    <li>Bước 1: [Mô tả]</li>
    <li>Bước 2: [Mô tả]</li>
    <li>...</li>
  </ol>

  <h2>6. 🖼️ Wireframe / Mockup</h2>
  <p>Gắn liên kết tới thiết kế hoặc hình ảnh.</p>

  <h2>7. 🧪 Test Cases</h2>
  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Tình huống kiểm thử</th>
        <th>Input</th>
        <th>Kết quả mong đợi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Người dùng nhấn nút "Lưu"</td>
        <td>Form hợp lệ</td>
        <td>Hiển thị thông báo thành công</td>
      </tr>
    </tbody>
  </table>

  <h2>8. 🚧 Ràng buộc & Lưu ý</h2>
  <ul>
    <li>Hiệu suất, độ trễ tối đa?</li>
    <li>Tương thích với thiết bị nào?</li>
    <li>Yêu cầu bảo mật / phân quyền?</li>
  </ul>

  <h2>9. ✅ Checklist hoàn thành</h2>
  <ul data-type="taskList">
    <li data-type="taskItem" data-checked="false"><p>Đã duyệt yêu cầu</p></li>
    <li data-type="taskItem" data-checked="false"><p>Hoàn thành mockup</p></li>
    <li data-type="taskItem" data-checked="false"><p>Viết test case</p></li>
    <li data-type="taskItem" data-checked="false"><p>Triển khai và review</p></li>
  </ul>
`,
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  showTemplatePicker: boolean;
  setShowTemplatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  projectId?: number;
  permission?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  title,
  onTitleChange,
  showTemplatePicker,
  setShowTemplatePicker,
  projectId,
  permission = 'edit',
  createdAt,
  updatedAt,
}: Props) {
  const { user } = useAuth();
  const currentProjectId = useSelector((state: RootState) => state.project.currentProjectId);
  const actualProjectId = projectId || currentProjectId;

  const [editor, setEditor] = useState<Editor | null>(null);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const onGanttCallbackRef = useRef(() => setShowGanttModal(true));
  onGanttCallbackRef.current = () => setShowGanttModal(true);
  const documentId = useDocumentId();
  const { data: members = [] } = useGetProjectMembersNoStatusQuery(actualProjectId!, {
    skip: !actualProjectId,
  });

  console.log(value);

  const { data: comments = [], refetch } = useGetCommentsByDocumentIdQuery(documentId);
  const visibleCommentIds = useVisibleCommentIds(editor);
  const filteredComments = comments?.filter((c) => visibleCommentIds.includes(c.id.toString()));

  const mentionItems = useMemo(
    () =>
      members.map((m) => ({
        id: m.accountId,
        label: m.accountName,
      })),
    [members]
  );
  const mentionItemsRef = useRef(mentionItems);

  // ✅ BƯỚC 2: Sử dụng useEffect để cập nhật ref mỗi khi mentionItems thay đổi
  useEffect(() => {
    mentionItemsRef.current = mentionItems;
  }, [mentionItems]);

  const mentionExtension = useMemo(() => {
    // Truyền vào cả ref, chứ không phải giá trị
    return createMentionExtension(mentionItemsRef);
  }, []);

  function stripMarkdownCodeBlock(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(/^```html\s*([\s\S]*?)\s*```$/i, '$1').trim();
  }

  useEffect(() => {
    if (editor) return;

    const instance = new Editor({
      extensions: [
        StarterKit,
        TextStyle,
        Color,
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({ nested: true }),
        mentionExtension,
        // createMentionExtension(mentionItems),
        CommentMark,
        SlashCommandExtension.configure({
          onGanttCommand: () => onGanttCallbackRef.current(),
        }),
        IframeExtension,
      ],
      editable: permission !== 'view',
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (html !== value && permission !== 'view') onChange(html);
      },
    });

    instance.commands.setContent(stripMarkdownCodeBlock(value || '<p></p>'), false);

    setEditor(instance);
    return () => {
      instance.destroy();
    };
  }, [permission]);

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(stripMarkdownCodeBlock(value || '<p></p>'), false);
    }
  }, [value, editor]);

  const applyTemplate = (templateKey: keyof typeof templates) => {
    if (!editor) return;
    const templateContent = templates[templateKey];
    const newContent = editor.getHTML() + templateContent;
    editor.commands.setContent(newContent);
    onChange(newContent);
    setShowTemplatePicker(false);
  };

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const commentId = target.getAttribute('data-comment-id');
      if (!commentId) return;

      const highlight = (selector: string) => {
        document.querySelectorAll(`[data-comment-id="${commentId}"]`).forEach((el) => {
          el.classList.add('ring', 'ring-blue-400');
        });
      };

      highlight(`[data-comment-id="${commentId}"]`);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const commentId = (e.target as HTMLElement).getAttribute('data-comment-id');
      if (!commentId) return;

      const removeHighlight = () => {
        document.querySelectorAll(`[data-comment-id="${commentId}"]`).forEach((el) => {
          el.classList.remove('ring', 'ring-blue-400');
        });
      };

      removeHighlight();
    };

    const handleClick = (e: MouseEvent) => {
      const commentId = (e.target as HTMLElement).getAttribute('data-comment-id');
      if (!commentId) return;

      const editorEl = document.querySelector(`[data-comment-id="${commentId}"]`);
      if (editorEl) {
        editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const allCommentElements = document.querySelectorAll('[data-comment-id]');
    allCommentElements.forEach((el) => {
      el.addEventListener('mouseover', handleMouseOver as EventListener);
      el.addEventListener('mouseout', handleMouseOut as EventListener);
      el.addEventListener('click', handleClick as EventListener);
    });

    return () => {
      allCommentElements.forEach((el) => {
        el.removeEventListener('mouseover', handleMouseOver as EventListener);
        el.removeEventListener('mouseout', handleMouseOut as EventListener);
        el.removeEventListener('click', handleClick as EventListener);
      });
    };
  }, [comments]);

  return (
    <div>
      <div>
        <div className='sticky top-0 z-10 bg-white'>
          {editor && permission !== 'view' && (
            <MenuBar editor={editor} onChange={onChange} value={value} />
          )}
        </div>
        <div className='flex '>
          <div className='prose max-w-none flex-1'>
            <div className='flex items-center mb-6'>
              <TextareaAutosize
                className='text-3xl font-bold text-gray-800 w-full bg-transparent focus:outline-none'
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder='Untitled document'
                readOnly={permission === 'view'}
              />
            </div>

            <div className='flex items-center text-sm text-gray-500 mb-2'>
              <div className='flex items-center mr-4'>
                <div className='w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-2'>
                  DL
                </div>
                <span>
                  Creator <span className='font-semibold text-gray-700'>{user?.username}</span>
                </span>
              </div>
              <div className='flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400'>
                <div className='flex items-center'>
                  <CalendarPlus size={16} className='mr-1.5 text-gray-400 dark:text-gray-500' />
                  <span>
                    Created:{' '}
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>
                      {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </span>
                </div>

                <div className='flex items-center'>
                  <History size={16} className='mr-1.5 text-gray-400 dark:text-gray-500' />
                  <span>
                    Last updated:{' '}
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>
                      {updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div id='pdf-content' className='mx-auto'>
              <EditorContent editor={editor} />
            </div>
          </div>

          <CommentSidebar comments={comments} refetch={refetch} editor={editor} />
        </div>
        {showTemplatePicker && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl'>
              <h2 className='text-2xl font-bold mb-6 text-center'>Document Template</h2>
              <div className='flex gap-4 justify-center flex-wrap'>
                {Object.entries(templates).map(([key, content]) => (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key as keyof typeof templates)}
                    className='w-36 h-28 p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center'
                  >
                    <span className='text-2xl mb-2'>📄</span>
                    <span className='font-medium text-sm leading-tight'>{key}</span>
                  </button>
                ))}
              </div>
              <div className='text-center mt-6'>
                <button
                  className='px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm'
                  onClick={() => setShowTemplatePicker(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showGanttModal && (
          <ModalEditor
            onClose={() => setShowGanttModal(false)}
            onSelectProject={handleGanttInsert}
          />
        )}
      </div>
    </div>
  );

  function handleGanttInsert(projectId: number) {
    const iframeHTML = `
      <div class="my-4">
        <iframe src="/gantt-view/${projectId}" width="100%" height="400" class="border border-gray-300 rounded-lg"></iframe>
      </div>
      <p><br></p>`;
    editor?.commands.insertContent(iframeHTML);
    setShowGanttModal(false);
  }
}
