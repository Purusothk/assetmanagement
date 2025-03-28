import axiosInstance from '../api/axiosInstance'; 
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Save token to cookies and local storage
const saveToken = (token) => {
  localStorage.setItem('token', token);
  Cookies.set('token', token, { expires: 7 }); 
};

// Decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

// Login function
export const login = async (UserName, password) => {
  const loginData = {
    UserName,
    Password: password,
  };

  try {
    // Request to the backend for login
    const response = await axiosInstance.post('/Auth/login', loginData);
    const { token } = response.data;

    // Save token in cookies and localStorage
    saveToken(token); 
    
    // Decode the token to extract user info
    const decodedToken = decodeToken(token); 

    // Handle success message
    toast.success('Login successful!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Return the token and the decoded token for use
    return { token, decodedToken };
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Invalid credentials';
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    throw new Error(errorMessage);
  }
};

// Register function
export const register = async (userDetails) => {
  try {
    await axiosInstance.post('/Users', userDetails);

    toast.success('Registration successful! Please login.', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Registration failed';
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    throw new Error(errorMessage);
  }
};

// Logout function
export const logout = () => {
  // Remove token from localStorage and Cookies
  localStorage.removeItem('token');
  Cookies.remove('token');
  
  // Toast notification for logout
  toast.info('You have been logged out.', {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Utility: Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  if (token) {
    const decodedToken = decodeToken(token);
    // Check if the decoded token is valid and not expired
    if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
      return true; // Token is valid
    }
    logout(); // Token expired, log out the user
  }
  return false;
};

// Utility: Get the current user from the token
export const getCurrentUser = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  return token ? decodeToken(token) : null;
};

// Utility: Refresh token (optional, depends on your backend implementation)
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token') || Cookies.get('token');
    if (token) {
      // Call your backend refresh token API
      const response = await axiosInstance.post('/Auth/refresh', { token });
      const { newToken } = response.data;

      if (newToken) {
        saveToken(newToken);
        return newToken;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
  }
};

// Utility: Clear all user-related data
export const clearUserData = () => {
  localStorage.removeItem('token');
  Cookies.remove('token');
  // Optionally, you can also clear other user-related data here, like settings.
};

