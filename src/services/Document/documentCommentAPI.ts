import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import type { CreateCommentRequest } from './types'
import { API_BASE_URL } from '../../constants/api';

export interface CreateCommentRequest {
  documentId: number;
  content: string;
}

export interface CommentDTO {
  id: number;
  content: string;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export const documentCommentApi = createApi({
  reducerPath: 'documentCommentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const token = user?.accessToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    createComment: builder.mutation<any, CreateCommentRequest>({
      query: (body) => ({
        url: 'documentcomment',
        method: 'POST',
        body,
      }),
    }),

    getCommentsByDocumentId: builder.query<any[], number>({
      query: (documentId) => ({
        url: `documentcomment/document/${documentId}`,
        method: 'GET',
      }),
    }),

    updateComment: builder.mutation<CommentDTO, { id: number; content: string }>({
      query: ({ id, content }) => ({
        url: `/documentcomment/${id}`,
        method: 'PUT',
        body: { content },
      }),
      //   invalidatesTags: (result, error, { id }) => [{ type: 'Comment', id }],
    }),

    deleteComment: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/documentcomment/${id}`,
        method: 'DELETE',
      }),
      //   invalidatesTags: (result, error, id) => [{ type: 'Comment', id }],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByDocumentIdQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = documentCommentApi;
