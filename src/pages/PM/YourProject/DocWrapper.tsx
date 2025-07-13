import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Doc from './Doc';
import { useCreateDocumentMutation } from '../../../services/Document/documentAPI';
import { useAuth } from '../../../services/AuthContext';

export default function DocWrapper() {
  const { id, type } = useParams(); // type = 'default', id = 'new' hoặc docId
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('projectKey');

  const [createDocument] = useCreateDocumentMutation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [docId, setDocId] = useState<number | null>(null);

  useEffect(() => {
    const createNewDocument = async () => {
      if (!projectKey || !user?.id) return;

      try {
        const res = await createDocument({
          projectId: Number(projectKey), // Nếu projectKey là projectId, OK
          title: 'New Document',
          type: type || 'default',
          content: '',
        }).unwrap();

        navigate(`/project/projects/form/${res.type}/${res.id}?projectKey=${projectKey}`, {
          replace: true,
        });
      } catch (error) {
        console.error('Failed to create document:', error);
      }
    };

    if (id === 'new') {
      createNewDocument();
    } else {
      const parsedId = Number(id);
      if (!parsedId || isNaN(parsedId)) return;
      setDocId(parsedId);
    }
  }, [id, projectKey, user?.id]);

  if (id === 'new') {
    return <p className="p-4 text-gray-500">Đang tạo tài liệu...</p>;
  }

  if (!docId) {
    return <p className="p-4 text-red-500">Invalid document ID.</p>;
  }

  return <Doc docId={docId} />;
}
