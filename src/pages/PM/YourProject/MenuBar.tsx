import React, { Fragment, useEffect, useState } from 'react';
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
  LinkIcon,
  UserPlus,
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
import type { SharePermission } from '../../../types/ShareDocumentType';
import jsPDF from 'jspdf';
import {
  useGetPermissionTypeByDocumentQuery,
  useGetSharedUsersByDocumentQuery,
  useUpdatePermissionTypeMutation,
  type PermissionType,
} from '../../../services/Document/documentPermissionAPI';

interface Props {
  editor: Editor | null;
  onToggleChatbot?: () => void;
  onAddComment?: () => void;
  exportTargetRef?: React.RefObject<HTMLElement | null>;
}

// Lớp CSS dùng chung cho các item trong dropdown
const dropdownItemClass =
  'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50';

const MenuBar: React.FC<Props> = ({ editor, onToggleChatbot, onAddComment, exportTargetRef }) => {
  if (!editor) {
    return null;
  }
  const { documentId: documentIdParam } = useParams<{ documentId: string }>();
  const documentId = Number(documentIdParam);
  const hasValidDocId = Number.isFinite(documentId) && documentId > 0;

  const isTextSelected = editor.state.selection.from !== editor.state.selection.to;
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  const { data, isSuccess } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId,
  });
  const projectKey = data?.data?.projectKey;
  const [shareDocument, { isLoading }] = useShareDocumentByEmailsMutation();

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [updatePermissionType, { isLoading: isUpdating }] = useUpdatePermissionTypeMutation();
  const { data: sharedData, refetch: refetchSharedUsers } = useGetSharedUsersByDocumentQuery(
    documentId,
    { skip: !hasValidDocId }
  );
  const { data: permissionData, isSuccess: isPermissionSuccess } =
    useGetPermissionTypeByDocumentQuery(documentId, {
      skip: !documentId,
    });

  useEffect(() => {
    if (isPermissionSuccess && permissionData?.permissionType) {
      setPermission(permissionData.permissionType);
    }
  }, [isPermissionSuccess, permissionData]);

  const sharedUsers = sharedData?.data || [];
  const [exportDocument] = useExportDocumentMutation();

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

  //   // 1. Lấy HTML gốc từ editor
  //   const html = editor.getHTML();

  //   // 2. Tạo DOM ảo để xử lý
  //   const dom = document.createElement('div');
  //   dom.innerHTML = html;

  //   // 3. Thay thế các GanttNode bằng ảnh chất lượng cao
  //   const ganttNodes = dom.querySelectorAll('gantt-view');
  //   for (const node of ganttNodes) {
  //     const projectKey = node.getAttribute('projectkey');
  //     if (!projectKey) continue;

  //     const ganttElement = document.getElementById(`gantt-${projectKey}`);
  //     if (!ganttElement) continue;

  //     // Chụp ảnh Gantt với scale cao hơn để ảnh nét
  //     const canvas = await html2canvas(ganttElement, {
  //       useCORS: true,
  //       allowTaint: true,
  //       backgroundColor: '#ffffff',
  //       scale: 2,
  //     });

  //     const img = document.createElement('img');
  //     img.src = canvas.toDataURL('image/png');
  //     img.style.maxWidth = '100%';
  //     img.style.border = '1px solid #ddd';
  //     img.style.margin = '16px 0';

  //     node.replaceWith(img);
  //   }

  //   // 4. Tạo thẻ HTML đầy đủ để export
  //   const content = document.createElement('html');
  //   content.innerHTML = `
  //   <head>
  //     <meta charset="UTF-8">
  //     <link rel="preconnect" href="https://fonts.googleapis.com">
  //     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  //     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:wght@400;700&display=swap" rel="stylesheet">
  //     <style>

  //       body {
  //         font-family: 'Lora', serif;
  //         font-size: 11pt;
  //         line-height: 1.5;
  //         background: white;
  //       }
  //       h1, h2, h3, h4, h5, h6 {
  //         font-family: 'Inter', sans-serif;
  //       }
  //       img {
  //         max-width: 100%;
  //         page-break-inside: avoid;
  //       }
  //     </style>
  //   </head>
  //   <body>${dom.innerHTML}</body>
  // `;

  //   // 5. Spacer để tránh bị cắt chân (giữ nguyên)
  //   const spacer = document.createElement('div');
  //   spacer.style.height = '1in';
  //   content.querySelector('body')?.appendChild(spacer);

  //   // 6. Export PDF với options đã được sửa
  //   const options = {
  //     margin: [0.5, 0.5, 0.7, 0.5],
  //     filename: 'document.pdf',
  //     image: { type: 'png', quality: 0.98 }, // Giữ quality cao
  //     html2canvas: {
  //       scale: 2, // ✨ THAY ĐỔI: Quan trọng nhất, render toàn bộ PDF ở độ phân giải 2x
  //       useCORS: true,
  //       logging: false,
  //     },
  //     jsPDF: {
  //       unit: 'in',
  //       format: 'a4',
  //       orientation: 'portrait',
  //     },
  //     pagebreak: {
  //       mode: ['avoid-all', 'css', 'legacy'],
  //     },
  //   };

  //   try {
  //     const pdfBlob = await html2pdf().from(content).set(options).outputPdf('blob');

  //     const file = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });
  //     if (documentId && exportDocument) {
  //       await exportDocument({ documentId: Number(documentId), file });
  //     }

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

  const handleExportPDF = async () => {
    const el = exportTargetRef?.current ?? document.querySelector<HTMLElement>('.tiptap-content');

    if (!el) return;
    if (!(el instanceof HTMLElement)) return;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff',
      windowWidth: el.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }

    pdf.save('document.pdf');
  };

  // const handleExportPDF = () => {
  //   const element = exportTargetRef?.current || document.querySelector('.tiptap-content');
  //   if (!element) return;

  //   const opt = {
  //     margin: [10, 10, 10, 10], // trên, trái, dưới, phải (mm)
  //     filename: 'document.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2, useCORS: true },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  //     pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }, // 👈 ngắt trang chuẩn
  //   };

  //   html2pdf().from(element).set(opt).save();
  // };

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
    console.log(projectKey);

    if (!projectKey) {
      toast.error('Missing project key!');
      return;
    }

    try {
      const result = await shareDocument({
        documentId,
        permissionType: permission,
        emails,
        projectKey,
      }).unwrap();

      if (result.isSuccess) {
        toast.success('🎉 Document shared successfully!');
        setEmails([]);
        setEmailInput('');
        closeShareModal();

        refetchSharedUsers();
      } else {
        toast.error(`Some emails failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('❌ Something went wrong while sharing.');
    }
  };

  return (
    <Fragment>
      {/* Nút Undo/Redo */}
      <div className='sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2'>
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

      <Transition appear show={isShareModalOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeShareModal}>
          {/* Lớp phủ nền */}
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-lg transform divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-2xl transition-all'>
                  {/* PHẦN 1: Header và thanh mời */}
                  <div className='p-6'>
                    <div className='flex items-center justify-between'>
                      <Dialog.Title
                        as='h3'
                        className='text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100'
                      >
                        Share Document
                      </Dialog.Title>
                      <button
                        onClick={closeShareModal}
                        className='p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                      >
                        <X className='w-5 h-5' />
                      </button>
                    </div>
                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                      Invite people to collaborate on this document.
                    </p>

                    <div className='mt-4 flex flex-col sm:flex-row items-center gap-2'>
                      <div className='relative flex-grow w-full'>
                        <UserPlus className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                          type='email'
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && emailInput.trim()) {
                              e.preventDefault();
                              // Thêm logic kiểm tra email hợp lệ ở đây nếu cần
                              setEmails((prev) => [...new Set([...prev, emailInput.trim()])]); // Tránh trùng lặp
                              setEmailInput('');
                            }
                          }}
                          placeholder='Enter one or more emails...'
                          className='w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 transition-colors'
                        />
                      </div>
                      <button
                        onClick={handleShareDocument}
                        disabled={isLoading || emails.length === 0}
                        className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                      >
                        {isLoading ? 'Sending...' : 'Send Invite'}
                      </button>
                    </div>

                    {emails.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {emails.map((email, index) => (
                          <span
                            key={index}
                            className='px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-1.5 animate-in fade-in-0'
                          >
                            {email}
                            <button
                              onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                              className='text-blue-500 hover:text-blue-700 dark:hover:text-blue-300'
                            >
                              <X className='w-3 h-3' />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className='p-6 space-y-4'>
                    <h4 className='font-medium text-gray-700 dark:text-gray-300'>
                      People with access
                    </h4>

                    {/* User - Owner */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <img
                          className='h-10 w-10 rounded-full'
                          src='https://i.pravatar.cc/40?u=tony'
                          alt='Tony Luong'
                        />
                        <div>
                          <p className='font-medium text-gray-900 dark:text-gray-100'>Tony Luong</p>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            tony.luong@example.com
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-yellow-600 dark:text-yellow-400'>
                        <Crown className='w-5 h-5' />
                        <span>Owner</span>
                      </div>
                    </div>

                    {/* User - Editor (Ví dụ thêm) */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <img
                          className='h-10 w-10 rounded-full'
                          src='https://i.pravatar.cc/40?u=jane'
                          alt='Jane Doe'
                        />
                        <div>
                          <p className='font-medium text-gray-900 dark:text-gray-100'>Jane Doe</p>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            jane.doe@example.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-6 bg-gray-50 dark:bg-gray-800/50'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-gray-200 dark:bg-gray-700 rounded-lg'>
                          <LinkIcon className='w-5 h-5 text-gray-600 dark:text-gray-300' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-gray-100'>
                            Anyone with the link
                          </p>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {permission === 'EDIT' ? 'Can edit' : 'Can view'} this document.
                          </p>
                        </div>
                      </div>

                      <select
                        value={permission}
                        onChange={async (e) => {
                          const newPermission = e.target.value as 'VIEW' | 'EDIT';
                          setPermission(newPermission);

                          if (sharedUsers.length === 0) return;

                          try {
                            const res = await updatePermissionType({
                              documentId,
                              permissionType: newPermission,
                            }).unwrap();

                            if (!res.isSuccess) {
                              toast.error('Cập nhật quyền thất bại: ' + res.message);
                            } else {
                              // toast.success('🎉 Quyền đã được cập nhật');
                              refetchSharedUsers();
                            }
                          } catch (err) {
                            console.error('Update failed', err);
                            toast.error('Lỗi khi cập nhật quyền!');
                          }
                        }}
                        className='text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                      >
                        <option value='VIEW'>Can view</option>
                        <option value='EDIT'>Can edit</option>
                      </select>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
};

export default MenuBar;
