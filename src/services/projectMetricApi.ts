import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface ProjectMetric {
  projectId: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  budgetAtCompletion: number;
  durationAtCompletion: number;
  costVariance: number;
  scheduleVariance: number;
  costPerformanceIndex: number;
  schedulePerformanceIndex: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  estimateDurationAtCompletion: number;
  calculatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectMetricResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    projectId: number;
    plannedValue: number;
    earnedValue: number;
    actualCost: number;
    budgetAtCompletion: number;
    durationAtCompletion: number;
    costVariance: number;
    scheduleVariance: number;
    costPerformanceIndex: number;
    schedulePerformanceIndex: number;
    estimateAtCompletion: number;
    estimateToComplete: number;
    varianceAtCompletion: number;
    estimateDurationAtCompletion: number;
    calculatedBy: string;
    createdAt: string;
    updatedAt: string;
  };
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

interface TaskStatusItem {
  key: number;
  name: string;
  count: number;
}

interface TaskStatusDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    statusCounts: TaskStatusItem[];
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

interface WorkloadMember {
  memberName: string;
  completed: number;
  remaining: number;
  overdue: number;
}

interface WorkloadDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: WorkloadMember[];
}

interface CostDashboardResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: {
    actualCost: number;
    actualTaskCost: number;
    actualResourceCost: number;
    plannedCost: number;
    plannedTaskCost: number;
    plannedResourceCost: number;
    budget: number;
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
    calculateProjectMetrics: builder.mutation({
      query: ({ projectKey }) => ({
        url: `projectmetric/calculate-metrics-by-ai?projectKey=${projectKey}`,
        method: 'POST',
      }),
    }),

    getHealthDashboard: builder.query<HealthDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/health-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getTaskStatusDashboard: builder.query<TaskStatusDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/tasks-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getProgressDashboard: builder.query<ProgressDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/progress-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getTimeDashboard: builder.query<TimeDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/time-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getCostDashboard: builder.query<CostDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/cost-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getWorkloadDashboard: builder.query<WorkloadDashboardResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/workload-dashboard?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getProjectMetricByProjectKey: builder.query<ProjectMetricResponse, string>({
      query: (projectKey) => ({
        url: `projectmetric/by-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    calculateMetricsBySystem: builder.mutation<ProjectMetricResponse, { projectKey: string }>({
      query: ({ projectKey }) => ({
        url: `projectmetric/calculate-by-system?projectKey=${projectKey}`,
        method: 'POST',
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
  useGetCostDashboardQuery,
  useGetWorkloadDashboardQuery,
  useGetProjectMetricByProjectKeyQuery,
  useCalculateMetricsBySystemMutation,
} = projectMetricApi;
