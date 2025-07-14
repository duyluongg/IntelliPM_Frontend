import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AiSuggestedSubtask {
  taskId: string;
  title: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const subtaskAiApi = createApi({
  reducerPath: 'subtaskAiApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    generateSubtasksByAI: builder.mutation<AiSuggestedSubtask[], string>({
      query: (taskId) => ({
        url: `ai/${taskId}/generate-subtask`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<AiSuggestedSubtask[]>) => response.data,
    }),
  }),
});

export const {
  useGenerateSubtasksByAIMutation
} = subtaskAiApi;
