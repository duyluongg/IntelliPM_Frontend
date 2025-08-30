import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface Project {
  projectId: number;
  projectName: string;
  projectKey: string;
  iconUrl: string | null;
  projectStatus: string;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

export interface GetProjectsResponse {
  isSuccess: boolean;
  code: number;
  data: Project[];
  message: string;
}

export interface ProjectPosition {
  id: number;
  projectMemberId: number;
  position: string;
  assignedAt: string;
}

export interface Profile {
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
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  upcomingProjects: number;
  activeProjects: number;
  cancelledProjects: number;
  projectList: Project[];
  totalPositions: number;
  positionsList: string[];
  recentPositions: ProjectPosition[];
}

export interface GetProfileResponse {
  isSuccess: boolean;
  code: number;
  data: Profile;
  message: string;
}

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

export interface GetAccountResponse {
  isSuccess: boolean;
  code: number;
  data: Account | null;
  message: string;
}

export interface TeamMember {
  id: number;
  accountId: number;
  accountName: string;
  accountEmail: string;
  accountPicture: string;
  projectId: number;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

export interface Team {
  projectId: number;
  projectName: string;
  projectKey: string;
  totalMembers: number;
  members: TeamMember[];
}

export interface TeamsData {
  totalTeams: number;
  teams: Team[];
}

export interface GetTeamsResponse {
  isSuccess: boolean;
  code: number;
  data: TeamsData;
  message: string;
}

export interface ChangeAccountStatusRequest {
  newStatus: string;
}

export interface ChangeAccountRoleRequest {
  newRole: string;
}

export interface ChangeAccountPositionRequest {
  newPosition: string;
}

export interface ChangeAccountResponse {
  isSuccess: boolean;
  code: number;
  data: Account;
  message: string;
}

export interface UploadAvatarData {
  fileUrl: string;
}

export interface UploadAvatarResponse {
  isSuccess: boolean;
  code: number;
  data: UploadAvatarData;
  message: string;
}

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('accept', '*/*');
      // headers.set('Content-Type', 'application/json');
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
    getProfileByEmail: builder.query<GetProfileResponse, string>({
      query: (email) => ({
        url: `account/profile/${encodeURIComponent(email)}`,
        method: 'GET',
      }),
    }),
    getTeamsByAccountId: builder.query<GetTeamsResponse, number>({
      query: (accountId) => ({
        url: `account/${accountId}/teams`,
        method: 'GET',
      }),
    }),
    getProfileByAccountId: builder.query<GetProfileResponse, number>({
      query: (accountId) => ({
        url: `account/${accountId}/profile`,
        method: 'GET',
      }),
    }),
    changeAccountStatus: builder.mutation<
      ChangeAccountResponse,
      { accountId: number; newStatus: string }
    >({
      query: ({ accountId, newStatus }) => ({
        url: `account/${accountId}/status`,
        method: 'PATCH',
        body: { newStatus },
      }),
    }),
    changeAccountRole: builder.mutation<
      ChangeAccountResponse,
      { accountId: number; newRole: string }
    >({
      query: ({ accountId, newRole }) => ({
        url: `account/${accountId}/role`,
        method: 'PATCH',
        body: { newRole },
      }),
    }),
    changeAccountPosition: builder.mutation<
      ChangeAccountResponse,
      { accountId: number; newPosition: string }
    >({
      query: ({ accountId, newPosition }) => ({
        url: `account/${accountId}/position`,
        method: 'PATCH',
        body: { newPosition },
      }),
    }),
    uploadAvatar: builder.mutation<UploadAvatarResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: 'account/upload-avatar',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetProjectsByAccountIdQuery,
  useGetProjectsByAccountQuery,
  useGetAccountByEmailQuery,
  useLazyGetAccountByEmailQuery,
  useGetProfileByEmailQuery,
  useGetTeamsByAccountIdQuery,
  useGetProfileByAccountIdQuery,
  useChangeAccountStatusMutation,
  useChangeAccountRoleMutation,
  useChangeAccountPositionMutation,
  useUploadAvatarMutation,
} = accountApi;
