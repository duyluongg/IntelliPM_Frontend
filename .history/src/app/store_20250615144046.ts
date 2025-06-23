import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    // Thêm các slice khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;