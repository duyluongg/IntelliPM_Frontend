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
}

// Giao diện cho Log Request
export interface CreateMeetingLogRequest {
  meetingId: number;
  accountId: number;
  action: 'CREATE_MEETING' | 'UPDATE_MEETING' | 'DELETE_MEETING'; // thêm nếu cần
}

// Giao diện cho response tạo log
export interface CreateMeetingLogResponse {
  isSuccess: boolean;
  message: string;
  data: any;
}

export const meetingLogApi = createApi({
  reducerPath: 'meetingLogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // GET /meetings/managed-by/:id
    getMeetingsManagedBy: builder.query<ManagedMeeting[], number>({
      query: (accountId) => `meetings/managed-by/${accountId}`,
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
} = meetingLogApi;
