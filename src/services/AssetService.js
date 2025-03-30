import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

// Asset Base URL
const ASSET_BASE_URL = "https://localhost:7287/api/Assets";

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
  throw error;
};

// Get all assets
export const getAssets = async () => {
  try {
    const token = getToken();
    const response = await axios.get(ASSET_BASE_URL, {
      headers: { Authorization: token },
    });
    console.log("Fetched Assets:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Create a new asset
export const createAsset = async (asset) => {
  try {
    const token = getToken();
    const response = await axios.post(ASSET_BASE_URL, asset, {
      headers: { Authorization: token },
    });
    console.log("Created New Asset:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get all assets (alternative endpoint)
export const getAllAssets = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/assetall`, {
      headers: { Authorization: token },
    });
    console.log("Fetched All Assets (Alternative Endpoint):", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get asset details
export const getAssetDetails = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/Details`, {
      headers: { Authorization: token },
    });
    console.log("Fetched Asset Details:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const createAssetWithName = async (asset) => {
  try {
    const token = getToken();
    
    // Fetch all assets to map the assetId to assetName
    const assets = await getAssets(); // You can replace this with your logic to get the list of assets

    // Find the asset name using the assetId
    const assetDetails = assets.find(a => a.assetId === asset.assetId);

    // If asset is not found, handle the error
    if (!assetDetails) {
      toast.error("Asset not found for the provided ID.");
      return;
    }

    // Replace assetId with the assetName in the request payload
    const updatedAsset = {
      ...asset,
      assetName: assetDetails.assetName,  // Adding the asset name
      assetId: undefined  // Optionally remove assetId if not needed
    };

    // Send the request with the assetName
    const response = await axios.post(ASSET_BASE_URL, updatedAsset, {
      headers: { Authorization: token },
    });

    console.log("Created New Asset:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get assets by name
export const getAssetsByName = async (name) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/ByAssetName/${name}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Assets by Name [Name: ${name}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get assets by price range
export const getAssetsByPriceRange = async (minPrice, maxPrice) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${ASSET_BASE_URL}/PriceRange?minPrice=${minPrice}&maxPrice=${maxPrice}`,
      {
        headers: { Authorization: token },
      }
    );
    console.log(`Fetched Assets by Price Range [Min: ${minPrice}, Max: ${maxPrice}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get assets by location
export const getAssetsByLocation = async (location) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/ByAssetLocation/${location}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Assets by Location [Location: ${location}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get assets by status
export const getAssetsByStatus = async (status) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/Status?status=${status}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Assets by Status [Status: ${status}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get a specific asset by ID
export const getAssetById = async (id) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Fetched Asset [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Update an existing asset
export const updateAsset = async (id, asset) => {
  console.log(`Sending update request for asset [ID: ${id}] with data:`, asset);
  try {
    const token = getToken();
    const response = await axios.put(`${ASSET_BASE_URL}/${id}`, asset, {
      headers: { Authorization: token },
    });
    console.log(`Updated Asset [ID: ${id}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};



// Delete an asset
export const deleteAsset = async (id) => {
  try {
    const token = getToken();
    await axios.delete(`${ASSET_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    console.log(`Deleted Asset [ID: ${id}]`);
  } catch (error) {
    handleAxiosError(error);
  }
};

// Upload an image for an asset
export const uploadAssetImage = async (assetId, imageFile) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await axios.post(`${ASSET_BASE_URL}/upload-image/${assetId}`, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(`Uploaded Image for Asset [ID: ${assetId}]:`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Get an image for an asset
export const getAssetImage = async (assetId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${ASSET_BASE_URL}/get-image/${assetId}`, {
      headers: { Authorization: token },
      responseType: "blob", // Return the image as a binary file
    });
    console.log(`Fetched Image for Asset [ID: ${assetId}]`);
    return URL.createObjectURL(response.data); // Create a URL for the image
  } catch (error) {
    handleAxiosError(error);
  }
};
