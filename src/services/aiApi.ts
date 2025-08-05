import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

// Định nghĩa kiểu dữ liệu cho thành viên (member)
export interface Member {
  accountId: number;
  fullName: string;
  picture: string;
}

// Định nghĩa kiểu dữ liệu cho task
export interface Task {
  taskId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  suggestedRole: string;
  assignedMembers: Member[];
}

// Định nghĩa kiểu dữ liệu cho task trong state (dùng trong TaskSetup)
export interface TaskState {
  id: string; // UUID cho frontend
  taskId: string; // taskId từ backend
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  suggestedRole: string;
  assignedMembers: Member[];
}

// Định nghĩa kiểu dữ liệu cho requirement
export interface Requirement {
  id: number;
  projectId: number;
  title: string;
  type: 'FUNCTIONAL' | 'NON_FUNCTIONAL';
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho project member
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
  picture: string;
  projectPositions: { id: number; position: string; assignedAt: string }[];
}

export interface ProjectData {
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
  requirements: Requirement[];
  projectMembers: ProjectMember[];
}

export interface EpicResponse {
  type: 'Epic';
  aiGenerated: boolean;
  data: {
    epicId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    tasks: Task[];
  };
}
export interface SprintWithTasksDTO {
  sprintId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  aiGenerated: boolean;
  tasks: SprintTaskDTO[];
}

export interface SprintTaskDTO {
  taskId: string;
  title: string;
  priority: string;
  plannedHours: number;
}

export interface SprintPlanningRequestDTO {
  numberOfSprints: number;
  weeksPerSprint: number;
}

export interface SprintPlanningResponseDTO {
  isSuccess: boolean;
  code: number;
  data: SprintWithTasksDTO[];
  message: string;
}
export interface AiResponse {
  isSuccess: boolean;
  code: number;
  data: EpicResponse[];
  message: string;
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getTaskPlanning: builder.mutation<AiResponse, { projectId: number }>({
      query: ({ projectId }) => ({
        url: `ai/project/${projectId}/task-planning`,
        method: 'POST',
        body: {},
      }),
    }),

     sprintPlanning: builder.mutation<SprintPlanningResponseDTO, { projectId: number; body: SprintPlanningRequestDTO }>({
      query: ({ projectId, body }) => ({
        url: `ai/project/${projectId}/sprint-planning`,
        method: 'POST',
        body,
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: SprintPlanningResponseDTO) => response,
    }),

  }),
});

export const { useGetTaskPlanningMutation, useSprintPlanningMutation } = aiApi;