import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SubtaskComment {
    id: number;
    subtaskId: string;
    accountId: number;
    accountName?: string;
    content: string;
    createdAt: string;
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
        }),

        // PUT
        updateSubtaskComment: builder.mutation<SubtaskComment, { id: number; subtaskId: string; accountId: number; content: string }>({
            query: ({ id, ...body }) => ({
                url: `subtaskcomment/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: SubtaskCommentResponse) => response.data,
        }),

        // DELETE
        deleteSubtaskComment: builder.mutation<void, number>({
            query: (id) => ({
                url: `subtaskcomment/${id}`,
                method: 'DELETE',
            }),
        }),

        // POST - Create subtask comment
        createSubtaskComment: builder.mutation<SubtaskComment, { subtaskId: string; accountId: number; content: string }>({
            query: (body) => ({
                url: `subtaskcomment`,
                method: 'POST',
                body,
            }),
            transformResponse: (response: SubtaskCommentResponse) => response.data,
        }),
    }),
});

export const {
    useGetSubtaskCommentsBySubtaskIdQuery,
    useUpdateSubtaskCommentMutation,
    useDeleteSubtaskCommentMutation,
    useCreateSubtaskCommentMutation,
} = subtaskCommentApi;
