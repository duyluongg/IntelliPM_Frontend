import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SubtaskResponseDTO {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedByName: string;
  plannedEndDate: string | null;
  sprintId: number;
  sprintName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  manualInput: boolean;
  generationAiInput: boolean;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  reporterId: number;
  reporterName: string;
  createdBy: number;
  warnings?: string[];
  percentComplete: number;
  actualCost: number;
}

export interface SubtaskFullResponseDTO {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedFullName: string;
  assignedUsername: string;
  assignedPicture: string;
  title: string;
  description: string;
  reporterId: number;
  status: string;
  priority: string;
  manualInput: boolean;
  generationAiInput: boolean;
  sprintId: number;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  duration: number;
  actualStartDate: string;
  actualEndDate: string;
  percentComplete: number;
  plannedHours: number;
  actualHours: number;
  remainingHours: number;
  plannedCost: number;
  plannedResourceCost: number;
  actualCost: number;
  actualResourceCost: number;
  evaluate: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  createdBy: number;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const subtaskApi = createApi({
  reducerPath: 'subtaskApi',
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
    getSubtasksByTaskId: builder.query<SubtaskResponseDTO[], string>({
      query: (taskId) => `subtask/by-task/${taskId}`,
      transformResponse: (response: ApiResponse<SubtaskResponseDTO[]>) => response.data,
    }),

    updateSubtaskStatus: builder.mutation<void, { id: string; status: string; createdBy: number }>({
      query: ({ id, status, createdBy }) => ({
        url: `subtask/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, createdBy }),
      }),
    }),

    createSubtask: builder.mutation<void, { taskId: string; title: string; createdBy: number; reporterId: number }>({
      query: ({ taskId, title, createdBy, reporterId }) => ({
        url: 'subtask/create2',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { taskId, title, createdBy, reporterId },
      }),
    }),
    
    createAISubtask: builder.mutation<void, { taskId: string; title: string; createdBy: number; reporterId: number }>({
      query: ({ taskId, title, createdBy, reporterId }) => ({
        url: 'subtask',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { taskId, title, createdBy, reporterId },
      }),
    }),

    getSubtaskById: builder.query<SubtaskResponseDTO, string>({
      query: (id) => `subtask/${id}`,
      transformResponse: (response: ApiResponse<SubtaskResponseDTO>) => response.data,
    }),

    updateSubtask: builder.mutation<
      any,
      {
        id: string;
        assignedBy: number;
        priority: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        reporterId: number;
        createdBy: number;
        sprintId: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `subtask/${id}`,
        method: 'PUT',
        body,
      }),
    }),

    getSubtaskFullDetailedById: builder.query<SubtaskFullResponseDTO, string>({
      query: (id) => `subtask/${id}/full-detailed`,
      transformResponse: (response: ApiResponse<SubtaskFullResponseDTO>) => response.data,
    }),

    updateSubtaskPlannedHours: builder.mutation<
      void,
      { id: string; hours: number; createdBy: number }
    >({
      query: ({ id, hours, createdBy }) => ({
        url: `subtask/${id}/planned-hours?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hours),
      }),
    }),

    updateSubtaskActualHours: builder.mutation<void, { id: string; hours: number; createdBy: number }>({
      query: ({ id, hours, createdBy }) => ({
        url: `subtask/${id}/actual-hours?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hours),
      }),
    }),

    updateSubtaskPercentComplete: builder.mutation<void, { id: string; percentComplete: number; createdBy: number }>({
      query: ({ id, percentComplete, createdBy }) => ({
        url: `subtask/${id}/percent-complete?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(percentComplete),
      }),
    }),

    updateSubtaskPlannedCost: builder.mutation<void, { id: string; plannedCost: number; createdBy: number }>({
      query: ({ id, plannedCost, createdBy }) => ({
        url: `subtask/${id}/planned-cost?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plannedCost),
      }),
    }),

    updateSubtaskActualCost: builder.mutation<void, { id: string; actualCost: number; createdBy: number }>({
      query: ({ id, actualCost, createdBy }) => ({
        url: `subtask/${id}/actual-cost?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actualCost),
      }),
    }),
  }),
});

export const {
  useGetSubtasksByTaskIdQuery,
  useUpdateSubtaskStatusMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useGetSubtaskByIdQuery,
  useGetSubtaskFullDetailedByIdQuery,
  useUpdateSubtaskPlannedHoursMutation,
  useUpdateSubtaskActualHoursMutation,
  useCreateAISubtaskMutation,
  useUpdateSubtaskPercentCompleteMutation,
  useUpdateSubtaskPlannedCostMutation,
  useUpdateSubtaskActualCostMutation,
} = subtaskApi;
