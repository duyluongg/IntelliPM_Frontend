import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface SystemConfiguration {
  id: number;
  configKey: string;
  valueConfig: string;
  minValue: string | null;
  maxValue: string | null;
  estimateValue: string | null;
  description: string;
  note: string | null;
  effectedFrom: string;
  effectedTo: string | null;
}

export interface SystemConfigurationResponse {
  isSuccess: boolean;
  code: number;
  data: SystemConfiguration | SystemConfiguration[] | null;
  message: string;
}

export interface SystemConfigurationSingleResponse {
  isSuccess: boolean;
  code: number;
  data: SystemConfiguration | null;
  message: string;
}

export interface SystemConfigurationRequest {
  configKey: string;
  valueConfig: string;
  minValue?: string | null;
  maxValue?: string | null;
  estimateValue?: string | null;
  description: string;
  note?: string | null;
  effectedFrom: string;
  effectedTo?: string | null;
}

export const systemConfigurationApi = createApi({
  reducerPath: 'systemConfigurationApi',
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
    getAll: builder.query<SystemConfigurationResponse, void>({
      query: () => 'systemconfiguration',
    }),
    getById: builder.query<SystemConfigurationSingleResponse, number>({
      query: (id) => `systemconfiguration/${id}`,
    }),
    getByConfigKey: builder.query<SystemConfigurationSingleResponse, string>({
      query: (configKey) => `systemconfiguration/by-config-key?configKey=${configKey}`,
    }),
    create: builder.mutation<SystemConfigurationSingleResponse, SystemConfigurationRequest>({
      query: (request) => ({
        url: 'systemconfiguration',
        method: 'POST',
        body: request,
      }),
    }),
    update: builder.mutation<SystemConfigurationSingleResponse, { id: number; request: SystemConfigurationRequest }>({
      query: ({ id, request }) => ({
        url: `systemconfiguration/${id}`,
        method: 'PUT',
        body: request,
      }),
    }),
    delete: builder.mutation<SystemConfigurationSingleResponse, number>({
      query: (id) => ({
        url: `systemconfiguration/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useGetByConfigKeyQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = systemConfigurationApi;