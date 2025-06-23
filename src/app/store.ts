import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { taskApi } from '../services/taskApi'; 
import { milestoneApi } from '../services/milestoneApi';
import { sprintApi } from '../services/sprintApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [milestoneApi.reducerPath]: milestoneApi.reducer,
    [sprintApi.reducerPath]: sprintApi.reducer,
    // Thêm các slice khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware , taskApi.middleware, milestoneApi.middleware, sprintApi.middleware),
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;