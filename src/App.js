import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Utils/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import NotFoundPage from './Components/NotFoundPage/NotFoundPage';
import Signin from "./Components/SignInPage/Signin";
import EmpDashboard from "./EmpDashboard/EmpDashboard";
import AdminDashboard from "./AdminDashboard/AdminDashboard";

import Asset from "./Components/Assets/Assets";
import ServiceRequest from "./Components/ServiceRequest/ServiceRequest";
import ReturnRequest from "./Components/ReturnRequest/ReturnRequest";
import CustomPagination from "./Components/CustomPagination/CustomPagination";
import AssetAllocationComponent from "./Components/AssetAllocation/AssetAllocationComponent";
import AuditComponent from "./Components/Audit/AuditComponent";
import CategoriesComponent from "./Components/Categories/CategoriesComponent";
import SubCategoryComponent from "./Components/SubCategory/SubCategoryComponent";
import MaintenanceLogComponent from "./Components/MaintenanceLog/MaintenanceLogComponent";
import Profile from "./Profile/Profile";
import ExtraPage from "./Settings/Extrapage";
import AssetRequestComponent from "./Components/AssetRequest/AssetRequestComponent";
import ChangePassword from "./Settings/ChangePassword";
import HeaderFooter from "./Components/HeaderFooter";
import AssetRequestModal from "./Components/Assets/AssetRequestModal";
import MainComponent from "./Components/Assets/MainComponent";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/Dashboard" element={<AdminDashboard />} />
            <Route path="/EmpDashboard" element={<EmpDashboard />} />
            <Route path="/assets" element={<Asset />} />
            <Route path="/service-requests" element={<ServiceRequest />} />
            <Route path="/return-requests" element={<ReturnRequest />} />
            <Route path="/CustomPagination" element={<CustomPagination />} />
            <Route path="/audit-logs" element={<AuditComponent />} />
            <Route path="/asset-allocations" element={<AssetAllocationComponent />} />
            <Route path="/Categories" element={<CategoriesComponent />} />
            <Route path="/subcategories" element={<SubCategoryComponent />} />
            <Route path="/maintenance-logs" element={<MaintenanceLogComponent />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Settings" element={<ExtraPage />} />
            <Route path="/asset-requests" element={<AssetRequestComponent />} />
            <Route path="/change-password" element={<ChangePassword />}/>
            <Route path="/asset-request-modals" element={<AssetRequestModal />}/>
            <Route path="/main-component" element={<MainComponent />}/>
            <Route path="/Profile" element={<Profile />}/>
            
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
