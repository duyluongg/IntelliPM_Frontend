import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Định nghĩa kiểu dữ liệu trả về từ API
export interface Post {
  id: number;
  title: string;
  body: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => 'posts',
    }),
  }),
});

export const { useGetPostsQuery } = api;