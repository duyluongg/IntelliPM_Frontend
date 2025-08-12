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
    endpoints: (builder) => ({
        getCommentsByEpicId: builder.query<EpicCommentDTO[], string>({
            query: (epicId) => ({
                url: `epiccomment/by-epic/${epicId}`,
                method: 'GET',
            }),
            transformResponse: (response: EpicCommentListResponse) => response.data,
        }),

        createEpicComment: builder.mutation<void, { epicId: string; accountId: number; content: string; createdBy: number }>({
            query: (payload) => ({
                url: 'epiccomment',
                method: 'POST',
                body: payload,
            }),
        }),

        updateEpicComment: builder.mutation<void, { id: number; epicId: string; accountId: number; content: string, createdBy: number }>({
            query: ({ id, ...body }) => ({
                url: `epiccomment/${id}`,
                method: 'PUT',
                body,
            }),
        }),

        deleteEpicComment: builder.mutation<void, { id: number; createdBy: number }>({
            query: ({id, createdBy}) => ({
                url: `epiccomment/${id}`,
                method: 'DELETE',
                body: { createdBy },
            }),
        }),
    }),
});

export const {
    useGetCommentsByEpicIdQuery,
    useCreateEpicCommentMutation,
    useUpdateEpicCommentMutation,
    useDeleteEpicCommentMutation,
} = epicCommentApi;
