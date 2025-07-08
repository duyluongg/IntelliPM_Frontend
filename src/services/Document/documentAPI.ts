import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';
import type { DocumentType } from '../../types/DocumentType';

export const documentApi = createApi({
  reducerPath: 'documentApi',
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
    getDocumentById: builder.query<DocumentType, number>({
      query: (id) => `documents/${id}`,
    }),
    createDocument: builder.mutation<DocumentType, Partial<DocumentType>>({
      query: (body) => ({
        url: 'documents',
        method: 'POST',
        body,
      }),
    }),
    updateDocument: builder.mutation<DocumentType, { id: number; data: Partial<DocumentType> }>({
      query: ({ id, data }) => ({
        url: `documents/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    getMyDocuments: builder.query<DocumentType[], void>({
      query: () => 'documents/created-by-me',
    }),
    generateAIContent: builder.mutation<
      { content: string },
      { documentId: number; prompt: string }
    >({
      query: ({ documentId, prompt }) => ({
        url: `documents/${documentId}/generate-ai-content`,
        method: 'POST',
        body: JSON.stringify(prompt),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const {
  useGetDocumentByIdQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useGetMyDocumentsQuery,
  useGenerateAIContentMutation,
} = documentApi;
