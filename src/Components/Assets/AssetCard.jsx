import React from "react";
import { useNavigate } from "react-router-dom";
import defaultImage from "./emptyAssetImage.webp"; // Import the default image

const AssetCard = ({ asset, onDelete, onEdit, styles }) => {
  const altText = asset.assetName ? `Image of asset: ${asset.assetName}` : "Default asset image"; // Dynamic alt text for better accessibility
  const navigate = useNavigate(); // Using useNavigate for navigation

  const handleRequest = () => {
    navigate("/asset-requests");
  };

  return (
    <div style={styles.assetCard}>
      <img
        src={asset.assetImageUrl || defaultImage} // Use default image if assetImageUrl is not provided
        alt={altText}
        style={styles.assetImage}
      />
      <div style={styles.assetDetails}>
        <h3>{asset.assetName || "Asset Name Not Available"}</h3> {/* Fallback for asset name */}
        <p>{asset.description || "Description Not Available"}</p> {/* Asset description */}
        <p>Price: ${asset.value || "Value Not Available"}</p> {/* Asset price */}
        <p>Model: {asset.model || "Model Not Available"}</p> {/* Asset model */}
        <button onClick={() => onEdit(asset)} style={styles.actionButton}>Edit</button>
        <button onClick={() => onDelete(asset.assetId)} style={styles.actionButton}>Delete</button>
        <button onClick={handleRequest} style={styles.actionButton}>Request</button> {/* Request button */}
      </div>
    </div>
  );
};

export default AssetCard;
