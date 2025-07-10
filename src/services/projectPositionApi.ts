import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface ProjectPositionRequest {
  position: string;
}

interface ProjectPositionResponse {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  data: T | null;
  message: string;
}

export const projectPositionApi = createApi({
  reducerPath: 'projectPositionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accessToken = user?.accessToken || '';
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createProjectPosition: builder.mutation<ApiResponse<ProjectPositionResponse>, { projectMemberId: number; position: ProjectPositionRequest }>({
      query: ({ projectMemberId, position }) => ({
        url: `project-member/${projectMemberId}/projectposition`,
        method: 'POST',
        body: position,
      }),
    }),
    deleteProjectPosition: builder.mutation<ApiResponse<null>, { projectMemberId: number; positionId: number }>({
      query: ({ projectMemberId, positionId }) => ({
        url: `project-member/${projectMemberId}/projectposition/${positionId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateProjectPositionMutation,
  useDeleteProjectPositionMutation,
} = projectPositionApi;