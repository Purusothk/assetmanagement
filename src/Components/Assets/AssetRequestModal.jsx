import React, { useState, useEffect } from "react";

const AssetRequestModal = ({ isOpen, onClose, asset, user, createAssetRequest, styles }) => {
  const [reasonForRequest, setReasonForRequest] = useState("");

  useEffect(() => {
    console.log("Modal Asset:", asset); // Log the asset object for debugging
    console.log("Modal User:", user); // Log the user object for debugging
  }, [asset, user]);

  const handleRequest = async () => {
    if (!user || !asset) {
      console.error("User or Asset is not defined");
      return;
    }

    const request = {
      assetId: asset.assetId,
      userId: user.userId,
      categoryName: asset.categoryName || "N/A",
      subCategoryName: asset.subCategoryName || "N/A",
      assetName: asset.assetName || "N/A",
      requestDate: new Date().toISOString(),
      reasonForRequest,
    };

    try {
      await createAssetRequest(request);
      onClose();
    } catch (error) {
      console.error("Error creating asset request:", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.heading}>Create New Asset Request</h2>
        <div style={styles.formGroup}>
          <label style={styles.label}>Asset Request</label>
          <input type="text" value="Asset Request" readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>User ID</label>
          <input type="text" value={user?.userId || "N/A"} readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Category Name</label>
          <input type="text" value={asset?.categoryName || "N/A"} readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Subcategory Name</label>
          <input type="text" value={asset?.subCategoryName || "N/A"} readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Asset Name</label>
          <input type="text" value={asset?.assetName || "N/A"} readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Request Date</label>
          <input type="text" value={new Date().toLocaleDateString()} readOnly style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Reason for Request</label>
          <textarea
            value={reasonForRequest}
            onChange={(e) => setReasonForRequest(e.target.value)}
            placeholder="Reason for Request"
            style={styles.textarea}
            aria-label="Reason for Request"
          />
        </div>
        <button onClick={handleRequest} style={styles.submitButton}>
          Submit Request
        </button>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AssetRequestModal;
