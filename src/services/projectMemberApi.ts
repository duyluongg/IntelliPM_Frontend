import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Request DTO interface
interface ProjectMemberWithPositionRequest {
  accountId: number;
  positions: string[];
}

// Response DTO interface
interface ProjectPositionResponse {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

interface ProjectMemberWithPositionsResponse {
  id: number;
  accountId: number;
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

interface BulkCreateResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectMemberWithPositionsResponse[] | null;
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
    createBulkProjectMembersWithPositions: builder.mutation<BulkCreateResponse, { projectId: number; requests: ProjectMemberWithPositionRequest[] }>({
      query: ({ projectId, requests }) => ({
        url: `project/${projectId}/projectmember/bulk-with-positions`,
        method: 'POST',
        body: requests,
      }),
      transformResponse: (response: any, meta, arg) => {
        if (typeof response === 'string' || !response) {
          return { isSuccess: false, code: 500, data: null, message: 'Invalid server response' };
        }
        return response;
      },
    }),
    getProjectMembersWithPositions: builder.query<GetProjectMembersWithPositionsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/projectmember/with-positions`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useCreateBulkProjectMembersWithPositionsMutation,
  useGetProjectMembersWithPositionsQuery,
} = projectMemberApi;