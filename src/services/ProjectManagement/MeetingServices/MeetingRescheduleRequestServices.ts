// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { API_BASE_URL } from '../../../constants/api';

// interface MeetingRescheduleRequest {
//   id?: number;
//   meetingId: number;
//   requesterId: number;
//   requestedDate: string;
//   reason: string;
//   status: string;
//   pmId: number | null;
//   pmProposedDate: string | null;
//   pmNote: string | null;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface GetAllRescheduleRequestsResponse {
//   isSuccess: boolean;
//   code: number;
//   data: MeetingRescheduleRequest[];
//   message: string;
// }

// interface GetRescheduleRequestResponse {
//   isSuccess: boolean;
//   code: number;
//   data: MeetingRescheduleRequest;
//   message: string;
// }

// interface CreateRescheduleRequestResponse {
//   isSuccess: boolean;
//   code: number;
//   data: MeetingRescheduleRequest;
//   message: string;
// }

// interface UpdateRescheduleRequestResponse {
//   isSuccess: boolean;
//   code: number;
//   data: MeetingRescheduleRequest;
//   message: string;
// }


// interface GetRescheduleRequestsByRequesterIdResponse {
//   isSuccess: boolean;
//   code: number;
//   data: MeetingRescheduleRequest[];
//   message: string;
// }


// interface DeleteRescheduleRequestResponse {
//   isSuccess: boolean;
//   code: number;
//   message: string;
// }

// export const meetingRescheduleRequestApi = createApi({
//   reducerPath: 'meetingRescheduleRequestApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_BASE_URL,
//     prepareHeaders: (headers) => {
//       headers.set('accept', '*/*');
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     // New: Get all reschedule requests
//     getAllRescheduleRequests: builder.query<GetAllRescheduleRequestsResponse, void>({
//       query: () => ({
//         url: 'meetingreschedulerequest',
//         method: 'GET',
//       }),
//     }),

//     // Create reschedule request
//     createRescheduleRequest: builder.mutation<CreateRescheduleRequestResponse, MeetingRescheduleRequest>({
//       query: (requestData) => ({
//         url: 'meetingreschedulerequest',
//         method: 'POST',
//         body: requestData,
//       }),
//     }),

//     // Get reschedule request by ID
//     getRescheduleRequestById: builder.query<GetRescheduleRequestResponse, number>({
//       query: (id) => ({
//         url: `meetingreschedulerequest/${id}`,
//         method: 'GET',
//       }),
//     }),

// getRescheduleRequestsByRequesterId: builder.query<GetRescheduleRequestsByRequesterIdResponse, number>({
//   query: (requesterId) => ({
//     url: `meetingreschedulerequest/by-requester/${requesterId}`,
//     method: 'GET',
//   }),
// }),

//     // Update reschedule request
//     updateRescheduleRequest: builder.mutation<UpdateRescheduleRequestResponse, MeetingRescheduleRequest>({
//       query: (requestData) => ({
//         url: `meetingreschedulerequest/${requestData.id}`,
//         method: 'PUT',
//         body: requestData,
//       }),
//     }),

//     // Delete reschedule request
//     deleteRescheduleRequest: builder.mutation<DeleteRescheduleRequestResponse, number>({
//       query: (id) => ({
//         url: `meetingreschedulerequest/${id}`,
//         method: 'DELETE',
//       }),
//     }),
//   }),
// });

// export const {
//   useGetAllRescheduleRequestsQuery,
//   useCreateRescheduleRequestMutation,
//   useGetRescheduleRequestByIdQuery,
//   useUpdateRescheduleRequestMutation,
//   useDeleteRescheduleRequestMutation,
// } = meetingRescheduleRequestApi;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../constants/api';

interface MeetingRescheduleRequest {
  id?: number;
  meetingId: number;
  requesterId: number;
  requestedDate: string;
  reason: string;
  status: string;
  pmId: number | null;
  pmProposedDate: string | null;
  pmNote: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface GetAllRescheduleRequestsResponse {
  isSuccess: boolean;
  code: number;
  data: MeetingRescheduleRequest[];
  message: string;
}

interface GetRescheduleRequestsByRequesterIdResponse {
  isSuccess: boolean;
  code: number;
  data: MeetingRescheduleRequest[];
  message: string;
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
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Lấy tất cả yêu cầu
    getAllRescheduleRequests: builder.query<GetAllRescheduleRequestsResponse, void>({
      query: () => ({
        url: 'meetingreschedulerequest',
        method: 'GET',
      }),
    }),

    // Lấy theo requesterId
    getRescheduleRequestsByRequesterId: builder.query<GetRescheduleRequestsByRequesterIdResponse, number>({
      query: (requesterId) => ({
        url: `meetingreschedulerequest/by-requester/${requesterId}`,
        method: 'GET',
      }),
    }),

    // Tạo mới
    createRescheduleRequest: builder.mutation<CreateRescheduleRequestResponse, MeetingRescheduleRequest>({
      query: (requestData) => ({
        url: 'meetingreschedulerequest',
        method: 'POST',
        body: requestData,
      }),
    }),

    // Lấy theo id
    getRescheduleRequestById: builder.query<GetRescheduleRequestResponse, number>({
      query: (id) => ({
        url: `meetingreschedulerequest/${id}`,
        method: 'GET',
      }),
    }),

    // Cập nhật
    updateRescheduleRequest: builder.mutation<UpdateRescheduleRequestResponse, MeetingRescheduleRequest>({
      query: (requestData) => ({
        url: `meetingreschedulerequest/${requestData.id}`,
        method: 'PUT',
        body: requestData,
      }),
    }),

    // Xoá
    deleteRescheduleRequest: builder.mutation<DeleteRescheduleRequestResponse, number>({
      query: (id) => ({
        url: `meetingreschedulerequest/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllRescheduleRequestsQuery,
  useGetRescheduleRequestsByRequesterIdQuery,
  useCreateRescheduleRequestMutation,
  useGetRescheduleRequestByIdQuery,
  useUpdateRescheduleRequestMutation,
  useDeleteRescheduleRequestMutation,
} = meetingRescheduleRequestApi;
