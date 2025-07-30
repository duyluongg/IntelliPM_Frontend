import './styles.scss';

import { Color } from '@tiptap/extension-color';
// import ListItem from '@tiptap/extension-list-item';
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
import { Edit3, FileText, LucideLock, LucideSun, Sparkles, X } from 'lucide-react';
import WriteWithAIModal from '../ModalAI/WriteWithAIModal';
import { HiOutlineTemplate, HiOutlineTable, HiOutlineChartBar } from 'react-icons/hi'; // Các biểu tượng khác
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
// import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useExportDocumentMutation } from '../../../services/Document/documentExportApi';

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

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-4'>
      <div className='flex flex-wrap gap-2'>
        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('bold')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Bold'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4.5a3.5 3.5 0 001.35-6.716A3.5 3.5 0 009.5 3H5zm2.5 6H6V6h1.5a1.5 1.5 0 110 3zm1 4H6v-3h2.5a1.5 1.5 0 110 3z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('italic')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Italic'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M8.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-1a.5.5 0 010-1h.5V4h-.5a.5.5 0 010-1h1zm2.5 0h3a.5.5 0 010 1h-1v8h1a.5.5 0 010 1h-3a.5.5 0 010-1h1V4h-1a.5.5 0 010-1z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('strike')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Strikethrough'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M6 11h8v2H6v-2zm2-4h4v2H8V7zm-2 8h8v2H6v-2z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('code')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Code'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M13.962 8.795l1.414 1.414L12.548 13l2.828 2.828-1.414 1.414L10.134 13l3.828-3.828zm-7.924 0L2.21 12.621l3.828 3.828 1.414-1.414L4.624 13l2.828-2.828-1.414-1.414z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors'
            title='Clear marks'
          >
            Clear
          </button>
          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors'
            title='Clear nodes'
          >
            Reset
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('paragraph')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Paragraph'
          >
            P
          </button>
          {headingLevels.map((level) => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors hover:bg-gray-50 ${
                editor.isActive('heading', { level })
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('bulletList')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Bullet list'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M4 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm6-10h6a1 1 0 010 2h-6a1 1 0 010-2zm0 6h6a1 1 0 010 2h-6a1 1 0 010-2zm0 6h6a1 1 0 010 2h-6a1 1 0 010-2z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('orderedList')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Ordered list'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('codeBlock')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Code block'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-2 text-sm font-medium border-r border-gray-200 transition-colors hover:bg-gray-50 ${
              editor.isActive('blockquote')
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Blockquote'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors'
            title='Horizontal rule'
          >
            HR
          </button>
          <button
            onClick={() => editor.chain().focus().setHardBreak().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors'
            title='Hard break'
          >
            BR
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Undo'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l5.293 5.293a1 1 0 01-1.414 1.414l-6-6z' />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Redo'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M16.707 9.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-5.293-5.293a1 1 0 011.414-1.414l6 6z' />
            </svg>
          </button>
        </div>

        <div className='flex border border-gray-200 rounded-md overflow-hidden'>
          <button
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='Purple color'
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-purple-400'></div>
              <span>A</span>
            </div>
          </button>
        </div>

        {/* <div className='relative'>
          <button
            onClick={() => setShowAIOptions((prev) => !prev)}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='AI Assistant'
          >
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-400 to-purple-400 rounded-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <span>AI Assistant</span>
            </div>
          </button>

          {showAIOptions && (
            <div className='absolute top-full mt-2 right-0 z-50'>
              <WriteWithAIModal editor={editor} onClose={() => setShowAIOptions(false)} />
            </div>
          )}
        </div> */}

        <div className='relative'>
          {/* Nút chính */}
          <button
            onClick={() => setShowAIOptions((prev) => !prev)}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
              editor.isActive('textStyle', { color: '#958DF1' })
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            title='AI Assistant'
          >
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <span>AI Assistant</span>
            </div>
          </button>

          {/* Menu Option */}
          {showAIOptions && (
            <div className='absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden'>
              <div className='p-2'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-sm font-medium text-gray-800'>AI Assistant</h3>
                  <button
                    onClick={() => setShowAIOptions(false)}
                    className='p-1 hover:bg-gray-100 rounded transition-colors'
                  >
                    <X className='w-3 h-3 text-gray-500' />
                  </button>
                </div>

                <div className='space-y-1'>
                  <button
                    onClick={() => {
                      setShowAIOptions(false);
                      setShowWriteModal(true);
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    <Edit3 className='w-4 h-4 text-blue-500' />
                    <span>Write with AI</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIOptions(false);
                      setShowSummarizeModal(true);
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    <FileText className='w-4 h-4 text-green-500' />
                    <span>Summarize</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAIOptions(false);
                      handleGenerateFromTasks();
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
                  >
                    <FileText className='w-4 h-4 text-green-500' />
                    <span>Task Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal viết AI */}
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
        <div>
          <button
            onClick={() => exportToPDFAndUpload('pdf-content', documentId, exportDocument)}
            className='px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors'
          >
            Export & Upload PDF
          </button>

          <button
            onClick={() => exportTablesToExcel(editor.getHTML(), 'tables-export.xlsx')}
            className='px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors'
            title='Export Excel'
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// const extensions = [
//   Color.configure({ types: [TextStyle.name, ListItem.name] }),
//   TextStyle.configure({ types: [ListItem.name] }),
//   StarterKit.configure({
//     bulletList: { keepMarks: true, keepAttributes: false },
//     orderedList: { keepMarks: true, keepAttributes: false },
//   }),
// ];

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
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;

  showTemplatePicker: boolean;
  setShowTemplatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  projectId?: number;
};

export default function RichTextEditor({
  value,
  onChange,
  title,
  onTitleChange,
  showTemplatePicker,
  setShowTemplatePicker,
}: Props) {
  const cleanedValue = stripMarkdownCodeBlock(value);
  const { user } = useAuth();
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  console.log('Project ID:', projectId);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const onGanttCallbackRef = useRef(() => setShowGanttModal(true));

  // 👇 BƯỚC 2: Luôn cập nhật ref với hàm mới nhất mỗi khi component render lại
  onGanttCallbackRef.current = () => setShowGanttModal(true);

  //   const handleGanttInsert = (projectId) => {
  //     const cleanKey = projectKey.trim();
  //     const iframeHTML = `
  //   <div class="my-4">
  //     <iframe src="/gantt-view/${cleanKey}" width="100%" height="400" class="border border-gray-300 rounded-lg"></iframe>
  //   </div>
  //   <p><br></p>
  // `;
  //     editor?.commands.insertContent(iframeHTML);

  //     setShowGanttModal(false);
  //   };
  const handleGanttInsert = (projectId: number) => {
    const iframeHTML = `
    <div class="my-4">
      <iframe src="/gantt-view/${projectId}" width="100%" height="400" class="border border-gray-300 rounded-lg"></iframe>
    </div>
    <p><br></p>
  `;
    editor?.commands.insertContent(iframeHTML);
    setShowGanttModal(false);
  };

  const { data: members = [] } = useGetProjectMembersNoStatusQuery(projectId!, {
    skip: !projectId,
  });
  console.log(members, 'Members data from query');

  const mentionItems = useMemo(
    () =>
      members.map((m) => ({
        id: m.accountId,
        label: m.accountName,
      })),
    [members]
  );

  useEffect(() => {
    if (mentionItems.length === 0 || editor) return;

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
        createMentionExtension(mentionItems),

        SlashCommandExtension.configure({
          onGanttCommand: () => onGanttCallbackRef.current(),
        }),

        // SlashCommandExtension,

        IframeExtension,
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (html !== value) onChange(html);
      },
    });

    setEditor(instance);
  }, [mentionItems, editor]);

  useEffect(() => {
    if (editor && cleanedValue && editor.getHTML() !== cleanedValue) {
      editor.commands.setContent(cleanedValue, false);
    }
  }, [value, editor]);

  const applyTemplate = (templateKey: keyof typeof templates) => {
    if (editor) {
      const templateContent = templates[templateKey];
      const currentEditorContent = editor.getHTML();
      const newContentAfterTemplate = currentEditorContent + templateContent;
      editor.commands.setContent(editor.getHTML() + templateContent);
      setShowTemplatePicker(false);

      onChange(newContentAfterTemplate);
    }
  };
  const isEmptyContent = (html: string) =>
    !html || html.trim() === '' || html.trim() === '<p></p>' || html.trim() === '<p><br></p>';

  return (
    <div>
      <div className='sticky top-0 z-10 bg-white'>
        {editor && <MenuBar editor={editor} onChange={onChange} value={value} />}
      </div>

      <div className='prose max-w-none'>
        <div className='flex items-center mb-6'>
          <TextareaAutosize
            className='text-3xl font-bold text-gray-800 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-none border-none shadow-none'
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='Untitled document'
          />
        </div>

        <div className='flex items-center text-sm text-gray-500 mb-6'>
          <div className='flex items-center mr-4'>
            <div className='w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-2'>
              DL
            </div>
            <span>
              Creator <span className='font-semibold text-gray-700'>{user?.username}</span>
            </span>
          </div>
          <div className='flex items-center mr-4'>
            <LucideSun className='mr-1' />
            <span>
              Created <span className='font-semibold text-gray-700'>Jul 21, 2025, 12:41</span>
            </span>
          </div>
          <div className='flex items-center'>
            <LucideLock className='mr-1' />
            <span>
              Last updated <span className='font-semibold text-gray-700'>Jul 21, 2025, 12:41</span>
            </span>
          </div>
        </div>

        <div id='pdf-content' className='p-8 bg-white'>
          <EditorContent editor={editor} />
        </div>

        {isEmptyContent(value) && (
          <div className='space-y-4'>
            <OptionItem
              icon={<HiOutlineTemplate className='w-5 h-5' />}
              text='Templates'
              onClick={() => setShowTemplatePicker(true)}
            />
            <OptionItem icon={<HiOutlineTable className='w-5 h-5' />} text='Table' />
            <OptionItem icon={<HiOutlineChartBar className='w-5 h-5' />} text='Chart' />
            <OptionItem icon={<HiOutlineChartBar className='w-5 h-5' />} text='Board values' />
            <OptionItem icon={<HiOutlineChartBar className='w-5 h-5' />} text='Board' />
          </div>
        )}

        {showTemplatePicker && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl'>
              <h2 className='text-2xl font-bold mb-6 text-center'>Document Template</h2>

              <div className='flex gap-4 justify-center flex-wrap'>
                <button
                  onClick={() => applyTemplate('project-plan')}
                  className='w-36 h-28 p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center'
                >
                  <span className='text-2xl mb-2'>🚧</span>
                  <span className='font-medium text-sm leading-tight'>
                    Project
                    <br />
                    Plan
                  </span>
                </button>

                <button
                  onClick={() => applyTemplate('to-do-list')}
                  className='w-36 h-28 p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center text-center'
                >
                  <span className='text-2xl mb-2'>✅</span>
                  <span className='font-medium text-sm leading-tight'>
                    To-Do
                    <br />
                    List
                  </span>
                </button>
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
      </div>
      {showGanttModal && (
        <>
          {console.log('ModalEditor rendered 🟩')}
          <ModalEditor
            onClose={() => setShowGanttModal(false)}
            onSelectProject={handleGanttInsert}
          />
        </>
      )}
    </div>
  );
}

function stripMarkdownCodeBlock(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/^```html\s*([\s\S]*?)\s*```$/i, '$1').trim();
}

interface OptionItemProps {
  icon: React.ReactNode;
  text: string;

  onClick?: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({ icon, text, onClick }) => {
  return (
    <div
      className='flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200'
      onClick={onClick}
    >
      <div className='text-purple-500 mr-3'>{icon}</div>
      <span className='text-gray-700 font-medium'>{text}</span>
    </div>
  );
};
