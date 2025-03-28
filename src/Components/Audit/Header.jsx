import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faUserCircle,
  faSignOutAlt,
  faBell,
  faCalendarAlt,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const Header = () => {
  // Current date
  const currentDate = moment().format("Do MMMM YYYY");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isDarkMode, setDarkMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle notification dropdown
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  // Logout and session expiration timer
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const initialTimeLeft = Math.floor((expirationTime - currentTime) / 1000);
      if (initialTimeLeft > 0) {
        setTimeLeft(initialTimeLeft);
      } else {
        handleLogout();
      }
    } else {
      handleLogout();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/"); // Redirect to home page
  };

  const formatTimeLeft = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Logo and Branding */}
      <div className="flex items-center space-x-4">
        <img
          src="/Images/logo.png"
          alt="HexaHub Logo"
          className="h-16 w-16"
        />
        <h2 className="text-2xl font-bold text-indigo-950">Audit Management</h2>
      </div>

      {/* Date and Calendar */}
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-indigo-950" />
        <span className="text-indigo-950 font-medium">{currentDate}</span>
      </div>

      {/* Session Timer */}
      <div className="session-timer font-medium">
        <p>
          Session Expires In: <span className="text-red-500">{formatTimeLeft()}</span>
        </p>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon
          icon={faBell}
          className="text-xl text-red-400 hover:text-red-500 cursor-pointer"
          title="Notifications"
          onClick={toggleDropdown}
        />
        <FontAwesomeIcon
          icon={isDarkMode ? faSun : faMoon}
          className={`text-xl cursor-pointer ${isDarkMode ? "text-indigo-950" : "text-yellow-400"} hover:text-indigo-700`}
          title="Toggle Theme"
          onClick={toggleDarkMode}
        />
        <FontAwesomeIcon
          icon={faUserCircle}
          className="text-xl text-red-400 hover:text-red-500 cursor-pointer"
          title="Profile"
          onClick={toggleProfileDropdown}
        />
        <FontAwesomeIcon
          icon={faSignOutAlt}
          className="text-xl text-indigo-950 hover:text-indigo-700 cursor-pointer"
          title="Logout"
          onClick={handleLogout}
        />
      </div>

      {/* Dropdown Menus */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10"
        >
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
              <Link to="/notifications" className="block text-white">
                Notifications
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
              <Link to="/reminders" className="block text-white">
                Reminders
              </Link>
            </li>
          </ul>
        </div>
      )}

      {isProfileDropdownOpen && (
        <div
          ref={profileDropdownRef}
          className="absolute right-0 mt-5 w-48 bg-indigo-950 border rounded-lg shadow-lg z-10"
        >
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
              <Link to="/profile" className="block text-white">
                My Profile
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-red-500 cursor-pointer">
              <Link to="/settings" className="block text-white">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
