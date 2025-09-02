import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface RecipientNotificationDTO {
  accountId: number;
  accountName: string;
  notificationId: number;
  notificationMessage: string;
  status: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const recipientNotificationApi = createApi({
  reducerPath: 'recipientNotificationApi',
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

    getRecipientNotificationsByAccountId: builder.query<RecipientNotificationDTO[], number>({
      query: (accountId) => `recipientnotification/account/${accountId}`,
      transformResponse: (response: ApiResponse<RecipientNotificationDTO[]>) => response.data,
    }),

    markAsRead: builder.mutation<void, { accountId: number; notificationId: number }>({
      query: ({ accountId, notificationId }) => ({
        url: `RecipientNotification/mark-as-read?accountId=${accountId}&notificationId=${notificationId}`,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useGetRecipientNotificationsByAccountIdQuery,
  useMarkAsReadMutation,
} = recipientNotificationApi;
