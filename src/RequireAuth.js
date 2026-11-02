import React from 'react';
 
import useAuth from './utilities/useAuth'; // Import the default export

import { useLocation, Navigate } from 'react-router-dom'; // Assuming you are using react-router-dom

const RequireAuth = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    console.error("user not found")
    console.error(auth.user)
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }else{
    console.error("user found")
  }

  return children;
};

export default RequireAuth;
