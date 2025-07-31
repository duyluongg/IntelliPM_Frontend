import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/api';

export const documentExportApi = createApi({
  reducerPath: 'documentExportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
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

  endpoints: (builder) => ({
    exportDocument: builder.mutation<{ fileUrl: string }, { documentId: number; file: File }>({
      query: ({ documentId, file }) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: `documentexportfile/${documentId}/export`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    
    lookupDocumentByFileUrl: builder.query<any, string>({
      query: (fileUrl) => `document-export/lookup?fileUrl=${encodeURIComponent(fileUrl)}`,
    }),
    sendMeetingDocumentShareEmail: builder.mutation<
      void,
      {
        documentId: number;
        userIds: number[];
        fileUrl: string;
        customMessage: string;
      }
    >({
      query: (body) => ({
        url: `document-export/share`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useExportDocumentMutation,
  useLookupDocumentByFileUrlQuery,
  useSendMeetingDocumentShareEmailMutation,
} = documentExportApi;
