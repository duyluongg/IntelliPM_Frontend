import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { taskApi } from '../services/taskApi'; 
import { milestoneApi } from '../services/milestoneApi';
import { sprintApi } from '../services/sprintApi';
import { accountApi } from '../services/accountApi';
import { meetingApi } from '../services/ProjectManagement/MeetingServices/MeetingServices'; 
import { meetingLogApi } from '../services/ProjectManagement/MeetingServices/MeetingLogServices'; 
import { projectMetricApi } from '../services/projectMetricApi';
import { subtaskApi } from '../services/subtaskApi';
import { projectApi } from '../services/projectApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [milestoneApi.reducerPath]: milestoneApi.reducer,
    [sprintApi.reducerPath]: sprintApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [meetingApi.reducerPath]: meetingApi.reducer, 
    [meetingLogApi.reducerPath]: meetingLogApi.reducer, 
    [projectMetricApi.reducerPath]: projectMetricApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,

    [meetingApi.reducerPath]: meetingApi.reducer,
    [subtaskApi.reducerPath]: subtaskApi.reducer,
    // Thêm các slice khác nếu có
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      authApi.middleware,
      taskApi.middleware, 
      milestoneApi.middleware, 
      sprintApi.middleware,
      accountApi.middleware,
      meetingApi.middleware ,
      meetingLogApi.middleware,
      projectMetricApi.middleware,
      subtaskApi.middleware
      projectApi.middleware
    ),
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
