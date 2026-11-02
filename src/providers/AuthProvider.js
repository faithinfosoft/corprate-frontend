import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import globalVariables from '../Global.js';
import { useLocation, useNavigate } from 'react-router-dom';

// Create the AuthContext with a default value of null
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let location = useLocation();
  
  // Get the stored path or use current path
  const storedFrom = localStorage.getItem('from');
  const initialFrom = location.state?.from?.pathname || storedFrom || "/";
  const [from, setFrom] = useState(initialFrom);
      
  const verifyServerToken = (token) => {
    console.log(token);
    return new Promise((resolve, reject) => {
      const form_data = { token };
      axios.post(globalVariables.api_url + '/TokenAuthentication/isToken_Authorized', form_data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
    });
  };

  useEffect(() => {
    const token = Cookies.get('token');
    
    console.log("token loading");
    console.log(token);
    
    if (token) {
      console.log('Token found, verifying server token...');
      
      verifyServerToken(token)
        .then(response_data => {
          Cookies.set('token', response_data.token, {expires: 365, sameSite: 'None', secure: true });
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${response_data.token}`;
          
          // Set user without navigation in the authentication process
          setUser(response_data.user);
          
          // Only navigate if we're at the login page or root
          if (location.pathname === '/login' || location.pathname === '/') {
            navigate(from, { replace: true });
          }
        })
        .catch(error => {
          console.error('Error in verifyServerToken:', error);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const signin = (user, callback) => {
    console.log(user);
    setUser(user);
    
    // Only call the callback once
    callback();
    console.log("login successful");
  };
    
  const signout = (callback) => {
    setUser(null);
    localStorage.removeItem('from');
    Cookies.remove('token');
    
    // Navigate after clearing user state
    navigate('/', { replace: true });
    callback();
  };
  
  const value = { user, signin, signout };

  if (loading) {
    return <div>Loading...</div>; // Render a loading indicator while verifying
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };