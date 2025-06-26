import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface ProjectMetric {
  id: number;
  projectId: number;
  calculatedBy: string;
  isApproved: boolean;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  spi: number;
  cpi: number;
  delayDays: number;
  budgetOverrun: number;
  projectedFinishDate: string;
  projectTotalCost: number | null;
  createdAt: string;
  updatedAt: string;
}

interface HealthDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    timeStatus: string;
    tasksToBeCompleted: number;
    overdueTasks: number;
    progressPercent: number;
    costStatus: number;
    cost: ProjectMetric;
  };
}

interface TaskStatusDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
}

interface ProgressItem {
  sprintId: number;
  sprintName: string;
  percentComplete: number;
}

interface ProgressDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: ProgressItem[];
}

interface TimeDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    plannedCompletion: number;
    actualCompletion: number;
    status: string;
  };
}

export const projectMetricApi = createApi({
  reducerPath: 'projectMetricApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userJson = localStorage.getItem('user');
      const token = userJson ? JSON.parse(userJson).accessToken : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    calculateProjectMetrics: builder.mutation<any, { projectId: number; calculatedBy: string }>({
      query: ({ projectId, calculatedBy }) => ({
        url: `projectmetric/calculate?projectId=${projectId}&calculatedBy=${calculatedBy}`,
        method: 'POST',
      }),
    }),

    getHealthDashboard: builder.query<HealthDashboardResponse, number>({
      query: (projectId) => ({
        url: `projectmetric/health-dashboard?projectId=${projectId}`,
        method: 'GET',
      }),
    }),

    getTaskStatusDashboard: builder.query<TaskStatusDashboardResponse, number>({
      query: (projectId) => ({
        url: `projectmetric/tasks-dashboard?projectId=${projectId}`,
        method: 'GET',
      }),
    }),

    getProgressDashboard: builder.query<ProgressDashboardResponse, number>({
      query: (projectId) => ({
        url: `projectmetric/progress-dashboard?projectId=${projectId}`,
        method: 'GET',
      }),
    }),

    getTimeDashboard: builder.query<TimeDashboardResponse, number>({
      query: (projectId) => ({
        url: `projectmetric/time-dashboard?projectId=${projectId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useCalculateProjectMetricsMutation,
  useGetHealthDashboardQuery,
  useGetTaskStatusDashboardQuery,
  useGetProgressDashboardQuery,
  useGetTimeDashboardQuery,
} = projectMetricApi;
