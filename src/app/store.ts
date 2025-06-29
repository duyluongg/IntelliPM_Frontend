import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { taskApi } from '../services/taskApi'; 
import { milestoneApi } from '../services/milestoneApi';
import { sprintApi } from '../services/sprintApi';
import { accountApi } from '../services/accountApi';
import { meetingApi } from '../services/ProjectManagement/MeetingServices/MeetingServices'; // ✅ THÊM DÒNG NÀY
import { subtaskApi } from '../services/subtaskApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [milestoneApi.reducerPath]: milestoneApi.reducer,
    [sprintApi.reducerPath]: sprintApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
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
      meetingApi.middleware, // ✅ THÊM DÒNG NÀY
      subtaskApi.middleware
    ),
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
