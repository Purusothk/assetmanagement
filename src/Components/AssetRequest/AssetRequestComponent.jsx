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
import HeaderFooter from '../HeaderFooter';
import { useAuth } from "../../contexts/AuthContext";

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
const [loggedTime, setLoggedTime] = useState('');
const { logout, authState } = useAuth();

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
      setRequests(data.$values);
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
  
    if (name === "categoryId" || name === "subCategoryId") {
      updatedValue = parseInt(value, 10).toString(); // Convert to integer and then to string
    }
  
    setNewRequest((prev) => ({ ...prev, [name]: updatedValue }));
  };
  

  const handleCreateAssetRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        assetRequest: newRequest.assetRequest,
        userId: parseInt(newRequest.userId, 10),
        assetId: parseInt(newRequest.assetId, 10),
        categoryId: newRequest.categoryId.toString(),
        subCategoryId: newRequest.subCategoryId ? newRequest.subCategoryId.toString() : null,
        assetReqDate: newRequest.assetReqDate,
        assetReqReason: newRequest.assetReqReason || "", // Make sure AssetReqReason is always a string
        Request_Status: newRequest.Request_Status || "Pending",
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
  
    const payload = {
      assetReqId: newRequest.assetReqId,
      assetRequest: newRequest.assetRequest || existingRequest.assetRequest, // Use new or existing value
      userId: existingRequest.userId,
      assetId: existingRequest.assetId,
      categoryId: newRequest.categoryId.toString(), // Convert categoryId to string
      subCategoryId: newRequest.subCategoryId ? newRequest.subCategoryId.toString() : null,
      assetReqDate: existingRequest.assetReqDate,
      assetReqReason: existingRequest.assetReqReason,
      requestStatus: parseInt(newRequest.requestStatus, 10), // Ensure this is correctly formatted as integer
      password: newRequest.password
    };
  
    try {
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
  
  

  const handleUpdateAssetRequest = (assetReqId) => {
    const requestToUpdate = requests.find((request) => request.assetReqId === assetReqId);
    if (requestToUpdate) {
      setNewRequest({
        assetReqId: requestToUpdate.assetReqId,
        assetRequest: requestToUpdate.assetRequest,
        userId: requestToUpdate.userId.toString(),
        assetId: requestToUpdate.assetId.toString(),
        categoryId: requestToUpdate.categoryId.toString(),
        subCategoryId: requestToUpdate.subCategoryId ? requestToUpdate.subCategoryId.toString() : "",
        assetReqDate: requestToUpdate.assetReqDate.split("T")[0], // Ensure date format is correct
        assetReqReason: requestToUpdate.assetReqReason,
        requestStatus: requestToUpdate.requestStatus.toString(),
        password: "", // Reset password field
      });
      setShowCreateRequestForm(true); // Show form for updating
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
  useEffect(() => {
    const now = new Date();
    setLoggedTime(now.toLocaleTimeString());
  }, []);

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
      {authState.user && (
        <HeaderFooter userName={authState.user.sub} userRole={authState.user.role} loggedTime={loggedTime} />
      )}
      
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 style={styles.heading}>Asset Requests</h1>
  
        {/* Create or Update Asset Request Form */}
        <section style={styles.formSection}>
          <h2 style={styles.subHeading}>{newRequest.assetReqId ? "Update Asset Request" : "Create New Asset Request"}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newRequest.assetReqId) {
                sendUpdateRequest();
              } else {
                handleCreateAssetRequest(e); // Pass the event to handleCreateAssetRequest
              }
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
                <div style={styles.formGroup}>
                  <label htmlFor="password" style={styles.label}>Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newRequest.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    style={styles.input}
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
              >
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
                  {requests.map((request) => {
                    const asset = request.asset || {};
                    const categoryName = categories.find((cat) => cat.categoryId === asset.categoryId)?.categoryName || "Unknown";
                    const subCategoryName = subCategories.find((sub) => sub.subCategoryId === asset.subCategoryId)?.subCategoryName || "Unknown";
                    return (
                      <tr key={request.assetReqId} style={styles.tableRow}>
                        <td style={styles.tableCell}>{request.userId}</td>
                        <td style={styles.tableCell}>{asset.assetName || "Unknown"}</td>
                        <td style={styles.tableCell}>{categoryName}</td>
                        <td style={styles.tableCell}>{subCategoryName}</td>
                        <td style={styles.tableCell}>{request.assetReqReason}</td>
                        <td style={styles.tableCell}>
                          {request.assetReqDate ? new Intl.DateTimeFormat('en-GB').format(new Date(request.assetReqDate)) : "N/A"}
                        </td>
                        <td style={styles.tableCell}>{getStatusText(request.requestStatus)}</td>
                        {isAdmin && (
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => handleUpdateAssetRequest(request.assetReqId)}
                              style={styles.actionButton}
                            >
                              Update
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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