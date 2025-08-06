import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import {
  useCreateAiResponseHistoryMutation,
  type AiResponseHistoryRequestDTO,
} from '../../services/aiResponseHistoryApi';

import {
  useCreateAiResponseEvaluationMutation,
  type AiResponseEvaluationRequestDTO,
} from '../../services/aiResponseEvaluationApi';
import galaxyaiIcon from '../../assets/galaxyai.gif';

interface AiResponseEvaluationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  aiResponseJson: string;
  projectId: number;
  aiFeature: string; 
  onSubmitSuccess: (aiResponseId: number) => void;
}

const AiResponseEvaluationPopup: React.FC<AiResponseEvaluationPopupProps> = ({
  isOpen,
  onClose,
  aiResponseJson,
  projectId,
  aiFeature,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAiResponseHistory] = useCreateAiResponseHistoryMutation();
  const [createAiResponseEvaluation] = useCreateAiResponseEvaluationMutation();

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Lưu AiResponseHistory
      const historyRequest: AiResponseHistoryRequestDTO = {
        aiFeature: aiFeature,
        projectId,
        responseJson: aiResponseJson,
        status: 'ACTIVE',
      };

      const historyResponse = await createAiResponseHistory(historyRequest).unwrap();
      if (!historyResponse.isSuccess) {
        throw new Error(historyResponse.message || 'Failed to save AI response history.');
      }

      const aiResponseId = historyResponse.data.id;

      // Lưu AiResponseEvaluation
      const evaluationRequest: AiResponseEvaluationRequestDTO = {
        aiResponseId,
        rating,
        feedback: feedback.trim() || null,
      };

      const evaluationResponse = await createAiResponseEvaluation(evaluationRequest).unwrap();
      if (!evaluationResponse.isSuccess) {
        throw new Error(evaluationResponse.message || 'Failed to save AI response evaluation.');
      }

      onSubmitSuccess(aiResponseId);
      onClose();
    } catch (error: any) {
      console.error('Error saving AI response or evaluation:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <style>
          {`
            @keyframes gradientText {
              0% { background-position: 200% 50%; }
              100% { background-position: 0% 50%; }
            }
            .gradient-text {
              background: linear-gradient(90deg, #1c73fd, #00d4ff, #4a90e2, #1c73fd);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: gradientText 3s linear infinite;
            }
            @keyframes scale-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .animate-scale-pulse {
              animation: scale-pulse 1.5s ease-in-out infinite;
            }
          `}
        </style>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <img src={galaxyaiIcon} alt="AI Icon" className="w-8 h-8" />
            <h3 className="text-xl font-bold gradient-text">Rate AI-Generated Plan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    rating >= star
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                  disabled={isSubmitting}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c73fd] focus:border-[#1c73fd] transition-colors duration-200 resize-none"
              rows={4}
              placeholder="Share your thoughts on the AI-generated plan..."
              disabled={isSubmitting}
            />
          </div>
          {errorMessage && <p className="text-red-500 text-sm font-medium">{errorMessage}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-gradient-to-r from-[#1c73fd] to-[#4a90e2] text-white rounded-lg hover:from-[#155ac7] hover:to-[#3e7ed1] transition-all duration-200 flex items-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'animate-scale-pulse'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span>Submitting...</span>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiResponseEvaluationPopup;