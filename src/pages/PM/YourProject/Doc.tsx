import { useEffect, useRef, useState } from 'react';
import {
  useGetDocumentByIdQuery,
  useGetMyPermissionQuery,
  useUpdateDocumentMutation,
} from '../../../services/Document/documentAPI';
import RichTextEditor from '../../../components/PM/RichTextEditor/Editor';
import { useAuth } from '../../../services/AuthContext';
import StartWithAI from '../../../components/PM/AI/StartWithAI';
import { DocumentContext } from '../../../components/context/DocumentContext';
import { HiOutlineChartBar, HiOutlineTable, HiOutlineTemplate } from 'react-icons/hi';
import { useSearchParams } from 'react-router-dom';

type Props = {
  docId: number;
  updatedBy: number;
  onClose?: () => void;
  mode?: string; // thêm prop mới
};

export default function Doc({ docId, mode }: Props) {
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [updateDocument] = useUpdateDocumentMutation();
  const [title, setTitle] = useState('');
  const { data: docData, refetch } = useGetDocumentByIdQuery(docId);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false); // ✅ tên nhất quán

  const isUpdatingRef = useRef(false);
  const visibility = docData?.visibility || 'MAIN';
  // const [searchParams] = useSearchParams();
  // const mode = searchParams.get('mode'); // lấy từ ?mode=view

  const { data: permissionData } = useGetMyPermissionQuery(docId, {
    skip: mode === 'view', // bỏ qua nếu đang ở view mode công khai
  });
  // const permission = mode === 'view' ? 'view' : permissionData?.permission || 'none';
  const permission = mode === 'view' ? 'view' : permissionData?.permission || 'none';

  // useEffect(() => {
  //   if (docData) {
  //     if (typeof docData.title === 'string') setTitle(docData.title);
  //     if (typeof docData.content === 'string') setContent(docData.content);
  //   }
  // }, [docData]);

  useEffect(() => {
    if (docData) {
      setTitle(docData.title || '');
      setContent(docData.content || '');
    }
  }, [docData]);

  useEffect(() => {
    if (docId) {
      refetch();
    }
  }, [docId]);

  // useEffect(() => {
  //   if (docData && typeof docData.content === 'string' && docData.content !== content) {
  //     setContent(docData.content);
  //     console.log('[GET] docData:', docData);
  //   }
  // }, [docData]);

  const handleContentChange = async (newContent: string) => {
    if (!docId || isUpdatingRef.current || newContent === content) return;
    if (mode === 'view') return;
    setContent(newContent);
    try {
      isUpdatingRef.current = true;
      await updateDocument({
        id: docId,
        data: { title, content: newContent, updatedBy: user?.id, visibility },
      }).unwrap();
      console.log('[PUT] success', newContent);
    } catch (err) {
      console.error('Update doc failed:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  };
  const isEmptyContent = (html: string) => {
    return html.trim() === '' || html.trim() === '<p></p>' || html.trim() === '<p><br></p>';
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!docId || isUpdatingRef.current || newTitle === title) return;
    if (mode === 'view') return;
    setTitle(newTitle);
    try {
      isUpdatingRef.current = true;
      await updateDocument({
        id: docId,
        data: { title: newTitle, updatedBy: user?.id },
      }).unwrap();
      console.log('[PUT] title updated:', newTitle);
    } catch (err) {
      console.error('Update title failed:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className='relative px-6 py-5 mx-auto max-w-4xl'>
      <DocumentContext.Provider value={{ documentId: docId }}>
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          title={title}
          onTitleChange={handleTitleChange}
          showTemplatePicker={showTemplatePicker}
          setShowTemplatePicker={setShowTemplatePicker}
          permission={permission}
        />
      </DocumentContext.Provider>

      {isEmptyContent(content) && !showTemplatePicker && (
        <div className='space-y-2 text-sm mt-2'>
          {/* Các OptionItem nằm đây */}
          <OptionItem
            icon={<HiOutlineTemplate className='w-4 h-4' />}
            text='Templates'
            onClick={() => setShowTemplatePicker(true)}
          />
          <OptionItem icon={<HiOutlineTable className='w-4 h-4' />} text='Table' />
          <OptionItem icon={<HiOutlineChartBar className='w-4 h-4' />} text='Chart' />
          <OptionItem icon={<HiOutlineChartBar className='w-4 h-4' />} text='Board values' />
          <OptionItem icon={<HiOutlineChartBar className='w-4 h-4' />} text='Board' />

          {/* StartWithAI nằm ngay dưới OptionItem */}

          <StartWithAI
            docId={docId}
            onGenerated={() => {
              refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}
interface OptionItemProps {
  icon: React.ReactNode;
  text: string;

  onClick?: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({ icon, text, onClick }) => {
  return (
    <div
      className='flex items-center p-1 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200'
      onClick={onClick}
    >
      <div className='text-purple-500 mr-3'>{icon}</div>
      <span className='text-gray-700 font-medium'>{text}</span>
    </div>
  );
};
