// MainComponent.jsx
import React, { useState } from "react";
import { getAssetRequests, createAssetRequest } from "../../services/AssetRequestService";
import AssetRequestModal from "./AssetRequestModal";

const MainComponent = ({ decoded, assets, categories, subCategories, user, styles }) => {
  const [showCreateAssetForm, setShowCreateAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFormVisibility = () => setShowCreateAssetForm(!showCreateAssetForm);
  const openModal = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div style={styles.container}>
      {decoded?.role === "Admin" && (
        <>
          <button onClick={toggleFormVisibility} style={styles.toggleButton}>
            {showCreateAssetForm ? "Hide Asset Creation Form" : "Show Asset Creation Form"}
          </button>
          {showCreateAssetForm && (
            <section style={styles.formSection}>
              <h2 style={styles.heading}>Create New Asset</h2>
              {/* Form content */}
            </section>
          )}
        </>
      )}
      <section style={styles.listSection}>
        <h2 style={styles.heading}>Asset List</h2>
        <div style={styles.assetsList}>
          {assets.map((asset) => (
            <div key={asset.assetId} style={styles.assetCard}>
              <h3 style={styles.assetName}>{asset.assetName}</h3>
              <p><strong>Model:</strong> {asset.model}</p>
              <p><strong>Cost:</strong> {asset.value}</p>
              {asset.assetImage && (
                <img
                  src={asset.assetImage.startsWith("data:image") ? asset.assetImage : `data:image/jpeg;base64,${asset.assetImage}`}
                  alt="Asset"
                  style={styles.assetImage}
                />
              )}
              <div style={styles.actionButtonContainer}>
                <button onClick={() => handleUpdateAsset(asset.assetId)} style={styles.actionButton}>
                  Edit
                </button>
                <button onClick={() => handleDeleteAsset(asset.assetId)} style={styles.actionButton}>
                  Delete
                </button>
              </div>
              <button
                className="button"
                onClick={() => openModal(asset)}
              >
                Asset Requests
              </button>
            </div>
          ))}
        </div>
      </section>
      {selectedAsset && (
        <AssetRequestModal
          isOpen={isModalOpen}
          onClose={closeModal}
          asset={selectedAsset}
          user={user}
          createAssetRequest={createAssetRequest}
          styles={styles}
        />
      )}
    </div>
  );
};

export default MainComponent;