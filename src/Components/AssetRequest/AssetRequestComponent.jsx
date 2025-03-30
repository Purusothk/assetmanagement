import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssetRequests, createAssetRequest, updateAssetRequest } from "../../services/AssetRequestService";
import { getAssets } from "../../services/AssetService";
import { getCategories } from "../../services/CategoryService";
import { getSubCategories } from "../../services/SubCategoryService";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import ErrorBoundary from "../../ErrorBoundary/ErrorBoundary";
import { toast } from "react-toastify";

const AssetRequestComponent = () => {
  const [requests, setRequests] = useState([]);
const [assets, setAssets] = useState([]);
const [categories, setCategories] = useState([]);
const [subCategories, setSubCategories] = useState([]);
const [actionLogs, setActionLogs] = useState([]);
const [loading, setLoading] = useState(false); // Define loading state
const [showCreateRequestForm, setShowCreateRequestForm] = useState(false); // Define form visibility state
const [newRequest, setNewRequest] = useState({
  assetReqId: null,
  assetRequest: "",
  userId: "",
  assetId: "",
  categoryId: "",
  subCategoryId: "",
  assetReqDate: "",
  assetReqReason: "",
  requestStatus: 0,
  password: "",
});
const [isAdmin, setIsAdmin] = useState(false);
const navigate = useNavigate();

useEffect(() => {
  fetchAssetRequests();
  fetchAssets();
  fetchSubCategories();
  fetchCategories();
  checkUserRole();
}, []);


  const checkUserRole = () => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.role === "Admin");
    }
  };

  const fetchAssetRequests = async () => {
    try {
      const data = await getAssetRequests();
      setRequests(data.$values);  // ✅ This is correct
    } catch (error) {
      logAction("Error fetching asset requests", "error");
    }
  };
  

  const fetchAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data.$values);
    } catch (error) {
      logAction("Error fetching assets", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.$values);
    } catch (error) {
      logAction("Error fetching categories", "error");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) return; // Prevent unnecessary API call
    try {
      const data = await getSubCategories(categoryId);
      setSubCategories(data.$values);
    } catch (error) {
      logAction("Error fetching subcategories", "error");
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedValue = value;
    
    // For categoryId and subCategoryId, make sure to handle undefined or null values
    if (name === "categoryId" || name === "subCategoryId") {
      updatedValue = value ? parseInt(value, 10) : null;
    }
    
    setNewRequest((prev) => ({ ...prev, [name]: updatedValue }));
  };
  
  // In UserService.js
  const getUserNameById = async (userId) => {
    try {
      const timestamp = new Date().getTime(); // Unique value to avoid cache
      const response = await fetch(`http://localhost:3000/api/users/${userId}?_=${timestamp}`);
      const data = await response.json();
      return data.userName; 
    } catch (error) {
      console.error("Error fetching user name", error);
      return null;
    }
  };
  

  

  const handleCreateAssetRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      const userName = await getUserNameById(newRequest.userId);
      if (!userName) {
        toast.error("User not found!");
        return;
      }
  
      const asset = assets.find(a => a.assetId === parseInt(newRequest.assetId, 10));
      if (!asset) {
        toast.error("Asset not found!");
        return;
      }
  
      const category = categories.find(c => c.categoryId === parseInt(newRequest.categoryId, 10));
      if (!category) {
        toast.error("Category not found!");
        return;
      }
  
      const payload = {
        assetReqId: newRequest.assetReqId,
        userName,
        assetName: asset.assetName,
        userId: newRequest.userId,
        assetId: asset.assetId,
        categoryName: category.categoryName,
        assetReqDate: newRequest.assetReqDate,
        assetReqReason: newRequest.assetReqReason,
        requestStatus: 0, // Default to Pending
      };
  
      const response = await createAssetRequest(payload);
      if (response) {
        logAction("Created new asset request successfully", "success");
        fetchAssetRequests();
        resetForm();
      }
    } catch (error) {
      logAction("Failed to create asset request", "error");
    } finally {
      setLoading(false);
    }
  };
  

  
  

