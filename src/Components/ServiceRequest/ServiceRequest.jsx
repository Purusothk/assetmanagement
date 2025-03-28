import CustomPagination from "../../CustomPagination";


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getServiceRequests, createServiceRequest, updateServiceRequest, deleteServiceRequest } from "../../services/ServiceRequestService";
import { getAssets } from "../../services/AssetService";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-toastify";
import ErrorBoundary from "../../ErrorBoundary/ErrorBoundary";

const ServiceRequest = () => {
  const [decoded, setDecoded] = useState(null);
  const [assets, setAssets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [newRequest, setNewRequest] = useState({
    serviceId: "",
    assetId: "",
    userId: "",
    serviceRequestDate: "",
    issueType: "",
    serviceDescription: "",
    serviceReqStatus: "",
  });
  const [showCreateRequestForm, setShowCreateRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    fetchServiceRequests();
    fetchAssets();
    checkUserRole();
  }, []);

  const toggleFormVisibility = () => {
    setShowCreateRequestForm(!setShowCreateRequestForm);
  };
  const checkUserRole = () => {
    const token = Cookies.get("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setDecoded(decodedToken);
    }
  };

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      const data = await getServiceRequests();
      if (data && Array.isArray(data.$values)) {
        setServiceRequests(data.$values);
        logAction("Fetched service requests successfully", "success");
      } else {
        setServiceRequests([]);
        logAction("Error fetching service requests", "error");
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
      logAction("Error fetching service requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      if (data && Array.isArray(data.$values)) {
        setAssets(data.$values);
        logAction("Fetched assets successfully", "success");
      } else {
        setAssets([]);
        logAction("Error fetching assets", "error");
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      logAction("Error fetching assets", "error");
    } finally {
      setLoading(false);
    }
  };

  const logAction = (message, status) => {
    const newLog = {
      message,
      status,
      timestamp: new Date().toISOString(),
    };
    setActionLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };

  const validateServiceRequestForm = () => {
    if (!newRequest.assetId) {
      toast.error("Asset ID is required!");
      return false;
    }
    if (!newRequest.userId) {
      toast.error("User ID is required!");
      return false;
    }
    if (!newRequest.issueType) {
      toast.error("Issue Type is required!");
      return false;
    }
    if (!newRequest.serviceDescription.trim()) {
      toast.error("Service Description is required!");
      return false;
    }
    return true;
  };
  
  const handleCreateServiceRequest = async () => {
    if (!validateServiceRequestForm()) return;
    try {
      setLoading(true);
      const newServiceRequestData = {
        ...newRequest,
        serviceId: newRequest.serviceId ? parseInt(newRequest.serviceId, 10) : undefined,
        serviceRequestDate: newRequest.serviceRequestDate ? new Date(newRequest.serviceRequestDate) : new Date(),
        serviceReqStatus: 0, // Set status as UnderReview
      };
      console.log("Creating Service Request with Data:", newServiceRequestData); // Debugging log
      const createdServiceRequest = await createServiceRequest(newServiceRequestData);
      setServiceRequests((prevRequests) => [...prevRequests, createdServiceRequest]);
      logAction("Created service request successfully", "success");
      resetForm();
    } catch (error) {
      console.error("Error creating service request:", error);
      logAction("Error creating service request", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const sendUpdateServiceRequest = async () => {
    if (!validateServiceRequestForm()) return;
    try {
      setLoading(true);
      const payload = {
        serviceId: parseInt(newRequest.serviceId, 10),
        assetId: parseInt(newRequest.assetId, 10),
        userId: parseInt(newRequest.userId, 10),
        serviceRequestDate: newRequest.serviceRequestDate ? new Date(newRequest.serviceRequestDate) : new Date(),
        issue_Type: parseInt(newRequest.issueType, 10),
        serviceDescription: newRequest.serviceDescription,
        serviceReqStatus: parseInt(newRequest.serviceReqStatus, 10),
      };
      console.log("Payload for update:", payload); // Debugging log
      const response = await updateServiceRequest(payload.serviceId, payload);
      if (response) {
        setServiceRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.serviceId === payload.serviceId ? response : request
          )
        );
        logAction("Updated service request successfully", "success");
        resetForm();
        setShowCreateRequestForm(false);
      } else {
        throw new Error("Error updating service request");
      }
    } catch (error) {
      console.error("Error during service request update:", error);
      logAction("Error updating service request", "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleUpdateServiceRequest = (serviceId) => {
    const requestToUpdate = serviceRequests.find((request) => request.serviceId === serviceId);
    if (requestToUpdate) {
      setNewRequest({
        serviceId: requestToUpdate.serviceId,
        assetId: requestToUpdate.assetId.toString(),
        userId: requestToUpdate.userId.toString(),
        serviceRequestDate: requestToUpdate.serviceRequestDate.split("T")[0], // Ensure date format is correct
        issueType: requestToUpdate.issue_Type.toString(),
        serviceDescription: requestToUpdate.serviceDescription,
        serviceReqStatus: requestToUpdate.serviceReqStatus.toString(),
      });
      setShowCreateRequestForm(true);
    }
  };
  

  

  const handleDeleteServiceRequest = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service request?")) return;
    setLoading(true);
    try {
      await deleteServiceRequest(serviceId);
      setServiceRequests((prevRequests) => prevRequests.filter((request) => request.serviceId !== serviceId));
      logAction("Deleted service request successfully", "success");
    } catch (error) {
      console.error("Error deleting service request:", error);
      logAction("Error deleting service request", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!newRequest.assetId) {
      toast.error("Asset is required!");
      return false;
    }
    if (!newRequest.userId) {
      toast.error("User ID is required!");
      return false;
    }
    if (!newRequest.issueType) {
      toast.error("Issue Type is required!");
      return false;
    }
    if (!newRequest.serviceDescription.trim()) {
      toast.error("Service Description is required!");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setNewRequest({
      serviceId: "",
      assetId: "",
      userId: "",
      serviceRequestDate: "",
      issueType: "",
      serviceDescription: "",
      serviceReqStatus: "",
    });
  };

  const issueTypes = { 0: "Malfunction", 1: "Repair", 2: "Installation", 3: "Software Issue" };
  const serviceStatuses = { 0: "Under Review", 1: "Approved", 2: "Completed" };

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = serviceRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(serviceRequests.length / itemsPerPage);

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>Back</button>
      <div style={styles.formWrapper}>
      <br/>
        <h1 style={styles.heading}>Service Requests</h1>
  
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
  

        <button
          style={styles.toggleButton}
          onClick={() => setShowCreateRequestForm(!showCreateRequestForm)}
        >
          
          {showCreateRequestForm ? 'Hide Form' : 'Create New Service Request'}
        </button>
  
        {showCreateRequestForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newRequest.serviceId) {
                console.log("Updating Service Request:", newRequest); // Debugging log
                sendUpdateServiceRequest(); // Method to handle the update logic
              } else {
                console.log("Creating Service Request:", newRequest); // Debugging log
                handleCreateServiceRequest(); // Method to handle the create logic
              }
            }}
            style={styles.formSection}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Name</label>
              <select
                name="assetId"
                value={newRequest.assetId}
                onChange={handleInputChange}
                required
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
              <label style={styles.label}>User ID</label>
              <input
                type="number"
                name="userId"
                value={newRequest.userId}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Issue Type</label>
              <select
                name="issueType"
                value={newRequest.issueType}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="">Select Issue Type</option>
                <option value="0">Malfunction</option>
                <option value="1">Repair</option>
                <option value="2">Installation</option>
                <option value="3">Software Issue</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Description</label>
              <input
                type="text"
                name="serviceDescription"
                value={newRequest.serviceDescription}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>
            {newRequest.serviceId && decoded && decoded.role === "Admin" && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  name="serviceReqStatus"
                  value={newRequest.serviceReqStatus}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value={0}>Under Review</option>
                  <option value={1}>Approved</option>
                  <option value={2}>Completed</option>
                </select>
              </div>
            )}
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? 'Processing...' : newRequest.serviceId ? 'Update Request' : 'Create Request'}
              </button>
            </div>
          </form>
        )}
  
        {/* <h2 style={styles.heading}>Service Requests</h2> */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Service Id</th>
              <th style={styles.tableHeader}>Asset Name</th>
              <th style={styles.tableHeader}>User Id</th>
              <th style={styles.tableHeader}>Issue Type</th>
              <th style={styles.tableHeader}>Request Date</th>
              <th style={styles.tableHeader}>Service Status</th>
              {decoded && decoded.role === "Admin" && <th style={styles.tableHeader}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request) => (
              <tr key={request.serviceId} style={styles.tableRow}>
                <td style={styles.tableCell}>{request.serviceId}</td>
                <td style={styles.tableCell}>{assets.find(asset => asset.assetId === request.assetId)?.assetName || 'N/A'}</td>
                <td style={styles.tableCell}>{request.userId}</td>
                <td style={styles.tableCell}>{issueTypes[request.issue_Type]}</td>
                <td style={styles.tableCell}>
                  {request.serviceRequestDate ? new Date(request.serviceRequestDate).toLocaleDateString() : new Date().toLocaleDateString()}
                </td>
                <td style={styles.tableCell}>
                  {serviceStatuses[request.serviceReqStatus]}
                </td>
                {decoded && decoded.role === "Admin" && (
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleUpdateServiceRequest(request.serviceId)}
                      style={styles.actionButton}
                    >
                      Update
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
  
        <CustomPagination
          currentPage={currentPage}
          totalItems={serviceRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
  
  
  
};


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
    marginTop: "290px", // Push content down
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
  toggleButton:{
    top: "10px",
    bottom: "100px",
    height: "40px",
    borderRadius:"5px",
    width: "300px",
    position: "absolute",
    backgroundColor: "#007bff", // Blue color
    color: "#fff",
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
    width: "50%",
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
  showFormButton: {
    marginBottom: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#4CAF50", // Green color
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};


export default ServiceRequest;