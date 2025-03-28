import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faUserCircle,
  faSignOutAlt,
  faBell,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const CategoryHeader = ({ toggleTheme, theme }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
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
    navigate("/"); // Redirect to login page
  };

  const formatTimeLeft = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const styles = {
    lightContainer: {
      backgroundColor: "#f9f9f9",
      color: "#000",
      padding: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    darkContainer: {
      backgroundColor: "#333",
      color: "#fff",
      padding: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    themeIcon: {
      cursor: "pointer",
      fontSize: "1.5rem",
    },
    userRoleBar: {
      display: "flex",
      alignItems: "center",
    },
  };

  return (
    <div style={theme === "light" ? styles.lightContainer : styles.darkContainer}>
      <div style={styles.themeIcon} onClick={toggleTheme}>
        {theme === "light" ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
      </div>
      <div style={styles.userRoleBar}>
        <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: "10px" }} />
        <span>Session Time Left: {formatTimeLeft()}</span>
        <button style={{ marginLeft: "20px" }} onClick={handleLogout}>
          Logout <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </div>
  );
};

export default CategoryHeader;
