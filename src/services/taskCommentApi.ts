import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskComment {
  id: number;
  taskId: string;
  accountId: number;
  accountName: string;
  content: string;
  createdAt: string;
  accountPicture: string;
  createdBy: number;
}

export const taskCommentApi = createApi({
  reducerPath: 'taskCommentApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Comments', 'ActivityLogs'],
  endpoints: (builder) => ({
    getCommentsByTaskId: builder.query<TaskComment[], string>({
      query: (taskId) => `taskcomment/by-task/${taskId}`,
      transformResponse: (response: {
        isSuccess: boolean;
        data: TaskComment[];
      }) => response.data,
      providesTags: ['Comments'],
    }),

    createTaskComment: builder.mutation<
      TaskComment,
      { taskId: string; accountId: number; content: string; createdBy: number }
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
      invalidatesTags: ['Comments', 'ActivityLogs'],
    }),

    updateTaskComment: builder.mutation<
      TaskComment,
      { id: number; taskId: string; accountId: number; content: string; createdBy: number }
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
      invalidatesTags: ['Comments', 'ActivityLogs'],
    }),

    deleteTaskComment: builder.mutation<
      void,
      { id: number; taskId: string; createdBy: number }
    >({
      query: ({ id, createdBy }) => ({
        url: `taskcomment/${id}`,
        method: 'DELETE',
        body: { createdBy },
      }),
      invalidatesTags: ['Comments', 'ActivityLogs'],
      async onQueryStarted({ id, taskId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskCommentApi.util.updateQueryData('getCommentsByTaskId', taskId, (draft) => {
            const index = draft.findIndex((comment) => comment.id === id);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          })
        );
        try {
          await queryFulfilled;
          console.log('Comment deleted successfully, ID:', id, 'Task ID:', taskId);
        } catch (err) {
          patchResult.undo();
          dispatch(taskCommentApi.util.invalidateTags(['Comments']));
          console.error('Failed to delete comment:', err);
        }
      },
    }),
  }),
});

export const {
  useGetCommentsByTaskIdQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
} = taskCommentApi;
