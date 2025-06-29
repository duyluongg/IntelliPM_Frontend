import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskComment {
  id: number;
  taskId: string;
  accountId: number;
  content: string;
  createdAt: string;
}

export const taskCommentApi = createApi({
  reducerPath: 'taskCommentApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getCommentsByTaskId: builder.query<TaskComment[], string>({
      query: (taskId) => `taskcomment/by-task/${taskId}`,
      transformResponse: (response: {
        isSuccess: boolean;
        data: TaskComment[];
      }) => response.data,
    }),
  }),
});

export const { useGetCommentsByTaskIdQuery } = taskCommentApi;
