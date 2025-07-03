import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface EpicResponseDTO {
  id: string;
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  reporterId: number;
  assignedById: number | null;
  sprintId: number | null;
}

interface EpicListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: EpicResponseDTO[];
}

interface EpicDetailResponse {
  isSuccess: boolean;
  data: EpicResponseDTO;
}

export const epicApi = createApi({
  reducerPath: 'epicApi',
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
    getEpicsByProjectId: builder.query<EpicResponseDTO[], number>({
      query: (projectId) => ({
        url: 'epic/by-project/${projectId}',
        params: { projectId },
      }),
      transformResponse: (response: EpicListResponse) => response.data,
    }),

    getEpicById: builder.query<EpicResponseDTO, string>({
      query: (id) => `epic/${id}`,
      transformResponse: (response: EpicDetailResponse) => response.data,
    }),

    updateEpicStatus: builder.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `epic/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      }),
    }),
  }),
});

export const {
  useGetEpicsByProjectIdQuery,
  useGetEpicByIdQuery,
  useUpdateEpicStatusMutation,
} = epicApi;
