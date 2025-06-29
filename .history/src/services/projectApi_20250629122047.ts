import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Interface cho Assignee dựa trên response mới
interface Assignee {
  fullname: string;
  picture: string | null;
}

// Interface cho WorkItem dựa trên response từ /api/project/{id}/workitems
interface WorkItem {
  type: string;
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  commentCount: number;
  sprintId: number | null;
  assignees: Assignee[];
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  reporterFullname: string;
  reporterPicture: string | null;
}

interface GetWorkItemsResponse {
  isSuccess: boolean;
  code: number;
  data: WorkItem[];
  message: string;
}

// Interface cho ProjectDetails dựa trên response từ /api/project/view-by-key
interface ProjectDetails {
  id: number;
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  createdBy: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface GetProjectDetailsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails;
  message: string;
}

// Interface cho CheckProjectKeyResponse dựa trên response từ /api/project/check-project-key
interface CheckProjectKeyResponse {
  isSuccess: boolean;
  code: number;
  data: {
    exists: boolean;
  };
  message: string;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWorkItemsByProjectId: builder.query<GetWorkItemsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/workitems`,
        method: 'GET',
      }),
    }),
    getProjectDetailsByKey: builder.query<GetProjectDetailsResponse, string>({
      query: (projectKey) => ({
        url: `project/view-by-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),
    checkProjectKey: builder.query<CheckProjectKeyResponse, string>({
      query: (projectKey) => ({
        url: `project/check-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetWorkItemsByProjectIdQuery,
  useGetProjectDetailsByKeyQuery,
  useCheckProjectKeyQuery 
} = projectApi;