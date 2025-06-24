import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { authApi } from '../services/authApi';
import { accountApi } from '../services/accountApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer, 
    // Thêm các slice khác nếu có
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware,  authApi.middleware,accountApi.middleware),
});

// Kiểu cho RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;