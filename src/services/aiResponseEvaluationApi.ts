import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AiResponseEvaluationResponseDTO {
  id: number;
  aiResponseId: number;
  accountId: number;
  accountFullname: string;
  accountPicture: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiResponseEvaluationRequestDTO {
  aiResponseId: number;
  rating: number;
  feedback?: string | null;
}

interface AiResponseEvaluationListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AiResponseEvaluationResponseDTO[];
}

interface AiResponseEvaluationDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AiResponseEvaluationResponseDTO;
}

export const aiResponseEvaluationApi = createApi({
  reducerPath: 'aiResponseEvaluationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AiResponseEvaluation'],
  endpoints: (builder) => ({
    getAllAiResponseEvaluations: builder.query<AiResponseEvaluationResponseDTO[], void>({
      query: () => 'aiResponseEvaluation',
      transformResponse: (response: AiResponseEvaluationListResponse) => response.data,
      providesTags: ['AiResponseEvaluation'],
    }),

    getAiResponseEvaluationById: builder.query<AiResponseEvaluationResponseDTO, number>({
      query: (id) => `aiResponseEvaluation/${id}`,
      transformResponse: (response: AiResponseEvaluationDetailResponse) => response.data,
      providesTags: ['AiResponseEvaluation'],
    }),

    getAiResponseEvaluationsByAiResponseId: builder.query<AiResponseEvaluationResponseDTO[], number>({
      query: (aiResponseId) => `aiResponseEvaluation/by-ai-response/${aiResponseId}`,
      transformResponse: (response: AiResponseEvaluationListResponse) => response.data,
      providesTags: ['AiResponseEvaluation'],
    }),

    getAiResponseEvaluationsByAccountId: builder.query<AiResponseEvaluationResponseDTO[], number>({
      query: (accountId) => `aiResponseEvaluation/by-account/${accountId}`,
      transformResponse: (response: AiResponseEvaluationListResponse) => response.data,
      providesTags: ['AiResponseEvaluation'],
    }),

    createAiResponseEvaluation: builder.mutation<
      AiResponseEvaluationDetailResponse,
      AiResponseEvaluationRequestDTO
    >({
      query: (data) => ({
        url: 'aiResponseEvaluation',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['AiResponseEvaluation'],
    }),

    updateAiResponseEvaluation: builder.mutation<
      AiResponseEvaluationDetailResponse,
      { id: number; data: AiResponseEvaluationRequestDTO }
    >({
      query: ({ id, data }) => ({
        url: `aiResponseEvaluation/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['AiResponseEvaluation'],
    }),

    deleteAiResponseEvaluation: builder.mutation<void, number>({
      query: (id) => ({
        url: `aiResponseEvaluation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AiResponseEvaluation'],
    }),
  }),
});

export const {
  useGetAllAiResponseEvaluationsQuery,
  useGetAiResponseEvaluationByIdQuery,
  useGetAiResponseEvaluationsByAiResponseIdQuery,
  useGetAiResponseEvaluationsByAccountIdQuery,
  useCreateAiResponseEvaluationMutation,
  useUpdateAiResponseEvaluationMutation,
  useDeleteAiResponseEvaluationMutation,
} = aiResponseEvaluationApi;