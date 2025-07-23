import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';
import type { NotificationType } from '../../types/NotificationType';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const token = user?.accessToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
  
    getNotifications: builder.query<NotificationType[], void>({
      query: () => 'notification/me',
    }),
  }),
});
export const { useGetNotificationsQuery, useLazyGetNotificationsQuery } = notificationsApi;

