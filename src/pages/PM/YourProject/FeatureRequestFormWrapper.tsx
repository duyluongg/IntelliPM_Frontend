// src/pages/PM/YourProject/FeatureRequestFormWrapper.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FeatureRequestForm from './FeatureRequestForm';
import axios from 'axios';
import type { DocumentType } from '../../../types/DocumentType';
import { useAuth } from '../../../services/AuthContext';

export default function FeatureRequestFormWrapper() {
  const { id } = useParams();
  const [doc, setDoc] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(`https://localhost:7128/api/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
        setDoc(res.data);
      } catch (err) {
        console.error('Failed to load document:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      fetchDoc();
    }
  }, [id, user]);

  if (loading) return <div className='p-4'>Loading...</div>;
  if (!doc) return <div className='p-4 text-red-500'>Document not found.</div>;

  return <FeatureRequestForm doc={doc} onBack={() => window.history.back()} />;
}
