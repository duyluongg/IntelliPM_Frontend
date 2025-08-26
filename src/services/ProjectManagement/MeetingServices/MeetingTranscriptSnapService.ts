// src/services/ProjectManagement/MeetingTranscriptSnapService.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

/** === Types khớp BE === */
export interface MeetingTranscriptResponse {
  meetingId: number;
  transcriptText: string;
  createdAt: string; // ISO
}

export interface TranscriptHistoryItem {
  fileName: string;
  takenAtUtc: string; // ISO UTC
}

export interface UpdateTranscriptPayload {
  meetingId: number;              // route param
  transcriptText: string;         // body
  editReason?: string;
  editedByAccountId?: number;
  ifMatchHash?: string;           // optional optimistic concurrency
}

export interface RestoreTranscriptPayload {
  meetingId: number;              // route param
  fileName: string;               // body
  reason?: string;
  editedByAccountId?: number;
}

export const meetingTranscriptSnapApi = createApi({
  reducerPath: 'meetingTranscriptSnapApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    /** PUT /api/meeting-transcripts/{meetingId} */
    updateTranscript: builder.mutation<MeetingTranscriptResponse, UpdateTranscriptPayload>({
      query: ({ meetingId, transcriptText, editReason, editedByAccountId, ifMatchHash }) => ({
        url: `meeting-transcripts/${meetingId}`,
        method: 'PUT',
        body: { transcriptText, editReason, editedByAccountId, ifMatchHash },
      }),
    }),

    /** GET /api/meeting-transcripts/{meetingId}/history */
    getTranscriptHistory: builder.query<TranscriptHistoryItem[], number>({
      query: (meetingId) => `meeting-transcripts/${meetingId}/history`,
    }),

    /** POST /api/meeting-transcripts/{meetingId}/restore */
    restoreTranscript: builder.mutation<MeetingTranscriptResponse, RestoreTranscriptPayload>({
      query: ({ meetingId, fileName, reason, editedByAccountId }) => ({
        url: `meeting-transcripts/${meetingId}/restore`,
        method: 'POST',
        body: { fileName, reason, editedByAccountId },
      }),
    }),
  }),
});

export const {
  useUpdateTranscriptMutation,
  useGetTranscriptHistoryQuery,
  useRestoreTranscriptMutation,
} = meetingTranscriptSnapApi;
