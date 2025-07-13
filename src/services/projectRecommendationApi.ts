import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AIRecommendationDTO {
  recommendation: string;
  details: string;
  type: string; // Schedule | Cost | Scope | Resource
  affectedTasks: string[];
  suggestedTask: string | null;
  expectedImpact: string;
  suggestedChanges: Record<string, any>;
}

interface AIRecommendationsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AIRecommendationDTO[];
}

export interface CreateRecommendationRequest {
  projectId: number;
  taskId: string | null;
  type: string;
  recommendation: string;
}

interface BaseResponse {
  isSuccess: boolean;
  code: number;
  message: string;
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
  }),
});

export const {
  useGetAIRecommendationsByProjectKeyQuery,
  useLazyGetAIRecommendationsByProjectKeyQuery,
  useCreateProjectRecommendationMutation,
} = projectRecommendationApi;
