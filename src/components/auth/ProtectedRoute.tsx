import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'user' | 'subscribed' | 'admin';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType, 
  fallbackPath = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check user type requirements
  if (requiredUserType) {
    const userTypeHierarchy = {
      'guest': 0,
      'user': 1,
      'subscribed': 2,
      'admin': 3
    };

    const userLevel = userTypeHierarchy[user.user_type] || 0;
    const requiredLevel = userTypeHierarchy[requiredUserType];

    if (userLevel < requiredLevel) {
      // Redirect to appropriate page based on user type
      if (user.user_type === 'guest') {
        return <Navigate to="/register" state={{ from: location }} replace />;
      } else if (user.user_type === 'user') {
        return <Navigate to="/subscription" state={{ from: location }} replace />;
      } else {
        return <Navigate to="/profile" state={{ from: location }} replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
