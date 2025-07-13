import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskComment {
  id: number;
  taskId: string;
  accountId: number;
  accountName: string;
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

    createTaskComment: builder.mutation<
      TaskComment,
      { taskId: string; accountId: number; content: string }
    >({
      query: (commentData) => ({
        url: 'taskcomment',
        method: 'POST',
        body: commentData,
      }),
      transformResponse: (response: {
        isSuccess: boolean;
        data: TaskComment;
      }) => response.data,
    }),

    updateTaskComment: builder.mutation<
      TaskComment,
      { id: number; taskId: string; accountId: number; content: string }
    >({
      query: ({ id, ...body }) => ({
        url: `taskcomment/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: {
        isSuccess: boolean;
        data: TaskComment;
      }) => response.data,
    }),

    deleteTaskComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `taskcomment/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCommentsByTaskIdQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
} = taskCommentApi;
