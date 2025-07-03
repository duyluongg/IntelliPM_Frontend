// src/services/dynamicCategoryApi.ts
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
  }),
});

export const { useGetCategoriesByGroupQuery } = dynamicCategoryApi;
