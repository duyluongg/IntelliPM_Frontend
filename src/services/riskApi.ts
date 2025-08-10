import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RiskItem {
  id: number;
  riskKey: string;
  createdBy: number;
  creatorFullName: string | null;
  creatorUserName: string | null;
  creatorPicture: string | null;
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
  createdBy: number;
  taskId?: string | null;
  riskScope: string;
  title: string;
  description?: string;
  status?: string;
  type?: string;
  generatedBy?: string;
  probability?: string;
  impactLevel?: string;
  isApproved?: boolean;
  dueDate?: string;
}

export interface CreateRiskResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskItem;
}

export interface UpdateRiskStatusRequest {
  id: number;
  status: string;
  createdBy: number;
}

export interface UpdateRiskTypeRequest {
  id: number;
  type: string;
  createdBy: number;
}

export interface UpdateRiskResponsibleRequest {
  id: number;
  responsibleId: number | null;
  createdBy: number;
}

export interface UpdateRiskDueDateRequest {
  id: number;
  dueDate: string;
  createdBy: number;
}

export interface UpdateRiskTitleRequest {
  id: number;
  title: string;
  createdBy: number;
}

export interface UpdateRiskDescriptionRequest {
  id: number;
  description: string;
  createdBy: number;
}

export interface UpdateRiskImpactLevelRequest {
  id: number;
  impactLevel: string;
  createdBy: number;
}

export interface UpdateRiskProbabilityRequest {
  id: number;
  probability: string;
  createdBy: number;
}

export interface UpdateRiskResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: RiskItem;
}

export interface AiSuggestedRisk {
  projectId: number;
  taskId: string | null;
  riskScope: string;
  title: string;
  description: string;
  type: string;
  probability: string;
  impactLevel: string;
  mitigationPlan: string;
  contingencyPlan: string;
}

export interface GetAiSuggestedRisksResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: AiSuggestedRisk[];
}

export const riskApi = createApi({
  reducerPath: 'riskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json');
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

    updateRiskStatus: builder.mutation<UpdateRiskResponse, UpdateRiskStatusRequest>({
      query: ({ id, status, createdBy }) => ({
        url: `risk/${id}/status?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(status),
      }),
    }),

    updateRiskType: builder.mutation<UpdateRiskResponse, UpdateRiskTypeRequest>({
      query: ({ id, type, createdBy }) => ({
        url: `risk/${id}/type?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(type),
      }),
    }),

    updateRiskResponsible: builder.mutation<UpdateRiskResponse, UpdateRiskResponsibleRequest>({
      query: ({ id, responsibleId, createdBy }) => ({
        url: `risk/${id}/responsible-id?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(responsibleId),
      }),
    }),

    updateRiskDueDate: builder.mutation<UpdateRiskResponse, UpdateRiskDueDateRequest>({
      query: ({ id, dueDate, createdBy }) => ({
        url: `risk/${id}/duedate?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(dueDate),
      }),
    }),

    updateRiskTitle: builder.mutation<UpdateRiskResponse, UpdateRiskTitleRequest>({
      query: ({ id, title, createdBy }) => ({
        url: `risk/${id}/title?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(title),
      }),
    }),

    updateRiskDescription: builder.mutation<UpdateRiskResponse, UpdateRiskDescriptionRequest>({
      query: ({ id, description, createdBy }) => ({
        url: `risk/${id}/description?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(description),
      }),
    }),

    updateRiskImpactLevel: builder.mutation<UpdateRiskResponse, UpdateRiskImpactLevelRequest>({
      query: ({ id, impactLevel, createdBy }) => ({
        url: `risk/${id}/impact-level?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(impactLevel),
      }),
    }),

    updateRiskProbability: builder.mutation<UpdateRiskResponse, UpdateRiskProbabilityRequest>({
      query: ({ id, probability, createdBy }) => ({
        url: `risk/${id}/probability?createdBy=${createdBy}`,
        method: 'PATCH',
        body: JSON.stringify(probability),
      }),
    }),

    getAiSuggestedRisks: builder.query<GetAiSuggestedRisksResponse, string>({
      query: (projectKey) => ({
        url: `risk/ai-suggestion?projectKey=${projectKey}`,
        method: 'GET',
      }),
    }),

    getRiskByKey: builder.query<CreateRiskResponse, string>({
      query: (riskKey) => `/risk/by-risk-key?key=${riskKey}`,
    }),
  }),
});

export const {
  useGetRisksByProjectKeyQuery,
  useCreateRiskMutation,
  useUpdateRiskStatusMutation,
  useUpdateRiskTypeMutation,
  useUpdateRiskResponsibleMutation,
  useUpdateRiskDueDateMutation,
  useUpdateRiskTitleMutation,
  useUpdateRiskDescriptionMutation,
  useUpdateRiskImpactLevelMutation,
  useUpdateRiskProbabilityMutation,
  useGetAiSuggestedRisksQuery,
  useLazyGetAiSuggestedRisksQuery,
  useGetRiskByKeyQuery,
} = riskApi;
