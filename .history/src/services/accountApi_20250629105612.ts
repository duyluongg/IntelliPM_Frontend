import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface Project {
  projectId: number;
  projectName: string;
  projectStatus: string;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

interface GetProjectsResponse {
  isSuccess: boolean;
  code: number;
  data: Project[];
  message: string;
}

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjectsByAccountId: builder.query<GetProjectsResponse, number>({
      query: (accountId) => ({
        url: `account/${accountId}/projects`,
        method: 'GET',
      }),
    }),
    getProjectsByAccount: builder.query<GetProjectsResponse, string>({
      query: (accessToken) => ({
        url: `account/projects`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    }),

  }),
});

export const { useGetProjectsByAccountIdQuery,useGetProjectsByAccountQuery } = accountApi;