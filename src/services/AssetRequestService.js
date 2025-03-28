import axios from "axios";
import Cookies from "js-cookie";

// Base URL for asset requests API
const ASSET_REQUEST_BASE_URL = "https://localhost:7287/api/AssetRequests";

// Function to get the token dynamically from cookies
const getToken = () => {
  const token = Cookies.get("token");
  console.log("Token from cookies:", token);
  return token ? `Bearer ${token}` : null;
};

// Get all asset requests
export const getAssetRequests = async () => {
  try {
    const token = getToken();
    const response = await axios.get(ASSET_REQUEST_BASE_URL, {
      headers: {
        Authorization: token,
      },
    });
    console.log("Fetched All Asset Requests:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Fetching Asset Requests:", error);
    throw error;
  }
};

// Create a new asset request
export const createAssetRequest = async (request) => {
  try {
    const token = getToken();
    const response = await axios.post(ASSET_REQUEST_BASE_URL, request, {
      headers: {
        Authorization: token,
      },
    });
    console.log("Created New Asset Request:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Creating Asset Request:", error);
    throw error;
  }
};

// Update an existing asset request
export const updateAssetRequest = async (id, request) => {
  try {
    const token = getToken();
    const response = await axios.put(`${ASSET_REQUEST_BASE_URL}/${id}`, request, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Updated Asset Request [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Updating Asset Request [ID: ${id}]:`, error);
    throw error;
  }
};

// Delete an asset request
export const deleteAssetRequest = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${ASSET_REQUEST_BASE_URL}/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Deleted Asset Request [ID: ${id}]`);
  } catch (error) {
    console.error(`Error Deleting Asset Request [ID: ${id}]:`, error);
    throw error;
  }
};

// Get a specific asset request by ID
export const getAssetRequestById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_REQUEST_BASE_URL}/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Fetched Asset Request [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Fetching Asset Request [ID: ${id}]:`, error);
    throw error;
  }
};

// Filter asset requests by month
export const filterAssetRequestsByMonth = async (month) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_REQUEST_BASE_URL}/filter-by-month?month=${month}`, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Filtered Asset Requests by Month [Month: ${month}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Filtering Asset Requests by Month [Month: ${month}]:`, error);
    throw error;
  }
};

// Filter asset requests by year
export const filterAssetRequestsByYear = async (year) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_REQUEST_BASE_URL}/filter-by-year?year=${year}`, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Filtered Asset Requests by Year [Year: ${year}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Filtering Asset Requests by Year [Year: ${year}]:`, error);
    throw error;
  }
};

// Filter asset requests by month and year
export const filterAssetRequestsByMonthAndYear = async (month, year) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${ASSET_REQUEST_BASE_URL}/filter-by-month-and-year?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log(`Filtered Asset Requests by Month and Year [Month: ${month}, Year: ${year}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Filtering Asset Requests by Month and Year [Month: ${month}, Year: ${year}]:`, error);
    throw error;
  }
};

// Filter asset requests by date range
export const filterAssetRequestsByDateRange = async (startDate, endDate) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${ASSET_REQUEST_BASE_URL}/filter-by-date-range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log(`Filtered Asset Requests by Date Range [Start: ${startDate}, End: ${endDate}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Filtering Asset Requests by Date Range [Start: ${startDate}, End: ${endDate}]:`, error);
    throw error;
  }
};

// Get asset requests by status
export const getAssetRequestsByStatus = async (status) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_REQUEST_BASE_URL}/Status?status=${status}`, {
      headers: {
        Authorization: token,
      },
    });
    console.log(`Fetched Asset Requests by Status [Status: ${status}]:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error Fetching Asset Requests by Status [Status: ${status}]:`, error);
    throw error;
  }
};

// Get all asset requests (alternative endpoint)
export const getAllAssetRequests = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_REQUEST_BASE_URL}/GetAll`, {
      headers: {
        Authorization: token,
      },
    });
    console.log("Fetched All Asset Requests (Alternative Endpoint):", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Fetching All Asset Requests (Alternative Endpoint):", error);
    throw error;
  }
};
