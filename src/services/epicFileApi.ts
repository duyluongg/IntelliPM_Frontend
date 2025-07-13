import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface EpicFileDTO {
  id: number;
  epicId: string;
  title: string;
  urlFile: string;
  createdAt: string;
}

interface EpicFileListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: EpicFileDTO[];
}

export const epicFileApi = createApi({
  reducerPath: 'epicFileApi',
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
    getEpicFilesByEpicId: builder.query<EpicFileDTO[], string>({
      query: (epicId) => ({
        url: `epicfile/by-epic/${epicId}`,
      }),
      transformResponse: (response: EpicFileListResponse) => response.data,
    }),

    uploadEpicFile: builder.mutation<void, { epicId: string; title: string; file: File }>({
      query: ({ epicId, title, file }) => {
        const formData = new FormData();
        formData.append('epicId', epicId);
        formData.append('title', title);
        formData.append('urlFile', file);

        return {
          url: 'epicfile/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),

    deleteEpicFile: builder.mutation<void, number>({
      query: (id) => ({
        url: `epicfile/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetEpicFilesByEpicIdQuery,
  useUploadEpicFileMutation,
  useDeleteEpicFileMutation,
} = epicFileApi;
