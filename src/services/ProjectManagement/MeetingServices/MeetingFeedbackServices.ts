// src/services/ProjectManagement/MeetingFeedbackServices.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

// 👉 Interface MeetingFeedback gốc
export interface MeetingFeedback {
  meetingTranscriptId: number;
  summaryText: string;
  createdAt: string;
  transcriptText: string;
  isApproved: boolean;
  meetingTopic: string;
}

export interface MyMeeting {
  id: number;
  projectId: number;
  meetingTopic: string;
  meetingDate: string;
  meetingUrl: string;
  status: string;
  startTime: string;
  endTime: string;
  attendees: number | null;
  createdAt: string;
  projectName: string | null;
}

// 👉 Interface cho rejected feedback
export interface RejectedFeedback {
  id: number;
  meetingId: number;
  accountId: number;
  feedbackText: string;
  status: string;
  createdAt: string;
  accountName: string;
}

export const meetingFeedbackApi = createApi({
  reducerPath: 'meetingFeedbackApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ✅ Get feedbacks theo account
    getMeetingFeedbacksByAccount: builder.query<MeetingFeedback[], number>({
      query: (accountId) => `meeting-summaries/all-by-account/${accountId}`,
    }),

    // ✅ Submit feedback từ chối
    submitFeedback: builder.mutation({
      query: ({ meetingId, accountId, feedbackText, status }) => ({
        url: 'milestonefeedback/submit-feedback',
        method: 'POST',
        body: {
          meetingId,
          accountId,
          feedbackText,
          status,
        },
      }),
    }),

    // ✅ Approve milestone
    approveMilestone: builder.mutation({
      query: ({ meetingId, accountId }) => ({
        url: `milestonefeedback/approve-milestone?meetingId=${meetingId}&accountId=${accountId}`,
        method: 'POST',
      }),
    }),
    // ✅ Lấy danh sách meeting của tài khoản hiện tại
    getMyMeetings: builder.query<MyMeeting[], void>({
      query: () => 'meetings/my',
    }),

    // ✅ Lấy rejected feedbacks theo meeting
    getRejectedFeedbacks: builder.query<RejectedFeedback[], number>({
      query: (meetingId) => `milestonefeedback/meeting/${meetingId}/rejected-feedbacks`,
    }),

    // ✅ Xoá meeting summary theo ID
deleteMeetingSummary: builder.mutation<void, number>({
  query: (id) => ({
    url: `meeting-summaries/${id}`,
    method: 'DELETE',
  }),
}),

  }),
});

// ✅ Export hooks để dùng trong component
export const {
  useGetMeetingFeedbacksByAccountQuery,
  useSubmitFeedbackMutation,
  useApproveMilestoneMutation,
  useGetRejectedFeedbacksQuery,
  useGetMyMeetingsQuery,
  useLazyGetRejectedFeedbacksQuery,
 useDeleteMeetingSummaryMutation,

} = meetingFeedbackApi;
