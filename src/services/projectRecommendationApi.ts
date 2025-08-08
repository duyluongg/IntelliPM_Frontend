import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AIRecommendationDTO {
  recommendation: string;
  details: string;
  type: string;
  affectedTasks: string[];
  expectedImpact: string;
  suggestedChanges: string;
  priority: number;
}

interface AIRecommendationsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AIRecommendationDTO[];
}

export interface CreateRecommendationRequest {
  projectId: number;
  type: string;
  recommendation: string;
  suggestedChanges: string | null;
  details: string | null;
}

interface BaseResponse {
  isSuccess: boolean;
  code: number;
  message: string;
}

export interface AIForecast {
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  estimatedDurationAtCompletion: number;
  isImproved: boolean;
  improvementSummary: string;
  confidenceScore: number;
}

export interface AIForecastResponse {
  isSuccess: boolean;
  code: number;
  data: AIForecast;
  message: string;
}

interface RecommendationsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RecommendationDTO[];
}

export interface RecommendationDTO {
  id: number;
  projectId: number;
  type: string;
  recommendation: string;
  details: string;
  suggestedChanges: string;
  createdAt: string;
}

export const projectRecommendationApi = createApi({
  reducerPath: 'projectRecommendationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userJson = localStorage.getItem('user');
      const token = userJson ? JSON.parse(userJson).accessToken : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAIRecommendationsByProjectKey: builder.query<AIRecommendationsResponse, string>({
      query: (projectKey) => ({
        url: `projectrecommendation/ai-recommendations?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    createProjectRecommendation: builder.mutation<BaseResponse, CreateRecommendationRequest>({
      query: (body) => ({
        url: 'projectrecommendation',
        method: 'POST',
        body,
      }),
    }),

    getAIForecastByProjectKey: builder.query<AIForecastResponse, string>({
      query: (projectKey) => ({
        url: `projectrecommendation/ai-forecast?projectKey=${projectKey}`,
        method: 'POST',
      }),
    }),

    getRecommendationsByProjectKey: builder.query<RecommendationsResponse, string>({
      query: (projectKey) => ({
        url: `projectrecommendation/by-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    deleteRecommendationById: builder.mutation<void, number>({
      query: (id) => ({
        url: `projectrecommendation/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAIRecommendationsByProjectKeyQuery,
  useLazyGetAIRecommendationsByProjectKeyQuery,
  useCreateProjectRecommendationMutation,
  useGetAIForecastByProjectKeyQuery,
  useLazyGetAIForecastByProjectKeyQuery,
  useGetRecommendationsByProjectKeyQuery,
  useDeleteRecommendationByIdMutation,
} = projectRecommendationApi;
