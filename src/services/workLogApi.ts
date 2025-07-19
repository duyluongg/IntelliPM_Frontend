import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';

export interface AccountInfo {
  id: number;
  username: string;
  fullName: string;
}

export interface WorkLogItem {
  id: number;
  taskId: string | null;
  subtaskId: string | null;
  logDate: string;
  hours: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  accounts?: AccountInfo[];
}

export interface GetWorkLogsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: WorkLogItem[];
}

interface ChangeWorklogHoursRequest {
  [workLogId: number]: number;
}

interface ApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  data: WorkLogItem[];
}

interface WorkLogEntry {
  accountId: number;
  hours: number;
}

interface UpdateWorkLogByAccountsRequest {
  taskId: string;
  workLogs: {
    workLogId: number;
    entries: WorkLogEntry[];
  }[];
}

export const workLogApi = createApi({
  reducerPath: 'workLogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('accept', '*/*');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWorkLogsBySubtaskId: builder.query<GetWorkLogsResponse, string>({
      query: (subtaskId) => ({
        url: `worklog/by-task-or-subtask?subtaskId=${subtaskId}`,
        method: 'GET',
      }),
    }),
    getWorkLogsByTaskId: builder.query<GetWorkLogsResponse, string>({
      query: (taskId) => ({
        url: `worklog/by-task-or-subtask?taskId=${taskId}`,
        method: 'GET',
      }),
    }),
    changeMultipleWorklogHours: builder.mutation<ApiResponse, ChangeWorklogHoursRequest>({
      query: (body) => ({
        url: `worklog/change-multiple-hours`,
        method: 'PUT',
        body,
      }),
    }),
    updateWorkLogByAccounts: builder.mutation<ApiResponse, UpdateWorkLogByAccountsRequest>({
      query: (body) => ({
        url: `worklog/update-by-accounts`,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetWorkLogsBySubtaskIdQuery,
  useGetWorkLogsByTaskIdQuery,
  useChangeMultipleWorklogHoursMutation,
  useUpdateWorkLogByAccountsMutation,
} = workLogApi;
