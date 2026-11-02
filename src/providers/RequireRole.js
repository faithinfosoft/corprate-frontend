import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

const RequireRole = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  let location = useLocation();

  if (!user || !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireRole;
