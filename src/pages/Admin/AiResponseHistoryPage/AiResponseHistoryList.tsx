import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Eye, Trash2, ImageOff, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteAiResponseHistoryMutation,
  type AiResponseHistoryResponseDTO,
} from '../../../services/aiResponseHistoryApi';
import { useGetAiResponseEvaluationsByAiResponseIdQuery } from '../../../services/aiResponseEvaluationApi';

interface AiResponseHistoryListProps {
  histories: AiResponseHistoryResponseDTO[];
  isLoading: boolean;
  error: any;
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
};

// 👉 Row Component
const AiResponseHistoryRow: React.FC<{
  history: AiResponseHistoryResponseDTO;
  index: number;
  onView: (history: AiResponseHistoryResponseDTO, evaluations: any[]) => void;
  onDelete: (id: number) => void;
}> = ({ history, index, onView, onDelete }) => {
  const navigate = useNavigate();
  const { data: evaluations = [] } = useGetAiResponseEvaluationsByAiResponseIdQuery(history.id);

  const averageRating =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length
      : 0;

  return (
    <motion.tr
      key={history.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.02 }}
      className="border-b hover:bg-gray-50 transition-colors duration-200"
    >
      <td className="py-3 px-4 flex items-center">
        {history.createdByPicture ? (
          <img
            src={history.createdByPicture}
            alt={`${history.createdByFullname}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{history.aiFeature}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{history.projectId ?? '-'}</td>
      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
        <button
          className="text-blue-600 hover:text-blue-800 transition-colors"
          onClick={() => navigate(`/admin/ai-responses/history/${history.id}`)}
        >
          {history.createdByFullname}
        </button>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{formatDate(history.createdAt)}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{history.status}</td>
      <td className="py-3 px-4 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span>({evaluations.length} reviews)</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onView(history, evaluations)}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => onDelete(history.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const AiResponseHistoryList: React.FC<AiResponseHistoryListProps> = ({ histories, isLoading, error }) => {
  const [deleteHistory] = useDeleteAiResponseHistoryMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResponseJson, setSelectedResponseJson] = useState<string | null>(null);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any[] | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this AI response history?')) {
      try {
        await deleteHistory(id).unwrap();
        alert('History deleted successfully');
      } catch {
        alert('Failed to delete history');
      }
    }
  };

  const handleViewDetails = (history: AiResponseHistoryResponseDTO, evaluations: any[]) => {
    setSelectedResponseJson(history.responseJson ?? 'No response JSON available');
    setSelectedEvaluations(evaluations ?? []);
    setIsModalOpen(true);
  };

  const renderResponseJson = (json: string | null) => {
    if (!json) return <div className="text-gray-700 text-sm">No response JSON available</div>;
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="space-y-1">
            {Object.entries(parsed).map(([key, value]) => (
              <div key={key} className="flex space-x-2">
                <span className="font-semibold text-gray-700 text-sm">{key}:</span>
                <span className="text-gray-700 text-sm">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        );
      }
      return <div className="text-gray-700 text-sm">{json}</div>;
    } catch {
      return <div className="text-gray-700 text-sm">{json}</div>;
    }
  };

  if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Failed to load data.</div>;
  if (!histories.length) return <div className="text-center text-gray-500">No data found.</div>;

  return (
    <>
      <motion.div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold">Avatar</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">AI Feature</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Project ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Created By</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Created At</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Average Rating</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {histories.map((h, i) => (
                <AiResponseHistoryRow
                  key={h.id}
                  history={h}
                  index={i}
                  onView={handleViewDetails}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Response Details</h2>
            <div className="mb-4">{renderResponseJson(selectedResponseJson)}</div>
            {selectedEvaluations && selectedEvaluations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Evaluations</h3>
                {selectedEvaluations.map((ev) => (
                  <div key={ev.id} className="border-t pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{ev.accountFullname}:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= ev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm">{ev.feedback ?? 'No feedback'}</p>
                    <p className="text-xs text-gray-500">{formatDate(ev.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AiResponseHistoryList;
