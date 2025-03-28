import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCategories } from "../services/CategoryService";
import { getSubCategories } from "../services/SubCategoryService";
import { getAssets } from "../services/AssetService";
import { getAssetRequests } from "../services/AssetRequestService";
import { getAllAssetAllocations } from "../services/AssetAllocationService";
import { getAudits } from "../services/AuditService";
import { getMaintenanceLogs } from "../services/MaintainenceLogService";
import { getReturnRequests } from "../services/ReturnRequestService";
import { getServiceRequests } from "../services/ServiceRequestService";
import HeaderFooter from "../Components/HeaderFooter";
import "./admin.css";
import { FaCog } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, authState } = useAuth();
  const [data, setData] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [section, setSection] = useState("");

  // Check authState and debug loginTime
  console.log("AuthState:", authState);
  console.log("Login Time: ", authState?.loginTime);

  const loginTime = authState?.loginTime
  ? (() => {
      const parsedTime = new Date(authState.loginTime);
      return parsedTime.toString() !== "Invalid Date" 
        ? parsedTime.toLocaleString("en-US", {
            hour12: true,
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Invalid login time";
    })()
  : "Login time not available";


  const handleFetchData = async (fetchFunction, sectionName, route) => {
    try {
      const result = await fetchFunction();
      console.log(`Fetched ${sectionName} data:`, result);
      setData(result || []);
      setSection(sectionName);
      navigate(route);
    } catch (error) {
      console.error(`Error fetching ${sectionName}:`, error.message || error);
      setData([]);
      setSection(`${sectionName} (Error fetching data)`);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="container">
      {authState?.user && (
        <HeaderFooter
          userName={authState.user.sub}
          userRole={authState.user.role}
          loggedTime={loginTime}
        />
      )}
      <FaCog className="settingsIcon" onClick={handleSettingsClick} />
      {showSettings && (
        <div className="settingsMenu">
          <button onClick={() => navigate("/change-password")}>
            Change Password
          </button>
          <button className="signout" onClick={logout}>
            Sign Out
          </button>
          <button onClick={() => navigate("/Profile")}>
            Profile
          </button>
        </div>
      )}
      <div className="overlay"></div>
      <h1 className="heading">Admin Dashboard</h1>
      <div className="buttonContainer">
        <button
          className="button"
          onClick={() =>
            handleFetchData(getCategories, "Categories", "/categories")
          }
        >
          Categories
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(getSubCategories, "Subcategories", "/subcategories")
          }
        >
          Subcategories
        </button>
        <button
          className="button"
          onClick={() => handleFetchData(getAssets, "Assets", "/assets")}
        >
          Assets
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(getAssetRequests, "Asset Requests", "/asset-requests")
          }
        >
          Asset Requests
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(
              getAllAssetAllocations,
              "Asset Allocations",
              "/asset-allocations"
            )
          }
        >
          Asset Allocations
        </button>
        <button
          className="button"
          onClick={() => handleFetchData(getAudits, "Audit Logs", "/audit-logs")}
        >
          Audit Logs
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(
              getMaintenanceLogs,
              "Maintenance Logs",
              "/maintenance-logs"
            )
          }
        >
          Maintenance Logs
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(
              getReturnRequests,
              "Return Request",
              "/return-requests"
            )
          }
        >
          Return Request
        </button>
        <button
          className="button"
          onClick={() =>
            handleFetchData(
              getServiceRequests,
              "Service Request",
              "/service-requests"
            )
          }
        >
          Service Request
        </button>
      </div>

      <div className="dataSection">
        <h2>{section}</h2>
        {data && data.length > 0 ? (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        ) : (
          <p>No {section.toLowerCase()} data available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
