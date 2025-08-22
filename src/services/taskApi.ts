
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskResponseDTO {
  assigneeId: number;
  key: string;
  id: string;
  reporterId?: number | null;
  reporterName?: string | null;
  reporterPicture: string | null;
  projectId: number;
  projectName: string;
  epicId: string | null;
  epicName: string | null;
  sprintName: string | null;
  sprintId: number | null;
  milestoneId: number | null;
  type: string;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  duration: string;
  actualStartDate: string;
  actualEndDate: string | null;
  percentComplete: number;
  plannedHours: number;
  actualHours: number;
  plannedCost: number;
  plannedResourceCost: number;
  actualCost: number;
  actualResourceCost: number;
  remainingHours: number;
  createdAt: string;
  updatedAt: string;
  priority: string;
  evaluate: string | null;
  status: string;
  createdBy: number;
  dependencies: TaskDependency[];
  warnings?: string[];
}

interface TaskDependency {
  id: number;
  FromType: string;
  linkedFrom: string;
  ToType: string;
  linkedTo: string;
  type: string;
}

interface TaskListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: TaskResponseDTO[];
}

interface TaskDetailResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: TaskResponseDTO;
}

interface TaskBackLogResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: TaskBacklogResponseDTO[];
}

export interface UpdateTaskRequestDTO {
  reporterId: number | null;
  projectId: number;
  epicId: string | null;
  sprintId: number | null;
  type: string;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  status: string;
  createdBy: number | null;
}

export interface SubtaskViewDTO {
  id: string;
  taskId: string;
  assignedBy: number;
  plannedHours: number | null;
  actualHours: number | null;
}

export interface AccountDTO {
  id: number;
  username: string;
  fullName: string;
}

export interface TaskWithSubtasksDTO {
  id: string;
  plannedHours: number;
  actualHours: number;
  remainingHours: number;
  accounts: AccountDTO[];
  subtasks: SubtaskViewDTO[];
}

export interface TaskWithSubtasksResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: TaskWithSubtasksDTO;
}

export interface TaskBacklogResponseDTO {
  id: string;
  reporterId: number;
  reporterName?: string | null;
  reporterPicture?: string | null;
  projectId: number;
  projectName?: string | null;
  epicId?: string | null;
  epicName?: string | null;
  sprintId?: number | null;
  sprintName?: string | null;
  type?: string | null;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description?: string | null;
  plannedStartDate?: Date | string | null;
  plannedEndDate?: Date | string | null;
  actualStartDate?: Date | string | null;
  actualEndDate?: Date | string | null;
  duration?: string | null;
  priority?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  taskAssignments: TaskAssignmentResponseDTO[];
}

export interface TaskAssignmentResponseDTO {
  id: number;
  taskId: string;
  accountId: number;
  status?: string | null;
  assignedAt?: string | null;
  completedAt?: string | null;
  hourlyRate?: number | null;
  accountFullname?: string | null;
  accountPicture?: string | null;
}

export interface CreateTaskRequest {
  reporterId: number | null;
  projectId: number;
  epicId: string | null;
  sprintId: number | null;
  type: string;
  title: string;
  description: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  status: string;
  createdBy: number;
  dependencies: TaskDependency[];
  priority?: string;
  plannedHours?: number;
  manualInput: boolean;
  generationAiInput: boolean;
}

export interface CreateTasksRequest {
  tasks: CreateTaskRequest[];
}

// Interface for AI-generated task response
export interface AITaskResponseDTO {
  id: string | null;
  reporterId: number;
  reporterName: string | null;
  reporterPicture: string | null;
  projectId: number;
  projectName: string | null;
  epicId: string | null;
  epicName: string | null;
  sprintId: number | null;
  sprintName: string | null;
  type: string;
  manualInput: boolean;
  generationAiInput: boolean;
  title: string;
  description: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  duration: number | null;
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
  dependencies: string | null;
  warnings: string | null;
}

