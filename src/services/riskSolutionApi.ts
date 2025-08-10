import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RiskSolutionItem {
  id: number;
  riskId: number;
  mitigationPlan: string | null;
  contingencyPlan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetRiskSolutionByRiskIdResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskSolutionItem[];
}

export interface RiskSolutionResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskSolutionItem;
}

export interface CreateRiskSolutionRequest {
  riskId: number;
  mitigationPlan: string | null;
  contingencyPlan: string | null;
  createdBy: number;
}

export interface UpdateMitigationPlanRequest {
  id: number;
  mitigationPlan: string | null;
  createdBy : number;
}

export interface UpdateContigencyPlanRequest {
  id: number;
  contigencyPlan: string | null;
  createdBy: number;
}

export const riskSolutionApi = createApi({
  reducerPath: 'riskSolutionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRiskSolutionByRiskId: builder.query<GetRiskSolutionByRiskIdResponse, number>({
      query: (riskId) => ({
        url: `risksolution/by-risk/${riskId}`,
        method: 'GET',
      }),
    }),

    createRiskSolution: builder.mutation<RiskSolutionResponse, CreateRiskSolutionRequest>({
      query: (newRiskSolution) => ({
        url: 'risksolution',
        method: 'POST',
        body: newRiskSolution,
      }),
    }),

    updateRiskMitigationPlan: builder.mutation<RiskSolutionResponse, UpdateMitigationPlanRequest>({
      query: ({ id, mitigationPlan, createdBy }) => ({
        url: `risksolution/${id}/mitigation-plan?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(mitigationPlan),
      }),
    }),

    updateRiskContigencyPlan: builder.mutation<RiskSolutionResponse, UpdateContigencyPlanRequest>({
      query: ({ id, contigencyPlan, createdBy }) => ({
        url: `risksolution/${id}/contigency-plan?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(contigencyPlan),
      }),
    }),

    deleteRiskSolution: builder.mutation<void, number>({
      query: (id) => ({
        url: `risksolution/${id}`,
        method: 'DELETE',
      }),
    }),

    deleteRiskMitigationPlan: builder.mutation<void, { id: number; createdBy: number }>({
      query: ({id, createdBy}) => ({
        url: `risksolution/${id}/mitigation-plan?createdBy=${createdBy}`,
        method: 'DELETE',
      }),
    }),

    deleteRiskContingencyPlan: builder.mutation<void, { id: number; createdBy: number }>({
      query: ({id, createdBy}) => ({
        url: `risksolution/${id}/contingency-plan?createdBy=${createdBy}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetRiskSolutionByRiskIdQuery,
  useCreateRiskSolutionMutation,
  useUpdateRiskMitigationPlanMutation,
  useUpdateRiskContigencyPlanMutation,
  useDeleteRiskSolutionMutation,
  useDeleteRiskContingencyPlanMutation,
  useDeleteRiskMitigationPlanMutation
} = riskSolutionApi;
