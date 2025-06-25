import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface MilestoneResponseDTO {
  id: number;
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const milestoneApi = createApi({
  reducerPath: 'milestoneApi',
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
    getMilestonesByProjectId: builder.query<MilestoneResponseDTO[], number>({
      query: (projectId) => ({
        url: 'milestone/by-project-id',
        params: { projectId },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO[]>) => response.data,
    }),
  }),
});

export const { useGetMilestonesByProjectIdQuery } = milestoneApi;
