import React from 'react';
import {
  useGetAllAiResponseHistoriesQuery,
} from '../../../services/aiResponseHistoryApi';
import { useGetAllAiResponseEvaluationsQuery } from '../../../services/aiResponseEvaluationApi';
import AiResponseHistoryList from './AiResponseHistoryList';
import AiResponseEvaluationList from './AiResponseEvaluationList';

const AiResponsePage: React.FC = () => {
  const {
    data: histories,
    isLoading: isLoadingHistories,
    error: errorHistories,
  } = useGetAllAiResponseHistoriesQuery();
  const {
    data: evaluations,
    isLoading: isLoadingEvaluations,
    error: errorEvaluations,
  } = useGetAllAiResponseEvaluationsQuery();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Response History</h1>
      <AiResponseHistoryList
        histories={histories ?? []}
        isLoading={isLoadingHistories}
        error={errorHistories}
      />
      <h1 className="text-2xl font-bold text-gray-900 mt-12 mb-6">AI Response Evaluations</h1>
      <AiResponseEvaluationList
        evaluations={evaluations ?? []}
        isLoading={isLoadingEvaluations}
        error={errorEvaluations}
      />
    </div>
  );
};

export default AiResponsePage;