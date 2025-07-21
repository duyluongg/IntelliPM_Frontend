// sprintApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskBacklogResponseDTO {
  id: string;
  reporterId: number;
  reporterName: string | null;
  reporterPicture: string | null;
  projectId: number;
  projectName: string | null;
  epicId: string | null;
  epicName: string | null;
  sprintId: number | null;
  sprintName: string | null;
  type: string | null;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  duration?: string | null;
  priority: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  taskAssignments: TaskAssignmentResponseDTO[];
}

export interface TaskAssignmentResponseDTO {
  id: number;
  taskId: string;
  accountId: number;
  status: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  hourlyRate: number | null;
  accountFullname: string | null;
  accountPicture: string | null;
}

export interface SprintResponseDTO {
  id: number;
  projectId: number;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  status: string | null;
}

export interface SprintWithTaskListResponseDTO extends SprintResponseDTO {
  tasks: TaskBacklogResponseDTO[];
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
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Sprint'],
  endpoints: (builder) => ({
    getSprintsByProjectId: builder.query<SprintResponseDTO[], number>({
      query: (projectId) => ({
        url: 'sprint/by-project-id',
        params: { projectId },
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO[]>) => response.data,
      providesTags: ['Sprint'],
    }),
    getSprintsByProjectKeyWithTasks: builder.query<SprintWithTaskListResponseDTO[], string>({
      query: (projectKey) => ({
        url: 'sprint/by-project-id-with-tasks',
        params: { projectKey },
      }),
      transformResponse: (response: ApiResponse<SprintWithTaskListResponseDTO[]>) => response.data,
      providesTags: ['Sprint'],
    }),

    updateSprintStatus: builder.mutation<SprintResponseDTO, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `sprint/${id}/status`,
        method: 'PATCH',
        body: JSON.stringify(status),
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO>) => response.data,
      invalidatesTags: ['Sprint'],
    }),


  }),
});

export const { 
  useGetSprintsByProjectIdQuery, 
  useGetSprintsByProjectKeyWithTasksQuery,
  useUpdateSprintStatusMutation,
} = sprintApi;