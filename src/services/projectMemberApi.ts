import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Request DTO interfaces
interface ProjectMemberRequest {
  accountId: number;
}

export interface ProjectMemberWithPositionRequest {
  accountId: number;
  positions: string[];
}

// Response DTO interfaces
interface ProjectPositionResponse {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

interface ProjectMemberResponse {
  id: number;
  accountId: number;
  accountName: string | null;
  projectId: number;
  joinedAt: string | null;
  invitedAt: string;
  status: string | null;
}

export interface ProjectMemberWithPositionsResponse {
  id: number;
  accountId: number;
  accountName: string;
  projectId: number;
  joinedAt: string | null;
  invitedAt: string;
  status: string;
  email: string | null;
  fullName: string;
  username: string;
  picture: string | null;
  projectPositions: ProjectPositionResponse[];
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  data: T | null;
  message: string;
}

interface GetProjectMembersWithPositionsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectMemberWithPositionsResponse[];
  message: string;
}

export const projectMemberApi = createApi({
  reducerPath: 'projectMemberApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      const accessToken = localStorage.getItem('accessToken') || '';
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ProjectMember', 'Projects'],
  endpoints: (builder) => ({
    createProjectMember: builder.mutation<
      ApiResponse<ProjectMemberResponse>,
      { projectId: number; request: ProjectMemberRequest }
    >({
      query: ({ projectId, request }) => ({
        url: `project/${projectId}/projectmember`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    deleteProjectMember: builder.mutation<ApiResponse<null>, { projectId: number; id: number }>({
      query: ({ projectId, id }) => ({
        url: `project/${projectId}/projectmember/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectMember'],
    }),
    createBulkProjectMembersWithPositions: builder.mutation<
      ApiResponse<ProjectMemberWithPositionsResponse[]>,
      { projectId: number; requests: ProjectMemberWithPositionRequest[] }
    >({
      query: ({ projectId, requests }) => ({
        url: `project/${projectId}/projectmember/bulk-with-positions`,
        method: 'POST',
        body: requests,
      }),
      transformResponse: (response: any) => {
        if (typeof response === 'string' || !response) {
          return { isSuccess: false, code: 500, data: null, message: 'Invalid server response' };
        }
        return response;
      },
      invalidatesTags: ['ProjectMember'],
    }),
    getProjectMembers: builder.query<ProjectMemberWithPositionsResponse[], number>({
      query: (projectId) => `project/${projectId}/projectmember`,
      transformResponse: (response: any) => {
        if (response?.isSuccess && Array.isArray(response.data)) {
          return response.data.filter((member: any) => member.status === 'IN_PROGRESS');
        }
        return [];
      },
      providesTags: ['ProjectMember'],
    }),
    getProjectMembersNoStatus: builder.query<ProjectMemberWithPositionsResponse[], number>({
      query: (projectId) => `project/${projectId}/projectmember`,
      transformResponse: (response: any) => {
        if (response?.isSuccess && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ['ProjectMember'],
    }),
    getProjectMembersWithPositions: builder.query<GetProjectMembersWithPositionsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/projectmember/with-positions`,
        method: 'GET',
      }),
      providesTags: ['ProjectMember'],
    }),
    getProjectMemberByAccount: builder.query<
      ApiResponse<ProjectMemberResponse>,
      { projectId: number; accountId: number }
    >({
      query: ({ projectId, accountId }) => `project/${projectId}/projectmember/by-account/${accountId}`,
      providesTags: ['ProjectMember'],
    }),
    updateProjectMemberStatus: builder.mutation<
      ApiResponse<ProjectMemberResponse>,
      { projectId: number; memberId: number; status: string }
    >({
      query: ({ projectId, memberId, status }) => ({
        url: `project/${projectId}/projectmember/${memberId}/status/${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ProjectMember', 'Projects'],
    }),
  }),
});

export const {
  useCreateProjectMemberMutation,
  useDeleteProjectMemberMutation,
  useCreateBulkProjectMembersWithPositionsMutation,
  useGetProjectMembersQuery,
  useGetProjectMembersNoStatusQuery,
  useGetProjectMembersWithPositionsQuery,
  useGetProjectMemberByAccountQuery,
  useUpdateProjectMemberStatusMutation,
} = projectMemberApi;
