import axios from "axios";
import Cookies from "js-cookie";  

const SUBCATEGORY_BASE_URL = "https://localhost:7287/api/SubCategories";

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get("token");  
  return token ? `Bearer ${token}` : null;  
};

// Global error handler function for consistent error management
const handleError = (error, action) => {
  console.error(`${action} Error:`, error);  
  if (error.response) {
    // Server responded with an error
    console.error("Response Data:", error.response.data);
    console.error("Response Status:", error.response.status);
    throw new Error(`${action}: ${error.response.data.message || 'Server Error'}`);
  } else if (error.request) {
    // No response received
    console.error("Request Error:", error.request);
    throw new Error(`${action}: No response received from the server.`);
  } else {
    // Error during request setup
    console.error("Request Setup Error:", error.message);
    throw new Error(`${action}: ${error.message || 'Unknown Error'}`);
  }
};

// Get all subcategories
export const getSubCategories = async () => {
  try {
    const token = getToken();  
    const response = await axios.get(SUBCATEGORY_BASE_URL, {
      headers: { Authorization: token },  
    });
    return response.data;
  } catch (error) {
    handleError(error, "Fetching SubCategories");
  }
};

// Create a new subcategory
export const createSubCategory = async (subCategory) => {
  try {
    const token = getToken();  
    const response = await axios.post(SUBCATEGORY_BASE_URL, subCategory, {
      headers: { Authorization: token },  
    });
    return response.data;
  } catch (error) {
    handleError(error, "Creating New SubCategory");
  }
};

// Update an existing subcategory
export const updateSubCategory = async (id, subCategory) => {
  try {
    const token = getToken();  
    const response = await axios.put(`${SUBCATEGORY_BASE_URL}/${id}`, subCategory, {
      headers: { Authorization: token },  
    });
    return response.data;
  } catch (error) {
    handleError(error, "Updating SubCategory");
  }
};

// Delete a subcategory
export const deleteSubCategory = async (id) => {
  try {
    const token = getToken();  
    await axios.delete(`${SUBCATEGORY_BASE_URL}/${id}`, {
      headers: { Authorization: token },  
    });
  } catch (error) {
    handleError(error, "Deleting SubCategory");
  }
};
