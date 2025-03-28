import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Employee Dashboard</h1>
      </div>
      <nav className="space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/EmpDashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/Profile" className="hover:underline">
          Profile
        </Link>
        <Link to="/Settings" className="hover:underline">
          Settings
        </Link>
      </nav>
    </header>
  );
};

export default Header;
