// src/services/ProjectManagement/DocumentRequestMeetingServices.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

export interface CreateDocumentRequestMeetingDTO {
  file: File;
  teamLeaderId: number;
  projectManagerId: number;
  status: string;
  reason: string;
  feedbackId: number;
}

export const documentRequestMeetingApi = createApi({
  reducerPath: 'documentRequestMeetingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    createDocumentRequestMeeting: builder.mutation<any, CreateDocumentRequestMeetingDTO>({
      query: ({ file, teamLeaderId, projectManagerId, status, reason, feedbackId }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('teamLeaderId', teamLeaderId.toString());
        formData.append('projectManagerId', projectManagerId.toString());
        formData.append('status', status);
        formData.append('reason', reason);
        formData.append('feedbackId', feedbackId.toString());

        return {
          url: 'document-request-meetings',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useCreateDocumentRequestMeetingMutation } = documentRequestMeetingApi;
