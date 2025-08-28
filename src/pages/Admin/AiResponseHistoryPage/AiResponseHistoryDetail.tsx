import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAiResponseHistoryByIdQuery } from '../../../services/aiResponseHistoryApi';
import { ImageOff } from 'lucide-react';

const AiResponseHistoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: history, isLoading, error } = useGetAiResponseHistoryByIdQuery(Number(id));

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading AI response history...</div>;
  }

  if (error || !history) {
    return <div className="text-center text-red-500">Failed to load AI response history.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="container mx-auto p-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Response History Detail</h1>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          {history.createdByPicture ? (
            <img
              src={history.createdByPicture}
              alt={`${history.createdByFullname}'s avatar`}
              className="w-16 h-16 rounded-full object-cover mr-4"
              loading="lazy"
              onError={(e) => {
                const imgElement = e.currentTarget;
                const parentElement = imgElement.parentElement;
                if (parentElement) {
                  const fallbackElement = parentElement.querySelector('.fallback-icon') as HTMLElement | null;
                  if (fallbackElement) {
                    imgElement.style.display = 'none';
                    fallbackElement.style.display = 'flex';
                  }
                }
              }}
            />
          ) : null}
          <div
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center fallback-icon"
            style={{ display: history.createdByPicture ? 'none' : 'flex' }}
          >
            <ImageOff className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{history.createdByFullname}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">AI Feature</p>
            <p className="text-base text-gray-900">{history.aiFeature}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Project ID</p>
            <p className="text-base text-gray-900">{history.projectId ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="text-base text-gray-900">{formatDate(history.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-base text-gray-900">{history.status}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">Response JSON</p>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto max-h-[50vh]">
            {history.responseJson}
          </pre>
        </div>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/admin/ai-responses')}
          aria-label="Back to AI response history list"
        >
          Back
        </button>
      </div>
    </motion.div>
  );
};

export default AiResponseHistoryDetail;