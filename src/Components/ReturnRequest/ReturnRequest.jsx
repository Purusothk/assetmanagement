import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReturnRequests,
  createReturnRequest,
  updateReturnRequest,
  deleteReturnRequest,
} from "../../services/ReturnRequestService";
import { getAssets } from "../../services/AssetService";
import { getAssetRequests } from "../../services/AssetRequestService";
import { getCategories } from "../../services/CategoryService";
import { fetchUsers } from "../../services/userService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Correctly import jwt-decode
import { toast } from "react-toastify";

// Error Boundary for unexpected errors
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error captured by Error Boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again later.</h2>;
    }
    return this.props.children;
  }
}

const ReturnRequestComponent = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [assetRequests, setAssetRequests] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [showReturnRequestForm, setShowReturnRequestForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const toggleFormVisibility = () => setShowReturnRequestForm(!showReturnRequestForm);

  const resetNewRequest = () => {
    setNewRequest({
      returnId: "",
      assetId: "",
      userId: "",
      categoryId: "",
      returnDate: "",
      condition: "",
      reason: "",
    });
  };

  // Form state for new return request
  const [newRequest, setNewRequest] = useState({
    assetId: "",
    userId: "",
    categoryId: "",
    returnDate: "",
    condition: "",
    reason: "",
  });

  useEffect(() => {
    fetchReturnRequests();
    fetchAssets();
    fetchUsersList();
    fetchCategories();
    fetchUserRole();
  }, []);

  const fetchUsersList = async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchUserRole = () => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      setCurrentUserId(decoded.userId); // Store userId for filtering
    }
  };

  useEffect(() => {
    if (userRole === "employee") {
      fetchAssetRequests();
    }
  }, [userRole]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data?.$values || []);
      logAction("Fetched categories successfully", "success");
    } catch (error) {
      console.error("Error fetching categories:", error);
      logAction("Error fetching categories", "error");
    }
  };

  const fetchReturnRequests = async () => {
    setLoading(true);
    try {
      const data = await getReturnRequests();
      setReturnRequests(data?.$values || []);
      logAction("Fetched return requests successfully", "success");
    } catch (error) {
      console.error("Error fetching return requests:", error);
      logAction("Failed to fetch return requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data?.$values || []);
      logAction("Fetched assets successfully", "success");
    } catch (error) {
      console.error("Error fetching assets:", error);
      logAction("Failed to fetch assets", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetRequests = async () => {
    setLoading(true);
    try {
      const data = await getAssetRequests();
      setAssetRequests(data?.$values || []);
      logAction("Fetched asset requests successfully", "success");
    } catch (error) {
      console.error("Error fetching asset requests:", error);
      logAction("Failed to fetch asset requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const logAction = (message, status) => {
    setActionLogs((prevLogs) => [
      { message, status, timestamp: new Date().toISOString() },
      ...prevLogs,
    ]);
  };

  const handleCreateReturnRequest = async () => {
    setLoading(true);
    try {
      await createReturnRequest(newRequest);
      fetchReturnRequests();
      logAction("Created return request successfully", "success");
      resetNewRequest();
    } catch (error) {
      console.error("Error creating return request:", error);
      logAction("Failed to create return request", "error");
      toast.error("Failed to create return request.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReturnRequest = (returnId) => {
    const returnRequestToUpdate = returnRequests.find((req) => req.returnId === returnId);
    if (!returnRequestToUpdate) return console.error("No return request found for ID:", returnId);

    setNewRequest({ ...returnRequestToUpdate });
    setShowReturnRequestForm(true);
  };

  const sendUpdateReturnRequest = async () => {
    setLoading(true);
    try {
      await updateReturnRequest(newRequest.returnId, newRequest);
      fetchReturnRequests();
      logAction("Updated return request successfully", "success");
      resetNewRequest();
      setShowReturnRequestForm(false);
    } catch (error) {
      console.error("Error updating return request:", error);
      logAction("Error updating return request", "error");
      toast.error("Failed to update return request.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReturnRequest = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await deleteReturnRequest(id);
      fetchReturnRequests();
      logAction("Deleted return request successfully", "success");
    } catch (error) {
      console.error("Error deleting return request:", error);
      logAction("Failed to delete return request", "error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const currentRequests = returnRequests.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const totalPages = Math.ceil(returnRequests.length / logsPerPage);

  // Filter assets based on user role
  const filteredAssets = userRole === "employee" ? assets.filter((a) => a.assignedTo === currentUserId) : assets;

   

       

return (
              <ErrorBoundary>
                <div style={styles.container}>
                <button style={styles.backButton} onClick={() => navigate(-1)}>Back</button>
                  <button style={styles.toggleButton} onClick={toggleFormVisibility}>
                    {showReturnRequestForm ? "Hide Return Request Form" : "Show Return Request Form"}
                  </button>
            
                  {showReturnRequestForm && (
                    <section style={styles.formSection}>
                      <h2 style={styles.heading}>{newRequest.returnId ? "Update Return Request" : "Create New Return Request"}</h2>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Category</label>
                        <select
                          name="categoryId"
                          value={newRequest.categoryId}
                          onChange={(e) => {
                            setNewRequest((prev) => ({ ...prev, categoryId: e.target.value }));
                            fetchAssets(e.target.value); // Fetch assets based on selected category
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
                        <label style={styles.label}>Asset</label>
                        <select
                          name="assetId"
                          value={newRequest.assetId}
                          onChange={(e) => setNewRequest((prev) => ({ ...prev, assetId: e.target.value }))}
                          style={styles.input}
                        >
                          <option value="">Select Asset</option>
                          {filteredAssets.map((asset) => (
                            <option key={asset.assetId} value={asset.assetId}>
                              {asset.assetName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>User ID</label>
                        <input
                          type="number"
                          name="userId"
                          value={newRequest.userId}
                          onChange={(e) => setNewRequest((prev) => ({ ...prev, userId: e.target.value }))}
                          style={styles.input}
                          placeholder="User ID"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Return Date</label>
                        <input
                          type="date"
                          name="returnDate"
                          value={newRequest.returnDate}
                          onChange={(e) => setNewRequest((prev) => ({ ...prev, returnDate: e.target.value }))}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Condition</label>
                        <input
                          type="text"
                          name="condition"
                          value={newRequest.condition}
                          onChange={(e) => setNewRequest((prev) => ({ ...prev, condition: e.target.value }))}
                          style={styles.input}
                          placeholder="Condition"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Reason</label>
                        <input
                          type="text"
                          name="reason"
                          value={newRequest.reason}
                          onChange={(e) => setNewRequest((prev) => ({ ...prev, reason: e.target.value }))}
                          style={styles.input}
                          placeholder="Reason"
                        />
                      </div>
                      <button
                        onClick={newRequest.returnId ? sendUpdateReturnRequest : handleCreateReturnRequest}
                        style={styles.submitButton}
                        disabled={loading}
                      >
                        {loading ? (newRequest.returnId ? "Updating..." : "Creating...") : (newRequest.returnId ? "Update Return Request" : "Create Return Request")}
                      </button>
                    </section>
                  )}
            
                  <section style={styles.listSection}>
                    <h2 style={styles.heading}>Return Requests</h2>
                    {returnRequests.length > 0 ? (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.tableHeader}>User ID</th>
                            <th style={styles.tableHeader}>Asset</th>
                            <th style={styles.tableHeader}>Category</th>
                            <th style={styles.tableHeader}>Reason</th>
                            <th style={styles.tableHeader}>Return Date</th>
                            <th style={styles.tableHeader}>Condition</th>
                            <th style={styles.tableHeader}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRequests.map((request) => (
                            <tr key={request.returnId} style={styles.tableRow}>
                              <td style={styles.tableCell}>{request.userId}</td>
                              <td style={styles.tableCell}>{assets.find((asset) => asset.assetId === request.assetId)?.assetName || "N/A"}</td>
                              <td style={styles.tableCell}>{categories.find((category) => category.categoryId === request.categoryId)?.categoryName || "N/A"}</td>
                              <td style={styles.tableCell}>{request.reason}</td>
                              <td style={styles.tableCell}>{request.returnDate}</td>
                              <td style={styles.tableCell}>{request.condition}</td>
                              <td style={styles.tableCell}>
                                <button
                                  onClick={() => handleUpdateReturnRequest(request.returnId)}
                                  style={styles.actionButton}
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDeleteReturnRequest(request.returnId)}
                                  style={styles.actionButton}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No return requests available.</p>
                    )}
                  </section>
            
                 
            
                  <div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={styles.actionButton}
                    >
                      Previous
                    </button>
                    <span style={styles.tableCell}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={styles.actionButton}
                    >
                      Next
                    </button>
                  </div>
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
    flexDirection: "column", // Stack elements vertically
    alignItems: "center", // Center the elements horizontally
    width: "100%", // Ensure full width of the container
    color: "#000", // Black text color for the container
    justifyContent: "flex-start", // Align items to the top
    marginTop: "440px", // Push content down
  },
  backButton: {
    position: "fixed",
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
  toggleButton:{
    top: "10px",
    bottom: "100px",
    height: "40px",
    width: "300px",
    position: "absolute",
    backgroundColor: "#007bff", // Blue color
    borderRadius:"4px",
    color: "#fff",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#000", // Black text color for headings
    fontSize: "24px", // Larger font size for headings
    fontWeight: "bold",
  },
  formWrapper: {
    display: "flex",
    flexDirection: "column", // Stack elements vertically
    alignItems: "center", // Center the elements horizontally
    maxWidth: "1200px", // Increase the max-width to make the form section wider
    width: "100%", // Ensure it is responsive
    margin: "0 auto", // Center the form horizontally
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#e0f7fa", // Light Cyan
    padding: "20px", // Add some padding for spacing
    borderRadius: "8px",
    width: "100%", // Ensure the form section takes full width of the container
    color: "#000", // Black text color
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add subtle shadow for depth
  },
  formGroup: {
    marginBottom: "20px",
    width: "100%",
    maxWidth: "600px", // Match the width of input fields
    textAlign: "left", // Align text to the left
    color: "#000", // Black text color
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#ffffff", // White background for inputs
    color: "#000", // Black text color for input
    fontSize: "14px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#000", // Black text color for labels
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center", // Center the button horizontally
    width: "100%",
  },
  
  submitButton: {
    backgroundColor: "#4CAF50", // Green color
    color: "#fff", // White text color for button
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    maxWidth: "600px", // Match the button width with the input fields
    width: "100%",
    fontSize: "16px",
    fontWeight: "bold",
  },
  table: {
    position:"relative",
    width: "100%", // Full width of the container
    marginTop: "20px",
    borderCollapse: "collapse",
    color: "#000", // Black text color for table
  },
  tableHeader: {
    backgroundColor: "#333", // Darker background color for header
    color: "#fff", // White text color for header
    textAlign: "left",
    padding: "12px",
    fontWeight: "bold",
  },
  tableCell: {
    padding: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9", // Lighter background color for cells
    color: "#000", // Black text color for cells
  },
  tableRow: {
    textAlign: "left",
    color: "#000", // Black text color for rows
  },
  actionButton: {
    backgroundColor: "#007bff", // Blue button for actions
    color: "#fff", // White text color for buttons
    padding: "8px 16px",
    margin: "5px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "'Arial', sans-serif",
    fontWeight: "bold",
  },
  logSection: {
    width: "40%",
    marginTop: "40px",
    backgroundColor: "#f9f9f9", // Light background for logs
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  logItem: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
    color: "#333",
  },
  logHeading: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#000",
  },
};

export default ReturnRequestComponent;
