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
      const userJson = localStorage.getItem('user');
      const token = userJson ? JSON.parse(userJson).accessToken : null;
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
  }),
});

export const {
  useGetTasksByProjectIdQuery,
  useUpdateTaskStatusMutation,
  useGetTaskByIdQuery,
} = taskApi;
