import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllAssetAllocations,
  createAssetAllocation,
  updateAssetAllocation,
  deleteAssetAllocation,
} from "../../services/AssetAllocationService";
import { getSubCategories } from "../../services/SubCategoryService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssetAllocation = () => {
  const navigate = useNavigate();
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [newAllocation, setNewAllocation] = useState({
    assetId: "",
    userId: "",
    allocationDate: "",
    returnDate: "",
    status: "Allocated",
  });
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleFormVisibility = () => {
    setShowCreateForm(!showCreateForm);
  };

  const token = Cookies.get("token");
  let decoded = null;
  if (token) {
    decoded = jwtDecode(token);
  }

  useEffect(() => {
    fetchAssetAllocations();
    fetchSubCategories();
    fetchSubCategories();
  }, []);

  const fetchAssetAllocations = async () => {
    setLoading(true);
    try {
      const data = await getAllAssetAllocations();
      if (data && Array.isArray(data.$values)) {
        setAssetAllocations(data.$values);
        logAction("Fetched asset allocations successfully", "success");
      } else {
        logAction("Fetched data is not in the expected format", "error");
      }
    } catch (error) {
      logAction("Error fetching asset allocations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllocation = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const allocation = { ...newAllocation };
      const createdAllocation = await createAssetAllocation(allocation);
      setAssetAllocations((prev) => [...prev, createdAllocation]);
      logAction("Created new asset allocation successfully", "success");
      resetNewAllocation();
      navigate("/asset-allocations");
    } catch (error) {
      logAction("Error creating asset allocation", "error");
      toast.error("Failed to create the asset allocation.");
    } finally {
      setLoading(false);
    }
  };


  const fetchSubCategories = async (categoryId) => {
    try {
      console.log("Fetching subcategories for categoryId:", categoryId); // Debugging log
      const response = await getSubCategories(categoryId);
      console.log("Received response:", response); // Debugging log
      if (response && response.$values) {
        setSubCategories(response.$values);
        logAction("Fetched subcategories successfully", "success");
        console.log("Subcategories set in state:", response.$values); // Debugging log
      } else {
        setSubCategories([]);
        logAction("No subcategories found for the selected category", "info");
        console.log("No subcategories found"); // Debugging log
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      logAction("Error fetching subcategories", "error");
    }
  };

  const handleUpdateAllocation = async (id) => {
    try {
      const updatedAllocation = { ...newAllocation };
      await updateAssetAllocation(id, updatedAllocation);
      fetchAssetAllocations();
      logAction("Updated asset allocation successfully", "success");
    } catch (error) {
      logAction("Error updating asset allocation", "error");
    }
  };

  const handleDeleteAllocation = async (id) => {
    try {
      await deleteAssetAllocation(id);
      fetchAssetAllocations();
      logAction("Deleted asset allocation successfully", "success");
    } catch (error) {
      logAction("Error deleting asset allocation", "error");
    }
  };

  const validateForm = () => {
    if (!newAllocation.assetId.trim()) {
      toast.error("Asset ID is required!");
      return false;
    }
    if (!newAllocation.userId.trim()) {
      toast.error("User ID is required!");
      return false;
    }
    return true;
  };

  const logAction = (message, status) => {
    console.log(`${status.toUpperCase()}: ${message}`);
  };

  const resetNewAllocation = () => {
    setNewAllocation({
      assetId: "",
      userId: "",
      allocationDate: "",
      returnDate: "",
      status: "Allocated",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAllocation((prev) => ({ ...prev, [name]: value }));
  };



  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
      <button onClick={toggleFormVisibility} style={styles.toggleButton}>
        {showCreateForm ? "Hide Allocation Form" : "Show Allocation Form"}
      </button>
  
      {showCreateForm && (
        <section style={styles.formSection}>
          <h2 style={styles.heading}>Allocate Asset</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Asset ID</label>
            <input
              type="text"
              name="assetId"
              value={newAllocation.assetId}
              onChange={handleInputChange}
              placeholder="Asset ID"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>User ID</label>
            <input
              type="text"
              name="userId"
              value={newAllocation.userId}
              onChange={handleInputChange}
              placeholder="User ID"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Allocation Date</label>
            <input
              type="date"
              name="allocationDate"
              value={newAllocation.allocationDate}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Return Date</label>
            <input
              type="date"
              name="returnDate"
              value={newAllocation.returnDate}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>
          <button onClick={handleCreateAllocation} style={styles.button}>
            {loading ? "Allocating..." : "Allocate"}
          </button>
        </section>
      )}
  
      <section style={styles.listSection}>
        <h2 style={styles.heading}>Asset Allocations</h2>
        {assetAllocations.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Asset Name</th>
                <th style={styles.tableHeader}>Category</th>
                <th style={styles.tableHeader}>Subcategory</th>
                <th style={styles.tableHeader}>User Name</th>
                <th style={styles.tableHeader}>User Email</th>
                <th style={styles.tableHeader}>Allocation Date</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assetAllocations.map((allocation) => {
                const subCategoryName = allocation.asset && allocation.asset.category && allocation.asset.category.subCategories ?
                  allocation.asset.category.subCategories.$values.find((sub) => sub.subCategoryId === allocation.asset.subCategoryId)?.subCategoryName || "N/A"
                  : "N/A";
                return (
                  <tr key={allocation.allocationId} style={styles.tableRow}>
                    <td style={styles.tableCell}>{allocation.asset ? allocation.asset.assetName : "N/A"}</td>
                    <td style={styles.tableCell}>{allocation.asset && allocation.asset.category ? allocation.asset.category.categoryName : "N/A"}</td>
                    <td style={styles.tableCell}>{subCategoryName}</td>
                    <td style={styles.tableCell}>{allocation.user ? allocation.user.userName : "N/A"}</td>
                    <td style={styles.tableCell}>{allocation.user ? allocation.user.userMail : "N/A"}</td>
                    <td style={styles.tableCell}>{allocation.allocatedDate ? new Intl.DateTimeFormat('en-GB').format(new Date(allocation.allocatedDate)) : "N/A"}</td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleUpdateAllocation(allocation.allocationId)}
                        style={styles.actionButton}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteAllocation(allocation.allocationId)}
                        style={styles.actionButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={styles.noAllocations}>No asset allocations found</p>
        )}
      </section>
    </div>
  );
};
const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f0f8ff", // Light Alice Blue
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
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
  },
  formGroup: {
    marginBottom: "20px",
    width: "100%",
    maxWidth: "600px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  toggleButton: {
    marginBottom: "20px",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  actionButton: {
    marginRight: "10px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#17a2b8",
    color: "#fff",
  },
  listSection: {
    width: "100%",
    maxWidth: "800px",
  },
};

export default AssetAllocation;