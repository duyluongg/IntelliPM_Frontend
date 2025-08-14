// services/documentPermissionApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';

export type PermissionType = 'VIEW' | 'EDIT';

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
};

export interface UpdatePermissionTypeRequest {
  documentId: number;

  permissionType: PermissionType;
}

export type UpdatePermissionTypeData = {
  documentId: number;

  permissionType: PermissionType | string;
};

export interface SharedUserDTO {
  accountId: number;
  email: string;
  fullName: string;
  permissionType: 'VIEW' | 'EDIT';
}


export const documentPermissionApi = createApi({
  reducerPath: 'documentPermissionApi',
  tagTypes: ['DocumentsPermission'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const token = user?.accessToken;
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    updatePermissionType: builder.mutation<
      ApiResponse<UpdatePermissionTypeData>,
      UpdatePermissionTypeRequest
    >({
      query: (body) => ({
        url: '/document-permissions/update-permission-type',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (res, err, arg) => [{ type: 'DocumentsPermission', id: arg.documentId }],
    }),

    getSharedUsersByDocument: builder.query<ApiResponse<SharedUserDTO[]>, number>({
      query: (documentId) => ({
        url: `document-permissions/shared-users`,
        method: 'GET',
        params: { documentId },
      }),
      providesTags: (result, error, documentId) => [
        { type: 'DocumentsPermission', id: documentId },
      ],
    }),
  }),
});

export const {
  useUpdatePermissionTypeMutation,
  useGetSharedUsersByDocumentQuery,
} = documentPermissionApi;
