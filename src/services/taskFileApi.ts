
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface TaskFileDTO {
    id: number;
    taskId: string;
    title: string;
    urlFile: string;
    status: string;
    createdAt: string;
}

interface TaskFileListResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    data: TaskFileDTO[];
}

export const taskFileApi = createApi({
    reducerPath: 'taskFileApi',
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
        getTaskFilesByTaskId: builder.query<TaskFileDTO[], string>({
            query: (taskId) => ({
                url: `taskfile/by-task/${taskId}`,
            }),
            transformResponse: (response: TaskFileListResponse) => response.data,
        }),
        uploadTaskFile: builder.mutation<void, { taskId: string; title: string; file: File }>({
            query: ({ taskId, title, file }) => {
                const formData = new FormData();
                formData.append('taskId', taskId);
                formData.append('title', title);
                formData.append('file', file);

                return {
                    url: 'taskfile/upload',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        deleteTaskFile: builder.mutation<void, number>({
            query: (id) => ({
                url: `taskfile/${id}`,
                method: 'DELETE',
            }),
        }),

    }),

});

export const { 
    useGetTaskFilesByTaskIdQuery, 
    useUploadTaskFileMutation,
    useDeleteTaskFileMutation
 } = taskFileApi;
