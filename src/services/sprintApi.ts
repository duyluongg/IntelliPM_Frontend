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
    //   const token = localStorage.getItem('accessToken');
    //   // const token =
    //   //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJQUk9KRUNUIE1BTkFHRVIiLCJhY2NvdW50SWQiOiIyNCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSGFuIE5ndXllbiIsImV4cCI6MTc1MjY3NDU4NywiaXNzIjoiSW50ZWxsaVBNIiwiYXVkIjoiSW50ZWxsaVBNIn0.QY0gtqotMmrxHYuuh9yzLNfX1P_XjfgRdNoPNw7P7E8';
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
