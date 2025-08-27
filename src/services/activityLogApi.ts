import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface ActivityLogResponseDTO {
  id: number;
  projectId: number;
  taskId: string;
  subtask: string;
  epicId: string;
  riskKey: string;
  createdBy: number;
  createdByName: string;
  createdAt: string; // ISO string
  message: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const activityLogApi = createApi({
  reducerPath: 'activityLogApi',
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
  tagTypes: ['ActivityLogs'],
  endpoints: (builder) => ({
    getActivityLogsByProjectId: builder.query<ActivityLogResponseDTO[], number>({
      query: (projectId) => `activitylog/project/${projectId}`,
      transformResponse: (response: ApiResponse<ActivityLogResponseDTO[]>) => response.data,
      providesTags: ['ActivityLogs'],
    }),

    getActivityLogsByTaskId: builder.query<ActivityLogResponseDTO[], string>({
      query: (taskId) => `activitylog/task/${taskId}`,
      transformResponse: (response: ApiResponse<ActivityLogResponseDTO[]>) => response.data,
      providesTags: ['ActivityLogs'],
    }),

    getActivityLogsByEpicId: builder.query<ActivityLogResponseDTO[], string>({
      query: (epicId) => `activitylog/epic/${epicId}`,
      transformResponse: (response: ApiResponse<ActivityLogResponseDTO[]>) => response.data,
      providesTags: ['ActivityLogs'],
    }),

    getActivityLogsBySubtaskId: builder.query<ActivityLogResponseDTO[], string>({
      query: (subtaskId) => `activitylog/subtask/${subtaskId}`,
      transformResponse: (response: ApiResponse<ActivityLogResponseDTO[]>) => response.data,
      providesTags: ['ActivityLogs'],
    }),

    getActivityLogsByRiskKey: builder.query<ActivityLogResponseDTO[], string>({
      query: (riskKey) => `activitylog/risk/${riskKey}`,
      transformResponse: (response: ApiResponse<ActivityLogResponseDTO[]>) => response.data,
      providesTags: ['ActivityLogs'],
    }),
  }),
});

export const {
  useGetActivityLogsByProjectIdQuery,
  useGetActivityLogsBySubtaskIdQuery,
  useGetActivityLogsByTaskIdQuery,
  useGetActivityLogsByRiskKeyQuery,
  useGetActivityLogsByEpicIdQuery
} = activityLogApi;