export interface AITaskListResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AITaskResponseDTO[];
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
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
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasksByProjectId: builder.query<TaskResponseDTO[], number>({
      query: (projectId) => ({
        url: 'task/by-project-id',
        params: { projectId },
      }),
      transformResponse: (response: TaskListResponse) => response.data,
      providesTags: ['Task'],
    }),

    updateTaskStatus: builder.mutation<void, { id: string; status: string; createdBy: number }>({
      query: ({ id, status, createdBy }) => ({
        url: `task/${id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    getTaskById: builder.query<TaskResponseDTO, string>({
      query: (id) => `task/${id}`,
      transformResponse: (response: { isSuccess: boolean; data: TaskResponseDTO }) => response.data,
      providesTags: ['Task'],
    }),

    updateTaskType: builder.mutation<void, { id: string; type: string; createdBy: number }>({
      query: ({ id, type, createdBy }) => ({
        url: `task/${id}/type`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    updateTaskReporter: builder.mutation<
      void,
      { id: string; reporterId: number; createdBy: number }
    >({
      query: ({ id, reporterId, createdBy }) => ({
        url: `task/${id}/reporter`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reporterId, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    getTasksByEpicId: builder.query<TaskResponseDTO[], string>({
      query: (epicId) => ({
        url: 'task/by-epic-id',
        params: { epicId },
      }),
      transformResponse: (response: TaskListResponse) => response.data,
      providesTags: ['Task'],
    }),

    updateTasks: builder.mutation<void, { id: string; body: Partial<TaskResponseDTO> }>({
      query: ({ id, body }) => ({
        url: `task/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    updateTaskTitle: builder.mutation<void, { id: string; title: string; createdBy: number }>({
      query: ({ id, title, createdBy }) => ({
        url: `task/${id}/title`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    updateTaskDescription: builder.mutation<
      void,
      { id: string; description: string; createdBy: number }
    >({
      query: ({ id, description, createdBy }) => ({
        url: `task/${id}/description`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    updateTaskPriority: builder.mutation<void, { id: string; priority: string; createdBy: number }>(
      {
        query: ({ id, priority, createdBy }) => ({
          url: `task/${id}/priority`,
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priority, createdBy }),
        }),
        invalidatesTags: ['Task'],
      }
    ),

    updatePlannedStartDate: builder.mutation<
      void,
      { id: string; plannedStartDate: string; createdBy: number }
    >({
      query: ({ id, plannedStartDate, createdBy }) => ({
        url: `task/${id}/planned-start-date`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plannedStartDate, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    updatePlannedEndDate: builder.mutation<
      void,
      { id: string; plannedEndDate: string; createdBy: number }
    >({
      query: ({ id, plannedEndDate, createdBy }) => ({
        url: `task/${id}/planned-end-date`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plannedEndDate, createdBy }),
      }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation<
      TaskResponseDTO,
      { id: string; body: Partial<Omit<TaskResponseDTO, 'id'>> }
    >({
      query: ({ id, body }) => ({
        url: `task/${id}`,
        method: 'PUT',
        body,
      }),
    }),

    updateTaskDat: builder.mutation<TaskResponseDTO, { id: string; body: UpdateTaskRequestDTO }>({
      query: ({ id, body }) => ({
        url: `task/${id}/dat`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
      transformResponse: (response: TaskDetailResponse) => response.data,
      invalidatesTags: ['Task'],
    }),

    createTask: builder.mutation<TaskResponseDTO, Partial<TaskResponseDTO>>({
      query: (newTask) => ({
        url: 'task',
        method: 'POST',
        body: newTask,
      }),
    }),

    getTaskWithSubtasks: builder.query<TaskWithSubtasksDTO, string>({
      query: (taskId) => ({
        url: `task/with-subtasks`,
        params: { id: taskId },
      }),
      transformResponse: (response: TaskWithSubtasksResponse) => response.data,
      providesTags: ['Task'],
    }),

    getTasksFromBacklog: builder.query<TaskBacklogResponseDTO[], string>({
      query: (projectKey) => ({
        url: 'task/backlog',
        params: { projectKey },
      }),
      transformResponse: (response: TaskBackLogResponse) =>
        response.data as TaskBacklogResponseDTO[],
      providesTags: ['Task'],
    }),

    updateTaskSprint: builder.mutation<TaskResponseDTO, { id: string; sprintId: number | null; createdBy: number }>({
      query: ({ id, sprintId, createdBy }) => ({
        url: `task/${id}/sprint`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sprintId, createdBy }),
      }),
      transformResponse: (response: TaskDetailResponse) => response.data,
      invalidatesTags: ['Task'],
    }),

    getTasksBySprintId: builder.query<TaskBacklogResponseDTO[], number>({
      query: (sprintId) => ({
        url: `task/by-sprint-id/${sprintId}`,
        headers: {
          accept: '*/*',
        },
      }),
      transformResponse: (response: TaskBackLogResponse) => response.data,
      providesTags: ['Task'],
    }),

    getTasksBySprintIdAndStatus: builder.query<
      TaskBacklogResponseDTO[],
      { sprintId: number; taskStatus: string }
    >({
      query: ({ sprintId, taskStatus }) => ({
        url: `task/by-sprint-id/${sprintId}/task-status`,
        params: { taskStatus },
        headers: {
          accept: '*/*',
        },
      }),
      transformResponse: (response: TaskBackLogResponse) => response.data,
      providesTags: ['Task'],
    }),

    updatePlannedHours: builder.mutation<
      void,
      { id: string; plannedHours: number; createdBy: number }
    >({
      query: ({ id, plannedHours, createdBy }) => ({
        url: `task/${id}/planned-hours?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plannedHours),
      }),
      invalidatesTags: ['Task'],
    }),

    createTasks: builder.mutation<TaskListResponse, CreateTasksRequest>({
      query: ({ tasks }) => ({
        url: 'task/bulk',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: tasks,
      }),
      transformResponse: (response: TaskListResponse) => response,
      invalidatesTags: ['Task'],
    }),

    updateTaskEpic: builder.mutation<TaskResponseDTO, { id: string; epicId: string | null; createdBy: number }>({
      query: ({ id, epicId, createdBy }) => ({
        url: `task/${id}/epic`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({ epicId, createdBy }),
      }),
      transformResponse: (response: TaskDetailResponse) => response.data,
      invalidatesTags: ['Task'],
    }),

    generateAITasks: builder.mutation<AITaskListResponse, number>({
      query: (projectId) => ({
        url: `ai/${projectId}/generate-task`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: {},
      }),
      transformResponse: (response: AITaskListResponse) => response,
      invalidatesTags: ['Task'],
    }),

    updatePercentComplete: builder.mutation<
      void,
      { id: string; percentComplete: number; createdBy: number }
    >({
      query: ({ id, percentComplete, createdBy }) => ({
        url: `task/${id}/percent-complete?createdBy=${createdBy}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(percentComplete),
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksByProjectIdQuery,
  useUpdateTaskStatusMutation,
  useGetTaskByIdQuery,
  useUpdateTaskTypeMutation,
  useGetTasksByEpicIdQuery,
  useUpdateTasksMutation,
  useUpdateTaskTitleMutation,
  useUpdateTaskDescriptionMutation,
  useUpdatePlannedStartDateMutation,
  useUpdatePlannedEndDateMutation,
  useUpdateTaskMutation,
  useUpdateTaskDatMutation,
  useCreateTaskMutation,
  useGetTaskWithSubtasksQuery,
  useGetTasksFromBacklogQuery,
  useUpdateTaskSprintMutation,
  useUpdateTaskPriorityMutation,
  useUpdateTaskReporterMutation,
  useGetTasksBySprintIdQuery,
  useGetTasksBySprintIdAndStatusQuery,
  useUpdatePlannedHoursMutation,
  useCreateTasksMutation,
  useUpdateTaskEpicMutation,
  useGenerateAITasksMutation,
  useUpdatePercentCompleteMutation,
} = taskApi;
