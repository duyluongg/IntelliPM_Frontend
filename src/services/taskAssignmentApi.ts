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
  accountPicture: string | null;
}

export interface TaskAssignmentHoursDTO {
  id: number;
  taskId: string;
  accountId: number;
  hourlyRate: number | null;
  accountFullname: string;
  accountUsername: string;
  accountPicture: string | null;
  plannedHours: number | null;
  actualHours: number | null;
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
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  tagTypes: ['TaskAssignment'],
  endpoints: (builder) => ({
    getTaskAssignmentsByTaskId: builder.query<TaskAssignmentDTO[], string>({
      query: (taskId) => `task/${taskId}/taskassignment`,
      transformResponse: (response: ApiResponse<TaskAssignmentDTO[]>) => response.data,
      providesTags: ['TaskAssignment'],
    }),
    deleteTaskAssignment: builder.mutation<void, { taskId: string; assignmentId: number }>({
      query: ({ taskId, assignmentId }) => ({
        url: `task/${taskId}/taskassignment/${assignmentId}`,
        method: 'DELETE',
        headers: {
          accept: '*/*',
        },
      }),
      invalidatesTags: ['TaskAssignment'],
    }),
    createTaskAssignmentQuick: builder.mutation<
      TaskAssignmentDTO,
      { taskId: string; accountId: number }
    >({
      query: ({ taskId, accountId }) => ({
        url: `task/${taskId}/taskassignment/quick`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: { accountId },
      }),
      transformResponse: (response: ApiResponse<TaskAssignmentDTO>) => response.data,
      invalidatesTags: ['TaskAssignment'],
    }),

    getTaskAssignmentHoursByTaskId: builder.query<TaskAssignmentHoursDTO[], string>({
      query: (taskId) => `task/${taskId}/taskassignment/hours`,
      transformResponse: (response: ApiResponse<TaskAssignmentHoursDTO[]>) => response.data,
      providesTags: ['TaskAssignment'],
    }),

    updateActualHoursByTaskId: builder.mutation<
      void,
      { taskId: string; data: { id: number; actualHours: number }[] }
    >({
      query: ({ taskId, data }) => ({
        url: `task/${taskId}/taskassignment/update-actual-hours`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['TaskAssignment'],
    }),
  }),
});

export const {
  useGetTaskAssignmentsByTaskIdQuery,
  useLazyGetTaskAssignmentsByTaskIdQuery,
  useDeleteTaskAssignmentMutation,
  useCreateTaskAssignmentQuickMutation,
  useGetTaskAssignmentHoursByTaskIdQuery,
  useUpdateActualHoursByTaskIdMutation,
} = taskAssignmentApi;
