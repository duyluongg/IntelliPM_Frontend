import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  isSuccess: boolean;
  code: number;
  data: {
    id: number;
    username: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// ... existing code ...
interface LogoutRequest {
  refreshToken: string;
}

interface LogoutResponse {
  isSuccess: boolean;
  code: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl : API_BASE_URL }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: 'auth/logout',
        method: 'POST',
        body,
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;