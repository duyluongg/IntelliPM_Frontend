import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface LabelDTO {
    id: number;
    projectId: number;
    name: string;
    colorCode: string | null;
    description: string | null;
    status: string;
}

interface LabelListResponse {
    isSuccess: boolean;
    code: number;
    message: string;
    data: LabelDTO[];
}

interface CreateLabelPayload {
    projectId: number;
    name: string;
    colorCode?: string | null;
    description?: string | null;
    status?: string;
}

interface CreateLabelAndAssignPayload {
    projectId: number;
    name: string;
    taskId?: string | null;
    epicId?: string | null;
    subtaskId?: string | null;
    isDeleted?: boolean;
}

interface CreateLabelAndAssignResponse {
    id: number;
    labelId: number;
    labelName: string;
    taskId: string | null;
    epicId: string | null;
    subtaskId: string | null;
    isDeleted: boolean;
}

interface UpdateLabelPayload extends CreateLabelPayload {
    id: number;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export const labelApi = createApi({
    reducerPath: 'labelApi',
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
        getAllLabels: builder.query<LabelDTO[], { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 10 }) => ({
                url: `label?page=${page}&pageSize=${pageSize}`,
                method: 'GET',
            }),
            transformResponse: (response: LabelListResponse) => response.data,
        }),

        createLabel: builder.mutation<void, CreateLabelPayload>({
            query: (payload) => ({
                url: 'label',
                method: 'POST',
                body: payload,
            }),
        }),

        updateLabel: builder.mutation<void, UpdateLabelPayload>({
            query: ({ id, ...body }) => ({
                url: `label/${id}`,
                method: 'PUT',
                body,
            }),
        }),

        deleteLabel: builder.mutation<void, number>({
            query: (id) => ({
                url: `label/${id}`,
                method: 'DELETE',
            }),
        }),
        createLabelAndAssign: builder.mutation<CreateLabelAndAssignResponse, CreateLabelAndAssignPayload>({
            query: (payload) => ({
                url: 'label/create-label-and-assign',
                method: 'POST',
                body: payload,
            }),
        }),

        getLabelsByProjectId: builder.query<LabelDTO[], number>({
            query: (projectId) => ({
                url: `label/project/${projectId}`,
                method: 'GET',
            }),
            transformResponse: (response: ApiResponse<LabelDTO[]>) => response.data,
        }),
    }),
});

export const {
    useGetAllLabelsQuery,
    useCreateLabelMutation,
    useUpdateLabelMutation,
    useDeleteLabelMutation,
    useCreateLabelAndAssignMutation,
    useGetLabelsByProjectIdQuery,
} = labelApi;
