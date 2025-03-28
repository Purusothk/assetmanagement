import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Base URL for Maintenance Logs
const MAINTENANCE_LOG_BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7287/api/MaintenanceLogs";

// Retrieve token from cookies
const getToken = () => {
  const token = Cookies.get("token");
  return token ? `Bearer ${token}` : null;
};

// Global error handler for consistent error management
const handleError = (error, action) => {
  console.error(`${action} Error:`, error);
  if (error.response) {
    console.error("Response Data:", error.response.data);
    console.error("Response Status:", error.response.status);
    toast.error(`${action}: ${error.response.data.message || "Server Error"}`);
    throw new Error(`${action}: ${error.response.data.message || "Server Error"}`);
  } else if (error.request) {
    console.error("Request Error:", error.request);
    toast.error(`${action}: No response received from the server.`);
    throw new Error(`${action}: No response received from the server.`);
  } else {
    console.error("Request Setup Error:", error.message);
    toast.error(`${action}: ${error.message || "Unknown Error"}`);
    throw new Error(`${action}: ${error.message || "Unknown Error"}`);
  }
};

// Get all maintenance logs
export const getMaintenanceLogs = async () => {
  try {
    const token = getToken();
    const response = await axios.get(MAINTENANCE_LOG_BASE_URL, {
      headers: { Authorization: token },
    });
    console.log("Fetched Maintenance Logs:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching Maintenance Logs");
  }
};

// Get all logs (alternative route)
export const getAllMaintenanceLogs = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${MAINTENANCE_LOG_BASE_URL}/AllLog`, {
      headers: { Authorization: token },
    });
    console.log("Fetched All Maintenance Logs:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching All Maintenance Logs");
  }
};

// Get maintenance log by specific ID
export const getMaintenanceLogById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${MAINTENANCE_LOG_BASE_URL}/id/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Maintenance Log [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching Maintenance Log by ID");
  }
};

// Get maintenance logs by user ID
export const getMaintenanceLogsByUserId = async (userId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${MAINTENANCE_LOG_BASE_URL}/${userId}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Maintenance Logs for User [ID: ${userId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching Maintenance Logs by User ID");
  }
};

// Create a new maintenance log
export const createMaintenanceLog = async (maintenanceLog) => {
  try {
    const token = getToken();
    const response = await axios.post(MAINTENANCE_LOG_BASE_URL, maintenanceLog, {
      headers: { Authorization: token },
    });
    console.log("Created New Maintenance Log:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Creating Maintenance Log");
  }
};

// Update an existing maintenance log
export const updateMaintenanceLog = async (id, maintenanceLog) => {
  try {
    const token = getToken();
    const response = await axios.put(`${MAINTENANCE_LOG_BASE_URL}/${id}`, maintenanceLog, {
      headers: { Authorization: token },
    });
    console.log(`Updated Maintenance Log [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Updating Maintenance Log");
  }
};

// Delete a maintenance log
export const deleteMaintenanceLog = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${MAINTENANCE_LOG_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Deleted Maintenance Log [ID: ${id}]`);
    return { message: "Maintenance log deleted successfully" };
  } catch (error) {
    handleError(error, "Deleting Maintenance Log");
  }
};
