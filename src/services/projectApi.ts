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

export interface CreateProjectResponse {
  isSuccess: boolean;
  code: number;
  data: {
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
    iconUrl: string;
    status: string;
  };
  message: string;
}

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

export interface GetWorkItemsResponse {
  isSuccess: boolean;
  code: number;
  data: WorkItem[];
  message: string;
}

interface ProjectDetails {
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

interface GetProjectDetailsResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetails;
  message: string;
}

interface CheckProjectKeyResponse {
  isSuccess: boolean;
  code: number;
  data: {
    exists: boolean;
  };
  message: string;
}

interface CheckProjectNameResponse {
  isSuccess: boolean;
  code: number;
  data: {
    exists: boolean;
  };
  message: string;
}

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

interface GetProjectDetailsFullResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetailsFull;
  message: string;
}

interface ProjectRequirement {
  id: number;
  projectId: number;
  title: string;
  type: string;
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectPosition {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

interface ProjectMember {
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

interface ProjectDetailsById {
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

interface GetProjectDetailsByIdResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectDetailsById;
  message: string;
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
    checkProjectName: builder.query<CheckProjectNameResponse, string>({
      query: (projectName) => ({
        url: `project/check-project-name?projectName=${encodeURIComponent(projectName)}`,
        method: 'GET',
      }),
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => {
        const token = localStorage.getItem('accessToken');
        return {
          url: 'project',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body,
        };
      },
    }),
    updateProject: builder.mutation<CreateProjectResponse, { id: number; body: CreateProjectRequest }>({
      query: ({ id, body }) => ({
        url: `project/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
    getFullProjectDetailsByKey: builder.query<GetProjectDetailsFullResponse, string>({
      query: (projectKey) => ({
        url: `project/by-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),
    getProjectDetailsById: builder.query<GetProjectDetailsByIdResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/details`,
        method: 'GET',
      }),
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
} = projectApi;