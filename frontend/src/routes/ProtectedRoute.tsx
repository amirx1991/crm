import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/hooks/useAuth';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    console.log('Not authenticated, redirecting to sign-in');
    return <Navigate to="/sign-in" state={{ redirectUrl: window.location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 