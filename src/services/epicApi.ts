// epicApi.ts
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
  reporterId: number  | null;
  assignedBy: number | null;
  assignedByFullname: string | null;
  assignedByPicture: string | null;
  reporterFullname: string | null;
  reporterPicture: string | null;
  sprintId: number | null;
}

export interface UpdateEpicRequestDTO {
  projectId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  reporterId?: number | null;
  assignedBy?: number | null;
}

interface EpicListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: EpicResponseDTO[];
}

interface EpicDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: EpicResponseDTO;
}

export interface EpicWithTaskRequestDTO {
  epicId?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskRequestDTO[];
}

interface TaskRequestDTO {
  id?: string;
  taskId?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  suggestedRole: string;
  assignedMembers: TaskAssignedMembersRequestDTO[];
}

interface TaskAssignedMembersRequestDTO {
  accountId: number;
  fullName: string;
  picture: string;
}

interface CreateEpicResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: string;
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
  tagTypes: ['Epic'],
  endpoints: (builder) => ({
    getEpicsByProjectId: builder.query<EpicResponseDTO[], number>({
      query: (projectId) => ({
        url: `epic/by-project/${projectId}`,
        params: { projectId },
      }),
      transformResponse: (response: EpicListResponse) => response.data,
      providesTags: ['Epic'],
    }),

    getEpicById: builder.query<EpicResponseDTO, string>({
      query: (id) => `epic/${id}`,
      transformResponse: (response: EpicDetailResponse) => response.data,
      providesTags: ['Epic'],
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
      invalidatesTags: ['Epic'],
    }),

    createEpicWithTasks: builder.mutation<
      CreateEpicResponse,
      { projectId: number; data: EpicWithTaskRequestDTO }
    >({
      query: ({ projectId, data }) => ({
        url: `epic/with-tasks/${projectId}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      transformResponse: (response: CreateEpicResponse) => response,
      invalidatesTags: ['Epic'],
    }),

    updateEpic: builder.mutation<EpicDetailResponse, { id: string; data: UpdateEpicRequestDTO }>({
      query: ({ id, data }) => ({
        url: `epic/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      }),
      invalidatesTags: ['Epic'],
    }),
  }),
});

export const {
  useGetEpicsByProjectIdQuery,
  useGetEpicByIdQuery,
  useUpdateEpicStatusMutation,
  useCreateEpicWithTasksMutation,
  useUpdateEpicMutation,
} = epicApi;
