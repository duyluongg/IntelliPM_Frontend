// src/services/ProjectManagement/MeetingServices/MeetingServices.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

export interface Project {
  projectId: number;
  projectName: string;
  projectStatus: string;
  joinedAt: string;
  invitedAt: string;
  status: string;
}

export interface ProjectMember {
  id: number;
  fullName: string;
  username: string;
  picture: string;
}

interface CreateMeetingRequest {
    projectId: number;
    meetingTopic: string;
    meetingDate: string; // ISO string
    meetingUrl: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    attendees: number;
    participantIds: number[];
}

interface GetProjectsResponse {
  isSuccess: boolean;
  code: number;
  data: Project[];
  message: string;
}

interface GetProjectDetailsResponse {
  isSuccess: boolean;
  code: number;
  data: {
    projectId: number;
    projectMembers: ProjectMember[];
  };
  message: string;
}

interface CreateMeetingResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: any;
}

interface Meeting {
projectId: number;
  meetingTopic: string;
  meetingDate: string; // ISO string
  meetingUrl: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendees: number;
  participantIds: number[];
}

interface GetMeetingsResponse {
  isSuccess: boolean;
  code: number;
  data: Meeting[];
  message: string;
}

export const meetingApi = createApi({
  reducerPath: 'meetingApi',
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

    getProjectDetails: builder.query<GetProjectDetailsResponse, number>({
      query: (projectId) => ({
        url: `project/${projectId}/details`,
        method: 'GET',
      }),
    }),

    createMeeting: builder.mutation<CreateMeetingResponse, CreateMeetingRequest>({
      query: (meetingData) => ({
        url: 'meetings',
        method: 'POST',
        body: meetingData,
      }),
    }),

    getMeetingsByAccountId: builder.query<GetMeetingsResponse, number>({
      query: (accountId) => ({
        url: `meetings/account/${accountId}/schedule`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetProjectsByAccountIdQuery,
  useGetProjectDetailsQuery,
  useCreateMeetingMutation,
  useGetMeetingsByAccountIdQuery,
} = meetingApi;
