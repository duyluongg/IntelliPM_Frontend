import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SprintResponseDTO {
  id: number;
  projectId: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const sprintApi = createApi({
  reducerPath: 'sprintApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // prepareHeaders: (headers) => {
    //   const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Rút gọn token ở đây
    //   if (token) {
    //     headers.set('Authorization', `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  endpoints: (builder) => ({
    getSprintsByProjectId: builder.query<SprintResponseDTO[], number>({
      query: (projectId) => ({
        url: 'sprint/by-project-id',
        params: { projectId },
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO[]>) => response.data,
    }),
  }),
});

export const { useGetSprintsByProjectIdQuery } = sprintApi;
