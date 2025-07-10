import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Giao diện cho một yêu cầu requirement
export interface RequirementRequest {
  title: string;
  type: string;
  description: string;
  priority: string;
}

// Giao diện cho một requirement trong phản hồi
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

// Giao diện phản hồi từ API tạo danh sách requirement
export interface CreateRequirementsBulkResponse {
  isSuccess: boolean;
  code: number;
  data: RequirementResponse[];
  message: string;
}

// API slice
export const requirementApi = createApi({
  reducerPath: 'requirementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL, // Ensure this is 'https://localhost:7128/' without '/api'
    prepareHeaders: (headers) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const accessToken = user?.accessToken || '';
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json'); // Ensure Content-Type is set
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createRequirementsBulk: builder.mutation<
      CreateRequirementsBulkResponse,
      { projectId: number; requirements: RequirementRequest[] }
    >({
      query: ({ projectId, requirements }) => ({
        url: `project/${projectId}/requirement/bulk`,
        method: 'POST',
        body: requirements, // gửi trực tiếp array
      }),
    }),
  }),
});

export const { useCreateRequirementsBulkMutation } = requirementApi;