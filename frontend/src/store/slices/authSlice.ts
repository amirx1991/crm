import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';

interface User {
  id: number | null;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isStaff?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks (مثل قبل)
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { username, password } = credentials;
      const loginData = { username, password };

      const response = await axiosInstance.post('/api/token/', loginData);
      const { access, refresh, user_id, first_name, last_name, is_staff } = response.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);

      const user: User = {
        id: user_id ?? null,
        username,
        firstName: first_name,
        lastName: last_name,
        isStaff: is_staff,
      };

      return {
        success: true,
        token: access,
        user,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'خطا در ورود به سیستم');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('توکن بازیابی یافت نشد');

      const response = await axiosInstance.post('/api/token/refresh/', { refresh });
      const { access } = response.data;
      localStorage.setItem('token', access);
      return access;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'خطا در بازیابی توکن');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // این action به ما اجازه می‌دهد هر منبع (مثل OTP) بعد از موفقیت، مستقیماً استور را بروز کند
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    // در صورت نیاز می‌توان setUser یا resetAuth اضافه کرد
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { clearError, setCredentials, resetAuth } = authSlice.actions;
export default authSlice.reducer;
