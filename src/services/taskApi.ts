import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskResponseDTO {
  id: number;
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
      // const token = localStorage.getItem('accessToken');
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJQUk9KRUNUIE1BTkFHRVIiLCJhY2NvdW50SWQiOiIyNCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSGFuIE5ndXllbiIsImV4cCI6MTc1MjY3NDU4NywiaXNzIjoiSW50ZWxsaVBNIiwiYXVkIjoiSW50ZWxsaVBNIn0.QY0gtqotMmrxHYuuh9yzLNfX1P_XjfgRdNoPNw7P7E8';
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
  }),
});

export const { useGetTasksByProjectIdQuery } = taskApi;
