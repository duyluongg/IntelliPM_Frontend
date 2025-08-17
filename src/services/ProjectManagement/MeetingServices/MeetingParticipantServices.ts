// src/services/ProjectManagement/MeetingParticipantServices/MeetingParticipantServices.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

/* ========== Kiểu dữ liệu ========= */

export interface UpdateMeetingRequest {
  projectId: number;
  meetingTopic: string;
  meetingDate: string;   // ISO
  meetingUrl: string;
  startTime: string;     // ISO
  endTime: string;       // ISO
  attendees: number;
  participantIds: number[];
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface MeetingParticipant {
  id: number;
  meetingId: number;
  accountId: number;
  role: string;
  /**  Trạng thái điểm danh */
  status: 'Present' | 'Absent' | 'Active';  // thêm Present | Absent
  createdAt: string;
  fullName:string;
}

// NEW — DTO cho update status, match BE DynamicCategoryValidation(string)
export interface UpdateParticipantStatusDTO {
  meetingId: number;
  accountId: number;
  role?: string | null;
  status?: string | null; // ✅ dynamic
}

export interface AddParticipantsResult {
  added: number[];
  alreadyIn: number[];
  conflicted: number[];
  notFound: number[];
} 

/* ========== Phản hồi trả về ========= */

interface BaseResponse<T = unknown> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

/* ========== API slice ========= */

export const meetingParticipantApi = createApi({
  reducerPath: 'meetingParticipantApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    /* --- MEETINGS -------------------------------------------------------- */

    /** PUT /api/meetings/:id – Cập nhật chi tiết cuộc họp */
    updateMeeting: builder.mutation<BaseResponse, { meetingId: number; data: UpdateMeetingRequest }>({
      query: ({ meetingId, data }) => ({
        url: `meetings/${meetingId}`,
        method: 'PUT',
        body: data,
      }),
    }),

    /** DELETE /api/meetings/:id – Huỷ cuộc họp */
    deleteMeeting: builder.mutation<void, number>({
      query: (meetingId) => ({
        url: `meetings/${meetingId}`,
        method: 'DELETE',
      }),
    }),

    /* --- PARTICIPANTS ---------------------------------------------------- */

    /** GET /api/meeting-participants/meeting/:meetingId – Danh sách người tham gia */
    getParticipantsByMeetingId: builder.query<MeetingParticipant[], number>({
      query: (meetingId) => ({
        url: `meeting-participants/meeting/${meetingId}`,
        method: 'GET',
      }),
    }),

    /** PUT /api/meetings/:id/complete – Đánh dấu COMPLETED */
completeMeeting: builder.mutation<void, number>({
  query: (meetingId) => ({
    url: `meetings/${meetingId}/complete`,
    method: 'PUT',
  }),
}),

addParticipantsToMeeting: builder.mutation<
      AddParticipantsResult,
      { meetingId: number; participantIds: number[] }
    >({
      query: ({ meetingId, participantIds }) => ({
        url: `meetings/${meetingId}/participants`,
        method: 'POST',
        body: participantIds,
      }),
    }),


    /** PUT /api/meeting-participants/:id – Điểm danh (Present / Absent) */
    // updateParticipantStatus: builder.mutation<
    //   MeetingParticipant,
    //   { participantId: number; data: Pick<MeetingParticipant, 'meetingId' | 'accountId' | 'role' | 'status'> }
    // >({
    //   query: ({ participantId, data }) => ({
    //     url: `meeting-participants/${participantId}`,
    //     method: 'PUT',
    //     body: data,
    //   }),
    // }),
    updateParticipantStatus: builder.mutation<
  MeetingParticipant,
  { participantId: number; data: UpdateParticipantStatusDTO }
>({
  query: ({ participantId, data }) => ({
    url: `meeting-participants/${participantId}`,
    method: 'PUT',
    body: data,
  }),
}),
  }),
});

/* ========== Hooks xuất ra dùng trong component ========= */

export const {
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useGetParticipantsByMeetingIdQuery,
  useUpdateParticipantStatusMutation,
  useCompleteMeetingMutation, 
  useAddParticipantsToMeetingMutation,
} = meetingParticipantApi;
