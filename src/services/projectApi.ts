import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

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

export interface Assignee {
  accountId: number;
  fullname: string;
  picture: string | null;
}

export interface WorkItemList {
  projectId: number;
  type: string | 'epic' | 'task' | 'bug' | 'subtask' | 'story';
  key: string;
  taskId: string | null;
  summary: string;
  status: string;
  commentCount: number;
  sprintId: number | null;
  sprintName: string | null;
  priority: string | null;
  assignees: Assignee[];
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  reporterId: number | null;
  reporterFullname: string;
  reporterPicture: string | null;
}

export interface TaskItem {
  id: string;
  reporterId: number;
  reporterName: string | null;
  reporterPicture: string | null;
  projectId: number;
  projectName: string | null;
  epicId: string;
  epicName: string | null;
  sprintId: number;
  sprintName: string | null;
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
  priority: string | null;
  status: string;
  evaluate: string | null;
  createdAt: string;
  updatedAt: string;
  dependencies: TaskDependency[];
  subtasks: SubtaskItem[];
}

interface TaskDependency {
  id: number;
  FromType: string;
  linkedFrom: string;
  ToType: string;
  linkedTo: string;
  type: string;
}

export interface SubtaskItem {
  id: string;
  taskId: string;
  assignedBy: number;
  assignedFullName: string;
  assignedUsername: string;
  title: string;
  description: string;
  reporterId: number | null;
  status: string;
  priority: string | null;
  manualInput: boolean;
  generationAiInput: boolean;
  sprintId: number | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  duration: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  percentComplete: number | null;
  plannedHours: number | null;
  actualHours: number | null;
  remainingHours: number | null;
  plannedCost: number | null;
  plannedResourceCost: number | null;
  actualCost: number | null;
  actualResourceCost: number | null;
  evaluate: string | null;
  createdAt: string;
  updatedAt: string;
  startDate: string | null;
  endDate: string | null;
  dependencies: TaskDependency[];
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
  key: string;
  projectId: number;
  sprintId: number | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  dependencies: TaskDependency[];
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
  data: WorkItemList[];
  message: string;
  error?: string;
}

export interface GetAllProjectsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails[];
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

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
}

export interface GetProjectItemsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectItem[];
}

export interface GetWorkItemByKeyResponse {
  isSuccess: boolean;
  code: number;
  data: WorkItemList;
  message: string;
  error?: string;
}

export interface UploadIconData {
  fileUrl: string;
}

export interface UploadIconResponse {
  isSuccess: boolean;
  code: number;
  data: UploadIconData;
  message: string;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
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
  tagTypes: ['Project', 'WorkItem', 'ProjectDetails'],
  endpoints: (builder) => ({
    getAllProjects: builder.query<GetAllProjectsResponse, void>({
      query: () => ({
        url: 'project',
        method: 'GET',
      }),
      providesTags: ['Project'],
    }),
    getProjectById: builder.query<GetProjectDetailsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}`,
        method: 'GET',
      }),
      providesTags: (result, error, projectId) => [{ type: 'Project', id: projectId }],
    }),
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
    checkProjectKey: builder.query<
      CheckProjectKeyResponse,
      { projectKey: string; projectId?: number }
    >({
      query: ({ projectKey, projectId }) => ({
        url: `project/check-project-key?projectKey=${projectKey}${
          projectId ? `&projectId=${projectId}` : ''
        }`,
        method: 'GET',
      }),
    }),
    checkProjectName: builder.query<
      CheckProjectNameResponse,
      { projectName: string; projectId?: number }
    >({
      query: ({ projectName, projectId }) => ({
        url: `project/check-project-name?projectName=${encodeURIComponent(projectName)}${
          projectId ? `&projectId=${projectId}` : ''
        }`,
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
    updateProject: builder.mutation<
      CreateProjectResponse,
      { id: number; body: CreateProjectRequest }
    >({
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
    sendEmailRejectToLeader: builder.mutation<
      SendEmailRejectToLeaderResponse,
      SendEmailRejectToLeaderRequest
    >({
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
    getProjectItemsByKey: builder.query<GetProjectItemsResponse, string>({
      query: (projectKey) => ({
        url: `project/items?projectKey=${projectKey}`,
        method: 'GET',
      }),
      providesTags: (result, error, projectKey) => [{ type: 'Project', id: projectKey }],
    }),
    updateProjectStatus: builder.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `project/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }),
      invalidatesTags: ['Project'],
    }),
    getWorkItemByKey: builder.query<GetWorkItemByKeyResponse, string>({
      query: (projectKey) => ({
        url: `project/${projectKey}/allworkitems`,
        method: 'GET',
      }),
      providesTags: (result, error, projectKey) => [{ type: 'WorkItem', id: projectKey }],
    }),
    sendInvitationToTeamMember: builder.mutation<
      SendInvitationsResponse,
      { projectId: number; accountId: number }
    >({
      query: ({ projectId, accountId }) => ({
        url: `project/${projectId}/send-invitation/${accountId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
    // Sửa lại uploadIcon endpoint trong projectApi
    uploadIcon: builder.mutation<UploadIconResponse, { file: File; projectId: string }>({
      query: ({ file, projectId }) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return {
          url: `project/${projectId}/upload-icon`,
          method: 'POST',
          body: formData,
          // Không sử dụng prepareHeaders ở đây để tránh conflict
        };
      },
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
    }),
  }),
});

export const {
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
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
  useGetProjectItemsByKeyQuery,
  useLazyCheckProjectKeyQuery,
  useUpdateProjectStatusMutation,
  useLazyGetWorkItemByKeyQuery,
  useSendInvitationToTeamMemberMutation,
  useUploadIconMutation,
} = projectApi;
