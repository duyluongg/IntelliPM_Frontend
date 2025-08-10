import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import type { CreateCommentRequest } from './types'
import { API_BASE_URL } from '../../constants/api';
import type { DocumentComment, CreateCommentRequest } from '../../types/DocumentCommentType';
import type { ApiResponse } from '../../types/ApiResponse';

export interface CommentDTO {
  id: number;
  content: string;
  author: {
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

function unwrapResponse<T>(resp: unknown): T {
  const r = resp as ApiResponse<T> | T;
  if (typeof r === 'object' && r !== null && 'isSuccess' in r && 'data' in r) {
    const dto = r as ApiResponse<T>;
    // Backend của bạn luôn trả ApiResponseDTO ở GET; POST create cũng nên trả ApiResponseDTO
    return dto.data ?? (null as unknown as T);
  }
  // Trường hợp backend trả thẳng object (không bọc DTO)
  return r as T;
}

type UpdateCommentBody = Partial<
  Pick<DocumentComment, 'fromPos' | 'toPos' | 'content' | 'comment'>
>;
type UpdateCommentArg = { id: number; body: UpdateCommentBody };
type DeleteCommentArg = { id: number; documentId: number };

export const documentCommentApi = createApi({
  reducerPath: 'documentCommentApi',
  tagTypes: ['Comments'],
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
    createComment: builder.mutation<DocumentComment, CreateCommentRequest>({
      query: (body) => ({
        url: 'documentcomment',
        method: 'POST',
        body,
      }),
      transformResponse: (resp: unknown) => unwrapResponse<DocumentComment>(resp),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Comments', id: `DOC-${arg.documentId}` },
      ],
    }),

    getCommentsByDocumentId: builder.query<DocumentComment[], number>({
      query: (documentId) => `documentcomment/document/${documentId}`,
      transformResponse: (res: ApiResponse<DocumentComment[]>) => res.data ?? [],
      providesTags: (_result, _err, documentId) => [{ type: 'Comments', id: `DOC-${documentId}` }],
    }),

    updateComment: builder.mutation<DocumentComment, UpdateCommentArg>({
      query: ({ id, body }) => ({
        url: `/documentcomment/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (resp: unknown) => unwrapResponse<DocumentComment>(resp),
      invalidatesTags: (result) =>
        result ? [{ type: 'Comments', id: `DOC-${result.documentId}` }] : [],
    }),

    deleteComment: builder.mutation<{ id: number }, DeleteCommentArg>({
      query: ({ id }) => ({
        url: `/documentcomment/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (resp: unknown) => unwrapResponse<{ id: number }>(resp),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Comments', id: `DOC-${arg.documentId}` }],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByDocumentIdQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = documentCommentApi;
