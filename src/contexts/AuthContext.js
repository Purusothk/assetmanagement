import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import { login as loginService, register as registerService } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    loginTime: null, // Added loginTime here
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        } else {
          setAuthState({
            token,
            user: decodedToken,
            loginTime: new Date(decodedToken.iat * 1000).toLocaleString(), // Set loginTime from token's 'iat' (issued at) field
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
  }, []);

  const login = async (username, password) => {
    try {
      const token = await loginService(username, password);
      Cookies.set('token', token, { secure: true });
      const decodedToken = jwtDecode(token);
      setAuthState({
        token,
        user: decodedToken,
        loginTime: new Date(decodedToken.iat * 1000).toLocaleString(), // Set loginTime when user logs in
      });

      toast.success(`Welcome, ${decodedToken.name}!`);
      decodedToken.role === 'Admin'
        ? navigate('/admin/Dashboard')
        : navigate('/EmpDashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed.');
      throw new Error(error.message);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setAuthState({ token: null, user: null, loginTime: null }); // Reset loginTime on logout
    navigate('/');
    toast.info('Logged out successfully.');
  };

  const register = async (userDetails) => {
    try {
      await registerService(userDetails);
      navigate('/');
      toast.success('Registration successful! Please login.');
    } catch (error) {
      toast.error('Registration failed: ' + error.message);
      console.error('Registration failed:', error);
    }
  };

  const isAuthenticated = !!authState.token;

  return (
    <AuthContext.Provider value={{ authState, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
