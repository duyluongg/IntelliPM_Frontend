import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface MilestoneResponseDTO {
  id: number;
  key?: string;
  projectId: number;
  sprintId: number | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMilestoneEmailRequestDTO {
  projectId: number;
  milestoneId: number;
}
interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

interface CreateMilestoneQuick {
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface UpdateMilestoneRequestDTO {
  projectId: number;
  sprintId: number | null;
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

    getMilestoneById: builder.query<MilestoneResponseDTO, number>({
      query: (id) => ({
        url: `milestone/${id}`,
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),

    createMilestoneQuick: builder.mutation<MilestoneResponseDTO, CreateMilestoneQuick>({
      query: (payload) => ({
        url: 'milestone/quick',
        method: 'POST',
        body: { ...payload, status: 'PLANNING' },
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),

    updateMilestone: builder.mutation<
      MilestoneResponseDTO,
      { id: number; payload: UpdateMilestoneRequestDTO }
    >({
      query: ({ id, payload }) => ({
        url: `milestone/${id}`,
        method: 'PUT',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),

    updateMilestoneSprint: builder.mutation<
      MilestoneResponseDTO,
      { key: string; sprintId: number | null }
    >({
      query: ({ key, sprintId }) => ({
        url: `milestone/${key}/sprint`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: sprintId,
      }),
      transformResponse: (response: ApiResponse<MilestoneResponseDTO>) => response.data,
    }),

    updateMilestoneStatus: builder.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `milestone/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      }),
    }),

    sendMilestoneEmail: builder.mutation<string, SendMilestoneEmailRequestDTO>({
      query: (payload) => ({
        url: 'milestone/send-milestone-email',
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<string>) => response.message,
    }),
  }),
});

export const {
  useGetMilestonesByProjectIdQuery,
  useGetMilestoneByIdQuery,
  useCreateMilestoneQuickMutation,
  useUpdateMilestoneMutation,
  useUpdateMilestoneSprintMutation,
  useUpdateMilestoneStatusMutation,
  useSendMilestoneEmailMutation,
} = milestoneApi;
