import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SubtaskFileDTO {
  id: number;
  subtaskId: string;
  title: string;
  urlFile: string;
  createdAt: string;
  createdBy: number;
}

interface SubtaskFileListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: SubtaskFileDTO[];
}

export const subtaskFileApi = createApi({
  reducerPath: 'subtaskFileApi',
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
    getSubtaskFilesBySubtaskId: builder.query<SubtaskFileDTO[], string>({
      query: (subtaskId) => ({
        url: `subtaskfile/by-subtask/${subtaskId}`,
      }),
      transformResponse: (response: SubtaskFileListResponse) => response.data,
    }),
    uploadSubtaskFile: builder.mutation<void, { subtaskId: string; title: string; file: File, createdBy: number }>({
      query: ({ subtaskId, title, file, createdBy }) => {
        const formData = new FormData();
        formData.append('subtaskId', subtaskId);
        formData.append('title', title);
        formData.append('file', file);
        formData.append('createdBy', createdBy.toString());

        return {
          url: 'subtaskfile/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),
    deleteSubtaskFile: builder.mutation<void, { id: number; createdBy: number }>({
      query: ({ id, createdBy }) => ({
        url: `subtaskfile/${id}`,
        method: 'DELETE',
        body: { createdBy },
      }),
    }),
  }),
});

export const {
  useGetSubtaskFilesBySubtaskIdQuery,
  useUploadSubtaskFileMutation,
  useDeleteSubtaskFileMutation,
} = subtaskFileApi;
