import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AiSuggestedTask {
    projectId: number;
    epicId: string;
    title: string;
    description: string;
    type: string;
    status: string;
    manualInput: boolean;
    generationAiInput: boolean;
}

interface ApiResponse<T> {
    isSuccess: boolean;
    code: number;
    message: string;
    data: T;
}

export const taskAiApi = createApi({
    reducerPath: 'taskAiApi',
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
        generateTasksByAI: builder.mutation<AiSuggestedTask[], number>({
            query: (projectId) => ({
                url: `ai/${projectId}/generate-task`,
                method: 'POST',
            }),
            transformResponse: (response: ApiResponse<AiSuggestedTask[]>) => response.data,
        }),
        generateTasksByEpicByAI: builder.mutation<AiSuggestedTask[], string>({
            query: (epicId) => ({
                url: `ai/${epicId}/generate-task-by-epic`,
                method: 'POST',
            }),
            transformResponse: (response: ApiResponse<AiSuggestedTask[]>) => response.data,
        }),
    }),
});

export const {
    useGenerateTasksByAIMutation,
    useGenerateTasksByEpicByAIMutation
} = taskAiApi;
