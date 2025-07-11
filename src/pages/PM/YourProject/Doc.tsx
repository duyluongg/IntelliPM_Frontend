import { useEffect, useRef, useState } from 'react';
import {
  useGetDocumentByIdQuery,
  useUpdateDocumentMutation,
} from '../../../services/Document/documentAPI';
import RichTextEditor from '../../../components/PM/RichTextEditor/Editor';
import { useAuth } from '../../../services/AuthContext';
import StartWithAI from '../../../components/PM/AI/StartWithAI';

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
    if (docData?.content) {
      setContent(docData.content);
      console.log('[GET] docData:', docData);
    }
  }, [docData]);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    if (!docId || isUpdatingRef.current) return;

    try {
      isUpdatingRef.current = true;

      await updateDocument({
        id: docId,
        data: { content: newContent, updatedBy: user?.id },
      }).unwrap();
      console.log('[PUT] success');
    } catch (err) {
      console.error('Update doc failed:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  return (
    <div>
      <RichTextEditor value={content} onChange={handleContentChange} />

      <div className='fixed bottom-10 left-1/2 -translate-x-1/2 z-50'>
        <StartWithAI
          docId={docId}
          onGenerated={() => {
            refetch();
          }}
        />
      </div>
    </div>
  );
}
