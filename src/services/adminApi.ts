import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface Account {
  id: number;
  username: string;
  fullName: string;
  email: string;
  gender: string;
  position: string;
  dateOfBirth: string | null;
  status: string;
  role: string;
  picture: string;
}

export interface GetAccountsResponse {
  isSuccess: boolean;
  code: number;
  data: Account[];
  message: string;
}

export interface Milestone {
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface ProjectStatus {
  projectId: number;
  projectName: string;
  projectKey: string;
  projectManager: string;
  spi: number;
  cpi: number;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  actualCost: number;
  budget: number;
  remainingBudget: number;
  overdueTasks: number;
  milestones: Milestone[];
}

export interface GetProjectStatusResponse {
  isSuccess: boolean;
  code: number;
  data: ProjectStatus[];
  message: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAccounts: builder.query<GetAccountsResponse, void>({
      query: () => ({
        url: 'admin/account',
        method: 'GET',
      }),
    }),

    getProjectStatus: builder.query<GetProjectStatusResponse, void>({
      query: () => ({
        url: 'admin/project-status',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetAccountsQuery, useGetProjectStatusQuery } = adminApi;
