import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Project-related interfaces
export interface CreateProjectRequest {
  name: string;
  projectKey: string;
  description: string;
  budget: number;
  projectType: string;
  startDate: string;
  endDate: string;
}

export interface ProjectDetails {
  id: number;
  name: string;
  projectKey: string;
  iconUrl: string | null;
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

export interface ProjectRequirement {
  id: number;
  projectId: number;
  title: string;
  type: string;
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPosition {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

export interface ProjectMember {
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
  projectPositions: ProjectPosition[];
}

export interface ProjectDetailsById {
  id: number;
  projectKey: string;
  name: string;
  description: string;
  budget: number;
  projectType: string;
  createdBy: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  requirements: ProjectRequirement[];
  projectMembers: ProjectMember[];
}

// Work Item-related interfaces
interface Assignee {
  fullname: string;
  picture: string | null;
}

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

// Task, Sprint, and Milestone interfaces
interface TaskItem {
  id: string | null;
  reporterId: number;
  projectId: number;
  epicId: string;
  sprintId: number;
  type: string | null;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  duration: string | null;
  percentComplete: number | null;
  plannedHours: number | null;
  actualHours: number | null;
  remainingHours: number | null;
  plannedCost: number | null;
  plannedResourceCost: number | null;
  actualCost: number | null;
  actualResourceCost: number | null;
  priority: string;
  status: string;
  evaluate: string | null;
  createdAt: string;
  updatedAt: string;
  dependencies: TaskDependency[];
}

interface TaskDependency {
  id: number;
  taskId: string;
  linkedFrom: string;
  linkedTo: string;
  type: string; 
}

interface SprintItem {
  id: number;
  projectId: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface MilestoneItem {
  id: number;
  projectId: number;
  sprintId: number | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface ProjectDetailsFull {
  id: number;
  name: string;
  projectKey: string;
  iconUrl: string | null;
  description: string;
  budget: number;
  projectType: string;
  createdBy: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  sprints: SprintItem[];
  tasks: TaskItem[];
  milestones: MilestoneItem[];
}

// Response interfaces
export interface CreateProjectResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails;
  message: string;
  error?: string;
}

export interface GetWorkItemsResponse {
  isSuccess: boolean;
  code: number;
  data: WorkItem[];
  message: string;
  error?: string;
}

export interface GetProjectDetailsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails;
  message: string;
  error?: string;
}

export interface CheckProjectKeyResponse {
  isSuccess: boolean;
  code: number;
  data: {
    exists: boolean;
  };
  message: string;
  error?: string;
}

export interface CheckProjectNameResponse {
  isSuccess: boolean;
  code: number;
  data: {
    exists: boolean;
  };
  message: string;
  error?: string;
}

export interface GetProjectDetailsFullResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetailsFull;
  message: string;
  error?: string;
}

export interface GetProjectDetailsByIdResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetailsById;
  message: string;
  error?: string;
}

export interface SendEmailToPMResponse {
  isSuccess: boolean;
  code: number;
  data: null;
  message: string;
  error?: string;
}

export interface SendInvitationsResponse {
  isSuccess: boolean;
  code: number;
  data: null;
  message: string;
  error?: string;
}

export interface SendEmailRejectToLeaderResponse {
  isSuccess: boolean;
  code: number;
  data: null;
  message: string;
  error?: string;
}

export interface RejectProjectResponse {
  isSuccess: boolean;
  code: number;
  data: null;
  message: string;
  error?: string;
}

export interface SendEmailRejectToLeaderRequest {
  projectId: number;
  reason: string;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      headers.set('accept', '*/*');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Project', 'WorkItem', 'ProjectDetails'],
  endpoints: (builder) => ({
    getWorkItemsByProjectId: builder.query<GetWorkItemsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/workitems`,
        method: 'GET',
      }),
      providesTags: (result, error, projectId) => [{ type: 'WorkItem', id: projectId }],
    }),
    getProjectDetailsByKey: builder.query<GetProjectDetailsResponse, string>({
      query: (projectKey) => ({
        url: `project/view-by-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
      providesTags: (result, error, projectKey) => [{ type: 'Project', id: projectKey }],
    }),
    checkProjectKey: builder.query<CheckProjectKeyResponse, string>({
      query: (projectKey) => ({
        url: `project/check-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),
    checkProjectName: builder.query<CheckProjectNameResponse, string>({
      query: (projectName) => ({
        url: `project/check-project-name?projectName=${encodeURIComponent(projectName)}`,
        method: 'GET',
      }),
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: 'project',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project', 'ProjectDetails'],
    }),
    updateProject: builder.mutation<CreateProjectResponse, { id: number; body: CreateProjectRequest }>({
      query: ({ id, body }) => ({
        url: `project/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'ProjectDetails', id },
      ],
    }),
    getFullProjectDetailsByKey: builder.query<GetProjectDetailsFullResponse, string>({
      query: (projectKey) => ({
        url: `project/by-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
      providesTags: (result, error, projectKey) => [{ type: 'ProjectDetails', id: projectKey }],
    }),
    getProjectDetailsById: builder.query<GetProjectDetailsByIdResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/details`,
        method: 'GET',
      }),
      providesTags: (result, error, projectId) => [{ type: 'ProjectDetails', id: projectId }],
    }),
    sendEmailToPM: builder.mutation<SendEmailToPMResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/send-email-to-pm`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
    sendInvitations: builder.mutation<SendInvitationsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/send-invitations`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
    sendEmailRejectToLeader: builder.mutation<SendEmailRejectToLeaderResponse, SendEmailRejectToLeaderRequest>({
      query: ({ projectId, reason }) => ({
        url: `project/${projectId}/send-email-reject-to-leader`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    rejectProject: builder.mutation<RejectProjectResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useGetWorkItemsByProjectIdQuery,
  useGetProjectDetailsByKeyQuery,
  useCheckProjectKeyQuery,
  useCheckProjectNameQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetFullProjectDetailsByKeyQuery,
  useGetProjectDetailsByIdQuery,
  useSendEmailToPMMutation,
  useSendInvitationsMutation,
  useSendEmailRejectToLeaderMutation,
  useRejectProjectMutation,
} = projectApi;