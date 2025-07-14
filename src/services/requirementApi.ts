import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RequirementRequest {
  title: string;
  type: string;
  description: string;
  priority: string;
}

export interface RequirementResponse {
  id: number;
  projectId: number;
  title: string;
  type: string;
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
}

export const requirementApi = createApi({
  reducerPath: 'requirementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL, 
    prepareHeaders: (headers) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accessToken = user?.accessToken || '';
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json'); 
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createRequirement: builder.mutation<
      ApiResponse<RequirementResponse>,
      { projectId: number; requirement: RequirementRequest }
    >({
      query: ({ projectId, requirement }) => ({
        url: `project/${projectId}/requirement`,
        method: 'POST',
        body: requirement,
      }),
    }),

    // Cập nhật một requirement
    updateRequirement: builder.mutation<
      ApiResponse<RequirementResponse>,
      { projectId: number; id: number; requirement: RequirementRequest }
    >({
      query: ({ projectId, id, requirement }) => ({
        url: `project/${projectId}/requirement/${id}`,
        method: 'PUT',
        body: requirement,
      }),
    }),

    // Tạo danh sách requirement
    createRequirementsBulk: builder.mutation<
      ApiResponse<RequirementResponse[]>,
      { projectId: number; requirements: RequirementRequest[] }
    >({
      query: ({ projectId, requirements }) => ({
        url: `project/${projectId}/requirement/bulk`,
        method: 'POST',
        body: requirements, 
      }),
    }),

    // Xóa một requirement
    deleteRequirement: builder.mutation<
      ApiResponse<null>,
      { projectId: number; id: number }
    >({
      query: ({ projectId, id }) => ({
        url: `project/${projectId}/requirement/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { 
  useCreateRequirementMutation, 
  useUpdateRequirementMutation, 
  useCreateRequirementsBulkMutation,
  useDeleteRequirementMutation 
} = requirementApi;