import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';
import type { CreateDocumentRequest, DocumentType } from '../../types/DocumentType';
import type {
  ShareDocumentByEmailRequest,
  ShareDocumentByEmailResult,
  ShareDocWireData,
} from '../../types/ShareDocumentType';

interface ShareDocumentViaEmailRequest {
  userIds: number[];
  customMessage: string;
  file: File;
}

export interface DocumentResponseDTO {
  id: number;
  projectId: number;
  taskId?: string;
  title: string;
  type?: string;
  template?: string;
  content?: string;
  fileUrl?: string;
  isActive: boolean;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
};

interface GetSharedDocumentsResponse {
  isSuccess: boolean;
  code: number;
  data: DocumentType[];
  message: string;
}

type GenerateAIContentReq = { id: number; prompt: string };
type GenerateAIContentResp = { content: string };

export const documentApi = createApi({
  reducerPath: 'documentApi',
  tagTypes: ['Documents'],
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
      transformResponse: (response: ApiResponse<DocumentType>) => response.data,
    }),

    createDocumentRequest: builder.mutation<DocumentType, Partial<DocumentType>>({
      query: (body) => ({
        url: 'documents/request',
        method: 'POST',
        body,
      }),
    }),
    createDocument: builder.mutation<DocumentType, CreateDocumentRequest>({
      query: (body) => ({
        url: 'documents/create',
        method: 'POST',
        body,
      }),
      transformResponse: (resp: ApiResponse<DocumentType>) => resp.data,
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

    generateAIContent: builder.mutation<GenerateAIContentResp, GenerateAIContentReq>({
      query: ({ id, prompt }) => ({
        url: `/documents/${id}/generate-ai-content`,
        method: 'POST',
        // Nếu backend đang nhận raw string JSON (ví dụ [FromBody] string), giữ nguyên dòng dưới:
        body: JSON.stringify(prompt),
        headers: { 'Content-Type': 'application/json' },

        // Nếu backend nhận DTO { prompt: string } thì đổi thành:
        // body: { prompt },
      }),
    }),

    findDocumentByKey: builder.query<
      DocumentType,
      {
        projectId: number;
        taskId?: string;
        epicId?: string;
        subTaskId?: string;
      }
    >({
      query: ({ projectId, taskId, epicId, subTaskId }) => {
        const params = new URLSearchParams();
        params.append('projectId', projectId.toString());
        if (taskId) params.append('taskId', taskId);
        if (epicId) params.append('epicId', epicId);
        if (subTaskId) params.append('subTaskId', subTaskId);
        return `documents/find-by-key?${params.toString()}`;
      },
    }),

    getDocumentMapping: builder.query<
      Record<string, number>,
      { projectId: number; userId: number }
    >({
      query: ({ projectId, userId }) =>
        `/documents/mapping?projectId=${projectId}&userId=${userId}`,
    }),

    askAI: builder.mutation<{ content: string }, string>({
      query: (prompt) => ({
        url: '/documents/ask-ai',
        method: 'POST',
        body: JSON.stringify(prompt),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    summarizeAI: builder.query<{ summary: string }, number>({
      query: (id) => `documents/${id}/summary`,
    }),
    documentStatus: builder.query<DocumentType[], { projectId: number; status: string }>({
      query: ({ projectId, status }) => `documents/project/${projectId}/status/${status}`,
    }),

    approveDocument: builder.mutation<
      DocumentType,
      { documentId: number; status: string; comment: string }
    >({
      query: ({ documentId, status, comment }) => ({
        url: `documents/${documentId}/approve`,
        method: 'POST',
        body: {
          status,
          comment,
        },
      }),
    }),

    generateFromTasks: builder.mutation<string, number>({
      query: (documentId) => ({
        url: `documents/${documentId}/generate-from-task`,
        method: 'POST',
      }),
      transformResponse: (response: { content: string }) => response.content,
    }),
    generateFromProject: builder.mutation<string, number>({
      query: (documentId) => ({
        url: `documents/${documentId}/generate-from-project`,
        method: 'POST',
      }),
      transformResponse: (response: { content: string }) => response.content,
    }),

    shareDocumentViaEmail: builder.mutation<any, ShareDocumentViaEmailRequest>({
      query: ({ userIds, customMessage, file }) => {
        const formData = new FormData();
        userIds.forEach((id) => formData.append('userIds', id.toString()));
        formData.append('customMessage', customMessage);
        formData.append('file', file);

        return {
          url: 'documents/share-via-email',
          method: 'POST',
          body: formData,
        };
      },
    }),

    shareDocumentByEmails: builder.mutation<
      ShareDocumentByEmailResult, // ← kết quả đã chuẩn hoá cho component
      ShareDocumentByEmailRequest
    >({
      query: ({ documentId, emails, message, projectKey, permissionType }) => ({
        url: `documents/${documentId}/share`,
        method: 'POST',
        body: { emails, message, projectKey, permissionType }, // không cần documentId trong body
      }),
      // response backend: ApiResponse<ShareDocWireData>
      transformResponse: (raw: ApiResponse<ShareDocWireData>): ShareDocumentByEmailResult => ({
        isSuccess: (raw?.isSuccess ?? false) && (raw?.data?.success ?? false),
        failedEmails: raw?.data?.failedEmails ?? [],
        message: raw?.message ?? '',
      }),
    }),

    getMyPermission: builder.query<{ permission: string }, number>({
      query: (documentId) => `documents/${documentId}/permission/current-user`,
    }),

    getDocumentsByProjectId: builder.query<DocumentType[], number>({
      query: (projectId) => `documents/project/${projectId}`,
      transformResponse: (response: ApiResponse<DocumentType[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              { type: 'Documents', id: 'LIST' },
              ...result.map((d) => ({ type: 'Documents' as const, id: d.id })),
            ]
          : [{ type: 'Documents', id: 'LIST' }],
    }),

    deleteDocument: builder.mutation<void, number>({
      query: (id) => ({
        url: `documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, _id) => [
        { type: 'Documents', id: 'LIST' },
        { type: 'Documents', id: _id },
      ],
    }),

    updateVisibility: builder.mutation<any, { id: number; visibility: 'MAIN' | 'PRIVATE' }>({
      query: ({ id, visibility }) => ({
        url: `documents/${id}/visibility`,
        method: 'PATCH',
        body: { visibility },
      }),
      invalidatesTags: ['Documents'],
    }),

    getDocumentsSharedToMeInProject: builder.query<GetSharedDocumentsResponse, number>({
      query: (projectId) => `documents/shared-to-me/project/${projectId}`,
    }),
  }),
});

export const {
  useGetDocumentByIdQuery,
  useCreateDocumentRequestMutation,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useGetMyDocumentsQuery,
  useGenerateAIContentMutation,
  useFindDocumentByKeyQuery,
  useGetDocumentMappingQuery,
  useAskAIMutation,
  useSummarizeAIQuery,
  useDocumentStatusQuery,
  useApproveDocumentMutation,
  useGenerateFromTasksMutation,
  useGenerateFromProjectMutation,
  useShareDocumentViaEmailMutation,
  useShareDocumentByEmailsMutation,
  useGetMyPermissionQuery,
  useGetDocumentsByProjectIdQuery,
  useDeleteDocumentMutation,
  useUpdateVisibilityMutation,
  useGetDocumentsSharedToMeInProjectQuery,
} = documentApi;
