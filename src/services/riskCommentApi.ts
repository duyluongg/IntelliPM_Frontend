import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RiskComment {
  id: number;
  riskId: string;
  accountId: number;
  accountUsername: string;
  accountFullname: string;
  accountPicture: string;
  comment: string;
  createdAt: string;
}

export const riskCommentApi = createApi({
  reducerPath: 'riskCommentApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getCommentsByRiskId: builder.query<RiskComment[], number>({
      query: (riskId) => `riskcomment/by-risk/${riskId}`,
      transformResponse: (response: { isSuccess: boolean; data: RiskComment[] }) => response.data,
    }),

    createRiskComment: builder.mutation<
      RiskComment,
      { riskId: number; accountId: number; comment: string }
    >({
      query: (commentData) => ({
        url: 'riskcomment',
        method: 'POST',
        body: commentData,
      }),
      transformResponse: (response: { isSuccess: boolean; data: RiskComment }) => response.data,
    }),

    updateRiskComment: builder.mutation<
      RiskComment,
      { id: number; riskId: number; accountId: number; comment: string }
    >({
      query: ({ id, ...body }) => ({
        url: `riskcomment/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: { isSuccess: boolean; data: RiskComment }) => response.data,
    }),

    deleteRiskComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `riskcomment/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCommentsByRiskIdQuery,
  useCreateRiskCommentMutation,
  useUpdateRiskCommentMutation,
  useDeleteRiskCommentMutation,
} = riskCommentApi;
