import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Edit, Trash2, ImageOff, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteAiResponseEvaluationMutation } from '../../../services/aiResponseEvaluationApi';
import { type AiResponseEvaluationResponseDTO } from '../../../services/aiResponseEvaluationApi';

interface AiResponseEvaluationListProps {
  evaluations: AiResponseEvaluationResponseDTO[];
  isLoading: boolean;
  error: any;
}

const AiResponseEvaluationList: React.FC<AiResponseEvaluationListProps> = ({ evaluations, isLoading, error }) => {
  const navigate = useNavigate();
  const [deleteEvaluation] = useDeleteAiResponseEvaluationMutation();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  // Handle delete evaluation
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this evaluation?')) {
      try {
        await deleteEvaluation(id).unwrap();
        alert('Evaluation deleted successfully');
      } catch (err) {
        alert('Failed to delete evaluation');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading evaluations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load evaluations.</div>;
  }

  if (!evaluations.length) {
    return <div className="text-center text-gray-500">No evaluations found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-x-auto mt-6"
    >
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Avatar</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Account</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">AI Response ID</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Rating</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Feedback</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Created At</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {evaluations.map((evaluation, index) => (
              <motion.tr
                key={evaluation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.02 }}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-3 px-4 flex items-center">
                  {evaluation.accountPicture ? (
                    <img
                      src={evaluation.accountPicture}
                      alt={`${evaluation.accountFullname}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
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
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center fallback-icon"
                    style={{ display: evaluation.accountPicture ? 'none' : 'flex' }}
                  >
                    <ImageOff className="w-5 h-5 text-gray-400" />
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => navigate(`/admin/ai-responses/evaluations/${evaluation.id}`)}
                    aria-label={`View details for ${evaluation.accountFullname}`}
                  >
                    {evaluation.accountFullname}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{evaluation.aiResponseId}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= evaluation.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={evaluation.feedback ?? ''}>
                  {evaluation.feedback ?? '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(evaluation.createdAt)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/admin/ai-responses/evaluations/${evaluation.id}/edit`)}
                      aria-label={`Edit evaluation for ${evaluation.accountFullname}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(evaluation.id)}
                      aria-label={`Delete evaluation for ${evaluation.accountFullname}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
};

export default AiResponseEvaluationList;