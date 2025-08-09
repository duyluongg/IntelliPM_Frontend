import React, { Fragment, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Menu, Transition, Dialog, Switch } from '@headlessui/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Undo,
  Redo,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  CaseSensitive,
  FileText,
  Sparkles,
  FileDown,
  Sheet,
  MessageSquarePlus,
  Share2,
  Lock,
  Crown,
  X,
} from 'lucide-react';

import * as XLSX from 'xlsx';

import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { useExportDocumentMutation } from '../../../services/Document/documentExportApi';
import { useParams } from 'react-router-dom';
import { useShareDocumentByEmailsMutation } from '../../../services/Document/documentAPI';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { useGetProjectByIdQuery } from '../../../services/projectApi';
import toast from 'react-hot-toast';

interface Props {
  editor: Editor | null;
  onToggleChatbot?: () => void;
  onAddComment?: () => void;
}

// Lớp CSS dùng chung cho các item trong dropdown
const dropdownItemClass =
  'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50';

const MenuBar: React.FC<Props> = ({ editor, onToggleChatbot, onAddComment }) => {
  if (!editor) {
    return null;
  }
  const params = useParams();
  const isTextSelected = editor.state.selection.from !== editor.state.selection.to;
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  const { data, isSuccess } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId,
  });
  const projectKey = data?.data?.projectKey;

  const [shareDocument, { isLoading }] = useShareDocumentByEmailsMutation();

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isPublicLink, setIsPublicLink] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [permissionType, setPermissionType] = useState<'VIEW' | 'EDIT'>('VIEW');

  const [exportDocument] = useExportDocumentMutation();
  const documentId = useParams().documentId;

  function closeShareModal() {
    setShareModalOpen(false);
  }

  function openShareModal() {
    setShareModalOpen(true);
  }

  const getActiveTextStyle = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal text';
  };

  // const handleExportPDF = async () => {
  //   if (!editor) return;

  //   const content = document.createElement('html');
  //   content.innerHTML = `
  //   <head>
  //     <meta charset="UTF-8">
  //     <link rel="preconnect" href="https://fonts.googleapis.com">
  //     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  //     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:wght@400;700&display=swap" rel="stylesheet">
  //     <style>
  //       /* CSS dành riêng cho file PDF */
  //       body {
  //         font-family: 'Lora', serif; /* Font có chân cho văn bản dài, dễ đọc */
  //         font-size: 11pt;
  //         line-height: 1.5;
  //         background: white;
  //       }
  //       h1, h2, h3, h4, h5, h6 {
  //         font-family: 'Inter', sans-serif; /* Font không chân cho tiêu đề, hiện đại */
  //         color: #1a202c; /* Màu đen đậm */
  //       }
  //       h1 { font-size: 24pt; }
  //       h2 { font-size: 18pt; }
  //       h3 { font-size: 14pt; }

  //       p {
  //         widows: 3; /* Tránh 1 dòng mồ côi ở đầu trang */
  //         orphans: 3; /* Tránh 1 dòng mồ côi ở cuối trang */
  //       }

  //       a {
  //         color: #2563eb; /* Màu xanh dương cho link */
  //         text-decoration: none;
  //       }

  //       table {
  //         width: 100%;
  //         border-collapse: collapse;
  //         margin-top: 1em;
  //         margin-bottom: 1em;
  //       }

  //       th, td {
  //         border: 1px solid #e2e8f0;
  //         padding: 8px 12px;
  //         text-align: left;
  //       }

  //       th {
  //         background-color: #f7fafc;
  //         font-family: 'Inter', sans-serif;
  //         font-weight: 700;
  //       }

  //       code {
  //         font-family: monospace;
  //         background-color: #f1f1f1;
  //         padding: 2px 4px;
  //         border-radius: 4px;
  //         font-size: 90%;
  //       }

  //       blockquote {
  //         border-left: 3px solid #cbd5e1;
  //         padding-left: 1rem;
  //         margin-left: 0;
  //         font-style: italic;
  //         color: #4a5568;
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     ${editor.getHTML()}
  //   </body>
  // `;

  //   const body = content.querySelector('body');
  //   if (body) {
  //     const spacer = document.createElement('div');
  //     spacer.style.height = '1in'; // Tạo một khoảng trống cao 1 inch
  //     body.appendChild(spacer);
  //   }

  //   // 2. Cấu hình html2pdf với các tùy chọn nâng cao
  //   const options = {
  //     margin: [0.5, 0.5, 0.7, 0.5], // [top, left, bottom, right] in inches. Tăng margin dưới để có chỗ cho số trang.
  //     filename: 'document.pdf',
  //     image: { type: 'png', quality: 0.3 }, // PNG cho chất lượng text tốt hơn
  //     html2canvas: {
  //       scale: 0.8,
  //       useCORS: true,
  //       logging: false,
  //     },
  //     jsPDF: {
  //       unit: 'in',
  //       format: 'a4',
  //       orientation: 'portrait',
  //     },
  //     // 👈 Xử lý ngắt trang thông minh
  //     pagebreak: {
  //       mode: ['avoid-all', 'css', 'legacy'],
  //     },
  //   };

  //   const pdfExporter = html2pdf().from(content).set(options);

  //   // 3. Thêm số trang thủ công để kiểm soát hoàn toàn
  //   try {
  //     const pdfBlob = await pdfExporter.outputPdf('blob');

  //     const file = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });

  //     // ✅ Gọi API upload file với RTK Query
  //     await exportDocument({ documentId: Number(documentId), file });

  //     // Tải file về sau khi upload (tuỳ bạn)
  //     const pdfUrl = URL.createObjectURL(pdfBlob);
  //     const a = document.createElement('a');
  //     a.href = pdfUrl;
  //     a.download = 'document.pdf';
  //     a.click();
  //     URL.revokeObjectURL(pdfUrl);
  //   } catch (err) {
  //     console.error('Export and upload failed:', err);
  //   }
  // };

  // 👈 Hàm xử lý xuất Excel

  const handleExportPDF = async () => {
    if (!editor) return;

    // 1. Lấy HTML gốc từ editor
    const html = editor.getHTML();

    // 2. Tạo DOM ảo để xử lý
    const dom = document.createElement('div');
    dom.innerHTML = html;

    // 3. Thay thế các GanttNode bằng ảnh chất lượng cao
    const ganttNodes = dom.querySelectorAll('gantt-view');
    for (const node of ganttNodes) {
      const projectKey = node.getAttribute('projectkey');
      if (!projectKey) continue;

      const ganttElement = document.getElementById(`gantt-${projectKey}`);
      if (!ganttElement) continue;

      // Chụp ảnh Gantt với scale cao hơn để ảnh nét
      const canvas = await html2canvas(ganttElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.maxWidth = '100%';
      img.style.border = '1px solid #ddd';
      img.style.margin = '16px 0';

      node.replaceWith(img);
    }

    // 4. Tạo thẻ HTML đầy đủ để export
    const content = document.createElement('html');
    content.innerHTML = `
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:wght@400;700&display=swap" rel="stylesheet">
      <style>
       
        body {
          font-family: 'Lora', serif;
          font-size: 11pt;
          line-height: 1.5;
          background: white;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Inter', sans-serif;
        }
        img {
          max-width: 100%;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>${dom.innerHTML}</body>
  `;

    // 5. Spacer để tránh bị cắt chân (giữ nguyên)
    const spacer = document.createElement('div');
    spacer.style.height = '1in';
    content.querySelector('body')?.appendChild(spacer);

    // 6. Export PDF với options đã được sửa
    const options = {
      margin: [0.5, 0.5, 0.7, 0.5],
      filename: 'document.pdf',
      image: { type: 'png', quality: 0.98 }, // Giữ quality cao
      html2canvas: {
        scale: 2, // ✨ THAY ĐỔI: Quan trọng nhất, render toàn bộ PDF ở độ phân giải 2x
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
      },
    };

    try {
      const pdfBlob = await html2pdf().from(content).set(options).outputPdf('blob');

      const file = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });
      if (documentId && exportDocument) {
        await exportDocument({ documentId: Number(documentId), file });
      }

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'document.pdf';
      a.click();
      URL.revokeObjectURL(pdfUrl);
    } catch (err) {
      console.error('Export and upload failed:', err);
    }
  };

  const handleExportExcel = () => {
    if (!editor) return;

    const content = editor.getText({ blockSeparator: '\n' });
    const lines = content.split('\n').map((line) => [line]); // Tạo mảng các mảng

    const ws = XLSX.utils.aoa_to_sheet(lines);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Document');
    XLSX.writeFile(wb, 'document.xlsx');
  };

  const handleShareDocument = async () => {
    if (!emails.length) {
      toast.error('Please enter at least one email');
      return;
    }

    try {
      const result = await shareDocument({
        documentId: Number(params.documentId),
        permissionType,
        emails,
        projectKey: projectKey || undefined,
      }).unwrap();

      if (result.success) {
        toast.success('🎉 Document shared successfully!');
        closeShareModal();
        setEmails([]);
      } else {
        toast.error(`Some emails failed: ${result.failedEmails.join(', ')}`);
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('❌ Something went wrong while sharing.');
    }
  };

  return (
    <Fragment>
      <div className='flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2'>
        {/* Nút Undo/Redo */}
        <div className='flex items-center'>
          <button
            title='Undo'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40'
          >
            <Undo className='w-5 h-5' />
          </button>
          <button
            title='Redo'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40'
          >
            <Redo className='w-5 h-5' />
          </button>
        </div>

        <div className='w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1' />

        {/* Dropdown Kiểu chữ (Normal text, Heading) */}
        <Menu as='div' className='relative'>
          <Menu.Button className='flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
            <CaseSensitive className='w-5 h-5 text-blue-600' />
            <span className='text-sm font-medium'>{getActiveTextStyle()}</span>
            <ChevronDown className='w-4 h-4' />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute z-10 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1'>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className={dropdownItemClass}
                >
                  Normal text
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={dropdownItemClass}
                >
                  Heading 1
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={dropdownItemClass}
                >
                  Heading 2
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={dropdownItemClass}
                >
                  Heading 3
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        <button
          title='Add Comment'
          onClick={onAddComment}
          disabled={!isTextSelected} // Chỉ bật khi có văn bản được chọn
          className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <MessageSquarePlus className='w-5 h-5' />
        </button>

        <div className='w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1' />

        {/* Dropdown Căn lề */}
        <Menu as='div' className='relative'>
          <Menu.Button className='flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
            {editor.isActive({ textAlign: 'left' }) && <AlignLeft className='w-5 h-5' />}
            {editor.isActive({ textAlign: 'center' }) && <AlignCenter className='w-5 h-5' />}
            {editor.isActive({ textAlign: 'right' }) && <AlignRight className='w-5 h-5' />}
            {editor.isActive({ textAlign: 'justify' }) && <AlignJustify className='w-5 h-5' />}
            {!editor.isActive({ textAlign: 'center' }) &&
              !editor.isActive({ textAlign: 'right' }) &&
              !editor.isActive({ textAlign: 'justify' }) && <AlignLeft className='w-5 h-5' />}
            <ChevronDown className='w-4 h-4' />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute z-10 mt-2 w-40 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1'>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={dropdownItemClass}
                >
                  <AlignLeft className='w-5 h-5' />
                  <span>Left</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={dropdownItemClass}
                >
                  <AlignCenter className='w-5 h-5' />
                  <span>Center</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={dropdownItemClass}
                >
                  <AlignRight className='w-5 h-5' />
                  <span>Right</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  className={dropdownItemClass}
                >
                  <AlignJustify className='w-5 h-5' />
                  <span>Justify</span>
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        <div className='w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1' />

        {/* Các nút List */}
        <div className='flex items-center'>
          <button
            title='Bullet List'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded ${
              editor.isActive('bulletList')
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className='w-5 h-5' />
          </button>
          <button
            title='Ordered List'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded ${
              editor.isActive('orderedList')
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ListOrdered className='w-5 h-5' />
          </button>
          <button
            title='Task List'
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded ${
              editor.isActive('taskList')
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ListTodo className='w-5 h-5' />
          </button>
        </div>

        <div className='w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1' />

        {/* Dropdown Style (Bold, Italic,...) */}
        <Menu as='div' className='relative'>
          <Menu.Button className='flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
            <span className='text-sm font-medium'>Style</span>
            <ChevronDown className='w-4 h-4' />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute z-10 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1'>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`${dropdownItemClass} ${
                    editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <Bold className='w-5 h-5' />
                  <span>Bold</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`${dropdownItemClass} ${
                    editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <Italic className='w-5 h-5' />
                  <span>Italic</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`${dropdownItemClass} ${
                    editor.isActive('strike') ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <Strikethrough className='w-5 h-5' />
                  <span>Strikethrough</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`${dropdownItemClass} ${
                    editor.isActive('code') ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <Code className='w-5 h-5' />
                  <span>Code</span>
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        <button
          onClick={onToggleChatbot}
          className='flex items-center gap-2 px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900'
        >
          <Sparkles className='w-5 h-5' />
          <span className='text-sm font-semibold'>AI Assistant</span>
        </button>

        <Menu as='div' className='relative'>
          <Menu.Button className='flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
            <FileDown className='w-5 h-5 text-gray-700 dark:text-gray-300' />
            <span className='text-sm font-medium'>File</span>
            <ChevronDown className='w-4 h-4' />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute z-10 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1'>
              <Menu.Item>
                <button onClick={handleExportPDF} className={dropdownItemClass}>
                  <FileText className='w-5 h-5 text-red-500' />
                  <span>Export as PDF</span>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button onClick={handleExportExcel} className={dropdownItemClass}>
                  <Sheet className='w-5 h-5 text-green-500' />
                  <span>Export as Excel</span>
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        <div className='ml-auto flex items-center gap-2'>
          <button
            onClick={openShareModal}
            className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <Share2 className='w-4 h-4' />
            <span className='text-sm font-medium'>Share</span>
          </button>
        </div>
      </div>

      <Transition appear show={isShareModalOpen} as='div'>
        <Dialog as='div' className='relative z-50' onClose={closeShareModal}>
          {/* Lớp phủ nền */}
          <Transition.Child
            as='div'
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/30' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as='div'
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all'>
                  <div className='flex items-center justify-between'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'
                    >
                      Invite to this doc
                    </Dialog.Title>
                    <button
                      onClick={closeShareModal}
                      className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                    >
                      <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                    </button>
                  </div>

                  <div className='mt-4'>
                    <input
                      type='email'
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && emailInput.trim()) {
                          e.preventDefault();
                          setEmails((prev) => [...prev, emailInput.trim()]);
                          setEmailInput('');
                        }
                      }}
                      placeholder='Enter email and press Enter'
                      className='w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
                    />

                    <div className='mt-2 flex flex-wrap gap-2'>
                      {emails.map((email, index) => (
                        <span
                          key={index}
                          className='px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded-full flex items-center gap-1'
                        >
                          {email}
                          <button
                            onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                            className='text-gray-500 hover:text-red-500'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                    <Lock className='w-4 h-4' />
                    <span>Only invited people can find this doc</span>
                  </div>

                  <div className='mt-4 space-y-3'>
                    {/* Danh sách người dùng được mời */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold'>
                          T
                        </span>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-gray-100'>Tony Luong</p>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            tony.luong@example.com
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <Crown className='w-5 h-5 text-yellow-500' title='Owner' />
                        <button className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'>
                          <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-gray-800 dark:text-gray-200'>
                        Choose who can edit this doc
                      </p>

                      <div className='text-sm font-medium px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-md'>
                        View only
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                          Share public link
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Create a public link for view-only access.
                        </p>
                      </div>
                      <Switch
                        checked={isPublicLink}
                        onChange={setIsPublicLink}
                        className={`${isPublicLink ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
                            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                      >
                        <span className='sr-only'>Share public link</span>
                        <span
                          aria-hidden='true'
                          className={`${isPublicLink ? 'translate-x-5' : 'translate-x-0'}
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  </div>
                </Dialog.Panel>
                <button
                  onClick={handleShareDocument}
                  disabled={isLoading}
                  className='mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50'
                >
                  {isLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
};

export default MenuBar;