const sendUpdateRequest = async () => {
  const existingRequest = requests.find(request => request.assetReqId === newRequest.assetReqId);

  if (!existingRequest) {
    console.error("Existing request not found!");
    return;
  }

  // Fetch the necessary fields
  try {
    // Get UserName based on userId
    const userName = await getUserNameById(newRequest.userId);
    if (userName) {
      toast.error("User not found!");
      return;
    }

    // Get AssetName based on assetId
    const assetId = parseInt(newRequest.assetId, 10);
    if (isNaN(assetId)) {
      toast.error("Invalid Asset ID");
      return;
    }
    const asset = assets.find(asset => asset.assetId === assetId);
    if (!asset) {
      toast.error("Asset not found!");
      return;
    }

    const assetName = asset ? asset.assetName : null; // Assuming `assetName` exists in the asset object
    if (!assetName) {
      toast.error("Asset not found!");
      return;
    }

    // Get CategoryName based on categoryId
    const category = categories.find(category => category.categoryId === parseInt(newRequest.categoryId, 10));
    const categoryName = category ? category.categoryName : null; // Assuming `categoryName` exists in the category object
    if (!categoryName) {
      toast.error("Category not found!");
      return;
    }

    // Construct the payload with the required fields
    const payload = {
      assetReqId: newRequest.assetReqId, // Keep the existing assetReqId for update
      assetRequest: newRequest.assetRequest || existingRequest.assetRequest, // Use new or existing value
      userName: userName, // Add UserName field
      userId: existingRequest.userId,
      assetId: existingRequest.assetId,
      assetName: assetName, // Add AssetName field
      categoryName: categoryName, // Add CategoryName field
      assetReqDate: existingRequest.assetReqDate,
      assetReqReason: newRequest.assetReqReason || existingRequest.assetReqReason, // Use new or existing value
      requestStatus: parseInt(newRequest.requestStatus, 10), // Ensure this is correctly formatted as integer
      password: newRequest.password
    };

    // Send the update request
    const response = await updateAssetRequest(payload.assetReqId, payload);
    if (response) {
      logAction("Updated asset request successfully", "success");
      fetchAssetRequests();
    } else {
      throw new Error("Failed to update asset request");
    }
  } catch (error) {
    console.error("Error updating asset request:", error);
    logAction("Failed to update asset request", "error");
  }
};


  
  
  

  // const handleUpdateAssetRequest = (assetReqId) => {
  //   const requestToUpdate = requests.find((request) => request.assetReqId === assetReqId);
    
  //   if (requestToUpdate) {
  //     setNewRequest({
  //       assetReqId: requestToUpdate.assetReqId,
  //       assetRequest: requestToUpdate.assetRequest || "", // Ensure assetRequest is a string
  //       userId: requestToUpdate.userId ? requestToUpdate.userId.toString() : "", // Handle undefined values
  //       assetId: requestToUpdate.assetId ? requestToUpdate.assetId.toString() : "", // Handle undefined values
  //       categoryId: requestToUpdate.categoryId ? requestToUpdate.categoryId.toString() : "", // Handle undefined values
  //       subCategoryId: requestToUpdate.subCategoryId ? requestToUpdate.subCategoryId.toString() : "", // Handle undefined values
  //       assetReqDate: requestToUpdate.assetReqDate ? requestToUpdate.assetReqDate.split("T")[0] : "",
  //       assetReqReason: requestToUpdate.assetReqReason || "", // Ensure assetReqReason is a string
  //       requestStatus: requestToUpdate.requestStatus ? requestToUpdate.requestStatus.toString() : "", // Handle undefined values
  //       password: "", // Reset password field
  //     });
  //     setShowCreateRequestForm(true); // Show form for updating
  //   }
  // };
  
  const handleUpdateAssetRequest = (assetReqId) => {
    const requestToUpdate = requests.find(request => request.assetReqId === assetReqId);
  
    if (requestToUpdate) {
      setNewRequest({
        ...requestToUpdate, // Keep all existing values
        assetReqDate: requestToUpdate.assetReqDate.split("T")[0], // Format date
        password: "", // Reset password field
      });
      setShowCreateRequestForm(true);
    }
  };
  
  const validateForm = () => {
    if (!newRequest.assetRequest) {
      toast.error("Asset Request is required!");
      return false;
    }
    if (!newRequest.userId) {
      toast.error("User ID is required!");
      return false;
    }
    if (!newRequest.categoryId) {
      toast.error("Category ID is required!");
      return false;
    }
    if (!newRequest.assetId) {
      toast.error("Asset ID is required!");
      return false;
    }
    return true;
  };
  

  const resetForm = () => {
    setNewRequest({
      assetReqId: null,
      assetRequest: "",
      userId: "",
      assetId: "",
      categoryId: "",
      subCategoryId: "",
      assetReqDate: "",
      assetReqReason: "",
      requestStatus: "",
      password: "",
    });
    setShowCreateRequestForm(false); // Hide form after reset
  };

  const logAction = (message, status) => {
    const newLog = {
      message,
      status,
      timestamp: new Date().toISOString(),
    };
    setActionLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  }

 
  return (
    <ErrorBoundary>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>Back</button>
        <h1 style={styles.heading}>Asset Requests</h1>
  
        {/* Create or Update Asset Request Form */}
        <section style={styles.formSection}>
          <h2 style={styles.subHeading}>{newRequest.assetReqId ? "Update Asset Request" : "Create New Asset Request"}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              newRequest.assetReqId ? sendUpdateRequest() : handleCreateAssetRequest(e);
            }}
            style={styles.form}
          >
            <div style={styles.formGroup}>
              <label htmlFor="assetRequest" style={styles.label}>Asset Request:</label>
              <input
                type="text"
                id="assetRequest"
                name="assetRequest"
                value={newRequest.assetRequest}
                onChange={handleInputChange}
                placeholder="Asset Request"
                style={styles.input}
              />
            </div>
            {!newRequest.assetReqId && (
              <>
                <div style={styles.formGroup}>
                  <label htmlFor="userId" style={styles.label}>User ID:</label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={newRequest.userId}
                    onChange={handleInputChange}
                    placeholder="User ID"
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="categoryId" style={styles.label}>Category Name:</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={newRequest.categoryId}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchSubCategories(e.target.value);
                    }}
                    style={styles.input}
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
                  <label htmlFor="subCategoryId" style={styles.label}>Subcategory Name:</label>
                  <select
                    id="subCategoryId"
                    name="subCategoryId"
                    value={newRequest.subCategoryId}
                    onChange={handleInputChange}
                    style={styles.input}
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
                  <label htmlFor="assetId" style={styles.label}>Asset Name:</label>
                  <select
                    id="assetId"
                    name="assetId"
                    value={newRequest.assetId}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="">Select Asset</option>
                    {assets.map((asset) => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {asset.assetName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="assetReqDate" style={styles.label}>Request Date:</label>
                  <input
                    type="date"
                    id="assetReqDate"
                    name="assetReqDate"
                    value={newRequest.assetReqDate}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="assetReqReason" style={styles.label}>Reason for Request:</label>
                  <input
                    type="text"
                    id="assetReqReason"
                    name="assetReqReason"
                    value={newRequest.assetReqReason}
                    onChange={handleInputChange}
                    placeholder="Reason for Request"
                    style={styles.input}
                  />
                </div>
              </>
            )}
            {newRequest.assetReqId && isAdmin && (
              <>
                <div style={styles.formGroup}>
                  <label htmlFor="requestStatus" style={styles.label}>Status:</label>
                  <select
                    id="requestStatus"
                    name="requestStatus"
                    value={newRequest.requestStatus}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="">Select Status</option>
                    <option value="0">Pending</option>
                    <option value="1">Approved</option>
                    <option value="2">Rejected</option>
                  </select>
                </div>
              </>
            )}
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : newRequest.assetReqId ? 'Update Request' : 'Submit Request'}
            </button>
          </form>
        </section>
  
        {/* Display Asset Requests in a Table */}
        <section style={styles.listSection}>
          <h2 style={styles.subHeading}>Asset Requests List</h2>
          {requests.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>User ID</th>
                  <th style={styles.tableHeader}>Asset Name</th>
                  <th style={styles.tableHeader}>Category Name</th>
                  <th style={styles.tableHeader}>Subcategory Name</th>
                  <th style={styles.tableHeader}>Reason for Request</th>
                  <th style={styles.tableHeader}>Request Date</th>
                  <th style={styles.tableHeader}>Status</th>
                  {isAdmin && <th style={styles.tableHeader}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.assetReqId}>
                    <td>{request.userId}</td>
                    <td>{request.assetName || "N/A"}</td>
                    <td>{request.categoryName || "N/A"}</td>
                    <td>{request.subCategoryName || "N/A"}</td>
                    <td>{request.assetReqReason}</td>
                    <td>{new Date(request.assetReqDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        style={{
                          color:
                            request.requestStatus === "0"
                              ? "orange"
                              : request.requestStatus === "1"
                              ? "green"
                              : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {getStatusText(request.requestStatus)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          onClick={() => handleUpdateAssetRequest(request.assetReqId)}
                          style={{
                            backgroundColor: "#007bff", // Blue color
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")} // Darker blue on hover
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
                        >
                          Update
                        </button>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noRequests}>No asset requests available</p>
          )}
        </section>
      </div>
    </ErrorBoundary>
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
      color: "#000",
    },
    backButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "#007bff", // Blue color
      color: "#fff",
      padding: "10px 20px",
      border: "none",
      cursor: "pointer",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "bold",
    },
    heading: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#000",
      fontSize: "24px",
      fontWeight: "bold",
    },
    formSection: {
      backgroundColor: "#e0f7fa", // Light Cyan
      padding: "20px",
      borderRadius: "8px",
      width: "100%",
      marginBottom: "20px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add subtle shadow for depth
    },
    subHeading: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#000",
      fontSize: "20px",
      fontWeight: "bold",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    formGroup: {
      marginBottom: "15px",
      width: "100%",
      maxWidth: "600px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#000",
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
      backgroundColor: "#ffffff",
      color: "#000",
    },
    submitButton: {
      backgroundColor: "#4CAF50",
      color: "#fff",
      padding: "12px 24px",
      border: "none",
      cursor: "pointer",
      borderRadius: "4px",
      fontSize: "16px",
      fontWeight: "bold",
      marginTop: "10px",
    },
    listSection: {
      backgroundColor: "#e0f7fa",
      padding: "20px",
      borderRadius: "8px",
      width: "100%",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add subtle shadow for depth
    },
    table: {
      width: "50%",
      marginTop: "20px",
      margin: "0 auto", // Center the table
      borderCollapse: "collapse",
      color: "#000",
      borderRadius: "8px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      backgroundColor: "#333",
      color: "#fff",
      textAlign: "center",
      padding: "12px",
      fontWeight: "bold",
    },
    tableCell: {
      padding: "12px",
      border: "1px solid #ddd",
      backgroundColor: "#f9f9f9",
      color: "#000",
      textAlign: "center",
    },
    tableRow: {
      textAlign: "center",
      color: "#000",
    },
    actionButton: {
      backgroundColor: "#007bff",
      color: "#fff",
      padding: "8px 16px",
      margin: "5px",
      border: "none",
      cursor: "pointer",
      borderRadius: "4px",
      fontSize: "14px",
      fontFamily: "'Arial', sans-serif",
      fontWeight: "bold",
    },
    noRequests: {
      fontSize: "18px",
      color: "#333",
    },
    logSection: {
      backgroundColor: "#f0f8ff",
      padding: "20px",
      borderRadius: "8px",
      width: "40%",
      marginTop: "20px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add subtle shadow for depth
    },
    errorLog: {
      color: "red",
    },
    successLog: {
      color: "green",
    },
    noLogs: {
      fontSize: "18px",
      color: "#333",
    },
  };    
export default AssetRequestComponent;