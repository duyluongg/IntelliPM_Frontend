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
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
  status: string | null;
}

export interface UpdateSprintDetailsRequestDTO {
  id: string;
  projectId?: number;
  name?: string;
  goal?: string | null;
  startDate?: string;
  endDate?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  status?: string;
}

export interface SprintWithTaskListResponseDTO extends SprintResponseDTO {
  tasks: TaskBacklogResponseDTO[];
}

export interface MoveTasksToSprintRequestDTO {
  sprintOldId: number;
  sprintNewId: number;
  type: string;
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
    getSprintsByProjectIdDescending: builder.query<SprintResponseDTO[], number>({
      query: (projectId) => ({
        url: 'sprint/by-project-id/descending',
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
    getSprintById: builder.query<SprintResponseDTO, number>({
      query: (id) => ({
        url: `sprint/${id}`,
        headers: {
          accept: '*/*',
        },
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO>) => response.data,
      providesTags: ['Sprint'],
    }),

updateSprintStatus: builder.mutation<SprintResponseDTO, { id: number; status: string }>({
  query: ({ id, status }) => ({
    url: `sprint/${id}/status`,
    method: 'PATCH',
    body: { status }, // Sends { "status": "COMPLETED" } as a JSON object
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
  }),
  transformResponse: (response: ApiResponse<SprintResponseDTO>) => response.data,
  invalidatesTags: ['Sprint'],
}),

    updateSprintDetails: builder.mutation<SprintResponseDTO, UpdateSprintDetailsRequestDTO>({
      query: ({ id, ...body }) => ({
        url: `sprint/${id}`,
        method: 'PUT',
        body: body,
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO>) => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.message || 'Failed to update sprint details');
        }
        return response.data;
      },
      invalidatesTags: ['Sprint'],
    }),
    createSprintQuick: builder.mutation<SprintResponseDTO, { projectKey: string }>({
      query: (body) => ({
        url: 'sprint/quick',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<SprintResponseDTO>) => response.data,
      invalidatesTags: ['Sprint'],
    }),
    checkSprintDates: builder.mutation<
      ApiResponse<{ isValid: boolean }>,
      { projectKey: string; checkDate: string }
    >({
      query: (body) => ({
        url: 'sprint/check-dates',
        method: 'POST',
        body,
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      }),
    }),
    checkWithinProject: builder.mutation<
      { isWithin: boolean },
      { projectKey: string; checkDate: string }
    >({
      query: (body) => ({
        url: 'sprint/check-within-project',
        method: 'POST',
        body,
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: ApiResponse<{ isWithin: boolean }>) => response.data,
    }),
    deleteSprint: builder.mutation<void, string>({
      query: (sprintId) => ({
        url: `sprint/${sprintId}/with-task`,
        method: 'DELETE',
        headers: {
          accept: '*/*',
        },
      }),
      invalidatesTags: ['Sprint'],
    }),

    moveTasks: builder.mutation<ApiResponse<null>, MoveTasksToSprintRequestDTO>({
      query: (body) => ({
        url: 'sprint/move-tasks',
        method: 'POST',
        body,
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: ApiResponse<null>) => response,
      invalidatesTags: ['Sprint'],
    }),
  }),
});

export const {
  useGetSprintsByProjectIdQuery,
  useGetSprintsByProjectIdDescendingQuery,
  useGetSprintsByProjectKeyWithTasksQuery,
  useGetSprintByIdQuery,
  useUpdateSprintStatusMutation,
  useUpdateSprintDetailsMutation,
  useCreateSprintQuickMutation,
  useCheckSprintDatesMutation,
  useCheckWithinProjectMutation,
  useDeleteSprintMutation,
  useMoveTasksMutation,
} = sprintApi;
