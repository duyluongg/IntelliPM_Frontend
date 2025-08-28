import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';

export const shareApi = createApi({
  // Tên của slice, dùng trong Redux state
  reducerPath: 'shareApi',

  // Cấu hình base query, tương tự như tạo instance axios
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // prepareHeaders tương tự như interceptor, dùng để gắn token vào mỗi request
    prepareHeaders: (headers) => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const token = user?.accessToken;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),

  // Định nghĩa các endpoints
  endpoints: (builder) => ({
    // Tên endpoint: verifyShareToken
    verifyShareToken: builder.mutation({
      // mutation dùng cho các request thay đổi dữ liệu (POST, PUT, DELETE)
      // query nhận vào đối số và trả về thông tin cho request
      query: (shareToken) => ({
        url: '/share/verify-token', // path của API
        method: 'POST',
        body: { token: shareToken }, // body của request
      }),
    }),
  }),
});

// RTK Query tự động tạo ra các hook dựa trên tên endpoints
// Đối với mutation, nó sẽ tạo ra hook có hậu tố là 'Mutation'
export const { useVerifyShareTokenMutation } = shareApi;
