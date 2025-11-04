import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // Redirect to dashboard if not admin but admin required
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;