import axios from "axios";
import Cookies from "js-cookie";

const CATEGORY_BASE_URL = "https://localhost:7287/api/Categories";

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get("token");
  return token ? `Bearer ${token}` : null;
};

// Global error handler for consistent error management
const handleError = (error, action) => {
  console.error(`${action} Error:`, error);
  if (error.response) {
    console.error("Response Data:", error.response.data);
    throw new Error(`${action}: ${error.response.data.message || "Server Error"}`);
  } else if (error.request) {
    console.error("Request Error:", error.request);
    throw new Error(`${action}: No response received from the server.`);
  } else {
    console.error("Request Setup Error:", error.message);
    throw new Error(`${action}: ${error.message || "Unknown Error"}`);
  }
};

// Get all categories
// Get all categories
export const getCategories = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found, please log in again.");
    const response = await axios.get(`${CATEGORY_BASE_URL}/all-categories`, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    handleError(error, "Fetching Categories");
  }
};


// Create a new category
export const createCategory = async (category) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found, please log in again.");
    const response = await axios.post(CATEGORY_BASE_URL, category, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    handleError(error, "Creating New Category");
  }
};

// Update an existing category
export const updateCategory = async (id, category) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found, please log in again.");
    const response = await axios.put(`${CATEGORY_BASE_URL}/${id}`, category, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    handleError(error, "Updating Category");
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found, please log in again.");
    await axios.delete(`${CATEGORY_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
  } catch (error) {
    handleError(error, "Deleting Category");
  }
};
