import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';

interface FormField {
  id: number;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
  options?: any;
  required: boolean;
  order: number;
}

interface Form {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  fields: FormField[];
}

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormState = {
  forms: [],
  currentForm: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/forms/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'خطا در دریافت فرم‌ها');
    }
  }
);

export const fetchFormDetails = createAsyncThunk(
  'forms/fetchFormDetails',
  async (formId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/forms/${formId}/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'خطا در دریافت جزئیات فرم');
    }
  }
);

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Forms
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Form Details
      .addCase(fetchFormDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchFormDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentForm } = formSlice.actions;
export default formSlice.reducer; 