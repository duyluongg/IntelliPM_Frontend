import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface MilestoneCommentResponseDTO {
  id: number;
  milestoneId: number;
  accountId: number;
  content: string;
  createdAt: string;
  accountName: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

interface CreateMilestoneComment {
  milestoneId: number;
  accountId: number;
  content: string;
}

interface UpdateMilestoneComment {
  milestoneId: number;
  accountId: number;
  content: string;
}

export const milestoneCommentApi = createApi({
  reducerPath: 'milestoneCommentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userJson = localStorage.getItem('user');
      const token = userJson ? JSON.parse(userJson).accessToken : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', '*/*');
      return headers;
    },
  }),
  tagTypes: ['MilestoneComment'],
  endpoints: (builder) => ({
    getAllMilestoneComments: builder.query<MilestoneCommentResponseDTO[], { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => ({
        url: 'milestonecomment',
        params: { page, pageSize },
      }),
      transformResponse: (response: ApiResponse<MilestoneCommentResponseDTO[]>) => response.data,
      providesTags: ['MilestoneComment'],
    }),

    getMilestoneCommentById: builder.query<MilestoneCommentResponseDTO, number>({
      query: (id) => ({
        url: `milestonecomment/${id}`,
      }),
      transformResponse: (response: ApiResponse<MilestoneCommentResponseDTO>) => response.data,
      providesTags: ['MilestoneComment'],
    }),

    getMilestoneCommentsByMilestoneId: builder.query<MilestoneCommentResponseDTO[], number>({
      query: (milestoneId) => ({
        url: `milestonecomment/by-milestone/${milestoneId}`,
      }),
      transformResponse: (response: ApiResponse<MilestoneCommentResponseDTO[]>) => response.data,
      providesTags: ['MilestoneComment'],
    }),

    createMilestoneComment: builder.mutation<MilestoneCommentResponseDTO, CreateMilestoneComment>({
      query: (payload) => ({
        url: 'milestonecomment',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: ApiResponse<MilestoneCommentResponseDTO>) => response.data,
      invalidatesTags: ['MilestoneComment'],
    }),

    updateMilestoneComment: builder.mutation<MilestoneCommentResponseDTO, { id: number; payload: UpdateMilestoneComment }>({
      query: ({ id, payload }) => ({
        url: `milestonecomment/${id}`,
        method: 'PUT',
        body: payload,
      }),
      transformResponse: (response: ApiResponse<MilestoneCommentResponseDTO>) => response.data,
      invalidatesTags: ['MilestoneComment'],
    }),

    deleteMilestoneComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `milestonecomment/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['MilestoneComment'],
    }),
  }),
});

export const {
  useGetAllMilestoneCommentsQuery,
  useGetMilestoneCommentByIdQuery,
  useGetMilestoneCommentsByMilestoneIdQuery,
  useCreateMilestoneCommentMutation,
  useUpdateMilestoneCommentMutation,
  useDeleteMilestoneCommentMutation,
} = milestoneCommentApi;
