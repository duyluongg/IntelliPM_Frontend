import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface DynamicCategory {
  id: number;
  categoryGroup: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  orderIndex: number;
  iconLink: string | null;
  color: string | null;
  createdAt: string;
}

export interface DynamicCategoryRequest {
  categoryGroup: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  orderIndex: number;
  iconLink?: string | null;
  color?: string | null;
}
export interface DynamicCategoryResponse {
  isSuccess: boolean;
  code: number;
  data: DynamicCategory[];
  message: string;
}

export const dynamicCategoryApi = createApi({
  reducerPath: 'dynamicCategoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCategoriesByGroup: builder.query<DynamicCategoryResponse, string>({
      query: (categoryGroup) => `dynamiccategory/by-category-group?categoryGroup=${categoryGroup}`,
    }),

    getAll: builder.query<DynamicCategoryResponse, void>({
      query: () => 'dynamiccategory',
    }),
    getById: builder.query<DynamicCategoryResponse, number>({
      query: (id) => `dynamiccategory/${id}`,
    }),
    getByNameOrCategoryGroup: builder.query<
      DynamicCategoryResponse,
      { name?: string; categoryGroup?: string }
    >({
      query: ({ name, categoryGroup }) => {
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (categoryGroup) params.append('categoryGroup', categoryGroup);
        return `dynamiccategory/by-name-or-category-group?${params.toString()}`;
      },
    }),
    create: builder.mutation<DynamicCategoryResponse, DynamicCategoryRequest>({
      query: (request) => ({
        url: 'dynamiccategory',
        method: 'POST',
        body: request,
      }),
    }),
    update: builder.mutation<
      DynamicCategoryResponse,
      { id: number; request: DynamicCategoryRequest }
    >({
      query: ({ id, request }) => ({
        url: `dynamiccategory/${id}`,
        method: 'PUT',
        body: request,
      }),
    }),
    delete: builder.mutation<DynamicCategoryResponse, number>({
      query: (id) => ({
        url: `dynamiccategory/${id}`,
        method: 'DELETE',
      }),
    }),
    updateStatus: builder.mutation<DynamicCategoryResponse, { id: number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `dynamiccategory/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
    }),
  }),
});

export const {
  useGetCategoriesByGroupQuery,
  useGetAllQuery,
  useGetByIdQuery,
  useGetByNameOrCategoryGroupQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useUpdateStatusMutation,
} = dynamicCategoryApi;
