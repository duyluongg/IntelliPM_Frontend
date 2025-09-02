import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface NotificationDTO {
    id: number,
    createdBy: number,
    createdByName: string,
    type: string,
    priority: string,
    message: string,
    relatedEntityType: string,
    relatedEntityId: number,
    isRead: boolean,
    createdAt: string,
}

interface ApiResponse<T> {
    isSuccess: boolean;
    code: number;
    message: string;
    data: T;
}

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
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
        getNotificationsByAccountId: builder.query<NotificationDTO[], number>({
            query: (accountId) => `Notification/account/${accountId}`,
            transformResponse: (response: ApiResponse<NotificationDTO[]>) => response.data,
        }),

        getAllNotifications: builder.query<NotificationDTO[], void>({
            query: () => `Notification`,
            transformResponse: (response: ApiResponse<NotificationDTO[]>) => response.data,
        }),
    }),
});

export const {
    useGetNotificationsByAccountIdQuery,
    useGetAllNotificationsQuery
} = notificationApi;
