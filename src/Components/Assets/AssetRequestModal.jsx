import React, { useState, useEffect } from "react";
import { toast } from "react-toastify"; 
import { fetchUserProfile } from "../../services/userService"; // Adjusted path

const AssetRequestModal = ({ isOpen, onClose, asset, createAssetRequest, styles }) => {
  const [assetReqReason, setAssetReqReason] = useState(""); // Track the reason for the request
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // To store the logged-in user ID

  // Automatically populate the fields from the asset props
  const [newRequest, setNewRequest] = useState({
    assetReqId: 0,
    userId: 0,
    assetId: asset?.assetId || 0,
    categoryId: asset?.categoryId || 0, // Ensure it's an integer
    assetReqDate: new Date().toISOString().split("T")[0], // Format date
    assetReqReason: "",
    request_Status: "Pending",
  });

  useEffect(() => {
    // Fetch user profile to get the userId
    const fetchUserData = async () => {
      try {
        const profile = await fetchUserProfile(); // This is a function you already have
        setUserId(profile?.userId || 0); // Set the userId or default to 0
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile.");
      }
    };

    fetchUserData();
  }, []);

  // Update the newRequest with userId once it's fetched
  useEffect(() => {
    if (userId) {
      setNewRequest((prevRequest) => ({
        ...prevRequest,
        userId,
      }));
    }
  }, [userId]);

  const handleCreateAssetRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Prepare the payload with corrected fields
      const payload = {
        assetReqId: newRequest.assetReqId,
        userId: newRequest.userId,
        assetId: newRequest.assetId,
        categoryId: newRequest.categoryId, // Ensure it's an integer
        assetReqDate: newRequest.assetReqDate, // Already formatted as YYYY-MM-DD
        assetReqReason: assetReqReason,
        request_Status: newRequest.request_Status,
      };

      // Send the request
      const response = await createAssetRequest(payload);

      if (response) {
        toast.success("Asset request created successfully.");
        resetForm();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create asset request.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!assetReqReason.trim()) {
      toast.error("Reason for request is required!");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setAssetReqReason("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.heading}>Create New Asset Request</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Reason for Request</label>
          <textarea
            value={assetReqReason}
            onChange={(e) => setAssetReqReason(e.target.value)}
            placeholder="Reason for request"
            style={styles.textarea}
            aria-label="Reason for Request"
          />
        </div>

        <button onClick={handleCreateAssetRequest} style={styles.submitButton} disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AssetRequestModal;
