// src/services/ProjectManagement/MeetingLogServices.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

// Giao diện cho Meeting (dạng bạn nhận về từ /managed-by/:id)
export interface ManagedMeeting {
  id: number;
  projectId: number;
  meetingTopic: string;
  meetingDate: string;
  meetingUrl: string;
  status: string;
  startTime: string;
  endTime: string;
  attendees: number;
  createdAt: string;
  projectName: string | null;
  participantIds: number[];

}

// Giao diện cho Log Request
export interface CreateMeetingLogRequest {
  meetingId: number;
  accountId: number;
  action: 'CREATE_MEETING' | 'UPDATE_MEETING' | 'DELETE_MEETING'; 
}

// Giao diện cho response tạo log
export interface CreateMeetingLogResponse {
  isSuccess: boolean;
  message: string;
  data: any;
} 

// Giao diện cho Meeting Log
export interface MeetingLog {
  id: number;
  meetingId: number;
  accountId: number;
  action: 'CREATE_MEETING' | 'UPDATE_MEETING' | 'DELETE_MEETING';
  createdAt: string;
  accountName: string;
}


export const meetingLogApi = createApi({
  reducerPath: 'meetingLogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  
  endpoints: (builder) => ({
    // GET /meetings/managed-by/:id
    getMeetingsManagedBy: builder.query<ManagedMeeting[], number>({
      query: (accountId) => `meetings/managed-by/${accountId}`,
    }),
// GET /meeting-logs/meeting/:meetingId
getMeetingLogsByMeetingId: builder.query<MeetingLog[], number>({
  query: (meetingId) => `meeting-logs/meeting/${meetingId}`,
}),

    // POST /meeting-logs
    createMeetingLog: builder.mutation<CreateMeetingLogResponse, CreateMeetingLogRequest>({
      query: (logData) => ({
        url: 'meeting-logs',
        method: 'POST',
        body: logData,
      }),
    }),
  }),
});

export const {
  useGetMeetingsManagedByQuery,
  useCreateMeetingLogMutation,
  useGetMeetingLogsByMeetingIdQuery,
} = meetingLogApi;
