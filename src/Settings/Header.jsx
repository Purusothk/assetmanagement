import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-green-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Settings</h1>
      <nav className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/EmpDashboard" className="hover:underline">Dashboard</Link>
        <Link to="/Profile" className="hover:underline">Profile</Link>
      </nav>
    </header>
  );
};

export default Header;
