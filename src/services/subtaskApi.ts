import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SubtaskResponseDTO {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedByName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  manualInput: boolean;
  generationAiInput: boolean;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  reporterId: number;
  reporterName: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const subtaskApi = createApi({
  reducerPath: 'subtaskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // Uncomment below if you want to include auth headers
    // prepareHeaders: (headers) => {
    //   const token = localStorage.getItem('accessToken');
    //   if (token) {
    //     headers.set('Authorization', `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  endpoints: (builder) => ({
    getSubtasksByTaskId: builder.query<SubtaskResponseDTO[], string>({
      query: (taskId) => `subtask/by-task/${taskId}`,
      transformResponse: (response: ApiResponse<SubtaskResponseDTO[]>) => response.data,
    }),

    updateSubtaskStatus: builder.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `subtask/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      }),
    }),

    createSubtask: builder.mutation<void, { taskId: string; title: string }>({
      query: ({ taskId, title }) => ({
        url: 'subtask/create2', // ✅ endpoint đúng như curl bạn gửi
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { taskId, title }, // ✅ không cần JSON.stringify
      }),
    }),

    updateSubtask: builder.mutation<any, { id: string; assignedBy: number; priority: string; title: string; description: string }>({
      query: ({ id, ...body }) => ({
        url: `subtask/${id}`,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetSubtasksByTaskIdQuery,
  useUpdateSubtaskStatusMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation
} = subtaskApi;
