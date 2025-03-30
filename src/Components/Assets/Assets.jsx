import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../services/AssetService";
import { getCategories } from "../../services/CategoryService";
import { getSubCategories } from "../../services/SubCategoryService";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import AssetRequestModal from "./AssetRequestModal";
import { toast } from "react-toastify"; 
import { createAssetRequest } from "../../services/AssetRequestService";

const Asset = () => {
  const [decoded, setDecoded] = useState(null);
  const [data, setData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [section, setSection] = useState("");
  const [newAsset, setNewAsset] = useState({
    AssetName: "",
    assetDescription: "",
    categoryId: "",
    assetRequestDto:"Pending",
    subCategoryId: "",
    assetImage: null,
    SerialNumber: "",
    Model: "",
    manufacturingDate: "",
    Location: "",
    value: 0,
    expiryDate: "",
    assetStatus: "Pending",
  });

  
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showCreateAssetForm, setShowCreateAssetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLogs, setActionLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
     fetchCategories();
    fetchSubCategories();
    checkUserRole();
  }, []);


  const openModal = (asset) => {
    console.log("Selected Asset:", asset); // Log the selected asset
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };
  
  
  
  const closeModal = () => { setIsModalOpen(false); setSelectedAsset(null); };


  const checkUserRole = () => {
    const token = Cookies.get("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setDecoded(decodedToken);
    }
  };

  const fetchAssets = async () => {
    try {
      const data = await getAssets();
      const categoriesData = await getCategories();
      const subCategoriesData = await getSubCategories();
  
      if (data && Array.isArray(data.$values) && categoriesData && subCategoriesData) {
        // Create a map of categories and subcategories
        const categoryMap = new Map();
        categoriesData.$values.forEach(category => {
          categoryMap.set(category.categoryId, category.categoryName);
        });
  
        const subCategoryMap = new Map();
        subCategoriesData.$values.forEach(subCategory => {
          subCategoryMap.set(subCategory.subCategoryId, subCategory.subCategoryName);
        });
  
        // Enrich assets with category and subcategory names
        const enrichedAssets = data.$values.map(asset => ({
          ...asset,
          categoryName: categoryMap.get(asset.categoryId) || "N/A",
          subCategoryName: subCategoryMap.get(asset.subCategoryId) || "N/A",
        }));
  
        setAssets(enrichedAssets);
        console.log("Fetched and Enriched Assets:", enrichedAssets); // Log for debugging
      } else {
        console.error("Fetched assets, categories, or subcategories data is not an array");
      }
    } catch (error) {
      console.error("Error fetching assets, categories, or subcategories:", error);
    }
  };
  

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (data && Array.isArray(data.$values)) {
        setCategories(data.$values);
      } else {
        logAction("Fetched categories data is not an array", "error");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      logAction("Error fetching categories", "error");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await getSubCategories(categoryId);
      if (response && response.$values) {
        setSubCategories(response.$values);
        logAction("Fetched subcategories successfully", "success");
      } else {
        setSubCategories([]);
        logAction("No subcategories found for the selected category", "info");
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      logAction("Error fetching subcategories", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setNewAsset((prev) => ({ ...prev, categoryId: selectedCategoryId }));
    fetchSubCategories(selectedCategoryId);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB size limit
      toast.error("Image size should not exceed 2MB");
      return;
    }
    
    setNewAsset((prevAsset) => ({ ...prevAsset, assetImage: file }));
  };

  const validateForm = () => {
    const errors = {};
    if (!newAsset.AssetName?.trim()) errors.AssetName = "Asset Name is required.";
    if (!newAsset.Model?.trim()) errors.Model = "Model is required.";
    if (!newAsset.SerialNumber?.trim()) errors.SerialNumber = "Serial Number is required.";
    if (!newAsset.Location?.trim()) errors.Location = "Location is required.";
    if (!newAsset.AssetReqReason?.trim()) errors.AssetReqReason = "Asset Request Reason is required."; // Add this validation
    if (!newAsset.Request_Status?.trim()) errors.Request_Status = "Request Status is required."; // Add this validation
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  

  const handleCreateAsset = async () => {
    // Ensure formData is initialized
    const formData = new FormData();
  
    // Log the newAsset object to verify data
    console.log(newAsset); 
  
    // Check if AssetReqReason and Request_Status are provided in the newAsset object
    if (!newAsset.AssetReqReason || !newAsset.Request_Status) {
      console.error("Both AssetReqReason and Request_Status are required");
      return; // Prevent submitting if these fields are missing
    }
  
    // Append the fields to formData
    formData.append("AssetName", newAsset.AssetName);
    formData.append("assetDescription", newAsset.assetDescription);
    formData.append("assetRequestDto", newAsset.assetRequestDto);
    formData.append("categoryId", newAsset.categoryId);
    formData.append("subCategoryId", newAsset.subCategoryId);
    formData.append("SerialNumber", newAsset.SerialNumber);
    formData.append("Model", newAsset.Model);
    formData.append("manufacturingDate", newAsset.manufacturingDate);
    formData.append("Location", newAsset.Location);
    formData.append("value", newAsset.value);
    formData.append("expiryDate", newAsset.expiryDate);
    formData.append("assetStatus", newAsset.assetStatus);
    formData.append("AssetReqReason", newAsset.AssetReqReason);
    formData.append("Request_Status", newAsset.Request_Status);
  
    if (newAsset.assetImage) {
      formData.append("assetImage", newAsset.assetImage);
    }
  
    try {
      const response = await fetch("https://localhost:7287/api/Assets", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
      } else {
        console.log("Asset created successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  
  
  
  

  const handleUpdateAsset = (assetId) => {
    const assetToUpdate = assets.find((asset) => asset.assetId === assetId);
    if (assetToUpdate) {
      setNewAsset({
        ...assetToUpdate,
        manufacturingDate: assetToUpdate.manufacturingDate.split("T")[0],
      });
      setShowCreateAssetForm(true);
    }
  };

  const sendUpdateRequest = async () => {
    if (!validateForm()) return;
  
    // Define formData here
    const formData = new FormData();
    formData.append("AssetId", newAsset.assetId);
    formData.append("AssetName", newAsset.AssetName);
    formData.append("AssetDescription", newAsset.assetDescription);
    formData.append("assetRequestDto", newAsset.assetRequestDto);
    formData.append("CategoryId", newAsset.categoryId);
    formData.append("SubCategoryId", newAsset.subCategoryId);
    formData.append("SerialNumber", newAsset.SerialNumber);
    formData.append("Model", newAsset.Model);
    formData.append("ManufacturingDate", newAsset.manufacturingDate);
    formData.append("Location", newAsset.Location);
    formData.append("Value", newAsset.value);
    formData.append("Expiry_Date", newAsset.expiryDate);
    formData.append("Asset_Status", newAsset.assetStatus);
    formData.append("AssetReqReason", newAsset.AssetReqReason);  // Add this line
    formData.append("Request_Status", newAsset.Request_Status);  // Add this line
    if (newAsset.assetImage) {
      formData.append("AssetImage", newAsset.assetImage);
    }
  
    try {
      const token = Cookies.get("token");
      const response = await fetch(`https://localhost:7287/api/Assets/${newAsset.assetId}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
      } else {
        console.log("Asset updated successfully!");
        toast.success("Asset updated successfully!");
        resetForm();
        setShowCreateAssetForm(false);
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error("Failed to update the asset.");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  
  

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      await deleteAsset(assetId);
      setAssets((prevAssets) =>
        prevAssets.filter((asset) => asset.assetId !== assetId)
      );
      toast.success("Asset deleted successfully!");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete the asset.");
    }
  };

  const resetForm = () => {
    setNewAsset({
      AssetName: "",
      assetDescription: "",
      assetRequestDto:"Pending",
      categoryId: "",
      subCategoryId: "",
      assetImage: null,
      SerialNumber: "",
      Model: "",
      manufacturingDate: "",
      Location: "",
      value: 0,
      expiryDate: "",
      assetStatus: "Pending",
      AssetReqReason: "", // Add this line
      Request_Status: "", // Add this line
    });
    setSubCategories([]);
    setValidationErrors({});
  };
  

  const toggleFormVisibility = () => {
    setShowCreateAssetForm((prev) => !prev);
    resetForm();
  };

  const logAction = (message, status) => {
    const newLog = {
      message,
      status,
      timestamp: new Date().toISOString(),
    };
    setActionLogs((prevLogs) => [newLog, ...prevLogs]);
  };
  
  // formData.append("AssetReqReason", newAsset.AssetReqReason);  // Add this line
  // formData.append("Request_Status", newAsset.Request_Status);  // Add this line
  
  
  return (
    <div style={styles.container}>
      {decoded?.role === "Admin" && (
        <>
          <button onClick={toggleFormVisibility} style={styles.toggleButton}>
            {showCreateAssetForm ? "Hide Asset Creation Form" : "Show Asset Creation Form"}
          </button>
  
          {showCreateAssetForm && (
            <section style={styles.formSection}>
              <h2 style={styles.heading}>Create New Asset</h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Name *</label>
                <input
                  type="text"
                  name="AssetName"
                  value={newAsset.AssetName}
                  onChange={handleInputChange}
                  placeholder="Asset Name"
                  style={styles.input}
                />
                {validationErrors["AssetName"] && <span style={styles.error}>{validationErrors["AssetName"]}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Description</label>
                <textarea
                  name="assetDescription"
                  value={newAsset.assetDescription}
                  onChange={handleInputChange}
                  placeholder="Description"
                  style={styles.input}
                  aria-label="Asset Description"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset request dto</label>
                <textarea
                  name="assetRequestDto"
                  value={newAsset.assetRequestDto}
                  onChange={handleInputChange}
                  placeholder="Description"
                  style={styles.input}
                  aria-label="Asset Description"
                />
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  name="categoryId"
                  value={newAsset.categoryId}
                  onChange={handleCategoryChange}
                  style={styles.input}
                  aria-label="Category"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Subcategory *</label>
                <select
                  name="subCategoryId"
                  value={newAsset.subCategoryId}
                  onChange={handleInputChange}
                  style={styles.input}
                  aria-label="Subcategory"
                  disabled={!subCategories.length}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((sub) => (
                    <option key={sub.subCategoryId} value={sub.subCategoryId}>
                      {sub.subCategoryName}
                    </option>
                  ))}
                </select>
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Serial Number *</label>
                <input
                  type="text"
                  name="SerialNumber"
                  value={newAsset.SerialNumber}
                  onChange={handleInputChange}
                  placeholder="Serial Number"
                  style={styles.input}
                  aria-label="Serial Number"
                />
                {validationErrors["SerialNumber"] && <span style={styles.error}>{validationErrors["SerialNumber"]}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Model *</label>
                <input
                  type="text"
                  name="Model"
                  value={newAsset.Model}
                  onChange={handleInputChange}
                  placeholder="Model"
                  style={styles.input}
                  aria-label="Model"
                />
                {validationErrors["Model"] && <span style={styles.error}>{validationErrors["Model"]}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Manufacturing Date *</label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={newAsset.manufacturingDate}
                  onChange={handleInputChange}
                  style={styles.input}
                  aria-label="Manufacturing Date"
                />
                {validationErrors["manufacturingDate"] && <span style={styles.error}>{validationErrors["manufacturingDate"]}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  name="Location"
                  value={newAsset.Location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  style={styles.input}
                  aria-label="Location"
                />
                {validationErrors["Location"] && <span style={styles.error}>{validationErrors["Location"]}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Value *</label>
                <input
                  type="number"
                  name="value"
                  value={newAsset.value}
                  onChange={handleInputChange}
                  placeholder="Value"
                  style={styles.input}
                  step="0.01"
                  aria-label="Value"
                />
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={newAsset.expiryDate}
                  onChange={handleInputChange}
                  style={styles.input}
                  aria-label="Expiry Date"
                />
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Status</label>
                <select
                  name="assetStatus"
                  value={newAsset.assetStatus}
                  onChange={handleInputChange}
                  style={styles.input}
                  aria-label="Asset Status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Image</label>
                <input
                  type="file"
                  name="assetImage"
                  onChange={handleImageUpload}
                  style={styles.input}
                  aria-label="Asset Image"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Asset Request Reason *</label>
                <textarea
                  name="AssetReqReason"
                  value={newAsset.AssetReqReason}
                  onChange={handleInputChange}
                  placeholder="Asset Request Reason"
                  style={styles.input}
                />
                {validationErrors["AssetReqReason"] && <span style={styles.error}>{validationErrors["AssetReqReason"]}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Request Status *</label>
                <select
                  name="Request_Status"
                  value={newAsset.Request_Status}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="">Select Request Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {validationErrors["Request_Status"] && <span style={styles.error}>{validationErrors["Request_Status"]}</span>}
              </div>

              <button
                onClick={newAsset.assetId ? sendUpdateRequest : handleCreateAsset}
                style={styles.submitButton}
                disabled={loading}
                aria-label={newAsset.assetId ? "Update Asset" : "Create Asset"}
              >
                {loading
                  ? newAsset.assetId
                    ? "Updating..."
                    : "Creating..."
                  : newAsset.assetId
                  ? "Update Asset"
                  : "Create Asset"}
              </button>
            </section>
          )}
        </>
      )}
  
      <section style={styles.listSection}>
        <h2 style={styles.heading}>Asset List</h2>
        <div style={styles.assetsList}>
          {assets.map((asset) => (
            <div key={asset.assetId} style={styles.assetCard}>
              <h3 style={styles.assetName}>{asset.assetName}</h3>
              <p><strong>Model:</strong> {asset.model}</p>
              <p><strong>Cost:</strong> {asset.value}</p>
              {asset.assetImage && (
                <img
                  src={asset.assetImage.startsWith("data:image") ? asset.assetImage : `data:image/jpeg;base64,${asset.assetImage}`}
                  alt="Asset"
                  style={styles.assetImage}
                />
              )}
              <div style={styles.actionButtonContainer}>
                <button onClick={() => handleUpdateAsset(asset.assetId)} style={styles.actionButton}>
                  Edit
                </button>
                <button onClick={() => handleDeleteAsset(asset.assetId)} style={styles.actionButton}>
                  Delete
                </button>
              </div>
              <button
                className="button"
                onClick={() => openModal(asset)}
              >
                Asset Requests
              </button>
            </div>
          ))}
        </div>
      </section>
  
      {selectedAsset && (
        <AssetRequestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          asset={selectedAsset}
          user={decoded?.user || {}}
          createAssetRequest={createAssetRequest}
          styles={styles}
        />
      )}
    </div>
  );
  
  

  
  
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f0f8ff", // Light Alice Blue
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    color: "#000", // Black text color
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#e0f7fa", // Light Cyan
    padding: "20px",
    borderRadius: "8px",
    width: "100%",
    color: "#000",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "20px",
    width: "100%",
    maxWidth: "600px", // Input field width
    textAlign: "left",
    color: "#000",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "14px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#4CAF50", // Green color
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    maxWidth: "600px",
    width: "100%",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  toggleButton: {
    backgroundColor: "#007bff", // Blue button
    color: "#fff",
    padding: "12px 24px",
    marginBottom: "20px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  listSection: {
    width: "100%", // Ensure full width for the section
    marginTop: "20px",
  },
  assetsList: {
    display: "flex", // Flexbox for horizontal scrolling
    flexDirection: "row", // Horizontal layout
    gap: "20px", // Space between items
    overflowX: "auto", // Horizontal scrolling
    padding: "20px 0",
    width: "100%",
  },
  assetCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    margin: "16px",
    maxWidth: "300px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s", // Hover effect
  },
  assetCardHover: {
    transform: "scale(1.02)",
  },
  assetImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px 8px 0 0",
  },
  assetDetails: {
    padding: "8px 0",
  },
  actionButtonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  actionButton: {
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  actionButtonHover: {
    backgroundColor: "#0056b3",
  },
  assetName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "10px",
  },
  error: {
    color: "#ff0000", // Red color for error
    fontSize: "12px",
  },
};

export default Asset;
