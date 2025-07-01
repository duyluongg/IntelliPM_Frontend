import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import type { Role } from '../services/AuthContext'; // Adjust the import path as necessary

type ProtectedRouteProps = {
  allowedRoles: Role[];
  children: JSX.Element;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />;
  }
  console.log('Current user:', user);
  console.log('Allowed roles:', allowedRoles);

  return children;
};

export default ProtectedRoute;
