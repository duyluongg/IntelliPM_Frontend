import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RiskFileDTO {
  id: number;
  riskId: number;
  fileName: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
}

interface RiskFileListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskFileDTO[];
}

export const riskFileApi = createApi({
  reducerPath: 'riskFileApi',
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
    getRiskFilesByRiskId: builder.query<RiskFileDTO[], number>({
      query: (riskId) => ({
        url: `riskfile/by-risk/${riskId}`,
      }),
      transformResponse: (response: RiskFileListResponse) => response.data,
    }),

    uploadRiskFile: builder.mutation<void, { riskId: number; fileName: string; uploadedBy: number; file: File }>({
      query: ({ riskId, fileName, uploadedBy, file }) => {
        const formData = new FormData();
        formData.append('riskId', riskId.toString());
        formData.append('fileName', fileName);
        formData.append('uploadedBy', uploadedBy.toString());
        formData.append('file', file);

        return {
          url: 'riskfile/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),

    deleteRiskFile: builder.mutation<void, { id: number; createdBy: number }>({
      query: ({id, createdBy}) => ({
        url: `riskfile/${id}?createdBy=${createdBy}`,
        method: 'DELETE',
      }),
    }),

  }),
});

export const {
  useGetRiskFilesByRiskIdQuery,
  useUploadRiskFileMutation,
  useDeleteRiskFileMutation,
} = riskFileApi;
