import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const USERS_BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7287/api/Users";

// Helper to retrieve token
const getToken = () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Authorization token not found in cookies!");
  }
  return `Bearer ${token}`;
};

// Error handler for consistency
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

// Fetch all users
export const fetchUsers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(USERS_BASE_URL, {
      headers: { Authorization: token },
    });
    console.log("Fetched Users:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching Users");
  }
};

// Fetch user by ID
export const fetchUserById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${USERS_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched User [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching User by ID");
  }
};

// Fetch user role
export const fetchUserRole = async () => {
  try {
    const token = getToken();
    if (!token) return null; // Return early if no token

    const response = await axios.get(`${USERS_BASE_URL}/role`, {
      headers: { Authorization: token },
    });

    console.log("Fetched User Role:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching User Role");
  }
};


// Fetch user profile
export const fetchUserProfile = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${USERS_BASE_URL}/profile`, {
      headers: { Authorization: token },
    });
    console.log("Fetched User Profile:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching User Profile");
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const token = getToken();
    const response = await axios.post(USERS_BASE_URL, userData, {
      headers: { Authorization: token },
    });
    console.log("Created User:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Creating User");
  }
};

// Update user details
export const updateUser = async (id, userData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${USERS_BASE_URL}/${id}`, userData, {
      headers: { Authorization: token },
    });
    console.log(`Updated User [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Updating User");
  }
};

// Update user password
export const updateUserPassword = async (id, passwordData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${USERS_BASE_URL}/${id}/password`, passwordData, {
      headers: { Authorization: token },
    });
    console.log(`Updated Password for User [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Updating User Password");
  }
};

// Upload user profile image
export const uploadUserProfileImage = async (userId, imageData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${USERS_BASE_URL}/${userId}/upload`, imageData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(`Uploaded Profile Image for User [ID: ${userId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Uploading User Profile Image");
  }
};

// Fetch user profile image
export const fetchUserProfileImage = async (userId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${USERS_BASE_URL}/${userId}/profileImage`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Profile Image for User [ID: ${userId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Fetching User Profile Image");
  }
};

// Delete user by ID
export const deleteUser = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${USERS_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Deleted User [ID: ${id}]`);
    return { message: "User deleted successfully" };
  } catch (error) {
    handleError(error, "Deleting User");
  }
};
