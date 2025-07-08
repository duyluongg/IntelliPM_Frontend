import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskAssignmentDTO {
  id: number;
  taskId: string;
  accountId: number;
  status: string;
  assignedAt: string;
  completedAt: string | null;
  hourlyRate: number | null;
  accountFullname: string;
  accountPicture: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const taskAssignmentApi = createApi({
  reducerPath: 'taskAssignmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getTaskAssignmentsByTaskId: builder.query<TaskAssignmentDTO[], string>({
      query: (taskId) => `task/${taskId}/taskassignment`,
      transformResponse: (response: ApiResponse<TaskAssignmentDTO[]>) => response.data,
    }),
  }),
});

export const {
  useGetTaskAssignmentsByTaskIdQuery
} = taskAssignmentApi;
