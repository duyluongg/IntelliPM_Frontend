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
  const { data: docData, refetch } = useGetDocumentByIdQuery(docId);

  const isUpdatingRef = useRef(false);

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

  return (
    <div>
      <DocumentContext.Provider value={{ documentId: docId }}>
        <RichTextEditor value={content} onChange={handleContentChange} />
      </DocumentContext.Provider>

      {isEmptyContent(content) && (
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
