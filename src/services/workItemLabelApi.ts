import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface WorkItemLabel {
    id: number;
    labelId: number;
    labelName: string;
    taskId: string;
    epicId: string | null;
    subtaskId: string | null;
    isDeleted: boolean;
}

interface WorkItemLabelResponse {
    isSuccess: boolean;
    code: number;
    data: WorkItemLabel[];
    message: string;
}

export const workItemLabelApi = createApi({
    reducerPath: 'workItemLabelApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            headers.set('accept', '*/*');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const accessToken = user?.accessToken || '';
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getWorkItemLabelsByTask: builder.query<WorkItemLabel[], string>({
            query: (taskId) => `workitemlabel/by-task/${taskId}`,
            transformResponse: (response: any): WorkItemLabel[] => response.data ?? [],
        }),

        getWorkItemLabelsBySubtask: builder.query<WorkItemLabel[], string>({
            query: (subtaskId) => `workitemlabel/by-subtask/${subtaskId}`,
            transformResponse: (response: any): WorkItemLabel[] => response.data ?? [],
        }),

        getWorkItemLabelsByEpic: builder.query<WorkItemLabel[], string>({
            query: (epicId) => `workitemlabel/by-epic/${epicId}`,
            transformResponse: (response: any): WorkItemLabel[] => response.data ?? [],
        }),

        deleteWorkItemLabel: builder.mutation<void, number>({
            query: (id) => ({
                url: `workitemlabel/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetWorkItemLabelsByTaskQuery,
    useGetWorkItemLabelsBySubtaskQuery,
    useGetWorkItemLabelsByEpicQuery,
    useDeleteWorkItemLabelMutation
} = workItemLabelApi;
