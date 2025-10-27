import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, logout, refreshToken, clearError } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      console.log('Login successful:', result);
      return { success: true, ...result };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'خطا در ورود به سیستم'
      };
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    logout: () => dispatch(logout()),
    refreshToken: () => dispatch(refreshToken()),
    clearError: () => dispatch(clearError()),
  };
}; 