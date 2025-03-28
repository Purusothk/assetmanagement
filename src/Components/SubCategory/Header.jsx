import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo or Title */}
        <div className="text-lg font-bold">
          <Link to="/" className="hover:text-gray-300">
            Asset Management System
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex space-x-4">
          <Link to="/categories" className="hover:text-gray-300">
            Categories
          </Link>
          <Link to="/subcategories" className="hover:text-gray-300">
            Subcategories
          </Link>
          <Link to="/assets" className="hover:text-gray-300">
            Assets
          </Link>
          <Link to="/requests" className="hover:text-gray-300">
            Requests
          </Link>
          <Link to="/allocations" className="hover:text-gray-300">
            Allocations
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
