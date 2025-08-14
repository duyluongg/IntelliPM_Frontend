import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SubtaskComment {
    id: number;
    subtaskId: string;
    accountId: number;
    accountName: string;
    content: string;
    createdAt: string;
    accountPicture: string;
    createdBy: number;
}

interface SubtaskCommentListResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    data: SubtaskComment[];
}

interface SubtaskCommentResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    data: SubtaskComment;
}

export const subtaskCommentApi = createApi({
    reducerPath: 'subtaskCommentApi',
    tagTypes: ['CommentSubtasks', 'ActivityLogs'],
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
        // GET
        getSubtaskCommentsBySubtaskId: builder.query<SubtaskComment[], string>({
            query: (subtaskId) => `subtaskcomment/by-subtask/${subtaskId}`,
            transformResponse: (response: SubtaskCommentListResponse) => response.data,
            providesTags: ['CommentSubtasks'],
        }),

        // PUT
        updateSubtaskComment: builder.mutation<SubtaskComment, { id: number; subtaskId: string; accountId: number; content: string; createdBy: number }>({
            query: ({ id, ...body }) => ({
                url: `subtaskcomment/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: SubtaskCommentResponse) => response.data,
            invalidatesTags: ['CommentSubtasks', 'ActivityLogs'],
        }),

        // DELETE
        deleteSubtaskComment: builder.mutation<void, { id: number; createdBy: number; subtaskId: string }>({
            query: ({ id, createdBy }) => ({
                url: `subtaskcomment/${id}`,
                method: 'DELETE',
                body: { createdBy },
            }),
            invalidatesTags: ['CommentSubtasks', 'ActivityLogs'],
            async onQueryStarted({ id, subtaskId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    subtaskCommentApi.util.updateQueryData('getSubtaskCommentsBySubtaskId', subtaskId, (draft) => {
                        const index = draft.findIndex((comment) => comment.id === id);
                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                    console.log('Comment deleted successfully, ID:', id, 'Subtask ID:', subtaskId);
                } catch (err) {
                    patchResult.undo();
                    dispatch(subtaskCommentApi.util.invalidateTags(['CommentSubtasks']));
                    console.error('Failed to delete comment:', err);
                }
            },
        }),

        createSubtaskComment: builder.mutation<SubtaskComment, { subtaskId: string; accountId: number; content: string; createdBy: number }>({
            query: (body) => ({
                url: `subtaskcomment`,
                method: 'POST',
                body,
            }),
            transformResponse: (response: SubtaskCommentResponse) => response.data,
            invalidatesTags: ['CommentSubtasks', 'ActivityLogs'],
        }),
    }),
});

export const {
    useGetSubtaskCommentsBySubtaskIdQuery,
    useUpdateSubtaskCommentMutation,
    useDeleteSubtaskCommentMutation,
    useCreateSubtaskCommentMutation,
} = subtaskCommentApi;
