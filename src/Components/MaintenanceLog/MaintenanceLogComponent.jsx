import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
} from "../../services/MaintainenceLogService";
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

function validatePassword(password) {
  const regex = /@/;
  return regex.test(password);
}

const MaintenanceLogComponent = () => {
  const navigate = useNavigate();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [assets, setAssets] = useState([]);
  const [showMaintenanceLogForm, setShowMaintenanceLogForm] = useState(false);
  const [formState, setFormState] = useState({
    maintenanceId: null,
    maintenance_Description: "",
    maintenance_date: new Date().toISOString().split("T")[0],
    cost: "",
    assetId: "",
    userId: "",
    password: "",
  });

  const toggleFormVisibility = () => {
    setShowMaintenanceLogForm(!showMaintenanceLogForm);
  };

  const resetFormState = () => {
    setFormState({
      maintenanceId: null,
      maintenance_Description: "",
      maintenance_date: new Date().toISOString().split("T")[0],
      cost: "",
      assetId: "",
      userId: "",
      password: "",
    });
  };

  useEffect(() => {
    fetchMaintenanceLogs();
    fetchAssets();
  }, []);

  const fetchMaintenanceLogs = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceLogs();
      setMaintenanceLogs(data?.$values || []);
      logAction("Fetched maintenance logs successfully", "success");
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      logAction("Failed to fetch maintenance logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data?.$values || []);
      logAction("Fetched assets successfully", "success");
    } catch (error) {
      console.error("Error fetching assets:", error);
      logAction("Failed to fetch assets", "error");
    }
  };

  const logAction = (message, status) => {
    setActionLogs((prevLogs) => [
      { message, status, timestamp: new Date().toISOString() },
      ...prevLogs,
    ]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCreateMaintenanceLog = async (maintenanceLog) => {
    setLoading(true);
    try {
      const createdLog = await createMaintenanceLog(maintenanceLog);
setMaintenanceLogs((prevLogs) => [...prevLogs, createdLog.$values || createdLog]);

      logAction("Created maintenance log successfully", "success");
      resetFormState();
    } catch (error) {
      console.error("Error creating maintenance log:", error);
      logAction("Failed to create maintenance log", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaintenanceLog = (maintenanceId) => {
    const logToUpdate = maintenanceLogs.find(
      (log) => log.MaintenanceId === maintenanceId
    );
    if (logToUpdate) {
      setFormState({
        maintenanceId: logToUpdate.MaintenanceId,
        maintenance_Description: logToUpdate.Maintenance_Description,
        maintenance_date: logToUpdate.Maintenance_date,
        cost: logToUpdate.Cost,
        assetId: logToUpdate.AssetId,
        userId: logToUpdate.UserId,
        password: "",
      });
      setShowMaintenanceLogForm(true);
    }
  };

  const sendUpdateMaintenanceLog = async (maintenanceLog) => {
    setLoading(true);
    try {
      // Find Asset Name based on Asset ID
      const asset = assets.find((a) => a.assetId === maintenanceLog.AssetId);
      const assetName = asset ? asset.assetName : "Unknown";
  
      // Find User Name based on User ID
      const userName = maintenanceLogs.find(
        (log) => log.UserId === maintenanceLog.UserId
      )?.user?.userName || "Unknown";
  
      const updatedLog = await updateMaintenanceLog(maintenanceLog.maintenanceId, {
        ...maintenanceLog,
        assetName,
        userName,
      });
      
  
      setMaintenanceLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.MaintenanceId === maintenanceLog.MaintenanceId ? updatedLog : log
        )
      );
      logAction("Updated maintenance log successfully", "success");
      resetFormState();
      setShowMaintenanceLogForm(false);
    } catch (error) {
      console.error("Error updating maintenance log:", error);
      logAction("Failed to update maintenance log", "error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteMaintenanceLog = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await deleteMaintenanceLog(id);
      fetchMaintenanceLogs();
      logAction("Deleted maintenance log successfully", "success");
    } catch (error) {
      console.error("Error deleting maintenance log:", error);
      logAction("Failed to delete maintenance log", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const password = formState.password;
    if (!validatePassword(password)) {
      console.log("Password must contain Uppercase, alphanumeric, and special characters.");
      return;
    }
    const maintenanceLog = {
      MaintenanceId: formState.maintenanceId ? parseInt(formState.maintenanceId, 10) : 0,
      Maintenance_Description: formState.maintenance_Description,
      Maintenance_date: formState.maintenance_date,
      Cost: parseFloat(formState.cost),
      AssetId: parseInt(formState.assetId, 10),
      UserId: parseInt(formState.userId, 10),
      Password: formState.password,
    };
    formState.maintenanceId ? sendUpdateMaintenanceLog(maintenanceLog) : handleCreateMaintenanceLog(maintenanceLog);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = maintenanceLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.max(1, Math.ceil(maintenanceLogs.length / logsPerPage));


  return (
    <ErrorBoundary>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 style={styles.heading}>Maintenance Logs</h1>
  
        <div style={styles.formSection}>
          <h3 style={styles.subHeading}>Create New Maintenance Log</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                name="maintenance_Description"
                placeholder="Description"
                value={formState.maintenance_Description}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                name="maintenance_date"
                value={formState.maintenance_date}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Cost</label>
              <input
                type="number"
                name="cost"
                placeholder="Cost"
                value={formState.cost}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
  <label style={styles.label}>Asset Name</label>
  <select
    name="assetId"
    value={formState.assetId}
    onChange={handleInputChange}
    style={styles.input}
  >
    <option value="">Select Asset</option>
    {assets.map((asset) => (
      <option key={asset.assetId} value={asset.assetId}>
      {asset.assetName || "Unnamed Asset"}
    </option>
    
    ))}
  </select>
</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>User ID</label>
              <input
                type="number"
                name="userId"
                placeholder="User ID"
                value={formState.userId}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formState.password}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? 'Processing...' : formState.maintenanceId ? 'Update Log' : 'Create Log'}
              </button>
            </div>
          </form>
        </div>
  
        {loading && <p>Loading...</p>}
  
        <div style={styles.listSection}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Description</th>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Cost</th>
                <th style={styles.tableHeader}>Asset Name</th>
                <th style={styles.tableHeader}>User ID</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log.maintenanceId} style={styles.tableRow}>
                    <td style={styles.tableCell}>{log.maintenance_Description}</td>
                    <td style={styles.tableCell}>{log.maintenance_date}</td>
                    <td style={styles.tableCell}>
                      {log.cost !== undefined && log.cost !== null ? `Rs.${log.asset.value}` : "N/A"}
                    </td>

                    <td style={styles.tableCell}>
                      {log.asset?.assetName || 'Unknown'}
                    </td>
                    <td style={styles.tableCell}>{log.userId}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleUpdateMaintenanceLog(log.maintenanceId)}
                        style={styles.actionButton}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteMaintenanceLog(log.maintenanceId)}
                        style={styles.actionButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.noRequests}>No maintenance logs available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        <div>
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={styles.tableCell}>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
  
        <div style={styles.logSection}>
          <h2 style={styles.subHeading}>Action Logs</h2>
          <ul>
            {actionLogs.map((log, index) => (
              <li key={index} style={log.status === 'error' ? styles.errorLog : styles.successLog}>
                {log.timestamp} - {log.message}
              </li>
            ))}
          </ul>
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




export default MaintenanceLogComponent;