import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import formReducer from './slices/formSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/refreshToken/fulfilled',
          'forms/fetchForms/fulfilled',
          'forms/fetchFormDetails/fulfilled'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 