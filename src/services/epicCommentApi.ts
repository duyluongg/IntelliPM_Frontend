import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface EpicCommentDTO {
    id: number;
    epicId: string;
    accountId: number;
    content: string;
    createdAt: string;
    accountName: string;
    accountPicture: string;
    createdBy: number;
}

interface EpicCommentListResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    data: EpicCommentDTO[];
}

interface CreateEpicCommentPayload {
    epicId: string;
    accountId: number;
    content: string;
}

export const epicCommentApi = createApi({
    reducerPath: 'epicCommentApi',
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
    tagTypes: ['EpicComments', 'ActivityLogs'],
    endpoints: (builder) => ({
        getCommentsByEpicId: builder.query<EpicCommentDTO[], string>({
            query: (epicId) => ({
                url: `epiccomment/by-epic/${epicId}`,
                method: 'GET',
            }),
            transformResponse: (response: EpicCommentListResponse) => response.data,
            providesTags: ['EpicComments'],
        }),

        createEpicComment: builder.mutation<void, { epicId: string; accountId: number; content: string; createdBy: number }>({
            query: (payload) => ({
                url: 'epiccomment',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['EpicComments', 'ActivityLogs'],
        }),

        updateEpicComment: builder.mutation<void, { id: number; epicId: string; accountId: number; content: string, createdBy: number }>({
            query: ({ id, ...body }) => ({
                url: `epiccomment/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['EpicComments', 'ActivityLogs'],
        }),

        deleteEpicComment: builder.mutation<void, { id: number; createdBy: number, epicId: string }>({
            query: ({ id, createdBy }) => ({
                url: `epiccomment/${id}`,
                method: 'DELETE',
                body: { createdBy },
            }),
            invalidatesTags: ['EpicComments', 'ActivityLogs'],
            async onQueryStarted({ id, epicId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    epicCommentApi.util.updateQueryData('getCommentsByEpicId', epicId, (draft) => {
                        const index = draft.findIndex((comment) => comment.id === id);
                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                    console.log('Comment deleted successfully, ID:', id, 'Epic ID:', epicId);
                } catch (err) {
                    patchResult.undo();
                    dispatch(epicCommentApi.util.invalidateTags(['EpicComments']));
                    console.error('Failed to delete comment:', err);
                }
            },
        }),
    }),
});

export const {
    useGetCommentsByEpicIdQuery,
    useCreateEpicCommentMutation,
    useUpdateEpicCommentMutation,
    useDeleteEpicCommentMutation,
} = epicCommentApi;
