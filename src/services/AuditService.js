import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Base URL for Audit APIs
const AUDIT_BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7287/api/Audits";

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get("token");
  return token ? `Bearer ${token}` : null;
};

// Global error handler
const handleAxiosError = (error) => {
  if (error.response) {
    console.error("Server Error:", error.response.data);
    toast.error(error.response.data.message || "Server Error");
  } else if (error.request) {
    console.error("No response received:", error.request);
    toast.error("No response received from the server.");
  } else {
    console.error("Request Setup Error:", error.message);
    toast.error(error.message || "Unknown Error");
  }

  if (error.response && error.response.status === 401) {
    toast.error("Session expired. Please log in again.");
    // Add redirect to login or logout logic if needed
  }

  throw error;
};

// Get all audits
export const getAudits = async () => {
  try {
    const token = getToken();
    const response = await axios.get(AUDIT_BASE_URL, {
      headers: { Authorization: token },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Fetched Audits:", response.data);
    }

    return Array.isArray(response.data?.$values) ? response.data.$values : response.data;
  } catch (error) {
    handleAxiosError(error);
    return [];
  }
};

// Get all allocated assets in audits
export const getAllocatedAssets = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${AUDIT_BASE_URL}/allocated-assets`, {
      headers: { Authorization: token },
    });

    console.log("Fetched Allocated Assets in Audits:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Create a new audit
export const createAudit = async (audit) => {
  try {
    const token = getToken();
    const response = await axios.post(AUDIT_BASE_URL, audit, {
      headers: { Authorization: token },
    });

    console.log("Created New Audit:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get all audits (alternative endpoint)
export const getAllAudits = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${AUDIT_BASE_URL}/All`, {
      headers: { Authorization: token },
    });

    console.log("Fetched All Audits (Alternative):", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get audit by ID
export const getAuditById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${AUDIT_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });

    console.log(`Fetched Audit [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get audit details by ID (alternative route)
export const getAuditDetailsById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${AUDIT_BASE_URL}/Audis/${id}`, {
      headers: { Authorization: token },
    });

    console.log(`Fetched Audit Details [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Update an existing audit
export const updateAudit = async (id, audit) => {
  try {
    const token = getToken();
    const response = await axios.put(`${AUDIT_BASE_URL}/${id}`, audit, {
      headers: { Authorization: token },
    });

    console.log(`Updated Audit [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Delete an audit
export const deleteAudit = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${AUDIT_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });

    console.log(`Deleted Audit [ID: ${id}]`);
    return { message: "Audit deleted successfully" };
  } catch (error) {
    handleAxiosError(error);
  }
};
