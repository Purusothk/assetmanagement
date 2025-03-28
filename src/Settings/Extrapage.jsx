import React, { useState, useEffect } from "react";
import Header from "./Header";

const ExtraPage = () => {
  const [settingsOptions, setSettingsOptions] = useState([
    { id: 1, name: "Change Password" },
    { id: 2, name: "Enable Two-Factor Authentication" },
    { id: 3, name: "Manage Notifications" },
    { id: 4, name: "Update Profile Picture" },
  ]);

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Fetch user details to determine the role
    const fetchUserRole = async () => {
      try {
        const response = await fetch("https://localhost:7287/api/users/me"); 
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div>
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-2">Customize your account preferences and configurations.</p>
        <ul className="list-disc pl-6 mt-4">
          {settingsOptions.map((option) => (
            <li key={option.id}>{option.name}</li>
          ))}
        </ul>
        {userRole === "Admin" && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Admin Settings</h3>
            <ul className="list-disc pl-6 mt-2">
              <li>Manage User Roles</li>
              <li>Audit Logs</li>
              <li>Application Configuration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraPage;
