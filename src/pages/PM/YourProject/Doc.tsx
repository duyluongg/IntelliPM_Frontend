import { useEffect, useRef, useState } from 'react';
import {
  useGetDocumentByIdQuery,
  useUpdateDocumentMutation,
} from '../../../services/Document/documentAPI';
import RichTextEditor from '../../../components/PM/RichTextEditor/Editor';
import { useAuth } from '../../../services/AuthContext';
import StartWithAI from '../../../components/PM/AI/StartWithAI';
import { DocumentContext } from '../../../components/context/DocumentContext';

type Props = {
  docId: number;
  updatedBy: number;
  onClose?: () => void;
};

export default function Doc({ docId }: Props) {
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [updateDocument] = useUpdateDocumentMutation();
  const [title, setTitle] = useState('');
  const { data: docData, refetch } = useGetDocumentByIdQuery(docId);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false); // ✅ tên nhất quán

  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (docData) {
      if (typeof docData.title === 'string') setTitle(docData.title);
      if (typeof docData.content === 'string') setContent(docData.content);
    }
  }, [docData]);

  useEffect(() => {
    if (docId) {
      refetch();
    }
  }, [docId]);

  useEffect(() => {
    if (docData && typeof docData.content === 'string' && docData.content !== content) {
      setContent(docData.content);
      console.log('[GET] docData:', docData);
    }
  }, [docData]);

  const handleContentChange = async (newContent: string) => {
    if (!docId || isUpdatingRef.current || newContent === content) return;

    setContent(newContent);
    try {
      isUpdatingRef.current = true;
      await updateDocument({
        id: docId,
        data: { content: newContent, updatedBy: user?.id },
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
    <div className='p-5'>
      <DocumentContext.Provider value={{ documentId: docId }}>
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          title={title}
          onTitleChange={handleTitleChange}
          showTemplatePicker={showTemplatePicker}
          setShowTemplatePicker={setShowTemplatePicker}
        />
      </DocumentContext.Provider>

      {isEmptyContent(content) && !showTemplatePicker && (
        <div className='fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full '>
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
