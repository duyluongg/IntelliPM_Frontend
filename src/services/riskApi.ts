import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RiskItem {
  id: number;
  responsibleId: number;
  responsibleFullName: string | null;
  responsibleUserName: string | null;
  responsiblePicture: string | null;
  projectId: number;
  taskId: string | null;
  taskTitle: string | null;
  riskScope: string;
  title: string;
  description: string;
  status: string;
  type: string;
  generatedBy: string;
  probability: string;
  impactLevel: string;
  severityLevel: string;
  isApproved: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRisksByProjectKeyResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskItem[];
}

export interface CreateRiskRequest {
  projectKey: string;
  responsibleId: number | null;
  taskId?: string | null;
  riskScope: string;
  title: string;
  description?: string;
  status?: string;
  type?: string;
  generatedBy?: string;
  probability?: string;
  impactLevel?: string;
  severityLevel?: string;
  isApproved?: boolean;
  dueDate?: string;
}

export interface CreateRiskResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskItem;
}

export const riskApi = createApi({
  reducerPath: 'riskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRisksByProjectKey: builder.query<GetRisksByProjectKeyResponse, string>({
      query: (projectKey) => ({
        url: `risk/by-project-key?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    createRisk: builder.mutation<CreateRiskResponse, CreateRiskRequest>({
      query: (newRisk) => ({
        url: 'risk',
        method: 'POST',
        body: newRisk,
      }),
    }),
  }),
});

export const { useGetRisksByProjectKeyQuery, useCreateRiskMutation } = riskApi;
