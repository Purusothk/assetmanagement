import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAudits,
  createAudit,
  updateAudit,
  deleteAudit,
} from "../../services/AuditService";
import { getAssets } from "../../services/AssetService";

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

const AuditComponent = () => {
  const [audits, setAudits] = useState([]);
  const [assets, setAssets] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [newAudit, setNewAudit] = useState({
    assetId: "",
    userId: "",
    auditDate: "",
    auditMessage: "",
    assetName: "",
    assetDescription: "",
    assetLocation: "",
  });
  const [showCreateAuditForm, setShowCreateAuditForm] = useState(false);
  const navigate = useNavigate();

  const toggleFormVisibility = () => {
    setShowCreateAuditForm(!showCreateAuditForm);
  };

  useEffect(() => {
    fetchAudits();
    fetchAssets();
    console.log(audits)
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      if (data && Array.isArray(data.$values)) {
        setAssets(data.$values);
      } else {
        setAssets([]);
      }
      logAction('Fetched assets successfully', 'success');
    } catch (error) {
      console.error('Error fetching assets:', error);
      logAction('Failed to fetch assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await getAudits();
      console.log("Fetch Audits Response:", data); // Debugging log
      if (Array.isArray(data)) {
        setAudits(data);
        logAction("Fetched audits successfully", "success");
      } else if (data && Array.isArray(data.$values)) {
        setAudits(data.$values);
        logAction("Fetched audits successfully", "success");
      } else {
        console.warn("Unexpected data format:", data); // Warning log
        setAudits([]);
      }
    } catch (error) {
      console.error("Error fetching audits:", error);
      logAction("Failed to fetch audits", "error");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  const handleCreateAudit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const formattedDate = newAudit.auditDate
        ? new Date(newAudit.auditDate).toISOString().split("T")[0]
        : "";
      const audit = { ...newAudit, auditDate: formattedDate };
      const createdAudit = await createAudit(audit);
      logAction("Created new audit successfully", "success");
      resetNewAudit();
      setShowCreateAuditForm(false); // Hide the form after creation
      fetchAudits(); // Fetch the updated list of audits
    } catch (error) {
      logAction("Error creating audit", "error");
      console.error("Error creating audit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAudit = (auditId) => {
    const auditToUpdate = audits.find((audit) => audit.auditId === auditId);
    if (auditToUpdate) {
      setNewAudit({
        auditId: auditToUpdate.auditId,
        assetId: auditToUpdate.assetId,
        userId: auditToUpdate.userId,
        auditDate: auditToUpdate.auditDate,
        auditMessage: auditToUpdate.auditMessage,
        assetName: auditToUpdate.asset?.assetName || "",
        assetDescription: auditToUpdate.asset?.assetDescription || "",
        assetLocation: auditToUpdate.asset?.location || "",
      });
      setShowCreateAuditForm(true);
    }
  };

  const sendUpdateRequest = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const updatedAudit = {
        auditId: newAudit.auditId,
        assetId: newAudit.assetId,
        userId: newAudit.userId,
        auditDate: newAudit.auditDate,
        auditMessage: newAudit.auditMessage,
        assetName: newAudit.assetName,
        assetDescription: newAudit.assetDescription,
        assetLocation: newAudit.assetLocation,
      };
      const response = await updateAudit(updatedAudit.auditId, updatedAudit);
      if (response) {
        setAudits((prevAudits) =>
          prevAudits.map((audit) =>
            audit.auditId === updatedAudit.auditId ? response : audit
          )
        );
        logAction("Updated audit successfully", "success");
        resetNewAudit();
        setShowCreateAuditForm(false); // Hide the form after update
      } else {
        throw new Error("Error updating audit");
      }
    } catch (error) {
      console.error("Error during audit update:", error);
      logAction("Error updating audit", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async (id) => {
    try {
      await deleteAudit(id);
      fetchAudits();
      logAction("Deleted audit successfully", "success");
    } catch (error) {
      console.error("Error deleting audit:", error);
      logAction("Error deleting audit", "error");
    }
  };

  const validateForm = () => {
    if (!newAudit.assetId) {
      alert("Asset ID is required!");
      return false;
    }
    if (!newAudit.userId) {
      alert("User ID is required!");
      return false;
    }
    if (!newAudit.auditMessage.trim()) {
      alert("Audit Message is required!");
      return false;
    }
    return true;
  };

  const logAction = (message, status) => {
    setActionLogs((prev) => [
      { message, status, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  };

  const resetNewAudit = () => {
    setNewAudit({
      assetId: "",
      userId: "",
      auditDate: "",
      auditMessage: "",
      assetName: "",
      assetDescription: "",
      assetLocation: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAudit((prev) => ({ ...prev, [name]: value }));
  };

  const indexOfLastAudit = currentPage * logsPerPage;
  const indexOfFirstAudit = indexOfLastAudit - logsPerPage;
  const currentAudits = audits.slice(indexOfFirstAudit, indexOfLastAudit);
  const totalPages = Math.ceil(audits.length / logsPerPage);

 


  return (
    <ErrorBoundary>
      <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
        <button onClick={toggleFormVisibility} style={styles.toggleButton}>
          {showCreateAuditForm ? "Hide Audit Creation Form" : "Show Audit Creation Form"}
        </button>
  
        {showCreateAuditForm && (
          <section style={styles.formSection}>
            <h2 style={styles.heading}>Create New Audit</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Name</label>
              <select
                name="assetId"
                value={newAudit.assetId}
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
                value={newAudit.userId}
                onChange={handleInputChange}
                placeholder="User ID"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Audit Date</label>
              <input
                type="date"
                name="auditDate"
                value={newAudit.auditDate}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Audit Message</label>
              <input
                type="text"
                name="auditMessage"
                value={newAudit.auditMessage}
                onChange={handleInputChange}
                placeholder="Audit Message"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Description</label>
              <input
                type="text"
                name="assetDescription"
                value={newAudit.assetDescription}
                onChange={handleInputChange}
                placeholder="Asset Description"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Location</label>
              <input
                type="text"
                name="assetLocation"
                value={newAudit.assetLocation}
                onChange={handleInputChange}
                placeholder="Asset Location"
                style={styles.input}
              />
            </div>
            <div style={styles.buttonContainer}>
              <button
                onClick={newAudit.auditId ? sendUpdateRequest : handleCreateAudit}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (newAudit.auditId ? "Updating..." : "Creating...") : (newAudit.auditId ? "Update Audit" : "Create Audit")}
              </button>
            </div>
          </section>
        )}
  
        <section style={styles.listSection}>
          <h2 style={styles.heading}>Audits</h2>
          {audits.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Audit Message</th>
                  <th style={styles.tableHeader}>Audit Date</th>
                  <th style={styles.tableHeader}>Asset Name</th>
                  <th style={styles.tableHeader}>Asset Description</th>
                  <th style={styles.tableHeader}>Asset Location</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.auditId} style={styles.tableRow}>
                    <td style={styles.tableCell}>{audit.auditMessage || "N/A"}</td>
                    <td style={styles.tableCell}>
                      {audit.auditDate
                        ? new Intl.DateTimeFormat('en-GB').format(new Date(audit.auditDate))
                        : "N/A"}
                    </td>
                    <td style={styles.tableCell}>{audit.asset?.assetName || "Unknown"}</td>
                    <td style={styles.tableCell}>{audit.asset?.assetDescription || "No description available"}</td>
                    <td style={styles.tableCell}>{audit.asset?.location || "Unknown"}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleUpdateAudit(audit.auditId)}
                        style={styles.actionButton}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteAudit(audit.auditId)}
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
            <p>No audits available.</p>
          )}
        </section>
  
         
      </div>
    </ErrorBoundary>
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
  toggleButton: {
    backgroundColor: "#007bff", // Blue button for actions
    color: "#fff", // White text color
    padding: "12px 24px",
    marginBottom: "20px",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
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
    width: "100%",
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

export default AuditComponent;
