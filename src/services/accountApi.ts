import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface Project {
  projectId: number;
  projectName: string;
  projectKey: string;
  iconUrl: string | null;
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

interface Account {
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

interface GetAccountResponse {
  isSuccess: boolean;
  code: number;
  data: Account | null;
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
    getAccountByEmail: builder.query<GetAccountResponse, string>({
      query: (email) => ({
        url: `account/${encodeURIComponent(email)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetProjectsByAccountIdQuery, useGetProjectsByAccountQuery, useGetAccountByEmailQuery } = accountApi;