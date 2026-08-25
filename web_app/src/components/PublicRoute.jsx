import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;
  }

  if (isAuthenticated) {
    // If the user is logged in and tries to access login/register, redirect to dashboard or landing page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
