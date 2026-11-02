import React, { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider'; // Assuming you have created the AuthContext

const useAuth = () => {
  return useContext(AuthContext);
}

export default useAuth;
