import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskResponseDTO {
  id: string;
  reporterId: number;
  projectId: number;
  epicId: number;
  sprintId: number;
  milestoneId: number;
  type: string;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  duration: string;
  actualStartDate: string;
  actualEndDate: string | null;
  percentComplete: number;
  plannedHours: number;
  actualHours: number;
  plannedCost: number;
  plannedResourceCost: number;
  actualCost: number;
  actualResourceCost: number;
  remainingHours: number;
  createdAt: string;
  updatedAt: string;
  priority: string;
  evaluate: string | null;
  status: string;
}

interface TaskListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: TaskResponseDTO[];
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
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
  endpoints: (builder) => ({
    getTasksByProjectId: builder.query<TaskResponseDTO[], number>({
      query: (projectId) => ({
        url: 'task/by-project-id',
        params: { projectId },
      }),
      transformResponse: (response: TaskListResponse) => response.data,
    }),

    updateTaskStatus: builder.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `task/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      }),
    }),

    getTaskById: builder.query<TaskResponseDTO, string>({
      query: (id) => `task/${id}`,
      transformResponse: (response: { isSuccess: boolean; data: TaskResponseDTO }) => response.data,
    }),

    updateTaskType: builder.mutation<void, { id: string; type: string }>({
      query: ({ id, type }) => ({
        url: `task/${id}/type`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(type), // Gửi "TASK", "BUG", "STORY"
      }),
    }),
    getTasksByEpicId: builder.query<TaskResponseDTO[], string>({
      query: (epicId) => ({
        url: 'task/by-epic-id',
        params: { epicId },
      }),
      transformResponse: (response: TaskListResponse) => response.data,
    }),
  }),
});

export const {
  useGetTasksByProjectIdQuery,
  useUpdateTaskStatusMutation,
  useGetTaskByIdQuery,
  useUpdateTaskTypeMutation,
  useGetTasksByEpicIdQuery
} = taskApi;
