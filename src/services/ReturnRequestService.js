import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Base URL for Return Requests
const RETURN_REQUEST_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7287/api/ReturnRequests';

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get('token');
  return token ? `Bearer ${token}` : null;
};

// Global error handler function for consistent error management
const handleError = (error, action) => {
  console.error(`${action} Error:`, error);
  if (error.response) {
    // Server responded with an error
    console.error('Response Data:', error.response.data);
    console.error('Response Status:', error.response.status);
    toast.error(`${action}: ${error.response.data.message || 'Server Error'}`);
    throw new Error(`${action}: ${error.response.data.message || 'Server Error'}`);
  } else if (error.request) {
    // No response received
    console.error('Request Error:', error.request);
    toast.error(`${action}: No response received from the server.`);
    throw new Error(`${action}: No response received from the server.`);
  } else {
    // Error during request setup
    console.error('Request Setup Error:', error.message);
    toast.error(`${action}: ${error.message || 'Unknown Error'}`);
    throw new Error(`${action}: ${error.message || 'Unknown Error'}`);
  }
};

// Get all return requests
export const getReturnRequests = async () => {
  try {
    const token = getToken();
    const response = await axios.get(RETURN_REQUEST_BASE_URL, {
      headers: { Authorization: token },
    });
    console.log("Fetched Return Requests:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching Return Requests');
  }
};

// Get all return requests (alternative route)
export const getAllReturnRequests = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${RETURN_REQUEST_BASE_URL}/all`, {
      headers: { Authorization: token },
    });
    console.log("Fetched All Return Requests:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching All Return Requests');
  }
};

// Get return request by specific return ID
export const getReturnRequestByReturnId = async (returnId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${RETURN_REQUEST_BASE_URL}/GetByReturnId/${returnId}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Return Request [Return ID: ${returnId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching Return Request by Return ID');
  }
};

// Get return request by ID
export const getReturnRequestById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${RETURN_REQUEST_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Return Request [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching Return Request by ID');
  }
};

// Create a new return request
export const createReturnRequest = async (returnRequest) => {
  try {
    const token = getToken();
    const response = await axios.post(RETURN_REQUEST_BASE_URL, returnRequest, {
      headers: { Authorization: token },
    });
    console.log("Created New Return Request:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Creating New Return Request');
  }
};

// Update an existing return request
export const updateReturnRequest = async (id, returnRequest) => {
  try {
    const token = getToken();
    const response = await axios.put(`${RETURN_REQUEST_BASE_URL}/${id}`, returnRequest, {
      headers: { Authorization: token },
    });
    console.log(`Updated Return Request [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Updating Return Request');
  }
};

// Delete a return request
export const deleteReturnRequest = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${RETURN_REQUEST_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Deleted Return Request [ID: ${id}]`);
    return { message: "Return request deleted successfully" };
  } catch (error) {
    handleError(error, 'Deleting Return Request');
  }
};
