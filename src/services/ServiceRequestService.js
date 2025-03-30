import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Base URL for ServiceRequests
const SERVICE_REQUEST_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7287/api/ServiceRequests';

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get('token');
  if (!token) {
    throw new Error('Authorization token not found in cookies!');
  }
  return `Bearer ${token}`;
};

// Global error handler for consistent error management
const handleError = (error, customMessage) => {
  console.error(`${customMessage} Error:`, error);

  if (error.response) {
    // Server responded with error
    console.error('Response Data:', error.response.data);
    console.error('Response Status:', error.response.status);
    toast.error(`${customMessage}: ${error.response.data.message || 'Server Error'}`);
    throw new Error(`${customMessage}: ${error.response.data.message || 'Server Error'}`);
  } else if (error.request) {
    // No response received
    console.error('Request Error:', error.request);
    toast.error(`${customMessage}: No response received from the server.`);
    throw new Error(`${customMessage}: No response received from the server.`);
  } else {
    // Error during request setup
    console.error('Request Setup Error:', error.message);
    toast.error(`${customMessage}: ${error.message || 'Unknown Error'}`);
    throw new Error(`${customMessage}: ${error.message || 'Unknown Error'}`);
  }
};

// Fetch all service requests
export const getServiceRequests = async () => {
  try {
    const token = getToken();
    const response = await axios.get(SERVICE_REQUEST_BASE_URL, {
      headers: { Authorization: token },
    });
    console.log('Fetched Service Requests:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching Service Requests');
  }
};



// Fetch a service request by ID
export const getServiceRequestById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${SERVICE_REQUEST_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Service Request [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Fetching Service Request by ID');
  }
};

// Create a new service request
export const createServiceRequest = async (serviceRequestData) => {
  try {
    const token = getToken();
    const response = await axios.post(SERVICE_REQUEST_BASE_URL, serviceRequestData, {
      headers: { Authorization: token },
    });
    console.log('Created New Service Request:', response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Creating Service Request');
  }
};

// Update an existing service request
export const updateServiceRequest = async (serviceId, serviceRequestData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${SERVICE_REQUEST_BASE_URL}/${serviceId}`, serviceRequestData, {
      headers: { Authorization: token },
    });
    console.log(`Updated Service Request [ID: ${serviceId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, 'Updating Service Request');
  }
};

// Delete a service request
export const deleteServiceRequest = async (serviceId) => {
  try {
    const token = getToken();
    await axios.delete(`${SERVICE_REQUEST_BASE_URL}/${serviceId}`, {
      headers: { Authorization: token },
    });
    console.log(`Deleted Service Request [ID: ${serviceId}]`);
    return { message: 'Service request deleted successfully' };
  } catch (error) {
    handleError(error, 'Deleting Service Request');
  }
};
