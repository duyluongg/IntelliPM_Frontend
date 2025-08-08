import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AiResponseHistoryResponseDTO {
  id: number;
  aiFeature: string;
  projectId: number | null;
  responseJson: string;
  createdBy: number;
  createdByFullname: string;
  createdByPicture: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface AiResponseHistoryRequestDTO {
  aiFeature: string;
  projectId?: number | null;
  responseJson: string;
  status: string;
}

interface AiResponseHistoryListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AiResponseHistoryResponseDTO[];
}

interface AiResponseHistoryDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AiResponseHistoryResponseDTO;
}

export const aiResponseHistoryApi = createApi({
  reducerPath: 'aiResponseHistoryApi',
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
  tagTypes: ['AiResponseHistory'],
  endpoints: (builder) => ({
    getAllAiResponseHistories: builder.query<AiResponseHistoryResponseDTO[], void>({
      query: () => 'aiResponseHistory',
      transformResponse: (response: AiResponseHistoryListResponse) => response.data,
      providesTags: ['AiResponseHistory'],
    }),

    getAiResponseHistoryById: builder.query<AiResponseHistoryResponseDTO, number>({
      query: (id) => `aiResponseHistory/${id}`,
      transformResponse: (response: AiResponseHistoryDetailResponse) => response.data,
      providesTags: ['AiResponseHistory'],
    }),

    getAiResponseHistoriesByAiFeature: builder.query<AiResponseHistoryResponseDTO[], string>({
      query: (aiFeature) => ({
        url: 'aiResponseHistory/by-ai-feature',
        params: { aiFeature },
      }),
      transformResponse: (response: AiResponseHistoryListResponse) => response.data,
      providesTags: ['AiResponseHistory'],
    }),

    getAiResponseHistoriesByProjectId: builder.query<AiResponseHistoryResponseDTO[], number>({
      query: (projectId) => `aiResponseHistory/by-project/${projectId}`,
      transformResponse: (response: AiResponseHistoryListResponse) => response.data,
      providesTags: ['AiResponseHistory'],
    }),

    getAiResponseHistoriesByCreatedBy: builder.query<AiResponseHistoryResponseDTO[], number>({
      query: (createdBy) => `aiResponseHistory/by-created-by/${createdBy}`,
      transformResponse: (response: AiResponseHistoryListResponse) => response.data,
      providesTags: ['AiResponseHistory'],
    }),

    createAiResponseHistory: builder.mutation<AiResponseHistoryDetailResponse, AiResponseHistoryRequestDTO>({
      query: (data) => ({
        url: 'aiResponseHistory',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['AiResponseHistory'],
    }),

    updateAiResponseHistory: builder.mutation<
      AiResponseHistoryDetailResponse,
      { id: number; data: AiResponseHistoryRequestDTO }
    >({
      query: ({ id, data }) => ({
        url: `aiResponseHistory/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['AiResponseHistory'],
    }),

    deleteAiResponseHistory: builder.mutation<void, number>({
      query: (id) => ({
        url: `aiResponseHistory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AiResponseHistory'],
    }),
  }),
});

export const {
  useGetAllAiResponseHistoriesQuery,
  useGetAiResponseHistoryByIdQuery,
  useGetAiResponseHistoriesByAiFeatureQuery,
  useGetAiResponseHistoriesByProjectIdQuery,
  useGetAiResponseHistoriesByCreatedByQuery,
  useCreateAiResponseHistoryMutation,
  useUpdateAiResponseHistoryMutation,
  useDeleteAiResponseHistoryMutation,
} = aiResponseHistoryApi;
