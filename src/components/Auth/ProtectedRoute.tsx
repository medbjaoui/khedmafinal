import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { restoreUserSession } from '../../store/slices/authSlice';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'User' | 'Premium';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector(state => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Try to restore session if not authenticated
    if (!isAuthenticated && !loading) {
      dispatch(restoreUserSession());
    }
  }, [dispatch, isAuthenticated, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // For Admin routes, redirect to admin dashboard if trying to access user routes
    if (requiredRole === 'Admin' && user?.role !== 'Admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
            <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
    
    // For user routes, redirect to admin dashboard if admin is trying to access
    if (user?.role === 'Admin' && !requiredRole) {
      return <Navigate to="/admin/users" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;