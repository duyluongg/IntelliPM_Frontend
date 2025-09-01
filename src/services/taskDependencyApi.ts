import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskDependencyResponseDTO {
  id: number;
  fromType: string;
  linkedFrom: string;
  toType: string;
  linkedTo: string;
  type: string;
}

export interface TaskDependencyCreateDTO {
  id: number | string;
  fromType: string;
  linkedFrom: string;
  toType: string;
  linkedTo: string;
  type: string;
}

export interface CreateTaskDependenciesRequest {
  dependencies: TaskDependencyCreateDTO[];
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
}

export const taskDependencyApi = createApi({
  reducerPath: 'taskDependencyApi',
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
    getTaskDependenciesByLinkedFrom: builder.query<TaskDependencyResponseDTO[], string>({
      query: (linkedFrom: string) => `taskdependency/by-linked-from?linkedFrom=${linkedFrom}`,
      transformResponse: (response: ApiResponse<TaskDependencyResponseDTO[]>) => response.data,
    }),

    createTaskDependencies: builder.mutation<
      TaskDependencyResponseDTO[],
      CreateTaskDependenciesRequest
    >({
      query: (body) => ({
        url: 'taskdependency/batch',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<TaskDependencyResponseDTO[]>) => response.data,
    }),

    deleteTaskDependency: builder.mutation<void, { linkedFrom: string; linkedTo: string }>({
      query: ({ linkedFrom, linkedTo }) => ({
        url: `taskdependency/delete?linkedFrom=${linkedFrom}&linkedTo=${linkedTo}`,
        method: 'DELETE',
      }),
    }),

    deleteTaskDependencyById: builder.mutation<void, number>({
      query: (id) => ({
        url: `taskdependency/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetTaskDependenciesByLinkedFromQuery,
  useCreateTaskDependenciesMutation,
  useDeleteTaskDependencyMutation,
  useDeleteTaskDependencyByIdMutation,
} = taskDependencyApi;
