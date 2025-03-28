import React from 'react';
import logo from '../AdminDashboard/images/Logo.png'; // Correctly import the logo image
import './HeaderFooter.css';

const HeaderFooter = ({ userName, userRole, loggedTime }) => {
  return (
    <div className="header-footer-container">
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" /> {/* Use the imported logo image */}
          <h1 className="title">Hexa Asset Management System</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>User Name: {userName}  |  Role: {userRole}</span>
            <div>Logged In: {loggedTime}</div>
          </div>
        </div>
      </header>
      <footer className="footer">
        @ Hexaware2024
      </footer>
    </div>
  );
};

export default HeaderFooter;
