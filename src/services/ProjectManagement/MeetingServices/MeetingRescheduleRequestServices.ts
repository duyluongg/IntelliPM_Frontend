import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

interface MeetingRescheduleRequest {
  id?: number;
  meetingId: number;
  requesterId: number;
  requestedDate: string; // ISO string
  reason: string;
  status: string; // Đây là kiểu bạn cần
  pmId: number | null;
  pmProposedDate: string; // ISO string
  pmNote: string;
}

interface GetRescheduleRequestResponse {
  isSuccess: boolean;
  code: number;
  data: MeetingRescheduleRequest;
  message: string;
}

interface CreateRescheduleRequestResponse {
  isSuccess: boolean;
  code: number;
  data: MeetingRescheduleRequest;
  message: string;
}

interface UpdateRescheduleRequestResponse {
  isSuccess: boolean;
  code: number;
  data: MeetingRescheduleRequest;
  message: string;
}

interface DeleteRescheduleRequestResponse {
  isSuccess: boolean;
  code: number;
  message: string;
}

export const meetingRescheduleRequestApi = createApi({
  reducerPath: 'meetingRescheduleRequestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');  // Lấy token từ localStorage hoặc store
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); // Thêm token vào header
      }
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Create reschedule request
    createRescheduleRequest: builder.mutation<CreateRescheduleRequestResponse, MeetingRescheduleRequest>({
      query: (requestData) => ({
        url: 'meetingreschedulerequest',
        method: 'POST',
        body: requestData,
      }),
    }),

    // Get reschedule request by ID
    getRescheduleRequestById: builder.query<GetRescheduleRequestResponse, number>({
      query: (id) => ({
        url: `meetingreschedulerequest/${id}`,
        method: 'GET',
      }),
    }),

    // Update reschedule request
    updateRescheduleRequest: builder.mutation<UpdateRescheduleRequestResponse, MeetingRescheduleRequest>({
      query: (requestData) => ({
        url: `meetingreschedulerequest/${requestData.id}`,
        method: 'PUT',
        body: requestData,
      }),
    }),

    // Delete reschedule request
    deleteRescheduleRequest: builder.mutation<DeleteRescheduleRequestResponse, number>({
      query: (id) => ({
        url: `meetingreschedulerequest/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateRescheduleRequestMutation,
  useGetRescheduleRequestByIdQuery,
  useUpdateRescheduleRequestMutation,
  useDeleteRescheduleRequestMutation,
} = meetingRescheduleRequestApi;
