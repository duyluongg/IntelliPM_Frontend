import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface MilestoneResponseDTO {
  id: number;
  key?: string; // Thêm thuộc tính key vì API trả về
  projectId: number;
  sprintId: number | null; // sprintId có thể là null theo API response
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

interface CreateMilestoneQuick{
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export const milestoneApi = createApi({
  reducerPath: 'milestoneApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userJson = localStorage.getItem('user');
      const token = userJson ? JSON.parse(userJson).accessToken : null;
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

    createMilestoneQuick: builder.mutation<MilestoneResponseDTO, CreateMilestoneQuick>({
      query: (payload) => ({
        url: 'milestone/quick',
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),
    updateMilestoneSprint: builder.mutation<MilestoneResponseDTO, { key: string; sprintId: number }>({
      query: ({ key, sprintId }) => ({
        url: `milestone/${key}/sprint`,
        method: 'PATCH',
        body: sprintId,
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),
  }),
});

export const {
  useGetMilestonesByProjectIdQuery,
  useCreateMilestoneQuickMutation,
  useUpdateMilestoneSprintMutation,
} = milestoneApi;